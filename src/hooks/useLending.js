import { useState, useEffect, useCallback } from 'react';
import { useWallet } from './useWallet';
import lendingService from '../services/lendingService';

export const useLending = () => {
  const { connected, wallet } = useWallet();
  
  const [lendingMarkets, setLendingMarkets] = useState([]);
  const [kaminoLendMarkets, setKaminoLendMarkets] = useState([]);
  const [kaminoVaults, setKaminoVaults] = useState([]);
  const [kaminoLiquidityPools, setKaminoLiquidityPools] = useState([]);
  const [marginfiBanks, setMarginFiBanks] = useState([]);
  const [marginfiMarkets, setMarginFiMarkets] = useState([]);
  const [userPositions, setUserPositions] = useState([]);
  const [userObligations, setUserObligations] = useState([]);
  const [userBanks, setUserBanks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchLendingData = useCallback(async () => {
    if (!connected) return;

    setLoading(true);
    setError(null);

    try {
      // Fetch lending markets from both Kamino and MarginFi
      const [kaminoLend, kaminoVaults, kaminoLiquidity, marginfiBanks, marginfiMarkets] = await Promise.all([
        lendingService.getKaminoLendMarkets(),
        lendingService.getKaminoVaults(),
        lendingService.getKaminoLiquidityPools(),
        lendingService.getMarginFiBanks(),
        lendingService.getMarginFiMarkets(),
      ]);

      // Format Kamino Lend markets
      const formattedKaminoLend = kaminoLend.map(market => ({
        ...market,
        protocol: 'Kamino Lend',
        type: 'lend',
      }));

      // Format Kamino Vaults
      const formattedKaminoVaults = kaminoVaults.map(vault => ({
        ...vault,
        protocol: 'Kamino Vaults',
        type: 'vault',
      }));

      // Format Kamino Liquidity pools
      const formattedKaminoLiquidity = kaminoLiquidity.map(pool => ({
        ...pool,
        protocol: 'Kamino Liquidity',
        type: 'liquidity',
      }));

      // Format MarginFi Banks
      const formattedMarginFiBanks = marginfiBanks.map(bank => ({
        ...bank,
        protocol: 'MarginFi',
        type: 'bank',
      }));

      // Format MarginFi Markets
      const formattedMarginFiMarkets = marginfiMarkets.map(market => ({
        ...market,
        protocol: 'MarginFi',
        type: 'market',
      }));

      setKaminoLendMarkets(formattedKaminoLend);
      setKaminoVaults(formattedKaminoVaults);
      setKaminoLiquidityPools(formattedKaminoLiquidity);
      setMarginFiBanks(formattedMarginFiBanks);
      setMarginFiMarkets(formattedMarginFiMarkets);

      // Combine all markets
      const allMarkets = [
        ...formattedKaminoLend,
        ...formattedKaminoVaults,
        ...formattedKaminoLiquidity,
        ...formattedMarginFiBanks,
        ...formattedMarginFiMarkets,
      ];

      setLendingMarkets(allMarkets);

      // Fetch user positions if wallet is connected
      if (wallet?.publicKey) {
        const [kaminoPositions, kaminoObligations, marginfiPositions, marginfiBanks] = await Promise.all([
          lendingService.getKaminoUserPositions(wallet.publicKey.toString()),
          lendingService.getKaminoAllUserObligations(wallet.publicKey.toString()),
          lendingService.getMarginFiUserPositions(wallet.publicKey.toString()),
          lendingService.getMarginFiUserAccount(wallet.publicKey.toString()),
        ]);
        
        setUserPositions([...kaminoPositions, ...marginfiPositions]);
        setUserObligations(kaminoObligations);
        setUserBanks(marginfiBanks);
      }
    } catch (err) {
      console.error('Error fetching lending data:', err);
      setError('Failed to fetch lending data');
    } finally {
      setLoading(false);
    }
  }, [connected, wallet?.publicKey]);

  const supplyAsset = useCallback(async (marketId, amount, asset) => {
    if (!connected || !wallet) {
      throw new Error('Wallet not connected');
    }

    try {
      setLoading(true);
      
      // Determine protocol from market
      const market = lendingMarkets.find(m => m.id === marketId);
      if (!market) {
        throw new Error('Market not found');
      }

      let result;
      if (market.protocol === 'Kamino Lend') {
        result = await lendingService.depositToKaminoLend(
          market.address,
          market.reserveAddress,
          amount,
          asset
        );
      } else if (market.protocol === 'Kamino Vaults') {
        result = await lendingService.depositToKaminoVault(
          market.address,
          amount,
          asset
        );
      } else if (market.protocol === 'MarginFi') {
        if (market.type === 'bank') {
          result = await lendingService.depositToMarginFi(
            market.address,
            asset,
            amount
          );
        } else {
          result = await lendingService.supplyToMarginFi(
            market.address,
            amount,
            asset
          );
        }
      } else {
        throw new Error('Unsupported protocol');
      }

      // Refresh data after successful supply
      await fetchLendingData();
      
      return result;
    } catch (err) {
      console.error('Error supplying asset:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [connected, wallet, lendingMarkets, fetchLendingData]);

  const borrowAsset = useCallback(async (marketId, amount, asset) => {
    if (!connected || !wallet) {
      throw new Error('Wallet not connected');
    }

    try {
      setLoading(true);
      
      const market = lendingMarkets.find(m => m.id === marketId);
      if (!market) {
        throw new Error('Market not found');
      }

      let result;
      if (market.protocol === 'Kamino Lend') {
        result = await lendingService.borrowFromKaminoLend(
          market.address,
          market.reserveAddress,
          amount
        );
      } else if (market.protocol === 'MarginFi') {
        if (market.type === 'bank') {
          result = await lendingService.borrowFromMarginFi(
            market.address,
            asset,
            amount
          );
        } else {
          result = await lendingService.borrowFromMarginFi(
            market.address,
            amount,
            asset
          );
        }
      } else {
        throw new Error('Unsupported protocol for borrowing');
      }

      // Refresh data after successful borrow
      await fetchLendingData();
      
      return result;
    } catch (err) {
      console.error('Error borrowing asset:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [connected, wallet, lendingMarkets, fetchLendingData]);

  const withdrawAsset = useCallback(async (marketId, amount) => {
    if (!connected || !wallet) {
      throw new Error('Wallet not connected');
    }

    try {
      setLoading(true);
      
      const market = lendingMarkets.find(m => m.id === marketId);
      if (!market) {
        throw new Error('Market not found');
      }

      let result;
      if (market.protocol === 'Kamino Lend') {
        result = await lendingService.withdrawFromKaminoLend(
          market.address,
          market.reserveAddress,
          amount
        );
      } else if (market.protocol === 'Kamino Vaults') {
        result = await lendingService.withdrawFromKaminoVault(
          market.address,
          amount
        );
      } else if (market.protocol === 'MarginFi') {
        if (market.type === 'bank') {
          result = await lendingService.withdrawFromMarginFi(
            market.address,
            market.assetAddress,
            amount
          );
        } else {
          result = await lendingService.withdrawFromMarginFi(
            market.address,
            amount
          );
        }
      } else {
        throw new Error('Unsupported protocol for withdrawal');
      }

      // Refresh data after successful withdrawal
      await fetchLendingData();
      
      return result;
    } catch (err) {
      console.error('Error withdrawing asset:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [connected, wallet, lendingMarkets, fetchLendingData]);

  const repayAsset = useCallback(async (marketId, amount) => {
    if (!connected || !wallet) {
      throw new Error('Wallet not connected');
    }

    try {
      setLoading(true);
      
      const market = lendingMarkets.find(m => m.id === marketId);
      if (!market) {
        throw new Error('Market not found');
      }

      let result;
      if (market.protocol === 'Kamino Lend') {
        result = await lendingService.repayToKaminoLend(
          market.address,
          market.reserveAddress,
          amount
        );
      } else if (market.protocol === 'MarginFi') {
        if (market.type === 'bank') {
          result = await lendingService.repayToMarginFi(
            market.address,
            market.assetAddress,
            amount
          );
        } else {
          result = await lendingService.repayToMarginFi(
            market.address,
            amount
          );
        }
      } else {
        throw new Error('Unsupported protocol for repayment');
      }

      // Refresh data after successful repayment
      await fetchLendingData();
      
      return result;
    } catch (err) {
      console.error('Error repaying asset:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [connected, wallet, lendingMarkets, fetchLendingData]);

  // MarginFi Bank Operations
  const createMarginFiBank = useCallback(async (bankData) => {
    if (!connected || !wallet) {
      throw new Error('Wallet not connected');
    }

    try {
      setLoading(true);
      const result = await lendingService.createMarginFiBank(
        wallet.publicKey.toString(),
        bankData
      );
      await fetchLendingData();
      return result;
    } catch (err) {
      console.error('Error creating MarginFi bank:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [connected, wallet, fetchLendingData]);

  const getMarginFiBankDetails = useCallback(async (bankAddress) => {
    try {
      const result = await lendingService.getMarginFiBankDetails(bankAddress);
      return result;
    } catch (err) {
      console.error('Error fetching MarginFi bank details:', err);
      throw err;
    }
  }, []);

  const getMarginFiBankAssets = useCallback(async (bankAddress) => {
    try {
      const result = await lendingService.getMarginFiBankAssets(bankAddress);
      return result;
    } catch (err) {
      console.error('Error fetching MarginFi bank assets:', err);
      throw err;
    }
  }, []);

  const getMarginFiBankAnalytics = useCallback(async (bankAddress) => {
    try {
      const result = await lendingService.getMarginFiBankAnalytics(bankAddress);
      return result;
    } catch (err) {
      console.error('Error fetching MarginFi bank analytics:', err);
      throw err;
    }
  }, []);

  const getMarginFiUserAnalytics = useCallback(async (walletAddress) => {
    try {
      const result = await lendingService.getMarginFiUserAnalytics(walletAddress);
      return result;
    } catch (err) {
      console.error('Error fetching MarginFi user analytics:', err);
      throw err;
    }
  }, []);

  const getMarginFiHealthFactor = useCallback(async (walletAddress) => {
    try {
      const result = await lendingService.getMarginFiHealthFactor(walletAddress);
      return result;
    } catch (err) {
      console.error('Error fetching MarginFi health factor:', err);
      throw err;
    }
  }, []);

  const getMarginFiUtilizationRates = useCallback(async (bankAddress) => {
    try {
      const result = await lendingService.getMarginFiUtilizationRates(bankAddress);
      return result;
    } catch (err) {
      console.error('Error fetching MarginFi utilization rates:', err);
      throw err;
    }
  }, []);

  const getMarginFiInterestRates = useCallback(async (bankAddress) => {
    try {
      const result = await lendingService.getMarginFiInterestRates(bankAddress);
      return result;
    } catch (err) {
      console.error('Error fetching MarginFi interest rates:', err);
      throw err;
    }
  }, []);

  const getHealthFactor = useCallback(async (walletAddress) => {
    try {
      const healthFactor = await lendingService.getHealthFactor(walletAddress);
      return healthFactor;
    } catch (err) {
      console.error('Error getting health factor:', err);
      throw err;
    }
  }, []);

  const getNetAPY = useCallback(async (walletAddress) => {
    try {
      // Calculate weighted average APY across all positions
      const positions = userPositions.filter(pos => pos.walletAddress === walletAddress);
      
      if (positions.length === 0) return 0;

      const totalValue = positions.reduce((sum, pos) => sum + pos.value, 0);
      const weightedAPY = positions.reduce((sum, pos) => {
        return sum + (pos.value / totalValue) * pos.apy;
      }, 0);

      return weightedAPY;
    } catch (err) {
      console.error('Error calculating net APY:', err);
      return 0;
    }
  }, [userPositions]);

  const getLiquidationRisk = useCallback(async (walletAddress) => {
    try {
      const risk = await lendingService.getLiquidationRisk(walletAddress);
      return risk;
    } catch (err) {
      console.error('Error getting liquidation risk:', err);
      throw err;
    }
  }, []);

  const getOptimalStrategies = useCallback(async (walletAddress, riskTolerance = 'medium') => {
    try {
      const strategies = await lendingService.getOptimalStrategies(walletAddress, riskTolerance);
      return strategies;
    } catch (err) {
      console.error('Error getting optimal strategies:', err);
      throw err;
    }
  }, []);

  const getBorrowLimit = useCallback(async (walletAddress, marketAddress) => {
    try {
      const limit = await lendingService.getBorrowLimit(walletAddress, marketAddress);
      return limit;
    } catch (err) {
      console.error('Error getting borrow limit:', err);
      throw err;
    }
  }, []);

  const getSupplyLimit = useCallback(async (walletAddress, marketAddress) => {
    try {
      const limit = await lendingService.getSupplyLimit(walletAddress, marketAddress);
      return limit;
    } catch (err) {
      console.error('Error getting supply limit:', err);
      throw err;
    }
  }, []);

  const getInterestRates = useCallback(async (marketAddress) => {
    try {
      const rates = await lendingService.getInterestRates(marketAddress);
      return rates;
    } catch (err) {
      console.error('Error getting interest rates:', err);
      throw err;
    }
  }, []);

  const getUtilizationRates = useCallback(async (marketAddress) => {
    try {
      const rates = await lendingService.getUtilizationRates(marketAddress);
      return rates;
    } catch (err) {
      console.error('Error getting utilization rates:', err);
      throw err;
    }
  }, []);

  const getProgramId = useCallback((programType) => {
    return lendingService.getProgramId(programType);
  }, []);

  const getAllProgramIds = useCallback(() => {
    return lendingService.getAllProgramIds();
  }, []);

  const getMarketAddress = useCallback((isDevnet = false) => {
    return lendingService.getMarketAddress(isDevnet);
  }, []);

  const getMarginFiConfig = useCallback((isDevnet = false) => {
    return lendingService.getMarginFiConfig(isDevnet);
  }, []);

  // Load data on mount and when wallet changes
  useEffect(() => {
    fetchLendingData();
  }, [fetchLendingData]);

  return {
    // State
    lendingMarkets,
    kaminoLendMarkets,
    kaminoVaults,
    kaminoLiquidityPools,
    marginfiBanks,
    marginfiMarkets,
    userPositions,
    userObligations,
    userBanks,
    loading,
    error,
    
    // Actions
    supplyAsset,
    borrowAsset,
    withdrawAsset,
    repayAsset,
    createMarginFiBank,
    
    // Analytics
    getHealthFactor,
    getNetAPY,
    getLiquidationRisk,
    getOptimalStrategies,
    
    // Market data
    getBorrowLimit,
    getSupplyLimit,
    getInterestRates,
    getUtilizationRates,
    
    // MarginFi specific
    getMarginFiBankDetails,
    getMarginFiBankAssets,
    getMarginFiBankAnalytics,
    getMarginFiUserAnalytics,
    getMarginFiHealthFactor,
    getMarginFiUtilizationRates,
    getMarginFiInterestRates,
    
    // Program utilities
    getProgramId,
    getAllProgramIds,
    getMarketAddress,
    getMarginFiConfig,
    
    // Data fetching
    fetchLendingData,
  };
}; 