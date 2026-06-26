const { Memorial, User, Wallet, WalletTransaction, GiftTransaction } = require('../models');
const { asyncHandler, InsufficientFundsError, WalletFrozenError } = require('../middleware/errorMiddleware');
const { sequelize } = require('../config/database');
const Op = sequelize.Sequelize.Op;
const { uploadFiles } = require('../utils/fileUpload');

const MEMORIAL_CREATION_FEE = 10.00; // ETB default fee when payment is enabled for non-premium stones
const HEADSTONE_ADDITIONAL_FEES = {
  stone_9: 300.00,
};
const ALLOWED_HEADSTONE_DESIGNS = new Set([
  'stone_1',
  'stone_2',
  'stone_3',
  'stone_4',
  'stone_5',
  'stone_6',
  'stone_7',
  'stone_8',
  'stone_9'
]);

// @desc    Get all public memorials
// @route   GET /api/v1/memorials
// @access  Public
const getMemorials = asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 20, 
    search, 
    cultural_template, 
    sort = 'newest',
    featured_only = false 
  } = req.query;
  
  const offset = (page - 1) * limit;

  // Base filters for public memorials
  const where = {
    paid_status: true,
    is_active: true,
    is_hidden_by_admin: false,
    review_status: {
      [Op.ne]: 'HIDDEN',
    },
  };

  // Effective public visibility (for anonymous / non-admin users):
  // - Include memorials forced public by admin
  // - Include normal PUBLIC memorials when there is no admin override
  // - Exclude those forced private or family-only
  where[Op.and] = [
    {
      [Op.or]: [
        { admin_visibility: 'FORCE_PUBLIC' },
        {
          admin_visibility: 'NONE',
          visibility: 'PUBLIC',
        },
      ],
    },
    {
      [Op.or]: [
        { admin_visibility: { [Op.ne]: 'FORCE_PRIVATE' } },
        { is_hidden_by_admin: false },
      ],
    },
    {
      [Op.or]: [
        { admin_visibility: { [Op.ne]: 'FORCE_FAMILY_ONLY' } },
        { is_hidden_by_admin: false },
      ],
    },
  ];

  // Add search filter
  if (search) {
    where[Op.or] = [
      { deceased_name: { [Op.iLike]: `%${search}%` } },
      { deceased_name_amharic: { [Op.iLike]: `%${search}%` } }
    ];
  }

  // Add cultural template filter
  if (cultural_template) {
    where.cultural_template = cultural_template;
  }

  // Add featured filter
  if (featured_only === 'true') {
    where.is_featured = true;
  }

  // Determine sort order
  let order = [];
  switch (sort) {
    case 'newest':
      order = [['is_featured', 'DESC'], ['created_at', 'DESC']];
      break;
    case 'oldest':
      order = [['is_featured', 'DESC'], ['created_at', 'ASC']];
      break;
    case 'popular':
      order = [['is_featured', 'DESC'], ['gift_count', 'DESC'], ['view_count', 'DESC']];
      break;
    case 'gifts':
      order = [['is_featured', 'DESC'], ['total_gifts_value', 'DESC']];
      break;
    default:
      order = [['is_featured', 'DESC'], ['created_at', 'DESC']];
  }

  const { count, rows: memorials } = await Memorial.findAndCountAll({
    where,
    include: [
      {
        model: User,
        as: 'creator',
        attributes: ['user_id', 'name']
      }
    ],
    order,
    limit: parseInt(limit),
    offset: parseInt(offset)
  });

  res.json({
    success: true,
    data: {
      memorials,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(count / limit),
        total_records: count,
        per_page: parseInt(limit)
      }
    }
  });
});

