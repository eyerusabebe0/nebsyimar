const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const VendorAccount = sequelize.define('VendorAccount', {
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
  vendor_name: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 200]
    }
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
  contact_person: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  phone_number: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      is: /^[\+]?[1-9][\d]{0,15}$/
    }
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  business_license_no: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  logo_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  working_hours: {
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
  // Permissions
  can_add_products: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  can_edit_products: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  can_manage_orders: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  can_update_stock: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  can_edit_profile: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  // Status
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  created_by: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'user_id'
    }
  },
  last_login: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'admin_vendors',
  indexes: [
    {
      unique: true,
      fields: ['user_id']
    },
    {
      fields: ['service_type']
    },
    {
      fields: ['is_active']
    },
    {
      fields: ['created_by']
    }
  ]
});

// Instance methods
VendorAccount.prototype.updatePermissions = async function(permissions) {
  Object.assign(this, permissions);
  await this.save();
  return this;
};

VendorAccount.prototype.activate = async function() {
  this.is_active = true;
  await this.save();
  return this;
};

VendorAccount.prototype.deactivate = async function() {
  this.is_active = false;
  await this.save();
  return this;
};

VendorAccount.prototype.updateLastLogin = async function() {
  this.last_login = new Date();
  await this.save();
  return this;
};

module.exports = VendorAccount;
