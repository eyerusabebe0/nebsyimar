const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const MemorialCommentLike = sequelize.define('MemorialCommentLike', {
  like_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  comment_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'memorial_comments',
      key: 'comment_id',
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
}, {
  tableName: 'memorial_comment_likes',
  indexes: [
    {
      unique: true,
      fields: ['comment_id', 'user_id'],
    },
    {
      fields: ['user_id'],
    },
  ],
});

module.exports = MemorialCommentLike;
