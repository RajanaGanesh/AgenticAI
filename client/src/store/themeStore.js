import { create } from 'zustand';

export const useThemeStore = create((set, get) => ({
  theme: 'dark', // 'dark' | 'light'

  initTheme: () => {
    if (typeof window === 'undefined') return;
    try {
      const savedTheme = localStorage.getItem('agentflow_theme');
      if (savedTheme === 'light' || savedTheme === 'dark') {
        set({ theme: savedTheme });
        if (savedTheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        return;
      }
      
      // Default to dark
      document.documentElement.classList.add('dark');
      set({ theme: 'dark' });
    } catch (e) {
      document.documentElement.classList.add('dark');
    }
  },

  toggleTheme: () => {
    const nextTheme = get().theme === 'dark' ? 'light' : 'dark';
    if (typeof window !== 'undefined') {
      localStorage.setItem('agentflow_theme', nextTheme);
      if (nextTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
    set({ theme: nextTheme });
  },

  setTheme: (newTheme) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('agentflow_theme', newTheme);
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
    set({ theme: newTheme });
  },
}));
