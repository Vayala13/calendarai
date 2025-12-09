const express = require('express');
const router = express.Router();
const Anthropic = require('@anthropic-ai/sdk');
const { authenticateToken } = require('../middleware/auth');
const db = require('../config/database');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Load and parse agent.yaml config
function loadAgentConfig() {
  try {
    const configPath = path.join(__dirname, '../../agent.yaml');
    const fileContents = fs.readFileSync(configPath, 'utf8');
    const config = yaml.load(fileContents);
    return config;
  } catch (error) {
    console.error('Error loading agent.yaml:', error);
    return null;
  }
}

// Build system prompt from agent.yaml with template variable replacement
function buildSystemPrompt(config, templateVars) {
  if (!config || !config.instructions) {
    // Fallback to default prompt if YAML not available
    return 'You are CalendarAI, an intelligent scheduling assistant.';
  }
  
  let instructions = config.instructions;
  
  // Replace template variables
  Object.keys(templateVars).forEach(key => {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    instructions = instructions.replace(regex, templateVars[key]);
  });
  
  // Handle conditional blocks (simple {{#if VAR}}...{{/if}} syntax)
  if (templateVars.SELECTED_COLOR) {
    instructions = instructions.replace(/\{\{#if SELECTED_COLOR\}\}([\s\S]*?)\{\{\/if\}\}/g, '$1');
  } else {
    instructions = instructions.replace(/\{\{#if SELECTED_COLOR\}\}[\s\S]*?\{\{\/if\}\}/g, '');
  }
  
  return instructions;
}

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

    // Get Google Calendar events if available (from extension context)
    const calendarEvents = req.body.context?.calendarEvents || [];
    const calendarContext = calendarEvents.length > 0 
      ? `\n\nCURRENT GOOGLE CALENDAR EVENTS (from extension):\n${calendarEvents.map(e => `- ${e.title}${e.time ? ` at ${e.time}` : ''}`).join('\n')}`
      : '';

    // Get user's timezone from request or default to system timezone
    const userTimeZone = req.body.context?.timeZone || 
                        req.body.timeZone || 
                        Intl.DateTimeFormat().resolvedOptions().timeZone || 
                        'America/Los_Angeles';
    
    // Get current date/time in user's timezone
    const now = new Date();
    
    // Format current date in user's timezone (YYYY-MM-DD)
    const currentDate = now.toLocaleDateString('en-CA', { timeZone: userTimeZone }); // en-CA gives YYYY-MM-DD format
    
    // Get tomorrow's date (next calendar day at midnight in user's timezone)
    // Create a date object for today at midnight in user's timezone, then add 1 day
    const todayParts = currentDate.split('-');
    const todayInUserTZ = new Date(Date.UTC(
      parseInt(todayParts[0]), 
      parseInt(todayParts[1]) - 1, 
      parseInt(todayParts[2])
    ));
    const tomorrowInUserTZ = new Date(todayInUserTZ);
    tomorrowInUserTZ.setUTCDate(tomorrowInUserTZ.getUTCDate() + 1);
    const tomorrowDate = tomorrowInUserTZ.toISOString().split('T')[0];
    
    // Format current time in user's timezone
    const currentTime = now.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true,
      timeZone: userTimeZone 
    });
    const dayOfWeek = now.toLocaleDateString('en-US', { 
      weekday: 'long',
      timeZone: userTimeZone 
    });
    
    // Load agent config
    const agentConfig = loadAgentConfig();
    
    // Get selected color from request
    const selectedColor = req.body.context?.selectedColor || req.body.selectedColor;
    
    // Prepare template variables for YAML config
    const templateVars = {
      CURRENT_DATETIME: `${dayOfWeek}, ${currentDate} ${currentTime} (${userTimeZone})`,
      USER_TIMEZONE: userTimeZone,
      TODAY_DATE: currentDate,
      DAY_OF_WEEK: dayOfWeek,
      TOMORROW_DATE: tomorrowDate,
      SELECTED_COLOR: selectedColor || ''
    };
    
    // Build base system prompt from agent.yaml
    let systemPrompt = buildSystemPrompt(agentConfig, templateVars);
    
    // Add selected color info if available
    if (selectedColor) {
      systemPrompt += `\n\nUSER SELECTED COLOR: The user has picked color ${selectedColor} from the color picker. When creating events, automatically use this color unless the user explicitly specifies a different color in their message.`;
    }
    
    // Add dynamic user context
    systemPrompt += `
    
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
` : 'Unable to load user context'}${calendarContext}`;

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
    let actions = [];
    
    for (const block of response.content) {
      if (block.type === 'thinking') {
        thinkingContent = block.thinking;
      } else if (block.type === 'text') {
        assistantMessage = block.text;
        
        // Try to parse JSON actions from the response (but don't show JSON to user)
        // Look for JSON code blocks and extract actions silently
        try {
          // Check if response contains JSON structure
          const jsonMatch = assistantMessage.match(/```json\s*([\s\S]*?)\s*```/) || 
                           assistantMessage.match(/```\s*([\s\S]*?)\s*```/);
          
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[1]);
            if (parsed.actions && Array.isArray(parsed.actions)) {
              actions = parsed.actions;
              // Remove the JSON code block from the message - only show natural language
              assistantMessage = assistantMessage.replace(/```json\s*[\s\S]*?\s*```/g, '').replace(/```\s*[\s\S]*?\s*```/g, '').trim();
              // Use the message from JSON if available, otherwise use cleaned message
              if (parsed.message) {
                assistantMessage = parsed.message;
              }
            }
          } else {
            // Try to parse the entire response as JSON (hidden)
            const parsed = JSON.parse(assistantMessage);
            if (parsed.actions && Array.isArray(parsed.actions)) {
              actions = parsed.actions;
              // Only show the natural language message, not the JSON
              assistantMessage = parsed.message || 'Done!';
            }
          }
        } catch (e) {
          // Not JSON, continue with text response as-is
        }
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
      actions: actions.length > 0 ? actions : undefined, // Only include if actions exist
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

