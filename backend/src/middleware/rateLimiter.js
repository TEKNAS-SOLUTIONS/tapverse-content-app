import rateLimit from 'express-rate-limit';
import { RateLimitError } from '../core/errors.js';
import { logger } from '../core/logger.js';

/**
 * General API rate limiter
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    logger.warn({
      ip: req.ip,
      path: req.path,
    }, 'Rate limit exceeded');
    
    res.status(429).json({
      success: false,
      error: {
        message: 'Too many requests, please try again later',
        type: 'RateLimitError',
        statusCode: 429,
        retryAfter: Math.ceil(req.rateLimit.resetTime / 1000),
      },
    });
  },
});

/**
 * Strict rate limiter for authentication endpoints
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});

/**
 * Content generation rate limiter
 * More lenient for content generation operations
 */
export const contentGenerationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Limit each IP to 20 content generations per hour
  message: 'Too many content generation requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
