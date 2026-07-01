const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const UserStatusHistory = sequelize.define('UserStatusHistory', {
  id: {
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
  changed_by: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'user_id'
    }
  },
  action: {
    type: DataTypes.ENUM('DEACTIVATE', 'REACTIVATE', 'BAN', 'UNBAN'),
    allowNull: false
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  note: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  previous_is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  },
  previous_is_banned: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  },
  new_is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  },
  new_is_banned: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  }
}, {
  tableName: 'user_status_history',
  timestamps: true
});

module.exports = UserStatusHistory;
