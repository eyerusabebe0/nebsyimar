const { sequelize } = require('../config/database');

// Import all models
const User = require('./User');
const Wallet = require('./Wallet');
const WalletTransaction = require('./WalletTransaction');
const Memorial = require('./Memorial');
const GiftCatalog = require('./GiftCatalog');
const GiftTransaction = require('./GiftTransaction');
const MemorialComment = require('./MemorialComment');
const MemorialCommentLike = require('./MemorialCommentLike');
const Vendor = require('./Vendor');
const VendorAccount = require('./VendorAccount');
const Product = require('./Product');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const Notification = require('./Notification');
const UserStatusHistory = require('./UserStatusHistory');
const Report = require('./Report');
const Dispute = require('./Dispute');
const Appeal = require('./Appeal');
const FeeConfig = require('./FeeConfig');
const SystemSetting = require('./SystemSetting');
const AdminActionLog = require('./AdminActionLog');

// Define associations

// User associations
User.hasOne(Wallet, { 
  foreignKey: 'user_id', 
  as: 'wallet',
  onDelete: 'CASCADE'
});

User.hasMany(WalletTransaction, { 
  foreignKey: 'user_id', 
  as: 'transactions',
  onDelete: 'CASCADE'
});

User.hasMany(Memorial, { 
  foreignKey: 'user_id', 
  as: 'memorials',
  onDelete: 'CASCADE'
});

User.hasMany(GiftTransaction, { 
  foreignKey: 'sender_id', 
  as: 'sent_gifts',
  onDelete: 'CASCADE'
});

User.hasMany(GiftTransaction, { 
  foreignKey: 'recipient_id', 
  as: 'received_gifts',
  onDelete: 'CASCADE'
});

User.hasOne(Vendor, { 
  foreignKey: 'user_id', 
  as: 'vendor_profile',
  onDelete: 'CASCADE'
});

User.hasOne(VendorAccount, { 
  foreignKey: 'user_id', 
  as: 'vendor_account',
  onDelete: 'CASCADE'
});

User.hasMany(Order, { 
  foreignKey: 'buyer_id', 
  as: 'orders',
  onDelete: 'CASCADE'
});

User.hasMany(Notification, { 
  foreignKey: 'user_id', 
  as: 'notifications',
  onDelete: 'CASCADE'
});

User.hasMany(UserStatusHistory, {
  foreignKey: 'user_id',
  as: 'status_history',
  onDelete: 'CASCADE'
});

User.hasMany(Report, {
  foreignKey: 'reporter_id',
  as: 'reports',
  onDelete: 'CASCADE',
});

User.hasMany(Report, {
  foreignKey: 'reported_user_id',
  as: 'received_reports',
});

User.hasMany(Dispute, {
  foreignKey: 'raised_by',
  as: 'raised_disputes',
  onDelete: 'CASCADE',
});

User.hasMany(Dispute, {
  foreignKey: 'assigned_to',
  as: 'assigned_disputes',
});

User.hasMany(Dispute, {
  foreignKey: 'closed_by',
  as: 'closed_disputes',
});

User.hasMany(FeeConfig, {
  foreignKey: 'created_by',
  as: 'fee_configs',
});

User.hasMany(SystemSetting, {
  foreignKey: 'updated_by',
  as: 'updated_settings',
});

User.hasMany(AdminActionLog, {
  foreignKey: 'admin_id',
  as: 'admin_actions',
});

User.hasMany(Appeal, {
  foreignKey: 'user_id',
  as: 'appeals',
  onDelete: 'CASCADE',
});

User.hasMany(Appeal, {
  foreignKey: 'assigned_to',
  as: 'assigned_appeals',
});

User.hasMany(Appeal, {
  foreignKey: 'decided_by',
  as: 'decided_appeals',
});

// Wallet associations
Wallet.belongsTo(User, { 
  foreignKey: 'user_id', 
  as: 'owner'
});

Wallet.hasMany(WalletTransaction, { 
  foreignKey: 'wallet_id', 
  as: 'transactions',
  onDelete: 'CASCADE'
});

