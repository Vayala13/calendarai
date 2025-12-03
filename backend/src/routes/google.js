const express = require('express');
const router = express.Router();
const { google } = require('googleapis');
const { authenticateToken } = require('../middleware/auth');
const db = require('../config/database');

// Google OAuth2 Configuration
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3001/api/google/callback'
);

// Scopes for Google Calendar
const SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events'
];

// Step 1: Generate Auth URL - User clicks this to start OAuth
router.get('/auth-url', authenticateToken, (req, res) => {
  try {
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
      state: req.user.user_id.toString(), // Pass user ID through OAuth flow
      prompt: 'consent' // Force consent screen to get refresh token
    });
    
    res.json({ url: authUrl });
  } catch (error) {
    console.error('Error generating auth URL:', error);
    res.status(500).json({ error: 'Failed to generate auth URL' });
  }
});

// Step 2: OAuth Callback - Google redirects here after user authorizes
router.get('/callback', async (req, res) => {
  const { code, state: userId } = req.query;
  
  if (!code) {
    return res.redirect('http://localhost:3000/calendar?error=no_code');
  }
  
  try {
    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    
    // Store tokens in database (encrypted in production!)
    await db.query(
      `UPDATE users SET 
        google_access_token = ?,
        google_refresh_token = ?,
        google_token_expiry = ?
      WHERE user_id = ?`,
      [
        tokens.access_token,
        tokens.refresh_token,
        tokens.expiry_date ? new Date(tokens.expiry_date) : null,
        userId
      ]
    );
    
    // Redirect back to app with success
    res.redirect('http://localhost:3000/calendar?google=connected');
  } catch (error) {
    console.error('Error in OAuth callback:', error);
    res.redirect('http://localhost:3000/calendar?error=oauth_failed');
  }
});

// Check if user has Google Calendar connected
router.get('/status', authenticateToken, async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT google_access_token, google_refresh_token FROM users WHERE user_id = ?',
      [req.user.user_id]
    );
    
    const user = users[0];
    const isConnected = !!(user?.google_access_token && user?.google_refresh_token);
    
    res.json({ connected: isConnected });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Disconnect Google Calendar
