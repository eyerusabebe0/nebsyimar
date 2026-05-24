const { Memorial, User, GiftTransaction, MemorialComment, Notification } = require('../models');
const { asyncHandler } = require('../middleware/errorMiddleware');
const { sequelize } = require('../config/database');

// @desc    Get user dashboard data
// @route   GET /api/v1/user/dashboard
// @access  Private
const getDashboardData = asyncHandler(async (req, res) => {
  const userId = req.user.user_id;

  // Get user's memorials with stats
  const memorials = await Memorial.findAll({
    where: {
      user_id: userId,
      is_active: true
    },
    attributes: [
      'memorial_id',
      'deceased_name',
      'deceased_name_amharic',
      'date_of_birth',
      'date_of_death',
      'profile_image',
      'visibility',
      'view_count',
      'gift_count',
      'total_gifts_value',
      'created_at',
      'memorial_settings'
    ],
    order: [['created_at', 'DESC']]
  });

  // Get total stats for user
  const totalStats = await Memorial.findOne({
    where: {
      user_id: userId,
      is_active: true
    },
    attributes: [
      [sequelize.fn('COUNT', sequelize.col('memorial_id')), 'total_memorials'],
      [sequelize.fn('SUM', sequelize.col('view_count')), 'total_views'],
      [sequelize.fn('SUM', sequelize.col('gift_count')), 'total_gifts'],
      [sequelize.fn('SUM', sequelize.col('total_gifts_value')), 'total_gifts_value']
    ],
    raw: true
  });

  // Get recent activity (comments, gifts received)
  const recentComments = await MemorialComment.findAll({
    include: [
      {
        model: Memorial,
        as: 'memorial',
        where: { user_id: userId },
        attributes: ['memorial_id', 'deceased_name']
      },
      {
        model: User,
        as: 'author',
        attributes: ['name']
      }
    ],
    where: {
      is_deleted: false,
      visibility: 'PUBLIC'
    },
    order: [['created_at', 'DESC']],
    limit: 5
  });

  // Get recent gifts received
  const recentGifts = await GiftTransaction.findAll({
    include: [
      {
        model: Memorial,
        as: 'memorial',
        where: { user_id: userId },
        attributes: ['memorial_id', 'deceased_name']
      }
    ],
    where: {
      status: 'COMPLETED'
    },
    order: [['created_at', 'DESC']],
    limit: 5
  });

  // Get pending notifications count
  const pendingNotifications = await Notification.count({
    where: {
      user_id: userId,
      is_read: false
    }
  });

  // Get pending comments count (for memorials with approval required)
  const pendingCommentsCount = await MemorialComment.count({
    include: [
      {
        model: Memorial,
        as: 'memorial',
        where: { 
          user_id: userId,
          memorial_settings: {
            comment_moderation: 'approval_required'
          }
        }
      }
    ],
    where: {
      visibility: 'PENDING',
      is_deleted: false
    }
  });

  res.json({
    success: true,
    data: {
      memorials: memorials.map(memorial => ({
        id: memorial.memorial_id,
        deceased_name: memorial.deceased_name,
        deceased_name_amharic: memorial.deceased_name_amharic,
        date_of_birth: memorial.date_of_birth,
        date_of_death: memorial.date_of_death,
        profile_image: memorial.profile_image,
        visibility: memorial.visibility,
        view_count: parseInt(memorial.view_count) || 0,
        gift_count: parseInt(memorial.gift_count) || 0,
        total_gifts_value: parseFloat(memorial.total_gifts_value) || 0,
        created_at: memorial.created_at,
        memorial_settings: memorial.memorial_settings
      })),
      stats: {
        total_memorials: parseInt(totalStats?.total_memorials || 0),
        total_views: parseInt(totalStats?.total_views || 0),
        total_gifts: parseInt(totalStats?.total_gifts || 0),
        total_gifts_value: parseFloat(totalStats?.total_gifts_value || 0),
        pending_notifications: pendingNotifications,
        pending_comments: pendingCommentsCount
      },
      recent_activity: {
        comments: recentComments.map(comment => ({
          id: comment.comment_id,
          message: comment.message,
          author_name: comment.author?.name || 'Anonymous',
          memorial_name: comment.memorial?.deceased_name,
          memorial_id: comment.memorial?.memorial_id,
          created_at: comment.created_at
        })),
        gifts: recentGifts.map(gift => ({
          id: gift.txn_id,
          gift_type: gift.gift_type,
          amount: gift.amount,
          sender_name: gift.sender_name || 'Anonymous',
          memorial_name: gift.memorial?.deceased_name,
          memorial_id: gift.memorial?.memorial_id,
          created_at: gift.created_at
        }))
      }
    }
  });
});

