const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');

const {
  register,
  login,
  logout,
  getMe,
  verifyAccount,
  resendVerification,
  forgotPassword,
  resetPassword,
  changePassword,
  updateProfile,
  googleAuth,
  getGoogleAuthUrl
} = require('../controllers/authController');

const { authenticate } = require('../middleware/authMiddleware');
const {
  validateUserRegistration,
  validateUserLogin,
  validatePasswordReset,
  validatePasswordResetConfirm,
  validatePasswordUpdate
} = require('../middleware/validationMiddleware');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'Too many authentication attempts from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Public routes
router.post('/register', authLimiter, validateUserRegistration, register);
router.post('/login', authLimiter, (req, res, next) => {
  console.log('🔍 Auth route /login hit with body:', req.body);
  next();
}, validateUserLogin, login);
router.post('/verify', authLimiter, verifyAccount);
router.post('/resend-verification', authLimiter, resendVerification);
router.post('/forgot-password', authLimiter, validatePasswordReset, forgotPassword);
router.post('/reset-password', authLimiter, validatePasswordResetConfirm, resetPassword);

// Google OAuth routes
router.post('/google', googleAuth);
router.get('/google/url', getGoogleAuthUrl);

// Optional auth route (checks auth but doesn't require it)
const { optionalAuth } = require('../middleware/authMiddleware');
router.get('/status', optionalAuth, (req, res) => {
  if (req.user) {
    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;
    const rawUser = typeof req.user.toJSON === 'function' ? req.user.toJSON() : req.user;

    const isSuperAdmin = !!superAdminEmail &&
      rawUser.role === 'Administrator' &&
      rawUser.email &&
      typeof rawUser.email === 'string' &&
      rawUser.email.toLowerCase() === superAdminEmail.toLowerCase();

    res.json({
      success: true,
      authenticated: true,
      data: {
        user: {
          ...rawUser,
          is_super_admin: isSuperAdmin
        },
        wallet: req.user.wallet
      }
    });
  } else {
    res.json({
      success: true,
      authenticated: false,
      data: null
    });
  }
});

// Protected routes
router.use(authenticate); // All routes below require authentication

router.post('/logout', logout);
router.get('/me', getMe);
router.put('/change-password', validatePasswordUpdate, changePassword);
router.put('/profile', updateProfile);

module.exports = router;
