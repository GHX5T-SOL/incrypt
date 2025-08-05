import { useState, useCallback } from 'react';
import rugcheckService from '../services/rugcheckService';

export const useRugcheck = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [safetyData, setSafetyData] = useState(null);

  // Set API key for authenticated requests
  const setApiKey = useCallback((apiKey) => {
    rugcheckService.setApiKey(apiKey);
  }, []);

  // Get comprehensive token safety analysis
  const analyzeToken = useCallback(async (tokenAddress) => {
    if (!tokenAddress) return null;

    try {
      setLoading(true);
      setError(null);

      // Get comprehensive safety data
      const [
        safetyAnalysis,
        rugScore,
        safetyScore,
        honeypotCheck,
        liquidityAnalysis,
        contractVerification,
        riskAssessment,
        metadata,
        socialMedia,
        developerActivity,
        volumeAnalysis,
        priceManipulation,
        communityTrust,
        auditStatus,
        teamInfo,
        fundingAnalysis,
        compliance,
        sentiment
      ] = await Promise.all([
        rugcheckService.getTokenSafety(tokenAddress),
        rugcheckService.getRugScore(tokenAddress),
        rugcheckService.getSafetyScore(tokenAddress),
        rugcheckService.getHoneypotCheck(tokenAddress),
        rugcheckService.getLiquidityAnalysis(tokenAddress),
        rugcheckService.getContractVerification(tokenAddress),
        rugcheckService.getRiskAssessment(tokenAddress),
        rugcheckService.getTokenMetadata(tokenAddress),
        rugcheckService.getSocialMediaPresence(tokenAddress),
        rugcheckService.getDeveloperActivity(tokenAddress),
        rugcheckService.getTradingVolumeAnalysis(tokenAddress),
        rugcheckService.getPriceManipulationDetection(tokenAddress),
        rugcheckService.getCommunityTrustScore(tokenAddress),
        rugcheckService.getAuditStatus(tokenAddress),
        rugcheckService.getTeamInformation(tokenAddress),
        rugcheckService.getFundingAnalysis(tokenAddress),
        rugcheckService.getRegulatoryCompliance(tokenAddress),
        rugcheckService.getMarketSentiment(tokenAddress)
      ]);

      const comprehensiveData = {
        tokenAddress,
        safetyAnalysis,
        rugScore,
        safetyScore,
        honeypotCheck,
        liquidityAnalysis,
        contractVerification,
        riskAssessment,
        metadata,
        socialMedia,
        developerActivity,
        volumeAnalysis,
        priceManipulation,
        communityTrust,
        auditStatus,
        teamInfo,
        fundingAnalysis,
        compliance,
        sentiment,
        timestamp: new Date().toISOString()
      };

      // Calculate overall safety score
      const overallScore = rugcheckService.calculateOverallSafetyScore(comprehensiveData);
      const safetyLevel = rugcheckService.getSafetyLevel(overallScore);
      const safetyColor = rugcheckService.getSafetyColor(safetyLevel);

      const result = {
        ...comprehensiveData,
        overallScore,
        safetyLevel,
        safetyColor
      };

      setSafetyData(result);
      return result;
    } catch (err) {
      console.error('Error analyzing token:', err);
      setError('Failed to analyze token safety');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get pool safety analysis
  const analyzePool = useCallback(async (poolAddress) => {
    if (!poolAddress) return null;

    try {
      setLoading(true);
      setError(null);

      const poolSafety = await rugcheckService.getPoolSafety(poolAddress);
      return poolSafety;
    } catch (err) {
      console.error('Error analyzing pool:', err);
      setError('Failed to analyze pool safety');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get website analysis
  const analyzeWebsite = useCallback(async (websiteUrl) => {
    if (!websiteUrl) return null;

    try {
      setLoading(true);
      setError(null);

      const websiteAnalysis = await rugcheckService.getWebsiteAnalysis(websiteUrl);
      return websiteAnalysis;
    } catch (err) {
      console.error('Error analyzing website:', err);
      setError('Failed to analyze website');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get wallet analysis
  const analyzeWallet = useCallback(async (walletAddress) => {
    if (!walletAddress) return null;

    try {
      setLoading(true);
      setError(null);

      const walletAnalysis = await rugcheckService.getWalletAnalysis(walletAddress);
      return walletAnalysis;
    } catch (err) {
      console.error('Error analyzing wallet:', err);
      setError('Failed to analyze wallet');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Batch check multiple tokens
  const batchCheckTokens = useCallback(async (tokenAddresses) => {
    if (!tokenAddresses || tokenAddresses.length === 0) return null;

    try {
      setLoading(true);
      setError(null);

      const batchResults = await rugcheckService.getBatchTokenCheck(tokenAddresses);
      return batchResults;
    } catch (err) {
      console.error('Error batch checking tokens:', err);
      setError('Failed to batch check tokens');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get historical safety data
  const getHistoricalSafety = useCallback(async (tokenAddress, timeframe = '30d') => {
    if (!tokenAddress) return null;

    try {
      setLoading(true);
      setError(null);

      const historicalData = await rugcheckService.getHistoricalSafetyData(tokenAddress, timeframe);
      return historicalData;
    } catch (err) {
      console.error('Error fetching historical safety data:', err);
      setError('Failed to fetch historical safety data');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get real-time alerts
  const getRealTimeAlerts = useCallback(async (tokenAddress) => {
    if (!tokenAddress) return null;

    try {
      setLoading(true);
      setError(null);

      const alerts = await rugcheckService.getRealTimeAlerts(tokenAddress);
      return alerts;
    } catch (err) {
      console.error('Error fetching real-time alerts:', err);
      setError('Failed to fetch real-time alerts');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Subscribe to alerts
  const subscribeToAlerts = useCallback(async (tokenAddress, email) => {
    if (!tokenAddress || !email) return null;

    try {
      setLoading(true);
      setError(null);

      const subscription = await rugcheckService.subscribeToAlerts(tokenAddress, email);
      return subscription;
    } catch (err) {
      console.error('Error subscribing to alerts:', err);
      setError('Failed to subscribe to alerts');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get comprehensive report
  const getComprehensiveReport = useCallback(async (tokenAddress) => {
    if (!tokenAddress) return null;

    try {
      setLoading(true);
      setError(null);

      const report = await rugcheckService.getComprehensiveReport(tokenAddress);
      return report;
    } catch (err) {
      console.error('Error fetching comprehensive report:', err);
      setError('Failed to fetch comprehensive report');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get API usage statistics
  const getApiUsageStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const stats = await rugcheckService.getApiUsageStats();
      return stats;
    } catch (err) {
      console.error('Error fetching API usage stats:', err);
      setError('Failed to fetch API usage stats');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get supported networks
  const getSupportedNetworks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const networks = await rugcheckService.getSupportedNetworks();
      return networks;
    } catch (err) {
      console.error('Error fetching supported networks:', err);
      setError('Failed to fetch supported networks');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Health check
  const healthCheck = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const health = await rugcheckService.healthCheck();
      return health;
    } catch (err) {
      console.error('Error performing health check:', err);
      setError('Failed to perform health check');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Utility functions
  const calculateOverallSafetyScore = useCallback((data) => {
    return rugcheckService.calculateOverallSafetyScore(data);
  }, []);

  const getSafetyLevel = useCallback((score) => {
    return rugcheckService.getSafetyLevel(score);
  }, []);

  const getSafetyColor = useCallback((level) => {
    return rugcheckService.getSafetyColor(level);
  }, []);

  // Clear safety data
  const clearSafetyData = useCallback(() => {
    setSafetyData(null);
    setError(null);
  }, []);

  return {
    // State
    loading,
    error,
    safetyData,
    
    // Core functions
    setApiKey,
    analyzeToken,
    analyzePool,
    analyzeWebsite,
    analyzeWallet,
    batchCheckTokens,
    getHistoricalSafety,
    getRealTimeAlerts,
    subscribeToAlerts,
    getComprehensiveReport,
    getApiUsageStats,
    getSupportedNetworks,
    healthCheck,
    
    // Utility functions
    calculateOverallSafetyScore,
    getSafetyLevel,
    getSafetyColor,
    clearSafetyData
  };
}; 