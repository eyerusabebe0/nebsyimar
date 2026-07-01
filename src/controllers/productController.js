const { Product, Vendor, User, OrderItem } = require('../models');
const { asyncHandler } = require('../middleware/errorMiddleware');
const { uploadFiles } = require('../utils/fileUpload');

// @desc    Get all products
// @route   GET /api/v1/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 20, 
    category, 
    vendor_id,
    min_price,
    max_price,
    search,
    sort = 'newest',
    in_stock_only = false,
    featured_only = false
  } = req.query;
  
  const offset = (page - 1) * limit;

  const filters = {
    ...(category && { category }),
    ...(vendor_id && { vendor_id }),
    ...(min_price && { min_price: parseFloat(min_price) }),
    ...(max_price && { max_price: parseFloat(max_price) }),
    ...(search && { search }),
    ...(in_stock_only === 'true' && { in_stock_only: true }),
    ...(featured_only === 'true' && { is_featured: true }),
    sort_by: sort
  };

  const products = await Product.getActiveProducts(
    filters,
    parseInt(limit),
    parseInt(offset)
  );

  // Get total count for pagination
  const totalCount = await Product.count({
    where: { is_active: true }
  });

  res.json({
    success: true,
    data: {
      products,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(totalCount / limit),
        total_records: totalCount,
        per_page: parseInt(limit)
      }
    }
  });
});

// @desc    Get product by ID
// @route   GET /api/v1/products/:productId
// @access  Public
const getProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const product = await Product.findByPk(productId, {
    include: [
      {
        model: Vendor,
        as: 'vendor',
        attributes: ['vendor_id', 'business_name', 'rating', 'city', 'phone', 'delivery_fee', 'minimum_order'],
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['user_id', 'name']
          }
        ]
      }
    ]
  });

  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }

  if (!product.is_active) {
    return res.status(404).json({
      success: false,
      message: 'Product is not available'
    });
  }

  // Increment view count
  await product.incrementViewCount();

  // Get related products from same vendor
  const relatedProducts = await Product.findAll({
    where: {
      vendor_id: product.vendor_id,
      product_id: { [require('../config/database').sequelize.Sequelize.Op.ne]: productId },
      is_active: true
    },
    limit: 5,
    order: [['rating', 'DESC']]
  });

  res.json({
    success: true,
    data: {
      product,
      related_products: relatedProducts
    }
  });
});

// @desc    Create new product
// @route   POST /api/v1/products
// @access  Private (Vendor)
const createProduct = asyncHandler(async (req, res) => {
  const {
    name,
    name_amharic,
    description,
    description_amharic,
    category,
    subcategory,
    price,
    stock_quantity,
    track_inventory = true,
    low_stock_threshold = 5,
    weight,
    dimensions,
    is_digital = false,
    requires_customization = false,
    customization_options,
    delivery_time,
    preparation_time,
    tags,
    seo_title,
    seo_description,
    seo_keywords
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

  if (vendor.verification_status !== 'VERIFIED') {
    return res.status(403).json({
      success: false,
      message: 'Vendor must be verified to create products'
    });
  }

  // Handle file uploads
  let uploadedFiles = {};
  if (req.files) {
    uploadedFiles = await uploadFiles(req.files, 'products');
  }

  // Create product
  const product = await Product.create({
    vendor_id: vendor.vendor_id,
    name,
    name_amharic,
    description,
    description_amharic,
    category,
    subcategory,
    price,
    stock_quantity: track_inventory ? (stock_quantity || 0) : 0,
    track_inventory,
    low_stock_threshold,
    weight,
    dimensions,
    main_image: uploadedFiles.main_image?.[0],
    gallery_images: uploadedFiles.gallery_images || [],
    is_digital,
    requires_customization,
    customization_options: customization_options || {},
    delivery_time,
    preparation_time,
    tags: tags || [],
    seo_title,
    seo_description,
    seo_keywords: seo_keywords || [],
    // New products must be reviewed by an administrator before going live
    is_active: false,
    metadata: {
      moderation_status: 'PENDING_REVIEW',
      created_via: 'VENDOR_PORTAL',
      created_by_user_id: req.user.user_id,
      created_at: new Date().toISOString(),
    },
  });

  res.status(201).json({
    success: true,
    message: 'Product created successfully',
    data: {
      product
    }
  });
});

// @desc    Update product
// @route   PUT /api/v1/products/:productId
// @access  Private (Vendor)
const updateProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const {
    name,
    name_amharic,
    description,
    description_amharic,
    price,
    stock_quantity,
    track_inventory,
    low_stock_threshold,
    weight,
    dimensions,
    is_active,
    requires_customization,
    customization_options,
    delivery_time,
    preparation_time,
    tags,
    seo_title,
    seo_description,
    seo_keywords
  } = req.body;

  const product = await Product.findByPk(productId, {
    include: [
      {
        model: Vendor,
        as: 'vendor',
        where: { user_id: req.user.user_id }
      }
    ]
  });

  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found or access denied'
    });
  }

  // Handle file uploads
  let uploadedFiles = {};
  if (req.files) {
    uploadedFiles = await uploadFiles(req.files, 'products');
  }

  // Update product
  const updateData = {
    name: name || product.name,
    name_amharic,
    description,
    description_amharic,
    price: price !== undefined ? price : product.price,
    stock_quantity: stock_quantity !== undefined ? stock_quantity : product.stock_quantity,
    track_inventory: track_inventory !== undefined ? track_inventory : product.track_inventory,
    low_stock_threshold: low_stock_threshold !== undefined ? low_stock_threshold : product.low_stock_threshold,
    weight,
    dimensions,
    // Core product details changed by vendor; require re-review by admin
    // Product will be taken offline until approved again.
    is_active: false,
    requires_customization: requires_customization !== undefined ? requires_customization : product.requires_customization,
    customization_options: customization_options || product.customization_options,
    delivery_time,
    preparation_time,
    tags: tags || product.tags,
    seo_title,
    seo_description,
    seo_keywords: seo_keywords || product.seo_keywords
  };

  // Update images if uploaded
  if (uploadedFiles.main_image) {
    updateData.main_image = uploadedFiles.main_image[0];
  }
  if (uploadedFiles.gallery_images) {
    updateData.gallery_images = [...product.gallery_images, ...uploadedFiles.gallery_images];
  }

  // Mark updated product as pending review
  const metadata = product.metadata || {};
  metadata.moderation_status = 'PENDING_REVIEW';
  metadata.last_vendor_update_at = new Date().toISOString();
  metadata.last_vendor_update_by = req.user.user_id;
  updateData.metadata = metadata;

  await product.update(updateData);

  res.json({
    success: true,
    message: 'Product updated successfully',
    data: {
      product
    }
  });
});

