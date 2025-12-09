const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// GET messages for a session
router.get('/:sessionId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.user_id;
    const [messages] = await db.query(
      'SELECT * FROM messages WHERE user_id = ? AND session_id = ? ORDER BY timestamp',
      [userId, req.params.sessionId]
    );
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create new message
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { session_id, sender_type, content } = req.body;
    const userId = req.user.user_id;
    const [result] = await db.query(
      'INSERT INTO messages (user_id, session_id, sender_type, content) VALUES (?, ?, ?, ?)',
      [userId, session_id, sender_type, content]
    );
    res.status(201).json({ 
      message_id: result.insertId,
      message: 'Message created successfully' 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

