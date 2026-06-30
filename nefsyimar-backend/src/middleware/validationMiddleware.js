const { body, param, query, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('🚨 Validation errors:', errors.array());
    console.log('🔍 Request body:', req.body);
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

// User validation rules
const validateUserRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  
  body('email')
    .notEmpty()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('phone')
    .optional({ checkFalsy: true })
    .custom((value) => {
      if (!value || value.trim() === '') {
        return true; // Allow empty/null phone
      }
      // Skip validation if it looks like an email (user error in form)
      if (value.includes('@')) {
        return true; // Allow it to pass, will be handled by frontend
      }
      // Allow phone numbers starting with + or digits
      if (/^[\+]?[0-9][\d\s\-\(\)]{0,20}$/.test(value)) {
        return true;
      }
      throw new Error('Please provide a valid phone number');
    }),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
  
  body()
    .custom((value, { req }) => {
      // Email is now required, so this check is simplified
      if (!req.body.email) {
        throw new Error('Email is required');
      }
      return true;
    }),
  
  handleValidationErrors
];

const validateUserLogin = [
  (req, res, next) => {
    const bodyPayload = req.body || {};

    if (!bodyPayload.identifier) {
      if (bodyPayload.email) {
        bodyPayload.identifier = bodyPayload.email;
      } else if (bodyPayload.phone) {
        bodyPayload.identifier = bodyPayload.phone;
      } else if (bodyPayload.username) {
        bodyPayload.identifier = bodyPayload.username;
      }
    }

    req.body = bodyPayload;
    console.log('🔍 Login validation middleware hit:', req.body);
    next();
  },
  body('identifier')
    .notEmpty()
    .withMessage('Email or phone number is required'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];

const validatePasswordReset = [
  body('identifier')
    .notEmpty()
    .withMessage('Email or phone number is required'),
  
  handleValidationErrors
];

const validatePasswordUpdate = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long'),
  
  handleValidationErrors
];

const validatePasswordResetConfirm = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),
  
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long'),
  
  handleValidationErrors
];

// Memorial validation rules
const validateMemorialCreation = [
  body('deceased_name')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Deceased name must be between 2 and 200 characters'),
  
  body('deceased_name_amharic')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Amharic name must not exceed 200 characters'),
  
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Biography must not exceed 5000 characters'),
  
  body('date_of_birth')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date of birth'),
  
  body('date_of_death')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date of death'),
  
  body('visibility')
    .optional()
    .isIn(['PUBLIC', 'PRIVATE', 'FAMILY_ONLY'])
    .withMessage('Visibility must be PUBLIC, PRIVATE, or FAMILY_ONLY'),
  
  body('cultural_template')
    .optional()
    .isIn(['ORTHODOX', 'PROTESTANT', 'MUSLIM', 'TRADITIONAL', 'MODERN', 'CUSTOM'])
    .withMessage('Invalid cultural template'),
  
  handleValidationErrors
];

// Gift validation rules
const validateGiftTransaction = [
  body('memorial_id')
    .isUUID()
    .withMessage('Valid memorial ID is required'),
  
  body('gift_id')
    .isUUID()
    .withMessage('Valid gift ID is required'),
  
  body('message')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Message must not exceed 500 characters'),
  
  body('is_anonymous')
    .optional()
    .isBoolean()
    .withMessage('is_anonymous must be a boolean'),
  
  body('sender_name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Sender name must be between 2 and 100 characters'),
  
  handleValidationErrors
];

// Wallet validation rules
const validateWalletDeposit = [
  body('amount')
    .isFloat({ min: 1 })
    .withMessage('Amount must be at least 1 ETB'),
  
  body('payment_method')
    .isIn(['TELEBIRR', 'CBE_BIRR', 'HELLO_CASH', 'PAYPAL'])
    .withMessage('Invalid payment method'),
  
  body('external_txn_id')
    .optional()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('External transaction ID is invalid'),
  
  handleValidationErrors
];

