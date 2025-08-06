// Polyfills for Solana Mobile Wallet Adapter (Expo SDK 53+)
import { getRandomValues as expoCryptoGetRandomValues } from "expo-crypto";
import { Buffer } from "buffer";
global.Buffer = Buffer;

// getRandomValues polyfill for Expo SDK 53+
class Crypto {
  getRandomValues = expoCryptoGetRandomValues;
}

const webCrypto = typeof crypto !== "undefined" ? crypto : new Crypto();

(() => {
  if (typeof crypto === "undefined") {
    Object.defineProperty(window, "crypto", {
      configurable: true,
      enumerable: true,
      get: () => webCrypto,
    });
  }
})();

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, LogBox } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { NavigationContainer } from '@react-navigation/native';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Import navigation
import AppNavigator from './src/navigation/AppNavigator';

// Import providers
import { MobileWalletAdapterProvider } from './src/contexts/MobileWalletAdapterProvider';
import { WalletProvider } from './src/contexts/WalletProvider';
import { ConnectionProvider } from './src/contexts/ConnectionProvider';

// Import theme
import theme from './src/theme';

// Import hooks
import { useOTAUpdates } from './src/hooks/useOTAUpdates';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Ignore specific warnings
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
  'AsyncStorage has been extracted from react-native',
  'TurboModuleRegistry.getEnforcing',
]);

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const { checkForUpdates } = useOTAUpdates();

  useEffect(() => {
    async function prepare() {
      try {
        // Pre-load fonts, make any API calls you need to do here
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate loading time
        
        // Check for OTA updates (disabled in development)
        if (!__DEV__) {
          await checkForUpdates();
        }
      } catch (e) {
        console.warn(e);
      } finally {
        // Tell the application to render
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  useEffect(() => {
    if (appIsReady) {
      // This tells the splash screen to hide immediately! If we call this after
      // `setAppIsReady`, then we may see a blank screen while the app is
      // loading its initial state and rendering its first pixels. So instead,
      // we hide the splash screen once we know the root view has already
      // performed layout.
      SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PaperProvider theme={theme}>
          <ConnectionProvider endpoint="https://api.mainnet-beta.solana.com">
            <MobileWalletAdapterProvider>
              <WalletProvider>
                <NavigationContainer>
                  <AppNavigator />
                </NavigationContainer>
              </WalletProvider>
            </MobileWalletAdapterProvider>
          </ConnectionProvider>
        </PaperProvider>
      </SafeAreaProvider>
      <StatusBar style="light" />
    </GestureHandlerRootView>
  );
}