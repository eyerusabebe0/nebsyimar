const { ValidationError } = require('sequelize');
const { logError } = require('../utils/logger');

// Not found middleware
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Error handler middleware
const errorHandler = (err, req, res, next) => {
  logError('request_error', {
    method: req.method,
    url: req.originalUrl,
    statusCode: res.statusCode || 500,
    errorName: err.name,
  });

  if (process.env.NODE_ENV !== 'production') {
    console.error('Error handling request:', req.method, req.originalUrl, err);
  }

  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  // Sequelize validation error
  if (err instanceof ValidationError) {
    statusCode = 400;
    message = 'Validation Error';
    const errors = err.errors.map(error => ({
      field: error.path,
      message: error.message,
      value: error.value
    }));
    
    return res.status(statusCode).json({
      success: false,
      message,
      errors,
      stack: process.env.NODE_ENV === 'production' ? null : err.stack
    });
  }

  // Sequelize unique constraint error
  if (err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 409;
    message = 'Resource already exists';
    const field = err.errors[0]?.path || 'unknown';
    
    return res.status(statusCode).json({
      success: false,
      message,
      error: `${field} already exists`,
      stack: process.env.NODE_ENV === 'production' ? null : err.stack
    });
  }

  // Sequelize foreign key constraint error
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    statusCode = 400;
    message = 'Invalid reference';
    
    return res.status(statusCode).json({
      success: false,
      message,
      error: 'Referenced resource does not exist',
      stack: process.env.NODE_ENV === 'production' ? null : err.stack
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  // Multer errors (file upload)
  if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 400;
    message = 'File too large';
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    statusCode = 400;
    message = 'Unexpected file field';
  }

  // Custom application errors
  if (err.name === 'InsufficientFundsError') {
    statusCode = 400;
    message = 'Insufficient wallet balance';
  }

  if (err.name === 'WalletFrozenError') {
    statusCode = 403;
    message = 'Wallet is frozen';
  }

  if (err.name === 'UnauthorizedError') {
    statusCode = 401;
    message = 'Unauthorized access';
  }

  if (err.name === 'ForbiddenError') {
    statusCode = 403;
    message = 'Access forbidden';
  }

  // Database connection errors
  if (err.name === 'SequelizeConnectionError') {
    statusCode = 503;
    message = 'Database connection error';
  }

  // Rate limiting errors
  if (err.status === 429) {
    statusCode = 429;
    message = 'Too many requests';
  }

  res.status(statusCode).json({
    success: false,
    message,
    error: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    ...(process.env.NODE_ENV === 'development' && { timestamp: new Date().toISOString() })
  });
};

// Async error wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Custom error classes
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

class InsufficientFundsError extends Error {
  constructor(message = 'Insufficient wallet balance') {
    super(message);
    this.name = 'InsufficientFundsError';
  }
}

class WalletFrozenError extends Error {
  constructor(message = 'Wallet is frozen') {
    super(message);
    this.name = 'WalletFrozenError';
  }
}

class UnauthorizedError extends Error {
  constructor(message = 'Unauthorized access') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

class ForbiddenError extends Error {
  constructor(message = 'Access forbidden') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

module.exports = {
  notFound,
  errorHandler,
  asyncHandler,
  AppError,
  InsufficientFundsError,
  WalletFrozenError,
  UnauthorizedError,
  ForbiddenError
};
