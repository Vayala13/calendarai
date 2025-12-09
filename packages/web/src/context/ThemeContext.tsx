import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check localStorage first, then system preference
    const saved = localStorage.getItem('calendarai-theme') as Theme;
    if (saved) return saved;
    
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  useEffect(() => {
    localStorage.setItem('calendarai-theme', theme);
    // Update document class for global styles if needed
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark: theme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Theme colors
export const themes = {
  light: {
    // Backgrounds
    bgPrimary: '#f0f2f5',
    bgSecondary: '#ffffff',
    bgCard: '#ffffff',
    bgHover: '#f5f5f5',
    bgToday: '#e3f2fd',
    bgTodayHover: '#bbdefb',
    bgDisabled: '#f5f5f5',
    
    // Text
    textPrimary: '#333333',
    textSecondary: '#666666',
    textMuted: '#999999',
    
    // Borders
    borderColor: '#e0e0e0',
    borderLight: '#f0f0f0',
    
    // Accents
    primary: '#667eea',
    primaryHover: '#5a6fd6',
    success: '#4CAF50',
    danger: '#f44336',
    
    // Calendar specific
    calendarBg: '#ffffff',
    dayBg: '#ffffff',
    dayBgOther: '#f9f9f9',
    
    // Shadows
    shadow: '0 4px 20px rgba(0,0,0,0.1)',
    shadowHover: '0 8px 30px rgba(0,0,0,0.15)',
  },
  dark: {
    // Backgrounds
    bgPrimary: '#1a1a2e',
    bgSecondary: '#16213e',
    bgCard: '#1f2940',
    bgHover: '#2a3a5a',
    bgToday: '#1e3a5f',
    bgTodayHover: '#254a75',
    bgDisabled: '#252a3d',
    
    // Text
    textPrimary: '#e4e4e7',
    textSecondary: '#a1a1aa',
    textMuted: '#71717a',
    
    // Borders
    borderColor: '#3f3f46',
    borderLight: '#2a2a3a',
    
    // Accents
    primary: '#818cf8',
    primaryHover: '#6366f1',
    success: '#22c55e',
    danger: '#ef4444',
    
    // Calendar specific
    calendarBg: '#1f2940',
    dayBg: '#252f45',
    dayBgOther: '#1a2235',
    
    // Shadows
    shadow: '0 4px 20px rgba(0,0,0,0.4)',
    shadowHover: '0 8px 30px rgba(0,0,0,0.5)',
  }
};

export type ThemeColors = typeof themes.light;

