# 📅 CalendarAI Web Application

Standalone React + TypeScript web application for AI-powered calendar management with priority-based scheduling.

## 🎯 Overview

The CalendarAI web application provides a full-featured calendar interface with:
- Multi-view calendar (Month/Week/Day)
- AI-powered scheduling assistant
- Priority management system
- What-if scenario planning
- Google Calendar integration
- Dark/light theme support

## 🚀 Quick Start

### Prerequisites
- Node.js >= 16
- npm >= 8
- CalendarAI backend running on `http://localhost:3001`

### Installation

```bash
# From project root
npm install --workspace=packages/web

# Or from this directory
cd packages/web
npm install
```

### Development

```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test
```

The app will be available at **http://localhost:3000**

## 📱 Features

### Calendar Views
- **Month View** - Traditional monthly calendar with color-coded events
- **Week View** - 7-day grid with hourly time slots
- **Day View** - Detailed single-day schedule

### Priority Management
- Create and rank life priorities (Work, Family, Health, etc.)
- Set target hours per week for each priority
- Track actual vs. target time allocation
- Color-coded priority visualization

### AI Integration
- **Chat Interface** - Natural language event creation
- **AI Agent Mode** - Automated schedule optimization
- **Smart Recommendations** - AI suggests optimal event placement
- **Context-Aware** - Understands priorities and existing schedule

### What-If Scenarios
- Create sandbox versions of your schedule
- Test different arrangements without permanent changes
- Compare multiple scenarios side-by-side
- Apply scenarios when satisfied

### Event Management
- Create, edit, and delete events
- Drag-and-drop event creation
- Quick event details modal
- Conflict detection
- Recurring events support

### Google Calendar Integration
- OAuth2 authentication
- Bidirectional sync
- Import existing events
- Export scenarios to Google Calendar

## 🏗️ Architecture

### Tech Stack
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Styled Components** - CSS-in-JS styling
- **React Router** - Navigation
- **date-fns** - Date manipulation
- **Zustand** - State management (if needed)

### Project Structure

```
packages/web/
├── public/
│   ├── index.html
│   ├── favicon.ico
│   └── manifest.json
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── ChatSidebar.tsx
│   │   ├── DayEventsModal.tsx
│   │   └── GoogleCalendarSync.tsx
│   ├── pages/             # Page components
│   │   ├── HomePage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── CalendarPage.tsx
│   │   ├── PrioritiesPage.tsx
│   │   ├── WhatIfPage.tsx
│   │   ├── ScenarioEditorPage.tsx
│   │   ├── AIAgentPage.tsx
│   │   └── AskAgentPage.tsx
│   ├── context/           # React context providers
│   │   └── ThemeContext.tsx
│   ├── services/          # API services (if any)
│   ├── styles/            # Global styles
│   ├── App.tsx            # Main app component
│   └── index.tsx          # Entry point
├── package.json
└── tsconfig.json
```

## 🎨 Theming

The app supports both light and dark themes with a persistent theme toggle.

### Theme Structure
```typescript
themes = {
  light: {
    bgPrimary: '#f0f2f5',
    textPrimary: '#1f2937',
    // ... more colors
  },
  dark: {
    bgPrimary: '#0f0f23',
    textPrimary: '#e5e7eb',
    // ... more colors
  }
}
```

Access theme via `useTheme()` hook:
```typescript
import { useTheme } from '../context/ThemeContext';

const { theme, isDark, toggleTheme } = useTheme();
```

## 🔌 API Integration

The web app communicates with the backend API via REST endpoints.

### Configuration
Backend URL is proxied via `package.json`:
```json
{
  "proxy": "http://localhost:3001"
}
```

### Authentication
JWT tokens are stored in `localStorage` and included in API requests:
```typescript
const token = localStorage.getItem('token');
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

### Key Endpoints
- `POST /api/auth/login` - User authentication
- `GET /api/events` - Fetch events
- `POST /api/events` - Create event
- `GET /api/priorities` - Fetch priorities
- `POST /api/chat/message` - AI chat
- `GET /api/ai/analyze` - AI analysis

## 🧪 Testing

### Manual Testing
1. Start backend: `npm run dev:backend` (from root)
2. Start web app: `npm run dev:web` (from root)
3. Navigate to `http://localhost:3000`
4. Login with test credentials:
   - Email: `test@calendarai.com`
   - Password: `testpassword123`

### Test Account
The database seed includes a test user:
- **Username**: testuser
- **Email**: test@calendarai.com
- **Password**: testpassword123

## 🎯 Key Pages

### Dashboard (`/dashboard`)
- Statistics overview
- Quick actions
- Priority distribution chart
- Weekly progress

### Calendar (`/calendar`)
- Month/Week/Day views
- Event creation and editing
- Google Calendar sync
- Chat sidebar with AI assistant

### Priorities (`/priorities`)
- Create and rank priorities
- Set target hours per week
- Color customization
- Time allocation tracking

### What-If Mode (`/whatif`)
- List of scenarios
- Create new scenarios
- Apply or discard scenarios

### Scenario Editor (`/whatif/:id`)
- Edit scenario events
- Month/Week/Day views
- Mark events as modified/deleted
- Export to Google Calendar

### AI Agent Mode (`/ai-agent`)
- View AI analysis
- Priority progress tracking
- AI scheduling suggestions
- Auto-schedule recommendations

## 🔧 Configuration

### Environment Variables
Create `.env` file (optional):
```bash
SKIP_PREFLIGHT_CHECK=true
DANGEROUSLY_DISABLE_HOST_CHECK=true
WDS_SOCKET_HOST=localhost
WDS_SOCKET_PORT=3000
```

### Backend Connection
Update proxy in `package.json` if backend runs on different port:
```json
{
  "proxy": "http://localhost:YOUR_PORT"
}
```

## 📦 Building for Production

```bash
# Build optimized production bundle
npm run build

# Output will be in build/ directory
# Serve with any static file server:
npx serve -s build
```

### Production Checklist
- [ ] Update API URLs to production backend
- [ ] Set up proper environment variables
- [ ] Configure CORS on backend
- [ ] Test authentication flow
- [ ] Verify Google Calendar integration
- [ ] Test all routes and features

## 🐛 Troubleshooting

### Common Issues

**Problem**: "Cannot connect to backend"
- **Solution**: Ensure backend is running on `http://localhost:3001`
- Check proxy configuration in `package.json`

**Problem**: "Authentication failed"
- **Solution**: Clear localStorage and login again
- Verify backend JWT secret is configured

**Problem**: "Webpack dev server error"
- **Solution**: Clear cache: `rm -rf node_modules/.cache`
- Try: `SKIP_PREFLIGHT_CHECK=true npm start`

**Problem**: "TypeScript errors"
- **Solution**: Ensure all dependencies are installed
- Run: `npm install --workspace=packages/web`

## 🤝 Contributing

### Code Style
- Use TypeScript for all new components
- Follow React Hooks best practices
- Use styled-components for styling
- Add prop types/interfaces
- Write descriptive component names

### Component Guidelines
```typescript
// ✅ Good
interface MyComponentProps {
  title: string;
  isDark: boolean;
  onClose: () => void;
}

export const MyComponent: React.FC<MyComponentProps> = ({ 
  title, 
  isDark, 
  onClose 
}) => {
  // Component logic
};

export default MyComponent;
```

## 📚 Additional Resources

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Styled Components](https://styled-components.com/)
- [date-fns Documentation](https://date-fns.org/)

## 📄 License

MIT License - See LICENSE file in project root

---

**Built with ❤️ for intelligent calendar management**

