const { Vendor, User, Product, Order, OrderItem } = require('../models');
const { asyncHandler } = require('../middleware/errorMiddleware');
const { uploadFiles } = require('../utils/fileUpload');
const { logAdminAction } = require('../utils/adminAudit');

// @desc    Register as vendor
// @route   POST /api/v1/vendors/register
// @access  Private
const registerVendor = asyncHandler(async (req, res) => {
  const selfRegistrationEnabled = process.env.ENABLE_VENDOR_SELF_REGISTRATION === 'true';

  if (!selfRegistrationEnabled) {
    return res.status(403).json({
      success: false,
      message: 'Vendor self-registration is currently disabled. Please contact an administrator to be onboarded as a vendor.'
    });
  }

  const {
    business_name,
    business_name_amharic,
    business_description,
    business_description_amharic,
    service_type,
    business_license,
    tax_id,
    business_address,
    city,
    region,
    phone,
    email,
    website,
    delivery_areas,
    delivery_fee,
    minimum_order,
    operating_hours
  } = req.body;

  // Check if user already has a vendor profile
  const existingVendor = await Vendor.findOne({
    where: { user_id: req.user.user_id }
  });

  if (existingVendor) {
    return res.status(409).json({
      success: false,
      message: 'User already has a vendor profile'
    });
  }

  // Handle file uploads
  let uploadedFiles = {};
  if (req.files) {
    uploadedFiles = await uploadFiles(req.files, 'vendors');
  }

  // Create vendor profile
  const vendor = await Vendor.create({
    user_id: req.user.user_id,
    business_name,
    business_name_amharic,
    business_description,
    business_description_amharic,
    service_type,
    business_license,
    tax_id,
    business_address,
    city,
    region,
    phone,
    email: email || req.user.email,
    website,
    logo_url: uploadedFiles.logo?.[0],
    cover_image_url: uploadedFiles.cover_image?.[0],
    gallery_images: uploadedFiles.gallery_images || [],
    verification_documents: uploadedFiles.documents || [],
    delivery_areas: delivery_areas || [],
    delivery_fee: delivery_fee || 0,
    minimum_order: minimum_order || 0,
    operating_hours: operating_hours || {}
  });

  // Update user role to Vendor
  await req.user.update({ role: 'Vendor' });

  res.status(201).json({
    success: true,
    message: 'Vendor registration submitted successfully. Awaiting verification.',
    data: {
      vendor
    }
  });
});

// @desc    Update vendor limits (allowed categories / countries)
// @route   POST /api/v1/admin/vendors/:vendorId/limits
// @access  Private (Admin)
const updateVendorLimits = asyncHandler(async (req, res) => {
  const { vendorId } = req.params;
  const { allowed_categories, allowed_countries } = req.body || {};

  const vendor = await Vendor.findByPk(vendorId);

  if (!vendor) {
    return res.status(404).json({
      success: false,
      message: 'Vendor not found'
    });
  }

  const settings = vendor.settings || {};
  const limits = settings.limits || {};

  if (allowed_categories !== undefined && !Array.isArray(allowed_categories)) {
    return res.status(400).json({
      success: false,
      message: 'allowed_categories must be an array when provided'
    });
  }

  if (allowed_countries !== undefined && !Array.isArray(allowed_countries)) {
    return res.status(400).json({
      success: false,
      message: 'allowed_countries must be an array when provided'
    });
  }

  if (allowed_categories !== undefined) {
    limits.allowed_categories = allowed_categories;
  }

  if (allowed_countries !== undefined) {
    limits.allowed_countries = allowed_countries;
  }

  settings.limits = limits;
  vendor.settings = settings;
  await vendor.save();

  await logAdminAction(req, {
    action: 'VENDOR_LIMITS_UPDATE',
    targetType: 'VENDOR',
    targetId: vendor.vendor_id,
    targetLabel: vendor.business_name,
    metadata: {
      allowed_categories: limits.allowed_categories || null,
      allowed_countries: limits.allowed_countries || null,
    },
  });

  res.json({
    success: true,
    message: 'Vendor limits updated successfully',
    data: {
      vendor,
    },
  });
});

