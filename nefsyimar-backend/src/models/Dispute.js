const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Dispute = sequelize.define('Dispute', {
  dispute_id: {
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
  raised_by: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'user_id'
    }
  },
  against_party: {
    type: DataTypes.ENUM('VENDOR', 'BUYER', 'PLATFORM'),
    defaultValue: 'VENDOR',
    allowNull: false
  },
  category: {
    type: DataTypes.ENUM('QUALITY', 'LATE_DELIVERY', 'NON_DELIVERY', 'WRONG_ITEM', 'OTHER'),
    defaultValue: 'OTHER',
    allowNull: false
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('OPEN', 'IN_REVIEW', 'RESOLVED', 'REJECTED', 'CANCELLED'),
    defaultValue: 'OPEN',
    allowNull: false
  },
  resolution: {
    type: DataTypes.ENUM('NO_REFUND', 'PARTIAL_REFUND', 'FULL_REFUND', 'NON_MONETARY', 'OTHER'),
    allowNull: true
  },
  requested_refund_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  approved_refund_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'ETB',
    allowNull: false
  },
  assigned_to: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'user_id'
    }
  },
  closed_by: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'user_id'
    }
  },
  closed_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  admin_notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {},
    allowNull: true
  }
}, {
  tableName: 'disputes',
  indexes: [
    { fields: ['order_id'] },
    { fields: ['status'] },
    { fields: ['assigned_to'] }
  ]
});

module.exports = Dispute;
