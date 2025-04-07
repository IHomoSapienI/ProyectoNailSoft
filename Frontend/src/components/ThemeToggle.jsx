// src/components/ThemeToggle.js
import React, { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import { getTheme, toggleTheme, setTheme } from '../util/theme-util';

const ThemeToggle = () => {
  const [theme, setThemeState] = useState('light');
  
  useEffect(() => {
    // Inicializar el tema
    const currentTheme = getTheme();
    setThemeState(currentTheme);
    setTheme(currentTheme);
  }, []);
  
  const handleToggle = () => {
    const newTheme = toggleTheme();
    setThemeState(newTheme);
  };
  
  return (
    <button 
      onClick={handleToggle}
      aria-label="Cambiar tema"
      className="flex h-9 w-9 items-center justify-center rounded-full border border-pink-200/20 transition-colors hover:bg-pink-50/50 dark:border-pink-800/20 dark:hover:bg-pink-900/20"
    >
      {theme === "light" ? (
        <Moon className="h-4 w-4 text-gray-600 dark:text-gray-300" />
      ) : (
        <Sun className="h-4 w-4 text-gray-600 dark:text-gray-300" />
      )}
    </button>
  );
};

export default ThemeToggle;