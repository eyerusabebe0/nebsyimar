const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const { User, VendorAccount, Order, Product, Vendor } = require('../models');
const { ValidationError, NotFoundError, ForbiddenError } = require('../utils/errors');
const { getIO } = require('../realtime/socket');
const { uploadFiles } = require('../utils/fileUpload');

/**
 * @desc    Get vendor dashboard data
 * @route   GET /api/v1/vendor/dashboard
 * @access  Private (Vendor only)
 */
const getVendorDashboard = asyncHandler(async (req, res) => {
  const vendorAccount = await VendorAccount.findOne({
    where: { user_id: req.user.user_id },
    include: [{ model: User, as: 'user' }]
  });

  if (!vendorAccount) {
    throw new NotFoundError('Vendor account not found');
  }

  const vendor = await Vendor.findOne({
    where: { user_id: vendorAccount.user_id }
  });

  if (!vendor) {
    throw new NotFoundError('Vendor profile not found');
  }

  const vendorId = vendor.vendor_id;

  // Get order counts
  const orderCounts = await Order.findAll({
    where: { vendor_id: vendorId },
    attributes: [
      'status',
      [require('../config/database').sequelize.fn('COUNT', '*'), 'count']
    ],
    group: ['status'],
    raw: true
  });

  // Get product count
  const productCount = await Product.count({
    where: { vendor_id: vendorId }
  });

  // Get recent orders
  const recentOrders = await Order.findAll({
    where: { vendor_id: vendorId },
    order: [['createdAt', 'DESC']],
    limit: 10,
    include: [
      {
        model: User,
        as: 'buyer',
        attributes: ['name', 'phone']
      }
    ]
  });

  const recentOrdersWithCustomer = recentOrders.map(order => {
    const plain = order.toJSON();
    const buyer = plain.buyer || {};
    return {
      ...plain,
      customer: {
        name: buyer.name,
        phone: buyer.phone
      }
    };
  });

  // Format order counts
  const formattedOrderCounts = {
    new: 0,
    accepted: 0,
    preparing: 0,
    out_for_delivery: 0,
    delivered: 0,
    cancelled: 0
  };

  orderCounts.forEach(item => {
    formattedOrderCounts[item.status] = parseInt(item.count);
  });

  res.json({
    success: true,
    data: {
      vendor_account: vendorAccount,
      order_counts: formattedOrderCounts,
      product_count: productCount,
      recent_orders: recentOrdersWithCustomer
    }
  });
});

/**
 * @desc    Get vendor orders
 * @route   GET /api/v1/vendor/orders
 * @access  Private (Vendor only)
 */
const getVendorOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  const offset = (page - 1) * limit;

  const vendorAccount = await VendorAccount.findOne({
    where: { user_id: req.user.user_id }
  });

  if (!vendorAccount) {
    throw new NotFoundError('Vendor account not found');
  }

  if (!vendorAccount.can_manage_orders) {
    throw new ForbiddenError('You do not have permission to manage orders');
  }

  const vendor = await Vendor.findOne({ where: { user_id: vendorAccount.user_id } });

  if (!vendor) {
    throw new NotFoundError('Vendor profile not found');
  }

  const vendorId = vendor.vendor_id;

  const where = { vendor_id: vendorId };
  if (status) where.status = status;

  // Use the Order.getVendorOrders helper to load orders with buyer and items
  const orders = await Order.getVendorOrders(
    vendorId,
    status,
    parseInt(limit),
    parseInt(offset)
  );

  // Separate count query for pagination
  const count = await Order.count({ where });

  const ordersWithCustomer = orders.map(order => {
    const plain = order.toJSON();
    const buyer = plain.buyer || {};
    return {
      ...plain,
      customer: {
        name: buyer.name,
        phone: buyer.phone,
        email: buyer.email
      }
    };
  });

  res.json({
    success: true,
    data: {
      orders: ordersWithCustomer,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(count / limit),
        total_records: count,
        per_page: parseInt(limit)
      }
    }
  });
});

/**
 * @desc    Update order status
 * @route   PUT /api/v1/vendor/orders/:orderId/status
 * @access  Private (Vendor only)
 */
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { status, notes } = req.body;

  const vendorAccount = await VendorAccount.findOne({
    where: { user_id: req.user.user_id }
  });

  if (!vendorAccount) {
    throw new NotFoundError('Vendor account not found');
  }

  if (!vendorAccount.can_manage_orders) {
    throw new ForbiddenError('You do not have permission to manage orders');
  }

  const order = await Order.findOne({
    where: {
      order_id: orderId,
      vendor_id: vendorAccount.vendor_id
    }
  });

  if (!order) {
    throw new NotFoundError('Order not found');
  }

  // Validate status transition
  const allowedStatuses = ['accepted', 'preparing', 'out_for_delivery', 'delivered'];
  if (!allowedStatuses.includes(status)) {
    throw new ValidationError('Invalid order status');
  }

  // Update order
  order.status = status;
  if (notes) order.vendor_notes = notes;
  order.updated_at = new Date();

  await order.save();

  try {
    const io = getIO();
    io.to(`user:${order.buyer_id}`).emit('orders:updated');
    io.to(`vendor:${order.vendor_id}`).emit('orders:updated');
    io.to('admin:orders').emit('orders:updated');
  } catch (socketError) {
    console.log('Socket emit error (vendor updateOrderStatus):', socketError.message);
  }

  res.json({
    success: true,
    message: 'Order status updated successfully',
    data: { order }
  });
});

