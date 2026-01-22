import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../db/index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * User Roles
 */
export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  USER: 'user',
};

/**
 * Create users table if not exists
 */
export async function ensureUsersTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(255),
        role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('admin', 'manager', 'user')),
        is_active BOOLEAN DEFAULT true,
        last_login TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create index for faster lookups
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)
    `);

    // Create default admin user if no users exist
    const userCount = await pool.query('SELECT COUNT(*) FROM users');
    if (parseInt(userCount.rows[0].count) === 0) {
      const defaultPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'admin123';
      const passwordHash = await bcrypt.hash(defaultPassword, 10);
      await pool.query(`
        INSERT INTO users (email, password_hash, full_name, role)
        VALUES ($1, $2, $3, $4)
      `, ['admin@tapverse.ai', passwordHash, 'Admin User', USER_ROLES.ADMIN]);
      console.log('Default admin user created: admin@tapverse.ai / admin123');
    }
  } catch (error) {
    console.error('Error ensuring users table:', error);
    throw error;
  }
}

/**
 * Register a new user
 */
export async function registerUser(userData) {
  const { email, password, fullName, role = USER_ROLES.USER } = userData;

  // Validate email
  if (!email || !email.includes('@')) {
    throw new Error('Valid email is required');
  }

  // Validate password
  if (!password || password.length < 6) {
    throw new Error('Password must be at least 6 characters');
  }

  // Check if user exists
  const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
  if (existing.rows.length > 0) {
    throw new Error('User with this email already exists');
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 10);

  // Insert user
  const result = await pool.query(`
    INSERT INTO users (email, password_hash, full_name, role)
    VALUES ($1, $2, $3, $4)
    RETURNING id, email, full_name, role, is_active, created_at
  `, [email.toLowerCase(), passwordHash, fullName || null, role]);

  return result.rows[0];
}

/**
 * Authenticate user and generate JWT token
 */
export async function loginUser(email, password) {
  // Find user
  const result = await pool.query(
    'SELECT * FROM users WHERE email = $1',
    [email.toLowerCase()]
  );

  if (result.rows.length === 0) {
    throw new Error('Invalid email or password');
  }

  const user = result.rows[0];

  // Check if user is active
  if (!user.is_active) {
    throw new Error('Account is deactivated');
  }

  // Verify password
  const isValid = await bcrypt.compare(password, user.password_hash);
  if (!isValid) {
    throw new Error('Invalid email or password');
  }

  // Update last login
  await pool.query(
    'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
    [user.id]
  );

  // Generate JWT token
  const token = jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
      isActive: user.is_active,
    },
  };
}

/**
 * Verify JWT token
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

/**
 * Get user by ID
 */
export async function getUserById(userId) {
  const result = await pool.query(
    'SELECT id, email, full_name, role, is_active, last_login, created_at FROM users WHERE id = $1',
    [userId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const user = result.rows[0];
  return {
    id: user.id,
    email: user.email,
    fullName: user.full_name,
    role: user.role,
    isActive: user.is_active,
    lastLogin: user.last_login,
    createdAt: user.created_at,
  };
}

/**
 * Get all users (admin only)
 */
export async function getAllUsers() {
  const result = await pool.query(`
    SELECT id, email, full_name, role, is_active, last_login, created_at
    FROM users
    ORDER BY created_at DESC
  `);

  return result.rows.map(user => ({
    id: user.id,
    email: user.email,
    fullName: user.full_name,
    role: user.role,
    isActive: user.is_active,
    lastLogin: user.last_login,
    createdAt: user.created_at,
  }));
}

/**
 * Update user
 */
export async function updateUser(userId, updates) {
  const allowedFields = ['full_name', 'role', 'is_active'];
  const updateFields = [];
  const values = [];
  let paramIndex = 1;

  for (const field of allowedFields) {
    if (updates[field] !== undefined) {
      updateFields.push(`${field} = $${paramIndex}`);
      values.push(updates[field]);
      paramIndex++;
    }
  }

  if (updateFields.length === 0) {
    throw new Error('No valid fields to update');
  }

  updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(userId);

  const result = await pool.query(`
    UPDATE users
    SET ${updateFields.join(', ')}
    WHERE id = $${paramIndex}
    RETURNING id, email, full_name, role, is_active, last_login, created_at
  `, values);

  if (result.rows.length === 0) {
    throw new Error('User not found');
  }

  const user = result.rows[0];
  return {
    id: user.id,
    email: user.email,
    fullName: user.full_name,
    role: user.role,
    isActive: user.is_active,
    lastLogin: user.last_login,
    createdAt: user.created_at,
  };
}

/**
 * Update user password
 */
export async function updatePassword(userId, currentPassword, newPassword) {
  if (!newPassword || newPassword.length < 6) {
    throw new Error('New password must be at least 6 characters');
  }

  // Get user
  const userResult = await pool.query('SELECT password_hash FROM users WHERE id = $1', [userId]);
  if (userResult.rows.length === 0) {
    throw new Error('User not found');
  }

  // Verify current password
  const isValid = await bcrypt.compare(currentPassword, userResult.rows[0].password_hash);
  if (!isValid) {
    throw new Error('Current password is incorrect');
  }

  // Hash new password
  const passwordHash = await bcrypt.hash(newPassword, 10);

  // Update password
  await pool.query(
    'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
    [passwordHash, userId]
  );
}

/**
 * Delete user
 */
export async function deleteUser(userId) {
  const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [userId]);
  return result.rows.length > 0;
}

/**
 * Check if user has permission
 */
export function hasPermission(userRole, requiredRole) {
  const roleHierarchy = {
    [USER_ROLES.ADMIN]: 3,
    [USER_ROLES.MANAGER]: 2,
    [USER_ROLES.USER]: 1,
  };

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}

export default {
  ensureUsersTable,
  registerUser,
  loginUser,
  verifyToken,
  getUserById,
  getAllUsers,
  updateUser,
  updatePassword,
  deleteUser,
  hasPermission,
  USER_ROLES,
};
