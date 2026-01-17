import express from 'express';
import {
  registerUser,
  loginUser,
  getUserById,
  getAllUsers,
  updateUser,
  updatePassword,
  deleteUser,
  ensureUsersTable,
  USER_ROLES,
} from '../services/authService.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Ensure users table exists on startup
ensureUsersTable().catch(console.error);

/**
 * POST /api/auth/register
 * Register a new user (admin only)
 */
router.post('/register', authenticate, authorize(USER_ROLES.ADMIN), async (req, res) => {
  try {
    const { email, password, fullName, role } = req.body;

    const user = await registerUser({
      email,
      password,
      fullName,
      role: role || USER_ROLES.USER,
    });

    res.status(201).json({
      success: true,
      data: user,
      message: 'User registered successfully',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/auth/login
 * Login user
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required',
      });
    }

    const result = await loginUser(email, password);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/auth/me
 * Get current user
 */
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await getUserById(req.user.id);
    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/auth/users
 * Get all users (admin only)
 */
router.get('/users', authenticate, authorize(USER_ROLES.ADMIN), async (req, res) => {
  try {
    const users = await getAllUsers();
    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * PUT /api/auth/users/:id
 * Update user (admin only, or self for non-role fields)
 */
router.put('/users/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Users can only update themselves (non-role fields) unless they're admin
    if (req.user.id !== id && req.user.role !== USER_ROLES.ADMIN) {
      return res.status(403).json({
        success: false,
        error: 'You can only update your own profile',
      });
    }

    // Only admins can change roles
    if (updates.role && req.user.role !== USER_ROLES.ADMIN) {
      delete updates.role;
    }

    // Only admins can change is_active
    if (updates.is_active !== undefined && req.user.role !== USER_ROLES.ADMIN) {
      delete updates.is_active;
    }

    const user = await updateUser(id, updates);
    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/auth/users/:id/password
 * Update user password
 */
router.post('/users/:id/password', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;

    // Users can only change their own password (unless admin)
    if (req.user.id !== id && req.user.role !== USER_ROLES.ADMIN) {
      return res.status(403).json({
        success: false,
        error: 'You can only change your own password',
      });
    }

    // Admins can change password without current password
    if (req.user.role === USER_ROLES.ADMIN && req.user.id !== id) {
      // Admin reset password flow (would need separate endpoint)
      return res.status(400).json({
        success: false,
        error: 'Use admin password reset endpoint',
      });
    }

    await updatePassword(id, currentPassword, newPassword);
    res.json({
      success: true,
      message: 'Password updated successfully',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * DELETE /api/auth/users/:id
 * Delete user (admin only)
 */
router.delete('/users/:id', authenticate, authorize(USER_ROLES.ADMIN), async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent deleting yourself
    if (req.user.id === id) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete your own account',
      });
    }

    const deleted = await deleteUser(id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    res.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
