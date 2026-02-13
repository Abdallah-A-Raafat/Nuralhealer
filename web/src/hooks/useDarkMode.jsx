import { createContext, useContext, useEffect, useState } from 'react';

const DarkModeContext = createContext();

export const DarkModeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Initialize from localStorage
    const savedMode = localStorage.getItem('neuralhealer-darkmode');
    if (savedMode !== null) {
      return savedMode === 'true';
    }
    // Default to system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Apply dark mode on mount and when it changes
  useEffect(() => {
    applyDarkMode(isDarkMode);
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => {
      const newMode = !prev;
      applyDarkMode(newMode);
      localStorage.setItem('neuralhealer-darkmode', newMode.toString());
      return newMode;
    });
  };

  const applyDarkMode = (isDark) => {
    const root = document.documentElement;
    root.classList.toggle('dark', isDark);
    document.body.classList.toggle('dark', isDark);
    root.setAttribute('data-theme', isDark ? 'dark' : 'light');
  };

  return (
    <DarkModeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      {children}
    </DarkModeContext.Provider>
  );
};

export const useDarkMode = () => {
  const context = useContext(DarkModeContext);
  if (!context) {
    return { isDarkMode: false, toggleDarkMode: () => {} };
  }
  return context;
};