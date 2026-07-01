const { Memorial, MemorialComment, User, MemorialCommentLike } = require('../models');
const { asyncHandler } = require('../middleware/errorMiddleware');

// @desc    Get comments for a memorial
// @route   GET /api/v1/memorials/:memorialId/comments
// @access  Public (with optional auth)
const getMemorialComments = asyncHandler(async (req, res) => {
  const { memorialId } = req.params;
  const { page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  const memorial = await Memorial.findByPk(memorialId);

  if (!memorial || !memorial.is_active) {
    return res.status(404).json({
      success: false,
      message: 'Memorial not found',
    });
  }

  const { count, rows: comments } = await MemorialComment.findAndCountAll({
    where: {
      memorial_id: memorialId,
      is_deleted: false,
      visibility: 'PUBLIC',
    },
    include: [
      {
        model: User,
        as: 'author',
        attributes: ['user_id', 'name', 'profile_image'],
      },
    ],
    order: [['created_at', 'DESC']],
    limit: parseInt(limit),
    offset: parseInt(offset),
  });

  // Mark which comments are liked by current user
  let likedCommentIds = [];
  if (req.user && comments.length > 0) {
    const userLikes = await MemorialCommentLike.findAll({
      where: {
        user_id: req.user.user_id,
        comment_id: comments.map((c) => c.comment_id),
      },
      attributes: ['comment_id'],
    });
    likedCommentIds = userLikes.map((l) => l.comment_id);
  }

  const enriched = comments.map((c) => {
    const json = c.toJSON();
    json.liked_by_current_user = likedCommentIds.includes(c.comment_id);
    return json;
  });

  res.json({
    success: true,
    data: {
      comments: enriched,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(count / limit),
        total_records: count,
        per_page: parseInt(limit),
      },
    },
  });
});

// @desc    Add a comment to a memorial
// @route   POST /api/v1/memorials/:memorialId/comments
// @access  Private (authenticated users)
const addMemorialComment = asyncHandler(async (req, res) => {
  const { memorialId } = req.params;
  const { message } = req.body;

  if (req.user && req.user.can_comment === false) {
    return res.status(403).json({
      success: false,
      message: 'You are not allowed to post comments.',
    });
  }

  if (!message || !message.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Comment message is required',
    });
  }

  const memorial = await Memorial.findByPk(memorialId);

  if (!memorial || !memorial.is_active) {
    return res.status(404).json({
      success: false,
      message: 'Memorial not found',
    });
  }

  if (memorial.comments_locked) {
    return res.status(403).json({
      success: false,
      message: 'Comments are locked for this memorial',
    });
  }

  const settings = memorial.memorial_settings || {};
  if (settings.allow_comments === false) {
    return res.status(403).json({
      success: false,
      message: 'Comments are disabled for this memorial',
    });
  }

  // All new comments are created as PUBLIC
  const comment = await MemorialComment.create({
    memorial_id: memorialId,
    user_id: req.user.user_id,
    message: message.trim(),
    visibility: 'PUBLIC',
  });

  const fullComment = await MemorialComment.findByPk(comment.comment_id, {
    include: [
      {
        model: User,
        as: 'author',
        attributes: ['user_id', 'name', 'profile_image'],
      },
    ],
  });

  const json = fullComment.toJSON();
  json.liked_by_current_user = false;

  res.status(201).json({
    success: true,
    message: 'Comment added successfully',
    data: {
      comment: json,
    },
  });
});

// @desc    Delete a memorial comment (soft delete)
// @route   DELETE /api/v1/memorials/:memorialId/comments/:commentId
// @access  Private (admin, memorial owner, or comment owner)
const deleteMemorialComment = asyncHandler(async (req, res) => {
  const { memorialId, commentId } = req.params;

  const comment = await MemorialComment.findByPk(commentId);

  if (!comment || comment.memorial_id !== memorialId) {
    return res.status(404).json({
      success: false,
      message: 'Comment not found',
    });
  }

  const memorial = await Memorial.findByPk(memorialId);

  const isAdmin = req.user.role === 'Administrator';
  const isCommentOwner = comment.user_id === req.user.user_id;
  const isMemorialOwner = memorial && memorial.user_id === req.user.user_id;

  if (!isAdmin && !isCommentOwner && !isMemorialOwner) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. You cannot delete this comment.',
    });
  }

  comment.is_deleted = true;
  comment.deleted_at = new Date();
  comment.deleted_by = req.user.user_id;
  await comment.save();

  res.json({
    success: true,
    message: 'Comment deleted successfully',
  });
});

// @desc    Toggle like on a memorial comment
// @route   POST /api/v1/memorials/:memorialId/comments/:commentId/like
// @access  Private
const toggleMemorialCommentLike = asyncHandler(async (req, res) => {
  const { memorialId, commentId } = req.params;

  const comment = await MemorialComment.findByPk(commentId);

  if (!comment || comment.memorial_id !== memorialId || comment.is_deleted) {
    return res.status(404).json({
      success: false,
      message: 'Comment not found',
    });
  }

  const existing = await MemorialCommentLike.findOne({
    where: {
      comment_id: commentId,
      user_id: req.user.user_id,
    },
  });

  let liked;

  if (existing) {
    await existing.destroy();
    comment.likes_count = Math.max(0, (comment.likes_count || 0) - 1);
    liked = false;
  } else {
    await MemorialCommentLike.create({
      comment_id: commentId,
      user_id: req.user.user_id,
    });
    comment.likes_count = (comment.likes_count || 0) + 1;
    liked = true;
  }

  await comment.save();

  res.json({
    success: true,
    data: {
      liked,
      likes_count: comment.likes_count,
    },
  });
});

module.exports = {
  getMemorialComments,
  addMemorialComment,
  deleteMemorialComment,
  toggleMemorialCommentLike,
};
