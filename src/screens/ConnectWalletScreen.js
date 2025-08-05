import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  Animated, 
  Easing,
  Dimensions
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Button, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useWallet } from '../contexts/WalletProvider';
import { neonStyles } from '../theme';

const { width, height } = Dimensions.get('window');

const ConnectWalletScreen = () => {
  const navigation = useNavigation();
  const theme = useTheme();
  const { connect, connected, connecting } = useWallet();
  const [animation] = useState(new Animated.Value(0));

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
  }, []);

  useEffect(() => {
    // If wallet is connected, navigate to main app
    if (connected) {
      navigation.replace('Main');
    }
  }, [connected, navigation]);

  // Animation for the glow effect
  const glowOpacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 1],
  });

  const handleConnectWallet = async () => {
    try {
      await connect();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
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
          <Image
            source={require('../../assets/logo.png')} // Replace with your app logo
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>
        <Text style={styles.appName}>INCRYPT</Text>
        <Text style={styles.tagline}>DeFi Simplified on Solana</Text>
      </View>
      
      <View style={styles.featuresContainer}>
        <View style={styles.featureItem}>
          <MaterialCommunityIcons name="chart-bubble" size={24} color={theme.colors.primary} />
          <Text style={styles.featureText}>Access Meteora Liquidity Pools</Text>
        </View>
        <View style={styles.featureItem}>
          <MaterialCommunityIcons name="bank" size={24} color={theme.colors.secondary} />
          <Text style={styles.featureText}>Lend & Borrow with DeFi Protocols</Text>
        </View>
        <View style={styles.featureItem}>
          <MaterialCommunityIcons name="chart-line" size={24} color={theme.colors.accent} />
          <Text style={styles.featureText}>Optimize Yield Strategies</Text>
        </View>
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.connectButton,
            neonStyles.neonContainer,
            { backgroundColor: theme.colors.primary },
          ]}
          onPress={handleConnectWallet}
          disabled={connecting}
        >
          {connecting ? (
            <Text style={styles.connectButtonText}>Connecting...</Text>
          ) : (
            <>
              <MaterialCommunityIcons name="wallet" size={24} color="#000000" style={styles.buttonIcon} />
              <Text style={styles.connectButtonText}>Connect Wallet</Text>
            </>
          )}
        </TouchableOpacity>
        
        <Text style={styles.disclaimer}>
          By connecting your wallet, you agree to our Terms of Service and Privacy Policy
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  logoContainer: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  glowContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  logo: {
    width: 120,
    height: 120,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 20,
    letterSpacing: 2,
  },
  tagline: {
    fontSize: 16,
    color: '#AAAAAA',
    marginTop: 10,
  },
  featuresContainer: {
    flex: 1,
    width: '100%',
    marginVertical: 40,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
  },
  featureText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginLeft: 15,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 40,
  },
  connectButton: {
    flexDirection: 'row',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonIcon: {
    marginRight: 10,
  },
  connectButtonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  disclaimer: {
    color: '#777777',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 10,
  },
});

export default ConnectWalletScreen;