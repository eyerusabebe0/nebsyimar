const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/authMiddleware');
const { uploadMiddleware } = require('../utils/fileUpload');
const {
  createVendorAccount,
  getVendorAccounts,
  getVendorAccount,
  updateVendorAccount,
  resetVendorPassword,
  toggleVendorStatus,
  deleteVendorAccount,
  updateVendorPermissions,
  syncVendorAccountsToMarketplace
} = require('../controllers/adminVendorController');

// All routes require admin authentication
router.use(authenticate);
router.use(authorize('Administrator'));

// Vendor account management routes
router.post('/create', uploadMiddleware.vendor, createVendorAccount);
router.get('/accounts', getVendorAccounts);
router.get('/accounts/:vendorId', getVendorAccount);
router.put('/accounts/:vendorId', uploadMiddleware.vendor, updateVendorAccount);
router.post('/accounts/:vendorId/reset-password', resetVendorPassword);
router.post('/accounts/:vendorId/toggle-status', toggleVendorStatus);
router.delete('/accounts/:vendorId', deleteVendorAccount);
router.put('/accounts/:vendorId/permissions', updateVendorPermissions);

// Sync existing vendor accounts to marketplace
router.post('/sync-marketplace', syncVendorAccountsToMarketplace);

module.exports = router;
