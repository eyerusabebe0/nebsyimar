const { Order, OrderItem, Product, Vendor, User, Wallet, WalletTransaction } = require('../models');
const { asyncHandler, InsufficientFundsError, WalletFrozenError } = require('../middleware/errorMiddleware');
const { sequelize } = require('../config/database');
const { logAdminAction } = require('../utils/adminAudit');
const { getIO } = require('../realtime/socket');

const PLATFORM_FEE_PERCENTAGE = 5.0; // 5% platform fee

// @desc    Create new order
// @route   POST /api/v1/orders
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
  const {
    vendor_id,
    items,
    delivery_address,
    delivery_instructions,
    delivery_date,
    delivery_time_slot,
    customer_notes,
    memorial_id,
    is_urgent = false
  } = req.body;

  // Validate vendor
  const vendor = await Vendor.findByPk(vendor_id);
  if (!vendor || vendor.verification_status !== 'VERIFIED' || !vendor.is_active) {
    return res.status(404).json({
      success: false,
      message: 'Vendor not found or not available'
    });
  }

  // Validate and calculate order totals
  let subtotal = 0;
  const orderItems = [];
  const productIds = [...new Set(items.map(item => item.product_id))];

  const products = await Product.findAll({
    where: {
      product_id: productIds,
      vendor_id,
      is_active: true
    }
  });

  const productMap = new Map(products.map(p => [p.product_id, p]));

  for (const item of items) {
    const product = productMap.get(item.product_id);

    if (!product) {
      return res.status(400).json({
        success: false,
        message: `Product ${item.product_id} not found or not available from this vendor`
      });
    }

    // Check stock availability
    if (!product.isInStock(item.quantity)) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock for product: ${product.name}`
      });
    }

    const unitPrice = product.getEffectivePrice();
    const itemTotal = unitPrice * item.quantity;
    subtotal += itemTotal;

    orderItems.push({
      product_id: product.product_id,
      product_name: product.name,
      product_description: product.description,
      product_image: product.main_image,
      unit_price: unitPrice,
      quantity: item.quantity,
      total_price: itemTotal,
      customization_details: item.customization_details || null,
      special_instructions: item.special_instructions || null
    });
  }

  // Check minimum order requirement
  if (subtotal < vendor.minimum_order) {
    return res.status(400).json({
      success: false,
      message: `Minimum order amount is ${vendor.minimum_order} ETB`
    });
  }

  // Calculate fees
  const deliveryFee = vendor.delivery_fee;
  const urgencyFee = is_urgent ? subtotal * 0.1 : 0; // 10% urgency fee
  const platformFee = (subtotal * PLATFORM_FEE_PERCENTAGE) / 100;
  const totalAmount = subtotal + deliveryFee + urgencyFee;
  const vendorAmount = subtotal + deliveryFee + urgencyFee - platformFee;

  // Check buyer's wallet
  const buyerWallet = await Wallet.findOne({
    where: { user_id: req.user.user_id }
  });

  if (!buyerWallet) {
    return res.status(404).json({
      success: false,
      message: 'Buyer wallet not found'
    });
  }

  if (buyerWallet.is_frozen) {
    throw new WalletFrozenError();
  }

  if (!buyerWallet.hasBalance(totalAmount)) {
    throw new InsufficientFundsError(`Insufficient balance. Order total: ${totalAmount} ETB`);
  }

  // Get vendor's wallet (optional at order creation; required later for payout)
  const vendorWallet = await Wallet.findOne({
    where: { user_id: vendor.user_id }
  });

  // Start database transaction
  const transaction = await sequelize.transaction();

  try {
    // Create buyer's wallet transaction (debit)
    const buyerTransaction = await WalletTransaction.create({
      wallet_id: buyerWallet.wallet_id,
      user_id: req.user.user_id,
      amount: -totalAmount,
      type: 'MARKETPLACE_PURCHASE',
      status: 'COMPLETED',
      description: `Order from ${vendor.business_name}`,
      reference_type: 'ORDER',
      balance_before: buyerWallet.balance,
      balance_after: parseFloat(buyerWallet.balance) - totalAmount,
      fee_amount: platformFee,
      net_amount: -totalAmount,
      processed_at: new Date()
    }, { transaction });

    // Create order
    const order = await Order.create({
      buyer_id: req.user.user_id,
      vendor_id,
      memorial_id,
      wallet_txn_id: buyerTransaction.txn_id,
      subtotal,
      delivery_fee: deliveryFee,
      platform_fee: platformFee,
      total_amount: totalAmount,
      vendor_amount: vendorAmount,
      delivery_address,
      delivery_instructions,
      delivery_date,
      delivery_time_slot,
      customer_notes,
      is_urgent,
      urgency_fee: urgencyFee,
      estimated_delivery: delivery_date ? new Date(delivery_date) : null
    }, { transaction });

    // Update buyer transaction with order reference
    await buyerTransaction.update({
      reference_id: order.order_id
    }, { transaction });

    // Create order items and update product stock
    for (const itemData of orderItems) {
      await OrderItem.create({
        order_id: order.order_id,
        ...itemData
      }, { transaction });

      const product = productMap.get(itemData.product_id);
      if (product && product.track_inventory) {
        await product.updateStock(itemData.quantity, 'subtract');
      }
    }

    // Update wallet balances
    await buyerWallet.debit(totalAmount, `Order: ${order.order_number}`);

    // Update vendor statistics
    await vendor.addOrder(vendorAmount);

    await transaction.commit();

    // Fetch complete order with relations
    const completeOrder = await Order.findByPk(order.order_id, {
      include: [
        {
          model: Vendor,
          as: 'vendor',
          attributes: ['vendor_id', 'business_name', 'phone']
        },
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['product_id', 'name', 'main_image']
            }
          ]
        }
      ]
    });

    try {
      const io = getIO();
      io.to(`user:${completeOrder.buyer_id}`).emit('orders:updated');
      io.to(`vendor:${completeOrder.vendor_id}`).emit('orders:updated');
      io.to('admin:orders').emit('orders:updated');
    } catch (socketError) {
      console.log('Socket emit error (createOrder):', socketError.message);
    }

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: {
        order: completeOrder
      }
    });

  } catch (error) {
    await transaction.rollback();
    throw error;
  }
});

// @desc    Get user's orders
// @route   GET /api/v1/orders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  const offset = (page - 1) * limit;

  const orders = await Order.getUserOrders(
    req.user.user_id,
    status,
    parseInt(limit),
    parseInt(offset)
  );

  // Get total count for pagination
  const where = { buyer_id: req.user.user_id };
  if (status) where.status = status;
  
  const totalCount = await Order.count({ where });
  res.json({
    success: true,
    data: {
      orders,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(totalCount / limit),
        total_records: totalCount,
        per_page: parseInt(limit)
      }
    }
  });
});

// @desc    Get order by ID
// @route   GET /api/v1/orders/:orderId
// @access  Private
const getOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  const order = await Order.findByPk(orderId, {
    include: [
      {
        model: User,
        as: 'buyer',
        attributes: ['user_id', 'name', 'phone']
      },
      {
        model: Vendor,
        as: 'vendor',
        attributes: ['vendor_id', 'business_name', 'phone', 'business_address']
      },
      {
        model: OrderItem,
        as: 'items',
        include: [
          {
            model: Product,
            as: 'product',
            attributes: ['product_id', 'name', 'main_image']
          }
        ]
      }
    ]
  });

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found'
    });
  }

  // Check access permissions
  const isOwner = order.buyer_id === req.user.user_id;
  const isVendor = order.vendor?.user_id === req.user.user_id;
  const isAdmin = req.user.role === 'Administrator';

  if (!isOwner && !isVendor && !isAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  res.json({
    success: true,
    data: {
      order
    }
  });
});

// @desc    Update order status (Admin-managed)
// @route   PATCH /api/v1/orders/:orderId/status
// @access  Private (Administrator)
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { status, note, tracking_number, delivery_person } = req.body;

  const order = await Order.findByPk(orderId, {
    include: [
      {
        model: Vendor,
        as: 'vendor',
      },
    ],
  });

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found'
    });
  }

  // Validate status transition
  const validTransitions = {
    'PENDING': ['CONFIRMED', 'CANCELLED'],
    'CONFIRMED': ['PREPARING', 'CANCELLED'],
    'PREPARING': ['READY', 'CANCELLED'],
    'READY': ['OUT_FOR_DELIVERY'],
    'OUT_FOR_DELIVERY': ['DELIVERED'],
    'DELIVERED': [],
    'CANCELLED': [],
    'REFUNDED': []
  };

  if (!validTransitions[order.status].includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Cannot change status from ${order.status} to ${status}`
    });
  }

  // Update order status
  await order.updateStatus(status, note, req.user.user_id);

  // Set additional fields based on status
  if (status === 'OUT_FOR_DELIVERY' && tracking_number) {
    await order.setTrackingNumber(tracking_number);
  }

  if (status === 'OUT_FOR_DELIVERY' && delivery_person) {
    await order.assignDeliveryPerson(delivery_person);
  }

  // If order is delivered, credit vendor wallet (admin-triggered payout)
  if (status === 'DELIVERED') {
    const vendorWallet = await Wallet.findOne({
      where: { user_id: order.vendor.user_id }
    });

    if (vendorWallet) {
      const transaction = await sequelize.transaction();

      try {
        // Create vendor's wallet transaction (credit)
        await WalletTransaction.create({
          wallet_id: vendorWallet.wallet_id,
          user_id: order.vendor.user_id,
          amount: order.vendor_amount,
          type: 'MARKETPLACE_SALE',
          status: 'COMPLETED',
          description: `Order delivered: ${order.order_number}`,
          reference_id: order.order_id,
          reference_type: 'ORDER',
          balance_before: vendorWallet.balance,
          balance_after: parseFloat(vendorWallet.balance) + parseFloat(order.vendor_amount),
          fee_amount: 0,
          net_amount: order.vendor_amount,
          processed_at: new Date()
        }, { transaction });

        // Credit vendor wallet
        await vendorWallet.credit(order.vendor_amount, `Order delivered: ${order.order_number}`);

        await transaction.commit();
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    }
  }

  // Notify buyer, vendor, and admin dashboards about status change
  try {
    const io = getIO();
    io.to(`user:${order.buyer_id}`).emit('orders:updated');
    io.to(`vendor:${order.vendor_id}`).emit('orders:updated');
    io.to('admin:orders').emit('orders:updated');
  } catch (socketError) {
    console.log('Socket emit error (updateOrderStatus):', socketError.message);
  }

  res.json({
    success: true,
    message: 'Order status updated successfully',
    data: {
      order: {
        order_id: order.order_id,
        order_number: order.order_number,
        status: order.status,
        status_history: order.status_history
      }
    }
  });
});

