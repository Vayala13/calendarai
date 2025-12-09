const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// ============ HELPER FUNCTIONS ============

// Get the start and end of the current week
function getWeekBounds() {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - dayOfWeek);
  startOfWeek.setHours(0, 0, 0, 0);
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);
  
  return { startOfWeek, endOfWeek };
}

// Calculate hours between two dates
function getHoursBetween(start, end) {
  return (new Date(end) - new Date(start)) / (1000 * 60 * 60);
}

// Find free time slots in a day
function findFreeSlots(events, date, workStart = 9, workEnd = 17) {
  const dayStart = new Date(date);
  dayStart.setHours(workStart, 0, 0, 0);
  
  const dayEnd = new Date(date);
  dayEnd.setHours(workEnd, 0, 0, 0);
  
  // Filter events for this day
  const dayEvents = events
    .filter(e => {
      const eventDate = new Date(e.start_time);
      return eventDate.toDateString() === date.toDateString();
    })
    .sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
  
  const freeSlots = [];
  let currentTime = dayStart;
  
  for (const event of dayEvents) {
    const eventStart = new Date(event.start_time);
    const eventEnd = new Date(event.end_time);
    
    // If there's a gap before this event
    if (currentTime < eventStart) {
      const gapHours = getHoursBetween(currentTime, eventStart);
      if (gapHours >= 0.5) { // At least 30 minutes
        freeSlots.push({
          start: new Date(currentTime),
          end: new Date(eventStart),
          hours: gapHours
        });
      }
    }
    
    // Move current time to after this event
    if (eventEnd > currentTime) {
      currentTime = new Date(eventEnd);
    }
  }
  
  // Check for gap after last event
  if (currentTime < dayEnd) {
    const gapHours = getHoursBetween(currentTime, dayEnd);
    if (gapHours >= 0.5) {
      freeSlots.push({
        start: new Date(currentTime),
        end: new Date(dayEnd),
        hours: gapHours
      });
    }
  }
  
  return freeSlots;
}

// ============ ROUTES ============

// Analyze calendar and priorities - get insights
router.get('/analyze', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { startOfWeek, endOfWeek } = getWeekBounds();
    
    // Get priorities
    const [priorities] = await db.query(
      'SELECT * FROM priorities WHERE user_id = ? ORDER BY `rank` ASC',
      [userId]
    );
    
    // Get this week's events
    const [events] = await db.query(
      `SELECT e.*, p.name as priority_name, p.color as priority_color, p.hours_per_week as target_hours
       FROM events e
       LEFT JOIN priorities p ON e.priority_id = p.priority_id
       WHERE e.user_id = ? AND e.start_time >= ? AND e.end_time <= ?
       ORDER BY e.start_time`,
      [userId, startOfWeek, endOfWeek]
    );
    
    // Calculate hours spent per priority this week
    const hoursPerPriority = {};
    priorities.forEach(p => {
      hoursPerPriority[p.priority_id] = {
        priority_id: p.priority_id,
        name: p.name,
        color: p.color,
        rank: p.rank,
        target_hours: parseFloat(p.hours_per_week) || 0,
        actual_hours: 0,
        events_count: 0
      };
    });
    
    // Also track unassigned time
    hoursPerPriority['unassigned'] = {
      priority_id: null,
      name: 'Unassigned',
      color: '#9ca3af',
      rank: 999,
      target_hours: 0,
      actual_hours: 0,
      events_count: 0
    };
    
    events.forEach(event => {
      const hours = getHoursBetween(event.start_time, event.end_time);
      const key = event.priority_id || 'unassigned';
      if (hoursPerPriority[key]) {
        hoursPerPriority[key].actual_hours += hours;
        hoursPerPriority[key].events_count += 1;
      }
    });
    
    // Calculate gaps (behind/ahead of target)
    const analysis = Object.values(hoursPerPriority).map(p => ({
      ...p,
      gap: p.actual_hours - p.target_hours,
      percentage: p.target_hours > 0 ? Math.round((p.actual_hours / p.target_hours) * 100) : null,
      status: p.target_hours === 0 ? 'no_target' :
              p.actual_hours >= p.target_hours ? 'on_track' :
              p.actual_hours >= p.target_hours * 0.7 ? 'behind' : 'critical'
    }));
    
    // Find total scheduled vs available hours
    const totalScheduledHours = events.reduce((sum, e) => sum + getHoursBetween(e.start_time, e.end_time), 0);
    const totalTargetHours = priorities.reduce((sum, p) => sum + (parseFloat(p.hours_per_week) || 0), 0);
    
    // Get free slots for next 7 days
    const freeSlots = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const slots = findFreeSlots(events, date);
      if (slots.length > 0) {
        freeSlots.push({
          date: date.toISOString().split('T')[0],
          dayName: date.toLocaleDateString('en-US', { weekday: 'long' }),
          slots
        });
      }
    }
    
    res.json({
      week: {
        start: startOfWeek,
        end: endOfWeek
      },
      summary: {
        total_scheduled_hours: Math.round(totalScheduledHours * 10) / 10,
        total_target_hours: totalTargetHours,
        total_events: events.length,
        priorities_count: priorities.length
      },
      priorities_analysis: analysis.filter(a => a.priority_id !== null || a.events_count > 0),
      free_slots: freeSlots,
      insights: generateInsights(analysis, freeSlots, totalScheduledHours, totalTargetHours)
    });
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Generate smart insights
function generateInsights(analysis, freeSlots, scheduledHours, targetHours) {
  const insights = [];
  
  // Check for critically behind priorities
  const critical = analysis.filter(a => a.status === 'critical');
  if (critical.length > 0) {
    critical.forEach(p => {
      insights.push({
        type: 'critical',
        priority: p.name,
        message: `⚠️ You're significantly behind on "${p.name}" - only ${Math.round(p.actual_hours)}h of ${p.target_hours}h target`,
        action: 'schedule_more',
        priority_id: p.priority_id
      });
    });
  }
  
  // Check for on-track priorities
  const onTrack = analysis.filter(a => a.status === 'on_track');
  if (onTrack.length > 0) {
    insights.push({
      type: 'success',
      message: `✅ Great job! You're on track with: ${onTrack.map(p => p.name).join(', ')}`,
      action: null
    });
  }
  
  // Suggest filling free time
  const totalFreeHours = freeSlots.reduce((sum, day) => 
    sum + day.slots.reduce((s, slot) => s + slot.hours, 0), 0);
  
  if (totalFreeHours > 2 && critical.length > 0) {
    insights.push({
      type: 'suggestion',
      message: `💡 You have ${Math.round(totalFreeHours)}h of free time this week. Want me to schedule time for your neglected priorities?`,
      action: 'auto_schedule'
    });
  }
  
  // Check if overbooked
  if (scheduledHours > targetHours * 1.2) {
    insights.push({
      type: 'warning',
      message: `📊 You might be overbooked! ${Math.round(scheduledHours)}h scheduled vs ${targetHours}h target`,
      action: 'review_calendar'
    });
  }
  
  return insights;
}

