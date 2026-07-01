const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { handleValidationErrors } = require('../middleware/validationMiddleware');

const {
  sendOTP,
  verifyOTP,
  resendOTP
} = require('../controllers/otpController');

// Validation rules
const sendOTPValidation = [
  body('phone')
    .optional()
    .matches(/^\+251[79]\d{8}$/)
    .withMessage('Phone number must be in format +251XXXXXXXXX'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email address'),
  body('type')
    .optional()
    .isIn(['registration', 'password_reset', 'phone_verification'])
    .withMessage('Invalid OTP type'),
  handleValidationErrors
];

const verifyOTPValidation = [
  body('phone')
    .optional()
    .matches(/^\+251[79]\d{8}$/)
    .withMessage('Phone number must be in format +251XXXXXXXXX'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email address'),
  body('otp')
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage('OTP must be 6 digits'),
  handleValidationErrors
];

// Routes
router.post('/send-otp', sendOTPValidation, sendOTP);
router.post('/verify-otp', verifyOTPValidation, verifyOTP);
router.post('/resend-otp', sendOTPValidation, resendOTP);

module.exports = router;
