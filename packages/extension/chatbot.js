// CalendarAI Chatbot JavaScript
// This runs inside the iframe injected into Google Calendar

const API_BASE_URL = 'http://localhost:3001/api';

let messages = [];
let isLoading = false;
let selectedColor = null; // Store selected color (hex format)

// DOM Elements
const messagesContainer = document.getElementById('messages-container');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const closeBtn = document.getElementById('close-btn');
const loadingIndicator = document.getElementById('loading-indicator');
const suggestionButtons = document.querySelectorAll('.suggestion-btn');
const colorPickerBtn = document.getElementById('color-picker-btn');
const colorPickerModal = document.getElementById('color-picker-modal');
const colorWheel = document.getElementById('color-wheel');
const hexInput = document.getElementById('hex-input');
const applyColorBtn = document.getElementById('apply-color-btn');
const closeColorPicker = document.getElementById('close-color-picker');
const selectedColorIndicator = document.getElementById('selected-color-indicator');
const colorSwatch = document.getElementById('color-swatch');
const clearColorBtn = document.getElementById('clear-color-btn');
const presetColors = document.querySelectorAll('.preset-color');

// Initialize
function init() {
  // Close button
  closeBtn.addEventListener('click', () => {
    window.parent.postMessage({ type: 'CALENDARAI_CLOSE' }, '*');
  });

  // Send button
  sendBtn.addEventListener('click', () => sendMessage());
  
  // Enter key to send
  messageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  // Auto-resize textarea
  messageInput.addEventListener('input', () => {
    messageInput.style.height = 'auto';
    messageInput.style.height = Math.min(messageInput.scrollHeight, 120) + 'px';
  });

  // Suggestion buttons
  suggestionButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const suggestion = btn.getAttribute('data-suggestion');
      messageInput.value = suggestion;
      sendMessage(suggestion);
    });
  });

  // Color picker button
  colorPickerBtn.addEventListener('click', () => {
    colorPickerModal.style.display = 'flex';
    if (selectedColor) {
      colorWheel.value = selectedColor;
      hexInput.value = selectedColor;
    }
  });

  // Close color picker
  closeColorPicker.addEventListener('click', () => {
    colorPickerModal.style.display = 'none';
  });

  // Close modal on background click
  colorPickerModal.addEventListener('click', (e) => {
    if (e.target === colorPickerModal) {
      colorPickerModal.style.display = 'none';
    }
  });

  // Sync color wheel and hex input
  colorWheel.addEventListener('input', (e) => {
    hexInput.value = e.target.value.toUpperCase();
  });

  hexInput.addEventListener('input', (e) => {
    const hex = e.target.value;
    if (/^#[0-9A-Fa-f]{0,6}$/.test(hex)) {
      if (hex.length === 7) {
        colorWheel.value = hex;
      }
    }
  });

  // Preset colors
  presetColors.forEach(preset => {
    preset.addEventListener('click', () => {
      const color = preset.getAttribute('data-color');
      colorWheel.value = color;
      hexInput.value = color.toUpperCase();
    });
  });

  // Apply color
  applyColorBtn.addEventListener('click', () => {
    const color = colorWheel.value;
    selectedColor = color;
    updateColorIndicator();
    colorPickerModal.style.display = 'none';
    // Show a brief message that color is selected
    if (messageInput.value.trim() === '') {
      messageInput.placeholder = `Color selected: ${color.toUpperCase()}. Ask me to add an event...`;
      setTimeout(() => {
        messageInput.placeholder = 'Ask me anything about your calendar...';
      }, 3000);
    }
  });

  // Clear color
  clearColorBtn.addEventListener('click', () => {
    selectedColor = null;
    updateColorIndicator();
  });

  // Listen for events from parent (Google Calendar page)
  window.addEventListener('message', (event) => {
    if (event.data.type === 'CALENDARAI_EVENTS' || event.data.type === 'CALENDARAI_EVENTS_UPDATE') {
      // Store current calendar events for context
      window.currentCalendarEvents = event.data.events;
    }
  });

  // Request current events
  window.parent.postMessage({ type: 'CALENDARAI_GET_EVENTS' }, '*');
}

