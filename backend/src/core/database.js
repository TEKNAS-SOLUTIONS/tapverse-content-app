import pkg from 'pg';
import dotenv from 'dotenv';
import { DatabaseError } from './errors.js';
import { logger } from './logger.js';

dotenv.config();

const { Pool } = pkg;

/**
 * Database connection pool with recovery mechanisms
 * Replaces the old db/index.js with proper error handling
 */

// Database connection pool configuration
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'tapverse_content',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  // Retry configuration
  retry: {
    max: 3,
    delay: 1000,
  },
});

// Connection event handlers
pool.on('connect', () => {
  logger.info('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  logger.error({ err }, 'Unexpected error on idle database client');
  // DO NOT call process.exit() - let the application handle it gracefully
  // The pool will attempt to reconnect automatically
});

// Health check function
export const checkDatabaseHealth = async () => {
  try {
    const result = await pool.query('SELECT NOW()');
    return {
      healthy: true,
      timestamp: result.rows[0].now,
    };
  } catch (error) {
    logger.error({ err: error }, 'Database health check failed');
    return {
      healthy: false,
      error: error.message,
    };
  }
};

/**
 * Query helper with error handling and logging
 */
export const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    
    logger.debug({
      query: text.substring(0, 100), // Log first 100 chars
      duration,
      rows: res.rowCount,
    }, 'Database query executed');
    
    return res;
  } catch (error) {
    const duration = Date.now() - start;
    logger.error({
      err: error,
      query: text.substring(0, 100),
      duration,
    }, 'Database query error');
    
    // Wrap in DatabaseError for proper error handling
    throw new DatabaseError(
      `Database query failed: ${error.message}`,
      error
    );
  }
};

/**
 * Get a client from the pool for transactions
 * Includes timeout monitoring
 */
export const getClient = async () => {
  try {
    const client = await pool.connect();
    const query = client.query.bind(client);
    const release = client.release.bind(client);
    
    // Set a timeout of 5 seconds for monitoring
    const timeout = setTimeout(() => {
      logger.warn({
        lastQuery: client.lastQuery,
      }, 'Database client checked out for more than 5 seconds');
    }, 5000);
    
    // Monkey patch the query method to log the last query
    client.query = (...args) => {
      client.lastQuery = args;
      return query(...args);
    };
    
    client.release = () => {
      clearTimeout(timeout);
      client.query = query;
      client.release = release;
      return release();
    };
    
    return client;
  } catch (error) {
    logger.error({ err: error }, 'Failed to get database client');
    throw new DatabaseError(
      `Failed to get database client: ${error.message}`,
      error
    );
  }
};

/**
 * Transaction helper
 * Executes a function within a database transaction
 */
export const transaction = async (callback) => {
  const client = await getClient();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error({ err: error }, 'Transaction rolled back');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Gracefully close the pool
 */
export const closePool = async () => {
  try {
    await pool.end();
    logger.info('Database pool closed');
  } catch (error) {
    logger.error({ err: error }, 'Error closing database pool');
    throw error;
  }
};

export default pool;
