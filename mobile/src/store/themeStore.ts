/**
 * Theme Store
 * Manages dark/light mode with persistence
 */

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { Appearance } from 'react-native';
import { zustandStorage } from '../utils/storage';
import { lightTheme, darkTheme, Theme } from '../theme';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
  mode: ThemeMode;
  theme: Theme;
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const getThemeFromMode = (mode: ThemeMode): Theme => {
  if (mode === 'system') {
    const systemTheme = Appearance.getColorScheme();
    return systemTheme === 'dark' ? darkTheme : lightTheme;
  }
  return mode === 'dark' ? darkTheme : lightTheme;
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: 'system',
      theme: getThemeFromMode('system'),
      
      setMode: (mode: ThemeMode) => {
        set({ 
          mode, 
          theme: getThemeFromMode(mode) 
        });
      },
      
      toggleTheme: () => {
        const currentMode = get().mode;
        let newMode: ThemeMode;
        
        if (currentMode === 'system') {
          const systemTheme = Appearance.getColorScheme();
          newMode = systemTheme === 'dark' ? 'light' : 'dark';
        } else {
          newMode = currentMode === 'dark' ? 'light' : 'dark';
        }
        
        set({ 
          mode: newMode, 
          theme: getThemeFromMode(newMode) 
        });
      },
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => zustandStorage),
      partialize: (state) => ({ mode: state.mode }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.theme = getThemeFromMode(state.mode);
        }
      },
    }
  )
);

// Listen for system theme changes
Appearance.addChangeListener(({ colorScheme }) => {
  const { mode, setMode } = useThemeStore.getState();
  if (mode === 'system') {
    // Re-apply system theme
    useThemeStore.setState({ 
      theme: colorScheme === 'dark' ? darkTheme : lightTheme 
    });
  }
});