// Send message
async function sendMessage(text) {
  // Handle case where event object might be passed instead of text
  if (text && typeof text !== 'string') {
    text = null; // Ignore non-string values (like event objects)
  }
  const messageText = text || messageInput.value.trim();
  if (!messageText || isLoading) return;

  // Clear input
  messageInput.value = '';
  messageInput.style.height = 'auto';

  // Add user message
  addMessage('user', messageText);

  // Show loading
  isLoading = true;
  updateUI();

  try {
    // Get auth token from storage
    const token = await getAuthToken();
    if (!token) {
      throw new Error('Please log in to CalendarAI first. Open the extension popup to authenticate.');
    }

    // Send to backend
    const response = await fetch(`${API_BASE_URL}/chat/message`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: messageText,
        sessionId: `ext_${Date.now()}`,
        conversationHistory: messages.map(m => ({
          role: m.role,
          content: m.content
        })),
        context: {
          calendarEvents: window.currentCalendarEvents || [],
          currentUrl: window.location.href,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          selectedColor: selectedColor // Include selected color in context
        },
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        selectedColor: selectedColor // Also include at top level for easy access
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || data.message || 'Failed to get response');
    }

    // Add assistant message
    addMessage('assistant', data.message);

    // Handle actions (add/remove events)
    if (data.actions && Array.isArray(data.actions) && data.actions.length > 0) {
      // Execute actions asynchronously
      handleActions(data.actions).catch(error => {
        console.error('Error executing actions:', error);
      });
    } else {
      // Try to parse actions from the message itself (if AI didn't use structured format)
      const parsedActions = parseActionsFromMessage(data.message);
      if (parsedActions.length > 0) {
        handleActions(parsedActions).catch(error => {
          console.error('Error executing parsed actions:', error);
        });
      }
    }

  } catch (error) {
    console.error('Chat error:', error);
    const errorMessage = error.message || 'Failed to get response from Claude';
    addMessage('assistant', `❌ Error: ${errorMessage}`, true);
  } finally {
    isLoading = false;
    updateUI();
  }
}

