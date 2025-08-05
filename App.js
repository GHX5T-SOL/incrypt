import React, { useEffect, useState, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, Text, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SplashScreen from 'expo-splash-screen';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Theme
import { theme } from './src/theme';

// Wallet Connection
import { ConnectionProvider } from './src/contexts/ConnectionProvider';
import { WalletProvider } from './src/contexts/WalletProvider';
import { MobileWalletAdapterProvider } from './src/contexts/MobileWalletAdapterProvider';

// Navigation
import AppNavigator from './src/navigation/AppNavigator';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App Error:', error);
    console.error('Error Info:', errorInfo);
    Alert.alert('App Error', 'Something went wrong. Please restart the app.');
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
          <Text style={{ color: '#fff', fontSize: 18 }}>Something went wrong</Text>
          <Text style={{ color: '#fff', fontSize: 14, marginTop: 10 }}>Please restart the app</Text>
        </View>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  const [isFirstLaunch, setIsFirstLaunch] = useState(null);
  const [appIsReady, setAppIsReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function prepare() {
      try {
        console.log('App: Starting initialization...');
        
        // Check if it's the first launch
        const value = await AsyncStorage.getItem('alreadyLaunched');
        console.log('App: First launch check completed');
        
        if (value === null) {
          await AsyncStorage.setItem('alreadyLaunched', 'true');
          setIsFirstLaunch(true);
        } else {
          setIsFirstLaunch(false);
        }
        
        // Add a small delay to ensure everything is loaded
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('App: Initialization completed successfully');
      } catch (e) {
        console.error('App: Error during initialization:', e);
        setError(e);
        Alert.alert('Initialization Error', e.message);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      try {
        await SplashScreen.hideAsync();
        console.log('App: Splash screen hidden');
      } catch (e) {
        console.error('App: Error hiding splash screen:', e);
      }
    }
  }, [appIsReady]);

  // If we haven't determined if it's first launch yet, show nothing
  if (isFirstLaunch === null || !appIsReady) {
    return null;
  }

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

  return (
    <ErrorBoundary>
      <SafeAreaProvider onLayout={onLayoutRootView}>
        <ConnectionProvider endpoint="https://api.mainnet-beta.solana.com">
          <WalletProvider>
            <MobileWalletAdapterProvider>
              <PaperProvider theme={theme}>
                <NavigationContainer theme={navigationTheme}>
                  <AppNavigator />
                </NavigationContainer>
                <StatusBar style="light" />
              </PaperProvider>
            </MobileWalletAdapterProvider>
          </WalletProvider>
        </ConnectionProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}