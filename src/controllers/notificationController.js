const { Notification, User } = require('../models');
const { asyncHandler } = require('../middleware/errorMiddleware');
const { Op } = require('sequelize');

// @desc    Get user notifications
// @route   GET /api/v1/notifications
// @access  Private
const getNotifications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, unread_only = false } = req.query;
  const offset = (page - 1) * limit;

  const where = { 
    user_id: req.user.user_id,
    // Don't show expired notifications
    [Op.or]: [
      { expires_at: null },
      { expires_at: { [Op.gt]: new Date() } }
    ]
  };

  if (unread_only === 'true') {
    where.is_read = false;
  }

  const { count, rows: notifications } = await Notification.findAndCountAll({
    where,
    order: [['createdAt', 'DESC']],
    limit: parseInt(limit),
    offset: parseInt(offset)
  });

  // Get unread count
  const unreadCount = await Notification.count({
    where: {
      user_id: req.user.user_id,
      is_read: false,
      [Op.or]: [
        { expires_at: null },
        { expires_at: { [Op.gt]: new Date() } }
      ]
    }
  });

  res.json({
    success: true,
    data: {
      notifications,
      unread_count: unreadCount,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(count / limit),
        total_records: count,
        per_page: parseInt(limit)
      }
    }
  });
});

// @desc    Mark notification as read
// @route   PUT /api/v1/notifications/:notificationId/read
// @access  Private
const markAsRead = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;

  const notification = await Notification.findOne({
    where: {
      notification_id: notificationId,
      user_id: req.user.user_id
    }
  });

  if (!notification) {
    return res.status(404).json({
      success: false,
      message: 'Notification not found'
    });
  }

  await notification.update({
    is_read: true,
    read_at: new Date()
  });

  res.json({
    success: true,
    message: 'Notification marked as read',
    data: { notification }
  });
});

// @desc    Mark all notifications as read
// @route   PUT /api/v1/notifications/read-all
// @access  Private
const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.update(
    {
      is_read: true,
      read_at: new Date()
    },
    {
      where: {
        user_id: req.user.user_id,
        is_read: false
      }
    }
  );

  res.json({
    success: true,
    message: 'All notifications marked as read'
  });
});

// @desc    Delete notification
// @route   DELETE /api/v1/notifications/:notificationId
// @access  Private
const deleteNotification = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;

  const notification = await Notification.findOne({
    where: {
      notification_id: notificationId,
      user_id: req.user.user_id
    }
  });

  if (!notification) {
    return res.status(404).json({
      success: false,
      message: 'Notification not found'
    });
  }

  await notification.destroy();

  res.json({
    success: true,
    message: 'Notification deleted successfully'
  });
});

// @desc    Get notification statistics
// @route   GET /api/v1/notifications/stats
// @access  Private
const getNotificationStats = asyncHandler(async (req, res) => {
  const userId = req.user.user_id;

  const stats = await Promise.all([
    // Total notifications
    Notification.count({
      where: { user_id: userId }
    }),
    
    // Unread notifications
    Notification.count({
      where: { 
        user_id: userId,
        is_read: false,
        [Op.or]: [
          { expires_at: null },
          { expires_at: { [Op.gt]: new Date() } }
        ]
      }
    }),
    
    // Notifications by type
    Notification.findAll({
      attributes: [
        'type',
        [Notification.sequelize.fn('COUNT', Notification.sequelize.col('notification_id')), 'count']
      ],
      where: { user_id: userId },
      group: ['type']
    })
  ]);

  const [totalCount, unreadCount, typeStats] = stats;

  res.json({
    success: true,
    data: {
      total_notifications: totalCount,
      unread_notifications: unreadCount,
      read_notifications: totalCount - unreadCount,
      by_type: typeStats.map(stat => ({
        type: stat.type,
        count: parseInt(stat.dataValues.count)
      }))
    }
  });
});

// Utility function to create notifications (used by other controllers)
const createNotification = async (userId, type, title, message, data = null, actionUrl = null, priority = 'MEDIUM') => {
  try {
    const notification = await Notification.create({
      user_id: userId,
      type,
      title,
      message,
      data,
      action_url: actionUrl,
      priority
    });
    
    return notification;
  } catch (error) {
    console.error('Failed to create notification:', error);
    return null;
  }
};

// Utility function to send bulk notifications
const createBulkNotifications = async (userIds, type, title, message, data = null, actionUrl = null, priority = 'MEDIUM') => {
  try {
    const notifications = userIds.map(userId => ({
      user_id: userId,
      type,
      title,
      message,
      data,
      action_url: actionUrl,
      priority
    }));
    
    await Notification.bulkCreate(notifications);
    return true;
  } catch (error) {
    console.error('Failed to create bulk notifications:', error);
    return false;
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getNotificationStats,
  createNotification,
  createBulkNotifications
};
