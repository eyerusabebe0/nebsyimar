const express = require('express');
const router = express.Router();

const {
  registerVendor,
  getVendorProfile,
  updateVendorProfile,
  getVendors,
  getVendor,
  getVendorOrders,
  getVendorStats,
  getFeaturedVendors
} = require('../controllers/vendorController');

const { authenticate, authorize, requireVendorVerification } = require('../middleware/authMiddleware');
const { validateVendorRegistration, validateUUIDParam, validatePagination } = require('../middleware/validationMiddleware');
const { uploadMiddleware } = require('../utils/fileUpload');

// Public routes
router.get('/', validatePagination, getVendors);
router.get('/featured', getFeaturedVendors);
router.get('/:vendorId', validateUUIDParam('vendorId'), getVendor);

// Protected routes
router.use(authenticate);

// Vendor registration and profile management
router.post('/register', uploadMiddleware.vendor, validateVendorRegistration, registerVendor);
router.get('/profile/me', getVendorProfile);
router.put('/profile/me', uploadMiddleware.vendor, updateVendorProfile);

// Vendor-specific routes (requires vendor verification)
router.get('/orders/my-orders', requireVendorVerification, validatePagination, getVendorOrders);
router.get('/stats/dashboard', requireVendorVerification, getVendorStats);

module.exports = router;
