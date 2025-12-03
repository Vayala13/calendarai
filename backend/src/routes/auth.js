const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');

// Register new user
router.post('/register',
  [
    body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters').escape(),
    body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
  ],
  async (req, res) => {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { username, email, password } = req.body;

      // Check if user already exists
      const [existingUsers] = await db.query(
        'SELECT * FROM users WHERE email = ? OR username = ?',
        [email, username]
      );

      if (existingUsers.length > 0) {
        return res.status(400).json({ error: 'User already exists with that email or username' });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password, salt);

      // Create user
      const [result] = await db.query(
        'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
        [username, email, password_hash]
      );

      // Create default preferences for new user
      await db.query(
        'INSERT INTO preferences (user_id) VALUES (?)',
        [result.insertId]
      );

      res.status(201).json({ 
        message: 'User registered successfully',
        user_id: result.insertId,
        username: username
      });

    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Server error during registration' });
    }
  }
);

// Login user
router.post('/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').exists()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { email, password } = req.body;

      // Find user
      const [users] = await db.query(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );

      if (users.length === 0) {
        return res.status(400).json({ error: 'Invalid email or password' });
      }

      const user = users[0];

      // Verify password
      const validPassword = await bcrypt.compare(password, user.password_hash);
      if (!validPassword) {
        return res.status(400).json({ error: 'Invalid email or password' });
      }

      // Create JWT token
      const token = jwt.sign(
        { 
          user_id: user.user_id,
          username: user.username,
          email: user.email
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        message: 'Login successful',
        token: token,
        user: {
          user_id: user.user_id,
          username: user.username,
          email: user.email
        }
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Server error during login' });
    }
  }
);

// Verify token (check if still valid)
router.get('/verify', async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ valid: false, message: 'No token provided' });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ valid: true, user: verified });
  } catch (error) {
    res.status(403).json({ valid: false, message: 'Invalid or expired token' });
  }
});

// Logout (client-side handles token deletion, but this endpoint for consistency)
router.post('/logout', (req, res) => {
  // In JWT, logout is handled client-side by deleting the token
  // This endpoint is just for consistency and can trigger server-side cleanup if needed
  res.json({ message: 'Logout successful' });
});

module.exports = router;

