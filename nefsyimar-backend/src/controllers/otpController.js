const crypto = require('crypto');
const { User } = require('../models');
const { asyncHandler } = require('../middleware/errorMiddleware');
const { sendSMS, sendEmail } = require('../utils/notifications');

// In-memory OTP store (in production, use Redis)
const otpStore = new Map();

// OTP expiry time (5 minutes)
const OTP_EXPIRY_TIME = 5 * 60 * 1000;

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// @desc    Send OTP for phone verification
// @route   POST /api/v1/auth/send-otp
// @access  Public
const sendOTP = asyncHandler(async (req, res) => {
  const { phone, email, type = 'registration' } = req.body;

  if (!phone && !email) {
    return res.status(400).json({
      success: false,
      message: 'Phone number or email is required'
    });
  }

  // Check if user already exists for registration
  if (type === 'registration') {
    const { Op } = require('sequelize');
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [
          ...(email ? [{ email: { [Op.iLike]: email } }] : []),
          ...(phone ? [{ phone }] : [])
        ]
      }
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User already exists with this phone number or email'
      });
    }
  }

  const otp = generateOTP();
  const otpKey = phone || email;
  const expiryTime = Date.now() + OTP_EXPIRY_TIME;

  // Store OTP with expiry
  otpStore.set(otpKey, {
    otp,
    expiryTime,
    type,
    attempts: 0
  });

  try {
    if (phone) {
      await sendSMS(phone, `Your Nefsyimar verification code is: ${otp}. Valid for 5 minutes.`);
    }
    
    if (email) {
      await sendEmail(email, 'Nefsyimar Verification Code', {
        name: 'User',
        otp,
        type
      }, 'otp');
    }

    res.json({
      success: true,
      message: `OTP sent successfully to ${phone ? 'phone' : 'email'}`,
      data: {
        otp_sent_to: phone || email,
        expires_in: OTP_EXPIRY_TIME / 1000 // seconds
      }
    });
  } catch (error) {
    console.error('Failed to send OTP:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP. Please try again.'
    });
  }
});

// @desc    Verify OTP
// @route   POST /api/v1/auth/verify-otp
// @access  Public
const verifyOTP = asyncHandler(async (req, res) => {
  const { phone, email, otp } = req.body;

  if (!otp) {
    return res.status(400).json({
      success: false,
      message: 'OTP is required'
    });
  }

  const otpKey = phone || email;
  const storedOTPData = otpStore.get(otpKey);

  if (!storedOTPData) {
    return res.status(400).json({
      success: false,
      message: 'OTP not found or expired. Please request a new one.'
    });
  }

  // Check if OTP is expired
  if (Date.now() > storedOTPData.expiryTime) {
    otpStore.delete(otpKey);
    return res.status(400).json({
      success: false,
      message: 'OTP has expired. Please request a new one.'
    });
  }

  // Check attempts limit
  if (storedOTPData.attempts >= 3) {
    otpStore.delete(otpKey);
    return res.status(400).json({
      success: false,
      message: 'Too many failed attempts. Please request a new OTP.'
    });
  }

  // Verify OTP
  if (storedOTPData.otp !== otp) {
    storedOTPData.attempts++;
    otpStore.set(otpKey, storedOTPData);
    
    return res.status(400).json({
      success: false,
      message: `Invalid OTP. ${3 - storedOTPData.attempts} attempts remaining.`
    });
  }

  // OTP verified successfully
  otpStore.delete(otpKey);

  res.json({
    success: true,
    message: 'OTP verified successfully',
    data: {
      verified: true,
      type: storedOTPData.type
    }
  });
});

// @desc    Resend OTP
// @route   POST /api/v1/auth/resend-otp
// @access  Public
const resendOTP = asyncHandler(async (req, res) => {
  const { phone, email } = req.body;
  
  const otpKey = phone || email;
  const storedOTPData = otpStore.get(otpKey);

  if (!storedOTPData) {
    return res.status(400).json({
      success: false,
      message: 'No OTP request found. Please request a new OTP.'
    });
  }

  // Generate new OTP
  const newOTP = generateOTP();
  const expiryTime = Date.now() + OTP_EXPIRY_TIME;

  // Update stored OTP
  otpStore.set(otpKey, {
    otp: newOTP,
    expiryTime,
    type: storedOTPData.type,
    attempts: 0
  });

  try {
    if (phone) {
      await sendSMS(phone, `Your new Nefsyimar verification code is: ${newOTP}. Valid for 5 minutes.`);
    }
    
    if (email) {
      await sendEmail(email, 'Nefsyimar Verification Code - Resent', {
        name: 'User',
        otp: newOTP,
        type: storedOTPData.type
      }, 'otp');
    }

    res.json({
      success: true,
      message: 'New OTP sent successfully',
      data: {
        otp_sent_to: phone || email,
        expires_in: OTP_EXPIRY_TIME / 1000
      }
    });
  } catch (error) {
    console.error('Failed to resend OTP:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resend OTP. Please try again.'
    });
  }
});

module.exports = {
  sendOTP,
  verifyOTP,
  resendOTP
};
