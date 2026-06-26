const express = require('express');
const router = express.Router();

const {
  getMemorials,
  getMemorial,
  createMemorial,
  updateMemorial,
  deleteMemorial,
  getMyMemorials,
  getFeaturedMemorials,
  searchMemorials
} = require('../controllers/memorialController');
const {
  getMemorialComments,
  addMemorialComment,
  deleteMemorialComment,
  toggleMemorialCommentLike,
} = require('../controllers/memorialCommentController');
const {
  reportMemorial,
  reportMemorialComment,
} = require('../controllers/reportController');

const {
  authenticate,
  optionalAuth,
  checkMemorialOwnership,
  userRateLimit
} = require('../middleware/authMiddleware');
const { validateMemorialCreation, validateUUIDParam, validatePagination, validateSearch } = require('../middleware/validationMiddleware');
const { uploadMiddleware } = require('../utils/fileUpload');

// Public routes
router.get('/', validatePagination, getMemorials);
router.get('/featured', getFeaturedMemorials);
router.get('/search', validateSearch, searchMemorials);
router.get('/:memorialId/comments', validateUUIDParam('memorialId'), optionalAuth, getMemorialComments);
router.get('/:identifier', optionalAuth, getMemorial);

// Protected routes
router.use(authenticate);

// Memorial management (with image uploads)
router.post('/',
  userRateLimit(10, 60 * 60 * 1000),
  uploadMiddleware.memorial,
  validateMemorialCreation,
  createMemorial
);

router.get('/my/memorials', validatePagination, getMyMemorials);

router.put('/:id', 
  validateUUIDParam('id'),
  checkMemorialOwnership,
  uploadMiddleware.memorial,
  updateMemorial
);

router.delete('/:id', 
  validateUUIDParam('id'),
  checkMemorialOwnership,
  deleteMemorial
);

// Memorial comments (authenticated for write/delete)
router.post('/:memorialId/comments',
  userRateLimit(60, 15 * 60 * 1000),
  validateUUIDParam('memorialId'),
  addMemorialComment
);

router.delete('/:memorialId/comments/:commentId',
  validateUUIDParam('memorialId'),
  validateUUIDParam('commentId'),
  deleteMemorialComment
);

router.post('/:memorialId/comments/:commentId/like',
  validateUUIDParam('memorialId'),
  validateUUIDParam('commentId'),
  toggleMemorialCommentLike
);

// Reporting endpoints (authenticated users)
router.post('/:memorialId/report',
  validateUUIDParam('memorialId'),
  reportMemorial
);

router.post('/:memorialId/comments/:commentId/report',
  validateUUIDParam('memorialId'),
  validateUUIDParam('commentId'),
  reportMemorialComment
);

module.exports = router;
