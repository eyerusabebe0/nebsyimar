const express = require('express');
const router = express.Router();

const {
  getDashboardData,
  getUserMemorials,
  updateMemorialSettings,
  getPendingComments,
  moderateComment,
  deleteComment,
  blockUser
} = require('../controllers/userDashboardController');

const { authenticate } = require('../middleware/authMiddleware');
const { validateUUIDParam } = require('../middleware/validationMiddleware');

// All routes require authentication
router.use(authenticate);

// Dashboard routes
router.get('/dashboard', getDashboardData);
router.get('/memorials', getUserMemorials);
router.get('/memorials/pending-comments', getPendingComments);

// Memorial management routes
router.put('/memorials/:memorialId/settings', 
  validateUUIDParam('memorialId'), 
  updateMemorialSettings
);

router.post('/memorials/:memorialId/comments/:commentId/moderate',
  validateUUIDParam('memorialId'),
  validateUUIDParam('commentId'),
  moderateComment
);

router.delete('/memorials/:memorialId/comments/:commentId',
  validateUUIDParam('memorialId'),
  validateUUIDParam('commentId'),
  deleteComment
);

router.post('/memorials/:memorialId/block-user',
  validateUUIDParam('memorialId'),
  blockUser
);

module.exports = router;
