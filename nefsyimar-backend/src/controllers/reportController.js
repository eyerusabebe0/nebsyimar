const { Report, Memorial, MemorialComment, User, UserStatusHistory } = require('../models');
const { asyncHandler } = require('../middleware/errorMiddleware');

// Helper to normalize category and infer severity
const normalizeCategoryAndSeverity = (rawCategory) => {
  const allowedCategories = ['ABUSE', 'SPAM', 'INAPPROPRIATE', 'ILLEGAL', 'OTHER'];
  const category = allowedCategories.includes(rawCategory) ? rawCategory : 'OTHER';

  let severity = 'LOW';
  if (category === 'SPAM') severity = 'MEDIUM';
  if (category === 'INAPPROPRIATE') severity = 'MEDIUM';
  if (category === 'ABUSE') severity = 'HIGH';
  if (category === 'ILLEGAL') severity = 'CRITICAL';

  return { category, severity };
};

// @desc    Report a memorial
// @route   POST /api/v1/memorials/:memorialId/report
// @access  Private (authenticated users)
const reportMemorial = asyncHandler(async (req, res) => {
  const { memorialId } = req.params;
  const { category: rawCategory, reason } = req.body;

  const memorial = await Memorial.findByPk(memorialId, {
    include: [
      {
        model: User,
        as: 'creator',
        attributes: ['user_id', 'name', 'email'],
      },
    ],
  });

  if (!memorial || !memorial.is_active) {
    return res.status(404).json({
      success: false,
      message: 'Memorial not found',
    });
  }

  const { category, severity } = normalizeCategoryAndSeverity(rawCategory);

  const report = await Report.create({
    reporter_id: req.user.user_id,
    reported_user_id: memorial.user_id,
    memorial_id: memorial.memorial_id,
    comment_id: null,
    target_type: 'MEMORIAL',
    target_id: memorial.memorial_id,
    category,
    reason: reason || null,
    severity,
  });

  // If high-risk, mark memorial as needing review
  if (severity === 'HIGH' || severity === 'CRITICAL') {
    memorial.review_status = 'NEEDS_REVIEW';
    await memorial.save({ fields: ['review_status'] });
  }

  return res.status(201).json({
    success: true,
    message: 'Report submitted. Our moderation team will review this memorial.',
    data: { report },
  });
});

// @desc    Report a memorial comment
// @route   POST /api/v1/memorials/:memorialId/comments/:commentId/report
// @access  Private (authenticated users)
const reportMemorialComment = asyncHandler(async (req, res) => {
  const { memorialId, commentId } = req.params;
  const { category: rawCategory, reason } = req.body;

  const comment = await MemorialComment.findByPk(commentId);

  if (!comment || comment.memorial_id !== memorialId || comment.is_deleted) {
    return res.status(404).json({
      success: false,
      message: 'Comment not found',
    });
  }

  const memorial = await Memorial.findByPk(memorialId);

  if (!memorial || !memorial.is_active) {
    return res.status(404).json({
      success: false,
      message: 'Memorial not found',
    });
  }

  const { category, severity } = normalizeCategoryAndSeverity(rawCategory);

  const report = await Report.create({
    reporter_id: req.user.user_id,
    reported_user_id: comment.user_id,
    memorial_id: memorial.memorial_id,
    comment_id: comment.comment_id,
    target_type: 'COMMENT',
    target_id: comment.comment_id,
    category,
    reason: reason || null,
    severity,
  });

  // For severe comment reports, mark the memorial as needing review
  if (severity === 'HIGH' || severity === 'CRITICAL') {
    memorial.review_status = 'NEEDS_REVIEW';
    await memorial.save({ fields: ['review_status'] });
  }

  return res.status(201).json({
    success: true,
    message: 'Report submitted. Our moderation team will review this comment.',
    data: { report },
  });
});