// @desc    Get vendor profile
// @route   GET /api/v1/vendors/profile
// @access  Private (Vendor)
const getVendorProfile = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findOne({
    where: { user_id: req.user.user_id },
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['user_id', 'name', 'email', 'phone']
      }
    ]
  });

  if (!vendor) {
    return res.status(404).json({
      success: false,
      message: 'Vendor profile not found'
    });
  }

  res.json({
    success: true,
    data: {
      vendor
    }
  });
});

// @desc    Update vendor profile
// @route   PUT /api/v1/vendors/profile
// @access  Private (Vendor)
const updateVendorProfile = asyncHandler(async (req, res) => {
  const {
    business_name,
    business_name_amharic,
    business_description,
    business_description_amharic,
    business_address,
    city,
    region,
    phone,
    email,
    website,
    delivery_areas,
    delivery_fee,
    minimum_order,
    operating_hours
  } = req.body;

  const vendor = await Vendor.findOne({
    where: { user_id: req.user.user_id }
  });

  if (!vendor) {
    return res.status(404).json({
      success: false,
      message: 'Vendor profile not found'
    });
  }

  // Handle file uploads
  let uploadedFiles = {};
  if (req.files) {
    uploadedFiles = await uploadFiles(req.files, 'vendors');
  }

  // Update vendor profile
  const updateData = {
    business_name: business_name || vendor.business_name,
    business_name_amharic,
    business_description,
    business_description_amharic,
    business_address: business_address || vendor.business_address,
    city: city || vendor.city,
    region: region || vendor.region,
    phone: phone || vendor.phone,
    email: email || vendor.email,
    website,
    delivery_areas: delivery_areas || vendor.delivery_areas,
    delivery_fee: delivery_fee !== undefined ? delivery_fee : vendor.delivery_fee,
    minimum_order: minimum_order !== undefined ? minimum_order : vendor.minimum_order,
    operating_hours: operating_hours || vendor.operating_hours
  };

  // Update images if uploaded
  if (uploadedFiles.logo) {
    updateData.logo_url = uploadedFiles.logo[0];
  }
  if (uploadedFiles.cover_image) {
    updateData.cover_image_url = uploadedFiles.cover_image[0];
  }
  if (uploadedFiles.gallery_images) {
    updateData.gallery_images = [...vendor.gallery_images, ...uploadedFiles.gallery_images];
  }

  await vendor.update(updateData);

  res.json({
    success: true,
    message: 'Vendor profile updated successfully',
    data: {
      vendor
    }
  });
});

// @desc    Get all verified vendors
// @route   GET /api/v1/vendors
// @access  Public
const getVendors = asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 20, 
    service_type, 
    city, 
    search,
    sort = 'rating',
    featured_only = false 
  } = req.query;
  
  const offset = (page - 1) * limit;

  const where = {
    verification_status: 'VERIFIED',
    is_active: true
  };

  if (service_type) {
    where.service_type = service_type;
  }

  if (city) {
    where.city = city;
  }

  if (featured_only === 'true') {
    where.is_featured = true;
    where.featured_until = {
      [require('../config/database').sequelize.Sequelize.Op.gt]: new Date()
    };
  }

  if (search) {
    where[require('../config/database').sequelize.Sequelize.Op.or] = [
      { business_name: { [require('../config/database').sequelize.Sequelize.Op.iLike]: `%${search}%` } },
      { business_name_amharic: { [require('../config/database').sequelize.Sequelize.Op.iLike]: `%${search}%` } },
      { business_description: { [require('../config/database').sequelize.Sequelize.Op.iLike]: `%${search}%` } }
    ];
  }

  // Determine sort order
  let order = [];
  switch (sort) {
    case 'rating':
      order = [['is_featured', 'DESC'], ['rating', 'DESC']];
      break;
    case 'orders':
      order = [['is_featured', 'DESC'], ['total_orders', 'DESC']];
      break;
    case 'newest':
      order = [['is_featured', 'DESC'], ['created_at', 'DESC']];
      break;
    case 'name':
      order = [['is_featured', 'DESC'], ['business_name', 'ASC']];
      break;
    default:
      order = [['is_featured', 'DESC'], ['rating', 'DESC']];
  }

  const { count, rows: vendors } = await Vendor.findAndCountAll({
    where,
    order,
    limit: parseInt(limit),
    offset: parseInt(offset)
  });

  res.json({
    success: true,
    data: {
      vendors,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(count / limit),
        total_records: count,
        per_page: parseInt(limit)
      }
    }
  });
});

