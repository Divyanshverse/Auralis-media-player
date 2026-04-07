import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { usePlayerStore } from './usePlayerStore';

interface User {
  username: string;
  name?: string;
}

interface AuthState {
  user: User | null;
  login: (username: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      login: (username) => {
        set({ 
          user: { 
            username, 
            name: username 
          } 
        });
        usePlayerStore.getState().setActiveProfile(username);
      },
      logout: () => {
        set({ user: null });
        usePlayerStore.getState().setActiveProfile('guest');
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
