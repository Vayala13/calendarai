const express = require('express');
const router = express.Router();
const Anthropic = require('@anthropic-ai/sdk');
const { authenticateToken } = require('../middleware/auth');
const db = require('../config/database');

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Helper to get user's calendar context
async function getUserContext(userId) {
  try {
    // Get priorities
    const [priorities] = await db.query(
      'SELECT name, `rank`, hours_per_week, color FROM priorities WHERE user_id = ? ORDER BY `rank`',
      [userId]
    );

    // Get upcoming events (next 7 days)
    const [events] = await db.query(
      `SELECT e.title, e.description, e.start_time, e.end_time, p.name as priority_name
       FROM events e
       LEFT JOIN priorities p ON e.priority_id = p.priority_id
       WHERE e.user_id = ? AND e.start_time >= NOW() AND e.start_time <= DATE_ADD(NOW(), INTERVAL 7 DAY)
       ORDER BY e.start_time
       LIMIT 20`,
      [userId]
    );

    // Get user preferences
    const [prefs] = await db.query(
      'SELECT work_start_time, work_end_time FROM preferences WHERE user_id = ?',
      [userId]
    );

    // Calculate hours this week per priority
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const [weekEvents] = await db.query(
      `SELECT e.priority_id, p.name as priority_name, 
              SUM(TIMESTAMPDIFF(MINUTE, e.start_time, e.end_time)) / 60 as hours
       FROM events e
       LEFT JOIN priorities p ON e.priority_id = p.priority_id
       WHERE e.user_id = ? AND e.start_time >= ?
       GROUP BY e.priority_id, p.name`,
      [userId, startOfWeek]
    );

    return {
      priorities: priorities.map(p => ({
        name: p.name,
        rank: p.rank,
        targetHoursPerWeek: p.hours_per_week,
        color: p.color
      })),
      upcomingEvents: events.map(e => ({
        title: e.title,
        priority: e.priority_name || 'Unassigned',
        start: e.start_time,
        end: e.end_time
      })),
      workHours: prefs[0] ? {
        start: prefs[0].work_start_time,
        end: prefs[0].work_end_time
      } : { start: '09:00', end: '17:00' },
      weeklyProgress: weekEvents.map(w => ({
        priority: w.priority_name || 'Unassigned',
        hoursSpent: Math.round(w.hours * 10) / 10
      }))
    };
  } catch (error) {
    console.error('Error getting user context:', error);
    return null;
  }
}

// Chat with Claude
router.post('/message', authenticateToken, async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;
    const userId = req.user.user_id;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(500).json({ 
        error: 'Anthropic API key not configured',
        message: 'Please add ANTHROPIC_API_KEY to your backend/.env file'
      });
    }

    // Get user's calendar context
    const context = await getUserContext(userId);

    // Build the system prompt
    const systemPrompt = `You are CalendarAI's intelligent scheduling assistant, powered by Claude. You help users manage their time effectively based on their priorities.

CURRENT USER CONTEXT:
${context ? `
PRIORITIES (ranked by importance):
${context.priorities.map(p => `- ${p.name} (Rank ${p.rank}): Target ${p.targetHoursPerWeek || 0}h/week`).join('\n')}

UPCOMING EVENTS (Next 7 days):
${context.upcomingEvents.length > 0 
  ? context.upcomingEvents.map(e => `- ${e.title} (${e.priority}) - ${new Date(e.start).toLocaleString()}`).join('\n')
  : 'No upcoming events scheduled'}

THIS WEEK'S PROGRESS:
${context.weeklyProgress.length > 0
  ? context.weeklyProgress.map(w => `- ${w.priority}: ${w.hoursSpent}h spent`).join('\n')
  : 'No events tracked yet this week'}

WORK HOURS: ${context.workHours.start} - ${context.workHours.end}
` : 'Unable to load user context'}

YOUR CAPABILITIES:
1. Analyze the user's schedule and priorities
2. Suggest optimal times for activities based on their priorities
3. Help balance their time across different life areas
4. Provide scheduling advice and productivity tips
5. Answer questions about their calendar and commitments
6. Help them plan their week/day effectively

GUIDELINES:
- Be helpful, friendly, and concise
- Give specific, actionable advice based on their actual data
- If they're behind on a priority, suggest specific times to schedule it
- Consider their work hours when making suggestions
- Use emojis sparingly to make responses engaging
- If you suggest creating events, format them clearly with title, date, and time
- Always be encouraging about their progress

Remember: You're their personal AI scheduling assistant helping them live a balanced, productive life aligned with their priorities.`;

    // Build messages array
    const messages = [
      ...conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user', content: message }
    ];

    // Call Claude API with extended thinking
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 16000,
      thinking: {
        type: 'enabled',
        budget_tokens: 10000
      },
      system: systemPrompt,
      messages: messages
    });

    // Extract the response text and thinking
    let assistantMessage = '';
    let thinkingContent = '';
    
    for (const block of response.content) {
      if (block.type === 'thinking') {
        thinkingContent = block.thinking;
      } else if (block.type === 'text') {
        assistantMessage = block.text;
      }
    }

    // Save to database for history
    const sessionId = req.body.sessionId || `chat_${Date.now()}`;
    
    await db.query(
      `INSERT INTO messages (user_id, session_id, sender_type, content) VALUES (?, ?, 'user', ?)`,
      [userId, sessionId, message]
    );
    
    await db.query(
      `INSERT INTO messages (user_id, session_id, sender_type, content) VALUES (?, ?, 'ai', ?)`,
      [userId, sessionId, assistantMessage]
    );

    res.json({
      message: assistantMessage,
      thinking: thinkingContent, // Include thinking for transparency
      sessionId,
      model: 'claude-sonnet-4-20250514'
    });

  } catch (error) {
    console.error('Chat error:', error);
    
    if (error.status === 401) {
      return res.status(401).json({ error: 'Invalid Anthropic API key' });
    }
    
    res.status(500).json({ 
      error: 'Failed to get response from Claude',
      details: error.message 
    });
  }
});

// Get chat history
router.get('/history/:sessionId', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.user_id;

    const [messages] = await db.query(
      `SELECT sender_type as role, content, timestamp 
       FROM messages 
       WHERE user_id = ? AND session_id = ?
       ORDER BY timestamp ASC`,
      [userId, sessionId]
    );

    // Convert sender_type to role format Claude expects
    const formattedMessages = messages.map(m => ({
      role: m.role === 'ai' ? 'assistant' : 'user',
      content: m.content,
      timestamp: m.timestamp
    }));

    res.json({ messages: formattedMessages, sessionId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get recent chat sessions
router.get('/sessions', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.user_id;

    const [sessions] = await db.query(
      `SELECT session_id, MIN(timestamp) as started, MAX(timestamp) as last_message,
              COUNT(*) as message_count
       FROM messages 
       WHERE user_id = ?
       GROUP BY session_id
       ORDER BY last_message DESC
       LIMIT 10`,
      [userId]
    );

    res.json({ sessions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

