const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { getIO } = require('../realtime/socket');

const { authenticate, authorize, requireSuperAdmin } = require('../middleware/authMiddleware');
const { validateUUIDParam, validatePagination, validateUserRegistration } = require('../middleware/validationMiddleware');
const { createAdminUser } = require('../controllers/authController');
const { logAdminAction } = require('../utils/adminAudit');

const { getRepatriationSubmissions } = require('../controllers/repatriationController');

// Import admin-specific controller functions
const {
  getPendingVendors,
  verifyVendor,
  rejectVendor,
  updateVendorLimits,
} = require('../controllers/vendorController');
const {
  listReports,
  decideReport,
} = require('../controllers/reportController');
const {
  adminListAppeals,
  adminGetAppeal,
  adminAssignAppeal,
  adminDecideAppeal,
} = require('../controllers/appealController');

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(authorize('Administrator'));

// Admin user management
router.post(
  '/users/admins',
  requireSuperAdmin,
  (req, res, next) => {
    console.log('🔍 Admin create payload received:', req.body);
    const body = req.body || {};

    if (!body.name && body.fullName) {
      body.name = body.fullName;
    }

    if (!body.phone && (body.phoneNumber || body.phone_number)) {
      body.phone = body.phoneNumber || body.phone_number;
    }

    // Clean up phone field if it contains an email (user input error)
    if (body.phone && body.phone.includes('@')) {
      body.phone = null; // Clear invalid phone data
    }

    if (!body.date_of_birth && (body.dateOfBirth || body.date_of_birth_string)) {
      body.date_of_birth = body.dateOfBirth || body.date_of_birth_string;
    }

    req.body = body;
    console.log('🔍 Admin create payload after normalization:', req.body);
    next();
  },
  validateUserRegistration,
  createAdminUser
);

// Vendor management
router.get('/vendors/pending', validatePagination, getPendingVendors);
router.post('/vendors/:vendorId/verify', validateUUIDParam('vendorId'), verifyVendor);
router.post('/vendors/:vendorId/reject', validateUUIDParam('vendorId'), rejectVendor);
router.post('/vendors/:vendorId/limits', validateUUIDParam('vendorId'), updateVendorLimits);

// Repatriation / body shipping submissions
router.get('/repatriation-submissions', validatePagination, getRepatriationSubmissions);

