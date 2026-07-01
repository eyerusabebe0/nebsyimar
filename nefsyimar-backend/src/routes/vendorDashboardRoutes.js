const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/authMiddleware');
const { uploadMiddleware } = require('../utils/fileUpload');
const {
  getVendorDashboard,
  getVendorOrders,
  updateOrderStatus,
  getVendorProducts,
  createProduct,
  updateProduct,
  updateProductStock,
  changePassword,
  updateVendorProfile
} = require('../controllers/vendorDashboardController');

// All routes require vendor authentication
router.use(authenticate);
router.use(authorize('Vendor'));

// Dashboard routes
router.get('/dashboard', getVendorDashboard);

// Order management routes
router.get('/orders', getVendorOrders);
router.put('/orders/:orderId/status', updateOrderStatus);

// Product management routes
router.get('/products', getVendorProducts);
router.post('/products', uploadMiddleware.product, createProduct);
router.put('/products/:productId', uploadMiddleware.product, updateProduct);
router.put('/products/:productId/stock', updateProductStock);

// Profile management routes
router.put('/change-password', changePassword);
router.put('/profile', updateVendorProfile);

module.exports = router;
