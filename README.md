# 📅 CalendarAI Monorepo

AI-powered calendar management system with standalone web app and Google Calendar extension.

## 🏗️ Structure

```
calendarai/
├── packages/
│   ├── backend/      # Node.js + Express API server
│   ├── web/         # React standalone web application
│   └── extension/   # Chrome/Edge browser extension
├── package.json     # Root workspace configuration
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js >= 16
- MySQL database
- npm >= 8

### Installation

```bash
# Install all dependencies
npm install

# Or install for specific package
npm install --workspace=packages/backend
npm install --workspace=packages/web
```

### Development

```bash
# Run backend only
npm run dev:backend

# Run web app only
npm run dev:web

# Run both (backend + web)
npm run dev:all
```

## 📦 Packages

### `@calendarai/backend`
- Express.js API server
- MySQL database
- Google Calendar integration
- AI chat endpoints

**Setup:**
1. Copy `.env.example` to `packages/backend/.env`
2. Configure database credentials
3. Run database migrations: `mysql -u root -p calendarai_db < packages/backend/database/schema.sql`
4. Start backend: `npm run dev:backend`

### `@calendarai/web`
- React + TypeScript
- Standalone calendar UI
- Full feature set

**Setup:**
1. Backend must be running on `http://localhost:3001`
2. Start web app: `npm run dev:web`
3. Open `http://localhost:3000`

### `@calendarai/extension`
- Browser extension
- Google Calendar integration
- Chatbot interface

**Setup:**
1. Open Chrome/Edge → `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select `packages/extension/` folder
5. Configure auth token in extension popup

## 🛠️ Scripts

- `npm run dev:backend` - Start backend server
- `npm run dev:web` - Start web app
- `npm run dev:all` - Start both
- `npm run build:web` - Build web app for production
- `npm run clean` - Remove all node_modules

## 📝 Documentation

- [Backend README](packages/backend/README.md)
- [Web App README](packages/web/README.md) - *Coming soon*
- [Extension README](packages/extension/README.md)
- [Google Setup Guide](GOOGLE_SETUP.md)
- [Setup Guide](SETUP.md)

## ✨ Features

### Core Functionality
- 🤔 **What-If Scenarios** - Test different scheduling arrangements without permanent changes
- 🤖 **AI Agent Integration** - Automated calendar optimization based on priorities
- 📊 **Priority Management** - Rank life responsibilities and allocate time accordingly
- ⏰ **Smart Time Allocation** - Manual or AI-driven hour distribution
- 📥 **Google Calendar Integration** - Sync with Google Calendar

### User Experience
- **Standalone Web App** - Full-featured calendar interface
- **Browser Extension** - Chatbot assistant for Google Calendar
- **Priority-Based Scheduling** - Focus time on what matters most
- **Flexible Time Management** - Choose between manual control or AI automation

## 🚀 Tech Stack

### Backend
- Node.js + Express
- MySQL
- Google Calendar API
- Anthropic Claude API

### Web App
- React 18 + TypeScript
- Styled Components
- React Router
- Zustand

### Extension
- Vanilla JavaScript
- Chrome Extension API
- Google Calendar API

## 🤝 Contributing

Each package can be developed independently while sharing the backend API.

## 📄 License

MIT License - See LICENSE file for details

---

**Built with ❤️ for better life organization through AI-powered scheduling**
