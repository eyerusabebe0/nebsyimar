const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const session = require('express-session');

const { sequelize } = require('./config/database');
const routes = require('./routes');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');
const { httpLogger } = require('./utils/logger');

const createApp = () => {
  const app = express();

  // Trust the reverse proxy (LiteSpeed) so rate limiting and IP detection work correctly
  app.set('trust proxy', 1);

  // Security middleware
  app.use(
    helmet({
      crossOriginResourcePolicy: {
        policy: 'cross-origin',
      },
    }),
  );
  app.use(compression());

  // Rate limiting - same settings as server.js
  const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 1 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 1000,
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => process.env.NODE_ENV === 'development',
  });
  app.use('/api/', limiter);

  // Shared CORS options: echo back origin, support credentials and preflight
  const corsOptions = {
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['set-cookie'],
  };

  // CORS configuration for all routes
  app.use(cors(corsOptions));

  // Explicitly handle preflight for all routes so admin endpoints pass OPTIONS
  app.options('*', cors(corsOptions));

  // Session middleware
  app.use(
    session({
      secret: process.env.SESSION_SECRET || 'nefsyimar-dev-secret-key',
      resave: false,
      saveUninitialized: false,
      name: 'nefsyimar.sid',
      cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      },
    }),
  );

  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  if (process.env.NODE_ENV !== 'test') {
    app.use(httpLogger);
  }

  // Static files
  app.use('/uploads', express.static('uploads'));

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || '1.0.0',
    });
  });

  // API routes
  app.use('/api/v1', routes);

  // Error handling middleware (only for API routes)
  app.use('/api/v1', notFound);
  app.use('/api/v1', errorHandler);

  return app;
};

module.exports = { createApp, sequelize };
