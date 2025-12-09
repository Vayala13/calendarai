const express = require('express');
const router = express.Router();
const Anthropic = require('@anthropic-ai/sdk');
const { authenticateToken } = require('../middleware/auth');
const db = require('../config/database');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Ask Agent: Generate a complete schedule from natural language
router.post('/generate-schedule', authenticateToken, async (req, res) => {
  try {
    const { description, startDate } = req.body;
    const userId = req.user.user_id;

    if (!description) {
      return res.status(400).json({ error: 'Please describe your schedule' });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(500).json({ error: 'Anthropic API key not configured' });
    }

    // Get current date info
    const start = startDate ? new Date(startDate) : new Date();
    const weekStart = new Date(start);
    weekStart.setDate(start.getDate() - start.getDay()); // Start of week (Sunday)

    const systemPrompt = `You are CalendarAI's scheduling agent. Your job is to take a user's description of their life/schedule and generate a complete, structured weekly schedule.

TODAY'S DATE: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
WEEK STARTING: ${weekStart.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}

INSTRUCTIONS:
1. Extract all activities/commitments from the user's description
2. Create appropriate priorities with realistic time allocations
3. Generate a balanced weekly schedule with specific events
4. Consider commute times, breaks, and realistic transitions
5. Respect work/school hours and personal time

RESPOND WITH VALID JSON ONLY (no markdown, no explanation, just the JSON object):
{
  "understood": "Brief summary of what you understood from their description",
  "priorities": [
    {
      "name": "Priority Name",
      "rank": 1-10,
      "hours_per_week": number,
      "color": "#hexcolor",
      "description": "Brief description"
    }
  ],
  "events": [
    {
      "title": "Event Title",
      "priority_name": "Matching Priority Name",
      "day": "Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday",
      "start_time": "HH:MM",
      "end_time": "HH:MM",
      "description": "Optional description",
      "recurring": true|false
    }
  ],
  "suggestions": ["Any additional suggestions for their schedule"]
}

COLOR PALETTE TO USE:
- Work/Career: #3B82F6 (blue)
- Health/Fitness: #22C55E (green)
- Commute/Travel: #F59E0B (amber)
- Learning/Reading: #8B5CF6 (purple)
- Family/Social: #EC4899 (pink)
- Rest/Self-care: #06B6D4 (cyan)
- Hobbies: #F97316 (orange)
- Meals: #84CC16 (lime)

IMPORTANT:
- Use 24-hour format for times (e.g., "09:00", "17:30")
- Days must be exactly: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday
- Make the schedule realistic and balanced
- Include buffer time between activities
- Consider morning routines, meals, and wind-down time`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 16000,
      thinking: {
        type: 'enabled',
        budget_tokens: 10000
      },
      system: systemPrompt,
      messages: [{ role: 'user', content: description }]
    });

    // Extract response
    let scheduleJson = null;
    let thinking = '';

    for (const block of response.content) {
      if (block.type === 'thinking') {
        thinking = block.thinking;
      } else if (block.type === 'text') {
        try {
          // Clean up the response - remove any markdown formatting
          let cleanText = block.text.trim();
          if (cleanText.startsWith('```json')) {
            cleanText = cleanText.slice(7);
          }
          if (cleanText.startsWith('```')) {
            cleanText = cleanText.slice(3);
          }
          if (cleanText.endsWith('```')) {
            cleanText = cleanText.slice(0, -3);
          }
          scheduleJson = JSON.parse(cleanText.trim());
        } catch (parseError) {
          console.error('Failed to parse JSON:', block.text);
          return res.status(500).json({ 
            error: 'Failed to parse schedule',
            raw: block.text 
          });
        }
      }
    }

    if (!scheduleJson) {
      return res.status(500).json({ error: 'No schedule generated' });
    }

    // Calculate actual dates for each day
    const dayOffsets = {
      'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3,
      'Thursday': 4, 'Friday': 5, 'Saturday': 6
    };

    // Helper to format date as YYYY-MM-DD HH:MM:SS (local time, no timezone conversion)
    const formatLocalDateTime = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = '00';
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    };

    const eventsWithDates = scheduleJson.events.map(event => {
      const dayOffset = dayOffsets[event.day];
      const eventDate = new Date(weekStart);
      eventDate.setDate(weekStart.getDate() + dayOffset);
      
      const [startHour, startMin] = event.start_time.split(':').map(Number);
      const [endHour, endMin] = event.end_time.split(':').map(Number);
      
      const startDateTime = new Date(eventDate);
      startDateTime.setHours(startHour, startMin, 0, 0);
      
      const endDateTime = new Date(eventDate);
      endDateTime.setHours(endHour, endMin, 0, 0);
      
      return {
        ...event,
        start_datetime: formatLocalDateTime(startDateTime),
        end_datetime: formatLocalDateTime(endDateTime),
        date: `${eventDate.getFullYear()}-${String(eventDate.getMonth() + 1).padStart(2, '0')}-${String(eventDate.getDate()).padStart(2, '0')}`
      };
    });

    res.json({
      success: true,
      understood: scheduleJson.understood,
      priorities: scheduleJson.priorities,
      events: eventsWithDates,
      suggestions: scheduleJson.suggestions,
      thinking: thinking,
      weekStart: weekStart.toISOString()
    });

  } catch (error) {
    console.error('Agent error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Apply the generated schedule
router.post('/apply-schedule', authenticateToken, async (req, res) => {
  try {
    const { priorities, events, clearExisting } = req.body;
    const userId = req.user.user_id;

    const results = {
      prioritiesCreated: 0,
      eventsCreated: 0,
      errors: []
    };

    // Optionally clear existing data
    if (clearExisting) {
      await db.query('DELETE FROM events WHERE user_id = ?', [userId]);
      await db.query('DELETE FROM priorities WHERE user_id = ?', [userId]);
    }

    // Create priorities first
    const priorityMap = new Map(); // Map priority names to IDs

    for (const priority of priorities) {
      try {
        // Check if priority already exists
        const [existing] = await db.query(
          'SELECT priority_id FROM priorities WHERE user_id = ? AND name = ?',
          [userId, priority.name]
        );

        if (existing.length > 0) {
          // Update existing priority
          await db.query(
            'UPDATE priorities SET `rank` = ?, hours_per_week = ?, color = ? WHERE priority_id = ?',
            [priority.rank, priority.hours_per_week, priority.color, existing[0].priority_id]
          );
          priorityMap.set(priority.name, existing[0].priority_id);
        } else {
          // Create new priority
          const [result] = await db.query(
            'INSERT INTO priorities (user_id, name, `rank`, hours_per_week, color) VALUES (?, ?, ?, ?, ?)',
            [userId, priority.name, priority.rank, priority.hours_per_week, priority.color]
          );
          priorityMap.set(priority.name, result.insertId);
          results.prioritiesCreated++;
        }
      } catch (err) {
        results.errors.push({ type: 'priority', name: priority.name, error: err.message });
      }
    }

    // Create events
    for (const event of events) {
      try {
        const priorityId = priorityMap.get(event.priority_name) || null;
        
        // start_datetime and end_datetime are already in 'YYYY-MM-DD HH:MM:SS' format
        console.log(`Creating event: ${event.title} from ${event.start_datetime} to ${event.end_datetime}`);
        
        await db.query(
          `INSERT INTO events (user_id, priority_id, title, description, start_time, end_time)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            userId,
            priorityId,
            event.title,
            event.description || `Created by AI Agent`,
            event.start_datetime,
            event.end_datetime
          ]
        );
        results.eventsCreated++;
      } catch (err) {
        console.error(`Error creating event ${event.title}:`, err.message);
        results.errors.push({ type: 'event', title: event.title, error: err.message });
      }
    }

    res.json({
      success: true,
      message: `Created ${results.prioritiesCreated} priorities and ${results.eventsCreated} events`,
      ...results
    });

  } catch (error) {
    console.error('Apply schedule error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Modify the generated schedule based on feedback
router.post('/modify-schedule', authenticateToken, async (req, res) => {
  try {
    const { currentSchedule, modification } = req.body;
    const userId = req.user.user_id;

    if (!modification) {
      return res.status(400).json({ error: 'Please describe your modification' });
    }

    const systemPrompt = `You are CalendarAI's scheduling agent. The user has a generated schedule and wants to modify it.

CURRENT SCHEDULE:
${JSON.stringify(currentSchedule, null, 2)}

INSTRUCTIONS:
1. Listen to the user's modification request
2. Update the schedule accordingly
3. Keep everything else the same unless it needs to change
4. Return the COMPLETE updated schedule (not just changes)

RESPOND WITH VALID JSON ONLY (no markdown, no explanation):
{
  "understood": "What modification you made",
  "priorities": [...],
  "events": [...],
  "suggestions": [...]
}`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 16000,
      thinking: {
        type: 'enabled',
        budget_tokens: 8000
      },
      system: systemPrompt,
      messages: [{ role: 'user', content: modification }]
    });

    let scheduleJson = null;
    let thinking = '';

    for (const block of response.content) {
      if (block.type === 'thinking') {
        thinking = block.thinking;
      } else if (block.type === 'text') {
        try {
          let cleanText = block.text.trim();
          if (cleanText.startsWith('```json')) cleanText = cleanText.slice(7);
          if (cleanText.startsWith('```')) cleanText = cleanText.slice(3);
          if (cleanText.endsWith('```')) cleanText = cleanText.slice(0, -3);
          scheduleJson = JSON.parse(cleanText.trim());
        } catch (parseError) {
          return res.status(500).json({ error: 'Failed to parse modified schedule' });
        }
      }
    }

    // Re-calculate dates
    const weekStart = new Date(currentSchedule.weekStart);
    const dayOffsets = {
      'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3,
      'Thursday': 4, 'Friday': 5, 'Saturday': 6
    };

    // Helper to format date as YYYY-MM-DD HH:MM:SS (local time)
    const formatLocalDateTime = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day} ${hours}:${minutes}:00`;
    };

    const eventsWithDates = scheduleJson.events.map(event => {
      const dayOffset = dayOffsets[event.day];
      const eventDate = new Date(weekStart);
      eventDate.setDate(weekStart.getDate() + dayOffset);
      
      const [startHour, startMin] = event.start_time.split(':').map(Number);
      const [endHour, endMin] = event.end_time.split(':').map(Number);
      
      const startDateTime = new Date(eventDate);
      startDateTime.setHours(startHour, startMin, 0, 0);
      
      const endDateTime = new Date(eventDate);
      endDateTime.setHours(endHour, endMin, 0, 0);
      
      return {
        ...event,
        start_datetime: formatLocalDateTime(startDateTime),
        end_datetime: formatLocalDateTime(endDateTime),
        date: `${eventDate.getFullYear()}-${String(eventDate.getMonth() + 1).padStart(2, '0')}-${String(eventDate.getDate()).padStart(2, '0')}`
      };
    });

    res.json({
      success: true,
      understood: scheduleJson.understood,
      priorities: scheduleJson.priorities,
      events: eventsWithDates,
      suggestions: scheduleJson.suggestions,
      thinking: thinking,
      weekStart: weekStart.toISOString()
    });

  } catch (error) {
    console.error('Modify error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