// @desc    Get vendor by ID
// @route   GET /api/v1/vendors/:vendorId
// @access  Public
const getVendor = asyncHandler(async (req, res) => {
  const { vendorId } = req.params;

  const vendor = await Vendor.findByPk(vendorId, {
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['user_id', 'name']
      }
    ]
  });

  if (!vendor) {
    return res.status(404).json({
      success: false,
      message: 'Vendor not found'
    });
  }

  if (vendor.verification_status !== 'VERIFIED' || !vendor.is_active) {
    return res.status(404).json({
      success: false,
      message: 'Vendor not available'
    });
  }

  // Get vendor's products
  const products = await Product.findAll({
    where: {
      vendor_id: vendorId,
      is_active: true
    },
    order: [['is_featured', 'DESC'], ['created_at', 'DESC']],
    limit: 10
  });

  res.json({
    success: true,
    data: {
      vendor,
      products
    }
  });
});

// @desc    Get vendor orders
// @route   GET /api/v1/vendors/orders
// @access  Private (Vendor)
const getVendorOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  const offset = (page - 1) * limit;

  const vendor = await Vendor.findOne({
    where: { user_id: req.user.user_id }
  });

  if (!vendor) {
    return res.status(404).json({
      success: false,
      message: 'Vendor profile not found'
    });
  }

  const orders = await Order.getVendorOrders(
    vendor.vendor_id,
    status,
    parseInt(limit),
    parseInt(offset)
  );

  // Get total count for pagination
  const where = { vendor_id: vendor.vendor_id };
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

// @desc    Get vendor statistics
// @route   GET /api/v1/vendors/stats
// @access  Private (Vendor)
const getVendorStats = asyncHandler(async (req, res) => {
  const { period = '30d' } = req.query;

  const vendor = await Vendor.findOne({
    where: { user_id: req.user.user_id }
  });

  if (!vendor) {
    return res.status(404).json({
      success: false,
      message: 'Vendor profile not found'
    });
  }

  // Calculate date range
  let startDate = new Date();
  const endDate = new Date();
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

  // Get order statistics
  const orderStats = await Order.getOrderStats(vendor.vendor_id, {
    start: startDate,
    end: endDate
  });

  // Get popular products
  const popularProducts = await OrderItem.getPopularProducts(
    vendor.vendor_id,
    5,
    { start: startDate, end: endDate }
  );

  const ordersInRange = await Order.getOrdersByDateRange(startDate, endDate, vendor.vendor_id);

  const dailyMap = {};

  for (const order of ordersInRange) {
    const createdAt = order.created_at || order.createdAt;
    if (!createdAt) {
      continue;
    }

    const dateObj = new Date(createdAt);
    if (Number.isNaN(dateObj.getTime())) {
      continue;
    }

    const key = dateObj.toISOString().slice(0, 10);

    if (!dailyMap[key]) {
      dailyMap[key] = {
        date: key,
        order_count: 0,
        total_revenue: 0,
        delivered: 0,
        cancelled: 0
      };
    }

    dailyMap[key].order_count += 1;
    dailyMap[key].total_revenue += parseFloat(order.total_amount || 0);

    if (order.status === 'DELIVERED') {
      dailyMap[key].delivered += 1;
    } else if (order.status === 'CANCELLED') {
      dailyMap[key].cancelled += 1;
    }
  }

  const orderTimeSeries = Object.values(dailyMap).sort((a, b) => {
    return new Date(a.date) - new Date(b.date);
  });

  const newOrInProgress = Math.max(
    (orderStats && orderStats.total_orders ? orderStats.total_orders : 0) -
      (orderStats && orderStats.completed_orders ? orderStats.completed_orders : 0) -
      (orderStats && orderStats.cancelled_orders ? orderStats.cancelled_orders : 0),
    0
  );

  res.json({
    success: true,
    data: {
      period,
      vendor_info: {
        business_name: vendor.business_name,
        rating: vendor.rating,
        total_reviews: vendor.total_reviews,
        total_orders: vendor.total_orders,
        total_revenue: vendor.total_revenue
      },
      period_stats: orderStats,
      popular_products: popularProducts,
      order_time_series: orderTimeSeries,
      order_funnel: {
        new_or_in_progress: newOrInProgress,
        delivered: orderStats ? orderStats.completed_orders : 0,
        cancelled: orderStats ? orderStats.cancelled_orders : 0
      }
    }
  });
});

