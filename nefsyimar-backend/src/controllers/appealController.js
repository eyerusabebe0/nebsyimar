const { Appeal, User, Memorial, MemorialComment, Report, Dispute, Order, UserStatusHistory } = require('../models');
const { asyncHandler } = require('../middleware/errorMiddleware');
const { logAdminAction } = require('../utils/adminAudit');
const { sequelize } = require('../config/database');
const { Op } = require('sequelize');

// User-facing: submit an appeal
const submitAppeal = asyncHandler(async (req, res) => {
  const { target_type, target_id, reason, related_report_id, related_dispute_id } = req.body || {};

  const allowedTargetTypes = ['MEMORIAL', 'COMMENT', 'USER', 'DISPUTE', 'ORDER', 'OTHER'];
  if (!target_type || !allowedTargetTypes.includes(target_type)) {
    return res.status(400).json({
      success: false,
      message: `Invalid target_type. Must be one of: ${allowedTargetTypes.join(', ')}`,
    });
  }

  if (!target_id) {
    return res.status(400).json({
      success: false,
      message: 'target_id is required',
    });
  }

  // Ensure standing and that the target exists
  const userId = req.user.user_id;

  if (target_type === 'MEMORIAL') {
    const { Memorial } = require('../models');
    const memorial = await Memorial.findByPk(target_id);
    if (!memorial) {
      return res.status(404).json({ success: false, message: 'Memorial not found' });
    }
    if (memorial.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only appeal decisions affecting your own memorials',
      });
    }
  } else if (target_type === 'COMMENT') {
    const { MemorialComment } = require('../models');
    const comment = await MemorialComment.findByPk(target_id);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }
    if (comment.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only appeal decisions affecting your own comments',
      });
    }
  } else if (target_type === 'USER') {
    if (target_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only appeal decisions affecting your own account',
      });
    }
    const targetUser = await User.findByPk(target_id);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User account not found' });
    }
  } else if (target_type === 'DISPUTE') {
    const dispute = await Dispute.findByPk(target_id);
    if (!dispute) {
      return res.status(404).json({ success: false, message: 'Dispute not found' });
    }
    if (dispute.raised_by !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only appeal disputes that you raised',
      });
    }
  } else if (target_type === 'ORDER') {
    const order = await Order.findByPk(target_id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    if (order.buyer_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only appeal decisions affecting your own orders',
      });
    }
  }

  // Prevent duplicate open appeals for same user/target
  const existing = await Appeal.findOne({
    where: {
      user_id: userId,
      target_type,
      target_id,
      status: { [Op.in]: ['PENDING', 'IN_REVIEW'] },
    },
  });

  if (existing) {
    return res.status(409).json({
      success: false,
      message: 'An appeal for this item is already pending review',
    });
  }

  const appeal = await Appeal.create({
    user_id: userId,
    target_type,
    target_id,
    related_report_id,
    related_dispute_id,
    reason: reason || null,
    status: 'PENDING',
  });

  res.status(201).json({
    success: true,
    message: 'Appeal submitted. Our team will review your request.',
    data: { appeal },
  });
});

// User-facing: list my appeals
const getMyAppeals = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;
  const userId = req.user.user_id;

  const { count, rows } = await Appeal.findAndCountAll({
    where: { user_id: userId },
    order: [['created_at', 'DESC']],
    limit: parseInt(limit),
    offset: parseInt(offset),
  });

  res.json({
    success: true,
    data: {
      appeals: rows,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(count / limit),
        total_records: count,
        per_page: parseInt(limit),
      },
    },
  });
});

