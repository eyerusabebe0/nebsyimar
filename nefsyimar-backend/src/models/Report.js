const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Report = sequelize.define('Report', {
  report_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  reporter_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'user_id',
    },
  },
  reported_user_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'user_id',
    },
  },
  memorial_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'memorials',
      key: 'memorial_id',
    },
  },
  comment_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'memorial_comments',
      key: 'comment_id',
    },
  },
  target_type: {
    type: DataTypes.ENUM('MEMORIAL', 'COMMENT', 'USER', 'GIFT', 'OTHER'),
    allowNull: false,
  },
  target_id: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  category: {
    type: DataTypes.ENUM('ABUSE', 'SPAM', 'INAPPROPRIATE', 'ILLEGAL', 'OTHER'),
    allowNull: false,
    defaultValue: 'OTHER',
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('OPEN', 'IN_REVIEW', 'RESOLVED', 'REJECTED'),
    allowNull: false,
    defaultValue: 'OPEN',
  },
  severity: {
    type: DataTypes.ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'),
    allowNull: false,
    defaultValue: 'LOW',
  },
  resolution: {
    type: DataTypes.ENUM('NO_ACTION', 'CONTENT_HIDDEN', 'CONTENT_DELETED', 'USER_WARNED', 'USER_BANNED', 'OTHER'),
    allowNull: true,
  },
  resolved_by: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'user_id',
    },
  },
  resolved_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  admin_notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {},
  },
}, {
  tableName: 'reports',
  indexes: [
    { fields: ['status'] },
    { fields: ['severity'] },
    { fields: ['target_type'] },
    { fields: ['memorial_id'] },
    { fields: ['comment_id'] },
    { fields: ['created_at'] },
  ],
});

module.exports = Report;
