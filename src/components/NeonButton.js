import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';
import { theme, neonStyles } from '../theme';

const NeonButton = ({ 
  title, 
  onPress, 
  variant = 'primary', 
  disabled = false, 
  style, 
  textStyle,
  children 
}) => {
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 100,
      useNativeDriver: false,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(animatedValue, {
      toValue: 0,
      duration: 100,
      useNativeDriver: false,
    }).start();
  };

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

  const animatedStyle = {
    shadowOpacity: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0.5, 1],
    }),
    shadowRadius: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [8, 16],
    }),
    transform: [
      {
        scale: animatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 0.95],
        }),
      },
    ],
  };

  return (
    <Animated.View style={[animatedStyle]}>
      <TouchableOpacity
        style={[
          styles.button,
          variantStyles,
          disabled && styles.disabled,
          style,
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        activeOpacity={0.8}
      >
        {children || (
          <Text style={[
            styles.text,
            { color: variantStyles.borderColor },
            disabled && styles.disabledText,
            textStyle,
          ]}>
            {title}
          </Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
    minHeight: 48,
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  disabled: {
    borderColor: theme.colors.disabled,
    shadowColor: theme.colors.disabled,
    shadowOpacity: 0.3,
  },
  disabledText: {
    color: theme.colors.disabled,
  },
});

export default NeonButton; 