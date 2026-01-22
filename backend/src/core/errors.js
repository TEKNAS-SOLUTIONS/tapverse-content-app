/**
 * Custom Error Classes for Application Error Handling
 * 
 * Provides structured error types with proper HTTP status codes
 * and error recovery mechanisms.
 */

/**
 * Base application error class
 */
export class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation error (400)
 * Used for invalid input data
 */
export class ValidationError extends AppError {
  constructor(message, fields = {}) {
    super(message, 400);
    this.fields = fields;
  }
}

/**
 * Not found error (404)
 * Used when a resource doesn't exist
 */
export class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404);
    this.resource = resource;
  }
}

/**
 * Database error (500)
 * Used for database operation failures with recovery
 */
export class DatabaseError extends AppError {
  constructor(message, originalError = null) {
    super(message || 'Database operation failed', 500);
    this.originalError = originalError;
    this.recoverable = true; // Can attempt recovery
  }
}

/**
 * External API error (502)
 * Used for failures when calling external APIs
 */
export class ExternalAPIError extends AppError {
  constructor(service, message, originalError = null, retryable = false) {
    super(`External API error (${service}): ${message}`, 502);
    this.service = service;
    this.originalError = originalError;
    this.retryable = retryable;
  }
}

/**
 * Authentication error (401)
 * Used for authentication failures
 */
export class AuthenticationError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401);
  }
}

/**
 * Authorization error (403)
 * Used for permission/authorization failures
 */
export class AuthorizationError extends AppError {
  constructor(message = 'Insufficient permissions') {
    super(message, 403);
  }
}

/**
 * Rate limit error (429)
 * Used when rate limits are exceeded
 */
export class RateLimitError extends AppError {
  constructor(message = 'Rate limit exceeded', retryAfter = null) {
    super(message, 429);
    this.retryAfter = retryAfter;
  }
}

/**
 * Timeout error (504)
 * Used when operations timeout
 */
export class TimeoutError extends AppError {
  constructor(message = 'Operation timed out') {
    super(message, 504);
  }
}
