const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Appeal = sequelize.define('Appeal', {
  appeal_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'user_id',
    },
  },
  target_type: {
    type: DataTypes.ENUM('MEMORIAL', 'COMMENT', 'USER', 'DISPUTE', 'ORDER', 'OTHER'),
    allowNull: false,
  },
  target_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  related_report_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'reports',
      key: 'report_id',
    },
  },
  related_dispute_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'disputes',
      key: 'dispute_id',
    },
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'CANCELLED'),
    defaultValue: 'PENDING',
    allowNull: false,
  },
  decision: {
    type: DataTypes.ENUM('UPHELD', 'OVERTURNED', 'PARTIALLY_OVERTURNED', 'OTHER'),
    allowNull: true,
  },
  resolution_notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  assigned_to: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'user_id',
    },
  },
  decided_by: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'user_id',
    },
  },
  decided_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {},
    allowNull: true,
  },
}, {
  tableName: 'appeals',
  indexes: [
    { fields: ['user_id'] },
    { fields: ['status'] },
    { fields: ['target_type', 'target_id'] },
    { fields: ['assigned_to'] },
  ],
});

module.exports = Appeal;
