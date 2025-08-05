import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { PublicKey } from '@solana/web3.js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMobileWalletAdapter } from './MobileWalletAdapterProvider';
import { useConnection } from './ConnectionProvider';

const WalletContext = createContext(null);

export function WalletProvider({ children }) {
  const { authorizedWallet, connect, disconnect, signAndSendTransaction, connecting } = useMobileWalletAdapter();
  const connection = useConnection();
  const [balance, setBalance] = useState(0);
  const [tokenBalances, setTokenBalances] = useState({});
  const [loading, setLoading] = useState(false);

  const publicKey = useMemo(() => 
    authorizedWallet ? authorizedWallet.publicKey : null, 
    [authorizedWallet]
  );

  // Fetch SOL balance when wallet is connected
  useEffect(() => {
    if (!publicKey) {
      setBalance(0);
      return;
    }

    const fetchBalance = async () => {
      try {
        const bal = await connection.getBalance(publicKey);
        setBalance(bal / 1e9); // Convert lamports to SOL
      } catch (error) {
        console.error('Error fetching balance:', error);
      }
    };

    fetchBalance();
    const intervalId = setInterval(fetchBalance, 30000); // Refresh every 30 seconds

    return () => clearInterval(intervalId);
  }, [publicKey, connection]);

  // Function to send a transaction
  const sendTransaction = useCallback(async (transaction) => {
    if (!publicKey) {
      throw new Error('Wallet not connected');
    }

    setLoading(true);
    try {
      const signature = await signAndSendTransaction(transaction, connection);
      
      // Wait for confirmation
      await connection.confirmTransaction(signature, 'confirmed');
      
      return signature;
    } catch (error) {
      console.error('Error sending transaction:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [publicKey, signAndSendTransaction, connection]);

  const value = useMemo(() => ({
    publicKey,
    connected: !!publicKey,
    connecting,
    connect,
    disconnect,
    sendTransaction,
    balance,
    tokenBalances,
    loading,
  }), [
    publicKey, 
    connecting, 
    connect, 
    disconnect, 
    sendTransaction, 
    balance, 
    tokenBalances, 
    loading
  ]);

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}