// Vendor validation rules
const validateVendorRegistration = [
  body('business_name')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Business name must be between 2 and 200 characters'),
  
  body('service_type')
    .isIn(['FLORIST', 'COFFIN_MAKER', 'CATERER', 'PHOTOGRAPHER', 'VIDEOGRAPHER', 'FUNERAL_HOME', 'TRANSPORT', 'RELIGIOUS_SERVICES', 'MEMORIAL_ITEMS', 'CLOTHING', 'MUSIC', 'OTHER'])
    .withMessage('Invalid service type'),
  
  body('business_address')
    .trim()
    .notEmpty()
    .withMessage('Business address is required'),
  
  body('city')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('City must be between 2 and 100 characters'),
  
  body('region')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Region must be between 2 and 100 characters'),
  
  body('phone')
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number'),
  
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  handleValidationErrors
];

// Product validation rules
const validateProductCreation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Product name must be between 2 and 200 characters'),
  
  body('category')
    .isIn(['FLOWERS', 'COFFINS', 'FOOD_CATERING', 'PHOTOGRAPHY', 'VIDEOGRAPHY', 'TRANSPORT', 'MEMORIAL_ITEMS', 'CLOTHING', 'MUSIC', 'RELIGIOUS_ITEMS', 'DECORATIONS', 'OTHER'])
    .withMessage('Invalid product category'),
  
  body('price')
    .isFloat({ min: 0.01 })
    .withMessage('Price must be greater than 0'),
  
  
  body('stock_quantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock quantity must be a non-negative integer'),
  
  handleValidationErrors
];

const validateRepatriationSubmission = [
  body('deceased_full_name')
    .trim()
    .notEmpty()
    .withMessage('Deceased full name is required'),

  body('passport_or_id')
    .trim()
    .notEmpty()
    .withMessage('Passport or ID is required'),

  body('current_location_body')
    .trim()
    .notEmpty()
    .withMessage('Current body location is required'),

  body('applicant_full_name')
    .trim()
    .notEmpty()
    .withMessage('Applicant full name is required'),

  body('applicant_phone')
    .trim()
    .notEmpty()
    .withMessage('Applicant phone number is required'),

  body('applicant_email')
    .trim()
    .isEmail()
    .withMessage('Applicant email must be valid'),

  body('receiver_full_name')
    .trim()
    .notEmpty()
    .withMessage('Receiver full name is required'),

  body('receiver_phone')
    .trim()
    .notEmpty()
    .withMessage('Receiver phone number is required'),

  body('receiver_email')
    .optional({ checkFalsy: true })
    .trim()
    .isEmail()
    .withMessage('Receiver email must be valid'),

  handleValidationErrors
];

// Order validation rules
const validateOrderCreation = [
  body('vendor_id')
    .isUUID()
    .withMessage('Valid vendor ID is required'),
  
  body('items')
    .isArray({ min: 1 })
    .withMessage('At least one item is required'),
  
  body('items.*.product_id')
    .isUUID()
    .withMessage('Valid product ID is required for each item'),
  
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1 for each item'),
  
  body('delivery_address')
    .isObject()
    .withMessage('Delivery address is required'),
  
  body('delivery_address.street')
    .trim()
    .notEmpty()
    .withMessage('Street address is required'),
  
  body('delivery_address.city')
    .trim()
    .notEmpty()
    .withMessage('City is required'),
  
  body('delivery_date')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid delivery date'),
  
  handleValidationErrors
];

// Query parameter validation
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  handleValidationErrors
];

const validateUUIDParam = (paramName) => [
  param(paramName)
    .isUUID()
    .withMessage(`${paramName} must be a valid UUID`),
  
  handleValidationErrors
];

// Search validation
const validateSearch = [
  query('q')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters'),
  
  query('category')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Category filter is invalid'),
  
  query('sort')
    .optional()
    .isIn(['newest', 'oldest', 'popular', 'price_low', 'price_high', 'rating'])
    .withMessage('Invalid sort option'),
  
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateUserRegistration,
  validateUserLogin,
  validatePasswordReset,
   validatePasswordResetConfirm,
  validatePasswordUpdate,
  validateMemorialCreation,
  validateGiftTransaction,
  validateWalletDeposit,
  validateVendorRegistration,
  validateProductCreation,
  validateOrderCreation,
  validateRepatriationSubmission,
  validatePagination,
  validateUUIDParam,
  validateSearch
};
