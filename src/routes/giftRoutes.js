const express = require('express');
const router = express.Router();

const {
  getGiftCatalog,
  getGiftsByCategory,
  getGift,
  sendGift,
  getMemorialGifts,
  getSentGifts,
  getReceivedGifts,
  getGiftStats,
  getPopularGifts
} = require('../controllers/giftController');

const {
  authenticate,
  optionalAuth,
  checkWalletStatus,
  userRateLimit
} = require('../middleware/authMiddleware');
const { validateGiftTransaction, validateUUIDParam, validatePagination } = require('../middleware/validationMiddleware');

// Public routes
router.get('/catalog', getGiftCatalog);
router.get('/catalog/:category', getGiftsByCategory);
router.get('/popular', getPopularGifts);
router.get('/memorial/:memorialId', validateUUIDParam('memorialId'), validatePagination, getMemorialGifts);
router.get('/:giftId', validateUUIDParam('giftId'), getGift);

// Protected routes
router.use(authenticate);

// Gift transactions
router.post('/send', userRateLimit(50, 10 * 60 * 1000), checkWalletStatus, validateGiftTransaction, sendGift);
router.get('/sent/history', validatePagination, getSentGifts);
router.get('/received/history', validatePagination, getReceivedGifts);
router.get('/stats/summary', getGiftStats);

module.exports = router;
