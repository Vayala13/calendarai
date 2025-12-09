const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// GET all events for a user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.user_id; // Get from authenticated token
    const [events] = await db.query(
      `SELECT e.*, p.name as priority_name, p.color as priority_color 
       FROM events e 
       LEFT JOIN priorities p ON e.priority_id = p.priority_id 
       WHERE e.user_id = ? 
       ORDER BY e.start_time`,
      [userId]
    );
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single event
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const [events] = await db.query(
      'SELECT * FROM events WHERE event_id = ? AND user_id = ?',
      [req.params.id, req.user.user_id]
    );
    if (events.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json(events[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create new event
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { priority_id, title, description, start_time, end_time, color_override, is_whatif } = req.body;
    const userId = req.user.user_id; // Get from authenticated token
    const [result] = await db.query(
      `INSERT INTO events (user_id, priority_id, title, description, start_time, end_time, color_override, is_whatif) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, priority_id, title, description, start_time, end_time, color_override, is_whatif || false]
    );
    res.status(201).json({ 
      event_id: result.insertId,
      message: 'Event created successfully' 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update event
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { title, description, start_time, end_time, priority_id, color_override } = req.body;
    await db.query(
      `UPDATE events 
       SET title = ?, description = ?, start_time = ?, end_time = ?, priority_id = ?, color_override = ?
       WHERE event_id = ? AND user_id = ?`,
      [title, description, start_time, end_time, priority_id, color_override, req.params.id, req.user.user_id]
    );
    res.json({ message: 'Event updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE event
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await db.query('DELETE FROM events WHERE event_id = ? AND user_id = ?', [req.params.id, req.user.user_id]);
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

