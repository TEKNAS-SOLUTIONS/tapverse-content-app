import Redis from 'ioredis';
import { config } from '../config/config.js';
import { logger } from './logger.js';
import { ExternalAPIError } from './errors.js';

/**
 * Redis caching layer
 * Provides caching for API responses, database queries, and rate limiting
 */

let redisClient = null;

/**
 * Initialize Redis connection
 */
export const initRedis = () => {
  try {
    redisClient = new Redis({
      host: config.redis.host || process.env.REDIS_HOST || 'localhost',
      port: config.redis.port || process.env.REDIS_PORT || 6379,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        logger.warn({ times, delay }, 'Redis retry attempt');
        return delay;
      },
      maxRetriesPerRequest: 3,
    });

    redisClient.on('connect', () => {
      logger.info('Connected to Redis');
    });

    redisClient.on('error', (error) => {
      logger.error({ err: error }, 'Redis connection error');
    });

    redisClient.on('close', () => {
      logger.warn('Redis connection closed');
    });

    return redisClient;
  } catch (error) {
    logger.error({ err: error }, 'Failed to initialize Redis');
    throw new ExternalAPIError('Redis', 'Failed to initialize Redis connection', error);
  }
};

/**
 * Get Redis client (lazy initialization)
 */
const getRedis = () => {
  if (!redisClient) {
    redisClient = initRedis();
  }
  return redisClient;
};

/**
 * Get value from cache
 */
export const get = async (key) => {
  try {
    const client = getRedis();
    const value = await client.get(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    logger.error({ err: error, key }, 'Cache get error');
    return null; // Return null on error, don't throw
  }
};

/**
 * Set value in cache with optional TTL
 */
export const set = async (key, value, ttlSeconds = null) => {
  try {
    const client = getRedis();
    const serialized = JSON.stringify(value);
    
    if (ttlSeconds) {
      await client.setex(key, ttlSeconds, serialized);
    } else {
      await client.set(key, serialized);
    }
    
    return true;
  } catch (error) {
    logger.error({ err: error, key }, 'Cache set error');
    return false; // Return false on error, don't throw
  }
};

/**
 * Delete value from cache
 */
export const del = async (key) => {
  try {
    const client = getRedis();
    await client.del(key);
    return true;
  } catch (error) {
    logger.error({ err: error, key }, 'Cache delete error');
    return false;
  }
};

/**
 * Delete multiple keys matching a pattern
 */
export const delPattern = async (pattern) => {
  try {
    const client = getRedis();
    const stream = client.scanStream({
      match: pattern,
      count: 100,
    });

    let deletedCount = 0;
    stream.on('data', async (keys) => {
      if (keys.length > 0) {
        await client.del(...keys);
        deletedCount += keys.length;
      }
    });

    return new Promise((resolve) => {
      stream.on('end', () => {
        logger.debug({ pattern, deletedCount }, 'Cache pattern deleted');
        resolve(deletedCount);
      });
    });
  } catch (error) {
    logger.error({ err: error, pattern }, 'Cache pattern delete error');
    return 0;
  }
};

/**
 * Check if key exists in cache
 */
export const exists = async (key) => {
  try {
    const client = getRedis();
    const result = await client.exists(key);
    return result === 1;
  } catch (error) {
    logger.error({ err: error, key }, 'Cache exists check error');
    return false;
  }
};

/**
 * Get or set pattern (cache-aside)
 * If key exists, return cached value
 * If not, execute function, cache result, and return it
 */
export const getOrSet = async (key, fetchFn, ttlSeconds = 3600) => {
  try {
    // Try to get from cache
    const cached = await get(key);
    if (cached !== null) {
      logger.debug({ key }, 'Cache hit');
      return cached;
    }

    // Cache miss - fetch and cache
    logger.debug({ key }, 'Cache miss');
    const value = await fetchFn();
    await set(key, value, ttlSeconds);
    return value;
  } catch (error) {
    logger.error({ err: error, key }, 'Cache getOrSet error');
    // On error, try to fetch directly
    return await fetchFn();
  }
};

/**
 * Increment counter (for rate limiting)
 */
export const increment = async (key, ttlSeconds = null) => {
  try {
    const client = getRedis();
    const count = await client.incr(key);
    
    if (ttlSeconds && count === 1) {
      // Set TTL on first increment
      await client.expire(key, ttlSeconds);
    }
    
    return count;
  } catch (error) {
    logger.error({ err: error, key }, 'Cache increment error');
    return 0;
  }
};

/**
 * Close Redis connection
 */
export const closeRedis = async () => {
  if (redisClient) {
    try {
      await redisClient.quit();
      logger.info('Redis connection closed');
    } catch (error) {
      logger.error({ err: error }, 'Error closing Redis connection');
    }
    redisClient = null;
  }
};

// Initialize Redis on module load (if not in test)
if (process.env.NODE_ENV !== 'test') {
  initRedis();
}
