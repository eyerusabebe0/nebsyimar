const { Wallet, WalletTransaction, User } = require('../models');
const { asyncHandler, InsufficientFundsError, WalletFrozenError } = require('../middleware/errorMiddleware');
const { processPayment } = require('../utils/paymentGateway');
const { logAdminAction } = require('../utils/adminAudit');
const { sequelize } = require('../config/database');

// @desc    Get wallet details
// @route   GET /api/v1/wallet
// @access  Private
const getWallet = asyncHandler(async (req, res) => {
  const wallet = await Wallet.findOne({
    where: { user_id: req.user.user_id },
    include: [
      {
        model: User,
        as: 'owner',
        attributes: ['user_id', 'name', 'email', 'phone']
      }
    ]
  });

  if (!wallet) {
    return res.status(404).json({
      success: false,
      message: 'Wallet not found'
    });
  }

  res.json({
    success: true,
    data: {
      wallet
    }
  });
});

// @desc    Get wallet transactions
// @route   GET /api/v1/wallet/transactions
// @access  Private
const getTransactions = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, type, status } = req.query;
  const offset = (page - 1) * limit;

  const wallet = await Wallet.findOne({
    where: { user_id: req.user.user_id }
  });

  if (!wallet) {
    return res.status(404).json({
      success: false,
      message: 'Wallet not found'
    });
  }

  const where = { wallet_id: wallet.wallet_id };
  if (type) where.type = type;
  if (status) where.status = status;

  const { count, rows: transactions } = await WalletTransaction.findAndCountAll({
    where,
    order: [['created_at', 'DESC']],
    limit: parseInt(limit),
    offset: parseInt(offset)
  });

  res.json({
    success: true,
    data: {
      transactions,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(count / limit),
        total_records: count,
        per_page: parseInt(limit)
      }
    }
  });
});

// @desc    Deposit money to wallet
// @route   POST /api/v1/wallet/deposit
// @access  Private
const depositMoney = asyncHandler(async (req, res) => {
  const { amount, payment_method, external_txn_id } = req.body;

  const wallet = await Wallet.findOne({
    where: { user_id: req.user.user_id }
  });

  if (!wallet) {
    return res.status(404).json({
      success: false,
      message: 'Wallet not found'
    });
  }

  if (wallet.is_frozen) {
    throw new WalletFrozenError();
  }

  // Start database transaction
  const transaction = await sequelize.transaction();

  try {
    // Process payment through external gateway
    const paymentResult = await processPayment({
      amount,
      payment_method,
      external_txn_id,
      user_id: req.user.user_id,
      description: 'Wallet deposit'
    });

    if (!paymentResult.success) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Payment processing failed',
        error: paymentResult.error
      });
    }

    // Record wallet transaction
    const walletTransaction = await WalletTransaction.create({
      wallet_id: wallet.wallet_id,
      user_id: req.user.user_id,
      amount: amount,
      type: 'DEPOSIT',
      status: 'COMPLETED',
      description: `Deposit via ${payment_method}`,
      payment_method,
      external_txn_id: paymentResult.transaction_id,
      balance_before: wallet.balance,
      balance_after: parseFloat(wallet.balance) + parseFloat(amount),
      fee_amount: 0,
      net_amount: amount,
      processed_at: new Date()
    }, { transaction });

    // Update wallet balance
    await wallet.credit(amount, 'Deposit');

    await transaction.commit();

    res.json({
      success: true,
      message: 'Deposit successful',
      data: {
        transaction: walletTransaction,
        wallet: {
          wallet_id: wallet.wallet_id,
          balance: wallet.balance,
          currency: wallet.currency
        }
      }
    });

  } catch (error) {
    await transaction.rollback();
    throw error;
  }
});

// @desc    Get wallet balance
// @route   GET /api/v1/wallet/balance
// @access  Private
const getBalance = asyncHandler(async (req, res) => {
  const wallet = await Wallet.findOne({
    where: { user_id: req.user.user_id }
  });

  if (!wallet) {
    return res.status(404).json({
      success: false,
      message: 'Wallet not found'
    });
  }

  res.json({
    success: true,
    data: {
      balance: wallet.balance,
      currency: wallet.currency,
      is_frozen: wallet.is_frozen,
      total_deposited: wallet.total_deposited,
      total_spent: wallet.total_spent
    }
  });
});

// @desc    Get transaction by ID
// @route   GET /api/v1/wallet/transactions/:txnId
// @access  Private
const getTransaction = asyncHandler(async (req, res) => {
  const { txnId } = req.params;

  const transaction = await WalletTransaction.findOne({
    where: {
      txn_id: txnId,
      user_id: req.user.user_id
    }
  });

  if (!transaction) {
    return res.status(404).json({
      success: false,
      message: 'Transaction not found'
    });
  }

  res.json({
    success: true,
    data: {
      transaction
    }
  });
});