// System statistics endpoint (shared handler for /stats/overview and legacy /stats)
const getSystemStats = async (req, res) => {
  try {
    const { User, Memorial, Vendor, Order, WalletTransaction } = require('../models');
    const { sequelize } = require('../config/database');

    // Get overall system statistics
    const stats = await Promise.all([
      User.count(),
      Memorial.count({ where: { paid_status: true, is_active: true } }),
      Vendor.count({ where: { verification_status: 'VERIFIED' } }),
      Order.count(),
      WalletTransaction.findOne({
        attributes: [
          [sequelize.fn('SUM', sequelize.col('amount')), 'total_transactions'],
          [sequelize.fn('COUNT', sequelize.col('txn_id')), 'transaction_count']
        ],
        where: { status: 'COMPLETED' }
      })
    ]);

    const [
      totalUsers,
      totalMemorials,
      verifiedVendors,
      totalOrders,
      transactionStats
    ] = stats;

    try {
      const io = getIO();
      io.to('admin:disputes').emit('disputes:updated');
    } catch (error) {
      console.log('Socket emit error (DISPUTE_ASSIGN):', error.message);
    }

    res.json({
      success: true,
      data: {
        overview: {
          total_users: totalUsers,
          total_memorials: totalMemorials,
          verified_vendors: verifiedVendors,
          total_orders: totalOrders,
          total_transaction_volume: parseFloat(transactionStats?.dataValues?.total_transactions || 0),
          total_transactions: parseInt(transactionStats?.dataValues?.transaction_count || 0)
        },
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch system statistics',
      error: error.message
    });
  }
};

router.get('/stats/overview', getSystemStats);
router.get('/stats', getSystemStats);

// Product moderation (admin)
router.get('/products', validatePagination, async (req, res) => {
  try {
    const { Product, Vendor } = require('../models');
    const { Op } = require('sequelize');
    const {
      page = 1,
      limit = 20,
      queue = 'PENDING_REVIEW',
      vendor_id,
      category,
      status,
      search,
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    if (vendor_id) {
      where.vendor_id = vendor_id;
    }

    if (category) {
      where.category = category;
    }

    if (status === 'active') {
      where.is_active = true;
    } else if (status === 'inactive') {
      where.is_active = false;
    }

    // Queue filter for moderation views
    if (queue === 'PENDING_REVIEW') {
      // Products awaiting admin review
      where.is_active = false;
      where.metadata = { moderation_status: 'PENDING_REVIEW' };
    } else if (queue === 'LIVE') {
      // Products currently live in the marketplace
      where.is_active = true;
    } else if (queue === 'HIDDEN') {
      // Products hidden by admins for policy or quality reasons
      where.is_active = false;
      where.metadata = { moderation_status: 'HIDDEN' };
    }

    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { count, rows } = await Product.findAndCountAll({
      where,
      include: [
        {
          model: Vendor,
          as: 'vendor',
          attributes: ['vendor_id', 'business_name', 'service_type', 'city'],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    const products = rows.map((product) => {
      const json = product.toJSON();
      const metadata = json.metadata || {};

      let adminStatus = 'LIVE';
      if (!json.is_active) {
        if (metadata.moderation_status === 'PENDING_REVIEW') {
          adminStatus = 'PENDING_REVIEW';
        } else if (metadata.moderation_status === 'HIDDEN') {
          adminStatus = 'HIDDEN';
        } else {
          adminStatus = 'INACTIVE';
        }
      }

      json.admin_status = adminStatus;
      return json;
    });

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(count / limit),
          total_records: count,
          per_page: parseInt(limit),
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products for moderation',
      error: error.message,
    });
  }
});

// Approve/publish product
router.post('/products/:productId/approve', validateUUIDParam('productId'), async (req, res) => {
  try {
    const { Product } = require('../models');
    const { productId } = req.params;

    const product = await Product.findByPk(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    const metadata = product.metadata || {};
    metadata.moderation_status = 'APPROVED';
    metadata.last_admin_review_at = new Date().toISOString();
    metadata.last_admin_review_by = req.user.user_id;

    product.metadata = metadata;
    product.is_active = true;

    await product.save();

    await logAdminAction(req, {
      action: 'PRODUCT_APPROVE',
      targetType: 'PRODUCT',
      targetId: product.product_id,
      targetLabel: product.name,
      metadata: {
        moderation_status: metadata.moderation_status,
      },
    });

    res.json({
      success: true,
      message: 'Product approved and published successfully',
      data: { product },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to approve product',
      error: error.message,
    });
  }
});

// Hide product (policy violation)
router.post('/products/:productId/hide', validateUUIDParam('productId'), async (req, res) => {
  try {
    const { Product } = require('../models');
    const { productId } = req.params;
    const { reason } = req.body;

    const product = await Product.findByPk(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    const metadata = product.metadata || {};
    metadata.moderation_status = 'HIDDEN';
    metadata.hidden_reason = reason || null;
    metadata.hidden_by = req.user.user_id;
    metadata.hidden_at = new Date().toISOString();

    product.metadata = metadata;
    product.is_active = false;

    await product.save();

    await logAdminAction(req, {
      action: 'PRODUCT_HIDE',
      targetType: 'PRODUCT',
      targetId: product.product_id,
      targetLabel: product.name,
      reason: reason || null,
      metadata: {
        moderation_status: metadata.moderation_status,
      },
    });

    res.json({
      success: true,
      message: 'Product hidden successfully',
      data: { product },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to hide product',
      error: error.message,
    });
  }
});

// Mark product as featured / not featured
router.post('/products/:productId/feature', validateUUIDParam('productId'), async (req, res) => {
  try {
    const { Product } = require('../models');
    const { productId } = req.params;
    const { is_featured } = req.body;

    const product = await Product.findByPk(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    product.is_featured = !!is_featured;
    await product.save();

    await logAdminAction(req, {
      action: 'PRODUCT_FEATURE_UPDATE',
      targetType: 'PRODUCT',
      targetId: product.product_id,
      targetLabel: product.name,
      metadata: {
        is_featured: product.is_featured,
      },
    });

    res.json({
      success: true,
      message: 'Product feature status updated successfully',
      data: { product },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update product feature status',
      error: error.message,
    });
  }
});

// Mark/unmark product as recommended
router.post('/products/:productId/recommend', validateUUIDParam('productId'), async (req, res) => {
  try {
    const { Product } = require('../models');
    const { productId } = req.params;
    const { recommended } = req.body;

    const product = await Product.findByPk(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    const metadata = product.metadata || {};
    metadata.recommended = !!recommended;
    product.metadata = metadata;

    await product.save();

    await logAdminAction(req, {
      action: 'PRODUCT_RECOMMEND_UPDATE',
      targetType: 'PRODUCT',
      targetId: product.product_id,
      targetLabel: product.name,
      metadata: {
        recommended: metadata.recommended,
      },
    });

    res.json({
      success: true,
      message: 'Product recommendation status updated successfully',
      data: { product },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update product recommendation status',
      error: error.message,
    });
  }
});

// Order monitoring for administrators
router.get('/orders', validatePagination, async (req, res) => {
  try {
    const { Order, User, Vendor } = require('../models');
    const { page = 1, limit = 20, status, vendor_id } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (status) where.status = status;
    if (vendor_id) where.vendor_id = vendor_id;

    const { count, rows: orders } = await Order.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'buyer',
          attributes: ['user_id', 'name', 'email', 'phone']
        },
        {
          model: Vendor,
          as: 'vendor',
          attributes: ['vendor_id', 'business_name', 'service_type', 'city']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(count / limit),
          total_records: count,
          per_page: parseInt(limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
});

// Dispute management for administrators
router.get('/disputes', validatePagination, async (req, res) => {
  try {
    const { Dispute, Order, User, Vendor } = require('../models');
    const { page = 1, limit = 20, status, against_party, category, assigned_to, order_id, raised_by } = req.query;
    const { Op } = require('sequelize');

    const offset = (page - 1) * limit;

    const where = {};
    if (status) where.status = status;
    if (against_party) where.against_party = against_party;
    if (category) where.category = category;
    if (assigned_to) where.assigned_to = assigned_to;
    if (order_id) where.order_id = order_id;
    if (raised_by) where.raised_by = raised_by;

    const { count, rows } = await Dispute.findAndCountAll({
      where,
      include: [
        {
          model: Order,
          as: 'order',
          attributes: ['order_id', 'order_number', 'status', 'total_amount', 'currency', 'vendor_amount'],
          include: [
            {
              model: Vendor,
              as: 'vendor',
              attributes: ['vendor_id', 'business_name'],
            },
            {
              model: User,
              as: 'buyer',
              attributes: ['user_id', 'name', 'email', 'phone'],
            },
          ],
        },
        {
          model: User,
          as: 'raised_by_user',
          attributes: ['user_id', 'name', 'email'],
        },
        {
          model: User,
          as: 'assignee',
          attributes: ['user_id', 'name', 'email'],
        },
        {
          model: User,
          as: 'closed_by_user',
          attributes: ['user_id', 'name', 'email'],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({
      success: true,
      data: {
        disputes: rows,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(count / limit),
          total_records: count,
          per_page: parseInt(limit),
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch disputes',
      error: error.message,
    });
  }
});

router.get('/disputes/:disputeId', validateUUIDParam('disputeId'), async (req, res) => {
  try {
    const { Dispute, Order, User, OrderItem, Product, Vendor } = require('../models');
    const { disputeId } = req.params;

    const dispute = await Dispute.findByPk(disputeId, {
      include: [
        {
          model: Order,
          as: 'order',
          include: [
            {
              model: User,
              as: 'buyer',
              attributes: ['user_id', 'name', 'email', 'phone'],
            },
            {
              model: Vendor,
              as: 'vendor',
              attributes: ['vendor_id', 'business_name', 'phone'],
            },
            {
              model: OrderItem,
              as: 'items',
              include: [
                {
                  model: Product,
                  as: 'product',
                  attributes: ['product_id', 'name', 'main_image'],
                },
              ],
            },
          ],
        },
        {
          model: User,
          as: 'raised_by_user',
          attributes: ['user_id', 'name', 'email'],
        },
        {
          model: User,
          as: 'assignee',
          attributes: ['user_id', 'name', 'email'],
        },
        {
          model: User,
          as: 'closed_by_user',
          attributes: ['user_id', 'name', 'email'],
        },
      ],
    });

    if (!dispute) {
      return res.status(404).json({
        success: false,
        message: 'Dispute not found',
      });
    }

    res.json({
      success: true,
      data: {
        dispute,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dispute detail',
      error: error.message,
    });
  }
});

// Assign or reassign a dispute to an admin
router.post('/disputes/:disputeId/assign', validateUUIDParam('disputeId'), async (req, res) => {
  try {
    const { Dispute, User } = require('../models');
    const { disputeId } = req.params;
    const { assigned_to } = req.body || {};

    const dispute = await Dispute.findByPk(disputeId);

    if (!dispute) {
      return res.status(404).json({
        success: false,
        message: 'Dispute not found',
      });
    }

    let assignee = null;
    if (assigned_to) {
      assignee = await User.findByPk(assigned_to);
      if (!assignee || assignee.role !== 'Administrator') {
        return res.status(400).json({
          success: false,
          message: 'Assigned user must be a valid administrator',
        });
      }
    }

    dispute.assigned_to = assigned_to || null;
    await dispute.save();

    await logAdminAction(req, {
      action: 'DISPUTE_ASSIGN',
      targetType: 'DISPUTE',
      targetId: dispute.dispute_id,
      targetLabel: dispute.order_id,
      metadata: {
        assigned_to: dispute.assigned_to,
      },
    });

    res.json({
      success: true,
      message: 'Dispute assignment updated successfully',
      data: {
        dispute,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update dispute assignment',
      error: error.message,
    });
  }
});

// Resolve dispute (optionally issuing a refund)
router.post('/disputes/:disputeId/resolve', validateUUIDParam('disputeId'), async (req, res) => {
  try {
    const { Dispute, Order, Wallet, WalletTransaction } = require('../models');
    const { sequelize } = require('../config/database');
    const { disputeId } = req.params;

    const {
      resolution, // 'NO_REFUND' | 'PARTIAL_REFUND' | 'FULL_REFUND' | 'NON_MONETARY' | 'OTHER'
      approved_refund_amount,
      status, // optional final status: 'RESOLVED' | 'REJECTED'
      admin_notes,
    } = req.body || {};

    const dispute = await Dispute.findByPk(disputeId);

    if (!dispute) {
      return res.status(404).json({
        success: false,
        message: 'Dispute not found',
      });
    }

    if (!['OPEN', 'IN_REVIEW'].includes(dispute.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot resolve dispute with status ${dispute.status}`,
      });
    }

    const allowedResolutions = ['NO_REFUND', 'PARTIAL_REFUND', 'FULL_REFUND', 'NON_MONETARY', 'OTHER'];
    if (!resolution || !allowedResolutions.includes(resolution)) {
      return res.status(400).json({
        success: false,
        message: `Invalid resolution. Must be one of: ${allowedResolutions.join(', ')}`,
      });
    }

    let finalStatus = status || 'RESOLVED';
    if (!['RESOLVED', 'REJECTED'].includes(finalStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid final dispute status. Must be RESOLVED or REJECTED',
      });
    }

    const previous = dispute.toJSON();

    let refundTxn = null;
    let refundAmount = 0;

    const needsRefund =
      (resolution === 'PARTIAL_REFUND' || resolution === 'FULL_REFUND') &&
      typeof approved_refund_amount === 'number' &&
      approved_refund_amount > 0;

    if (needsRefund) {
      const order = await Order.findByPk(dispute.order_id);

      if (!order) {
        return res.status(400).json({
          success: false,
          message: 'Related order not found for this dispute',
        });
      }

      const buyerWallet = await Wallet.findOne({ where: { user_id: order.buyer_id } });

      if (!buyerWallet) {
        return res.status(400).json({
          success: false,
          message: 'Buyer wallet not found for refund',
        });
      }

      const maxRefundable = parseFloat(order.total_amount) - parseFloat(order.refund_amount || 0);
      refundAmount = parseFloat(approved_refund_amount);

      if (refundAmount <= 0 || refundAmount > maxRefundable) {
        return res.status(400).json({
          success: false,
          message: `Invalid refund amount. Maximum refundable is ${maxRefundable.toFixed(2)} ETB`,
        });
      }

      const tx = await sequelize.transaction();

      try {
        const balanceBefore = parseFloat(buyerWallet.balance);
        const balanceAfter = balanceBefore + refundAmount;

        refundTxn = await WalletTransaction.create(
          {
            wallet_id: buyerWallet.wallet_id,
            user_id: order.buyer_id,
            amount: refundAmount,
            type: 'REFUND',
            status: 'COMPLETED',
            description: `Refund for dispute ${dispute.dispute_id} on order ${order.order_number}`,
            reference_id: order.order_id,
            reference_type: 'ORDER',
            balance_before: balanceBefore,
            balance_after: balanceAfter,
            fee_amount: 0,
            net_amount: refundAmount,
            processed_at: new Date(),
            processed_by: req.user.user_id,
          },
          { transaction: tx },
        );

        await buyerWallet.credit(refundAmount, `Refund: dispute ${dispute.dispute_id} / order ${order.order_number}`);

        const prevRefundAmount = parseFloat(order.refund_amount || 0);
        const newRefundAmount = prevRefundAmount + refundAmount;
        order.refund_amount = newRefundAmount;

        const history = order.status_history || [];
        history.push({
          status: order.status,
          timestamp: new Date(),
          note: `Refunded ${refundAmount.toFixed(2)} ETB due to dispute ${dispute.dispute_id}`,
          updated_by: req.user.user_id,
          previous_status: order.status,
        });
        order.status_history = history;

        if (newRefundAmount >= parseFloat(order.total_amount)) {
          order.status = 'REFUNDED';
          order.refunded_at = new Date();
        }

        await order.save({ transaction: tx });

        await tx.commit();
      } catch (error) {
        await tx.rollback();
        throw error;
      }
    }

    // Update dispute record
    dispute.status = finalStatus;
    dispute.resolution = resolution;
    dispute.closed_by = req.user.user_id;
    dispute.closed_at = new Date();
    if (needsRefund) {
      dispute.approved_refund_amount = refundAmount;
    }
    if (typeof admin_notes === 'string' && admin_notes.trim().length > 0) {
      dispute.admin_notes = admin_notes;
    }

    const meta = dispute.metadata || {};
    if (refundTxn) {
      meta.refund_txn_id = refundTxn.txn_id;
      meta.refund_wallet_id = refundTxn.wallet_id;
      meta.refund_amount = refundAmount;
    }
    dispute.metadata = meta;

    await dispute.save();

    await logAdminAction(req, {
      action: 'DISPUTE_RESOLVE',
      targetType: 'DISPUTE',
      targetId: dispute.dispute_id,
      targetLabel: dispute.order_id,
      metadata: {
        previous,
        updated: dispute.toJSON(),
      },
    });

    res.json({
      success: true,
      message: 'Dispute resolved successfully',
      data: {
        dispute,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to resolve dispute',
      error: error.message,
    });
  }
});

// Memorial administration listing (admin)
router.get('/memorials', validatePagination, async (req, res) => {
  try {
    const { Memorial, User } = require('../models');
    const { Op } = require('sequelize');

    const {
      page = 1,
      limit = 20,
      status,
      search,
      owner_id,
      created_from,
      created_to,
      visibility,
      sort = 'newest',
    } = req.query;

    const offset = (page - 1) * limit;

    const where = {};

    // Map status filter to underlying fields
    if (status === 'active') {
      where.is_active = true;
    } else if (status === 'inactive') {
      where.is_active = false;
    } else if (status === 'draft') {
      where.paid_status = false;
    } else if (status === 'pending_review') {
      where.review_status = 'NEEDS_REVIEW';
    } else if (status === 'published') {
      where.paid_status = true;
      where.is_active = true;
      where.is_hidden_by_admin = false;
      where.review_status = { [Op.ne]: 'HIDDEN' };
    } else if (status === 'suspended' || status === 'hidden') {
      // "hidden" is an alias for suspended/hidden-by-admin
      where.is_hidden_by_admin = true;
    } else if (status === 'archived') {
      where.is_active = false;
    } else if (status === 'sensitive') {
      where.sensitivity_level = 'SENSITIVE';
    }

    if (owner_id) {
      where.user_id = owner_id;
    }

    if (visibility) {
      // Filter by primary visibility/privacy setting
      where.visibility = visibility;
    }

    if (search) {
      where[Op.or] = [
        { deceased_name: { [Op.iLike]: `%${search}%` } },
        { deceased_name_amharic: { [Op.iLike]: `%${search}%` } },
      ];
    }

    if (created_from || created_to) {
      where.created_at = {};
      if (created_from) {
        where.created_at[Op.gte] = new Date(created_from);
      }
      if (created_to) {
        const toDate = new Date(created_to);
        // Include the entire "to" day by moving to end of day
        toDate.setHours(23, 59, 59, 999);
        where.created_at[Op.lte] = toDate;
      }
    }

    // Determine sort order
    let order = [];
    switch (sort) {
      case 'oldest':
        order = [['created_at', 'ASC']];
        break;
      case 'high_traffic':
        order = [
          ['view_count', 'DESC'],
          ['gift_count', 'DESC'],
          ['total_gifts_value', 'DESC'],
          ['last_activity_at', 'DESC'],
        ];
        break;
      case 'newest':
      default:
        order = [['created_at', 'DESC']];
        break;
    }

    const { count, rows } = await Memorial.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['user_id', 'name', 'email'],
        },
      ],
      order,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    const memorials = rows.map((memorial) => {
      const json = memorial.toJSON();

      // Derive an admin_status for UI purposes
      let adminStatus = undefined;
      if (!json.paid_status) {
        adminStatus = 'DRAFT';
      } else if (!json.is_active && json.archived_at) {
        adminStatus = 'ARCHIVED';
      } else if (json.is_hidden_by_admin || json.review_status === 'HIDDEN') {
        adminStatus = 'SUSPENDED';
      } else if (json.review_status === 'NEEDS_REVIEW') {
        adminStatus = 'PENDING_REVIEW';
      } else if (json.is_active && json.paid_status && !json.is_hidden_by_admin) {
        adminStatus = 'PUBLISHED';
      }

      json.admin_status = adminStatus;
      return json;
    });

    res.json({
      success: true,
      data: {
        memorials,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(count / limit),
          total_records: count,
          per_page: parseInt(limit),
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch memorials for administration',
      error: error.message,
    });
  }
});

// Per-memorial detail view for admins
router.get('/memorials/:memorialId', validateUUIDParam('memorialId'), async (req, res) => {
  try {
    const { Memorial, User, MemorialComment, GiftTransaction, GiftCatalog } = require('../models');
    const { memorialId } = req.params;

    const memorial = await Memorial.findByPk(memorialId, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['user_id', 'name', 'email'],
        },
      ],
    });

    if (!memorial) {
      return res.status(404).json({
        success: false,
        message: 'Memorial not found',
      });
    }

    const comments = await MemorialComment.findAll({
      where: { memorial_id: memorialId },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['user_id', 'name', 'email'],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: 100,
    });

    const gifts = await GiftTransaction.findAll({
      where: {
        memorial_id: memorialId,
        status: 'COMPLETED',
      },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['user_id', 'name'],
        },
        {
          model: GiftCatalog,
          as: 'gift',
          attributes: ['gift_id', 'name', 'animation_type', 'icon_url'],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: 100,
    });

    res.json({
      success: true,
      data: {
        memorial: memorial.toJSON(),
        comments: comments.map((c) => c.toJSON()),
        gifts: gifts.map((g) => g.toJSON()),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch memorial detail for administration',
      error: error.message,
    });
  }
});

// Per-memorial moderation actions for admins
router.post('/memorials/:memorialId/moderate', validateUUIDParam('memorialId'), async (req, res) => {
  try {
    const { Memorial } = require('../models');
    const { memorialId } = req.params;

    const {
      comments_locked,
      admin_visibility,
      is_hidden_by_admin,
      is_featured,
      sensitivity_level,
      admin_notes,
    } = req.body || {};

    const memorial = await Memorial.findByPk(memorialId);

    if (!memorial) {
      return res.status(404).json({
        success: false,
        message: 'Memorial not found',
      });
    }

    const previous = {
      comments_locked: memorial.comments_locked,
      admin_visibility: memorial.admin_visibility,
      is_hidden_by_admin: memorial.is_hidden_by_admin,
      is_featured: memorial.is_featured,
      sensitivity_level: memorial.sensitivity_level,
      admin_notes: memorial.admin_notes,
      review_status: memorial.review_status,
    };

    if (typeof comments_locked === 'boolean') {
      memorial.comments_locked = comments_locked;
    }

    const allowedAdminVisibility = ['NONE', 'FORCE_PUBLIC', 'FORCE_PRIVATE', 'FORCE_FAMILY_ONLY'];
    if (admin_visibility && allowedAdminVisibility.includes(admin_visibility)) {
      memorial.admin_visibility = admin_visibility;
    }

    const allowedSensitivity = ['NORMAL', 'SENSITIVE'];
    if (sensitivity_level && allowedSensitivity.includes(sensitivity_level)) {
      memorial.sensitivity_level = sensitivity_level;
      if (sensitivity_level === 'SENSITIVE' && memorial.review_status !== 'HIDDEN') {
        memorial.review_status = 'SENSITIVE';
      } else if (sensitivity_level === 'NORMAL' && memorial.review_status === 'SENSITIVE') {
        memorial.review_status = 'NORMAL';
      }
    }

    if (typeof is_hidden_by_admin === 'boolean') {
      memorial.is_hidden_by_admin = is_hidden_by_admin;
      if (is_hidden_by_admin) {
        memorial.review_status = 'HIDDEN';
      } else if (memorial.review_status === 'HIDDEN') {
        memorial.review_status = memorial.sensitivity_level === 'SENSITIVE' ? 'SENSITIVE' : 'NORMAL';
      }
    }

    if (typeof is_featured === 'boolean') {
      memorial.is_featured = is_featured;
    }

    if (typeof admin_notes === 'string') {
      memorial.admin_notes = admin_notes;
    }

    await memorial.save();

    await logAdminAction(req, {
      action: 'MEMORIAL_MODERATE',
      targetType: 'MEMORIAL',
      targetId: memorial.memorial_id,
      targetLabel: memorial.deceased_name,
      metadata: {
        previous,
        updated: {
          comments_locked: memorial.comments_locked,
          admin_visibility: memorial.admin_visibility,
          is_hidden_by_admin: memorial.is_hidden_by_admin,
          is_featured: memorial.is_featured,
          sensitivity_level: memorial.sensitivity_level,
          admin_notes: memorial.admin_notes,
          review_status: memorial.review_status,
        },
      },
    });

    res.json({
      success: true,
      message: 'Memorial moderation updated successfully',
      data: {
        memorial,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update memorial moderation',
      error: error.message,
    });
  }
});

// Global comments queue (admin)
router.get('/comments', validatePagination, async (req, res) => {
  try {
    const { MemorialComment, Memorial, User, Report } = require('../models');
    const { sequelize } = require('../config/database');
    const { Op } = require('sequelize');

    const {
      page = 1,
      limit = 20,
      queue = 'RECENT',
      memorial_id,
      user_id,
      status,
    } = req.query;

    const offset = (page - 1) * limit;

    const where = {
      is_deleted: false,
    };

    if (memorial_id) {
      where.memorial_id = memorial_id;
    }

    if (user_id) {
      where.user_id = user_id;
    }

    if (status) {
      where.visibility = status;
    }

    if (queue === 'PENDING') {
      where.visibility = 'PENDING';
    } else if (queue === 'REJECTED') {
      where.visibility = 'REJECTED';
    } else if (queue === 'REPORTED') {
      // Only comments that have at least one open/in-review report
      where[Op.and] = [
        sequelize.literal(
          `EXISTS (SELECT 1 FROM reports r WHERE r.comment_id = "MemorialComment"."comment_id" AND r.status IN ('OPEN', 'IN_REVIEW'))`,
        ),
      ];
    }

    const { count, rows } = await MemorialComment.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['user_id', 'name', 'email'],
        },
        {
          model: Memorial,
          as: 'memorial',
          attributes: ['memorial_id', 'deceased_name'],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    const comments = rows.map((c) => c.toJSON());
    const commentIds = comments.map((c) => c.comment_id);

    let reportMetaMap = new Map();
    if (commentIds.length > 0) {
      const reportRows = await Report.findAll({
        attributes: [
          'comment_id',
          [sequelize.fn('COUNT', sequelize.col('report_id')), 'report_count'],
          [sequelize.fn('MAX', sequelize.col('created_at')), 'last_report_at'],
        ],
        where: {
          comment_id: { [Op.in]: commentIds },
          status: { [Op.in]: ['OPEN', 'IN_REVIEW'] },
        },
        group: ['comment_id'],
      });

      reportRows.forEach((row) => {
        const json = row.toJSON();
        const countVal = json.report_count || json.dataValues?.report_count;
        reportMetaMap.set(json.comment_id, {
          report_count: parseInt(countVal || 0),
          last_report_at: json.last_report_at || null,
        });
      });
    }

    const enrichedComments = comments.map((c) => {
      const meta = reportMetaMap.get(c.comment_id) || { report_count: 0, last_report_at: null };
      return {
        ...c,
        report_count: meta.report_count,
        last_report_at: meta.last_report_at,
      };
    });

    res.json({
      success: true,
      data: {
        comments: enrichedComments,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(count / limit),
          total_records: count,
          per_page: parseInt(limit),
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch comments for moderation',
      error: error.message,
    });
  }
});

// Bulk comment moderation actions (admin)
router.post('/comments/bulk', async (req, res) => {
  try {
    const { MemorialComment, User, UserStatusHistory } = require('../models');
    const { Op } = require('sequelize');

    const { comment_ids, action, reason, days } = req.body || {};

    if (!Array.isArray(comment_ids) || comment_ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'comment_ids must be a non-empty array',
      });
    }

    const allowedActions = ['APPROVE', 'REJECT', 'DELETE', 'BAN_USER_AND_DELETE_RECENT'];
    if (!allowedActions.includes(action)) {
      return res.status(400).json({
        success: false,
        message: `Invalid action. Must be one of: ${allowedActions.join(', ')}`,
      });
    }

    const comments = await MemorialComment.findAll({
      where: {
        comment_id: { [Op.in]: comment_ids },
      },
    });

    if (!comments.length) {
      return res.status(404).json({
        success: false,
        message: 'No comments found for the provided IDs',
      });
    }

    const now = new Date();

    if (action === 'APPROVE' || action === 'REJECT' || action === 'DELETE') {
      for (const comment of comments) {
        if (action === 'APPROVE') {
          comment.visibility = 'PUBLIC';
        } else if (action === 'REJECT') {
          comment.visibility = 'REJECTED';
        } else if (action === 'DELETE') {
          comment.is_deleted = true;
          comment.deleted_at = now;
          comment.deleted_by = req.user.user_id;
        }

        await comment.save();
      }
    } else if (action === 'BAN_USER_AND_DELETE_RECENT') {
      const banReason = reason || 'Banned via bulk comment moderation';
      const banWindowDays = typeof days === 'number' && days > 0 ? days : 30;
      const cutoff = new Date(now.getTime() - banWindowDays * 24 * 60 * 60 * 1000);

      const userIds = Array.from(
        new Set(
          comments
            .map((c) => c.user_id)
            .filter((id) => !!id),
        ),
      );

      for (const userId of userIds) {
        const user = await User.findByPk(userId);
        if (!user || user.is_banned) {
          continue;
        }

        const previous_is_active = user.is_active;
        const previous_is_banned = user.is_banned;

        user.is_banned = true;
        user.is_active = false;
        user.ban_reason = banReason;
        user.banned_at = now;
        user.banned_by = req.user.user_id;
        await user.save();

        await UserStatusHistory.create({
          user_id: user.user_id,
          changed_by: req.user.user_id,
          action: 'BAN',
          reason: user.ban_reason,
          note: 'Banned via bulk comment moderation',
          previous_is_active,
          previous_is_banned,
          new_is_active: user.is_active,
          new_is_banned: user.is_banned,
        });
      }

      // Soft-delete recent comments from these users across the platform
      if (userIds.length) {
        await MemorialComment.update(
          {
            is_deleted: true,
            deleted_at: now,
            deleted_by: req.user.user_id,
          },
          {
            where: {
              user_id: { [Op.in]: userIds },
              is_deleted: false,
              created_at: { [Op.gte]: cutoff },
            },
          },
        );
      }
    }

    await logAdminAction(req, {
      action: 'COMMENTS_BULK_MODERATE',
      targetType: 'COMMENT',
      targetId: null,
      targetLabel: null,
      metadata: {
        action,
        comment_ids_count: comment_ids.length,
      },
    });

    res.json({
      success: true,
      message: 'Bulk comment moderation applied successfully',
      data: {
        action,
        processed: comments.length,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to apply bulk comment moderation',
      error: error.message,
    });
  }
});

// Content moderation: reports queue
router.get('/reports', validatePagination, listReports);
router.post('/reports/:reportId/decision', validateUUIDParam('reportId'), decideReport);

// Appeals moderation queue
router.get('/appeals', validatePagination, adminListAppeals);
router.get('/appeals/:appealId', validateUUIDParam('appealId'), adminGetAppeal);
router.post('/appeals/:appealId/assign', validateUUIDParam('appealId'), adminAssignAppeal);
router.post('/appeals/:appealId/decision', validateUUIDParam('appealId'), adminDecideAppeal);

// User account status management
router.post('/users/:userId/deactivate', validateUUIDParam('userId'), async (req, res) => {
  try {
    const { User, UserStatusHistory } = require('../models');
    const { userId } = req.params;
    const { reason, note } = req.body;

    const targetUser = await User.findByPk(userId);

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!targetUser.is_active && !targetUser.is_banned) {
      return res.status(400).json({
        success: false,
        message: 'User account is already deactivated'
      });
    }

    const previous_is_active = targetUser.is_active;
    const previous_is_banned = targetUser.is_banned;

    targetUser.is_active = false;
    await targetUser.save();

    await UserStatusHistory.create({
      user_id: targetUser.user_id,
      changed_by: req.user.user_id,
      action: 'DEACTIVATE',
      reason: reason || null,
      note: note || null,
      previous_is_active,
      previous_is_banned,
      new_is_active: targetUser.is_active,
      new_is_banned: targetUser.is_banned
    });

    await logAdminAction(req, {
      action: 'USER_DEACTIVATE',
      targetType: 'USER',
      targetId: targetUser.user_id,
      targetLabel: targetUser.email || targetUser.phone || targetUser.name,
      reason: reason || null,
      metadata: {
        note: note || null,
        previous_is_active,
        previous_is_banned,
        new_is_active: targetUser.is_active,
        new_is_banned: targetUser.is_banned
      }
    });

    res.json({
      success: true,
      message: 'User account deactivated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to deactivate user account',
      error: error.message
    });
  }
});

router.post('/users/:userId/reactivate', validateUUIDParam('userId'), async (req, res) => {
  try {
    const { User, UserStatusHistory } = require('../models');
    const { userId } = req.params;
    const { reason, note } = req.body;

    const targetUser = await User.findByPk(userId);

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (targetUser.is_active && !targetUser.is_banned) {
      return res.status(400).json({
        success: false,
        message: 'User account is already active'
      });
    }

    const previous_is_active = targetUser.is_active;
    const previous_is_banned = targetUser.is_banned;

    targetUser.is_active = true;
    await targetUser.save();

    await UserStatusHistory.create({
      user_id: targetUser.user_id,
      changed_by: req.user.user_id,
      action: 'REACTIVATE',
      reason: reason || null,
      note: note || null,
      previous_is_active,
      previous_is_banned,
      new_is_active: targetUser.is_active,
      new_is_banned: targetUser.is_banned
    });

    await logAdminAction(req, {
      action: 'USER_REACTIVATE',
      targetType: 'USER',
      targetId: targetUser.user_id,
      targetLabel: targetUser.email || targetUser.phone || targetUser.name,
      reason: reason || null,
      metadata: {
        note: note || null,
        previous_is_active,
        previous_is_banned,
        new_is_active: targetUser.is_active,
        new_is_banned: targetUser.is_banned
      }
    });

    res.json({
      success: true,
      message: 'User account reactivated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to reactivate user account',
      error: error.message
    });
  }
});

router.post('/users/:userId/ban', validateUUIDParam('userId'), async (req, res) => {
  try {
    const { User, UserStatusHistory } = require('../models');
    const { userId } = req.params;
    const { reason, note } = req.body;

    const targetUser = await User.findByPk(userId);

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (targetUser.is_banned) {
      return res.status(400).json({
        success: false,
        message: 'User is already banned'
      });
    }

    const previous_is_active = targetUser.is_active;
    const previous_is_banned = targetUser.is_banned;

    targetUser.is_banned = true;
    targetUser.is_active = false;
    targetUser.ban_reason = reason || null;
    targetUser.banned_at = new Date();
    targetUser.banned_by = req.user.user_id;
    await targetUser.save();

    await UserStatusHistory.create({
      user_id: targetUser.user_id,
      changed_by: req.user.user_id,
      action: 'BAN',
      reason: reason || null,
      note: note || null,
      previous_is_active,
      previous_is_banned,
      new_is_active: targetUser.is_active,
      new_is_banned: targetUser.is_banned
    });

    await logAdminAction(req, {
      action: 'USER_BAN',
      targetType: 'USER',
      targetId: targetUser.user_id,
      targetLabel: targetUser.email || targetUser.phone || targetUser.name,
      reason: reason || null,
      metadata: {
        note: note || null,
        previous_is_active,
        previous_is_banned,
        new_is_active: targetUser.is_active,
        new_is_banned: targetUser.is_banned,
        banned_at: targetUser.banned_at
      }
    });

    res.json({
      success: true,
      message: 'User banned successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to ban user',
      error: error.message
    });
  }
});

router.post('/users/:userId/unban', validateUUIDParam('userId'), async (req, res) => {
  try {
    const { User, UserStatusHistory } = require('../models');
    const { userId } = req.params;
    const { reason, note } = req.body;

    const targetUser = await User.findByPk(userId);

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!targetUser.is_banned) {
      return res.status(400).json({
        success: false,
        message: 'User is not banned'
      });
    }

    const previous_is_active = targetUser.is_active;
    const previous_is_banned = targetUser.is_banned;

    targetUser.is_banned = false;
    targetUser.is_active = true;
    targetUser.ban_reason = null;
    targetUser.banned_at = null;
    targetUser.banned_by = null;
    await targetUser.save();

    await UserStatusHistory.create({
      user_id: targetUser.user_id,
      changed_by: req.user.user_id,
      action: 'UNBAN',
      reason: reason || null,
      note: note || null,
      previous_is_active,
      previous_is_banned,
      new_is_active: targetUser.is_active,
      new_is_banned: targetUser.is_banned
    });

    await logAdminAction(req, {
      action: 'USER_UNBAN',
      targetType: 'USER',
      targetId: targetUser.user_id,
      targetLabel: targetUser.email || targetUser.phone || targetUser.name,
      reason: reason || null,
      metadata: {
        note: note || null,
        previous_is_active,
        previous_is_banned,
        new_is_active: targetUser.is_active,
        new_is_banned: targetUser.is_banned
      }
    });

    res.json({
      success: true,
      message: 'User unbanned and reactivated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to unban user',
      error: error.message
    });
  }
});

router.get('/users', validatePagination, async (req, res) => {
  try {
    const { User, Wallet, GiftTransaction } = require('../models');
    const { sequelize } = require('../config/database');
    const { Op } = require('sequelize');
    const { page = 1, limit = 20, role, status, search } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (role) where.role = role;
    if (status === 'active') where.is_active = true;
    if (status === 'inactive') where.is_active = false;

    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { phone: { [Op.iLike]: `%${search}%` } },
        { username: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { count, rows: users } = await User.findAndCountAll({
      where,
      include: [
        {
          model: Wallet,
          as: 'wallet',
          attributes: ['wallet_id', 'balance', 'is_frozen'],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    let usersWithStats = users;

    if (users.length > 0) {
      const userIds = users.map((u) => u.user_id);

      const [sentRows, receivedRows] = await Promise.all([
        GiftTransaction.findAll({
          where: {
            sender_id: userIds,
            status: 'COMPLETED',
          },
          attributes: [
            'sender_id',
            [sequelize.fn('SUM', sequelize.col('amount')), 'total_sent'],
          ],
          group: ['sender_id'],
        }),
        GiftTransaction.findAll({
          where: {
            recipient_id: userIds,
            status: 'COMPLETED',
          },
          attributes: [
            'recipient_id',
            [sequelize.fn('SUM', sequelize.col('amount')), 'total_received'],
          ],
          group: ['recipient_id'],
        }),
      ]);

      const sentMap = new Map();
      sentRows.forEach((row) => {
        const id = row.sender_id;
        const total = parseFloat(row.get('total_sent') || 0);
        sentMap.set(id, total);
      });

      const receivedMap = new Map();
      receivedRows.forEach((row) => {
        const id = row.recipient_id;
        const total = parseFloat(row.get('total_received') || 0);
        receivedMap.set(id, total);
      });

      usersWithStats = users.map((user) => {
        const json = user.toJSON();
        json.total_donations_sent = sentMap.get(user.user_id) || 0;
        json.total_donations_received = receivedMap.get(user.user_id) || 0;
        return json;
      });
    }

    res.json({
      success: true,
      data: {
        users: usersWithStats,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(count / limit),
          total_records: count,
          per_page: parseInt(limit),
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message,
    });
  }
});

// Detailed user view for admins
router.get('/users/:userId', validateUUIDParam('userId'), async (req, res) => {
  try {
    const { User, Wallet, Memorial, MemorialComment, GiftTransaction } = require('../models');
    const { sequelize } = require('../config/database');
    const { userId } = req.params;

    const user = await User.findByPk(userId, {
      include: [
        {
          model: Wallet,
          as: 'wallet',
          attributes: ['wallet_id', 'balance', 'is_frozen', 'frozen_reason'],
        },
      ],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const [memorialCount, commentCount, sentAgg, receivedAgg] = await Promise.all([
      Memorial.count({ where: { user_id: userId } }),
      MemorialComment.count({ where: { user_id: userId, is_deleted: false } }),
      GiftTransaction.findOne({
        where: { sender_id: userId, status: 'COMPLETED' },
        attributes: [[sequelize.fn('SUM', sequelize.col('amount')), 'total_sent']],
      }),
      GiftTransaction.findOne({
        where: { recipient_id: userId, status: 'COMPLETED' },
        attributes: [[sequelize.fn('SUM', sequelize.col('amount')), 'total_received']],
      }),
    ]);

    const totalSent = sentAgg ? parseFloat(sentAgg.get('total_sent') || 0) : 0;
    const totalReceived = receivedAgg ? parseFloat(receivedAgg.get('total_received') || 0) : 0;

    res.json({
      success: true,
      data: {
        user,
        stats: {
          memorial_count: memorialCount,
          comment_count: commentCount,
          total_donations_sent: totalSent,
          total_donations_received: totalReceived,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user detail',
      error: error.message,
    });
  }
});

// User status history for admins
router.get('/users/:userId/status-history', validateUUIDParam('userId'), validatePagination, async (req, res) => {
  try {
    const { UserStatusHistory, User } = require('../models');
    const { page = 1, limit = 20 } = req.query;
    const { userId } = req.params;
    const offset = (page - 1) * limit;

    const { count, rows } = await UserStatusHistory.findAndCountAll({
      where: { user_id: userId },
      include: [
        {
          model: User,
          as: 'changed_by_user',
          attributes: ['user_id', 'name', 'email'],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({
      success: true,
      data: {
        history: rows,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(count / limit),
          total_records: count,
          per_page: parseInt(limit),
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user status history',
      error: error.message,
    });
  }
});

// Start impersonation session (Super Admin only)
router.post('/users/:userId/impersonate', validateUUIDParam('userId'), requireSuperAdmin, async (req, res) => {
  try {
    const { User } = require('../models');
    const { userId } = req.params;

    const targetUser = await User.findByPk(userId);

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const token = jwt.sign(
      {
        userId: targetUser.user_id,
        impersonated: true,
        impersonatorId: req.user.user_id,
      },
      process.env.JWT_SECRET,
      { expiresIn: '2h' },
    );

    await logAdminAction(req, {
      action: 'USER_IMPERSONATE',
      targetType: 'USER',
      targetId: targetUser.user_id,
      targetLabel: targetUser.email || targetUser.phone || targetUser.name,
      metadata: {
        impersonator_id: req.user.user_id,
      },
    });

    res.json({
      success: true,
      message: 'Impersonation token created successfully',
      data: { token },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to start impersonation session',
      error: error.message,
    });
  }
});

// Export user data snapshot for compliance / support
router.post('/users/:userId/export', validateUUIDParam('userId'), async (req, res) => {
  try {
    const { User, Wallet, Memorial, MemorialComment, GiftTransaction, Order } = require('../models');
    const { userId } = req.params;
    const { reason } = req.body || {};

    const user = await User.findByPk(userId, {
      include: [
        {
          model: Wallet,
          as: 'wallet',
        },
      ],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const [memorials, comments, sentGifts, receivedGifts, orders] = await Promise.all([
      Memorial.findAll({ where: { user_id: userId } }),
      MemorialComment.findAll({ where: { user_id: userId, is_deleted: false } }),
      GiftTransaction.findAll({ where: { sender_id: userId, status: 'COMPLETED' } }),
      GiftTransaction.findAll({ where: { recipient_id: userId, status: 'COMPLETED' } }),
      Order.findAll({ where: { buyer_id: userId } }),
    ]);

    await logAdminAction(req, {
      action: 'USER_EXPORT',
      targetType: 'USER',
      targetId: user.user_id,
      targetLabel: user.email || user.phone || user.name,
      reason: reason || null,
      metadata: {
        memorial_count: memorials.length,
        comment_count: comments.length,
        sent_gifts_count: sentGifts.length,
        received_gifts_count: receivedGifts.length,
        order_count: orders.length,
      },
    });

    res.json({
      success: true,
      message: 'User data export generated successfully',
      data: {
        user,
        memorials,
        comments,
        sent_gifts: sentGifts,
        received_gifts: receivedGifts,
        orders,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to export user data',
      error: error.message,
    });
  }
});

// Anonymize user account (Super Admin only)
router.post('/users/:userId/anonymize', validateUUIDParam('userId'), requireSuperAdmin, async (req, res) => {
  try {
    const { User } = require('../models');
    const { userId } = req.params;
    const { reason, legal_note } = req.body || {};

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const previous = user.toJSON();

    // Prevent anonymizing administrator accounts other than the Super Admin themselves
    if (user.role === 'Administrator' && user.email !== process.env.SUPER_ADMIN_EMAIL) {
      return res.status(400).json({
        success: false,
        message: 'Only the configured Super Admin account can anonymize administrator accounts',
      });
    }

    const anonSuffix = user.user_id.substring(0, 8);

    user.name = 'Anonymized User';
    user.username = `anon_${anonSuffix}`;
    user.email = null;
    user.phone = null;
    user.profile_image = null;
    user.bio = null;
    user.address = null;
    user.city = null;
    user.google_id = null;
    user.verified = false;
    user.email_verified = false;
    user.phone_verified = false;
    user.is_active = false;
    user.is_banned = false;
    user.ban_reason = null;
    user.banned_at = null;
    user.banned_by = null;

    await user.save();

    await logAdminAction(req, {
      action: 'USER_ANONYMIZE',
      targetType: 'USER',
      targetId: user.user_id,
      targetLabel: previous.email || previous.phone || previous.name,
      reason: reason || null,
      metadata: {
        legal_note: legal_note || null,
        previous,
      },
    });

    res.json({
      success: true,
      message: 'User anonymized successfully',
      data: {
        user,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to anonymize user',
      error: error.message,
    });
  }
});

router.post('/users/:userId/restrictions', validateUUIDParam('userId'), async (req, res) => {
  try {
    const { User } = require('../models');
    const { userId } = req.params;
    const { can_create_memorials, can_comment } = req.body;

    const targetUser = await User.findByPk(userId);

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const updates = {};

    if (typeof can_create_memorials === 'boolean') {
      updates.can_create_memorials = can_create_memorials;
    }

    if (typeof can_comment === 'boolean') {
      updates.can_comment = can_comment;
    }

    if (!Object.keys(updates).length) {
      return res.status(400).json({
        success: false,
        message: 'No valid restriction fields provided',
      });
    }

    Object.assign(targetUser, updates);
    await targetUser.save();

    res.json({
      success: true,
      message: 'User restrictions updated successfully',
      data: {
        user: targetUser,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update user restrictions',
      error: error.message,
    });
  }
});

router.get('/users/:userId/memorials', validateUUIDParam('userId'), validatePagination, async (req, res) => {
  try {
    const { Memorial, User } = require('../models');
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const owner = await User.findByPk(userId, {
      attributes: ['user_id', 'name', 'email'],
    });

    if (!owner) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const { count, rows: memorials } = await Memorial.findAndCountAll({
      where: { user_id: userId },
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({
      success: true,
      data: {
        user: owner,
        memorials,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(count / limit),
          total_records: count,
          per_page: parseInt(limit),
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user memorials',
      error: error.message,
    });
  }
});
router.get('/users/:userId/comments', validateUUIDParam('userId'), validatePagination, async (req, res) => {
  try {
    const { MemorialComment, Memorial, User } = require('../models');
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const owner = await User.findByPk(userId, {
      attributes: ['user_id', 'name', 'email'],
    });

    if (!owner) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const { count, rows: comments } = await MemorialComment.findAndCountAll({
      where: { user_id: userId },
      include: [
        {
          model: Memorial,
          as: 'memorial',
          attributes: ['memorial_id', 'deceased_name'],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({
      success: true,
      data: {
        user: owner,
        comments,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(count / limit),
          total_records: count,
          per_page: parseInt(limit),
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user comments',
      error: error.message,
    });
  }
});

// Transaction monitoring
router.get('/transactions', validatePagination, async (req, res) => {
  try {
    const { WalletTransaction, User } = require('../models');
    const { page = 1, limit = 20, type, status } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (type) where.type = type;
    if (status) where.status = status;

    const { count, rows: transactions } = await WalletTransaction.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['user_id', 'name', 'email']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        transactions,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(count / limit),
          total_records: count,
          per_page: parseInt(limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transactions',
      error: error.message
    });
  }
});

module.exports = router;
