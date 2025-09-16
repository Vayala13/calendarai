# 📅 CalendarAI

A dynamic, AI-powered calendar application that helps you juggle life's responsibilities with intelligent scheduling and priority management.

## 🎯 Vision

CalendarAI brings the power of AI assistance to calendar management, featuring modes inspired by Cursor's interface:
- **What-If Mode**: Explore scheduling scenarios without committing changes
- **Agent Mode**: Let AI make permanent optimizations to your calendar based on priorities

## ✨ Features

### Core Functionality
- 🤔 **What-If Scenarios** - Test different scheduling arrangements without permanent changes
- 🤖 **AI Agent Integration** - Automated calendar optimization based on your priorities
- 📊 **Priority Management** - Rank life responsibilities and allocate time accordingly
- ⏰ **Smart Time Allocation** - Manual or AI-driven hour distribution
- 📥 **Google Calendar Export** - Download .ics files for seamless integration

### User Experience
- **Dynamic Calendar Views** - Responsive, modern calendar interface
- **Priority-Based Scheduling** - Focus time on what matters most
- **Flexible Time Management** - Choose between manual control or AI automation
- **Scenario Planning** - Visualize different scheduling approaches

## 🚀 Tech Stack

- **React 18** with TypeScript for type safety and modern development
- **React Router v6** for seamless navigation
- **Styled Components** for component-based styling
- **Zustand** for lightweight, powerful state management
- **date-fns** for robust date manipulation
- **ics** library for calendar file generation
- **React Icons** for consistent iconography

## 🏗️ Architecture

### Flat, Powerful Folder Structure
```
src/
├── pages/          # Feature-based page components
├── services/       # Business logic & API layer  
├── styles/         # Styled components
└── assets/         # Static resources
```

**Why This Structure Rocks:**
- ✅ **Minimal Nesting** - Fast navigation, less decision fatigue
- ✅ **Pages-First** - Each user journey gets its own page
- ✅ **Centralized Logic** - All business logic in services/
- ✅ **Easy Scaling** - Add features by adding pages, not restructuring
- ✅ **Developer Friendly** - Instantly know where to find/add code

### Planned Pages
- `CalendarPage.tsx` - Main calendar interface
- `PrioritiesPage.tsx` - Priority setup & management
- `WhatIfPage.tsx` - Scenario planning interface
- `AgentPage.tsx` - AI agent configuration
- `ExportPage.tsx` - Calendar export tools
- `SettingsPage.tsx` - App preferences

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd calendarai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

## 📝 Development Scripts

```bash
npm start       # Start development server
npm build       # Create production build
npm test        # Run test suite
npm eject       # Eject from Create React App (use carefully)
```

## 🎨 Development Workflow

### Adding New Features
1. **Create Page Component** - Add new page in `src/pages/`
2. **Add Business Logic** - Implement logic in `src/services/`
3. **Style Components** - Create styled components in `src/styles/`
4. **Update Routing** - Add route in `App.tsx`

### State Management
Using Zustand for clean, simple state management:
- Separate stores for calendar, priorities, and agent states
- Minimal boilerplate, maximum productivity

### Styling Approach
Styled Components for:
- Component-scoped styling
- Dynamic theming capabilities
- TypeScript integration
- No CSS naming conflicts

## 🔮 Roadmap

### Phase 1: Foundation ✅
- [x] Project setup and basic structure
- [x] Landing page with feature preview
- [x] Development environment configuration

### Phase 2: Core Calendar (Next)
- [ ] Calendar grid component
- [ ] Event creation and editing
- [ ] Basic scheduling interface
- [ ] Time slot management

### Phase 3: Priority System
- [ ] Priority ranking interface
- [ ] Time allocation algorithms
- [ ] Manual vs. AI time distribution
- [ ] Priority-based scheduling

### Phase 4: AI Integration
- [ ] What-If scenario engine
- [ ] Agent mode implementation
- [ ] Calendar optimization algorithms
- [ ] Smart recommendations

### Phase 5: Export & Integration
- [ ] ICS file generation
- [ ] Google Calendar compatibility
- [ ] Batch export options
- [ ] Sync capabilities

## 🤝 Contributing

This project uses a flat, powerful architecture designed for:
- **Fast development** - Minimal navigation overhead
- **Easy maintenance** - Clear separation of concerns
- **Scalable growth** - Add features without refactoring

### Development Guidelines
- Keep business logic in `services/`
- Create reusable styled components in `styles/`
- Follow the pages-first approach for new features
- Maintain TypeScript strict mode compliance

## 📄 License

MIT License - See LICENSE file for details

---

**Built with ❤️ for better life organization through AI-powered scheduling**
