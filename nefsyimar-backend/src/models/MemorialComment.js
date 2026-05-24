const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const MemorialComment = sequelize.define('MemorialComment', {
  comment_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  memorial_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'memorials',
      key: 'memorial_id',
    },
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'user_id',
    },
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      len: [1, 1000],
    },
  },
  likes_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false,
  },
  visibility: {
    type: DataTypes.ENUM('PUBLIC', 'PRIVATE', 'FAMILY_ONLY', 'PENDING', 'REJECTED'),
    defaultValue: 'PUBLIC',
    allowNull: false,
  },
  is_deleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  deleted_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  deleted_by: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'user_id',
    },
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {},
    allowNull: true,
  },
}, {
  tableName: 'memorial_comments',
  indexes: [
    {
      fields: ['memorial_id'],
    },
    {
      fields: ['user_id'],
    },
    {
      fields: ['visibility'],
    },
    {
      fields: ['is_deleted'],
    },
    {
      fields: ['created_at'],
    },
  ],
});

module.exports = MemorialComment;