// Format markdown-like text to HTML
function formatMessage(content) {
  // Escape HTML first to prevent XSS
  let formatted = content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  
  // Convert markdown-style formatting to HTML
  formatted = formatted
    // Bold text **text** or __text__
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.+?)__/g, '<strong>$1</strong>')
    // Italic *text* or _text_ (but not if it's part of **)
    .replace(/(?<!\*)\*(?!\*)([^*]+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>')
    .replace(/(?<!_)_(?!_)([^_]+?)(?<!_)_(?!_)/g, '<em>$1</em>')
    // Code blocks `code`
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Bullet points (lines starting with - or *)
    .replace(/^[\-\*]\s+(.+)$/gm, '<li>$1</li>')
    // Numbered lists
    .replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>')
    // Line breaks (double newline = paragraph break)
    .replace(/\n\n+/g, '</p><p>')
    // Single newline = line break
    .replace(/\n/g, '<br>');
  
  // Wrap list items in ul tags
  formatted = formatted.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
  
  // Clean up empty paragraphs
  formatted = formatted.replace(/<p>\s*<\/p>/g, '');
  
  // Wrap in paragraph if not already wrapped and doesn't start with list
  if (!formatted.startsWith('<p>') && !formatted.startsWith('<ul>')) {
    formatted = '<p>' + formatted + '</p>';
  } else if (!formatted.startsWith('<p>') && formatted.startsWith('<ul>')) {
    formatted = formatted + '</p>';
  }
  
  return formatted;
}

// Add message to chat
function addMessage(role, content, isError = false) {
  const message = {
    role,
    content,
    timestamp: new Date()
  };
  messages.push(message);

  // Remove welcome message if exists
  const welcomeMsg = messagesContainer.querySelector('.welcome-message');
  if (welcomeMsg) {
    welcomeMsg.remove();
  }

  // Create message element
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${role}`;
  
  const bubble = document.createElement('div');
  bubble.className = 'message-bubble';
  if (isError) {
    bubble.classList.add('error-message');
  }
  
  // Format the content (parse markdown-like syntax)
  if (role === 'assistant' && !isError) {
    bubble.innerHTML = formatMessage(content);
  } else {
    bubble.textContent = content;
  }
  
  messageDiv.appendChild(bubble);
  messagesContainer.appendChild(messageDiv);
  
  // Scroll to bottom
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Handle actions from AI (add/remove events)
async function handleActions(actions) {
  if (!actions || !Array.isArray(actions)) return;
  
  for (const action of actions) {
    try {
      if (action.type === 'add_event' && action.event) {
        await addEventToGoogleCalendar(action.event);
      } else if (action.type === 'remove_event') {
        // If eventId is provided, use it directly
        if (action.eventId) {
          await removeEventFromGoogleCalendar(action.eventId);
        } 
        // Otherwise, try to find event by title/date
        else if (action.eventTitle || action.title) {
          await findAndRemoveEvent(action.eventTitle || action.title, action.date);
        }
      }
    } catch (error) {
      console.error('Error handling action:', error);
      addMessage('assistant', `❌ Error: ${error.message}`, true);
    }
  }
}

// Add event to Google Calendar via API
async function addEventToGoogleCalendar(eventData) {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('Not authenticated. Please save your token in the extension popup.');
    }

    // Ensure dates are in ISO format
    // Get user's timezone
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    // Use selected color from color picker if available, otherwise use AI-specified color
    // Priority: AI-specified color > user-selected color > no color
    const eventColor = eventData.color || selectedColor;
    
    const eventPayload = {
      title: eventData.title,
      description: eventData.description || '',
      start_time: eventData.start_time || eventData.startTime,
      end_time: eventData.end_time || eventData.endTime,
      location: eventData.location || '',
      timeZone: userTimeZone,
      ...(eventData.recurrence && { recurrence: eventData.recurrence }),
      ...(eventColor && { color: eventColor }),
      ...(eventData.colorId && { colorId: eventData.colorId })
    };
    
    // Only clear selected color if it was used (not if AI specified a different color)
    if (selectedColor && eventColor === selectedColor) {
      selectedColor = null;
      updateColorIndicator();
    }

    // Validate required fields
    if (!eventPayload.title || !eventPayload.start_time || !eventPayload.end_time) {
      throw new Error('Missing required event fields (title, start_time, end_time)');
    }

    // Log the event being created for debugging
    console.log('Creating event:', {
      title: eventPayload.title,
      start: eventPayload.start_time,
      end: eventPayload.end_time,
      parsedStart: new Date(eventPayload.start_time).toLocaleString(),
      parsedEnd: new Date(eventPayload.end_time).toLocaleString(),
      recurrence: eventPayload.recurrence || 'none',
      color: eventPayload.color || eventPayload.colorId || 'default'
    });

    const response = await fetch(`${API_BASE_URL}/google/create-event`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(eventPayload)
    });

    const data = await response.json();

    if (response.ok) {
      const isRecurring = eventData.recurrence ? ' (recurring)' : '';
      addMessage('assistant', `✅ Added "${eventData.title}" to your Google Calendar${isRecurring}!`, false);
      // Notify parent to refresh calendar view (without reloading page)
      window.parent.postMessage({ type: 'CALENDARAI_REFRESH' }, '*');
    } else {
      throw new Error(data.error || 'Failed to add event');
    }
  } catch (error) {
    console.error('Error adding event:', error);
    addMessage('assistant', `❌ Failed to add event: ${error.message}`, true);
    throw error;
  }
}

// Remove event from Google Calendar by ID
async function removeEventFromGoogleCalendar(eventId) {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('Not authenticated. Please save your token in the extension popup.');
    }

    const response = await fetch(`${API_BASE_URL}/google/delete-event/${encodeURIComponent(eventId)}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (response.ok) {
      addMessage('assistant', '✅ Event removed from your Google Calendar!', false);
      // Notify parent to refresh calendar view (without reloading page)
      window.parent.postMessage({ type: 'CALENDARAI_REFRESH' }, '*');
    } else {
      throw new Error(data.error || 'Failed to remove event');
    }
  } catch (error) {
    console.error('Error removing event:', error);
    addMessage('assistant', `❌ Failed to remove event: ${error.message}`, true);
    throw error;
  }
}

