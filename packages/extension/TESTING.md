# Testing the CalendarAI Extension

## Quick Start Guide

### Step 1: Start the Backend

Make sure your backend is running:

```bash
cd /Users/vivianaayala/Desktop/calendarai
npm run dev:backend
```

The backend should start on `http://localhost:3001`

### Step 2: Load Extension in Chrome/Edge

1. **Open Chrome/Edge** and navigate to:
   - Chrome: `chrome://extensions/`
   - Edge: `edge://extensions/`

2. **Enable Developer Mode**:
   - Toggle the "Developer mode" switch in the top right

3. **Load the Extension**:
   - Click "Load unpacked"
   - Navigate to: `/Users/vivianaayala/Desktop/calendarai/packages/extension`
   - Click "Select"

4. **Verify Installation**:
   - You should see "CalendarAI - Google Calendar Assistant" in your extensions list
   - Make sure it's enabled (toggle should be ON)

### Step 3: Get Your Auth Token

You need to authenticate with the backend:

1. **Option A: Use the web app**
   - Start the web app: `npm run dev:web`
   - Go to `http://localhost:3000`
   - Log in or register
   - Open browser DevTools (F12) → Application/Storage → Local Storage
   - Copy the `token` value

2. **Option B: Use the API directly**
   - Register/Login via API: `POST http://localhost:3001/api/auth/register` or `/api/auth/login`
   - Copy the token from the response

### Step 4: Configure Extension

1. **Click the extension icon** in your browser toolbar
2. **Enter your API URL**: `http://localhost:3001`
3. **Paste your auth token**
4. **Click "Save Token"**

### Step 5: Test on Google Calendar

1. **Open Google Calendar**: Go to [calendar.google.com](https://calendar.google.com)
2. **Look for the ✨ button** in the bottom right corner
3. **Click it** to open the chatbot
4. **Try these commands**:
   - "What's on my calendar today?"
   - "Add a meeting tomorrow at 2pm"
   - "Show me my events this week"

## Troubleshooting

### Extension doesn't appear on Google Calendar
- Make sure you're on `calendar.google.com` (not a different domain)
- Refresh the page (Cmd+R / Ctrl+R)
- Check browser console for errors (F12)

### "Failed to get response" error
- Make sure backend is running on port 3001
- Check that your auth token is valid
- Verify CORS is enabled in backend (should allow `chrome-extension://` origins)

### Chatbot doesn't open
- Check browser console for errors
- Make sure extension is enabled
- Try reloading the extension: `chrome://extensions/` → Click reload icon

### Backend connection issues
- Verify backend is running: `curl http://localhost:3001/api/health`
- Check backend logs for errors
- Make sure `.env` is configured correctly

## Testing Checklist

- [ ] Backend is running on port 3001
- [ ] Extension is loaded and enabled
- [ ] Auth token is saved in extension
- [ ] Can see ✨ button on Google Calendar
- [ ] Chatbot opens when clicking button
- [ ] Can send messages to chatbot
- [ ] Can receive responses from backend
- [ ] Can add events to Google Calendar
- [ ] Can view calendar events

## Next Steps

Once basic functionality works:
1. Test adding events via chatbot
2. Test removing events
3. Test viewing calendar queries
4. Test with different date formats
5. Test error handling