// @desc    Get memorial by ID or URL
// @route   GET /api/v1/memorials/:identifier
// @access  Public
const getMemorial = asyncHandler(async (req, res) => {
  const { identifier } = req.params;
  
  // Check if identifier is UUID or memorial URL
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(identifier);
  
  const where = isUUID 
    ? { memorial_id: identifier }
    : { memorial_url: identifier };

  const memorial = await Memorial.findOne({
    where,
    include: [
      {
        model: User,
        as: 'creator',
        attributes: ['user_id', 'name', 'profile_image']
      }
    ]
  });

  if (!memorial) {
    return res.status(404).json({
      success: false,
      message: 'Memorial not found'
    });
  }

  const isAdmin = req.user && req.user.role === 'Administrator';
  const isOwner = req.user && memorial.user_id === req.user.user_id;

  // If memorial is hidden by admin, only admins can view it
  if (!isAdmin && (memorial.is_hidden_by_admin || memorial.review_status === 'HIDDEN')) {
    return res.status(404).json({
      success: false,
      message: 'Memorial not found'
    });
  }

  // Determine effective visibility taking admin overrides into account for non-admins
  let effectiveVisibility = memorial.visibility;
  if (!isAdmin) {
    if (memorial.admin_visibility === 'FORCE_PUBLIC') {
      effectiveVisibility = 'PUBLIC';
    } else if (memorial.admin_visibility === 'FORCE_PRIVATE') {
      effectiveVisibility = 'PRIVATE';
    } else if (memorial.admin_visibility === 'FORCE_FAMILY_ONLY') {
      effectiveVisibility = 'FAMILY_ONLY';
    }
  }

  // Check visibility permissions (effective visibility)
  if (effectiveVisibility === 'PRIVATE' && (!req.user || !isOwner)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. This memorial is private.'
    });
  }

  if (effectiveVisibility === 'FAMILY_ONLY' && (!req.user || !isOwner)) {
    // TODO: Implement family member check when family system is added
    return res.status(403).json({
      success: false,
      message: 'Access denied. This memorial is for family members only.'
    });
  }

  // Increment view count (only for public access)
  if (!req.user || memorial.user_id !== req.user.user_id) {
    await memorial.incrementViewCount();
  }

  // Get recent gifts for this memorial
  const recentGifts = await GiftTransaction.findAll({
    where: {
      memorial_id: memorial.memorial_id,
      status: 'COMPLETED',
      visibility: 'PUBLIC'
    },
    include: [
      {
        model: User,
        as: 'sender',
        attributes: ['user_id', 'name']
      },
      {
        model: require('../models').GiftCatalog,
        as: 'gift',
        attributes: ['gift_id', 'name', 'animation_type', 'icon_url']
      }
    ],
    order: [['created_at', 'DESC']],
    limit: 10
  });

  res.json({
    success: true,
    data: {
      memorial,
      recent_gifts: recentGifts
    }
  });
});