// @desc    Get wallet statistics
// @route   GET /api/v1/wallet/stats
// @access  Private
const getWalletStats = asyncHandler(async (req, res) => {
  const { period = '30d' } = req.query;

  const wallet = await Wallet.findOne({
    where: { user_id: req.user.user_id }
  });

  if (!wallet) {
    return res.status(404).json({
      success: false,
      message: 'Wallet not found'
    });
  }

  // Calculate date range based on period
  let startDate = new Date();
  switch (period) {
    case '7d':
      startDate.setDate(startDate.getDate() - 7);
      break;
    case '30d':
      startDate.setDate(startDate.getDate() - 30);
      break;
    case '90d':
      startDate.setDate(startDate.getDate() - 90);
      break;
    case '1y':
      startDate.setFullYear(startDate.getFullYear() - 1);
      break;
    default:
      startDate.setDate(startDate.getDate() - 30);
  }

  // Get transaction statistics
  const stats = await WalletTransaction.findOne({
    where: {
      wallet_id: wallet.wallet_id,
      created_at: {
        [sequelize.Sequelize.Op.gte]: startDate
      },
      status: 'COMPLETED'
    },
    attributes: [
      [sequelize.fn('COUNT', sequelize.col('txn_id')), 'total_transactions'],
      [sequelize.fn('SUM', sequelize.literal("CASE WHEN amount > 0 THEN amount ELSE 0 END")), 'total_credits'],
      [sequelize.fn('SUM', sequelize.literal("CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END")), 'total_debits'],
      [sequelize.fn('COUNT', sequelize.literal("CASE WHEN type = 'DEPOSIT' THEN 1 END")), 'deposit_count'],
      [sequelize.fn('COUNT', sequelize.literal("CASE WHEN type = 'MEMORIAL_CREATION' THEN 1 END")), 'memorial_count'],
      [sequelize.fn('COUNT', sequelize.literal("CASE WHEN type = 'GIFT_SENT' THEN 1 END")), 'gift_count'],
      [sequelize.fn('COUNT', sequelize.literal("CASE WHEN type = 'MARKETPLACE_PURCHASE' THEN 1 END")), 'purchase_count']
    ]
  });

  // Get monthly breakdown
  const monthlyStats = await WalletTransaction.findAll({
    where: {
      wallet_id: wallet.wallet_id,
      created_at: {
        [sequelize.Sequelize.Op.gte]: startDate
      },
      status: 'COMPLETED'
    },
    attributes: [
      [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('created_at')), 'month'],
      [sequelize.fn('SUM', sequelize.literal("CASE WHEN amount > 0 THEN amount ELSE 0 END")), 'credits'],
      [sequelize.fn('SUM', sequelize.literal("CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END")), 'debits'],
      [sequelize.fn('COUNT', sequelize.col('txn_id')), 'transaction_count']
    ],
    group: [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('created_at'))],
    order: [[sequelize.fn('DATE_TRUNC', 'month', sequelize.col('created_at')), 'ASC']]
  });

  res.json({
    success: true,
    data: {
      wallet_info: {
        current_balance: wallet.balance,
        total_deposited: wallet.total_deposited,
        total_spent: wallet.total_spent,
        currency: wallet.currency
      },
      period_stats: {
        period,
        total_transactions: parseInt(stats?.dataValues?.total_transactions || 0),
        total_credits: parseFloat(stats?.dataValues?.total_credits || 0),
        total_debits: parseFloat(stats?.dataValues?.total_debits || 0),
        deposit_count: parseInt(stats?.dataValues?.deposit_count || 0),
        memorial_count: parseInt(stats?.dataValues?.memorial_count || 0),
        gift_count: parseInt(stats?.dataValues?.gift_count || 0),
        purchase_count: parseInt(stats?.dataValues?.purchase_count || 0)
      },
      monthly_breakdown: monthlyStats.map(stat => ({
        month: stat.dataValues.month,
        credits: parseFloat(stat.dataValues.credits || 0),
        debits: parseFloat(stat.dataValues.debits || 0),
        transaction_count: parseInt(stat.dataValues.transaction_count || 0)
      }))
    }
  });
});

// @desc    Request wallet freeze (Admin only)
// @route   POST /api/v1/wallet/:userId/freeze
// @access  Private (Admin)
const freezeWallet = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { reason } = req.body;

  const wallet = await Wallet.findOne({
    where: { user_id: userId }
  });

  if (!wallet) {
    return res.status(404).json({
      success: false,
      message: 'Wallet not found'
    });
  }

  if (wallet.is_frozen) {
    return res.status(400).json({
      success: false,
      message: 'Wallet is already frozen'
    });
  }

  await wallet.freeze(reason, req.user.user_id);

  await logAdminAction(req, {
    action: 'WALLET_FREEZE',
    targetType: 'WALLET',
    targetId: wallet.wallet_id,
    targetLabel: wallet.wallet_id,
    reason,
    metadata: {
      user_id: userId,
    },
  });

  res.json({
    success: true,
    message: 'Wallet frozen successfully',
    data: {
      wallet: {
        wallet_id: wallet.wallet_id,
        is_frozen: wallet.is_frozen,
        frozen_reason: wallet.frozen_reason,
        frozen_at: wallet.frozen_at
      }
    }
  });
});

// @desc    Unfreeze wallet (Admin only)
// @route   POST /api/v1/wallet/:userId/unfreeze
// @access  Private (Admin)
const unfreezeWallet = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const wallet = await Wallet.findOne({
    where: { user_id: userId }
  });

  if (!wallet) {
    return res.status(404).json({
      success: false,
      message: 'Wallet not found'
    });
  }

  if (!wallet.is_frozen) {
    return res.status(400).json({
      success: false,
      message: 'Wallet is not frozen'
    });
  }

  await wallet.unfreeze();

  await logAdminAction(req, {
    action: 'WALLET_UNFREEZE',
    targetType: 'WALLET',
    targetId: wallet.wallet_id,
    targetLabel: wallet.wallet_id,
    metadata: {
      user_id: userId,
    },
  });

  res.json({
    success: true,
    message: 'Wallet unfrozen successfully',
    data: {
      wallet: {
        wallet_id: wallet.wallet_id,
        is_frozen: wallet.is_frozen
      }
    }
  });
});

module.exports = {
  getWallet,
  getTransactions,
  depositMoney,
  getBalance,
  getTransaction,
  getWalletStats,
  freezeWallet,
  unfreezeWallet
};
