const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Vendor = sequelize.define('Vendor', {
  vendor_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'user_id'
    },
    unique: true
  },
  business_name: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 200]
    }
  },
  business_name_amharic: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  business_description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  business_description_amharic: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  service_type: {
    type: DataTypes.ENUM(
      'FLORIST',
      'COFFIN_MAKER',
      'CATERER',
      'PHOTOGRAPHER',
      'VIDEOGRAPHER',
      'FUNERAL_HOME',
      'TRANSPORT',
      'RELIGIOUS_SERVICES',
      'MEMORIAL_ITEMS',
      'CLOTHING',
      'MUSIC',
      'OTHER'
    ),
    allowNull: false
  },
  business_license: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  tax_id: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  verification_status: {
    type: DataTypes.ENUM('PENDING', 'VERIFIED', 'REJECTED', 'SUSPENDED'),
    defaultValue: 'PENDING',
    allowNull: false
  },
  verification_documents: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
    allowNull: true
  },
  verified_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  verified_by: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'user_id'
    }
  },
  rejection_reason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  business_address: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  city: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  region: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  country: {
    type: DataTypes.STRING(100),
    defaultValue: 'Ethiopia'
  },
  postal_code: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      is: /^[\+]?[1-9][\d]{0,15}$/
    }
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: true,
    validate: {
      isEmail: true
    }
  },
  website: {
    type: DataTypes.STRING(255),
    allowNull: true,
    validate: {
      isUrl: true
    }
  },
  logo_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  cover_image_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  gallery_images: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
    allowNull: true
  },
  operating_hours: {
    type: DataTypes.JSONB,
    defaultValue: {
      monday: { open: '08:00', close: '18:00', closed: false },
      tuesday: { open: '08:00', close: '18:00', closed: false },
      wednesday: { open: '08:00', close: '18:00', closed: false },
      thursday: { open: '08:00', close: '18:00', closed: false },
      friday: { open: '08:00', close: '18:00', closed: false },
      saturday: { open: '08:00', close: '18:00', closed: false },
      sunday: { open: '08:00', close: '18:00', closed: true }
    }
  },
  delivery_areas: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
    allowNull: true
  },
  delivery_fee: {
    type: DataTypes.DECIMAL(8, 2),
    defaultValue: 0.00,
    allowNull: false
  },
  minimum_order: {
    type: DataTypes.DECIMAL(8, 2),
    defaultValue: 0.00,
    allowNull: false
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
  total_orders: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false
  },
  total_revenue: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00,
    allowNull: false
  },
  commission_rate: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 5.00,
    allowNull: false,
    comment: 'Platform commission percentage'
  },
  subscription_plan: {
    type: DataTypes.ENUM('BASIC', 'PREMIUM', 'ENTERPRISE'),
    defaultValue: 'BASIC',
    allowNull: false
  },
  subscription_expires_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  is_featured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  featured_until: {
    type: DataTypes.DATE,
    allowNull: true
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  suspended_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  suspended_by: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'user_id'
    }
  },
  suspension_reason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  settings: {
    type: DataTypes.JSONB,
    defaultValue: {
      auto_accept_orders: false,
      notification_preferences: {
        new_orders: true,
        order_updates: true,
        reviews: true,
        promotions: false
      }
    }
  }
}, {
  tableName: 'vendors',
  indexes: [
    {
      unique: true,
      fields: ['user_id']
    },
    {
      fields: ['verification_status']
    },
    {
      fields: ['service_type']
    },
    {
      fields: ['city']
    },
    {
      fields: ['is_active']
    },
    {
      fields: ['is_featured']
    },
    {
      fields: ['rating']
    }
  ]
});

// Instance methods
Vendor.prototype.verify = async function(verifiedBy) {
  this.verification_status = 'VERIFIED';
  this.verified_at = new Date();
  this.verified_by = verifiedBy;
  await this.save();
  return this;
};

Vendor.prototype.reject = async function(reason, rejectedBy) {
  this.verification_status = 'REJECTED';
  this.rejection_reason = reason;
  this.verified_by = rejectedBy;
  await this.save();
  return this;
};

Vendor.prototype.suspend = async function(reason, suspendedBy) {
  this.verification_status = 'SUSPENDED';
  this.suspended_at = new Date();
  this.suspended_by = suspendedBy;
  this.suspension_reason = reason;
  this.is_active = false;
  await this.save();
  return this;
};

Vendor.prototype.reactivate = async function() {
  this.verification_status = 'VERIFIED';
  this.suspended_at = null;
  this.suspended_by = null;
  this.suspension_reason = null;
  this.is_active = true;
  await this.save();
  return this;
};

Vendor.prototype.updateRating = async function(newRating) {
  const totalRating = (this.rating * this.total_reviews) + newRating;
  this.total_reviews += 1;
  this.rating = totalRating / this.total_reviews;
  await this.save();
  return this;
};

Vendor.prototype.addOrder = async function(orderValue) {
  this.total_orders += 1;
  this.total_revenue = parseFloat(this.total_revenue) + parseFloat(orderValue);
  await this.save();
  return this;
};

// Static methods
Vendor.getVerifiedVendors = async function(serviceType = null, city = null, limit = 20, offset = 0) {
  const where = {
    verification_status: 'VERIFIED',
    is_active: true
  };

  if (serviceType) {
    where.service_type = serviceType;
  }

  if (city) {
    where.city = city;
  }

  return this.findAll({
    where,
    order: [
      ['is_featured', 'DESC'],
      ['rating', 'DESC'],
      ['total_orders', 'DESC']
    ],
    limit,
    offset
  });
};

Vendor.getFeaturedVendors = async function(limit = 10) {
  return this.findAll({
    where: {
      is_featured: true,
      verification_status: 'VERIFIED',
      is_active: true,
      featured_until: {
        [sequelize.Sequelize.Op.gt]: new Date()
      }
    },
    order: [['rating', 'DESC']],
    limit
  });
};

module.exports = Vendor;
