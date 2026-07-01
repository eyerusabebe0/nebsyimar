const express = require('express');
const router = express.Router();

const { authenticate } = require('../middleware/authMiddleware');
const { validateUUIDParam, validatePagination } = require('../middleware/validationMiddleware');

const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getNotificationStats
} = require('../controllers/notificationController');

// All notification routes require authentication
router.use(authenticate);

// Routes
router.get('/', validatePagination, getNotifications);
router.get('/stats', getNotificationStats);
router.put('/read-all', markAllAsRead);
router.put('/:notificationId/read', validateUUIDParam('notificationId'), markAsRead);
router.delete('/:notificationId', validateUUIDParam('notificationId'), deleteNotification);

module.exports = router;
