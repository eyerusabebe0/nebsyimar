const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const OrderItem = sequelize.define('OrderItem', {
  item_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  order_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'orders',
      key: 'order_id'
    }
  },
  product_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'products',
      key: 'product_id'
    }
  },
  product_name: {
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: 'Snapshot of product name at time of order'
  },
  product_description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Snapshot of product description at time of order'
  },
  product_image: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'Snapshot of product main image at time of order'
  },
  unit_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0.01,
      isDecimal: true
    },
    comment: 'Price per unit at time of order'
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1
    }
  },
  total_price: {
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
  customization_details: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Custom options selected for this item'
  },
  special_instructions: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  item_status: {
    type: DataTypes.ENUM(
      'PENDING',
      'CONFIRMED',
      'PREPARING',
      'READY',
      'DELIVERED',
      'CANCELLED',
      'REFUNDED'
    ),
    defaultValue: 'PENDING',
    allowNull: false
  },
  preparation_time: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Estimated preparation time in hours'
  },
  actual_preparation_time: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Actual preparation time in hours'
  },
  is_gift: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  gift_message: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  gift_recipient: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Gift recipient details if different from buyer'
  },
  refund_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  refund_reason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  refunded_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {},
    allowNull: true
  }
}, {
  tableName: 'order_items',
  indexes: [
    {
      fields: ['order_id']
    },
    {
      fields: ['product_id']
    },
    {
      fields: ['item_status']
    }
  ]
});

// Hooks
OrderItem.beforeSave(async (orderItem, options) => {
  // Calculate total price
  orderItem.total_price = parseFloat(orderItem.unit_price) * parseInt(orderItem.quantity);
});

// Instance methods
OrderItem.prototype.updateStatus = async function(newStatus, note = '') {
  this.item_status = newStatus;
  
  if (newStatus === 'REFUNDED') {
    this.refunded_at = new Date();
  }
  
  // Update metadata with status change
  this.metadata = {
    ...this.metadata,
    status_history: [
      ...(this.metadata.status_history || []),
      {
        status: newStatus,
        timestamp: new Date(),
        note
      }
    ]
  };
  
  await this.save();
  return this;
};


OrderItem.prototype.refund = async function(amount, reason) {
  this.refund_amount = amount;
  this.refund_reason = reason;
  await this.updateStatus('REFUNDED', `Refunded: ${reason}`);
  return this;
};

OrderItem.prototype.setPreparationTime = async function(hours) {
  this.actual_preparation_time = hours;
  await this.save();
  return this;
};

// Static methods
OrderItem.getOrderItems = async function(orderId) {
  return this.findAll({
    where: { order_id: orderId },
    include: [
      {
        model: sequelize.models.Product,
        as: 'product',
        attributes: ['product_id', 'name', 'main_image', 'is_active']
      }
    ],
    order: [['createdAt', 'ASC']]
  });
};

OrderItem.getProductOrderHistory = async function(productId, limit = 50) {
  return this.findAll({
    where: { product_id: productId },
    include: [
      {
        model: sequelize.models.Order,
        as: 'order',
        attributes: ['order_id', 'order_number', 'status', 'createdAt'],
        include: [
          {
            model: sequelize.models.User,
            as: 'buyer',
            attributes: ['user_id', 'name']
          }
        ]
      }
    ],
    order: [['createdAt', 'DESC']],
    limit
  });
};

OrderItem.getItemsByStatus = async function(status, vendorId = null) {
  const where = { item_status: status };
  
  const include = [
    {
      model: sequelize.models.Order,
      as: 'order',
      attributes: ['order_id', 'order_number', 'buyer_id', 'vendor_id', 'delivery_address'],
      include: [
        {
          model: sequelize.models.User,
          as: 'buyer',
          attributes: ['user_id', 'name', 'phone']
        }
      ]
    },
    {
      model: sequelize.models.Product,
      as: 'product',
      attributes: ['product_id', 'name', 'main_image']
    }
  ];
  
  if (vendorId) {
    include[0].where = { vendor_id: vendorId };
  }

  return this.findAll({
    where,
    include,
    order: [['createdAt', 'ASC']]
  });
};

OrderItem.getPopularProducts = async function(vendorId = null, limit = 10, dateRange = null) {
  const where = {
    item_status: 'DELIVERED'
  };
  
  if (dateRange) {
    where.createdAt = {
      [sequelize.Sequelize.Op.between]: [dateRange.start, dateRange.end]
    };
  }

  const include = [
    {
      model: sequelize.models.Product,
      as: 'product',
      attributes: ['product_id', 'name', 'main_image', 'category']
    }
  ];

  if (vendorId) {
    include.push({
      model: sequelize.models.Order,
      as: 'order',
      attributes: [],
      where: { vendor_id: vendorId }
    });
  }

  return this.findAll({
    where,
    include,
    attributes: [
      [sequelize.col('OrderItem.product_id'), 'product_id'],
      [sequelize.fn('COUNT', sequelize.col('item_id')), 'order_count'],
      [sequelize.fn('SUM', sequelize.col('quantity')), 'total_quantity'],
      [sequelize.fn('SUM', sequelize.col('total_price')), 'total_revenue']
    ],
    group: ['OrderItem.product_id', 'product.product_id'],
    order: [[sequelize.fn('COUNT', sequelize.col('item_id')), 'DESC']],
    limit
  });
};

module.exports = OrderItem;
