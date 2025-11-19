const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET all priorities for a user
router.get('/', async (req, res) => {
  try {
    const userId = req.query.user_id || 1;
    const [priorities] = await db.query(
      'SELECT * FROM priorities WHERE user_id = ? ORDER BY `rank`',
      [userId]
    );
    res.json(priorities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create new priority
router.post('/', async (req, res) => {
  try {
    const { user_id, name, rank, hours_per_week, color } = req.body;
    const [result] = await db.query(
      'INSERT INTO priorities (user_id, name, `rank`, hours_per_week, color) VALUES (?, ?, ?, ?, ?)',
      [user_id || 1, name, rank, hours_per_week, color]
    );
    res.status(201).json({ 
      priority_id: result.insertId,
      message: 'Priority created successfully' 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update priority
router.put('/:id', async (req, res) => {
  try {
    const { name, rank, hours_per_week, color } = req.body;
    await db.query(
      'UPDATE priorities SET name = ?, `rank` = ?, hours_per_week = ?, color = ? WHERE priority_id = ?',
      [name, rank, hours_per_week, color, req.params.id]
    );
    res.json({ message: 'Priority updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE priority
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM priorities WHERE priority_id = ?', [req.params.id]);
    res.json({ message: 'Priority deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

