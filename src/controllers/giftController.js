const { GiftCatalog, GiftTransaction, Memorial, User, Wallet, WalletTransaction, FeeConfig } = require('../models');
const { asyncHandler, InsufficientFundsError, WalletFrozenError } = require('../middleware/errorMiddleware');
const { sequelize } = require('../config/database');

const DEFAULT_PLATFORM_FEE_PERCENTAGE = 2.5; // Fallback when no config is defined

// @desc    Get all gift categories
// @route   GET /api/v1/gifts/catalog
// @access  Public
const getGiftCatalog = asyncHandler(async (req, res) => {
  const { category, featured_only = false } = req.query;

  let where = { is_active: true };
  
  if (category) {
    where.category = category;
  }

  if (featured_only === 'true') {
    where.is_featured = true;
  }

  const gifts = await GiftCatalog.findAll({
    where,
    order: [['category', 'ASC'], ['sort_order', 'ASC'], ['value', 'ASC']]
  });

  // Group gifts by category
  const groupedGifts = gifts.reduce((acc, gift) => {
    if (!acc[gift.category]) {
      acc[gift.category] = [];
    }
    acc[gift.category].push(gift);
    return acc;
  }, {});

  res.json({
    success: true,
    data: {
      gifts: groupedGifts,
      total_gifts: gifts.length
    }
  });
});

// @desc    Get gifts by category
// @route   GET /api/v1/gifts/catalog/:category
// @access  Public
const getGiftsByCategory = asyncHandler(async (req, res) => {
  const { category } = req.params;

  const gifts = await GiftCatalog.getByCategory(category.toUpperCase());

  if (gifts.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'No gifts found for this category'
    });
  }

  res.json({
    success: true,
    data: {
      category,
      gifts
    }
  });
});

// @desc    Get gift details
// @route   GET /api/v1/gifts/:giftId
// @access  Public
const getGift = asyncHandler(async (req, res) => {
  const { giftId } = req.params;

  const gift = await GiftCatalog.findByPk(giftId);

  if (!gift) {
    return res.status(404).json({
      success: false,
      message: 'Gift not found'
    });
  }

  if (!gift.is_active) {
    return res.status(404).json({
      success: false,
      message: 'Gift is not available'
    });
  }

  res.json({
    success: true,
    data: {
      gift
    }
  });
});

