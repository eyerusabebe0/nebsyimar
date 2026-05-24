const express = require('express');
const router = express.Router();

const {
  createOrder,
  getMyOrders,
  getOrder,
  updateOrderStatus,
  cancelOrder,
  addOrderReview,
  getOrderStats
} = require('../controllers/orderController');

const { authenticate, requireVendorVerification, checkWalletStatus, authorize } = require('../middleware/authMiddleware');
const { validateOrderCreation, validateUUIDParam, validatePagination } = require('../middleware/validationMiddleware');

// All order routes require authentication
router.use(authenticate);

// Order management
router.post('/', checkWalletStatus, validateOrderCreation, createOrder);
router.get('/', validatePagination, getMyOrders);
router.get('/stats', getOrderStats);
router.get('/:orderId', validateUUIDParam('orderId'), getOrder);

// Order actions
router.post('/:orderId/cancel', validateUUIDParam('orderId'), cancelOrder);
router.post('/:orderId/review', validateUUIDParam('orderId'), addOrderReview);

// Vendor-specific order management
router.patch('/:orderId/status', 
  authorize('Administrator'),
  validateUUIDParam('orderId'),
  updateOrderStatus
);

module.exports = router;