// @desc    Delete a comment from user's memorial (via dashboard)
// @route   DELETE /api/v1/user/memorials/:memorialId/comments/:commentId
// @access  Private
const deleteComment = asyncHandler(async (req, res) => {
  const userId = req.user.user_id;
  const { memorialId, commentId } = req.params;

  // Verify memorial ownership
  const memorial = await Memorial.findOne({
    where: {
      memorial_id: memorialId,
      user_id: userId,
      is_active: true,
    },
  });

  if (!memorial) {
    return res.status(404).json({
      success: false,
      message: 'Memorial not found or you do not have permission to manage comments',
    });
  }

  const comment = await MemorialComment.findOne({
    where: {
      comment_id: commentId,
      memorial_id: memorialId,
      is_deleted: false,
    },
  });

  if (!comment) {
    return res.status(404).json({
      success: false,
      message: 'Comment not found',
    });
  }

  comment.is_deleted = true;
  comment.deleted_at = new Date();
  comment.deleted_by = userId;
  await comment.save();

  res.json({
    success: true,
    message: 'Comment deleted successfully',
  });
});

// @desc    Get user's memorials
// @route   GET /api/v1/user/memorials
// @access  Private
const getUserMemorials = asyncHandler(async (req, res) => {
  const userId = req.user.user_id;
  const { page = 1, limit = 10, status = 'all' } = req.query;
  const offset = (page - 1) * limit;

  const where = {
    user_id: userId,
    is_active: true
  };

  if (status !== 'all') {
    where.visibility = status.toUpperCase();
  }

  const { count, rows: memorials } = await Memorial.findAndCountAll({
    where,
    attributes: [
      'memorial_id',
      'deceased_name',
      'deceased_name_amharic',
      'date_of_birth',
      'date_of_death',
      'profile_image',
      'cover_image',
      'visibility',
      'view_count',
      'gift_count',
      'total_gifts_value',
      'created_at',
      'memorial_settings'
    ],
    order: [['created_at', 'DESC']],
    limit: parseInt(limit),
    offset: parseInt(offset)
  });

  res.json({
    success: true,
    data: {
      memorials: memorials.map(memorial => ({
        id: memorial.memorial_id,
        deceased_name: memorial.deceased_name,
        deceased_name_amharic: memorial.deceased_name_amharic,
        date_of_birth: memorial.date_of_birth,
        date_of_death: memorial.date_of_death,
        profile_image: memorial.profile_image,
        cover_image: memorial.cover_image,
        visibility: memorial.visibility,
        view_count: parseInt(memorial.view_count) || 0,
        gift_count: parseInt(memorial.gift_count) || 0,
        total_gifts_value: parseFloat(memorial.total_gifts_value) || 0,
        created_at: memorial.created_at,
        memorial_settings: memorial.memorial_settings
      })),
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(count / limit),
        total_records: count,
        per_page: parseInt(limit)
      }
    }
  });
});

// @desc    Update memorial settings
// @route   PUT /api/v1/user/memorials/:memorialId/settings
// @access  Private
const updateMemorialSettings = asyncHandler(async (req, res) => {
  const userId = req.user.user_id;
  const { memorialId } = req.params;
  const { memorial_settings } = req.body;

  const memorial = await Memorial.findOne({
    where: {
      memorial_id: memorialId,
      user_id: userId,
      is_active: true
    }
  });

  if (!memorial) {
    return res.status(404).json({
      success: false,
      message: 'Memorial not found or you do not have permission to modify it'
    });
  }

  // Validate memorial settings structure
  const validSettings = {
    allow_comments: memorial_settings.allow_comments !== undefined ? memorial_settings.allow_comments : true,
    comment_moderation: ['none', 'moderate', 'approval_required'].includes(memorial_settings.comment_moderation) 
      ? memorial_settings.comment_moderation : 'none',
    auto_approve_family: memorial_settings.auto_approve_family !== undefined ? memorial_settings.auto_approve_family : false,
    blocked_users: Array.isArray(memorial_settings.blocked_users) ? memorial_settings.blocked_users : [],
    allow_gifts: memorial_settings.allow_gifts !== undefined ? memorial_settings.allow_gifts : true,
    allow_stories: memorial_settings.allow_stories !== undefined ? memorial_settings.allow_stories : true,
    show_gift_amounts: memorial_settings.show_gift_amounts !== undefined ? memorial_settings.show_gift_amounts : true,
    notification_preferences: {
      new_gifts: memorial_settings.notification_preferences?.new_gifts !== undefined 
        ? memorial_settings.notification_preferences.new_gifts : true,
      new_comments: memorial_settings.notification_preferences?.new_comments !== undefined 
        ? memorial_settings.notification_preferences.new_comments : true,
      new_stories: memorial_settings.notification_preferences?.new_stories !== undefined 
        ? memorial_settings.notification_preferences.new_stories : true
    }
  };

  memorial.memorial_settings = validSettings;
  await memorial.save();

  res.json({
    success: true,
    message: 'Memorial settings updated successfully',
    data: {
      memorial_settings: validSettings
    }
  });
});

