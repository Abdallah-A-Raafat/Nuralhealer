/**
 * App Color Palette
 * Consistent with web app theming - NeuralHealer purple palette
 */

export const colors = {
  // Primary colors - NeuralHealer purple
  primary: {
    50: '#F5EBF8',
    100: '#E8D4F0',
    200: '#D4A9E1',
    300: '#BB8FCE',
    400: '#A569BD',
    500: '#9B59B6',  // Main brand color
    600: '#8E44AD',  // Rich violet
    700: '#7D3C98',
    800: '#6C3483',
    900: '#5B2C6F',
  },
  
  // Secondary/Accent colors (soft lilac)
  secondary: {
    50: '#FCF9FE',
    100: '#F5EAFA',
    200: '#E8D4F0',
    300: '#D4B5E9',
    400: '#BB8FCE',
    500: '#A569BD',
    600: '#8E44AD',
    700: '#7D3C98',
    800: '#6C3483',
    900: '#5B2C6F',
  },
  
  // Neutral colors
  neutral: {
    50: '#F8F9FA',   // Clean white-gray (background light)
    100: '#ECE8F5',  // Soft white-lavender (lightText)
    200: '#E5E5E5',
    300: '#D4D4D4',
    400: '#5D4E6D',  // Muted purple-gray (textSecondary)
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    850: '#1F1A2E',  // Deep purple-black variant
    900: '#1A1625',  // Deep purple-black (backgroundDark)
  },
  
  // Text colors
  text: {
    primary: '#2C1A3F',    // Dark purple
    secondary: '#5D4E6D',  // Muted purple-gray
    light: '#ECE8F5',      // Soft white-lavender
  },
  
  // Semantic colors
  success: {
    light: '#86efac',
    main: '#27AE60',  // Fresh green (matches web)
    dark: '#16a34a',
  },
  warning: {
    light: '#fde047',
    main: '#F39C12',  // Warm orange (matches web)
    dark: '#ca8a04',
  },
  error: {
    light: '#fca5a5',
    main: '#E74C3C',  // Vibrant red (matches web)
    dark: '#dc2626',
  },
  info: {
    light: '#BB8FCE',
    main: '#9B59B6',
    dark: '#8E44AD',
  },
  
  // Common
  white: '#ffffff',
  black: '#000000',
  transparent: 'transparent',
};

export type ColorKey = keyof typeof colors;
