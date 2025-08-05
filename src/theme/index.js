import { MD3DarkTheme } from 'react-native-paper';

// Neon theme colors
const neonColors = {
  primary: '#00FF9F', // Neon green
  secondary: '#FF00FF', // Neon purple
  accent: '#00FFFF', // Neon cyan
  error: '#FF3B30',
  background: '#121212',
  surface: '#1E1E1E',
  text: '#FFFFFF',
  disabled: '#757575',
  placeholder: '#9E9E9E',
  backdrop: 'rgba(0, 0, 0, 0.5)',
  onSurface: '#FFFFFF',
  notification: '#FF00FF',
  outline: '#2C2C2C',
};

export const theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    ...neonColors,
  },
  roundness: 16,
  animation: {
    scale: 1.0,
  },
};

// Styles for neon effects
export const neonStyles = {
  neonContainer: {
    shadowColor: neonColors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },
  neonPurpleContainer: {
    shadowColor: neonColors.secondary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },
  neonCyanContainer: {
    shadowColor: neonColors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },
  neonBorder: {
    borderColor: neonColors.primary,
    borderWidth: 1,
  },
  neonPurpleBorder: {
    borderColor: neonColors.secondary,
    borderWidth: 1,
  },
  neonCyanBorder: {
    borderColor: neonColors.accent,
    borderWidth: 1,
  },
  gradientBackground: {
    // To be used with LinearGradient component
    colors: ['#121212', '#1A1A1A'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
};