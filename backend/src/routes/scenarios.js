const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// GET all scenarios for a user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.user_id;
    const [scenarios] = await db.query(
      `SELECT s.*, 
        (SELECT COUNT(*) FROM scenario_events se WHERE se.scenario_id = s.scenario_id) as event_count
       FROM scenarios s 
       WHERE s.user_id = ? 
       ORDER BY s.created_at DESC`,
      [userId]
    );
    res.json(scenarios);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single scenario with its events
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const [scenarios] = await db.query(
      'SELECT * FROM scenarios WHERE scenario_id = ? AND user_id = ?',
      [req.params.id, req.user.user_id]
    );
    
    if (scenarios.length === 0) {
      return res.status(404).json({ error: 'Scenario not found' });
    }
    
    // Get scenario events with modifications
    const [scenarioEvents] = await db.query(
      `SELECT se.*, e.title, e.description, e.start_time, e.end_time, e.priority_id,
              p.name as priority_name, p.color as priority_color
       FROM scenario_events se
       JOIN events e ON se.event_id = e.event_id
       LEFT JOIN priorities p ON e.priority_id = p.priority_id
       WHERE se.scenario_id = ?`,
      [req.params.id]
    );
    
    res.json({
      ...scenarios[0],
      events: scenarioEvents
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create new scenario
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, description } = req.body;
    const userId = req.user.user_id;
    
    const [result] = await db.query(
      'INSERT INTO scenarios (user_id, name, description) VALUES (?, ?, ?)',
      [userId, name, description || null]
    );
    
    res.status(201).json({ 
      scenario_id: result.insertId,
      message: 'Scenario created successfully' 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST add event to scenario (with modifications)
router.post('/:id/events', authenticateToken, async (req, res) => {
  try {
    const { event_id, modified_fields } = req.body;
    const scenarioId = req.params.id;
    
    // Verify scenario belongs to user
    const [scenarios] = await db.query(
      'SELECT * FROM scenarios WHERE scenario_id = ? AND user_id = ?',
      [scenarioId, req.user.user_id]
    );
    
    if (scenarios.length === 0) {
      return res.status(404).json({ error: 'Scenario not found' });
    }
    
    // Add or update scenario event
    await db.query(
      `INSERT INTO scenario_events (scenario_id, event_id, modified_fields) 
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE modified_fields = ?`,
      [scenarioId, event_id, JSON.stringify(modified_fields), JSON.stringify(modified_fields)]
    );
    
    res.status(201).json({ message: 'Event added to scenario' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE remove event from scenario
router.delete('/:id/events/:eventId', authenticateToken, async (req, res) => {
  try {
    const { id: scenarioId, eventId } = req.params;
    
    // Verify scenario belongs to user
    const [scenarios] = await db.query(
      'SELECT * FROM scenarios WHERE scenario_id = ? AND user_id = ?',
      [scenarioId, req.user.user_id]
    );
    
    if (scenarios.length === 0) {
      return res.status(404).json({ error: 'Scenario not found' });
    }
    
    await db.query(
      'DELETE FROM scenario_events WHERE scenario_id = ? AND event_id = ?',
      [scenarioId, eventId]
    );
    
    res.json({ message: 'Event removed from scenario' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT apply scenario (make changes permanent)
router.put('/:id/apply', authenticateToken, async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const scenarioId = req.params.id;
    const userId = req.user.user_id;
    
    // Get scenario
    const [scenarios] = await connection.query(
      'SELECT * FROM scenarios WHERE scenario_id = ? AND user_id = ?',
      [scenarioId, userId]
    );
    
    if (scenarios.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Scenario not found' });
    }
    
    // Get all scenario events with modifications
    const [scenarioEvents] = await connection.query(
      'SELECT * FROM scenario_events WHERE scenario_id = ?',
      [scenarioId]
    );
    
    // Apply each modification to actual events
    for (const se of scenarioEvents) {
      if (se.modified_fields) {
        const modifications = JSON.parse(se.modified_fields);
        
        // Handle deletion
        if (modifications.deleted) {
          await connection.query(
            'DELETE FROM events WHERE event_id = ? AND user_id = ?',
            [se.event_id, userId]
          );
        } else {
          // Apply field updates
          const updates = [];
          const values = [];
          
          if (modifications.title !== undefined) {
            updates.push('title = ?');
            values.push(modifications.title);
          }
          if (modifications.description !== undefined) {
            updates.push('description = ?');
            values.push(modifications.description);
          }
          if (modifications.start_time !== undefined) {
            updates.push('start_time = ?');
            values.push(modifications.start_time);
          }
          if (modifications.end_time !== undefined) {
            updates.push('end_time = ?');
            values.push(modifications.end_time);
          }
          if (modifications.priority_id !== undefined) {
            updates.push('priority_id = ?');
            values.push(modifications.priority_id);
          }
          
          if (updates.length > 0) {
            values.push(se.event_id, userId);
            await connection.query(
              `UPDATE events SET ${updates.join(', ')} WHERE event_id = ? AND user_id = ?`,
              values
            );
          }
        }
      }
    }
    
    // Mark scenario as applied
    await connection.query(
      'UPDATE scenarios SET is_applied = TRUE WHERE scenario_id = ?',
      [scenarioId]
    );
    
    await connection.commit();
    res.json({ message: 'Scenario applied successfully' });
    
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ error: error.message });
  } finally {
    connection.release();
  }
});

// DELETE scenario
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const scenarioId = req.params.id;
    
    // Verify scenario belongs to user
    const [scenarios] = await db.query(
      'SELECT * FROM scenarios WHERE scenario_id = ? AND user_id = ?',
      [scenarioId, req.user.user_id]
    );
    
    if (scenarios.length === 0) {
      return res.status(404).json({ error: 'Scenario not found' });
    }
    
    // Delete scenario (cascade will delete scenario_events)
    await db.query('DELETE FROM scenarios WHERE scenario_id = ?', [scenarioId]);
    
    res.json({ message: 'Scenario deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

