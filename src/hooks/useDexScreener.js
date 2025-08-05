import { useState, useCallback } from 'react';
import dexscreenerService from '../services/dexscreenerService';

export const useDexScreener = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tokenData, setTokenData] = useState(null);
  const [marketData, setMarketData] = useState(null);
  const [trendingTokens, setTrendingTokens] = useState([]);
  const [searchResults, setSearchResults] = useState([]);

  // Get latest token profiles
  const getLatestTokenProfiles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const profiles = await dexscreenerService.getLatestTokenProfiles();
      return profiles;
    } catch (err) {
      console.error('Error fetching latest token profiles:', err);
      setError('Failed to fetch latest token profiles');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Search for tokens
  const searchTokens = useCallback(async (query) => {
    if (!query || query.trim().length < 2) return [];

    try {
      setLoading(true);
      setError(null);
      const results = await dexscreenerService.searchTokens(query);
      setSearchResults(results.pairs || []);
      return results;
    } catch (err) {
      console.error('Error searching tokens:', err);
      setError('Failed to search tokens');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get comprehensive token information
  const getTokenInfo = useCallback(async (tokenAddress) => {
    if (!tokenAddress) return null;

    try {
      setLoading(true);
      setError(null);
      
      const [tokenInfo, marketData] = await Promise.all([
        dexscreenerService.getTokenInfo(tokenAddress),
        dexscreenerService.getMarketData(tokenAddress)
      ]);

      const formattedData = dexscreenerService.formatTokenData(tokenInfo);
      setTokenData(formattedData);
      setMarketData(marketData);
      
      return {
        tokenInfo: formattedData,
        marketData
      };
    } catch (err) {
      console.error('Error fetching token info:', err);
      setError('Failed to fetch token information');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get trending tokens
  const getTrendingTokens = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const trending = await dexscreenerService.getTrendingTokens();
      setTrendingTokens(trending.pairs || []);
      return trending;
    } catch (err) {
      console.error('Error fetching trending tokens:', err);
      setError('Failed to fetch trending tokens');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get top gainers
  const getTopGainers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const gainers = await dexscreenerService.getTopGainers();
      return gainers;
    } catch (err) {
      console.error('Error fetching top gainers:', err);
      setError('Failed to fetch top gainers');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get top losers
  const getTopLosers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const losers = await dexscreenerService.getTopLosers();
      return losers;
    } catch (err) {
      console.error('Error fetching top losers:', err);
      setError('Failed to fetch top losers');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get most active tokens
  const getMostActiveTokens = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const active = await dexscreenerService.getMostActiveTokens();
      return active;
    } catch (err) {
      console.error('Error fetching most active tokens:', err);
      setError('Failed to fetch most active tokens');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get new listings
  const getNewListings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const newListings = await dexscreenerService.getNewListings();
      return newListings;
    } catch (err) {
      console.error('Error fetching new listings:', err);
      setError('Failed to fetch new listings');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get pair information
  const getPairInfo = useCallback(async (pairAddress) => {
    if (!pairAddress) return null;

    try {
      setLoading(true);
      setError(null);
      const pairInfo = await dexscreenerService.getPairInfo(pairAddress);
      return pairInfo;
    } catch (err) {
      console.error('Error fetching pair info:', err);
      setError('Failed to fetch pair information');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get liquidity pools for a token
  const getLiquidityPools = useCallback(async (tokenAddress) => {
    if (!tokenAddress) return null;

    try {
      setLoading(true);
      setError(null);
      const pools = await dexscreenerService.getLiquidityPools(tokenAddress);
      return pools;
    } catch (err) {
      console.error('Error fetching liquidity pools:', err);
      setError('Failed to fetch liquidity pools');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get trading pairs for a token
  const getTradingPairs = useCallback(async (tokenAddress) => {
    if (!tokenAddress) return null;

    try {
      setLoading(true);
      setError(null);
      const pairs = await dexscreenerService.getTradingPairs(tokenAddress);
      return pairs;
    } catch (err) {
      console.error('Error fetching trading pairs:', err);
      setError('Failed to fetch trading pairs');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get price data for a token
  const getPriceData = useCallback(async (tokenAddress) => {
    if (!tokenAddress) return null;

    try {
      setLoading(true);
      setError(null);
      const priceData = await dexscreenerService.getPriceData(tokenAddress);
      return priceData;
    } catch (err) {
      console.error('Error fetching price data:', err);
      setError('Failed to fetch price data');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get volume data for a token
  const getVolumeData = useCallback(async (tokenAddress) => {
    if (!tokenAddress) return null;

    try {
      setLoading(true);
      setError(null);
      const volumeData = await dexscreenerService.getVolumeData(tokenAddress);
      return volumeData;
    } catch (err) {
      console.error('Error fetching volume data:', err);
      setError('Failed to fetch volume data');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get market cap data for a token
  const getMarketCapData = useCallback(async (tokenAddress) => {
    if (!tokenAddress) return null;

    try {
      setLoading(true);
      setError(null);
      const marketCapData = await dexscreenerService.getMarketCapData(tokenAddress);
      return marketCapData;
    } catch (err) {
      console.error('Error fetching market cap data:', err);
      setError('Failed to fetch market cap data');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get historical data for a token
  const getHistoricalData = useCallback(async (tokenAddress, timeframe = '24h') => {
    if (!tokenAddress) return null;

    try {
      setLoading(true);
      setError(null);
      const historicalData = await dexscreenerService.getHistoricalData(tokenAddress, timeframe);
      return historicalData;
    } catch (err) {
      console.error('Error fetching historical data:', err);
      setError('Failed to fetch historical data');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get comprehensive token analysis
  const getComprehensiveTokenAnalysis = useCallback(async (tokenAddress) => {
    if (!tokenAddress) return null;

    try {
      setLoading(true);
      setError(null);
      const analysis = await dexscreenerService.getComprehensiveTokenAnalysis(tokenAddress);
      return analysis;
    } catch (err) {
      console.error('Error fetching comprehensive token analysis:', err);
      setError('Failed to fetch comprehensive token analysis');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get supported chains
  const getSupportedChains = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const chains = await dexscreenerService.getSupportedChains();
      return chains;
    } catch (err) {
      console.error('Error fetching supported chains:', err);
      setError('Failed to fetch supported chains');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get supported DEXs
  const getSupportedDexs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const dexes = await dexscreenerService.getSupportedDexs();
      return dexes;
    } catch (err) {
      console.error('Error fetching supported DEXs:', err);
      setError('Failed to fetch supported DEXs');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Clear data
  const clearData = useCallback(() => {
    setTokenData(null);
    setMarketData(null);
    setTrendingTokens([]);
    setSearchResults([]);
    setError(null);
  }, []);

  return {
    // State
    loading,
    error,
    tokenData,
    marketData,
    trendingTokens,
    searchResults,
    
    // Core functions
    getLatestTokenProfiles,
    searchTokens,
    getTokenInfo,
    getTrendingTokens,
    getTopGainers,
    getTopLosers,
    getMostActiveTokens,
    getNewListings,
    getPairInfo,
    getLiquidityPools,
    getTradingPairs,
    getPriceData,
    getVolumeData,
    getMarketCapData,
    getHistoricalData,
    getComprehensiveTokenAnalysis,
    getSupportedChains,
    getSupportedDexs,
    
    // Utility functions
    clearData
  };
}; 