import { useState, useEffect, useContext } from 'react';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { WalletContext } from '../contexts/WalletProvider';

export const useWallet = () => {
  const { wallet, connected, connecting, connect, disconnect } = useContext(WalletContext);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (connected && wallet?.publicKey) {
      fetchBalance();
    }
  }, [connected, wallet?.publicKey]);

  const fetchBalance = async () => {
    if (!wallet?.publicKey) return;

    try {
      setLoading(true);
      setError(null);
      
      const connection = new Connection('https://api.mainnet-beta.solana.com');
      const balance = await connection.getBalance(wallet.publicKey);
      setBalance(balance / LAMPORTS_PER_SOL);
    } catch (err) {
      console.error('Error fetching balance:', err);
      setError('Failed to fetch balance');
    } finally {
      setLoading(false);
    }
  };

  const getWalletAddress = () => {
    return wallet?.publicKey?.toString();
  };

  const getShortAddress = () => {
    const address = getWalletAddress();
    if (!address) return '';
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const signMessage = async (message) => {
    if (!wallet || !connected) {
      throw new Error('Wallet not connected');
    }

    try {
      const encodedMessage = new TextEncoder().encode(message);
      const signedMessage = await wallet.signMessage(encodedMessage);
      return signedMessage;
    } catch (err) {
      console.error('Error signing message:', err);
      throw err;
    }
  };

  const signTransaction = async (transaction) => {
    if (!wallet || !connected) {
      throw new Error('Wallet not connected');
    }

    try {
      const signedTransaction = await wallet.signTransaction(transaction);
      return signedTransaction;
    } catch (err) {
      console.error('Error signing transaction:', err);
      throw err;
    }
  };

  const sendTransaction = async (transaction) => {
    if (!wallet || !connected) {
      throw new Error('Wallet not connected');
    }

    try {
      const connection = new Connection('https://api.mainnet-beta.solana.com');
      const signature = await wallet.sendTransaction(transaction, connection);
      return signature;
    } catch (err) {
      console.error('Error sending transaction:', err);
      throw err;
    }
  };

  return {
    wallet,
    connected,
    connecting,
    connect,
    disconnect,
    balance,
    loading,
    error,
    getWalletAddress,
    getShortAddress,
    signMessage,
    signTransaction,
    sendTransaction,
    refreshBalance: fetchBalance,
  };
}; 