Wallet.belongsTo(User, { 
  foreignKey: 'frozen_by', 
  as: 'frozen_by_user'
});

// WalletTransaction associations
WalletTransaction.belongsTo(Wallet, { 
  foreignKey: 'wallet_id', 
  as: 'wallet'
});

WalletTransaction.belongsTo(User, { 
  foreignKey: 'user_id', 
  as: 'user'
});

WalletTransaction.belongsTo(User, { 
  foreignKey: 'processed_by', 
  as: 'processor'
});

// Memorial associations
Memorial.belongsTo(User, { 
  foreignKey: 'user_id', 
  as: 'creator'
});

Memorial.belongsTo(WalletTransaction, { 
  foreignKey: 'payment_txn_id', 
  as: 'payment_transaction'
});

Memorial.belongsTo(User, { 
  foreignKey: 'archived_by', 
  as: 'archived_by_user'
});

Memorial.hasMany(GiftTransaction, { 
  foreignKey: 'memorial_id', 
  as: 'gifts',
  onDelete: 'CASCADE'
});

Memorial.hasMany(MemorialComment, {
  foreignKey: 'memorial_id',
  as: 'comments',
  onDelete: 'CASCADE',
});

Memorial.hasMany(Report, {
  foreignKey: 'memorial_id',
  as: 'reports',
  onDelete: 'CASCADE',
});

Memorial.hasMany(Order, { 
  foreignKey: 'memorial_id', 
  as: 'related_orders'
});

// GiftCatalog associations
GiftCatalog.hasMany(GiftTransaction, { 
  foreignKey: 'gift_id', 
  as: 'transactions',
  onDelete: 'RESTRICT'
});

// GiftTransaction associations
GiftTransaction.belongsTo(User, { 
  foreignKey: 'sender_id', 
  as: 'sender'
});

GiftTransaction.belongsTo(User, { 
  foreignKey: 'recipient_id', 
  as: 'recipient'
});

GiftTransaction.belongsTo(Memorial, { 
  foreignKey: 'memorial_id', 
  as: 'memorial'
});

GiftTransaction.belongsTo(GiftCatalog, { 
  foreignKey: 'gift_id', 
  as: 'gift'
});

GiftTransaction.belongsTo(WalletTransaction, { 
  foreignKey: 'wallet_txn_id', 
  as: 'wallet_transaction'
});

// MemorialComment associations
MemorialComment.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'author',
});

MemorialComment.belongsTo(Memorial, {
  foreignKey: 'memorial_id',
  as: 'memorial',
});

MemorialComment.belongsTo(User, {
  foreignKey: 'deleted_by',
  as: 'deleter',
});

MemorialComment.hasMany(MemorialCommentLike, {
  foreignKey: 'comment_id',
  as: 'likes',
  onDelete: 'CASCADE',
});

MemorialCommentLike.belongsTo(MemorialComment, {
  foreignKey: 'comment_id',
  as: 'comment',
});

MemorialCommentLike.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

User.hasMany(MemorialCommentLike, {
  foreignKey: 'user_id',
  as: 'comment_likes',
});

User.hasMany(MemorialComment, {
  foreignKey: 'user_id',
  as: 'comments',
});

// Vendor associations
Vendor.belongsTo(User, { 
  foreignKey: 'user_id', 
  as: 'user'
});

Vendor.belongsTo(User, { 
  foreignKey: 'verified_by', 
  as: 'verifier'
});

Vendor.belongsTo(User, { 
  foreignKey: 'suspended_by', 
  as: 'suspender'
});

Vendor.hasMany(Product, { 
  foreignKey: 'vendor_id', 
  as: 'products',
  onDelete: 'CASCADE'
});

Vendor.hasMany(Order, { 
  foreignKey: 'vendor_id', 
  as: 'orders',
  onDelete: 'CASCADE'
});

// VendorAccount associations
VendorAccount.belongsTo(User, { 
  foreignKey: 'user_id', 
  as: 'user'
});

VendorAccount.belongsTo(User, { 
  foreignKey: 'created_by', 
  as: 'creator'
});

