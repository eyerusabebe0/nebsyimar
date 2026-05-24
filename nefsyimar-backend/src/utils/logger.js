const morgan = require('morgan');

const httpLogger = morgan((tokens, req, res) => {
  const log = {
    level: 'http',
    method: tokens.method(req, res),
    url: tokens.url(req, res),
    statusCode: Number(tokens.status(req, res)) || undefined,
    responseTimeMs: Number(tokens['response-time'](req, res)),
    contentLength: tokens.res(req, res, 'content-length'),
    userAgent: tokens['user-agent'](req, res),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  };

  return JSON.stringify(log);
});

const log = (level, message, meta = {}) => {
  const entry = {
    level,
    message,
    ...meta,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  };

  const line = JSON.stringify(entry);

  if (level === 'error') {
    console.error(line);
  } else {
    console.log(line);
  }
};

const logInfo = (message, meta) => log('info', message, meta);
const logWarn = (message, meta) => log('warn', message, meta);
const logError = (message, meta) => log('error', message, meta);

module.exports = {
  httpLogger,
  logInfo,
  logWarn,
  logError,
};