// @desc    Create new memorial
// @route   POST /api/v1/memorials
// @access  Private
const createMemorial = asyncHandler(async (req, res) => {
  const {
    deceased_name,
    deceased_name_amharic,
    bio,
    bio_amharic,
    date_of_birth,
    date_of_death,
    place_of_birth,
    place_of_death,
    cause_of_death,
    visibility = 'PUBLIC',
    cultural_template = 'MODERN',
    memorial_url,
    headstone_design,
    skip_payment = false,
  } = req.body;

  if (headstone_design && !ALLOWED_HEADSTONE_DESIGNS.has(String(headstone_design))) {
    return res.status(400).json({
      success: false,
      message: 'Invalid headstone design.'
    });
  }

  if (req.user && req.user.can_create_memorials === false) {
    return res.status(403).json({
      success: false,
      message: 'You are not allowed to create memorials.',
    });
  }

  const skipPayment = String(skip_payment).toLowerCase() === 'true';
  const requestedFee = HEADSTONE_ADDITIONAL_FEES[String(headstone_design)] || 0.00;
  let wallet = null;
  let walletTransaction = null;

  if (requestedFee > 0 && skipPayment) {
    return res.status(400).json({
      success: false,
      message: 'Payment is required to use the selected headstone design.'
    });
  }

  if (!skipPayment) {
    // Check wallet balance
    wallet = await Wallet.findOne({
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

    if (!wallet.hasBalance(requestedFee)) {
      throw new InsufficientFundsError(`Insufficient balance. Memorial creation requires ${requestedFee} ETB.`);
    }
  }

  try {
    const result = await sequelize.transaction(async (transaction) => {
      // Handle file uploads if any
      let uploadedFiles = {};
      if (req.files) {
        uploadedFiles = await uploadFiles(req.files, 'memorials');
      }

      // Create memorial
      const memorial = await Memorial.create({
        user_id: req.user.user_id,
        deceased_name,
        deceased_name_amharic,
        bio,
        bio_amharic,
        date_of_birth,
        date_of_death,
        place_of_birth,
        place_of_death,
        cause_of_death,
        profile_image: uploadedFiles.profile_image?.[0],
        cover_image: uploadedFiles.cover_image?.[0],
        gallery_images: uploadedFiles.gallery_images || [],
        visibility,
        cultural_template,
        memorial_url,
        paid_status: true,
      payment_txn_id: null,
      }, { transaction });

      if (headstone_design) {
        memorial.memorial_settings = {
          ...(memorial.memorial_settings || {}),
          headstone_design: String(headstone_design)
        };
        await memorial.save({ transaction });
      }

      if (!skipPayment) {
        const balanceBefore = parseFloat(wallet.balance);
        const balanceAfter = balanceBefore - requestedFee;

        // Create wallet transaction for memorial creation fee
        walletTransaction = await WalletTransaction.create({
          wallet_id: wallet.wallet_id,
          user_id: req.user.user_id,
          amount: -requestedFee,
          type: 'MEMORIAL_CREATION',
          status: 'COMPLETED',
          description: `Memorial creation fee for "${deceased_name}"`,
          reference_id: memorial.memorial_id,
          reference_type: 'MEMORIAL',
          balance_before: balanceBefore,
          balance_after: balanceAfter,
          fee_amount: 0,
          net_amount: -requestedFee,
          processed_at: new Date()
        }, { transaction });

        // Debit wallet inside the same transaction
        wallet.balance = balanceAfter;
        wallet.total_spent = parseFloat(wallet.total_spent || 0) + requestedFee;
        wallet.last_transaction_at = new Date();
        await wallet.save({ transaction });

        // Mark memorial as paid inside the same transaction
        memorial.payment_txn_id = walletTransaction.txn_id;
        await memorial.save({ transaction });
      }

      // Fetch the complete memorial with creator info
      const completeMemorial = await Memorial.findByPk(memorial.memorial_id, {
        include: [
          {
            model: User,
            as: 'creator',
            attributes: ['user_id', 'name']
          }
        ],
        transaction
      });

      return { completeMemorial, walletTransaction };
    });

    res.status(201).json({
      success: true,
      message: 'Memorial created successfully',
      data: {
        memorial: result.completeMemorial,
        transaction: result.walletTransaction
      }
    });
  } catch (error) {
    console.error('Error creating memorial:', error);
    throw error;
  }
});

// @desc    Update memorial
// @route   PUT /api/v1/memorials/:id
// @access  Private
const updateMemorial = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    deceased_name,
    deceased_name_amharic,
    bio,
    bio_amharic,
    date_of_birth,
    date_of_death,
    place_of_birth,
    place_of_death,
    cause_of_death,
    visibility,
    cultural_template
  } = req.body;

  const memorial = await Memorial.findByPk(id);

  if (!memorial) {
    return res.status(404).json({
      success: false,
      message: 'Memorial not found'
    });
  }

  // Check ownership
  if (memorial.user_id !== req.user.user_id && req.user.role !== 'Administrator') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. You can only update your own memorials.'
    });
  }

  // Handle file uploads if any
  let uploadedFiles = {};
  if (req.files) {
    uploadedFiles = await uploadFiles(req.files, 'memorials');
  }

  // Update memorial
  const updateData = {
    deceased_name: deceased_name || memorial.deceased_name,
    deceased_name_amharic,
    bio,
    bio_amharic,
    date_of_birth,
    date_of_death,
    place_of_birth,
    place_of_death,
    cause_of_death,
    visibility: visibility || memorial.visibility,
    cultural_template: cultural_template || memorial.cultural_template
  };

  // Update images if uploaded
  if (uploadedFiles.profile_image) {
    updateData.profile_image = uploadedFiles.profile_image[0];
  }
  if (uploadedFiles.cover_image) {
    updateData.cover_image = uploadedFiles.cover_image[0];
  }

  const requestedGalleryImages = Array.isArray(req.body.gallery_images)
    ? req.body.gallery_images.filter((img) => typeof img === 'string')
    : null;
  const deletedImages = Array.isArray(req.body.deleted_images)
    ? req.body.deleted_images.map((item) => String(item))
    : [];

  const existingGalleryImages = Array.isArray(memorial.gallery_images)
    ? [...memorial.gallery_images]
    : [];

  let galleryImagesToSave = existingGalleryImages;

  if (requestedGalleryImages !== null) {
    galleryImagesToSave = requestedGalleryImages;
  } else if (deletedImages.length > 0) {
    galleryImagesToSave = galleryImagesToSave.filter((img, idx) => {
      const normalizedImg = String(img);
      const normalizedIdx = String(idx);
      return !deletedImages.includes(normalizedImg) && !deletedImages.includes(normalizedIdx);
    });
  }

  if (uploadedFiles.gallery_images) {
    galleryImagesToSave = [...galleryImagesToSave, ...uploadedFiles.gallery_images];
  }

  if (requestedGalleryImages !== null || deletedImages.length > 0 || uploadedFiles.gallery_images) {
    updateData.gallery_images = galleryImagesToSave;
  }

  await memorial.update(updateData);

  res.json({
    success: true,
    message: 'Memorial updated successfully',
    data: {
      memorial
    }
  });
});

