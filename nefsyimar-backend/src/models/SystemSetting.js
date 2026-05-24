const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SystemSetting = sequelize.define('SystemSetting', {
  setting_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  key: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
  },
  category: {
    type: DataTypes.ENUM('GENERAL', 'FEES', 'FEATURE_FLAG', 'PAYMENT', 'SUPPORT'),
    defaultValue: 'GENERAL',
    allowNull: false,
  },
  value: {
    type: DataTypes.JSONB,
    defaultValue: {},
    allowNull: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  updated_by: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'user_id',
    },
  },
}, {
  tableName: 'system_settings',
  indexes: [
    { fields: ['key'] },
    { fields: ['category'] },
  ],
});

module.exports = SystemSetting;
