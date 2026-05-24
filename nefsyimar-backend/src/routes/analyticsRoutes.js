const express = require('express');
const router = express.Router();

const { authenticate, authorize } = require('../middleware/authMiddleware');
const { validatePagination } = require('../middleware/validationMiddleware');

const {
  getDashboardAnalytics,
  getUserAnalytics,
  exportAnalyticsReport
} = require('../controllers/analyticsController');

// All analytics routes require authentication and admin role
router.use(authenticate);
router.use(authorize('Administrator'));

// Analytics routes
router.get('/dashboard', getDashboardAnalytics);
router.get('/users', getUserAnalytics);
router.get('/export', exportAnalyticsReport);

module.exports = router;
