const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Wallet = sequelize.define('Wallet', {
  wallet_id: {
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
    },
    unique: true
  },
  balance: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00,
    allowNull: false,
    validate: {
      min: 0,
      isDecimal: true
    }
  },
  currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'ETB',
    allowNull: false
  },
  is_frozen: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  frozen_reason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  frozen_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  frozen_by: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'user_id'
    }
  },
  total_deposited: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00,
    allowNull: false
  },
  total_spent: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00,
    allowNull: false
  },
  last_transaction_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'wallets',
  indexes: [
    {
      unique: true,
      fields: ['user_id']
    }
  ]
});

// Instance methods
Wallet.prototype.hasBalance = function(amount) {
  return parseFloat(this.balance) >= parseFloat(amount);
};

Wallet.prototype.debit = async function(amount, description = '') {
  if (!this.hasBalance(amount)) {
    throw new Error('Insufficient balance');
  }
  
  if (this.is_frozen) {
    throw new Error('Wallet is frozen');
  }

  this.balance = parseFloat(this.balance) - parseFloat(amount);
  this.total_spent = parseFloat(this.total_spent) + parseFloat(amount);
  this.last_transaction_at = new Date();
  
  await this.save();
  return this;
};

Wallet.prototype.credit = async function(amount, description = '') {
  if (this.is_frozen) {
    throw new Error('Wallet is frozen');
  }

  this.balance = parseFloat(this.balance) + parseFloat(amount);
  this.total_deposited = parseFloat(this.total_deposited) + parseFloat(amount);
  this.last_transaction_at = new Date();
  
  await this.save();
  return this;
};

Wallet.prototype.freeze = async function(reason, frozenBy) {
  this.is_frozen = true;
  this.frozen_reason = reason;
  this.frozen_at = new Date();
  this.frozen_by = frozenBy;
  
  await this.save();
  return this;
};

Wallet.prototype.unfreeze = async function() {
  this.is_frozen = false;
  this.frozen_reason = null;
  this.frozen_at = null;
  this.frozen_by = null;
  
  await this.save();
  return this;
};

module.exports = Wallet;
