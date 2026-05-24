const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Order = sequelize.define('Order', {
  order_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  order_number: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  buyer_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'user_id'
    }
  },
  vendor_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'vendors',
      key: 'vendor_id'
    }
  },
  memorial_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'memorials',
      key: 'memorial_id'
    },
    comment: 'Optional: if order is related to a specific memorial'
  },
  wallet_txn_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'wallet_transactions',
      key: 'txn_id'
    }
  },
  status: {
    type: DataTypes.ENUM(
      'PENDING',
      'CONFIRMED',
      'PREPARING',
      'READY',
      'OUT_FOR_DELIVERY',
      'DELIVERED',
      'CANCELLED',
      'REFUNDED'
    ),
    defaultValue: 'PENDING',
    allowNull: false
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0.01,
      isDecimal: true
    }
  },
  delivery_fee: {
    type: DataTypes.DECIMAL(8, 2),
    defaultValue: 0.00,
    allowNull: false
  },
  platform_fee: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: false
  },
  total_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  vendor_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Amount credited to vendor after platform fee'
  },
  currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'ETB',
    allowNull: false
  },
  delivery_address: {
    type: DataTypes.JSONB,
    allowNull: false,
    comment: 'Full delivery address details'
  },
  delivery_instructions: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  delivery_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  delivery_time_slot: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  customer_notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  vendor_notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  estimated_delivery: {
    type: DataTypes.DATE,
    allowNull: true
  },
  actual_delivery: {
    type: DataTypes.DATE,
    allowNull: true
  },
  tracking_number: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  delivery_person: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Delivery person details'
  },
  payment_method: {
    type: DataTypes.STRING(50),
    defaultValue: 'WALLET',
    allowNull: false
  },
  is_urgent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  urgency_fee: {
    type: DataTypes.DECIMAL(8, 2),
    defaultValue: 0.00,
    allowNull: false
  },
  cancellation_reason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  cancelled_by: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'user_id'
    }
  },
  cancelled_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  refund_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  refunded_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1,
      max: 5
    }
  },
  review: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  reviewed_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  status_history: {
    type: DataTypes.JSONB,
    defaultValue: [],
    allowNull: true,
    comment: 'Array of status changes with timestamps'
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {},
    allowNull: true
  }
}, {
  tableName: 'orders',
  indexes: [
    {
      unique: true,
      fields: ['order_number']
    },
    {
      fields: ['buyer_id']
    },
    {
      fields: ['vendor_id']
    },
    {
      fields: ['memorial_id']
    },
    {
      fields: ['status']
    },
    {
      fields: ['created_at']
    },
    {
      fields: ['delivery_date']
    }
  ]
});

// Hooks
// Generate order number before validation so notNull constraint passes
Order.beforeValidate(async (order, options) => {
  if (!order.order_number) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    order.order_number = `NFS${year}${month}${day}${random}`;
  }
});

// Initialize status history on create
Order.beforeCreate(async (order, options) => {
  order.status_history = [{
    status: order.status,
    timestamp: new Date(),
    note: 'Order created'
  }];
});

// Instance methods
Order.prototype.updateStatus = async function(newStatus, note = '', updatedBy = null) {
  const oldStatus = this.status;
  this.status = newStatus;
  
  // Add to status history
  const statusUpdate = {
    status: newStatus,
    timestamp: new Date(),
    note,
    updated_by: updatedBy,
    previous_status: oldStatus
  };
  
  this.status_history = [...(this.status_history || []), statusUpdate];
  
  // Set specific timestamps based on status
  if (newStatus === 'DELIVERED') {
    this.actual_delivery = new Date();
  } else if (newStatus === 'CANCELLED') {
    this.cancelled_at = new Date();
    this.cancelled_by = updatedBy;
  } else if (newStatus === 'REFUNDED') {
    this.refunded_at = new Date();
  }
  
  await this.save();
  return this;
};

Order.prototype.cancel = async function(reason, cancelledBy) {
  this.cancellation_reason = reason;
  this.cancelled_by = cancelledBy;
  await this.updateStatus('CANCELLED', `Cancelled: ${reason}`, cancelledBy);
  return this;
};

