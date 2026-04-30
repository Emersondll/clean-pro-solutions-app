export const theme = {
  colors: {
    primary: '#059669', // Emerald 600
    primaryLight: '#34d399', // Emerald 400
    primaryDark: '#047857', // Emerald 700
    secondary: '#3B82F6', // Blue 500
    background: '#F9FAFB', // Gray 50
    surface: '#FFFFFF',
    text: '#111827', // Gray 900
    textSecondary: '#4B5563', // Gray 600
    textMuted: '#9CA3AF', // Gray 400
    error: '#EF4444', // Red 500
    success: '#10B981', // Emerald 500
    warning: '#F59E0B', // Amber 500
    border: '#E5E7EB', // Gray 200
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 24,
    full: 9999,
  },
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 4,
    },
  },
};

export type Theme = typeof theme;
