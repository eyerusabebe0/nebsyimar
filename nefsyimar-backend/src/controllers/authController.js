const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const { User, Wallet } = require('../models');
const { asyncHandler, UnauthorizedError } = require('../middleware/errorMiddleware');
const { sendEmail, sendSMS } = require('../utils/notifications');

// Initialize Google OAuth client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

const computeIsSuperAdmin = (user) => {
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;

  if (!superAdminEmail || !user) {
    return false;
  }

  const raw = typeof user.toJSON === 'function' ? user.toJSON() : user;
  const email = raw.email;
  const role = raw.role;

  if (!email || !role) {
    return false;
  }

  return (
    role === 'Administrator' &&
    typeof email === 'string' &&
    email.toLowerCase() === superAdminEmail.toLowerCase()
  );
};

// @desc    Register new user
// @route   POST /api/v1/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  console.log('📝 Registration request received:', {
    body: { ...req.body, password: '[HIDDEN]' }
  });

  const { name, email, phone, password, date_of_birth, gender, city, region } = req.body;

  // Check if user already exists (case-insensitive for email)
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
    console.log('❌ User already exists:', existingUser.email || existingUser.phone);
    return res.status(409).json({
      success: false,
      message: 'User already exists with this email or phone number'
    });
  }

  console.log('✅ Creating new user...');

  const userData = {
    name,
    email,
    phone,
    password,
    date_of_birth,
    gender,
    city,
    region,
    verification_token: crypto.randomBytes(32).toString('hex'),
    role: 'Public User'
  };

  const user = await User.create(userData);

  console.log('✅ User created:', user.user_id);

  // Create wallet for the user
  const wallet = await Wallet.create({
    user_id: user.user_id,
    balance: 0.00
  });

  console.log('✅ Wallet created:', wallet.wallet_id);

  // Set session
  req.session.userId = user.user_id;
  
  // Generate JWT token
  const token = generateToken(user.user_id);

  // Send verification email/SMS (non-blocking)
  if (email) {
    sendEmail({
      to: email,
      subject: 'Welcome to Nefsyimar - Verify Your Account',
      template: 'verification',
      data: {
        name: user.name,
        verification_token: user.verification_token
      }
    }).catch(error => {
      console.error('Email sending failed:', error);
    });
  }

  if (phone) {
    sendSMS({
      to: phone,
      message: `Welcome to Nefsyimar! Your verification code is: ${user.verification_token.substring(0, 6).toUpperCase()}`
    }).catch(error => {
      console.error('SMS sending failed:', error);
    });
  }

  console.log('✅ Registration successful for:', user.email || user.phone);

  const isSuperAdmin = computeIsSuperAdmin(user);

  res.status(201).json({
    success: true,
    message: 'User registered successfully. Please verify your account.',
    data: {
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        verified: user.verified,
        email_verified: user.email_verified,
        phone_verified: user.phone_verified,
        is_super_admin: isSuperAdmin
      },
      wallet: wallet,
      token: token
    }
  });
});

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  let { identifier, password } = req.body;

  if (typeof identifier === 'string') {
    identifier = identifier.trim();
  }

  console.log('🔍 Login Attempt:', {
    identifier,
    passwordLength: password?.length,
    passwordChars: password ? [...password].map(c => c.charCodeAt(0)) : null
  });

  // Validate required fields
  if (!identifier || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email/phone and password are required'
    });
  }

  // Super Admin env-based login support
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;
  const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD;
  const isSuperAdminEnvConfigured = !!superAdminEmail && !!superAdminPassword;
  const normalizedIdentifier = typeof identifier === 'string' ? identifier.toLowerCase() : identifier;

  const isSuperAdminEnvLogin =
    isSuperAdminEnvConfigured &&
    typeof normalizedIdentifier === 'string' &&
    normalizedIdentifier === superAdminEmail.toLowerCase() &&
    password === superAdminPassword;

  // Find user by email, phone, or username (case-insensitive for email)
  const { Op } = require('sequelize');
  let user = null;

  // First try email (case-insensitive)
  if (identifier && identifier.includes('@')) {
    user = await User.findOne({
      where: {
        email: { [Op.iLike]: identifier }
      },
      include: [
        {
          model: Wallet,
          as: 'wallet'
        }
      ]
    });
  }

  // Then try phone
  if (!user) {
    user = await User.findOne({
      where: {
        phone: identifier
      },
      include: [
        {
          model: Wallet,
          as: 'wallet'
        }
      ]
    });
  }

  // Finally try username
  if (!user) {
    user = await User.findOne({
      where: {
        username: identifier
      },
      include: [
        {
          model: Wallet,
          as: 'wallet'
        }
      ]
    });
  }

  // If no user was found but Super Admin env credentials are used, auto-provision Super Admin
  if (!user && isSuperAdminEnvLogin) {
    user = await User.create({
      name: 'Super Admin',
      email: superAdminEmail,
      password: superAdminPassword,
      role: 'Administrator',
      verified: true,
      email_verified: true,
      is_active: true
    });

    const wallet = await Wallet.create({
      user_id: user.user_id,
      balance: 0.00
    });

    user.wallet = wallet;
  }

  if (!user) {
    console.log('❌ User not found for identifier:', identifier);
    throw new UnauthorizedError('Invalid credentials');
  }

  console.log('✅ User found:', user.email);
  console.log('🔐 Attempting password comparison...');
  
  let isPasswordValid = await user.comparePassword(password);
  console.log('🔐 Password comparison result:', isPasswordValid);

  // If Super Admin env credentials are configured and used, ensure DB password matches env password
  if (!isPasswordValid && isSuperAdminEnvLogin) {
    user.password = superAdminPassword;
    await user.save();
    isPasswordValid = await user.comparePassword(password);
    console.log('🔐 Super Admin password resync result:', isPasswordValid);
  }

  if (!isPasswordValid) {
    console.log('❌ Password comparison failed');
    throw new UnauthorizedError('Invalid credentials');
  }

  console.log('✅ Password comparison successful');

  if (!user.is_active) {
    throw new UnauthorizedError('Account is deactivated');
  }

  // Update last login
  user.last_login = new Date();
  await user.save();

  // Set session (simple session-based auth)
  req.session.userId = user.user_id;
  
  // Generate JWT token
  const token = generateToken(user.user_id);
  const isSuperAdmin = computeIsSuperAdmin(user);

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        verified: user.verified,
        email_verified: user.email_verified,
        phone_verified: user.phone_verified,
        is_super_admin: isSuperAdmin,
        wallet: user.wallet
      },
      token: token
    }
  });
});

