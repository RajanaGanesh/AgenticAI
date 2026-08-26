import { create } from 'zustand';
import api from '../services/api';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  initAuth: async () => {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem('agentflow_auth');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.state?.token) {
          set({ token: parsed.state.token, user: parsed.state.user, isAuthenticated: true, isLoading: false });
          // verify profile
          try {
            const res = await api.get('/auth/me');
            if (res.data) {
              set({ user: res.data, isAuthenticated: true, isLoading: false });
              localStorage.setItem('agentflow_auth', JSON.stringify({ state: { token: parsed.state.token, user: res.data } }));
            }
          } catch (meErr) {
            // token may be expired
          }
          return;
        }
      }
    } catch (e) {
      console.warn('Auth init failed:', e);
    }
    set({ user: null, token: null, isAuthenticated: false, isLoading: false });
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/auth/login', { email, password });
      const { user, token } = res.data;
      
      localStorage.setItem('agentflow_auth', JSON.stringify({ state: { token, user } }));
      set({ user, token, isAuthenticated: true, isLoading: false, error: null });
      return user;
    } catch (err) {
      set({ isLoading: false, error: err.message });
      throw err;
    }
  },

  register: async (name, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/auth/register', { name, email, password });
      const { user, token } = res.data;
      
      localStorage.setItem('agentflow_auth', JSON.stringify({ state: { token, user } }));
      set({ user, token, isAuthenticated: true, isLoading: false, error: null });
      return user;
    } catch (err) {
      set({ isLoading: false, error: err.message });
      throw err;
    }
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('agentflow_auth');
    }
    set({ user: null, token: null, isAuthenticated: false, error: null });
  },

  clearError: () => set({ error: null }),
}));