// @desc    Send gift to memorial
// @route   POST /api/v1/gifts/send
// @access  Private
const sendGift = asyncHandler(async (req, res) => {
  const {
    memorial_id,
    gift_id,
    message,
    message_amharic,
    is_anonymous = false,
    sender_name,
    visibility = 'PUBLIC'
  } = req.body;

  // Validate memorial exists and is accessible
  const memorial = await Memorial.findByPk(memorial_id, {
    include: [
      {
        model: User,
        as: 'creator',
        attributes: ['user_id', 'name']
      }
    ]
  });

  if (!memorial) {
    return res.status(404).json({
      success: false,
      message: 'Memorial not found'
    });
  }

  if (!memorial.paid_status || !memorial.is_active) {
    return res.status(400).json({
      success: false,
      message: 'Memorial is not available for gifts'
    });
  }

  // Check memorial settings
  if (!memorial.memorial_settings?.allow_gifts) {
    return res.status(400).json({
      success: false,
      message: 'This memorial does not accept gifts'
    });
  }

  // Validate gift exists and is active
  const gift = await GiftCatalog.findByPk(gift_id);

  if (!gift || !gift.is_active) {
    return res.status(404).json({
      success: false,
      message: 'Gift not found or not available'
    });
  }

  // Check sender's wallet
  const senderWallet = await Wallet.findOne({
    where: { user_id: req.user.user_id }
  });

  if (!senderWallet) {
    return res.status(404).json({
      success: false,
      message: 'Sender wallet not found'
    });
  }

  if (senderWallet.is_frozen) {
    throw new WalletFrozenError();
  }

  const giftAmount = parseFloat(gift.value);

  // Look up current global gift fee from FeeConfig (as configured in admin settings)
  let effectiveFeePercentage = DEFAULT_PLATFORM_FEE_PERCENTAGE;
  try {
    const now = new Date();
    const configured = await FeeConfig.getEffectivePercentage('GIFT_FEE', null, now);

    const usedPercentage =
      typeof configured === 'number' && !Number.isNaN(configured)
        ? configured
        : DEFAULT_PLATFORM_FEE_PERCENTAGE;

    console.log('sendGift GIFT_FEE config', {
      at: now.toISOString(),
      giftAmount,
      configured,
      defaultPercentage: DEFAULT_PLATFORM_FEE_PERCENTAGE,
      usedPercentage,
    });

    if (typeof configured === 'number' && !Number.isNaN(configured)) {
      effectiveFeePercentage = configured;
    }
  } catch (e) {
    // If FeeConfig lookup fails for any reason, quietly fall back to default
    console.error('Failed to load GIFT_FEE config, using default', e?.message || e);
  }

  const platformFee = (giftAmount * effectiveFeePercentage) / 100;
  const netAmount = giftAmount - platformFee;

  if (!senderWallet.hasBalance(giftAmount)) {
    throw new InsufficientFundsError(`Insufficient balance. Gift requires ${giftAmount} ETB.`);
  }

  // Get recipient's wallet
  const recipientWallet = await Wallet.findOne({
    where: { user_id: memorial.user_id }
  });

  if (!recipientWallet) {
    return res.status(404).json({
      success: false,
      message: 'Recipient wallet not found'
    });
  }

  // Start database transaction
  const transaction = await sequelize.transaction();

  try {
    // Create sender's wallet transaction (debit)
    const senderTransaction = await WalletTransaction.create({
      wallet_id: senderWallet.wallet_id,
      user_id: req.user.user_id,
      amount: -giftAmount,
      type: 'GIFT_SENT',
      status: 'COMPLETED',
      description: `Gift sent: ${gift.name} to ${memorial.deceased_name}`,
      reference_id: memorial_id,
      reference_type: 'MEMORIAL',
      balance_before: senderWallet.balance,
      balance_after: parseFloat(senderWallet.balance) - giftAmount,
      fee_amount: platformFee,
      net_amount: -giftAmount,
      processed_at: new Date()
    }, { transaction });

    // Create recipient's wallet transaction (credit)
    const recipientTransaction = await WalletTransaction.create({
      wallet_id: recipientWallet.wallet_id,
      user_id: memorial.user_id,
      amount: netAmount,
      type: 'GIFT_RECEIVED',
      status: 'COMPLETED',
      description: `Gift received: ${gift.name} from ${is_anonymous ? 'Anonymous' : req.user.name}`,
      reference_id: memorial_id,
      reference_type: 'MEMORIAL',
      balance_before: recipientWallet.balance,
      balance_after: parseFloat(recipientWallet.balance) + netAmount,
      fee_amount: 0,
      net_amount: netAmount,
      processed_at: new Date()
    }, { transaction });

    // Create platform fee transaction
    const platformFeeTransaction = await WalletTransaction.create({
      wallet_id: senderWallet.wallet_id,
      user_id: req.user.user_id,
      amount: platformFee,
      type: 'PLATFORM_FEE',
      status: 'COMPLETED',
      description: `Platform fee for gift: ${gift.name}`,
      reference_id: memorial_id,
      reference_type: 'MEMORIAL',
      balance_before: parseFloat(senderWallet.balance) - giftAmount,
      balance_after: parseFloat(senderWallet.balance) - giftAmount,
      fee_amount: 0,
      net_amount: platformFee,
      processed_at: new Date()
    }, { transaction });

    // Create gift transaction record
    const giftTransaction = await GiftTransaction.create({
      sender_id: req.user.user_id,
      recipient_id: memorial.user_id,
      memorial_id,
      gift_id,
      wallet_txn_id: senderTransaction.txn_id,
      amount: giftAmount,
      platform_fee: platformFee,
      net_amount: netAmount,
      message,
      message_amharic,
      sender_name: is_anonymous ? sender_name : req.user.name,
      is_anonymous,
      visibility,
      status: 'COMPLETED',
      processed_at: new Date()
    }, { transaction });

    // Update wallet balances
    await senderWallet.debit(giftAmount, `Gift sent: ${gift.name}`);
    await recipientWallet.credit(netAmount, `Gift received: ${gift.name}`);

    // Update memorial gift statistics
    await memorial.addGift(giftAmount);

    // Update gift catalog usage statistics
    await gift.incrementUsage(giftAmount);

    await transaction.commit();

    // Fetch complete gift transaction with relations
    const completeGiftTransaction = await GiftTransaction.findByPk(giftTransaction.txn_id, {
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['user_id', 'name']
        },
        {
          model: User,
          as: 'recipient',
          attributes: ['user_id', 'name']
        },
        {
          model: Memorial,
          as: 'memorial',
          attributes: ['memorial_id', 'deceased_name', 'memorial_url']
        },
        {
          model: GiftCatalog,
          as: 'gift',
          attributes: ['gift_id', 'name', 'animation_type', 'icon_url', 'animation_url']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Gift sent successfully',
      data: {
        gift_transaction: completeGiftTransaction,
        animation: {
          type: gift.animation_type,
          duration: gift.animation_duration,
          url: gift.animation_url,
          sound_url: gift.sound_url
        }
      }
    });

  } catch (error) {
    await transaction.rollback();
    throw error;
  }
});

// @desc    Get memorial gifts
// @route   GET /api/v1/gifts/memorial/:memorialId
// @access  Public
const getMemorialGifts = asyncHandler(async (req, res) => {
  const { memorialId } = req.params;
  const { page = 1, limit = 20, visibility = 'PUBLIC' } = req.query;
  const offset = (page - 1) * limit;

  // Verify memorial exists and is accessible
  const memorial = await Memorial.findByPk(memorialId);

  if (!memorial) {
    return res.status(404).json({
      success: false,
      message: 'Memorial not found'
    });
  }

  const gifts = await GiftTransaction.getMemorialGifts(
    memorialId, 
    parseInt(limit), 
    parseInt(offset), 
    visibility
  );

  // Get total count for pagination
  const totalCount = await GiftTransaction.count({
    where: {
      memorial_id: memorialId,
      status: 'COMPLETED',
      visibility
    }
  });

  res.json({
    success: true,
    data: {
      gifts,
      memorial: {
        memorial_id: memorial.memorial_id,
        deceased_name: memorial.deceased_name,
        total_gifts_value: memorial.total_gifts_value,
        gift_count: memorial.gift_count
      },
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(totalCount / limit),
        total_records: totalCount,
        per_page: parseInt(limit)
      }
    }
  });
});