/**
 * @desc    Get vendor products
 * @route   GET /api/v1/vendor/products
 * @access  Private (Vendor only)
 */
const getVendorProducts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, category, in_stock } = req.query;
  const offset = (page - 1) * limit;

  const vendorAccount = await VendorAccount.findOne({
    where: { user_id: req.user.user_id }
  });

  if (!vendorAccount) {
    throw new NotFoundError('Vendor account not found');
  }

  const vendor = await Vendor.findOne({ where: { user_id: vendorAccount.user_id } });

  if (!vendor) {
    throw new NotFoundError('Vendor profile not found');
  }

  const vendorId = vendor.vendor_id;

  const where = { vendor_id: vendorId };
  if (category) where.category = category;
  if (in_stock !== undefined) where.in_stock = in_stock === 'true';

  const { count, rows: products } = await Product.findAndCountAll({
    where,
    order: [['createdAt', 'DESC']],
    limit: parseInt(limit),
    offset: parseInt(offset)
  });

  res.json({
    success: true,
    data: {
      products,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(count / limit),
        total_records: count,
        per_page: parseInt(limit)
      }
    }
  });
});

/**
 * @desc    Create product
 * @route   POST /api/v1/vendor/products
 * @access  Private (Vendor only)
 */
const createProduct = asyncHandler(async (req, res) => {
  const vendorAccount = await VendorAccount.findOne({
    where: { user_id: req.user.user_id }
  });

  if (!vendorAccount) {
    throw new NotFoundError('Vendor account not found');
  }

  if (!vendorAccount.can_add_products) {
    throw new ForbiddenError('You do not have permission to add products');
  }

  // Handle file uploads for product images
  let uploadedFiles = {};
  if (req.files && Object.keys(req.files).length > 0) {
    uploadedFiles = await uploadFiles(req.files, 'products');
  }

  const {
    name, description, price, category, stock_quantity,
    is_featured
  } = req.body;

  // Enforce per-vendor allowed product categories (if configured)
  const vendor = await Vendor.findOne({ where: { user_id: vendorAccount.user_id } });

  if (!vendor) {
    throw new NotFoundError('Vendor profile not found');
  }

  const limits = vendor.settings && vendor.settings.limits ? vendor.settings.limits : null;
  const allowedCategories = limits && Array.isArray(limits.allowed_categories)
    ? limits.allowed_categories
    : null;

  if (allowedCategories && allowedCategories.length && category && !allowedCategories.includes(category)) {
    throw new ValidationError('This vendor is not allowed to create products in this category');
  }

  const rawStockQuantity = stock_quantity;
  const stockQty =
    rawStockQuantity !== undefined && rawStockQuantity !== null && rawStockQuantity !== ''
      ? parseInt(rawStockQuantity, 10)
      : 0;

  const product = await Product.create({
    vendor_id: vendor.vendor_id,
    name,
    description,
    price,
    category,
    stock_quantity: stockQty,
    main_image: uploadedFiles.main_image ? uploadedFiles.main_image[0] : null,
    gallery_images: uploadedFiles.gallery_images || [],
    is_featured: is_featured || false,
    in_stock: stockQty > 0,
    // New products require admin approval before they go live
    // For now, vendor-created products should appear immediately in the public marketplace
    // so we mark them as active on creation.
    is_active: true,
    metadata: {
      moderation_status: 'PENDING_REVIEW',
      created_by_vendor: true,
      last_change_by_vendor_at: new Date().toISOString(),
    },
  });

  res.status(201).json({
    success: true,
    message: 'Product created successfully',
    data: { product }
  });
});

/**
 * @desc    Update product
 * @route   PUT /api/v1/vendor/products/:productId
 * @access  Private (Vendor only)
 */
const updateProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const vendorAccount = await VendorAccount.findOne({
    where: { user_id: req.user.user_id }
  });

  if (!vendorAccount) {
    throw new NotFoundError('Vendor account not found');
  }

  if (!vendorAccount.can_edit_products) {
    throw new ForbiddenError('You do not have permission to edit products');
  }

  const vendor = await Vendor.findOne({ where: { user_id: vendorAccount.user_id } });

  if (!vendor) {
    throw new NotFoundError('Vendor profile not found');
  }

  const product = await Product.findOne({
    where: {
      product_id: productId,
      vendor_id: vendor.vendor_id
    }
  });

  if (!product) {
    throw new NotFoundError('Product not found');
  }

  // Handle file uploads for product images
  let uploadedFiles = {};
  if (req.files && Object.keys(req.files).length > 0) {
    uploadedFiles = await uploadFiles(req.files, 'products');
  }

  // Update allowed fields
  const allowedFields = [
    'name', 'description', 'price', 'category', 'stock_quantity',
    'images', 'specifications', 'is_featured', 'in_stock'
  ];

  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      product[field] = req.body[field];
    }
  });

  // Enforce per-vendor allowed product categories (if configured) for new category value
  const limits = vendor.settings && vendor.settings.limits ? vendor.settings.limits : null;
  const allowedCategories = limits && Array.isArray(limits.allowed_categories)
    ? limits.allowed_categories
    : null;

  const newCategory = req.body.category || product.category;
  if (allowedCategories && allowedCategories.length && newCategory && !allowedCategories.includes(newCategory)) {
    throw new ValidationError('This vendor is not allowed to have products in this category');
  }

  // Auto-update in_stock based on stock_quantity
  if (req.body.stock_quantity !== undefined) {
    product.in_stock = req.body.stock_quantity > 0;
  }

   // Any vendor update should trigger re-review before the product is considered live
  const metadata = product.metadata || {};
  metadata.moderation_status = 'PENDING_REVIEW';
  metadata.last_change_by_vendor_at = new Date().toISOString();
  product.metadata = metadata;
  product.is_active = false;

  // Update images if new files were uploaded
  if (uploadedFiles.main_image && uploadedFiles.main_image[0]) {
    product.main_image = uploadedFiles.main_image[0];
  }
  if (uploadedFiles.gallery_images && uploadedFiles.gallery_images.length) {
    const existingGallery = Array.isArray(product.gallery_images) ? product.gallery_images : [];
    product.gallery_images = [...existingGallery, ...uploadedFiles.gallery_images];
  }

  await product.save();

  res.json({
    success: true,
    message: 'Product updated successfully',
    data: { product }
  });
});

/**
 * @desc    Update product stock
 * @route   PUT /api/v1/vendor/products/:productId/stock
 * @access  Private (Vendor only)
 */
const updateProductStock = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { stock_quantity, in_stock } = req.body;

  const vendorAccount = await VendorAccount.findOne({
    where: { user_id: req.user.user_id }
  });

  if (!vendorAccount) {
    throw new NotFoundError('Vendor account not found');
  }

  if (!vendorAccount.can_update_stock) {
    throw new ForbiddenError('You do not have permission to update stock');
  }

  const vendor = await Vendor.findOne({ where: { user_id: vendorAccount.user_id } });

  if (!vendor) {
    throw new NotFoundError('Vendor profile not found');
  }

  const product = await Product.findOne({
    where: {
      product_id: productId,
      vendor_id: vendor.vendor_id
    }
  });

  if (!product) {
    throw new NotFoundError('Product not found');
  }

  if (stock_quantity !== undefined) {
    product.stock_quantity = stock_quantity;
    product.in_stock = stock_quantity > 0;
  }

  if (in_stock !== undefined) {
    product.in_stock = in_stock;
  }

  await product.save();

  res.json({
    success: true,
    message: 'Product stock updated successfully',
    data: { product }
  });
});

/**
 * @desc    Change vendor password
 * @route   PUT /api/v1/vendor/change-password
 * @access  Private (Vendor only)
 */
const changePassword = asyncHandler(async (req, res) => {
  const { current_password, new_password } = req.body;

  if (!current_password || !new_password) {
    throw new ValidationError('Current password and new password are required');
  }

  const user = await User.findByPk(req.user.user_id);

  // Verify current password
  const isCurrentPasswordValid = await bcrypt.compare(current_password, user.password);
  if (!isCurrentPasswordValid) {
    throw new ValidationError('Current password is incorrect');
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(new_password, 12);
  
  // Update password
  await user.update({ password: hashedPassword });

  res.json({
    success: true,
    message: 'Password changed successfully'
  });
});

/**
 * @desc    Update vendor profile
 * @route   PUT /api/v1/vendor/profile
 * @access  Private (Vendor only)
 */
const updateVendorProfile = asyncHandler(async (req, res) => {
  const vendorAccount = await VendorAccount.findOne({
    where: { user_id: req.user.user_id }
  });

  if (!vendorAccount) {
    throw new NotFoundError('Vendor account not found');
  }

  if (!vendorAccount.can_edit_profile) {
    throw new ForbiddenError('You do not have permission to edit profile');
  }

  // Update allowed profile fields
  const allowedFields = [
    'contact_person', 'phone_number', 'address', 'description',
    'working_hours', 'delivery_areas'
  ];

  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      vendorAccount[field] = req.body[field];
    }
  });

  await vendorAccount.save();

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: { vendor_account: vendorAccount }
  });
});

module.exports = {
  getVendorDashboard,
  getVendorOrders,
  updateOrderStatus,
  getVendorProducts,
  createProduct,
  updateProduct,
  updateProductStock,
  changePassword,
  updateVendorProfile
};