// @desc    Logout user
// @route   POST /api/v1/auth/logout
// @access  Private
const logout = asyncHandler(async (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Could not log out'
      });
    }

    res.json({
      success: true,
      message: 'Logout successful'
    });
  });
});

// @desc    Get current user
// @route   GET /api/v1/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  console.log('🔍 Checking user authentication...');
  console.log('Session userId:', req.session?.userId);
  console.log('Authorization header:', req.headers.authorization);
  
  // This endpoint requires authentication, so req.user should be set by middleware
  if (!req.user) {
    console.log('❌ No authenticated user found');
    return res.status(401).json({
      success: false,
      message: 'Not authenticated'
    });
  }

  console.log('✅ User authenticated:', req.user.user_id);

  const isSuperAdmin = computeIsSuperAdmin(req.user);
  const userJson = typeof req.user.toJSON === 'function' ? req.user.toJSON() : req.user;

  res.json({
    success: true,
    data: {
      user: {
        ...userJson,
        is_super_admin: isSuperAdmin
      },
      wallet: req.user.wallet
    }
  });
});

// @desc    Verify account
// @route   POST /api/v1/auth/verify
// @access  Public
const verifyAccount = asyncHandler(async (req, res) => {
  const { token, type } = req.body; // type: 'email' or 'phone'

  const user = await User.findOne({
    where: { verification_token: token }
  });

  if (!user) {
    return res.status(400).json({
      success: false,
      message: 'Invalid verification token'
    });
  }

  // Update verification status
  if (type === 'email') {
    user.email_verified = true;
  } else if (type === 'phone') {
    user.phone_verified = true;
  }
  user.verified = user.email_verified || user.phone_verified;
  user.verification_token = null;
  await user.save();

  const isSuperAdmin = computeIsSuperAdmin(user);

  res.json({
    success: true,
    message: 'Account verified successfully',
    data: {
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        verified: user.verified,
        email_verified: user.email_verified,
        phone_verified: user.phone_verified,
        is_super_admin: isSuperAdmin
      }
    }
  });
});

// @desc    Resend verification
// @route   POST /api/v1/auth/resend-verification
// @access  Public
const resendVerification = asyncHandler(async (req, res) => {
  const { identifier, type } = req.body; // identifier: email or phone, type: 'email' or 'phone'

  const { Op } = require('sequelize');
  const user = await User.findOne({
    where: {
      [Op.or]: [
        { email: { [Op.iLike]: identifier } }, // Case-insensitive email search
        { phone: identifier }
      ]
    }
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  if (user.verified) {
    return res.status(400).json({
      success: false,
      message: 'Account is already verified'
    });
  }

  // Generate new verification token
  user.verification_token = crypto.randomBytes(32).toString('hex');
  await user.save();

  // Send verification
  if (type === 'email' && user.email) {
    await sendEmail({
      to: user.email,
      subject: 'Nefsyimar - Verify Your Account',
      template: 'verification',
      data: {
        name: user.name,
        verification_token: user.verification_token
      }
    });
  } else if (type === 'phone' && user.phone) {
    await sendSMS({
      to: user.phone,
      message: `Your Nefsyimar verification code is: ${user.verification_token.substring(0, 6).toUpperCase()}`
    });
  }

  res.json({
    success: true,
    message: 'Verification code sent successfully'
  });
});

// @desc    Forgot password
// @route   POST /api/v1/auth/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
  const { identifier } = req.body;

  const { Op } = require('sequelize');
  const user = await User.findOne({
    where: {
      [Op.or]: [
        { email: { [Op.iLike]: identifier } }, // Case-insensitive email search
        { phone: identifier }
      ]
    }
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.reset_password_token = resetTokenHash;
  user.reset_password_expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  await user.save();

  // Send reset instructions
  if (user.email) {
    await sendEmail({
      to: user.email,
      subject: 'Nefsyimar - Password Reset',
      template: 'password-reset',
      data: {
        name: user.name,
        reset_token: resetToken
      }
    });
  }

  if (user.phone) {
    await sendSMS({
      to: user.phone,
      message: `Your Nefsyimar password reset code is: ${resetToken.substring(0, 6).toUpperCase()}`
    });
  }

  res.json({
    success: true,
    message: 'Password reset instructions sent'
  });
});

// @desc    Reset password
// @route   POST /api/v1/auth/reset-password
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;
  const { Op } = require('sequelize');

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    where: {
      reset_password_token: hashedToken,
      reset_password_expires: {
        [Op.gt]: new Date()
      }
    }
  });

  if (!user) {
    return res.status(400).json({
      success: false,
      message: 'Invalid or expired reset token'
    });
  }

  // Update password
  user.password = newPassword;
  user.reset_password_token = null;
  user.reset_password_expires = null;
  await user.save();

  res.json({
    success: true,
    message: 'Password reset successful'
  });
});

