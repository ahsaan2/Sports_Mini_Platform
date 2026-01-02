const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const { check, validationResult } = require('express-validator');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
if (!process.env.JWT_SECRET) {
  console.warn('Warning: JWT_SECRET is not set. Using default dev secret. Set JWT_SECRET in .env for production.');
} 

const requireDb = require('../middleware/requireDb');
const authenticateToken = require('../middleware/auth');
const router = express.Router();

// Require DB for auth-related routes
router.use(requireDb);

// Register
router.post(
  '/register',
  [
    check('name').trim().notEmpty().withMessage('Name is required'),
    check('email').isEmail().withMessage('Valid email is required'),
    check('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array()[0].msg });
      }

      const { name, email, password } = req.body;

      // Check if user already exists
      const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      if (userExists.rows.length > 0) {
        return res.status(400).json({ error: 'User with this email already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert user
      const result = await pool.query(
        'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email',
        [name, email, hashedPassword]
      );

      const user = result.rows[0];

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        message: 'User registered successfully',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Login
router.post(
  '/login',
  [
    check('email').isEmail().withMessage('Valid email is required'),
    check('password').notEmpty().withMessage('Password is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array()[0].msg });
      }

      const { email, password } = req.body;

      // Find user
      const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const user = result.rows[0];

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Current user (from token). If DB is configured, fetch full user record, otherwise return token payload
router.get('/me', authenticateToken, async (req, res) => {
  const tokenUser = req.user;
  try {
    if (pool.isConfigured) {
      const result = await pool.query('SELECT id, name, email FROM users WHERE id = $1', [tokenUser.userId]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      return res.json(result.rows[0]);
    }
    // Fallback: return token payload when DB not available
    res.json({ id: tokenUser.userId, email: tokenUser.email });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

