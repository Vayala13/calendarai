# CalendarAI Browser Extension

This extension injects the CalendarAI chatbot into Google Calendar, allowing you to manage your calendar through natural language conversations.

## Installation

### Development Mode

1. Open Chrome/Edge and go to `chrome://extensions/` (or `edge://extensions/`)
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `extension` folder from this project
5. The extension is now installed!

### Usage

1. **Authenticate**: Click the extension icon and enter your CalendarAI auth token
2. **Open Google Calendar**: Navigate to [calendar.google.com](https://calendar.google.com)
3. **Open Chatbot**: Click the ✨ button in the bottom right corner
4. **Start Chatting**: Ask questions or give commands like:
   - "What's on my calendar today?"
   - "Add a meeting tomorrow at 2pm"
   - "Remove the event on Friday at 3pm"
   - "Show me my schedule this week"

## Features

- ✅ Natural language calendar management
- ✅ Add events to Google Calendar
- ✅ Remove events from Google Calendar
- ✅ View and query your schedule
- ✅ Real-time calendar updates
- ✅ Beautiful, modern UI

## Architecture

- **content.js**: Injects chatbot UI into Google Calendar pages
- **chatbot.html/js/css**: The chatbot interface (runs in iframe)
- **background.js**: Service worker for extension logic
- **popup.html/js**: Extension popup for authentication

## Backend API Requirements

The extension requires your CalendarAI backend to be running and accessible. Make sure:

1. Backend is running on `http://localhost:3001` (or update in popup)
2. CORS is enabled for `chrome-extension://` origins
3. Auth token is valid

## Development

To modify the extension:

1. Make changes to files in `extension/` folder
2. Go to `chrome://extensions/`
3. Click the refresh icon on the CalendarAI extension
4. Reload Google Calendar page

## Building Icons

You'll need to create icon files:
- `icons/icon16.png` (16x16)
- `icons/icon48.png` (48x48)
- `icons/icon128.png` (128x128)

Or use a placeholder for now.

