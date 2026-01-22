import pino from 'pino';

/**
 * Structured logging system using Pino
 * Replaces all console.log statements with structured logging
 */

// Determine log level from environment
const logLevel = process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug');

// Create logger instance
export const logger = pino({
  level: logLevel,
  transport: process.env.NODE_ENV === 'development' 
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

/**
 * Request correlation ID middleware
 * Adds correlation ID to each request for tracing
 */
export const requestId = (req, res, next) => {
  req.id = req.headers['x-request-id'] || 
           req.headers['x-correlation-id'] || 
           `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  res.setHeader('X-Request-ID', req.id);
  next();
};

/**
 * Child logger with request context
 */
export const getRequestLogger = (req) => {
  return logger.child({
    requestId: req.id,
    method: req.method,
    path: req.path,
    ip: req.ip,
  });
};

// Export default logger
export default logger;
