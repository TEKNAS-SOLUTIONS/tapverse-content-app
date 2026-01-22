import { getRequestLogger, requestId } from '../core/logger.js';

/**
 * Request logging middleware
 * Logs all incoming requests with correlation IDs
 */
export const requestLogger = (req, res, next) => {
  // Add request ID if not already present
  if (!req.id) {
    requestId(req, res, () => {});
  }

  const reqLogger = getRequestLogger(req);
  
  // Log request start
  reqLogger.info('Incoming request');

  // Log response when finished
  const startTime = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    reqLogger.info({
      statusCode: res.statusCode,
      duration,
    }, 'Request completed');
  });

  // Attach logger to request for use in routes
  req.logger = reqLogger;
  
  next();
};
