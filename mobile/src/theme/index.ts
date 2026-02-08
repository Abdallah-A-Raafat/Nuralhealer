/**
 * Theme Configuration
 * Supports Light and Dark modes with RTL
 */

import { colors } from './colors';
import { spacing } from './spacing';
import { typography } from './typography';

export interface Theme {
  dark: boolean;
  colors: {
    primary: string;
    background: string;
    card: string;
    text: string;
    textSecondary: string;
    border: string;
    notification: string;
    error: string;
    success: string;
    warning: string;
    inputBackground: string;
    placeholder: string;
    surface: string;
    inputBorder: string;
    shadow: string;
  };
  spacing: typeof spacing;
  typography: typeof typography;
}

export const lightTheme: Theme = {
  dark: false,
  colors: {
    primary: colors.primary[600],
    background: colors.white,
    card: colors.neutral[50],
    text: colors.neutral[900],
    textSecondary: colors.neutral[600],
    border: colors.neutral[200],
    notification: colors.error.main,
    error: colors.error.main,
    success: colors.success.main,
    warning: colors.warning.main,
    inputBackground: colors.neutral[100],
    placeholder: colors.neutral[400],
    surface: colors.white,
    inputBorder: colors.neutral[300],
    shadow: 'rgba(0, 0, 0, 0.1)',
  },
  spacing,
  typography,
};

export const darkTheme: Theme = {
  dark: true,
  colors: {
    primary: colors.primary[400],
    background: colors.neutral[900],
    card: colors.neutral[800],
    text: colors.neutral[50],
    textSecondary: colors.neutral[400],
    border: colors.neutral[700],
    notification: colors.error.light,
    error: colors.error.light,
    success: colors.success.light,
    warning: colors.warning.light,
    inputBackground: colors.neutral[800],
    placeholder: colors.neutral[500],
    surface: colors.neutral[850] || colors.neutral[800],
    inputBorder: colors.neutral[600],
    shadow: 'rgba(0, 0, 0, 0.3)',
  },
  spacing,
  typography,
};

export { colors, spacing, typography };
