# 🔗 Google Calendar Integration Setup

This guide walks you through connecting CalendarAI to Google Calendar. **It's 100% free!**

---

## 📋 Step 1: Create Google Cloud Project (5 minutes)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account
3. Click **"Select a project"** → **"New Project"**
4. Name it: `CalendarAI` (or anything you like)
5. Click **Create**

---

## 📅 Step 2: Enable Google Calendar API

1. In the search bar, type **"Google Calendar API"**
2. Click on **"Google Calendar API"** in results
3. Click the blue **"Enable"** button
4. Wait a few seconds for it to enable

---

## 🔑 Step 3: Create OAuth Credentials

1. In the left sidebar, click **"APIs & Services"** → **"Credentials"**
2. Click **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
3. You'll see "Configure Consent Screen" - click it

### Configure Consent Screen:
1. Select **"External"** → Click **Create**
2. Fill in:
   - **App name**: CalendarAI
   - **User support email**: Your email
   - **Developer contact email**: Your email
3. Click **Save and Continue** through all steps (skip optional fields)
4. Under "Test users", click **"+ ADD USERS"**
5. Add your email address
6. Click **Save and Continue** → **Back to Dashboard**

### Create OAuth Client ID:
1. Go back to **Credentials** → **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
2. **Application type**: Web application
3. **Name**: CalendarAI Web Client
4. Under **Authorized redirect URIs**, click **"+ ADD URI"**
5. Add: `http://localhost:3001/api/google/callback`
6. Click **Create**

### Copy Your Credentials:
You'll see a popup with:
- **Client ID**: `xxxxx.apps.googleusercontent.com`
- **Client Secret**: `GOCSPX-xxxxxxx`

**Copy both of these!**

---

## 🔧 Step 4: Add to Your Backend

Open `/backend/.env` and add:

```env
GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3001/api/google/callback
```

---

## 🚀 Step 5: Restart & Test

1. Restart your backend server:
   ```bash
   cd backend
   npm run dev
   ```

2. Go to your Calendar page in CalendarAI
3. Click the **📅 Google** button
4. Click **"Sign in with Google"**
5. Follow the Google authorization prompts
6. Done! You're connected! 🎉

---

## 🔄 Syncing Features

Once connected, you can:

| Action | What it does |
|--------|-------------|
| **Push to Google** | Sends all CalendarAI events to your Google Calendar |
| **Import from Google** | Pulls events from Google Calendar into CalendarAI |
| **Sync Scenario** | Export a What-If scenario directly to Google Calendar |

---

## ❓ Troubleshooting

### "Access Denied" Error
- Make sure you added yourself as a test user in the Consent Screen

### "Redirect URI Mismatch"
- Verify the redirect URI is exactly: `http://localhost:3001/api/google/callback`

### "Invalid Client"
- Double-check your Client ID and Secret in `.env`

---

## 🔒 Security Notes

- Your Google tokens are stored in the database
- CalendarAI only accesses your Calendar (not Gmail, Drive, etc.)
- You can disconnect anytime from the Calendar page
- For production, encrypt the tokens in the database

---

## 📱 For Production Deployment

When deploying to production:

1. Update the redirect URI to your production URL
2. Submit your app for Google verification (if you want users other than test users)
3. Use environment variables for all secrets
4. Add HTTPS (required by Google)

---

**That's it! Your CalendarAI is now connected to Google Calendar! 🎉**