// @desc    Get moderation queue of reports (admin)
// @route   GET /api/v1/admin/reports
// @access  Admin
const listReports = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, severity, target_type } = req.query;
  const offset = (page - 1) * limit;

  const where = {};
  if (status) where.status = status;
  if (severity) where.severity = severity;
  if (target_type) where.target_type = target_type;

  const { count, rows: reports } = await Report.findAndCountAll({
    where,
    include: [
      {
        model: User,
        as: 'reporter',
        attributes: ['user_id', 'name', 'email'],
      },
      {
        model: User,
        as: 'reported_user',
        attributes: ['user_id', 'name', 'email'],
      },
      {
        model: Memorial,
        as: 'memorial',
        attributes: ['memorial_id', 'deceased_name', 'visibility', 'review_status', 'is_hidden_by_admin'],
      },
      {
        model: MemorialComment,
        as: 'comment',
        attributes: ['comment_id', 'message', 'visibility', 'is_deleted'],
      },
    ],
    order: [
      ['status', 'ASC'], // OPEN first
      ['severity', 'DESC'],
      ['created_at', 'DESC'],
    ],
    limit: parseInt(limit),
    offset: parseInt(offset),
  });

  res.json({
    success: true,
    data: {
      reports,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(count / limit),
        total_records: count,
        per_page: parseInt(limit),
      },
    },
  });
});

// @desc    Apply moderation decision to a report (admin)
// @route   POST /api/v1/admin/reports/:reportId/decision
// @access  Admin
const decideReport = asyncHandler(async (req, res) => {
  const { reportId } = req.params;
  const {
    status: newStatus,
    resolution: requestedResolution,
    hideMemorial,
    deleteComment,
    sensitivityLevel,
    banUser,
    warnUser,
    admin_notes,
  } = req.body;

  const report = await Report.findByPk(reportId);

  if (!report) {
    return res.status(404).json({
      success: false,
      message: 'Report not found',
    });
  }

  // Act on memorial if requested
  if (hideMemorial && report.memorial_id) {
    const memorial = await Memorial.findByPk(report.memorial_id);
    if (memorial) {
      memorial.is_hidden_by_admin = true;
      memorial.review_status = 'HIDDEN';
      await memorial.save({ fields: ['is_hidden_by_admin', 'review_status'] });
    }
  }

  if (sensitivityLevel && report.memorial_id) {
    const memorial = await Memorial.findByPk(report.memorial_id);
    if (memorial) {
      memorial.sensitivity_level = sensitivityLevel;
      if (sensitivityLevel === 'SENSITIVE') {
        memorial.review_status = 'SENSITIVE';
      }
      await memorial.save({ fields: ['sensitivity_level', 'review_status'] });
    }
  }

  // Act on comment if requested
  if (deleteComment && report.comment_id) {
    const comment = await MemorialComment.findByPk(report.comment_id);
    if (comment && !comment.is_deleted) {
      comment.is_deleted = true;
      comment.deleted_at = new Date();
      comment.deleted_by = req.user.user_id;
      await comment.save({ fields: ['is_deleted', 'deleted_at', 'deleted_by'] });
    }
  }

  // Act on reported user (ban/warn)
  if (banUser && report.reported_user_id) {
    const user = await User.findByPk(report.reported_user_id);
    if (user && !user.is_banned) {
      const previous_is_active = user.is_active;
      const previous_is_banned = user.is_banned;

      user.is_banned = true;
      user.is_active = false;
      user.ban_reason = admin_notes || 'Banned via content moderation';
      user.banned_at = new Date();
      user.banned_by = req.user.user_id;
      await user.save();

      await UserStatusHistory.create({
        user_id: user.user_id,
        changed_by: req.user.user_id,
        action: 'BAN',
        reason: user.ban_reason,
        note: 'Banned due to reported content',
        previous_is_active,
        previous_is_banned,
        new_is_active: user.is_active,
        new_is_banned: user.is_banned,
      });
    }
  }

  // TODO: implement actual user warnings (notifications) if needed
  if (warnUser && report.reported_user_id) {
    // For now, just record in resolution type; notification system can use this later.
  }

  // Update report status & resolution
  if (newStatus) {
    report.status = newStatus;
  } else {
    report.status = 'RESOLVED';
  }

  let finalResolution = requestedResolution || report.resolution;

  if (hideMemorial) finalResolution = 'CONTENT_HIDDEN';
  if (deleteComment) finalResolution = 'CONTENT_DELETED';
  if (banUser) finalResolution = 'USER_BANNED';
  if (warnUser) finalResolution = 'USER_WARNED';

  report.resolution = finalResolution || report.resolution || 'NO_ACTION';
  report.admin_notes = admin_notes || report.admin_notes;
  report.resolved_by = req.user.user_id;
  report.resolved_at = new Date();

  await report.save();

  res.json({
    success: true,
    message: 'Moderation decision applied successfully',
    data: { report },
  });
});

module.exports = {
  reportMemorial,
  reportMemorialComment,
  listReports,
  decideReport,
};
