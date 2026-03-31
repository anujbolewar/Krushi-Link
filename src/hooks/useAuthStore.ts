import { create } from 'zustand';

interface AuthState {
  isAuthenticated: boolean;
  isRegistered: boolean;
  language: 'marathi' | 'hindi' | 'english' | null;
  user: {
    id: string;
    name: string;
    role: string;
  } | null;
  login: (token: string, userData: any) => void;
  logout: () => void;
  setRegistered: (registered: boolean) => void;
  setLanguage: (lang: 'marathi' | 'hindi' | 'english') => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  isRegistered: false,
  language: null,
  user: null,
  login: (token, userData) => {
    set({ isAuthenticated: true, user: userData });
  },
  logout: () => {
    set({ isAuthenticated: false, user: null, isRegistered: false });
  },
  setRegistered: (registered) => set({ isRegistered: registered }),
  setLanguage: (lang) => set({ language: lang }),
}));