// @desc    Get featured vendors
// @route   GET /api/v1/vendors/featured
// @access  Public
const getFeaturedVendors = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;

  const vendors = await Vendor.getFeaturedVendors(parseInt(limit));

  res.json({
    success: true,
    data: {
      vendors
    }
  });
});

// Admin endpoints

// @desc    Get pending vendor verifications
// @route   GET /api/v1/admin/vendors/pending
// @access  Private (Admin)
const getPendingVendors = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  const { count, rows: vendors } = await Vendor.findAndCountAll({
    where: { verification_status: 'PENDING' },
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['user_id', 'name', 'email', 'phone']
      }
    ],
    order: [['created_at', 'ASC']],
    limit: parseInt(limit),
    offset: parseInt(offset)
  });

  res.json({
    success: true,
    data: {
      vendors,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(count / limit),
        total_records: count,
        per_page: parseInt(limit)
      }
    }
  });
});

// @desc    Verify vendor
// @route   POST /api/v1/admin/vendors/:vendorId/verify
// @access  Private (Admin)
const verifyVendor = asyncHandler(async (req, res) => {
  const { vendorId } = req.params;

  const vendor = await Vendor.findByPk(vendorId);

  if (!vendor) {
    return res.status(404).json({
      success: false,
      message: 'Vendor not found'
    });
  }

  if (vendor.verification_status !== 'PENDING') {
    return res.status(400).json({
      success: false,
      message: 'Vendor is not pending verification'
    });
  }

  await vendor.verify(req.user.user_id);

  await logAdminAction(req, {
    action: 'VENDOR_VERIFY',
    targetType: 'VENDOR',
    targetId: vendor.vendor_id,
    targetLabel: vendor.business_name,
    metadata: {
      service_type: vendor.service_type,
      city: vendor.city,
      user_id: vendor.user_id,
    },
  });

  res.json({
    success: true,
    message: 'Vendor verified successfully',
    data: {
      vendor
    }
  });
});

// @desc    Reject vendor
// @route   POST /api/v1/admin/vendors/:vendorId/reject
// @access  Private (Admin)
const rejectVendor = asyncHandler(async (req, res) => {
  const { vendorId } = req.params;
  const { reason } = req.body;

  const vendor = await Vendor.findByPk(vendorId);

  if (!vendor) {
    return res.status(404).json({
      success: false,
      message: 'Vendor not found'
    });
  }

  if (vendor.verification_status !== 'PENDING') {
    return res.status(400).json({
      success: false,
      message: 'Vendor is not pending verification'
    });
  }

  await vendor.reject(reason, req.user.user_id);

  await logAdminAction(req, {
    action: 'VENDOR_REJECT',
    targetType: 'VENDOR',
    targetId: vendor.vendor_id,
    targetLabel: vendor.business_name,
    reason,
    metadata: {
      service_type: vendor.service_type,
      city: vendor.city,
      user_id: vendor.user_id,
    },
  });

  res.json({
    success: true,
    message: 'Vendor rejected successfully',
    data: {
      vendor
    }
  });
});

// ...

module.exports = {
  registerVendor,
  getVendorProfile,
  updateVendorProfile,
  getVendors,
  getVendor,
  getVendorOrders,
  getVendorStats,
  getFeaturedVendors,
  getPendingVendors,
  verifyVendor,
  rejectVendor,
  updateVendorLimits
};