// Find and remove event by title and date
async function findAndRemoveEvent(title, date) {
  try {
    // First, get events from Google Calendar to find the event ID
    const token = await getAuthToken();
    const calendar = await getGoogleCalendarClient(token);
    
    // Search for events matching the title
    const timeMin = date ? new Date(date).toISOString() : new Date().toISOString();
    const timeMax = date ? new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000).toISOString() : 
                   new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    
    const response = await fetch(
      `${API_BASE_URL}/google/list-events?timeMin=${timeMin}&timeMax=${timeMax}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    if (response.ok) {
      const data = await response.json();
      const events = data.events || [];
      
      // Find matching event
      const matchingEvent = events.find(e => 
        e.summary && e.summary.toLowerCase().includes(title.toLowerCase())
      );
      
      if (matchingEvent && matchingEvent.id) {
        await removeEventFromGoogleCalendar(matchingEvent.id);
      } else {
        throw new Error(`Event "${title}" not found`);
      }
    } else {
      throw new Error('Failed to search for events');
    }
  } catch (error) {
    console.error('Error finding event:', error);
    throw error;
  }
}

// Parse actions from natural language message (fallback)
function parseActionsFromMessage(message) {
  const actions = [];
  
  // Look for patterns like "add event", "create meeting", "schedule"
  const addPatterns = [
    /(?:add|create|schedule|book)\s+(?:a\s+)?(?:meeting|event|appointment)\s+(?:called|titled|named)?\s*["']?([^"']+)["']?\s*(?:on|for|at)?\s*([^\n]+)/i,
    /(?:add|create|schedule)\s+["']?([^"']+)["']?\s*(?:on|for|at)?\s*([^\n]+)/i
  ];
  
  // Look for patterns like "remove", "delete", "cancel"
  const removePatterns = [
    /(?:remove|delete|cancel)\s+(?:the\s+)?(?:event|meeting|appointment)\s+(?:called|titled|named)?\s*["']?([^"']+)["']?/i,
    /(?:remove|delete|cancel)\s+["']?([^"']+)["']?/i
  ];
  
  // Try to extract add event
  for (const pattern of addPatterns) {
    const match = message.match(pattern);
    if (match) {
      const title = match[1]?.trim();
      const dateTimeStr = match[2]?.trim();
      
      if (title && dateTimeStr) {
        // Try to parse date/time
        const parsed = parseDateTime(dateTimeStr);
        if (parsed) {
          actions.push({
            type: 'add_event',
            event: {
              title: title,
              start_time: parsed.start,
              end_time: parsed.end
            }
          });
          break;
        }
      }
    }
  }
  
  // Try to extract remove event
  for (const pattern of removePatterns) {
    const match = message.match(pattern);
    if (match) {
      const title = match[1]?.trim();
      if (title) {
        actions.push({
          type: 'remove_event',
          eventTitle: title
        });
        break;
      }
    }
  }
  
  return actions;
}

// Parse date/time string to ISO format
function parseDateTime(dateTimeStr) {
  try {
    // Try to parse common formats
    const now = new Date();
    const lowerStr = dateTimeStr.toLowerCase();
    
    // Tomorrow, today, next week, etc.
    let baseDate = new Date(now);
    if (lowerStr.includes('tomorrow')) {
      baseDate.setDate(now.getDate() + 1);
    } else if (lowerStr.includes('today')) {
      baseDate = new Date(now);
    } else if (lowerStr.includes('next week')) {
      baseDate.setDate(now.getDate() + 7);
    }
    
    // Extract time (e.g., "2pm", "14:00", "2:30 PM")
    const timeMatch = dateTimeStr.match(/(\d{1,2}):?(\d{2})?\s*(am|pm)?/i);
    if (timeMatch) {
      let hours = parseInt(timeMatch[1]);
      const minutes = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
      const ampm = timeMatch[3]?.toLowerCase();
      
      if (ampm === 'pm' && hours !== 12) hours += 12;
      if (ampm === 'am' && hours === 12) hours = 0;
      
      baseDate.setHours(hours, minutes, 0, 0);
    } else {
      // Default to 2pm if no time specified
      baseDate.setHours(14, 0, 0, 0);
    }
    
    // End time is 1 hour after start (default)
    const endDate = new Date(baseDate);
    endDate.setHours(endDate.getHours() + 1);
    
    return {
      start: baseDate.toISOString(),
      end: endDate.toISOString()
    };
  } catch (e) {
    console.error('Error parsing date/time:', e);
    return null;
  }
}

// Helper to get Google Calendar client (for future use)
async function getGoogleCalendarClient(token) {
  // This would be used if we need direct Google Calendar API access
  // For now, we use the backend API
  return null;
}

// Get auth token from extension storage
async function getAuthToken() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['calendarai_token'], (result) => {
      resolve(result.calendarai_token || null);
    });
  });
}

// Update color indicator
function updateColorIndicator() {
  if (selectedColor) {
    selectedColorIndicator.style.display = 'flex';
    colorSwatch.style.backgroundColor = selectedColor;
    // Update the indicator text to show hex value
    const indicatorText = selectedColorIndicator.querySelector('span');
    if (indicatorText) {
      indicatorText.textContent = `Color: ${selectedColor.toUpperCase()}`;
    }
  } else {
    selectedColorIndicator.style.display = 'none';
  }
}

// Update UI state
function updateUI() {
  sendBtn.disabled = isLoading;
  messageInput.disabled = isLoading;
  loadingIndicator.style.display = isLoading ? 'flex' : 'none';
}

// Initialize on load
document.addEventListener('DOMContentLoaded', init);

