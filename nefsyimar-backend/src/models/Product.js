const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Product = sequelize.define('Product', {
  product_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  vendor_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'vendors',
      key: 'vendor_id'
    }
  },
  name: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 200]
    }
  },
  name_amharic: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  description_amharic: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  category: {
    type: DataTypes.ENUM(
      'FLOWERS',
      'COFFINS',
      'FOOD_CATERING',
      'PHOTOGRAPHY',
      'VIDEOGRAPHY',
      'TRANSPORT',
      'MEMORIAL_ITEMS',
      'CLOTHING',
      'MUSIC',
      'RELIGIOUS_ITEMS',
      'DECORATIONS',
      'OTHER'
    ),
    allowNull: false
  },
  subcategory: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0.01,
      isDecimal: true
    }
  },
  currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'ETB',
    allowNull: false
  },
  stock_quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false,
    validate: {
      min: 0
    }
  },
  track_inventory: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  low_stock_threshold: {
    type: DataTypes.INTEGER,
    defaultValue: 5,
    allowNull: false
  },
  sku: {
    type: DataTypes.STRING(100),
    allowNull: true,
    unique: true
  },
  barcode: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  weight: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: true,
    comment: 'Weight in kg'
  },
  dimensions: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Length, width, height in cm'
  },
  main_image: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  gallery_images: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
    allowNull: true
  },
  is_featured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  is_digital: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'For digital services like photography sessions'
  },
  requires_customization: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  customization_options: {
    type: DataTypes.JSONB,
    defaultValue: {},
    allowNull: true
  },
  delivery_time: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Delivery time in hours'
  },
  preparation_time: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Preparation time in hours'
  },
  rating: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0.00,
    allowNull: false,
    validate: {
      min: 0,
      max: 5
    }
  },
  total_reviews: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false
  },
  total_sold: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false
  },
  total_revenue: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00,
    allowNull: false
  },
  view_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false
  },
  tags: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
    allowNull: true
  },
  seo_title: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  seo_description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  seo_keywords: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {},
    allowNull: true
  }
}, {
  tableName: 'products',
  indexes: [
    {
      fields: ['vendor_id']
    },
    {
      fields: ['category']
    },
    {
      fields: ['is_active']
    },
    {
      fields: ['is_featured']
    },
    {
      fields: ['price']
    },
    {
      fields: ['rating']
    },
    {
      fields: ['total_sold']
    },
    {
      unique: true,
      fields: ['sku'],
      where: {
        sku: {
          [sequelize.Sequelize.Op.ne]: null
        }
      }
    }
  ]
});

// Hooks
Product.beforeCreate(async (product, options) => {
  // Generate SKU if not provided
  if (!product.sku) {
    const prefix = product.category.substring(0, 3).toUpperCase();
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    product.sku = `${prefix}-${timestamp}-${random}`;
  }

  // Calculate discount percentage if discount price is provided
  if (product.discount_price && !product.discount_percentage) {
    product.discount_percentage = ((product.price - product.discount_price) / product.price) * 100;
  }
});

// Instance methods
Product.prototype.incrementViewCount = async function() {
  this.view_count += 1;
  await this.save({ fields: ['view_count'] });
  return this;
};

Product.prototype.updateRating = async function(newRating) {
  const totalRating = (this.rating * this.total_reviews) + newRating;
  this.total_reviews += 1;
  this.rating = totalRating / this.total_reviews;
  await this.save();
  return this;
};

Product.prototype.recordSale = async function(quantity, salePrice) {
  this.total_sold += quantity;
  this.total_revenue = parseFloat(this.total_revenue) + parseFloat(salePrice);
  
  if (this.track_inventory) {
    this.stock_quantity = Math.max(0, this.stock_quantity - quantity);
  }
  
  await this.save();
  return this;
};

Product.prototype.updateStock = async function(quantity, operation = 'add') {
  if (!this.track_inventory) {
    return this;
  }

  if (operation === 'add') {
    this.stock_quantity += quantity;
  } else if (operation === 'subtract') {
    this.stock_quantity = Math.max(0, this.stock_quantity - quantity);
  } else if (operation === 'set') {
    this.stock_quantity = quantity;
  }

  await this.save({ fields: ['stock_quantity'] });
  return this;
};

Product.prototype.isInStock = function(requestedQuantity = 1) {
  if (!this.track_inventory) {
    return true;
  }
  return this.stock_quantity >= requestedQuantity;
};

Product.prototype.isLowStock = function() {
  if (!this.track_inventory) {
    return false;
  }
  return this.stock_quantity <= this.low_stock_threshold;
};

Product.prototype.getEffectivePrice = function() {
  return this.price;
};

// Static methods
Product.getActiveProducts = async function(filters = {}, limit = 20, offset = 0) {
  const where = {
    is_active: true
  };

  if (filters.vendor_id) {
    where.vendor_id = filters.vendor_id;
  }

  if (filters.category) {
    where.category = filters.category;
  }

  if (filters.min_price || filters.max_price) {
    where.price = {};
    if (filters.min_price) {
      where.price[sequelize.Sequelize.Op.gte] = filters.min_price;
    }
    if (filters.max_price) {
      where.price[sequelize.Sequelize.Op.lte] = filters.max_price;
    }
  }

  if (filters.search) {
    where[sequelize.Sequelize.Op.or] = [
      { name: { [sequelize.Sequelize.Op.iLike]: `%${filters.search}%` } },
      { name_amharic: { [sequelize.Sequelize.Op.iLike]: `%${filters.search}%` } },
      { description: { [sequelize.Sequelize.Op.iLike]: `%${filters.search}%` } }
    ];
  }

  if (filters.in_stock_only) {
    where[sequelize.Sequelize.Op.or] = [
      { track_inventory: false },
      { stock_quantity: { [sequelize.Sequelize.Op.gt]: 0 } }
    ];
  }

  const orderBy = [];
  if (filters.sort_by === 'price_low') {
    orderBy.push(['price', 'ASC']);
  } else if (filters.sort_by === 'price_high') {
    orderBy.push(['price', 'DESC']);
  } else if (filters.sort_by === 'rating') {
    orderBy.push(['rating', 'DESC']);
  } else if (filters.sort_by === 'popular') {
    orderBy.push(['total_sold', 'DESC']);
  } else {
    orderBy.push(['is_featured', 'DESC'], ['createdAt', 'DESC']);
  }

  return this.findAll({
    where,
    include: [
      {
        model: sequelize.models.Vendor,
        as: 'vendor',
        attributes: ['vendor_id', 'business_name', 'rating', 'city']
      }
    ],
    order: orderBy,
    limit,
    offset
  });
};

Product.getFeaturedProducts = async function(limit = 10) {
  return this.findAll({
    where: {
      is_featured: true,
      is_active: true
    },
    include: [
      {
        model: sequelize.models.Vendor,
        as: 'vendor',
        attributes: ['vendor_id', 'business_name', 'rating']
      }
    ],
    order: [['rating', 'DESC']],
    limit
  });
};

Product.getPopularProducts = async function(limit = 10) {
  return this.findAll({
    where: {
      is_active: true
    },
    order: [['total_sold', 'DESC']],
    limit
  });
};

module.exports = Product;
