const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const GiftTransaction = sequelize.define('GiftTransaction', {
  txn_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  sender_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'users', key: 'user_id' }
  },
  recipient_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'users', key: 'user_id' }
  },
  memorial_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'memorials', key: 'memorial_id' }
  },
  gift_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'gift_catalog', key: 'gift_id' }
  },
  wallet_txn_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'wallet_transactions', key: 'txn_id' }
  },
  amount: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: false,
    validate: { min: 0.01, isDecimal: true }
  },
  platform_fee: {
    type: DataTypes.DECIMAL(8, 2),
    defaultValue: 0.00,
    allowNull: false
  },
  net_amount: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: false,
    comment: 'Amount credited to recipient after platform fee'
  },
  currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'ETB',
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: { len: [0, 500] }
  },
  message_amharic: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: { len: [0, 500] }
  },
  sender_name: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Display name for anonymous gifts'
  },
  is_anonymous: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'),
    defaultValue: 'PENDING',
    allowNull: false
  },
  animation_played: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  animation_played_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  is_featured_on_memorial: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Whether this gift should be prominently displayed'
  },
  visibility: {
    type: DataTypes.ENUM('PUBLIC', 'PRIVATE', 'FAMILY_ONLY'),
    defaultValue: 'PUBLIC',
    allowNull: false
  },
  processed_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  refunded_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  refund_reason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {},
    allowNull: true,
    comment: 'Additional transaction metadata'
  }
}, {
  tableName: 'gift_transactions',
  indexes: [
    { fields: ['sender_id'] },
    { fields: ['recipient_id'] },
    { fields: ['memorial_id'] },
    { fields: ['gift_id'] },
    { fields: ['wallet_txn_id'] },
    { fields: ['status'] },
    { fields: ['visibility'] },
    { fields: ['is_featured_on_memorial'] },
    { fields: ['createdAt'] } // FIXED: real column is camelCase, not 'created_at'
  ]
});

// Instance methods
GiftTransaction.prototype.markCompleted = async function() {
  this.status = 'COMPLETED';
  this.processed_at = new Date();
  await this.save();
  return this;
};

GiftTransaction.prototype.markFailed = async function(reason) {
  this.status = 'FAILED';
  this.processed_at = new Date();
  this.metadata = { ...this.metadata, failure_reason: reason };
  await this.save();
  return this;
};

GiftTransaction.prototype.markRefunded = async function(reason) {
  this.status = 'REFUNDED';
  this.refunded_at = new Date();
  this.refund_reason = reason;
  await this.save();
  return this;
};

GiftTransaction.prototype.playAnimation = async function() {
  this.animation_played = true;
  this.animation_played_at = new Date();
  await this.save({ fields: ['animation_played', 'animation_played_at'] });
  return this;
};

// Static methods
GiftTransaction.getMemorialGifts = async function(memorialId, limit = 50, offset = 0, visibility = 'PUBLIC') {
  const where = { memorial_id: memorialId, status: 'COMPLETED' };
  if (visibility) where.visibility = visibility;

  return this.findAll({
    where,
    include: [
      { model: sequelize.models.User, as: 'sender', attributes: ['user_id', 'name'] },
      { model: sequelize.models.GiftCatalog, as: 'gift', attributes: ['gift_id', 'name', 'animation_type', 'icon_url'] }
    ],
    order: [['createdAt', 'DESC']], // FIXED
    limit,
    offset
  });
};

GiftTransaction.getUserSentGifts = async function(userId, limit = 50, offset = 0) {
  return this.findAll({
    where: { sender_id: userId, status: 'COMPLETED' },
    include: [
      { model: sequelize.models.Memorial, as: 'memorial', attributes: ['memorial_id', 'deceased_name', 'memorial_url'] },
      { model: sequelize.models.GiftCatalog, as: 'gift', attributes: ['gift_id', 'name', 'icon_url'] }
    ],
    order: [['createdAt', 'DESC']], // FIXED
    limit,
    offset
  });
};

GiftTransaction.getUserReceivedGifts = async function(userId, limit = 50, offset = 0) {
  return this.findAll({
    where: { recipient_id: userId, status: 'COMPLETED' },
    include: [
      { model: sequelize.models.User, as: 'sender', attributes: ['user_id', 'name'] },
      { model: sequelize.models.Memorial, as: 'memorial', attributes: ['memorial_id', 'deceased_name', 'memorial_url'] },
      { model: sequelize.models.GiftCatalog, as: 'gift', attributes: ['gift_id', 'name', 'icon_url'] }
    ],
    order: [['createdAt', 'DESC']], // FIXED
    limit,
    offset
  });
};

GiftTransaction.getMemorialStats = async function(memorialId) {
  const result = await this.findOne({
    where: { memorial_id: memorialId, status: 'COMPLETED' },
    attributes: [
      [sequelize.fn('COUNT', sequelize.col('txn_id')), 'total_gifts'],
      [sequelize.fn('SUM', sequelize.col('amount')), 'total_value'],
      [sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('sender_id'))), 'unique_senders']
    ]
  });

  return {
    total_gifts: parseInt(result?.dataValues?.total_gifts || 0),
    total_value: parseFloat(result?.dataValues?.total_value || 0),
    unique_senders: parseInt(result?.dataValues?.unique_senders || 0)
  };
};

module.exports = GiftTransaction;