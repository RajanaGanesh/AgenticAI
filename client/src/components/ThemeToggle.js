import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useThemeStore } from '../store/themeStore';

export default function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme } = useThemeStore();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className={`p-2 rounded-lg transition-all duration-200 flex items-center justify-center ${
        isDark
          ? 'bg-slate-850 hover:bg-slate-800 text-amber-400 border border-slate-750'
          : 'bg-slate-100 hover:bg-slate-200 text-indigo-600 border border-slate-300'
      } ${className}`}
      title={`Switch to ${isDark ? 'Light' : 'Dark'} theme`}
      aria-label="Toggle theme"
    >
      {isDark ? (
        <Sun className="w-4 h-4 transition-transform rotate-0 hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 transition-transform -rotate-12 hover:rotate-0" />
      )}
    </button>
  );
}