// Get scheduling suggestions
router.get('/suggestions', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { startOfWeek, endOfWeek } = getWeekBounds();
    
    // Get priorities that need more time
    const [priorities] = await db.query(
      'SELECT * FROM priorities WHERE user_id = ? ORDER BY `rank` ASC',
      [userId]
    );
    
    // Get this week's events
    const [events] = await db.query(
      `SELECT e.*, p.name as priority_name
       FROM events e
       LEFT JOIN priorities p ON e.priority_id = p.priority_id
       WHERE e.user_id = ? AND e.start_time >= ? AND e.end_time <= ?`,
      [userId, startOfWeek, endOfWeek]
    );
    
    // Calculate what's needed
    const hoursNeeded = [];
    for (const priority of priorities) {
      const targetHours = parseFloat(priority.hours_per_week) || 0;
      if (targetHours === 0) continue;
      
      const actualHours = events
        .filter(e => e.priority_id === priority.priority_id)
        .reduce((sum, e) => sum + getHoursBetween(e.start_time, e.end_time), 0);
      
      const gap = targetHours - actualHours;
      if (gap > 0) {
        hoursNeeded.push({
          priority_id: priority.priority_id,
          name: priority.name,
          color: priority.color,
          rank: priority.rank,
          hours_needed: Math.round(gap * 10) / 10,
          target: targetHours,
          actual: Math.round(actualHours * 10) / 10
        });
      }
    }
    
    // Sort by rank (most important first)
    hoursNeeded.sort((a, b) => a.rank - b.rank);
    
    // Find free slots for next 7 days
    const suggestions = [];
    
    for (let dayOffset = 0; dayOffset < 7 && hoursNeeded.length > 0; dayOffset++) {
      const date = new Date();
      date.setDate(date.getDate() + dayOffset);
      
      // Skip past days
      if (date < new Date() && dayOffset === 0) {
        date.setHours(new Date().getHours() + 1, 0, 0, 0);
      }
      
      const freeSlots = findFreeSlots(events, date);
      
      for (const slot of freeSlots) {
        // Find a priority that needs time and can fit in this slot
        for (const need of hoursNeeded) {
          if (need.hours_needed <= 0) continue;
          
          // Suggest using this slot for this priority
          const duration = Math.min(slot.hours, need.hours_needed, 2); // Max 2 hour blocks
          
          if (duration >= 0.5) {
            const endTime = new Date(slot.start);
            endTime.setMinutes(endTime.getMinutes() + duration * 60);
            
            suggestions.push({
              priority_id: need.priority_id,
              priority_name: need.name,
              priority_color: need.color,
              suggested_title: `${need.name} Time`,
              start_time: slot.start.toISOString(),
              end_time: endTime.toISOString(),
              duration_hours: duration,
              day: date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }),
              reason: `You need ${need.hours_needed}h more of "${need.name}" this week`
            });
            
            need.hours_needed -= duration;
            
            // Update slot start time
            slot.start = endTime;
            slot.hours -= duration;
            
            break; // Move to next slot
          }
        }
      }
    }
    
    res.json({
      needs: hoursNeeded,
      suggestions: suggestions.slice(0, 10), // Limit to 10 suggestions
      total_suggestions: suggestions.length
    });
  } catch (error) {
    console.error('Suggestions error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Auto-schedule: Create events based on AI suggestions
router.post('/auto-schedule', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { suggestions } = req.body; // Array of suggestions to apply
    
    if (!suggestions || !Array.isArray(suggestions)) {
      return res.status(400).json({ error: 'Suggestions array required' });
    }
    
    const created = [];
    const errors = [];
    
    for (const suggestion of suggestions) {
      try {
        const [result] = await db.query(
          `INSERT INTO events (user_id, priority_id, title, description, start_time, end_time)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            userId,
            suggestion.priority_id,
            suggestion.suggested_title || suggestion.title,
            `Auto-scheduled by AI Agent to meet your ${suggestion.priority_name} goal`,
            suggestion.start_time,
            suggestion.end_time
          ]
        );
        
        created.push({
          event_id: result.insertId,
          title: suggestion.suggested_title || suggestion.title,
          start_time: suggestion.start_time
        });
      } catch (err) {
        errors.push({
          suggestion: suggestion.suggested_title,
          error: err.message
        });
      }
    }
    
    res.json({
      message: `Created ${created.length} events`,
      created,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error('Auto-schedule error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Quick action: Schedule time for a specific priority
router.post('/quick-schedule', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { priority_id, hours, preferred_time } = req.body;
    
    // Get priority info
    const [priorities] = await db.query(
      'SELECT * FROM priorities WHERE priority_id = ? AND user_id = ?',
      [priority_id, userId]
    );
    
    if (priorities.length === 0) {
      return res.status(404).json({ error: 'Priority not found' });
    }
    
    const priority = priorities[0];
    
    // Get existing events
    const [events] = await db.query(
      `SELECT * FROM events WHERE user_id = ? AND start_time >= NOW()`,
      [userId]
    );
    
    // Find next available slot
    const requestedHours = parseFloat(hours) || 1;
    let scheduledEvents = [];
    let remainingHours = requestedHours;
    
    for (let dayOffset = 0; dayOffset < 7 && remainingHours > 0; dayOffset++) {
      const date = new Date();
      date.setDate(date.getDate() + dayOffset);
      
      const freeSlots = findFreeSlots(events, date);
      
      for (const slot of freeSlots) {
        if (remainingHours <= 0) break;
        
        const duration = Math.min(slot.hours, remainingHours, 2);
        if (duration >= 0.5) {
          const startTime = new Date(slot.start);
          const endTime = new Date(startTime);
          endTime.setMinutes(endTime.getMinutes() + duration * 60);
          
          // Create the event
          const [result] = await db.query(
            `INSERT INTO events (user_id, priority_id, title, description, start_time, end_time)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
              userId,
              priority_id,
              `${priority.name} Time`,
              `Scheduled by AI Agent`,
              startTime,
              endTime
            ]
          );
          
          scheduledEvents.push({
            event_id: result.insertId,
            title: `${priority.name} Time`,
            start_time: startTime,
            end_time: endTime,
            duration: duration
          });
          
          remainingHours -= duration;
          
          // Add to events array to avoid double-booking
          events.push({
            start_time: startTime,
            end_time: endTime
          });
        }
      }
    }
    
    res.json({
      message: `Scheduled ${requestedHours - remainingHours}h for "${priority.name}"`,
      events: scheduledEvents,
      remaining_hours: remainingHours > 0 ? remainingHours : 0
    });
  } catch (error) {
    console.error('Quick schedule error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

