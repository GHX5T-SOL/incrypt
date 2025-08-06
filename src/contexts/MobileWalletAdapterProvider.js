import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { Alert, Platform } from 'react-native';
import { 
  transact,
  Web3MobileWallet,
  APP_IDENTITY,
} from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { Buffer } from 'buffer';
import bs58 from 'bs58';

const MobileWalletAdapterContext = createContext(null);

export function MobileWalletAdapterProvider({ children }) {
  const [authorizedWallet, setAuthorizedWallet] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [isNativeModuleAvailable, setIsNativeModuleAvailable] = useState(false);

  // Function to decode base64 address to base58
  const decodeBase64Address = (base64Address) => {
    try {
      // Remove any padding and decode base64
      const cleanBase64 = base64Address.replace(/=/g, '');
      const decoded = Buffer.from(cleanBase64, 'base64');
      
      // Convert to base58 using bs58 library
      const base58Address = bs58.encode(decoded);
      console.log('Converted base64 to base58:', base64Address, '->', base58Address);
      return base58Address;
    } catch (error) {
      console.error('Error decoding base64 address:', error);
      return null;
    }
  };

  // Function to create PublicKey from various formats
  const createPublicKey = (input) => {
    try {
      // First try direct creation
      return new PublicKey(input);
    } catch (error) {
      // If it's base64 encoded (contains +, /, or =), try to decode it
      if (input.includes('+') || input.includes('/') || input.includes('=')) {
        console.log('Detected base64 address, attempting to decode:', input);
        const decoded = decodeBase64Address(input);
        if (decoded) {
          try {
            const publicKey = new PublicKey(decoded);
            console.log('Successfully created PublicKey from decoded address:', publicKey.toString());
            return publicKey;
          } catch (decodeError) {
            console.error('Failed to create PublicKey from decoded address:', decodeError);
          }
        }
      }
      throw error;
    }
  };

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
        // Check if we have accounts in the result (Solana Mobile Wallet Adapter format)
        if (result.accounts && result.accounts.length > 0) {
          const account = result.accounts[0];
          console.log('Using first account:', account);
          
          if (account.address) {
            console.log('Creating PublicKey from account address:', account.address);
            publicKey = createPublicKey(account.address);
          } else {
            throw new Error('No address in account');
          }
        } else if (result.publicKey) {
          // Check if publicKey exists
          console.log('PublicKey structure:', {
            type: typeof result.publicKey,
            constructor: result.publicKey?.constructor?.name,
            keys: result.publicKey ? Object.keys(result.publicKey) : 'N/A',
            value: result.publicKey
          });
          
          if (typeof result.publicKey === 'string') {
            console.log('Creating PublicKey from string:', result.publicKey);
            publicKey = createPublicKey(result.publicKey);
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
            publicKey = createPublicKey(result.publicKey.toString());
          } else {
            console.error('Unknown publicKey format:', result.publicKey);
            throw new Error(`Invalid publicKey format: ${typeof result.publicKey}`);
          }
        } else {
          console.error('No publicKey or accounts in result');
          throw new Error('No publicKey or accounts received from wallet');
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