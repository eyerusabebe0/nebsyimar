const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AdminActionLog = sequelize.define('AdminActionLog', {
  log_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  admin_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'user_id',
    },
  },
  action: {
    type: DataTypes.ENUM(
      'WALLET_FREEZE',
      'WALLET_UNFREEZE',
      'VENDOR_VERIFY',
      'VENDOR_REJECT',
      'ORDER_CANCEL',
      'SETTINGS_UPDATE',
      'USER_DEACTIVATE',
      'USER_REACTIVATE',
      'USER_BAN',
      'USER_UNBAN',
      'USER_DATA_EXPORT',
      'USER_ANONYMIZE',
      'USER_IMPERSONATE'
    ),
    allowNull: false,
  },
  target_type: {
    type: DataTypes.ENUM('USER', 'VENDOR', 'ORDER', 'WALLET', 'SYSTEM', 'OTHER'),
    defaultValue: 'OTHER',
    allowNull: false,
  },
  target_id: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  target_label: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {},
    allowNull: true,
  },
  ip_address: {
    type: DataTypes.STRING(45),
    allowNull: true,
  },
  user_agent: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'admin_action_logs',
  indexes: [
    { fields: ['admin_id'] },
    { fields: ['action'] },
    { fields: ['target_type'] },
    { fields: ['created_at'] },
  ],
});

module.exports = AdminActionLog;