router.post('/disconnect', authenticateToken, async (req, res) => {
  try {
    await db.query(
      `UPDATE users SET 
        google_access_token = NULL,
        google_refresh_token = NULL,
        google_token_expiry = NULL
      WHERE user_id = ?`,
      [req.user.user_id]
    );
    
    res.json({ message: 'Google Calendar disconnected' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper function to get authenticated calendar client
async function getCalendarClient(userId) {
  const [users] = await db.query(
    'SELECT google_access_token, google_refresh_token, google_token_expiry FROM users WHERE user_id = ?',
    [userId]
  );
  
  const user = users[0];
  if (!user?.google_access_token) {
    throw new Error('Google Calendar not connected');
  }
  
  oauth2Client.setCredentials({
    access_token: user.google_access_token,
    refresh_token: user.google_refresh_token,
    expiry_date: user.google_token_expiry ? new Date(user.google_token_expiry).getTime() : null
  });
  
  // Handle token refresh
  oauth2Client.on('tokens', async (tokens) => {
    if (tokens.access_token) {
      await db.query(
        `UPDATE users SET 
          google_access_token = ?,
          google_token_expiry = ?
        WHERE user_id = ?`,
        [tokens.access_token, tokens.expiry_date ? new Date(tokens.expiry_date) : null, userId]
      );
    }
  });
  
  return google.calendar({ version: 'v3', auth: oauth2Client });
}

// Sync events TO Google Calendar
router.post('/sync-to-google', authenticateToken, async (req, res) => {
  try {
    const calendar = await getCalendarClient(req.user.user_id);
    
    // Get user's events from our database
    const [events] = await db.query(
      `SELECT e.*, p.name as priority_name, p.color as priority_color 
       FROM events e 
       LEFT JOIN priorities p ON e.priority_id = p.priority_id 
       WHERE e.user_id = ?`,
      [req.user.user_id]
    );
    
    const results = {
      created: 0,
      updated: 0,
      errors: []
    };
    
    for (const event of events) {
      try {
        const googleEvent = {
          summary: event.title,
          description: `${event.description || ''}\n\n[CalendarAI${event.priority_name ? ` - ${event.priority_name}` : ''}]`,
          start: {
            dateTime: new Date(event.start_time).toISOString(),
            timeZone: 'America/Los_Angeles'
          },
          end: {
            dateTime: new Date(event.end_time).toISOString(),
            timeZone: 'America/Los_Angeles'
          },
          colorId: getGoogleColorId(event.priority_color)
        };
        
        if (event.google_event_id) {
          // Update existing event
          await calendar.events.update({
            calendarId: 'primary',
            eventId: event.google_event_id,
            resource: googleEvent
          });
          results.updated++;
        } else {
          // Create new event
          const response = await calendar.events.insert({
            calendarId: 'primary',
            resource: googleEvent
          });
          
          // Store Google event ID
          await db.query(
            'UPDATE events SET google_event_id = ? WHERE event_id = ?',
            [response.data.id, event.event_id]
          );
          results.created++;
        }
      } catch (eventError) {
        results.errors.push({ event: event.title, error: eventError.message });
      }
    }
    
    res.json({
      message: `Synced ${results.created + results.updated} events to Google Calendar`,
      ...results
    });
  } catch (error) {
    console.error('Sync error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Import events FROM Google Calendar
router.post('/sync-from-google', authenticateToken, async (req, res) => {
  try {
    const calendar = await getCalendarClient(req.user.user_id);
    
    // Get events from the next 30 days
    const now = new Date();
    const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: now.toISOString(),
      timeMax: thirtyDaysLater.toISOString(),
      singleEvents: true,
      orderBy: 'startTime'
    });
    
    const googleEvents = response.data.items || [];
    const results = {
      imported: 0,
      skipped: 0,
      errors: []
    };
    
    for (const gEvent of googleEvents) {
      try {
        // Skip events that are already from CalendarAI
        if (gEvent.description?.includes('[CalendarAI')) {
          results.skipped++;
          continue;
        }
        
        // Check if we already have this event
        const [existing] = await db.query(
          'SELECT event_id FROM events WHERE google_event_id = ? AND user_id = ?',
          [gEvent.id, req.user.user_id]
        );
        
        if (existing.length > 0) {
          results.skipped++;
          continue;
        }
        
        // Import the event
        const startTime = gEvent.start.dateTime || gEvent.start.date;
        const endTime = gEvent.end.dateTime || gEvent.end.date;
        
        await db.query(
          `INSERT INTO events (user_id, title, description, start_time, end_time, google_event_id)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            req.user.user_id,
            gEvent.summary || 'Untitled Event',
            gEvent.description || '',
            new Date(startTime),
            new Date(endTime),
            gEvent.id
          ]
        );
        
        results.imported++;
      } catch (eventError) {
        results.errors.push({ event: gEvent.summary, error: eventError.message });
      }
    }
    
    res.json({
      message: `Imported ${results.imported} events from Google Calendar`,
      ...results
    });
  } catch (error) {
    console.error('Import error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Sync a specific scenario to Google Calendar
router.post('/sync-scenario/:scenarioId', authenticateToken, async (req, res) => {
  try {
    const { scenarioId } = req.params;
    const calendar = await getCalendarClient(req.user.user_id);
    
    // Get scenario events with modifications
    const [scenarioEvents] = await db.query(
      `SELECT se.*, e.title, e.description, e.start_time, e.end_time,
              p.name as priority_name, p.color as priority_color
       FROM scenario_events se
       JOIN events e ON se.event_id = e.event_id
       LEFT JOIN priorities p ON e.priority_id = p.priority_id
       WHERE se.scenario_id = ?`,
      [scenarioId]
    );
    
    const results = { synced: 0, errors: [] };
    
    for (const se of scenarioEvents) {
      try {
        const mods = se.modified_fields ? JSON.parse(se.modified_fields) : {};
        
        // Skip deleted events
        if (mods.deleted) continue;
        
        const eventData = {
          summary: mods.title || se.title,
          description: `${mods.description || se.description || ''}\n\n[CalendarAI What-If]`,
          start: {
            dateTime: new Date(mods.start_time || se.start_time).toISOString(),
            timeZone: 'America/Los_Angeles'
          },
          end: {
            dateTime: new Date(mods.end_time || se.end_time).toISOString(),
            timeZone: 'America/Los_Angeles'
          }
        };
        
        await calendar.events.insert({
          calendarId: 'primary',
          resource: eventData
        });
        
        results.synced++;
      } catch (eventError) {
        results.errors.push({ event: se.title, error: eventError.message });
      }
    }
    
    res.json({
      message: `Synced ${results.synced} scenario events to Google Calendar`,
      ...results
    });
  } catch (error) {
    console.error('Scenario sync error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Map priority colors to Google Calendar color IDs
function getGoogleColorId(hexColor) {
  // Google Calendar has 11 color options (1-11)
  // This is a rough mapping
  const colorMap = {
    '#ef4444': '11', // Red
    '#f97316': '6',  // Orange
    '#eab308': '5',  // Yellow
    '#22c55e': '10', // Green
    '#14b8a6': '7',  // Teal
    '#3b82f6': '9',  // Blue
    '#6366f1': '1',  // Indigo
    '#8b5cf6': '3',  // Purple
    '#ec4899': '4',  // Pink
    '#6b7280': '8',  // Gray
  };
  
  // Find closest color or default to blue
  if (hexColor && colorMap[hexColor.toLowerCase()]) {
    return colorMap[hexColor.toLowerCase()];
  }
  return '9'; // Default to blue
}

module.exports = router;

