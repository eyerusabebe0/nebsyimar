const { Memorial, User, GiftTransaction, MemorialComment, Notification, RepatriationSubmission } = require('../models');
const { asyncHandler } = require('../middleware/errorMiddleware');
const { sequelize } = require('../config/database');
const { uploadFiles } = require('../utils/fileUpload');

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

  // Get user's body shipping submissions
  const bodyShippingSubmissions = await RepatriationSubmission.findAll({
    where: { user_id: userId },
    order: [['created_at', 'DESC']],
    attributes: [
      'submission_id',
      'deceased_full_name',
      'date_of_birth',
      'date_of_death',
      'place_of_death',
      'passport_or_id',
      'nationality',
      'current_location_body',
      'shipping_agency',
      'air_waybill_no',
      'flight_number',
      'departure_date',
      'estimated_arrival_time',
      'receiver_full_name',
      'receiver_phone',
      'receiver_email',
      'receiver_alternative_phone',
      'applicant_full_name',
      'relationship',
      'applicant_phone',
      'applicant_email',
      'death_certificate_file',
      'embalmment_cert_file',
      'embassy_permit_file',
      'status',
      'submitted_at'
    ]
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
      body_shipping_requests: bodyShippingSubmissions.map((submission) => ({
        id: submission.submission_id,
        deceased_full_name: submission.deceased_full_name,
        date_of_birth: submission.date_of_birth,
        date_of_death: submission.date_of_death,
        place_of_death: submission.place_of_death,
        passport_or_id: submission.passport_or_id,
        nationality: submission.nationality,
        current_location_body: submission.current_location_body,
        applicant_full_name: submission.applicant_full_name,
        relationship: submission.relationship,
        applicant_phone: submission.applicant_phone,
        applicant_email: submission.applicant_email,
        receiver_full_name: submission.receiver_full_name,
        receiver_phone: submission.receiver_phone,
        receiver_email: submission.receiver_email,
        receiver_alternative_phone: submission.receiver_alternative_phone,
        shipping_agency: submission.shipping_agency,
        air_waybill_no: submission.air_waybill_no,
        flight_number: submission.flight_number,
        departure_date: submission.departure_date,
        estimated_arrival_time: submission.estimated_arrival_time,
        status: submission.status,
        death_certificate_file: submission.death_certificate_file,
        embalmment_cert_file: submission.embalmment_cert_file,
        embassy_permit_file: submission.embassy_permit_file,
        submitted_at: submission.submitted_at
      })),
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

// @desc    Get user's body shipping submissions
// @route   GET /api/v1/user/repatriation-submissions
// @access  Private
const getUserRepatriationSubmissions = asyncHandler(async (req, res) => {
  const userId = req.user.user_id;

  const submissions = await RepatriationSubmission.findAll({
    where: { user_id: userId },
    order: [['created_at', 'DESC']],
    attributes: [
      'submission_id',
      'deceased_full_name',
      'date_of_birth',
      'date_of_death',
      'place_of_death',
      'passport_or_id',
      'nationality',
      'current_location_body',
      'shipping_agency',
      'air_waybill_no',
      'flight_number',
      'departure_date',
      'estimated_arrival_time',
      'receiver_full_name',
      'receiver_phone',
      'receiver_email',
      'receiver_alternative_phone',
      'applicant_full_name',
      'relationship',
      'applicant_phone',
      'applicant_email',
      'death_certificate_file',
      'embalmment_cert_file',
      'embassy_permit_file',
      'status',
      'submitted_at'
    ]
  });

  res.json({
    success: true,
    data: {
      submissions: submissions.map((submission) => ({
        id: submission.submission_id,
        deceased_full_name: submission.deceased_full_name,
        date_of_birth: submission.date_of_birth,
        date_of_death: submission.date_of_death,
        place_of_death: submission.place_of_death,
        passport_or_id: submission.passport_or_id,
        nationality: submission.nationality,
        current_location_body: submission.current_location_body,
        shipping_agency: submission.shipping_agency,
        air_waybill_no: submission.air_waybill_no,
        flight_number: submission.flight_number,
        departure_date: submission.departure_date,
        estimated_arrival_time: submission.estimated_arrival_time,
        receiver_full_name: submission.receiver_full_name,
        receiver_phone: submission.receiver_phone,
        receiver_email: submission.receiver_email,
        receiver_alternative_phone: submission.receiver_alternative_phone,
        applicant_full_name: submission.applicant_full_name,
        relationship: submission.relationship,
        applicant_phone: submission.applicant_phone,
        applicant_email: submission.applicant_email,
        status: submission.status,
        death_certificate_file: submission.death_certificate_file,
        embalmment_cert_file: submission.embalmment_cert_file,
        embassy_permit_file: submission.embassy_permit_file,
        submitted_at: submission.submitted_at
      }))
    }
  });
});

// @desc    Get a single user body shipping submission
// @route   GET /api/v1/user/repatriation-submissions/:submissionId
// @access  Private
const getUserRepatriationSubmission = asyncHandler(async (req, res) => {
  const userId = req.user.user_id;
  const { submissionId } = req.params;

  const submission = await RepatriationSubmission.findOne({
    where: { submission_id: submissionId, user_id: userId }
  });

  if (!submission) {
    return res.status(404).json({
      success: false,
      message: 'Body shipping request not found'
    });
  }

  res.json({
    success: true,
    data: {
      id: submission.submission_id,
      deceased_full_name: submission.deceased_full_name,
      date_of_birth: submission.date_of_birth,
      date_of_death: submission.date_of_death,
      place_of_death: submission.place_of_death,
      passport_or_id: submission.passport_or_id,
      nationality: submission.nationality,
      current_location_body: submission.current_location_body,
      shipping_agency: submission.shipping_agency,
      air_waybill_no: submission.air_waybill_no,
      flight_number: submission.flight_number,
      departure_date: submission.departure_date,
      estimated_arrival_time: submission.estimated_arrival_time,
      receiver_full_name: submission.receiver_full_name,
      receiver_phone: submission.receiver_phone,
      receiver_email: submission.receiver_email,
      receiver_alternative_phone: submission.receiver_alternative_phone,
      applicant_full_name: submission.applicant_full_name,
      relationship: submission.relationship,
      applicant_phone: submission.applicant_phone,
      applicant_email: submission.applicant_email,
      status: submission.status,
      death_certificate_file: submission.death_certificate_file,
      embalmment_cert_file: submission.embalmment_cert_file,
      embassy_permit_file: submission.embassy_permit_file,
      submitted_at: submission.submitted_at
    }
  });
});

// @desc    Update a body shipping submission
// @route   PUT /api/v1/user/repatriation-submissions/:submissionId
// @access  Private
const updateRepatriationSubmission = asyncHandler(async (req, res) => {
  const userId = req.user.user_id;
  const { submissionId } = req.params;

  const submission = await RepatriationSubmission.findOne({
    where: { submission_id: submissionId, user_id: userId }
  });

  if (!submission) {
    return res.status(404).json({
      success: false,
      message: 'Body shipping request not found'
    });
  }

  const {
    deceased_full_name,
    date_of_birth,
    date_of_death,
    place_of_death,
    passport_or_id,
    nationality,
    current_location_body,
    shipping_agency,
    air_waybill_no,
    flight_number,
    departure_date,
    estimated_arrival_time,
    receiver_full_name,
    receiver_phone,
    receiver_email,
    receiver_alternative_phone,
    applicant_full_name,
    relationship,
    applicant_phone,
    applicant_email,
  } = req.body;

  const filesPayload = req.files || (req.file ? { death_certificate_file: req.file } : {});
  const fileData = await uploadFiles(filesPayload, 'repatriation');

  submission.deceased_full_name = deceased_full_name;
  submission.date_of_birth = date_of_birth;
  submission.date_of_death = date_of_death;
  submission.place_of_death = place_of_death;
  submission.passport_or_id = passport_or_id;
  submission.nationality = nationality;
  submission.current_location_body = current_location_body;
  submission.shipping_agency = shipping_agency;
  submission.air_waybill_no = air_waybill_no;
  submission.flight_number = flight_number;
  submission.departure_date = departure_date;
  submission.estimated_arrival_time = estimated_arrival_time;
  submission.receiver_full_name = receiver_full_name;
  submission.receiver_phone = receiver_phone;
  submission.receiver_email = receiver_email;
  submission.receiver_alternative_phone = receiver_alternative_phone;
  submission.applicant_full_name = applicant_full_name;
  submission.relationship = relationship;
  submission.applicant_phone = applicant_phone;
  submission.applicant_email = applicant_email;

  if (fileData.death_certificate_file?.[0]) {
    submission.death_certificate_file = fileData.death_certificate_file[0];
  }

  await submission.save();

  res.json({
    success: true,
    message: 'Body shipping request updated successfully',
    data: {
      id: submission.submission_id,
      deceased_full_name: submission.deceased_full_name,
      date_of_birth: submission.date_of_birth,
      date_of_death: submission.date_of_death,
      place_of_death: submission.place_of_death,
      passport_or_id: submission.passport_or_id,
      nationality: submission.nationality,
      current_location_body: submission.current_location_body,
      shipping_agency: submission.shipping_agency,
      air_waybill_no: submission.air_waybill_no,
      flight_number: submission.flight_number,
      departure_date: submission.departure_date,
      estimated_arrival_time: submission.estimated_arrival_time,
      receiver_full_name: submission.receiver_full_name,
      receiver_phone: submission.receiver_phone,
      receiver_email: submission.receiver_email,
      receiver_alternative_phone: submission.receiver_alternative_phone,
      applicant_full_name: submission.applicant_full_name,
      relationship: submission.relationship,
      applicant_phone: submission.applicant_phone,
      applicant_email: submission.applicant_email,
      status: submission.status,
      death_certificate_file: submission.death_certificate_file,
      embalmment_cert_file: submission.embalmment_cert_file,
      embassy_permit_file: submission.embassy_permit_file,
      submitted_at: submission.submitted_at
    }
  });
});

// @desc    Delete a user body shipping submission
// @route   DELETE /api/v1/user/repatriation-submissions/:submissionId
// @access  Private
const deleteRepatriationSubmission = asyncHandler(async (req, res) => {
  const userId = req.user.user_id;
  const { submissionId } = req.params;

  const submission = await RepatriationSubmission.findOne({
    where: { submission_id: submissionId, user_id: userId }
  });

  if (!submission) {
    return res.status(404).json({
      success: false,
      message: 'Body shipping request not found'
    });
  }

  await submission.destroy();

  res.json({
    success: true,
    message: 'Body shipping request deleted successfully'
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
  blockUser,
  getUserRepatriationSubmissions,
  getUserRepatriationSubmission,
  updateRepatriationSubmission,
  deleteRepatriationSubmission
};
