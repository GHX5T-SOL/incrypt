import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  Animated, 
  Easing,
  Dimensions,
  ScrollView,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Button, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useWallet } from '../hooks/useWallet';
import { useMobileWalletAdapter } from '../contexts/MobileWalletAdapterProvider';
import { neonStyles, theme } from '../theme';
import NeonButton from '../components/NeonButton';

const { width, height } = Dimensions.get('window');

const ConnectWalletScreen = () => {
  const navigation = useNavigation();
  const themeColors = useTheme();
  const { connect, connected, connecting, error } = useWallet();
  const { isNativeModuleAvailable } = useMobileWalletAdapter();
  const [animation] = useState(new Animated.Value(0));
  const [fadeAnimation] = useState(new Animated.Value(0));

  useEffect(() => {
    // Start the animation loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(animation, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(animation, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Fade in animation
    Animated.timing(fadeAnimation, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    // If wallet is connected, navigate to main app
    if (connected) {
      navigation.replace('Dashboard');
    }
  }, [connected, navigation]);

  // Animation for the glow effect
  const glowOpacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 1],
  });

  const handleConnectWallet = async () => {
    // Check if we're in Expo Go (no native module)
    if (!isNativeModuleAvailable) {
      Alert.alert(
        'Development Build Required',
        'Solana Mobile Wallet Adapter requires a custom development build. Please build the app with EAS Build to enable wallet connectivity.',
        [
          { 
            text: 'Continue to Demo', 
            onPress: () => navigation.replace('Dashboard'),
            style: 'default'
          },
          { 
            text: 'Cancel', 
            style: 'cancel'
          }
        ]
      );
      return;
    }

    try {
      await connect();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  const features = [
    {
      icon: 'chart-bubble',
      title: 'Meteora Pools',
      description: 'Access DLMM and DAMM V2 liquidity pools',
      color: theme.colors.primary,
    },
    {
      icon: 'bank',
      title: 'DeFi Lending',
      description: 'Lend & borrow with Kamino and MarginFi',
      color: theme.colors.secondary,
    },
    {
      icon: 'trending-up',
      title: 'Yield Strategies',
      description: 'Advanced yield optimization and leverage',
      color: theme.colors.accent,
    },
    {
      icon: 'shield-check',
      title: 'Safety First',
      description: 'Rugcheck integration for token safety',
      color: theme.colors.neonBlue,
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Animated.View style={[styles.content, { opacity: fadeAnimation }]}>
          {/* Logo Section */}
          <View style={styles.logoContainer}>
            <Animated.View
              style={[
                styles.glowContainer,
                {
                  opacity: glowOpacity,
                  shadowColor: theme.colors.primary,
                },
              ]}
            >
              <View style={styles.logoPlaceholder}>
                <MaterialCommunityIcons 
                  name="wallet" 
                  size={80} 
                  color={theme.colors.primary} 
                />
              </View>
            </Animated.View>
            <Text style={styles.appName}>INCRYPT</Text>
            <Text style={styles.tagline}>Your Mobile DeFi Hub</Text>
            <Text style={styles.subtitle}>Meteora Liquidity Farming & DeFi Lending on Solana</Text>
          </View>

          {/* Features Section */}
          <View style={styles.featuresContainer}>
            <Text style={styles.featuresTitle}>What you can do:</Text>
            {features.map((feature, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.featureItem,
                  { 
                    opacity: fadeAnimation,
                    transform: [{
                      translateY: fadeAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [50, 0],
                      }),
                    }],
                  },
                ]}
              >
                <View style={[styles.featureIcon, { backgroundColor: feature.color + '20' }]}>
                  <MaterialCommunityIcons 
                    name={feature.icon} 
                    size={24} 
                    color={feature.color} 
                  />
                </View>
                <View style={styles.featureTextContainer}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </View>
              </Animated.View>
            ))}
          </View>

          {/* Connect Button */}
          <View style={styles.buttonContainer}>
            <NeonButton
              title={connecting ? "Connecting..." : "Connect Wallet"}
              onPress={handleConnectWallet}
              disabled={connecting}
              variant="primary"
              style={styles.connectButton}
            />
            
            {error && (
              <Text style={styles.errorText}>
                {error}
              </Text>
            )}

            <Text style={styles.disclaimer}>
              By connecting your wallet, you agree to our Terms of Service and Privacy Policy.
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  glowContainer: {
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
    marginBottom: 20,
  },
  logoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 8,
    textShadowColor: theme.colors.primary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  tagline: {
    fontSize: 18,
    color: theme.colors.text,
    marginBottom: 4,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  featuresContainer: {
    marginBottom: 40,
  },
  featuresTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.outline,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
  buttonContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  connectButton: {
    width: '100%',
    marginBottom: 16,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  disclaimer: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default ConnectWalletScreen;