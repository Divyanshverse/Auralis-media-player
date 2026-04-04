import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { usePlayerStore } from './usePlayerStore';

interface User {
  phoneNumber: string;
  name?: string;
}

interface AuthState {
  user: User | null;
  login: (phoneNumber: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      login: (phoneNumber) => {
        set({ 
          user: { 
            phoneNumber, 
            name: `User ${phoneNumber.slice(-4)}` 
          } 
        });
        usePlayerStore.getState().setActiveProfile(phoneNumber);
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
