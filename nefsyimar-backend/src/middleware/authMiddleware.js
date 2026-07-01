const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { UnauthorizedError, ForbiddenError } = require('./errorMiddleware');

// Enhanced authentication supporting both sessions and JWT
const authenticate = async (req, res, next) => {
  try {
    let userId = null;
    
    // Method 1: Check session
    if (req.session?.userId) {
      userId = req.session.userId;
    }
    
    // Method 2: Check JWT token in Authorization header
    const authHeader = req.headers.authorization;
    if (!userId && authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.userId;

        // If this is an impersonation token, attach metadata and enforce read-only mode
        if (decoded.impersonated) {
          req.impersonation = {
            impersonated: true,
            impersonatorId: decoded.impersonatorId
          };

          // Block any write operations while impersonating
          if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
            throw new ForbiddenError('Write operations are not allowed while impersonating another user');
          }
        }
      } catch (jwtError) {
        console.log('JWT verification failed:', jwtError.message);
      }
    }
    
    if (!userId) {
      throw new UnauthorizedError('Authentication required');
    }

    // Find user in database
    const user = await User.findByPk(userId, {
      include: [
        {
          model: require('../models').Wallet,
          as: 'wallet'
        }
      ]
    });

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    if (!user.is_active) {
      throw new UnauthorizedError('Account is deactivated');
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

// Optional authentication (for public endpoints that can work with or without auth)
const optionalAuth = async (req, res, next) => {
  try {
    let userId = null;
    
    // Method 1: Check session
    if (req.session?.userId) {
      userId = req.session.userId;
    }
    
    // Method 2: Check JWT token in Authorization header
    const authHeader = req.headers.authorization;
    if (!userId && authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.userId;
      } catch (jwtError) {
        // JWT verification failed, continue without user
        console.log('JWT verification failed in optionalAuth:', jwtError.message);
      }
    }
    
    if (userId) {
      const user = await User.findByPk(userId, {
        include: [
          {
            model: require('../models').Wallet,
            as: 'wallet'
          }
        ]
      });

      if (user && user.is_active) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Don't throw error for optional auth, just continue without user
    console.log('Optional auth error:', error.message);
    next();
  }
};

// Role-based authorization
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }

    if (!roles.includes(req.user.role)) {
      throw new ForbiddenError(`Access denied. Required roles: ${roles.join(', ')}`);
    }

    next();
  };
};

// Super Admin check based on configured email
const requireSuperAdmin = (req, res, next) => {
  if (!req.user) {
    throw new UnauthorizedError('Authentication required');
  }

  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;

  if (!superAdminEmail) {
    throw new ForbiddenError('Super Admin email is not configured');
  }

  if (req.user.email !== superAdminEmail || req.user.role !== 'Administrator') {
    throw new ForbiddenError('Super Admin access required');
  }

  next();
};

// Check if user owns resource
const checkOwnership = (resourceUserIdField = 'user_id') => {
  return (req, res, next) => {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }

    // Admin can access any resource
    if (req.user.role === 'Administrator') {
      return next();
    }

    // Check if user owns the resource
    const resourceUserId = req.resource?.[resourceUserIdField] || req.params.userId;
    
    if (resourceUserId && resourceUserId !== req.user.user_id) {
      throw new ForbiddenError('Access denied. You can only access your own resources.');
    }

    next();
  };
};

// Check if user has verified email or phone
const requireVerification = (req, res, next) => {
  if (!req.user) {
    throw new UnauthorizedError('Authentication required');
  }

  if (!req.user.email_verified && !req.user.phone_verified) {
    throw new ForbiddenError('Account verification required. Please verify your email or phone number.');
  }

  next();
};

// Check if wallet is not frozen
const checkWalletStatus = (req, res, next) => {
  if (!req.user) {
    throw new UnauthorizedError('Authentication required');
  }

  if (!req.user.wallet) {
    throw new ForbiddenError('Wallet not found');
  }

  if (req.user.wallet.is_frozen) {
    throw new ForbiddenError(`Wallet is frozen. Reason: ${req.user.wallet.frozen_reason}`);
  }

  next();
};

// Rate limiting per user
const userRateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  const userRequests = new Map();

  return (req, res, next) => {
    if (!req.user) {
      return next();
    }

    const userId = req.user.user_id;
    const now = Date.now();
    const windowStart = now - windowMs;

    // Clean old entries
    if (userRequests.has(userId)) {
      const requests = userRequests.get(userId).filter(time => time > windowStart);
      userRequests.set(userId, requests);
    }

    // Get current user's requests
    const currentRequests = userRequests.get(userId) || [];

    if (currentRequests.length >= maxRequests) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }

    // Add current request
    currentRequests.push(now);
    userRequests.set(userId, currentRequests);

    next();
  };
};

// Vendor verification check
const requireVendorVerification = async (req, res, next) => {
  try {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }

    if (req.user.role !== 'Vendor') {
      throw new ForbiddenError('Vendor access required');
    }

    const { Vendor } = require('../models');
    const vendor = await Vendor.findOne({ where: { user_id: req.user.user_id } });

    if (!vendor) {
      throw new ForbiddenError('Vendor profile not found');
    }

    if (vendor.verification_status !== 'VERIFIED') {
      throw new ForbiddenError('Vendor verification required');
    }

    if (!vendor.is_active) {
      throw new ForbiddenError('Vendor account is suspended');
    }

    req.vendor = vendor;
    next();
  } catch (error) {
    next(error);
  }
};

// Memorial ownership check
const checkMemorialOwnership = async (req, res, next) => {
  try {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }

    const { Memorial } = require('../models');
    const memorialId = req.params.memorialId || req.params.id;
    
    if (!memorialId) {
      throw new ForbiddenError('Memorial ID required');
    }

    const memorial = await Memorial.findByPk(memorialId);
    
    if (!memorial) {
      return res.status(404).json({
        success: false,
        message: 'Memorial not found'
      });
    }

    // Admin can access any memorial
    if (req.user.role === 'Administrator') {
      req.memorial = memorial;
      return next();
    }

    // Check ownership
    if (memorial.user_id !== req.user.user_id) {
      throw new ForbiddenError('Access denied. You can only manage your own memorials.');
    }

    req.memorial = memorial;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  authenticate,
  optionalAuth,
  authorize,
  requireSuperAdmin,
  checkOwnership,
  requireVerification,
  checkWalletStatus,
  userRateLimit,
  requireVendorVerification,
  checkMemorialOwnership
};