// @desc    Cancel order
// @route   POST /api/v1/orders/:orderId/cancel
// @access  Private
const cancelOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { reason } = req.body;

  const order = await Order.findByPk(orderId);

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found'
    });
  }

  // Check permissions
  const isOwner = order.buyer_id === req.user.user_id;
  const isVendor = order.vendor_id === req.vendor?.vendor_id;
  const isAdmin = req.user.role === 'Administrator';

  if (!isOwner && !isVendor && !isAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  // Check if order can be cancelled
  if (!['PENDING', 'CONFIRMED', 'PREPARING'].includes(order.status)) {
    return res.status(400).json({
      success: false,
      message: 'Order cannot be cancelled at this stage'
    });
  }

  const transaction = await sequelize.transaction();

  try {
    // Cancel the order
    await order.cancel(reason, req.user.user_id);

    // Refund buyer if payment was made
    const buyerWallet = await Wallet.findOne({
      where: { user_id: order.buyer_id }
    });

    if (buyerWallet) {
      // Create refund transaction
      await WalletTransaction.create({
        wallet_id: buyerWallet.wallet_id,
        user_id: order.buyer_id,
        amount: order.total_amount,
        type: 'REFUND',
        status: 'COMPLETED',
        description: `Refund for cancelled order: ${order.order_number}`,
        reference_id: order.order_id,
        reference_type: 'ORDER',
        balance_before: buyerWallet.balance,
        balance_after: parseFloat(buyerWallet.balance) + parseFloat(order.total_amount),
        fee_amount: 0,
        net_amount: order.total_amount,
        processed_at: new Date()
      }, { transaction });

      // Credit buyer wallet
      await buyerWallet.credit(order.total_amount, `Refund: ${order.order_number}`);
    }

    // Restore product stock
    const orderItems = await OrderItem.findAll({
      where: { order_id: order.order_id }
    });

    const productIds = [...new Set(orderItems.map(item => item.product_id))];
    const products = await Product.findAll({
      where: { product_id: productIds }
    });
    const productMap = new Map(products.map(p => [p.product_id, p]));

    for (const item of orderItems) {
      const product = productMap.get(item.product_id);
      if (product && product.track_inventory) {
        await product.updateStock(item.quantity, 'add');
      }
    }

    await transaction.commit();

    if (isAdmin) {
      await logAdminAction(req, {
        action: 'ORDER_CANCEL',
        targetType: 'ORDER',
        targetId: order.order_id,
        targetLabel: order.order_number,
        reason: reason || null,
        metadata: {
          cancelled_by: req.user.user_id,
          cancelled_by_role: req.user.role,
          buyer_id: order.buyer_id,
          vendor_id: order.vendor_id,
          total_amount: order.total_amount
        }
      });
    }

    try {
      const io = getIO();
      io.to(`user:${order.buyer_id}`).emit('orders:updated');
      io.to(`vendor:${order.vendor_id}`).emit('orders:updated');
    } catch (socketError) {
      console.log('Socket emit error (cancelOrder):', socketError.message);
    }

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: {
        order: {
          order_id: order.order_id,
          order_number: order.order_number,
          status: order.status,
          cancellation_reason: order.cancellation_reason
        }
      }
    });

  } catch (error) {
    await transaction.rollback();
    throw error;
  }
});