// @desc    Get pending comments for user's memorials
// @route   GET /api/v1/user/memorials/pending-comments
// @access  Private
const getPendingComments = asyncHandler(async (req, res) => {
  const userId = req.user.user_id;
  const { page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  const { count, rows: comments } = await MemorialComment.findAndCountAll({
    include: [
      {
        model: Memorial,
        as: 'memorial',
        where: { 
          user_id: userId,
          memorial_settings: {
            comment_moderation: 'approval_required'
          }
        },
        attributes: ['memorial_id', 'deceased_name']
      },
      {
        model: User,
        as: 'author',
        attributes: ['user_id', 'name', 'profile_image']
      }
    ],
    where: {
      visibility: 'PENDING',
      is_deleted: false
    },
    order: [['created_at', 'DESC']],
    limit: parseInt(limit),
    offset: parseInt(offset)
  });

  res.json({
    success: true,
    data: {
      comments: comments.map(comment => ({
        id: comment.comment_id,
        message: comment.message,
        author: {
          id: comment.author?.user_id,
          name: comment.author?.name || 'Anonymous',
          profile_image: comment.author?.profile_image
        },
        memorial: {
          id: comment.memorial?.memorial_id,
          name: comment.memorial?.deceased_name
        },
        created_at: comment.created_at
      })),
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(count / limit),
        total_records: count,
        per_page: parseInt(limit)
      }
    }
  });
});

// @desc    Moderate comment (approve/reject)
// @route   POST /api/v1/user/memorials/:memorialId/comments/:commentId/moderate
// @access  Private
const moderateComment = asyncHandler(async (req, res) => {
  const userId = req.user.user_id;
  const { memorialId, commentId } = req.params;
  const { action } = req.body; // 'approve' or 'reject'

  if (!['approve', 'reject'].includes(action)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid action. Must be "approve" or "reject"'
    });
  }

  // Verify memorial ownership
  const memorial = await Memorial.findOne({
    where: {
      memorial_id: memorialId,
      user_id: userId,
      is_active: true
    }
  });

  if (!memorial) {
    return res.status(404).json({
      success: false,
      message: 'Memorial not found or you do not have permission to moderate comments'
    });
  }

  // Find the comment
  const comment = await MemorialComment.findOne({
    where: {
      comment_id: commentId,
      memorial_id: memorialId,
      visibility: 'PENDING',
      is_deleted: false
    }
  });

  if (!comment) {
    return res.status(404).json({
      success: false,
      message: 'Pending comment not found'
    });
  }

  // Update comment visibility
  if (action === 'approve') {
    comment.visibility = 'PUBLIC';
  } else {
    comment.visibility = 'REJECTED';
  }

  await comment.save();

  res.json({
    success: true,
    message: `Comment ${action}d successfully`,
    data: {
      comment_id: commentId,
      action: action,
      new_visibility: comment.visibility
    }
  });
});

// @desc    Block/unblock user from memorial
// @route   POST /api/v1/user/memorials/:memorialId/block-user
// @access  Private
const blockUser = asyncHandler(async (req, res) => {
  const userId = req.user.user_id;
  const { memorialId } = req.params;
  const { user_id_to_block, action } = req.body; // action: 'block' or 'unblock'

  if (!['block', 'unblock'].includes(action)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid action. Must be "block" or "unblock"'
    });
  }

  // Verify memorial ownership
  const memorial = await Memorial.findOne({
    where: {
      memorial_id: memorialId,
      user_id: userId,
      is_active: true
    }
  });

  if (!memorial) {
    return res.status(404).json({
      success: false,
      message: 'Memorial not found or you do not have permission to block users'
    });
  }

  const settings = memorial.memorial_settings || {};
  const blockedUsers = settings.blocked_users || [];

  if (action === 'block') {
    if (!blockedUsers.includes(user_id_to_block)) {
      blockedUsers.push(user_id_to_block);
    }
  } else {
    const index = blockedUsers.indexOf(user_id_to_block);
    if (index > -1) {
      blockedUsers.splice(index, 1);
    }
  }

  settings.blocked_users = blockedUsers;
  memorial.memorial_settings = settings;
  await memorial.save();

  res.json({
    success: true,
    message: `User ${action}ed successfully`,
    data: {
      blocked_users: blockedUsers
    }
  });
});

module.exports = {
  getDashboardData,
  getUserMemorials,
  updateMemorialSettings,
  getPendingComments,
  moderateComment,
  deleteComment,
  blockUser
};