// @desc    Delete memorial
// @route   DELETE /api/v1/memorials/:id
// @access  Private
const deleteMemorial = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const memorial = await Memorial.findByPk(id);

  if (!memorial) {
    return res.status(404).json({
      success: false,
      message: 'Memorial not found'
    });
  }

  // Check ownership
  if (memorial.user_id !== req.user.user_id && req.user.role !== 'Administrator') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. You can only delete your own memorials.'
    });
  }

  // Archive instead of delete to preserve data integrity
  await memorial.archive(req.user.user_id);

  res.json({
    success: true,
    message: 'Memorial archived successfully'
  });
});

// @desc    Get user's memorials
// @route   GET /api/v1/memorials/my-memorials
// @access  Private
const getMyMemorials = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status = 'active' } = req.query;
  const offset = (page - 1) * limit;

  const where = { user_id: req.user.user_id };
  
  if (status === 'active') {
    where.is_active = true;
  } else if (status === 'archived') {
    where.is_active = false;
  }

  const { count, rows: memorials } = await Memorial.findAndCountAll({
    where,
    order: [['created_at', 'DESC']],
    limit: parseInt(limit),
    offset: parseInt(offset)
  });

  res.json({
    success: true,
    data: {
      memorials,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(count / limit),
        total_records: count,
        per_page: parseInt(limit)
      }
    }
  });
});

// @desc    Get featured memorials
// @route   GET /api/v1/memorials/featured
// @access  Public
const getFeaturedMemorials = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;

  const memorials = await Memorial.getFeaturedMemorials(parseInt(limit));

  res.json({
    success: true,
    data: {
      memorials
    }
  });
});

// @desc    Search memorials
// @route   GET /api/v1/memorials/search
// @access  Public
const searchMemorials = asyncHandler(async (req, res) => {
  const { q, page = 1, limit = 20, cultural_template } = req.query;

  if (!q || q.trim().length < 2) {
    return res.status(400).json({
      success: false,
      message: 'Search query must be at least 2 characters long'
    });
  }

  const offset = (page - 1) * limit;

  const where = {
    paid_status: true,
    is_active: true,
    is_hidden_by_admin: false,
    review_status: {
      [Op.ne]: 'HIDDEN',
    },
    // Effective public visibility as in getMemorials
    [Op.and]: [
      {
        [Op.or]: [
          { admin_visibility: 'FORCE_PUBLIC' },
          {
            admin_visibility: 'NONE',
            visibility: 'PUBLIC',
          },
        ],
      },
    ],
    [Op.or]: [
      { deceased_name: { [Op.iLike]: `%${q}%` } },
      { deceased_name_amharic: { [Op.iLike]: `%${q}%` } },
      { bio: { [Op.iLike]: `%${q}%` } },
      { place_of_birth: { [Op.iLike]: `%${q}%` } },
      { place_of_death: { [Op.iLike]: `%${q}%` } }
    ]
  };

  if (cultural_template) {
    where.cultural_template = cultural_template;
  }

  const { count, rows: memorials } = await Memorial.findAndCountAll({
    where,
    include: [
      {
        model: User,
        as: 'creator',
        attributes: ['user_id', 'name']
      }
    ],
    order: [['is_featured', 'DESC'], ['view_count', 'DESC']],
    limit: parseInt(limit),
    offset: parseInt(offset)
  });

  res.json({
    success: true,
    data: {
      memorials,
      search_query: q,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(count / limit),
        total_records: count,
        per_page: parseInt(limit)
      }
    }
  });
});

module.exports = {
  getMemorials,
  getMemorial,
  createMemorial,
  updateMemorial,
  deleteMemorial,
  getMyMemorials,
  getFeaturedMemorials,
  searchMemorials
};
