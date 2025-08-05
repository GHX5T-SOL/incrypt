import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { theme, neonStyles } from '../theme';

const NeonCard = ({ 
  children, 
  variant = 'primary', 
  style, 
  animated = true,
  onPress 
}) => {
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (animated) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: false,
          }),
          Animated.timing(animatedValue, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: false,
          }),
        ])
      ).start();
    }
  }, [animated]);

  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return {
          borderColor: theme.colors.secondary,
          shadowColor: theme.colors.secondary,
        };
      case 'accent':
        return {
          borderColor: theme.colors.accent,
          shadowColor: theme.colors.accent,
        };
      case 'success':
        return {
          borderColor: theme.colors.success,
          shadowColor: theme.colors.success,
        };
      case 'warning':
        return {
          borderColor: theme.colors.warning,
          shadowColor: theme.colors.warning,
        };
      case 'error':
        return {
          borderColor: theme.colors.error,
          shadowColor: theme.colors.error,
        };
      default:
        return {
          borderColor: theme.colors.primary,
          shadowColor: theme.colors.primary,
        };
    }
  };

  const variantStyles = getVariantStyles();

  const animatedStyle = animated ? {
    shadowOpacity: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 0.8],
    }),
    shadowRadius: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [8, 12],
    }),
  } : {};

  const CardComponent = onPress ? Animated.TouchableOpacity : Animated.View;

  return (
    <CardComponent
      style={[
        styles.card,
        variantStyles,
        animatedStyle,
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {children}
    </CardComponent>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
    minHeight: 80,
  },
});

export default NeonCard; 