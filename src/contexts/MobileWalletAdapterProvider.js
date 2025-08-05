import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { Alert } from 'react-native';
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

export function MobileWalletAdapterProvider({ children, appIdentity }) {
  const [authorizedWallet, setAuthorizedWallet] = useState(null);
  const [connecting, setConnecting] = useState(false);

  const connect = useCallback(async () => {
    try {
      setConnecting(true);
      const result = await transact(async (wallet) => {
        const authorizationResult = await wallet.authorize({
          cluster: 'mainnet-beta',
          identity: appIdentity,
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
  }, [appIdentity]);

  const disconnect = useCallback(async () => {
    if (!authorizedWallet) return;
    
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
  }, [authorizedWallet]);

  const signAndSendTransaction = useCallback(async (transaction, connection) => {
    if (!authorizedWallet) {
      throw new Error('Wallet not connected');
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
  }, [authorizedWallet]);

  const value = useMemo(() => ({
    authorizedWallet,
    connecting,
    connect,
    disconnect,
    signAndSendTransaction,
  }), [authorizedWallet, connecting, connect, disconnect, signAndSendTransaction]);

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