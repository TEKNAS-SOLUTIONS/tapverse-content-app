import { TimeoutError } from '../core/errors.js';
import { logger } from '../core/logger.js';

/**
 * Request timeout middleware
 * Sets a timeout for requests to prevent hanging
 */
export const requestTimeout = (timeoutMs = 30000) => {
  return (req, res, next) => {
    const timeout = setTimeout(() => {
      if (!res.headersSent) {
        logger.warn({
          path: req.path,
          method: req.method,
          timeout: timeoutMs,
        }, 'Request timeout');
        
        res.status(504).json({
          success: false,
          error: {
            message: 'Request timeout',
            type: 'TimeoutError',
            statusCode: 504,
          },
        });
      }
    }, timeoutMs);

    // Clear timeout when response is sent
    const originalEnd = res.end;
    res.end = function(...args) {
      clearTimeout(timeout);
      originalEnd.apply(this, args);
    };

    next();
  };
};

/**
 * Async operation timeout wrapper
 * Wraps async operations with a timeout
 */
export const withTimeout = async (promise, timeoutMs, errorMessage = 'Operation timed out') => {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => {
        reject(new TimeoutError(errorMessage));
      }, timeoutMs);
    }),
  ]);
};
