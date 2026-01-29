import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Authentication Store
 * Manages user authentication state
 * Note: JWT token is stored in HTTP-only cookie by backend, not in this store
 */
export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isLoggedIn: false,
      role: null, // 'DOCTOR' or 'PATIENT' (uppercase from backend)
      
      /**
       * Login user - Store user data (token handled by cookies)
       * @param {Object} userData - User data from backend { userId, email, firstName, lastName, role }
       */
      login: (userData) => {
        console.log('🔑 [authStore] Logging in user:', userData);
        
        if (!userData) {
          console.error('❌ [authStore] Cannot login: userData is null/undefined');
          return;
        }
        
        const role = userData.role || userData.accountType?.toUpperCase() || 'PATIENT';
        
        set({ 
          user: userData, 
          isLoggedIn: true,
          role: role // Backend returns 'DOCTOR' or 'PATIENT'
        });
        
        console.log('✅ [authStore] User logged in with role:', role);
      },
      
      /**
       * Logout user - Clear all auth state
       */
      logout: () => set({ 
        user: null, 
        isLoggedIn: false,
        role: null
      }),
      
      /**
       * Update user data
       */
      updateUser: (userData) => set({ 
        user: userData,
        role: userData.role
      }),
      
      /**
       * Check if user is authenticated
       */
      isAuthenticated: () => get().isLoggedIn,
      
      /**
       * Check if user is a doctor
       */
      isDoctor: () => get().role === 'DOCTOR',
      
      /**
       * Check if user is a patient
       */
      isPatient: () => get().role === 'PATIENT',
      
      /**
       * Get account type in lowercase for compatibility
       * @returns {'doctor' | 'patient' | null}
       */
      getAccountType: () => {
        const role = get().role;
        return role ? role.toLowerCase() : null;
      }
    }),
    {
      name: 'neuralhealer-auth',
      partialize: (state) => ({ 
        user: state.user, 
        isLoggedIn: state.isLoggedIn,
        role: state.role
        // Note: No token stored - backend manages via HTTP-only cookies
      }),
    }
  )
);
