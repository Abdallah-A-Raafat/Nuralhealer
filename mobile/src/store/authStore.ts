/**
 * Authentication Store
 * Manages user authentication state with persistence
 */

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { zustandStorage } from '../utils/storage';

export interface User {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'DOCTOR' | 'PATIENT';
  profileImage?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  
  // Actions
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  setLoading: (loading: boolean) => void;
  
  // Getters
  isDoctor: () => boolean;
  isPatient: () => boolean;
  getFullName: () => string;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoggedIn: false,
      isLoading: false,
      
      login: (user: User, token: string) => {
        console.log('🔑 [authStore] Logging in user:', user.email);
        set({ 
          user, 
          token,
          isLoggedIn: true,
          isLoading: false,
        });
      },
      
      logout: () => {
        console.log('🚪 [authStore] Logging out user');
        set({ 
          user: null, 
          token: null,
          isLoggedIn: false,
          isLoading: false,
        });
      },
      
      updateUser: (userData: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...userData } });
        }
      },
      
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
      
      isDoctor: () => get().user?.role === 'DOCTOR',
      
      isPatient: () => get().user?.role === 'PATIENT',
      
      getFullName: () => {
        const user = get().user;
        if (!user) return '';
        return `${user.firstName} ${user.lastName}`;
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => zustandStorage),
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token,
        isLoggedIn: state.isLoggedIn,
      }),
    }
  )
);
