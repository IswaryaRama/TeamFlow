import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

export const THEMES = {
  emerald: {
    id: 'emerald',
    name: 'Emerald Mint',
    color: '#059669',
    gradient: 'from-emerald-600 to-teal-500',
    dot: 'bg-emerald-500',
    type: 'light',
  },
  violet: {
    id: 'violet',
    name: 'Royal Purple',
    color: '#7c3aed',
    gradient: 'from-purple-600 to-indigo-600',
    dot: 'bg-purple-500',
    type: 'light',
  },
  sunset: {
    id: 'sunset',
    name: 'Sunset Coral',
    color: '#e11d48',
    gradient: 'from-rose-500 to-amber-500',
    dot: 'bg-rose-500',
    type: 'light',
  },
  sky: {
    id: 'sky',
    name: 'Ocean Sky',
    color: '#0284c7',
    gradient: 'from-blue-600 to-cyan-500',
    dot: 'bg-sky-500',
    type: 'light',
  },
  amber: {
    id: 'amber',
    name: 'Warm Amber',
    color: '#d97706',
    gradient: 'from-amber-500 to-orange-500',
    dot: 'bg-amber-500',
    type: 'light',
  },
};

export function ThemeProvider({ children }) {
  const [currentTheme, setCurrentTheme] = useState(() => {
    return localStorage.getItem('teamflow_theme') || 'emerald';
  });

  useEffect(() => {
    localStorage.setItem('teamflow_theme', currentTheme);
    const root = document.documentElement;
    root.setAttribute('data-theme', currentTheme);
    root.classList.remove('dark');
    root.classList.add('light');
  }, [currentTheme]);

  const changeTheme = (themeId) => {
    if (THEMES[themeId]) {
      setCurrentTheme(themeId);
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        currentTheme,
        changeTheme,
        themes: THEMES,
        activeTheme: THEMES[currentTheme] || THEMES.emerald,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