// @desc    Add order review
// @route   POST /api/v1/orders/:orderId/review
// @access  Private
const addOrderReview = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { rating, review } = req.body;

  const order = await Order.findByPk(orderId, {
    include: [
      {
        model: Vendor,
        as: 'vendor'
      }
    ]
  });

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found'
    });
  }

  // Check if user is the buyer
  if (order.buyer_id !== req.user.user_id) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  // Check if order is delivered
  if (order.status !== 'DELIVERED') {
    return res.status(400).json({
      success: false,
      message: 'Can only review delivered orders'
    });
  }

  // Check if already reviewed
  if (order.rating) {
    return res.status(400).json({
      success: false,
      message: 'Order already reviewed'
    });
  }

  // Add review to order
  await order.addReview(rating, review);

  // Update vendor rating
  await order.vendor.updateRating(rating);

  try {
    const io = getIO();
    io.to(`user:${order.buyer_id}`).emit('orders:updated');
    io.to(`vendor:${order.vendor_id}`).emit('orders:updated');
  } catch (socketError) {
    console.log('Socket emit error (addOrderReview):', socketError.message);
  }

  res.json({
    success: true,
    message: 'Review added successfully',
    data: {
      order: {
        order_id: order.order_id,
        order_number: order.order_number,
        rating: order.rating,
        review: order.review
      }
    }
  });
});

// @desc    Get order statistics
// @route   GET /api/v1/orders/stats
// @access  Private
const getOrderStats = asyncHandler(async (req, res) => {
  const { period = '30d' } = req.query;

  // Calculate date range
  let startDate = new Date();
  switch (period) {
    case '7d':
      startDate.setDate(startDate.getDate() - 7);
      break;
    case '30d':
      startDate.setDate(startDate.getDate() - 30);
      break;
    case '90d':
      startDate.setDate(startDate.getDate() - 90);
      break;
    case '1y':
      startDate.setFullYear(startDate.getFullYear() - 1);
      break;
    default:
      startDate.setDate(startDate.getDate() - 30);
  }

  const stats = await Order.getOrderStats(null, {
    start: startDate,
    end: new Date()
  });

  // Get user-specific stats
  const userStats = await Order.getOrderStats(null, {
    start: startDate,
    end: new Date()
  });

  res.json({
    success: true,
    data: {
      period,
      user_stats: userStats,
      overall_stats: stats
    }
  });
});

module.exports = {
  createOrder,
  getMyOrders,
  getOrder,
  updateOrderStatus,
  cancelOrder,
  addOrderReview,
  getOrderStats
};