VendorAccount.hasMany(Product, { 
  foreignKey: 'vendor_id', 
  as: 'products',
  onDelete: 'CASCADE'
});

VendorAccount.hasMany(Order, { 
  foreignKey: 'vendor_id', 
  as: 'orders',
  onDelete: 'CASCADE'
});

// Product associations
Product.belongsTo(Vendor, { 
  foreignKey: 'vendor_id', 
  as: 'vendor'
});

Product.hasMany(OrderItem, { 
  foreignKey: 'product_id', 
  as: 'order_items',
  onDelete: 'RESTRICT'
});

// Order associations
Order.belongsTo(User, { 
  foreignKey: 'buyer_id', 
  as: 'buyer'
});

Order.belongsTo(Vendor, { 
  foreignKey: 'vendor_id', 
  as: 'vendor'
});

Order.belongsTo(Memorial, { 
  foreignKey: 'memorial_id', 
  as: 'memorial'
});

Order.belongsTo(WalletTransaction, { 
  foreignKey: 'wallet_txn_id', 
  as: 'wallet_transaction'
});

Order.belongsTo(User, { 
  foreignKey: 'cancelled_by', 
  as: 'canceller'
});

Order.hasMany(OrderItem, { 
  foreignKey: 'order_id', 
  as: 'items',
  onDelete: 'CASCADE'
});

Order.hasMany(Dispute, {
  foreignKey: 'order_id',
  as: 'disputes',
  onDelete: 'CASCADE',
});

// OrderItem associations
OrderItem.belongsTo(Order, { 
  foreignKey: 'order_id', 
  as: 'order'
});

OrderItem.belongsTo(Product, { 
  foreignKey: 'product_id', 
  as: 'product'
});

// Notification associations
Notification.belongsTo(User, { 
  foreignKey: 'user_id', 
  as: 'user'
});

UserStatusHistory.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

UserStatusHistory.belongsTo(User, {
  foreignKey: 'changed_by',
  as: 'changed_by_user'
});

Report.belongsTo(User, {
  foreignKey: 'reporter_id',
  as: 'reporter',
});

Report.belongsTo(User, {
  foreignKey: 'reported_user_id',
  as: 'reported_user',
});

Report.belongsTo(Memorial, {
  foreignKey: 'memorial_id',
  as: 'memorial',
});

Report.belongsTo(MemorialComment, {
  foreignKey: 'comment_id',
  as: 'comment',
});

Dispute.belongsTo(Order, {
  foreignKey: 'order_id',
  as: 'order',
});

Dispute.belongsTo(User, {
  foreignKey: 'raised_by',
  as: 'raised_by_user',
});

Dispute.belongsTo(User, {
  foreignKey: 'assigned_to',
  as: 'assignee',
});

Dispute.belongsTo(User, {
  foreignKey: 'closed_by',
  as: 'closed_by_user',
});

Appeal.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

Appeal.belongsTo(User, {
  foreignKey: 'assigned_to',
  as: 'assigned_to_user',
});

Appeal.belongsTo(User, {
  foreignKey: 'decided_by',
  as: 'decided_by_user',
});

Appeal.belongsTo(Report, {
  foreignKey: 'related_report_id',
  as: 'related_report',
});

Appeal.belongsTo(Dispute, {
  foreignKey: 'related_dispute_id',
  as: 'related_dispute',
});

FeeConfig.belongsTo(User, {
  foreignKey: 'created_by',
  as: 'creator',
});

SystemSetting.belongsTo(User, {
  foreignKey: 'updated_by',
  as: 'updated_by_user',
});

AdminActionLog.belongsTo(User, {
  foreignKey: 'admin_id',
  as: 'admin',
});

// Export all models and sequelize instance
module.exports = {
  sequelize,
  User,
  Wallet,
  WalletTransaction,
  Memorial,
  GiftCatalog,
  GiftTransaction,
  Vendor,
  VendorAccount,
  Product,
  Order,
  OrderItem,
  Notification,
  MemorialComment,
  MemorialCommentLike,
  UserStatusHistory,
  Report,
  Dispute,
  Appeal,
  FeeConfig,
  SystemSetting,
  AdminActionLog,
};
