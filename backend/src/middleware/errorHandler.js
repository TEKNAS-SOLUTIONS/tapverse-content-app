import { AppError } from '../core/errors.js';
import { config } from '../config/config.js';

/**
 * Global error handler middleware
 * Catches all errors and returns consistent error responses
 */
export const errorHandler = (err, req, res, next) => {
  // If response already sent, delegate to default Express error handler
  if (res.headersSent) {
    return next(err);
  }

  // Log error for debugging
  if (err instanceof AppError) {
    // Operational error - log with context
    console.error(`[${err.name}] ${err.message}`, {
      statusCode: err.statusCode,
      path: req.path,
      method: req.method,
      stack: config.nodeEnv === 'development' ? err.stack : undefined,
    });
  } else {
    // Programming error - log full stack
    console.error('Unexpected error:', {
      message: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
    });
  }

  // Handle AppError instances
  if (err instanceof AppError) {
    const response = {
      success: false,
      error: {
        message: err.message,
        type: err.name,
        statusCode: err.statusCode,
      },
    };

    // Add additional error details in development
    if (config.nodeEnv === 'development') {
      response.error.stack = err.stack;
      if (err.fields) response.error.fields = err.fields;
      if (err.originalError) {
        response.error.originalError = {
          message: err.originalError.message,
          name: err.originalError.name,
        };
      }
    }

    // Add retry information if applicable
    if (err.retryable !== undefined) {
      response.error.retryable = err.retryable;
    }
    if (err.retryAfter) {
      response.error.retryAfter = err.retryAfter;
      res.set('Retry-After', err.retryAfter.toString());
    }

    return res.status(err.statusCode).json(response);
  }

  // Handle validation errors from libraries (e.g., Joi)
  if (err.name === 'ValidationError' || err.isJoi) {
    return res.status(400).json({
      success: false,
      error: {
        message: err.message || 'Validation error',
        type: 'ValidationError',
        statusCode: 400,
        fields: err.details || err.fields,
      },
    });
  }

  // Handle database errors
  if (err.code && err.code.startsWith('23')) {
    // PostgreSQL constraint violation
    return res.status(400).json({
      success: false,
      error: {
        message: 'Database constraint violation',
        type: 'ValidationError',
        statusCode: 400,
      },
    });
  }

  // Default error response
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: {
      message: config.nodeEnv === 'development' 
        ? err.message 
        : 'An unexpected error occurred',
      type: 'InternalServerError',
      statusCode,
    },
  });
};

/**
 * Async error wrapper
 * Wraps async route handlers to catch errors automatically
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: `Route ${req.method} ${req.path} not found`,
      type: 'NotFoundError',
      statusCode: 404,
    },
  });
};