// Admin: list appeals
const adminListAppeals = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, target_type, user_id, assigned_to } = req.query;
  const offset = (page - 1) * limit;

  const where = {};
  if (status) where.status = status;
  if (target_type) where.target_type = target_type;
  if (user_id) where.user_id = user_id;
  if (assigned_to) where.assigned_to = assigned_to;

  const { count, rows } = await Appeal.findAndCountAll({
    where,
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['user_id', 'name', 'email'],
      },
      {
        model: User,
        as: 'assigned_to_user',
        attributes: ['user_id', 'name', 'email'],
      },
      {
        model: User,
        as: 'decided_by_user',
        attributes: ['user_id', 'name', 'email'],
      },
      {
        model: Report,
        as: 'related_report',
        attributes: ['report_id', 'target_type', 'target_id', 'status'],
      },
      {
        model: Dispute,
        as: 'related_dispute',
        attributes: ['dispute_id', 'order_id', 'status'],
      },
    ],
    order: [['created_at', 'DESC']],
    limit: parseInt(limit),
    offset: parseInt(offset),
  });

  res.json({
    success: true,
    data: {
      appeals: rows,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(count / limit),
        total_records: count,
        per_page: parseInt(limit),
      },
    },
  });
});

// Admin: get single appeal with target context
const adminGetAppeal = asyncHandler(async (req, res) => {
  const { appealId } = req.params;

  const appeal = await Appeal.findByPk(appealId, {
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['user_id', 'name', 'email'],
      },
      {
        model: User,
        as: 'assigned_to_user',
        attributes: ['user_id', 'name', 'email'],
      },
      {
        model: User,
        as: 'decided_by_user',
        attributes: ['user_id', 'name', 'email'],
      },
      {
        model: Report,
        as: 'related_report',
      },
      {
        model: Dispute,
        as: 'related_dispute',
      },
    ],
  });

  if (!appeal) {
    return res.status(404).json({
      success: false,
      message: 'Appeal not found',
    });
  }

  let target = null;

  if (appeal.target_type === 'MEMORIAL') {
    target = await Memorial.findByPk(appeal.target_id, {
      attributes: ['memorial_id', 'deceased_name', 'visibility', 'review_status', 'is_hidden_by_admin', 'sensitivity_level'],
    });
  } else if (appeal.target_type === 'COMMENT') {
    target = await MemorialComment.findByPk(appeal.target_id, {
      include: [
        {
          model: Memorial,
          as: 'memorial',
          attributes: ['memorial_id', 'deceased_name'],
        },
      ],
    });
  } else if (appeal.target_type === 'USER') {
    target = await User.findByPk(appeal.target_id, {
      attributes: ['user_id', 'name', 'email', 'is_active', 'is_banned', 'ban_reason'],
    });
  } else if (appeal.target_type === 'DISPUTE') {
    target = await Dispute.findByPk(appeal.target_id);
  } else if (appeal.target_type === 'ORDER') {
    target = await Order.findByPk(appeal.target_id, {
      attributes: ['order_id', 'order_number', 'status', 'total_amount', 'currency', 'refund_amount'],
    });
  }

  res.json({
    success: true,
    data: {
      appeal,
      target,
    },
  });
});

// Admin: assign or reassign appeal
const adminAssignAppeal = asyncHandler(async (req, res) => {
  const { appealId } = req.params;
  const { assigned_to } = req.body || {};

  const appeal = await Appeal.findByPk(appealId);

  if (!appeal) {
    return res.status(404).json({
      success: false,
      message: 'Appeal not found',
    });
  }

  let assignee = null;
  if (assigned_to) {
    assignee = await User.findByPk(assigned_to);
    if (!assignee || assignee.role !== 'Administrator') {
      return res.status(400).json({
        success: false,
        message: 'Assigned user must be a valid administrator',
      });
    }
  }

  appeal.assigned_to = assigned_to || null;
  await appeal.save();

  await logAdminAction(req, {
    action: 'APPEAL_ASSIGN',
    targetType: 'APPEAL',
    targetId: appeal.appeal_id,
    targetLabel: `${appeal.target_type}:${appeal.target_id}`,
    metadata: {
      assigned_to: appeal.assigned_to,
    },
  });

  res.json({
    success: true,
    message: 'Appeal assignment updated successfully',
    data: { appeal },
  });
});

