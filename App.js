import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { Provider as PaperProvider, MD3DarkTheme } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';

// OTA Updates
import { useOTAUpdates } from './src/hooks/useOTAUpdates';

// Mobile Wallet Adapter
import { AppIdentity, transact } from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';
import { MobileWalletAdapterProvider } from './src/contexts/MobileWalletAdapterProvider';

// Navigation
import AppNavigator from './src/navigation/AppNavigator';

// Theme
import { theme } from './src/theme';

// Connection Provider
import { ConnectionProvider } from './src/contexts/ConnectionProvider';
import { WalletProvider } from './src/contexts/WalletProvider';
import OnboardingScreen from './src/screens/OnboardingScreen';

const APP_IDENTITY = {
  name: 'Incrypt',
  uri: 'https://incrypt.network',
  icon: 'https://incrypt.network/icon.png', // Replace with your app icon URL
};

export default function App() {
  const [isFirstLaunch, setIsFirstLaunch] = useState(null);
  
  // Initialize OTA updates
  const { checkForUpdates } = useOTAUpdates();

  useEffect(() => {
    // Check if it's the first launch
    AsyncStorage.getItem('alreadyLaunched').then(value => {
      if (value === null) {
        AsyncStorage.setItem('alreadyLaunched', 'true');
        setIsFirstLaunch(true);
      } else {
        setIsFirstLaunch(false);
      }
    });
    
    // Check for OTA updates on app start
    checkForUpdates();
  }, [checkForUpdates]);

  // Custom navigation theme
  const navigationTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: theme.colors.background,
      card: theme.colors.surface,
      text: theme.colors.text,
      border: theme.colors.outline,
      primary: theme.colors.primary,
    },
  };

  // If we haven't determined if it's first launch yet, show nothing
  if (isFirstLaunch === null) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <MobileWalletAdapterProvider appIdentity={APP_IDENTITY}>
          <ConnectionProvider endpoint="https://api.mainnet-beta.solana.com">
            <WalletProvider>
              <NavigationContainer theme={navigationTheme}>
                {isFirstLaunch ? (
                  <OnboardingScreen onDone={() => setIsFirstLaunch(false)} />
                ) : (
                  <AppNavigator />
                )}
              </NavigationContainer>
            </WalletProvider>
          </ConnectionProvider>
        </MobileWalletAdapterProvider>
        <StatusBar style="light" />
        <Toast />
      </PaperProvider>
    </SafeAreaProvider>
  );
}