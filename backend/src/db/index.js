/**
 * Legacy database module - re-exports from new core/database.js
 * Maintained for backward compatibility during migration
 * 
 * @deprecated Use backend/src/core/database.js instead
 */
export { default as pool, query, getClient, checkDatabaseHealth, transaction, closePool } from '../core/database.js';
export { default } from '../core/database.js';

