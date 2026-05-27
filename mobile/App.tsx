/**
 * NeuralHealer Mobile App
 * Mental Health Support Application
 */

import React, { useEffect } from 'react';
import { StatusBar, LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { RootNavigator } from './src/navigation';
import { useThemeStore } from './src/store/themeStore';
import { useAuthStore } from './src/store/authStore';
import stompService from './src/services/stompService';
import './src/i18n';

// Ignore specific warnings in development
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);

function App() {
  const { theme } = useThemeStore();
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  // Initialize STOMP WebSocket connection on app launch
  useEffect(() => {
    if (isLoggedIn) {
      console.log('🔗 User logged in, connecting to AI WebSocket');
      stompService.connect();
    }

    return () => {
      // Cleanup: disconnect on app close
      console.log('🔌 App closing, disconnecting from AI WebSocket');
      stompService.disconnect();
    };
  }, [isLoggedIn]);

  // Listen for login/logout changes
  useEffect(() => {
    const unsubscribe = useAuthStore.subscribe(
      (state) => state.isLoggedIn,
      (isLoggedIn) => {
        if (isLoggedIn) {
          console.log('✅ User logged in, connecting STOMP');
          stompService.connect();
        } else {
          console.log('🔌 User logged out, disconnecting STOMP');
          stompService.disconnect();
        }
      }
    );

    return () => unsubscribe();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar
          barStyle={theme.dark ? 'light-content' : 'dark-content'}
          backgroundColor={theme.colors.background}
        />
        <RootNavigator />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default App;