// Admin: decide appeal (optionally auto-reversing moderation decision)
const adminDecideAppeal = asyncHandler(async (req, res) => {
  const { appealId } = req.params;
  const { status, decision, resolution_notes, auto_apply } = req.body || {};

  const appeal = await Appeal.findByPk(appealId);

  if (!appeal) {
    return res.status(404).json({
      success: false,
      message: 'Appeal not found',
    });
  }

  if (!['PENDING', 'IN_REVIEW'].includes(appeal.status)) {
    return res.status(400).json({
      success: false,
      message: `Cannot decide appeal with status ${appeal.status}`,
    });
  }

  const allowedStatuses = ['APPROVED', 'REJECTED', 'CANCELLED'];
  if (!status || !allowedStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Invalid status. Must be one of: ${allowedStatuses.join(', ')}`,
    });
  }

  const allowedDecisions = ['UPHELD', 'OVERTURNED', 'PARTIALLY_OVERTURNED', 'OTHER'];
  if (!decision || !allowedDecisions.includes(decision)) {
    return res.status(400).json({
      success: false,
      message: `Invalid decision. Must be one of: ${allowedDecisions.join(', ')}`,
    });
  }

  const previous = appeal.toJSON();
  const shouldAutoApply = auto_apply !== false && status === 'APPROVED' && decision === 'OVERTURNED';

  // Auto-reverse original moderation in simple cases
  if (shouldAutoApply) {
    if (appeal.target_type === 'MEMORIAL') {
      const memorial = await Memorial.findByPk(appeal.target_id);
      if (memorial) {
        if (memorial.is_hidden_by_admin || memorial.review_status === 'HIDDEN') {
          memorial.is_hidden_by_admin = false;
          if (memorial.review_status === 'HIDDEN') {
            memorial.review_status = memorial.sensitivity_level === 'SENSITIVE' ? 'SENSITIVE' : 'NORMAL';
          }
          await memorial.save({ fields: ['is_hidden_by_admin', 'review_status'] });
        }
      }
    } else if (appeal.target_type === 'COMMENT') {
      const comment = await MemorialComment.findByPk(appeal.target_id);
      if (comment) {
        if (comment.is_deleted || comment.visibility === 'REJECTED') {
          comment.is_deleted = false;
          comment.deleted_at = null;
          comment.deleted_by = null;
          comment.visibility = 'PUBLIC';
          await comment.save({ fields: ['is_deleted', 'deleted_at', 'deleted_by', 'visibility'] });
        }
      }
    } else if (appeal.target_type === 'USER') {
      const targetUser = await User.findByPk(appeal.target_id);
      if (targetUser) {
        const wasBanned = targetUser.is_banned;
        const wasInactive = !targetUser.is_active;
        if (wasBanned || wasInactive) {
          const prevActive = targetUser.is_active;
          const prevBanned = targetUser.is_banned;

          targetUser.is_banned = false;
          targetUser.is_active = true;
          targetUser.ban_reason = null;
          targetUser.banned_at = null;
          targetUser.banned_by = null;
          await targetUser.save();

          await UserStatusHistory.create({
            user_id: targetUser.user_id,
            changed_by: req.user.user_id,
            action: wasBanned ? 'UNBAN' : 'REACTIVATE',
            reason: resolution_notes || 'Appeal approved – decision overturned',
            note: 'Automatic reversal via appeal',
            previous_is_active: prevActive,
            previous_is_banned: prevBanned,
            new_is_active: targetUser.is_active,
            new_is_banned: targetUser.is_banned,
          });
        }
      }
    }
  }

  // Update appeal record
  appeal.status = status;
  appeal.decision = decision;
  appeal.decided_by = req.user.user_id;
  appeal.decided_at = new Date();
  if (typeof resolution_notes === 'string') {
    appeal.resolution_notes = resolution_notes;
  }

  const meta = appeal.metadata || {};
  meta.auto_applied = shouldAutoApply;
  appeal.metadata = meta;

  await appeal.save();

  await logAdminAction(req, {
    action: 'APPEAL_DECIDE',
    targetType: 'APPEAL',
    targetId: appeal.appeal_id,
    targetLabel: `${appeal.target_type}:${appeal.target_id}`,
    metadata: {
      previous,
      updated: appeal.toJSON(),
    },
  });

  res.json({
    success: true,
    message: 'Appeal decision recorded successfully',
    data: {
      appeal,
    },
  });
});

module.exports = {
  submitAppeal,
  getMyAppeals,
  adminListAppeals,
  adminGetAppeal,
  adminAssignAppeal,
  adminDecideAppeal,
};
