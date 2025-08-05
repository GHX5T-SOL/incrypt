import axios from 'axios';

const DEXSCREENER_API_BASE = 'https://api.dexscreener.com';

class DexScreenerService {
  constructor() {
    this.api = axios.create({
      baseURL: DEXSCREENER_API_BASE,
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // Get latest token profiles
  async getLatestTokenProfiles() {
    try {
      const response = await this.api.get('/token-profiles/latest/v1');
      return response.data;
    } catch (error) {
      console.error('Error fetching latest token profiles:', error);
      throw error;
    }
  }

  // Search for tokens
  async searchTokens(query) {
    try {
      const response = await this.api.get(`/search?q=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      console.error('Error searching tokens:', error);
      throw error;
    }
  }

  // Get token information
  async getTokenInfo(tokenAddress) {
    try {
      const response = await this.api.get(`/tokens/${tokenAddress}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching token info:', error);
      throw error;
    }
  }

  // Get pair information
  async getPairInfo(pairAddress) {
    try {
      const response = await this.api.get(`/pairs/${pairAddress}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching pair info:', error);
      throw error;
    }
  }

  // Get trending tokens
  async getTrendingTokens() {
    try {
      const response = await this.api.get('/trending');
      return response.data;
    } catch (error) {
      console.error('Error fetching trending tokens:', error);
      throw error;
    }
  }

  // Get market data for a specific token
  async getMarketData(tokenAddress) {
    try {
      const response = await this.api.get(`/markets/${tokenAddress}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching market data:', error);
      throw error;
    }
  }

  // Get DEX information
  async getDexInfo(dexId) {
    try {
      const response = await this.api.get(`/dex/${dexId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching DEX info:', error);
      throw error;
    }
  }

  // Get chain information
  async getChainInfo(chainId) {
    try {
      const response = await this.api.get(`/chain/${chainId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching chain info:', error);
      throw error;
    }
  }

  // Get liquidity pools for a token
  async getLiquidityPools(tokenAddress) {
    try {
      const response = await this.api.get(`/pairs/${tokenAddress}/liquidity`);
      return response.data;
    } catch (error) {
      console.error('Error fetching liquidity pools:', error);
      throw error;
    }
  }

  // Get trading pairs for a token
  async getTradingPairs(tokenAddress) {
    try {
      const response = await this.api.get(`/pairs/${tokenAddress}/trading`);
      return response.data;
    } catch (error) {
      console.error('Error fetching trading pairs:', error);
      throw error;
    }
  }

  // Get price data for a token
  async getPriceData(tokenAddress) {
    try {
      const response = await this.api.get(`/tokens/${tokenAddress}/price`);
      return response.data;
    } catch (error) {
      console.error('Error fetching price data:', error);
      throw error;
    }
  }

  // Get volume data for a token
  async getVolumeData(tokenAddress) {
    try {
      const response = await this.api.get(`/tokens/${tokenAddress}/volume`);
      return response.data;
    } catch (error) {
      console.error('Error fetching volume data:', error);
      throw error;
    }
  }

  // Get market cap data for a token
  async getMarketCapData(tokenAddress) {
    try {
      const response = await this.api.get(`/tokens/${tokenAddress}/marketcap`);
      return response.data;
    } catch (error) {
      console.error('Error fetching market cap data:', error);
      throw error;
    }
  }

  // Get historical data for a token
  async getHistoricalData(tokenAddress, timeframe = '24h') {
    try {
      const response = await this.api.get(`/tokens/${tokenAddress}/history`, {
        params: { timeframe }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching historical data:', error);
      throw error;
    }
  }

  // Get top gainers
  async getTopGainers() {
    try {
      const response = await this.api.get('/gainers');
      return response.data;
    } catch (error) {
      console.error('Error fetching top gainers:', error);
      throw error;
    }
  }

  // Get top losers
  async getTopLosers() {
    try {
      const response = await this.api.get('/losers');
      return response.data;
    } catch (error) {
      console.error('Error fetching top losers:', error);
      throw error;
    }
  }

  // Get most active tokens
  async getMostActiveTokens() {
    try {
      const response = await this.api.get('/active');
      return response.data;
    } catch (error) {
      console.error('Error fetching most active tokens:', error);
      throw error;
    }
  }

  // Get new listings
  async getNewListings() {
    try {
      const response = await this.api.get('/new');
      return response.data;
    } catch (error) {
      console.error('Error fetching new listings:', error);
      throw error;
    }
  }

  // Search across all DEXs
  async searchAllDexs(query) {
    try {
      const response = await this.api.get(`/search/all?q=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      console.error('Error searching all DEXs:', error);
      throw error;
    }
  }

  // Get supported chains
  async getSupportedChains() {
    try {
      const response = await this.api.get('/chains');
      return response.data;
    } catch (error) {
      console.error('Error fetching supported chains:', error);
      throw error;
    }
  }

  // Get supported DEXs
  async getSupportedDexs() {
    try {
      const response = await this.api.get('/dexes');
      return response.data;
    } catch (error) {
      console.error('Error fetching supported DEXs:', error);
      throw error;
    }
  }

  // Utility method to format token data
  formatTokenData(rawData) {
    if (!rawData || !rawData.pairs) return null;

    const pairs = rawData.pairs;
    if (pairs.length === 0) return null;

    const primaryPair = pairs[0];
    
    return {
      tokenAddress: primaryPair.baseToken.address,
      tokenName: primaryPair.baseToken.name,
      tokenSymbol: primaryPair.baseToken.symbol,
      price: primaryPair.priceUsd,
      priceChange24h: primaryPair.priceChange24h,
      volume24h: primaryPair.volume24h,
      liquidity: primaryPair.liquidity?.usd,
      marketCap: primaryPair.marketCap,
      dexId: primaryPair.dexId,
      chainId: primaryPair.chainId,
      pairAddress: primaryPair.pairAddress,
      fdv: primaryPair.fdv,
      priceChange1h: primaryPair.priceChange1h,
      priceChange7d: primaryPair.priceChange7d,
      volumeChange24h: primaryPair.volumeChange24h,
      liquidityChange24h: primaryPair.liquidityChange24h,
      allPairs: pairs
    };
  }

  // Utility method to get comprehensive token analysis
  async getComprehensiveTokenAnalysis(tokenAddress) {
    try {
      const [tokenInfo, marketData, priceData, volumeData] = await Promise.all([
        this.getTokenInfo(tokenAddress),
        this.getMarketData(tokenAddress),
        this.getPriceData(tokenAddress),
        this.getVolumeData(tokenAddress)
      ]);

      return {
        tokenInfo,
        marketData,
        priceData,
        volumeData,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting comprehensive token analysis:', error);
      throw error;
    }
  }
}

export default new DexScreenerService(); 