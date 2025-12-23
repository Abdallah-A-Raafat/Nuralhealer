import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoggedIn: false,
      accountType: null, // 'patient' or 'doctor'
      
      login: (userData, token, accountType = null) => set({ 
        user: userData, 
        token, 
        isLoggedIn: true,
        accountType: accountType || userData.accountType || null
      }),
      
      logout: () => set({ 
        user: null, 
        token: null, 
        isLoggedIn: false,
        accountType: null
      }),
      
      updateUser: (userData) => set({ user: userData }),
      
      setAccountType: (accountType) => set({ accountType }),
      
      isAuthenticated: () => get().isLoggedIn && get().token,
      
      isDoctor: () => get().accountType === 'doctor',
      
      isPatient: () => get().accountType === 'patient',
    }),
    {
      name: 'soothe-auth',
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token, 
        isLoggedIn: state.isLoggedIn,
        accountType: state.accountType
      }),
    }
  )
);
