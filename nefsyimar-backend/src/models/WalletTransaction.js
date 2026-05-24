const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const WalletTransaction = sequelize.define('WalletTransaction', {
  txn_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  wallet_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'wallets',
      key: 'wallet_id'
    }
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'user_id'
    }
  },
  amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    validate: {
      isDecimal: true,
      notZero(value) {
        if (parseFloat(value) === 0) {
          throw new Error('Transaction amount cannot be zero');
        }
      }
    }
  },
  type: {
    type: DataTypes.ENUM(
      'DEPOSIT',
      'MEMORIAL_CREATION',
      'GIFT_SENT',
      'GIFT_RECEIVED',
      'MARKETPLACE_PURCHASE',
      'MARKETPLACE_SALE',
      'REFUND',
      'ADMIN_ADJUSTMENT',
      'PLATFORM_FEE'
    ),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED', 'REFUNDED'),
    defaultValue: 'PENDING',
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  reference_id: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: 'Reference to related entity (memorial_id, gift_id, order_id, etc.)'
  },
  reference_type: {
    type: DataTypes.ENUM('MEMORIAL', 'GIFT', 'ORDER', 'DEPOSIT', 'OTHER'),
    allowNull: true
  },
  payment_method: {
    type: DataTypes.ENUM('TELEBIRR', 'CBE_BIRR', 'HELLO_CASH', 'PAYPAL', 'WALLET', 'ADMIN'),
    allowNull: true
  },
  external_txn_id: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Transaction ID from external payment gateway'
  },
  balance_before: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  balance_after: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  fee_amount: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00,
    allowNull: false
  },
  net_amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  processed_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  processed_by: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'user_id'
    }
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Additional transaction metadata'
  }
}, {
  tableName: 'wallet_transactions',
  indexes: [
    {
      fields: ['wallet_id']
    },
    {
      fields: ['user_id']
    },
    {
      fields: ['type']
    },
    {
      fields: ['status']
    },
    {
      fields: ['reference_id', 'reference_type']
    },
    {
      fields: ['external_txn_id']
    },
    {
      fields: ['created_at']
    }
  ]
});

// Instance methods
WalletTransaction.prototype.markCompleted = async function() {
  this.status = 'COMPLETED';
  this.processed_at = new Date();
  await this.save();
  return this;
};

WalletTransaction.prototype.markFailed = async function(reason) {
  this.status = 'FAILED';
  this.processed_at = new Date();
  this.metadata = { 
    ...this.metadata, 
    failure_reason: reason 
  };
  await this.save();
  return this;
};

WalletTransaction.prototype.markRefunded = async function(refundReason) {
  this.status = 'REFUNDED';
  this.processed_at = new Date();
  this.metadata = { 
    ...this.metadata, 
    refund_reason: refundReason,
    refunded_at: new Date()
  };
  await this.save();
  return this;
};

// Static methods
WalletTransaction.getTransactionHistory = async function(walletId, limit = 50, offset = 0) {
  return this.findAll({
    where: { wallet_id: walletId },
    order: [['created_at', 'DESC']],
    limit,
    offset
  });
};

WalletTransaction.getTotalByType = async function(walletId, type, status = 'COMPLETED') {
  const result = await this.findOne({
    where: { 
      wallet_id: walletId, 
      type,
      status 
    },
    attributes: [
      [sequelize.fn('SUM', sequelize.col('amount')), 'total'],
      [sequelize.fn('COUNT', sequelize.col('txn_id')), 'count']
    ]
  });
  
  return {
    total: parseFloat(result?.dataValues?.total || 0),
    count: parseInt(result?.dataValues?.count || 0)
  };
};

module.exports = WalletTransaction;
