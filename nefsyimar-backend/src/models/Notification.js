const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Notification = sequelize.define('Notification', {
  notification_id: {
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
    }
  },
  type: {
    type: DataTypes.ENUM(
      'GIFT_RECEIVED',
      'MEMORIAL_CREATED',
      'ORDER_STATUS_UPDATE',
      'PAYMENT_RECEIVED',
      'VENDOR_VERIFIED',
      'SYSTEM_ANNOUNCEMENT',
      'MEMORIAL_UPDATE'
    ),
    allowNull: false
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  data: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Additional data related to the notification'
  },
  is_read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  read_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  priority: {
    type: DataTypes.ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT'),
    defaultValue: 'MEDIUM'
  },
  action_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'URL to navigate when notification is clicked'
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'When the notification should be automatically removed'
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'notifications',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['user_id', 'is_read']
    },
    {
      fields: ['type']
    },
    {
      fields: ['created_at']
    },
    {
      fields: ['expires_at']
    }
  ]
});

module.exports = Notification;
