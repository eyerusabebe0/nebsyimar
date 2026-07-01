const express = require('express');
const router = express.Router();

const {
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
} = require('../controllers/userDashboardController');

const { authenticate } = require('../middleware/authMiddleware');
const { validateUUIDParam, validateRepatriationSubmission } = require('../middleware/validationMiddleware');
const { uploadMiddleware } = require('../utils/fileUpload');

// All routes require authentication
router.use(authenticate);

// Dashboard routes
router.get('/dashboard', getDashboardData);
router.get('/memorials', getUserMemorials);
router.get('/memorials/pending-comments', getPendingComments);

router.get('/repatriation-submissions', getUserRepatriationSubmissions);
router.get('/repatriation-submissions/:submissionId', validateUUIDParam('submissionId'), getUserRepatriationSubmission);
router.put('/repatriation-submissions/:submissionId',
  validateUUIDParam('submissionId'),
  uploadMiddleware.single('death_certificate_file', 'repatriation'),
  validateRepatriationSubmission,
  updateRepatriationSubmission
);
router.delete('/repatriation-submissions/:submissionId', validateUUIDParam('submissionId'), deleteRepatriationSubmission);

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
