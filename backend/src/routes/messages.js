const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET messages for a session
router.get('/:sessionId', async (req, res) => {
  try {
    const userId = req.query.user_id || 1;
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
router.post('/', async (req, res) => {
  try {
    const { user_id, session_id, sender_type, content } = req.body;
    const [result] = await db.query(
      'INSERT INTO messages (user_id, session_id, sender_type, content) VALUES (?, ?, ?, ?)',
      [user_id || 1, session_id, sender_type, content]
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

