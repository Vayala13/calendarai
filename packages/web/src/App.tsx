import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import HomePage from './pages/HomePage';
import TestAPIPage from './pages/TestAPIPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import CalendarPage from './pages/CalendarPage';
import PrioritiesPage from './pages/PrioritiesPage';
import WhatIfPage from './pages/WhatIfPage';
import ScenarioEditorPage from './pages/ScenarioEditorPage';
import AIAgentPage from './pages/AIAgentPage';
import AskAgentPage from './pages/AskAgentPage';
import './app.css';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/priorities" element={<PrioritiesPage />} />
          <Route path="/whatif" element={<WhatIfPage />} />
          <Route path="/whatif/:id" element={<ScenarioEditorPage />} />
          <Route path="/ai-agent" element={<AIAgentPage />} />
          <Route path="/ask-agent" element={<AskAgentPage />} />
          <Route path="/test" element={<TestAPIPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
