const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./authRoutes');
const otpRoutes = require('./otpRoutes');
const walletRoutes = require('./walletRoutes');
const memorialRoutes = require('./memorialRoutes');
const giftRoutes = require('./giftRoutes');
const vendorRoutes = require('./vendorRoutes');
const productRoutes = require('./productRoutes');
const orderRoutes = require('./orderRoutes');
const adminRoutes = require('./adminRoutes');
const appealRoutes = require('./appealRoutes');
const repatriationRoutes = require('./repatriationRoutes');
const adminVendorRoutes = require('./adminVendorRoutes');
const adminSettingsRoutes = require('./adminSettingsRoutes');
const vendorDashboardRoutes = require('./vendorDashboardRoutes');
const userDashboardRoutes = require('./userDashboardRoutes');
const analyticsRoutes = require('./analyticsRoutes');
const notificationRoutes = require('./notificationRoutes');

// API Routes
router.use('/auth', authRoutes);
router.use('/auth', otpRoutes);
router.use('/wallet', walletRoutes);
router.use('/memorials', memorialRoutes);
router.use('/gifts', giftRoutes);
router.use('/vendors', vendorRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/repatriation', repatriationRoutes);
router.use('/admin', adminRoutes);
router.use('/appeals', appealRoutes);
router.use('/admin/vendor-management', adminVendorRoutes);
router.use('/admin/settings', adminSettingsRoutes);
router.use('/vendor', vendorDashboardRoutes);
router.use('/user', userDashboardRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/notifications', notificationRoutes);

// API Info endpoint
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Nefsyimar Digital Grieving Platform API',
    version: '1.0.0',
    documentation: '/api/v1/docs',
    endpoints: {
      auth: '/api/v1/auth',
      otp: '/api/v1/auth/send-otp, /api/v1/auth/verify-otp',
      wallet: '/api/v1/wallet',
      memorials: '/api/v1/memorials',
      gifts: '/api/v1/gifts',
      vendors: '/api/v1/vendors',
      products: '/api/v1/products',
      orders: '/api/v1/orders',
      admin: '/api/v1/admin',
      analytics: '/api/v1/analytics',
      notifications: '/api/v1/notifications'
    },
    status: 'operational',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