// @desc    Change password
// @route   PUT /api/v1/auth/change-password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findByPk(req.user.user_id);

  if (!(await user.comparePassword(currentPassword))) {
    return res.status(400).json({
      success: false,
      message: 'Current password is incorrect'
    });
  }

  user.password = newPassword;
  await user.save();

  res.json({
    success: true,
    message: 'Password changed successfully'
  });
});

// @desc    Update profile
// @route   PUT /api/v1/auth/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const { name, bio, date_of_birth, address, city } = req.body;

  const user = await User.findByPk(req.user.user_id);

  // Update allowed fields
  if (name) user.name = name;
  if (bio !== undefined) user.bio = bio;
  if (date_of_birth) user.date_of_birth = date_of_birth;
  if (address !== undefined) user.address = address;
  if (city) user.city = city;

  await user.save();

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user
    }
  });
});

// @desc    Google OAuth authentication
// @route   POST /api/v1/auth/google
// @access  Public
const googleAuth = asyncHandler(async (req, res) => {
  const { credential } = req.body;

  if (!credential) {
    return res.status(400).json({
      success: false,
      message: 'Google credential is required'
    });
  }

  try {
    // Verify the Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    // Check if user already exists (case-insensitive email search)
    const { Op } = require('sequelize');
    let user = await User.findOne({ 
      where: { email: { [Op.iLike]: email } },
      include: [{ model: Wallet, as: 'wallet' }]
    });

    if (user) {
      // User exists, update Google ID if not set
      if (!user.google_id) {
        user.google_id = googleId;
        await user.save();
      }
    } else {
      // Create new user
      user = await User.create({
        name,
        email,
        google_id: googleId,
        profile_image: picture,
        verified: true, // Google accounts are pre-verified
        email_verified: true,
        is_active: true,
        role: 'Public User'
      });

      // Create wallet for new user
      const wallet = await Wallet.create({
        user_id: user.user_id,
        balance: 0.00,
        currency: 'ETB',
        is_frozen: false
      });

      user.wallet = wallet;
    }

    // Generate JWT token
    const token = generateToken(user.user_id);

    res.json({
      success: true,
      message: 'Google authentication successful',
      data: {
        user,
        wallet: user.wallet,
        token
      }
    });

  } catch (error) {
    console.error('Google OAuth error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid Google token'
    });
  }
});

// @desc    Create new admin user (to be called only by Super Admin via admin routes)
// @route   POST /api/v1/admin/users/admins
// @access  Private (Super Admin only - enforced in routes/middleware)
const createAdminUser = asyncHandler(async (req, res) => {
  const { name, email, phone, password, date_of_birth, gender, city, region } = req.body;

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
      message: 'User already exists with this email or phone number'
    });
  }

  const adminData = {
    name,
    email,
    phone,
    password,
    date_of_birth,
    gender,
    city,
    region,
    role: 'Administrator',
    verified: true,
    email_verified: !!email,
    phone_verified: !!phone
  };

  const user = await User.create(adminData);

  const wallet = await Wallet.create({
    user_id: user.user_id,
    balance: 0.00
  });

  res.status(201).json({
    success: true,
    message: 'Administrator account created successfully',
    data: {
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        verified: user.verified,
        email_verified: user.email_verified,
        phone_verified: user.phone_verified
      },
      wallet
    }
  });
});

// @desc    Get Google OAuth URL
// @route   GET /api/v1/auth/google/url
// @access  Public
const getGoogleAuthUrl = asyncHandler(async (req, res) => {
  const authUrl = `https://accounts.google.com/oauth/authorize?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${process.env.GOOGLE_REDIRECT_URI}&response_type=code&scope=openid%20profile%20email`;
  
  res.json({
    success: true,
    data: {
      authUrl
    }
  });
});

module.exports = {
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
  getGoogleAuthUrl,
  createAdminUser
};