// @desc    Get user's sent gifts
// @route   GET /api/v1/gifts/sent
// @access  Private
const getSentGifts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  const gifts = await GiftTransaction.getUserSentGifts(
    req.user.user_id,
    parseInt(limit),
    parseInt(offset)
  );

  // Get total count for pagination
  const totalCount = await GiftTransaction.count({
    where: {
      sender_id: req.user.user_id,
      status: 'COMPLETED'
    }
  });

  res.json({
    success: true,
    data: {
      gifts,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(totalCount / limit),
        total_records: totalCount,
        per_page: parseInt(limit)
      }
    }
  });
});

// @desc    Get user's received gifts
// @route   GET /api/v1/gifts/received
// @access  Private
const getReceivedGifts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  const gifts = await GiftTransaction.getUserReceivedGifts(
    req.user.user_id,
    parseInt(limit),
    parseInt(offset)
  );

  // Get total count for pagination
  const totalCount = await GiftTransaction.count({
    where: {
      recipient_id: req.user.user_id,
      status: 'COMPLETED'
    }
  });

  res.json({
    success: true,
    data: {
      gifts,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(totalCount / limit),
        total_records: totalCount,
        per_page: parseInt(limit)
      }
    }
  });
});

// @desc    Get gift statistics
// @route   GET /api/v1/gifts/stats
// @access  Private
const getGiftStats = asyncHandler(async (req, res) => {
  const { memorial_id, period = '30d' } = req.query;

  // Calculate date range
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

  const where = {
    status: 'COMPLETED',
    created_at: {
      [sequelize.Sequelize.Op.gte]: startDate
    }
  };

  if (memorial_id) {
    where.memorial_id = memorial_id;
    
    // Verify user owns the memorial
    const memorial = await Memorial.findByPk(memorial_id);
    if (!memorial || (memorial.user_id !== req.user.user_id && req.user.role !== 'Administrator')) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
  } else {
    // Show stats for user's memorials only
    const userMemorials = await Memorial.findAll({
      where: { user_id: req.user.user_id },
      attributes: ['memorial_id']
    });
    
    where.memorial_id = {
      [sequelize.Sequelize.Op.in]: userMemorials.map(m => m.memorial_id)
    };
  }

  // Get overall statistics
  const stats = await GiftTransaction.findOne({
    where,
    attributes: [
      [sequelize.fn('COUNT', sequelize.col('txn_id')), 'total_gifts'],
      [sequelize.fn('SUM', sequelize.col('amount')), 'total_value'],
      [sequelize.fn('SUM', sequelize.col('net_amount')), 'total_received'],
      [sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('sender_id'))), 'unique_senders'],
      [sequelize.fn('AVG', sequelize.col('amount')), 'average_gift_value']
    ]
  });

  // Get gift breakdown by category
  const categoryBreakdown = await GiftTransaction.findAll({
    where,
    include: [
      {
        model: GiftCatalog,
        as: 'gift',
        attributes: ['category']
      }
    ],
    attributes: [
      [sequelize.col('gift.category'), 'category'],
      [sequelize.fn('COUNT', sequelize.col('GiftTransaction.txn_id')), 'count'],
      [sequelize.fn('SUM', sequelize.col('GiftTransaction.amount')), 'total_value']
    ],
    group: ['gift.category'],
    order: [[sequelize.fn('SUM', sequelize.col('GiftTransaction.amount')), 'DESC']]
  });

  res.json({
    success: true,
    data: {
      period,
      overall_stats: {
        total_gifts: parseInt(stats?.dataValues?.total_gifts || 0),
        total_value: parseFloat(stats?.dataValues?.total_value || 0),
        total_received: parseFloat(stats?.dataValues?.total_received || 0),
        unique_senders: parseInt(stats?.dataValues?.unique_senders || 0),
        average_gift_value: parseFloat(stats?.dataValues?.average_gift_value || 0)
      },
      category_breakdown: categoryBreakdown.map(item => ({
        category: item.dataValues.category,
        count: parseInt(item.dataValues.count),
        total_value: parseFloat(item.dataValues.total_value)
      }))
    }
  });
});

// @desc    Get popular gifts
// @route   GET /api/v1/gifts/popular
// @access  Public
const getPopularGifts = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;

  const gifts = await GiftCatalog.getPopularGifts(parseInt(limit));

  res.json({
    success: true,
    data: {
      gifts
    }
  });
});

module.exports = {
  getGiftCatalog,
  getGiftsByCategory,
  getGift,
  sendGift,
  getMemorialGifts,
  getSentGifts,
  getReceivedGifts,
  getGiftStats,
  getPopularGifts
};