Order.prototype.refund = async function(amount, reason) {
  this.refund_amount = amount;
  await this.updateStatus('REFUNDED', `Refunded: ${reason}`);
  return this;
};

Order.prototype.addReview = async function(rating, review) {
  this.rating = rating;
  this.review = review;
  this.reviewed_at = new Date();
  await this.save();
  return this;
};

Order.prototype.setDeliveryEstimate = async function(estimatedDate) {
  this.estimated_delivery = estimatedDate;
  await this.save();
  return this;
};

Order.prototype.assignDeliveryPerson = async function(deliveryPersonInfo) {
  this.delivery_person = deliveryPersonInfo;
  await this.save();
  return this;
};

Order.prototype.setTrackingNumber = async function(trackingNumber) {
  this.tracking_number = trackingNumber;
  await this.save();
  return this;
};

// Static methods
Order.getUserOrders = async function(userId, status = null, limit = 20, offset = 0) {
  const where = { buyer_id: userId };
  
  if (status) {
    where.status = status;
  }

  return this.findAll({
    where,
    include: [
      {
        model: sequelize.models.Vendor,
        as: 'vendor',
        attributes: ['vendor_id', 'business_name', 'phone']
      },
      {
        model: sequelize.models.OrderItem,
        as: 'items',
        include: [
          {
            model: sequelize.models.Product,
            as: 'product',
            attributes: ['product_id', 'name', 'main_image']
          }
        ]
      }
    ],
    order: [['created_at', 'DESC']],
    limit,
    offset
  });
};

Order.getVendorOrders = async function(vendorId, status = null, limit = 20, offset = 0) {
  const where = { vendor_id: vendorId };
  
  if (status) {
    where.status = status;
  }

  return this.findAll({
    where,
    include: [
      {
        model: sequelize.models.User,
        as: 'buyer',
        attributes: ['user_id', 'name', 'phone']
      },
      {
        model: sequelize.models.OrderItem,
        as: 'items',
        include: [
          {
            model: sequelize.models.Product,
            as: 'product',
            attributes: ['product_id', 'name', 'main_image']
          }
        ]
      }
    ],
    order: [['created_at', 'DESC']],
    limit,
    offset
  });
};

Order.getOrdersByDateRange = async function(startDate, endDate, vendorId = null) {
  const where = {
    created_at: {
      [sequelize.Sequelize.Op.between]: [startDate, endDate]
    }
  };

  if (vendorId) {
    where.vendor_id = vendorId;
  }

  return this.findAll({
    where,
    include: [
      {
        model: sequelize.models.Vendor,
        as: 'vendor',
        attributes: ['vendor_id', 'business_name']
      }
    ],
    order: [['created_at', 'DESC']]
  });
};

Order.getOrderStats = async function(vendorId = null, dateRange = null) {
  const where = {};
  
  if (vendorId) {
    where.vendor_id = vendorId;
  }
  
  if (dateRange) {
    where.created_at = {
      [sequelize.Sequelize.Op.between]: [dateRange.start, dateRange.end]
    };
  }

  const result = await this.findOne({
    where,
    attributes: [
      [sequelize.fn('COUNT', sequelize.col('order_id')), 'total_orders'],
      [sequelize.fn('SUM', sequelize.col('total_amount')), 'total_revenue'],
      [sequelize.fn('AVG', sequelize.col('total_amount')), 'average_order_value'],
      [sequelize.fn('COUNT', sequelize.literal("CASE WHEN status = 'DELIVERED' THEN 1 END")), 'completed_orders'],
      [sequelize.fn('COUNT', sequelize.literal("CASE WHEN status = 'CANCELLED' THEN 1 END")), 'cancelled_orders']
    ]
  });

  return {
    total_orders: parseInt(result?.dataValues?.total_orders || 0),
    total_revenue: parseFloat(result?.dataValues?.total_revenue || 0),
    average_order_value: parseFloat(result?.dataValues?.average_order_value || 0),
    completed_orders: parseInt(result?.dataValues?.completed_orders || 0),
    cancelled_orders: parseInt(result?.dataValues?.cancelled_orders || 0)
  };
};

module.exports = Order;
