import { useState, useEffect } from 'react';
import meteoraService from '../services/meteoraService';

export const useMeteora = () => {
  const [pools, setPools] = useState([]);
  const [dlmmPools, setDlmmPools] = useState([]);
  const [dammV1Pools, setDammV1Pools] = useState([]);
  const [dammV2Pools, setDammV2Pools] = useState([]);
  const [dbcPools, setDbcPools] = useState([]);
  const [alphaVaultPools, setAlphaVaultPools] = useState([]);
  const [stake2EarnPools, setStake2EarnPools] = useState([]);
  const [dynamicVaultPools, setDynamicVaultPools] = useState([]);
  const [userPositions, setUserPositions] = useState([]);
  const [userStakes, setUserStakes] = useState([]);
  const [userFeeRewards, setUserFeeRewards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPools = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await meteoraService.getPools();
      setPools(data);
    } catch (err) {
      console.error('Error fetching pools:', err);
      setError('Failed to fetch pools');
    } finally {
      setLoading(false);
    }
  };

  const fetchDLMMPools = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await meteoraService.getDLMMPools();
      setDlmmPools(data);
    } catch (err) {
      console.error('Error fetching DLMM pools:', err);
      setError('Failed to fetch DLMM pools');
    } finally {
      setLoading(false);
    }
  };

  const fetchDAMMV1Pools = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await meteoraService.getDAMMV1Pools();
      setDammV1Pools(data);
    } catch (err) {
      console.error('Error fetching DAMM V1 pools:', err);
      setError('Failed to fetch DAMM V1 pools');
    } finally {
      setLoading(false);
    }
  };

  const fetchDAMMV2Pools = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await meteoraService.getDAMMV2Pools();
      setDammV2Pools(data);
    } catch (err) {
      console.error('Error fetching DAMM V2 pools:', err);
      setError('Failed to fetch DAMM V2 pools');
    } finally {
      setLoading(false);
    }
  };

  const fetchDBCPools = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await meteoraService.getDBCPools();
      setDbcPools(data);
    } catch (err) {
      console.error('Error fetching DBC pools:', err);
      setError('Failed to fetch DBC pools');
    } finally {
      setLoading(false);
    }
  };

  const fetchAlphaVaultPools = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await meteoraService.getAlphaVaultPools();
      setAlphaVaultPools(data);
    } catch (err) {
      console.error('Error fetching Alpha Vault pools:', err);
      setError('Failed to fetch Alpha Vault pools');
    } finally {
      setLoading(false);
    }
  };

  const fetchStake2EarnPools = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await meteoraService.getStake2EarnPools();
      setStake2EarnPools(data);
    } catch (err) {
      console.error('Error fetching Stake2Earn pools:', err);
      setError('Failed to fetch Stake2Earn pools');
    } finally {
      setLoading(false);
    }
  };

  const fetchDynamicVaultPools = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await meteoraService.getDynamicVaultPools();
      setDynamicVaultPools(data);
    } catch (err) {
      console.error('Error fetching Dynamic Vault pools:', err);
      setError('Failed to fetch Dynamic Vault pools');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPositions = async (walletAddress) => {
    if (!walletAddress) return;

    try {
      setLoading(true);
      setError(null);
      const data = await meteoraService.getUserPositions(walletAddress);
      setUserPositions(data);
    } catch (err) {
      console.error('Error fetching user positions:', err);
      setError('Failed to fetch user positions');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStakes = async (walletAddress) => {
    if (!walletAddress) return;

    try {
      setLoading(true);
      setError(null);
      const data = await meteoraService.getUserStakes(walletAddress);
      setUserStakes(data);
    } catch (err) {
      console.error('Error fetching user stakes:', err);
      setError('Failed to fetch user stakes');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserFeeRewards = async (walletAddress) => {
    if (!walletAddress) return;

    try {
      setLoading(true);
      setError(null);
      const data = await meteoraService.getUserFeeRewards(walletAddress);
      setUserFeeRewards(data);
    } catch (err) {
      console.error('Error fetching user fee rewards:', err);
      setError('Failed to fetch user fee rewards');
    } finally {
      setLoading(false);
    }
  };

  const getPoolDetails = async (poolAddress) => {
    try {
      setLoading(true);
      setError(null);
      const data = await meteoraService.getPoolDetails(poolAddress);
      return data;
    } catch (err) {
      console.error('Error fetching pool details:', err);
      setError('Failed to fetch pool details');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getPoolAnalytics = async (poolAddress) => {
    try {
      setLoading(true);
      setError(null);
      const data = await meteoraService.getPoolAnalytics(poolAddress);
      return data;
    } catch (err) {
      console.error('Error fetching pool analytics:', err);
      setError('Failed to fetch pool analytics');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createPool = async (poolData) => {
    try {
      setLoading(true);
      setError(null);
      const data = await meteoraService.createPool(poolData);
      return data;
    } catch (err) {
      console.error('Error creating pool:', err);
      setError('Failed to create pool');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const joinPool = async (poolAddress, joinData) => {
    try {
      setLoading(true);
      setError(null);
      const data = await meteoraService.joinPool(poolAddress, joinData);
      return data;
    } catch (err) {
      console.error('Error joining pool:', err);
      setError('Failed to join pool');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const stakeTokens = async (poolAddress, stakeData) => {
    try {
      setLoading(true);
      setError(null);
      const data = await meteoraService.stakeTokens(poolAddress, stakeData);
      return data;
    } catch (err) {
      console.error('Error staking tokens:', err);
      setError('Failed to stake tokens');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const unstakeTokens = async (poolAddress, unstakeData) => {
    try {
      setLoading(true);
      setError(null);
      const data = await meteoraService.unstakeTokens(poolAddress, unstakeData);
      return data;
    } catch (err) {
      console.error('Error unstaking tokens:', err);
      setError('Failed to unstake tokens');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const claimFeeRewards = async (poolAddress, claimData) => {
    try {
      setLoading(true);
      setError(null);
      const data = await meteoraService.claimFeeRewards(poolAddress, claimData);
      return data;
    } catch (err) {
      console.error('Error claiming fee rewards:', err);
      setError('Failed to claim fee rewards');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getDynamicFeeSharing = async (poolAddress) => {
    try {
      setLoading(true);
      setError(null);
      const data = await meteoraService.getDynamicFeeSharing(poolAddress);
      return data;
    } catch (err) {
      console.error('Error fetching dynamic fee sharing:', err);
      setError('Failed to fetch dynamic fee sharing');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getLockInfo = async (lockAddress) => {
    try {
      setLoading(true);
      setError(null);
      const data = await meteoraService.getLockInfo(lockAddress);
      return data;
    } catch (err) {
      console.error('Error fetching lock info:', err);
      setError('Failed to fetch lock info');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getFarmInfo = async (farmAddress) => {
    try {
      setLoading(true);
      setError(null);
      const data = await meteoraService.getFarmInfo(farmAddress);
      return data;
    } catch (err) {
      console.error('Error fetching farm info:', err);
      setError('Failed to fetch farm info');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getProgramId = (programType, isDevnet = false) => {
    return meteoraService.getProgramId(programType, isDevnet);
  };

  const getAllProgramIds = (isDevnet = false) => {
    return meteoraService.getAllProgramIds(isDevnet);
  };

  const getTopPools = () => {
    return pools
      .filter(pool => pool.tvl > 0)
      .sort((a, b) => b.tvl - a.tvl)
      .slice(0, 10);
  };

  const getHighYieldPools = () => {
    return pools
      .filter(pool => pool.apr > 0)
      .sort((a, b) => b.apr - a.apr)
      .slice(0, 10);
  };

  const getNewPools = () => {
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return pools
      .filter(pool => new Date(pool.createdAt).getTime() > oneWeekAgo)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10);
  };

  const getStake2EarnPools = () => {
    return stake2EarnPools
      .filter(pool => pool.totalStaked > 0)
      .sort((a, b) => b.totalStaked - a.totalStaked)
      .slice(0, 10);
  };

  const getAlphaVaultPools = () => {
    return alphaVaultPools
      .filter(pool => pool.totalValue > 0)
      .sort((a, b) => b.totalValue - a.totalValue)
      .slice(0, 10);
  };

  return {
    // State
    pools,
    dlmmPools,
    dammV1Pools,
    dammV2Pools,
    dbcPools,
    alphaVaultPools,
    stake2EarnPools,
    dynamicVaultPools,
    userPositions,
    userStakes,
    userFeeRewards,
    loading,
    error,
    
    // Fetch functions
    fetchPools,
    fetchDLMMPools,
    fetchDAMMV1Pools,
    fetchDAMMV2Pools,
    fetchDBCPools,
    fetchAlphaVaultPools,
    fetchStake2EarnPools,
    fetchDynamicVaultPools,
    fetchUserPositions,
    fetchUserStakes,
    fetchUserFeeRewards,
    
    // Action functions
    getPoolDetails,
    getPoolAnalytics,
    createPool,
    joinPool,
    stakeTokens,
    unstakeTokens,
    claimFeeRewards,
    getDynamicFeeSharing,
    getLockInfo,
    getFarmInfo,
    
    // Utility functions
    getProgramId,
    getAllProgramIds,
    getTopPools,
    getHighYieldPools,
    getNewPools,
    getStake2EarnPools,
    getAlphaVaultPools,
  };
}; 