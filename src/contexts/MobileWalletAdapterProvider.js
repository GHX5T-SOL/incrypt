import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { Alert, Platform } from 'react-native';
import { 
  transact, 
  Web3MobileWallet, 
  AuthorizationResult, 
  AuthorizeAPI, 
  DeauthorizeAPI, 
  ReauthorizeAPI 
} from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';

const MobileWalletAdapterContext = createContext(null);

// App identity for Solana Mobile Wallet Adapter
const APP_IDENTITY = {
  name: 'Incrypt',
  uri: 'https://incrypt.network',
};

export function MobileWalletAdapterProvider({ children }) {
  const [authorizedWallet, setAuthorizedWallet] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [isNativeModuleAvailable, setIsNativeModuleAvailable] = useState(false);

  // Check if native module is available
  React.useEffect(() => {
    const checkNativeModule = async () => {
      try {
        // Try to access the native module
        const { NativeModules } = require('react-native');
        const hasSolanaModule = NativeModules.SolanaMobileWalletAdapter;
        setIsNativeModuleAvailable(!!hasSolanaModule);
      } catch (error) {
        console.log('Solana Mobile Wallet Adapter not available in Expo Go');
        setIsNativeModuleAvailable(false);
      }
    };
    
    checkNativeModule();
  }, []);

  const connect = useCallback(async () => {
    // If not in development build, show message
    if (!isNativeModuleAvailable) {
      Alert.alert(
        'Development Build Required',
        'Solana Mobile Wallet Adapter requires a custom development build. Please build the app with EAS Build.',
        [
          { text: 'OK', onPress: () => console.log('User acknowledged') }
        ]
      );
      return null;
    }

    try {
      setConnecting(true);
      const result = await transact(async (wallet) => {
        const authorizationResult = await wallet.authorize({
          cluster: 'mainnet-beta',
          identity: APP_IDENTITY,
        });
        return authorizationResult;
      });
      
      setAuthorizedWallet({
        publicKey: new PublicKey(result.publicKey),
        authToken: result.authToken,
        label: result.walletUriBase || 'Mobile Wallet',
      });
      
      return result;
    } catch (error) {
      console.error('Error connecting wallet:', error);
      Alert.alert('Connection Error', 'Failed to connect to wallet. Please try again.');
      return null;
    } finally {
      setConnecting(false);
    }
  }, [isNativeModuleAvailable]);

  const disconnect = useCallback(async () => {
    if (!authorizedWallet || !isNativeModuleAvailable) {
      setAuthorizedWallet(null);
      return;
    }
    
    try {
      await transact(async (wallet) => {
        await wallet.deauthorize({
          authToken: authorizedWallet.authToken,
        });
      });
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
    } finally {
      setAuthorizedWallet(null);
    }
  }, [authorizedWallet, isNativeModuleAvailable]);

  const signAndSendTransaction = useCallback(async (transaction, connection) => {
    if (!authorizedWallet) {
      throw new Error('Wallet not connected');
    }

    if (!isNativeModuleAvailable) {
      throw new Error('Solana Mobile Wallet Adapter not available');
    }

    try {
      const signedTransaction = await transact(async (wallet) => {
        const { signedTransactions } = await wallet.signTransactions({
          transactions: [transaction],
          authToken: authorizedWallet.authToken,
        });
        return signedTransactions[0];
      });

      const signature = await connection.sendRawTransaction(
        signedTransaction.serialize()
      );
      
      return signature;
    } catch (error) {
      console.error('Error signing transaction:', error);
      throw error;
    }
  }, [authorizedWallet, isNativeModuleAvailable]);

  const value = useMemo(() => ({
    authorizedWallet,
    connecting,
    connect,
    disconnect,
    signAndSendTransaction,
    isNativeModuleAvailable,
  }), [authorizedWallet, connecting, connect, disconnect, signAndSendTransaction, isNativeModuleAvailable]);

  return (
    <MobileWalletAdapterContext.Provider value={value}>
      {children}
    </MobileWalletAdapterContext.Provider>
  );
}

export function useMobileWalletAdapter() {
  const context = useContext(MobileWalletAdapterContext);
  if (!context) {
    throw new Error('useMobileWalletAdapter must be used within a MobileWalletAdapterProvider');
  }
  return context;
}