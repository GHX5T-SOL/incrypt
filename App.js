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
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Import screens
import OnboardingScreen from './src/screens/OnboardingScreen';
import ConnectWalletScreen from './src/screens/ConnectWalletScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import PoolsScreen from './src/screens/PoolsScreen';
import CreatePoolScreen from './src/screens/CreatePoolScreen';
import PoolDetailScreen from './src/screens/PoolDetailScreen';
import LendingScreen from './src/screens/LendingScreen';
import SupplyScreen from './src/screens/SupplyScreen';
import BorrowScreen from './src/screens/BorrowScreen';
import WithdrawScreen from './src/screens/WithdrawScreen';
import RepayScreen from './src/screens/RepayScreen';
import LendingStrategiesScreen from './src/screens/LendingStrategiesScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import TransactionHistoryScreen from './src/screens/TransactionHistoryScreen';
import SecuritySettingsScreen from './src/screens/SecuritySettingsScreen';
import WalletScreen from './src/screens/WalletScreen';
import TokenSafetyScreen from './src/screens/TokenSafetyScreen';
import MeteoraPointsScreen from './src/screens/MeteoraPointsScreen';

// Import providers
import { MobileWalletAdapterProvider } from './src/contexts/MobileWalletAdapterProvider';
import { WalletProvider } from './src/contexts/WalletProvider';
import { ConnectionProvider } from './src/contexts/ConnectionProvider';

// Import theme
import theme from './src/theme';

// Import hooks
import { useOTAUpdates } from './src/hooks/useOTAUpdates';

// Create navigator
const Stack = createNativeStackNavigator();

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
  const { checkForUpdateAsync, fetchUpdateAsync } = useOTAUpdates();

  useEffect(() => {
    async function prepare() {
      try {
        // Pre-load fonts, make any API calls you need to do here
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate loading time
        
        // Check for OTA updates
        await checkForUpdateAsync();
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
                  <Stack.Navigator
                    initialRouteName="Onboarding"
                    screenOptions={{
                      headerStyle: {
                        backgroundColor: '#000000',
                      },
                      headerTintColor: '#00ff88',
                      headerTitleStyle: {
                        fontWeight: 'bold',
                      },
                      contentStyle: {
                        backgroundColor: '#000000',
                      },
                    }}
                  >
                    <Stack.Screen 
                      name="Onboarding" 
                      component={OnboardingScreen}
                      options={{ headerShown: false }}
                    />
                    <Stack.Screen 
                      name="ConnectWallet" 
                      component={ConnectWalletScreen}
                      options={{ headerShown: false }}
                    />
                    <Stack.Screen 
                      name="Dashboard" 
                      component={DashboardScreen}
                      options={{ headerShown: false }}
                    />
                    <Stack.Screen 
                      name="Pools" 
                      component={PoolsScreen}
                      options={{ title: 'Liquidity Pools' }}
                    />
                    <Stack.Screen 
                      name="CreatePool" 
                      component={CreatePoolScreen}
                      options={{ title: 'Create Pool' }}
                    />
                    <Stack.Screen 
                      name="PoolDetail" 
                      component={PoolDetailScreen}
                      options={{ title: 'Pool Details' }}
                    />
                    <Stack.Screen 
                      name="Lending" 
                      component={LendingScreen}
                      options={{ title: 'Lending & Borrowing' }}
                    />
                    <Stack.Screen 
                      name="Supply" 
                      component={SupplyScreen}
                      options={{ title: 'Supply Assets' }}
                    />
                    <Stack.Screen 
                      name="Borrow" 
                      component={BorrowScreen}
                      options={{ title: 'Borrow Assets' }}
                    />
                    <Stack.Screen 
                      name="Withdraw" 
                      component={WithdrawScreen}
                      options={{ title: 'Withdraw Assets' }}
                    />
                    <Stack.Screen 
                      name="Repay" 
                      component={RepayScreen}
                      options={{ title: 'Repay Debt' }}
                    />
                    <Stack.Screen 
                      name="LendingStrategies" 
                      component={LendingStrategiesScreen}
                      options={{ title: 'Lending Strategies' }}
                    />
                    <Stack.Screen 
                      name="Settings" 
                      component={SettingsScreen}
                      options={{ title: 'Settings' }}
                    />
                    <Stack.Screen 
                      name="TransactionHistory" 
                      component={TransactionHistoryScreen}
                      options={{ title: 'Transaction History' }}
                    />
                    <Stack.Screen 
                      name="SecuritySettings" 
                      component={SecuritySettingsScreen}
                      options={{ title: 'Security Settings' }}
                    />
                    <Stack.Screen 
                      name="Wallet" 
                      component={WalletScreen}
                      options={{ title: 'Wallet' }}
                    />
                    <Stack.Screen 
                      name="TokenSafety" 
                      component={TokenSafetyScreen}
                      options={{ title: 'Token Safety' }}
                    />
                    <Stack.Screen 
                      name="MeteoraPoints" 
                      component={MeteoraPointsScreen}
                      options={{ title: 'Meteora Points' }}
                    />
                  </Stack.Navigator>
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