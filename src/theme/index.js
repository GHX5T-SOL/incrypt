import { MD3DarkTheme } from 'react-native-paper';

// Neon theme colors
const neonColors = {
  primary: '#00FF9F', // Neon green
  secondary: '#FF00FF', // Neon purple
  accent: '#00FFFF', // Neon cyan
  error: '#FF3B30',
  warning: '#FF9500',
  success: '#00FF9F',
  background: '#000000',
  surface: '#0A0A0A',
  surfaceVariant: '#1A1A1A',
  text: '#FFFFFF',
  textSecondary: '#CCCCCC',
  disabled: '#757575',
  placeholder: '#9E9E9E',
  backdrop: 'rgba(0, 0, 0, 0.8)',
  onSurface: '#FFFFFF',
  notification: '#FF00FF',
  outline: '#2C2C2C',
  // Additional neon variants
  neonBlue: '#0080FF',
  neonPink: '#FF0080',
  neonYellow: '#FFFF00',
  neonOrange: '#FF8000',
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

// Enhanced styles for neon effects
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
    colors: ['#000000', '#0A0A0A', '#1A1A1A'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  // New enhanced styles
  cardStyle: {
    backgroundColor: neonColors.surface,
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: neonColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonStyle: {
    backgroundColor: 'transparent',
    borderColor: neonColors.primary,
    borderWidth: 2,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    shadowColor: neonColors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  inputStyle: {
    backgroundColor: neonColors.surfaceVariant,
    borderColor: neonColors.outline,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: neonColors.text,
  },
  // Animation presets
  pulseAnimation: {
    shadowOpacity: [0.3, 0.8, 0.3],
    shadowRadius: [8, 12, 8],
  },
  glowAnimation: {
    shadowOpacity: [0.5, 1, 0.5],
    shadowRadius: [10, 20, 10],
  },
};

// Gradient configurations
export const gradients = {
  primary: {
    colors: [neonColors.primary, neonColors.accent],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  secondary: {
    colors: [neonColors.secondary, neonColors.neonPink],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  background: {
    colors: ['#000000', '#0A0A0A', '#1A1A1A'],
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
  },
  card: {
    colors: [neonColors.surface, neonColors.surfaceVariant],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
};

// Typography styles
export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: 'bold',
    color: neonColors.text,
  },
  h2: {
    fontSize: 24,
    fontWeight: 'bold',
    color: neonColors.text,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600',
    color: neonColors.text,
  },
  body: {
    fontSize: 16,
    color: neonColors.text,
  },
  caption: {
    fontSize: 14,
    color: neonColors.textSecondary,
  },
  neonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: neonColors.primary,
    textShadowColor: neonColors.primary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
};