// @desc    Delete product
// @route   DELETE /api/v1/products/:productId
// @access  Private (Vendor)
const deleteProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const product = await Product.findByPk(productId, {
    include: [
      {
        model: Vendor,
        as: 'vendor',
        where: { user_id: req.user.user_id }
      }
    ]
  });

  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found or access denied'
    });
  }

  // Soft delete by setting is_active to false
  await product.update({ is_active: false });

  res.json({
    success: true,
    message: 'Product deleted successfully'
  });
});

// @desc    Get vendor's products
// @route   GET /api/v1/products/my-products
// @access  Private (Vendor)
const getMyProducts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status = 'active' } = req.query;
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

  const where = { vendor_id: vendor.vendor_id };
  
  if (status === 'active') {
    where.is_active = true;
  } else if (status === 'inactive') {
    where.is_active = false;
  }

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

// @desc    Update product stock
// @route   PATCH /api/v1/products/:productId/stock
// @access  Private (Vendor)
const updateProductStock = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { quantity, operation = 'set' } = req.body; // operation: 'add', 'subtract', 'set'

  const product = await Product.findByPk(productId, {
    include: [
      {
        model: Vendor,
        as: 'vendor',
        where: { user_id: req.user.user_id }
      }
    ]
  });

  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found or access denied'
    });
  }

  if (!product.track_inventory) {
    return res.status(400).json({
      success: false,
      message: 'This product does not track inventory'
    });
  }

  await product.updateStock(quantity, operation);

  res.json({
    success: true,
    message: 'Stock updated successfully',
    data: {
      product: {
        product_id: product.product_id,
        name: product.name,
        stock_quantity: product.stock_quantity,
        is_low_stock: product.isLowStock()
      }
    }
  });
});

// @desc    Get featured products
// @route   GET /api/v1/products/featured
// @access  Public
const getFeaturedProducts = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;

  const products = await Product.getFeaturedProducts(parseInt(limit));

  res.json({
    success: true,
    data: {
      products
    }
  });
});

// @desc    Get popular products
// @route   GET /api/v1/products/popular
// @access  Public
const getPopularProducts = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;

  const products = await Product.getPopularProducts(parseInt(limit));

  res.json({
    success: true,
    data: {
      products
    }
  });
});

// @desc    Search products
// @route   GET /api/v1/products/search
// @access  Public
const searchProducts = asyncHandler(async (req, res) => {
  const { q, page = 1, limit = 20, category, min_price, max_price } = req.query;

  if (!q || q.trim().length < 2) {
    return res.status(400).json({
      success: false,
      message: 'Search query must be at least 2 characters long'
    });
  }

  const offset = (page - 1) * limit;

  const filters = {
    search: q,
    ...(category && { category }),
    ...(min_price && { min_price: parseFloat(min_price) }),
    ...(max_price && { max_price: parseFloat(max_price) }),
    sort_by: 'relevance'
  };

  const products = await Product.getActiveProducts(
    filters,
    parseInt(limit),
    parseInt(offset)
  );

  // Get total count for search results
  const searchWhere = {
    is_active: true,
    [require('../config/database').sequelize.Sequelize.Op.or]: [
      { name: { [require('../config/database').sequelize.Sequelize.Op.iLike]: `%${q}%` } },
      { name_amharic: { [require('../config/database').sequelize.Sequelize.Op.iLike]: `%${q}%` } },
      { description: { [require('../config/database').sequelize.Sequelize.Op.iLike]: `%${q}%` } }
    ]
  };

  if (category) searchWhere.category = category;

  const totalCount = await Product.count({ where: searchWhere });

  res.json({
    success: true,
    data: {
      products,
      search_query: q,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(totalCount / limit),
        total_records: totalCount,
        per_page: parseInt(limit)
      }
    }
  });
});

// @desc    Get products by category
// @route   GET /api/v1/products/category/:category
// @access  Public
const getProductsByCategory = asyncHandler(async (req, res) => {
  const { category } = req.params;
  const { page = 1, limit = 20, sort = 'newest' } = req.query;
  const offset = (page - 1) * limit;

  const filters = {
    category: category.toUpperCase(),
    sort_by: sort
  };

  const products = await Product.getActiveProducts(
    filters,
    parseInt(limit),
    parseInt(offset)
  );

  const totalCount = await Product.count({
    where: {
      category: category.toUpperCase(),
      is_active: true
    }
  });

  res.json({
    success: true,
    data: {
      category,
      products,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(totalCount / limit),
        total_records: totalCount,
        per_page: parseInt(limit)
      }
    }
  });
});

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getMyProducts,
  updateProductStock,
  getFeaturedProducts,
  getPopularProducts,
  searchProducts,
  getProductsByCategory
};
