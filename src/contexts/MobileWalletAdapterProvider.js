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
      
      // Debug: Log the result structure
      console.log('Authorization result:', JSON.stringify(result, null, 2));
      console.log('PublicKey type:', typeof result.publicKey);
      console.log('PublicKey value:', result.publicKey);
      console.log('Result keys:', Object.keys(result));
      
      // Handle different publicKey formats
      let publicKey;
      try {
        // Check if publicKey exists
        if (!result.publicKey) {
          console.error('No publicKey in result');
          throw new Error('No publicKey received from wallet');
        }
        
        // Log the exact structure
        console.log('PublicKey structure:', {
          type: typeof result.publicKey,
          constructor: result.publicKey?.constructor?.name,
          keys: result.publicKey ? Object.keys(result.publicKey) : 'N/A',
          value: result.publicKey
        });
        
        if (typeof result.publicKey === 'string') {
          console.log('Creating PublicKey from string:', result.publicKey);
          publicKey = new PublicKey(result.publicKey);
        } else if (result.publicKey && result.publicKey.toBytes) {
          console.log('Using existing PublicKey object');
          publicKey = result.publicKey;
        } else if (result.publicKey && result.publicKey._bn) {
          console.log('Creating PublicKey from _bn property');
          publicKey = new PublicKey(result.publicKey._bn);
        } else if (result.publicKey && result.publicKey.toBase58) {
          console.log('Creating PublicKey from toBase58 method');
          publicKey = new PublicKey(result.publicKey.toBase58());
        } else if (result.publicKey && result.publicKey.toString) {
          console.log('Creating PublicKey from toString method');
          publicKey = new PublicKey(result.publicKey.toString());
        } else {
          console.error('Unknown publicKey format:', result.publicKey);
          throw new Error(`Invalid publicKey format: ${typeof result.publicKey}`);
        }
        
        console.log('Successfully created PublicKey:', publicKey.toString());
      } catch (publicKeyError) {
        console.error('Error creating PublicKey:', publicKeyError);
        console.log('Received publicKey:', result.publicKey);
        console.log('Full result:', result);
        
        // For demo purposes, create a mock wallet connection
        console.log('Creating mock wallet connection for demo');
        const mockPublicKey = new PublicKey('11111111111111111111111111111111');
        setAuthorizedWallet({
          publicKey: mockPublicKey,
          authToken: 'mock-auth-token',
          label: 'Demo Wallet',
        });
        
        Alert.alert(
          'Demo Mode', 
          'Real wallet connection failed. Using demo wallet for presentation.',
          [{ text: 'OK' }]
        );
        
        return result;
      }
      
      setAuthorizedWallet({
        publicKey: publicKey,
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