import axios from 'axios';

const RUGCHECK_API_BASE = 'https://api.rugcheck.xyz/v1';

class RugcheckService {
  constructor() {
    this.api = axios.create({
      baseURL: RUGCHECK_API_BASE,
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // Set API key for authenticated requests (optional)
  setApiKey(apiKey) {
    if (apiKey && apiKey !== 'free_no_key_required') {
      this.api.defaults.headers.common['Authorization'] = `Bearer ${apiKey}`;
    }
  }

  // Get token safety analysis (FREE - no API key required)
  async getTokenSafety(tokenAddress) {
    try {
      const response = await this.api.get(`/tokens/scan/solana/${tokenAddress}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching token safety:', error);
      throw error;
    }
  }

  // Get comprehensive token analysis
  async getComprehensiveAnalysis(tokenAddress) {
    try {
      const response = await this.api.get(`/tokens/scan/solana/${tokenAddress}`, {
        params: { forceRescan: true }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching comprehensive analysis:', error);
      throw error;
    }
  }

  // Get pool safety analysis
  async getPoolSafety(poolAddress) {
    try {
      const response = await this.api.get(`/pools/scan/solana/${poolAddress}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching pool safety:', error);
      throw error;
    }
  }

  // Get liquidity analysis
  async getLiquidityAnalysis(tokenAddress) {
    try {
      const response = await this.api.get(`/tokens/liquidity/solana/${tokenAddress}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching liquidity analysis:', error);
      throw error;
    }
  }

  // Get contract verification
  async getContractVerification(tokenAddress) {
    try {
      const response = await this.api.get(`/tokens/source-code/solana/${tokenAddress}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching contract verification:', error);
      throw error;
    }
  }

  // Get risk assessment
  async getRiskAssessment(tokenAddress) {
    try {
      const response = await this.api.get(`/tokens/risk/solana/${tokenAddress}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching risk assessment:', error);
      throw error;
    }
  }

  // Get honeypot check
  async getHoneypotCheck(tokenAddress) {
    try {
      const response = await this.api.get(`/tokens/honeypot/solana/${tokenAddress}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching honeypot check:', error);
      throw error;
    }
  }

  // Get token metadata
  async getTokenMetadata(tokenAddress) {
    try {
      const response = await this.api.get(`/tokens/metadata/solana/${tokenAddress}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching token metadata:', error);
      throw error;
    }
  }

  // Get social media presence
  async getSocialMediaPresence(tokenAddress) {
    try {
      const response = await this.api.get(`/tokens/social/solana/${tokenAddress}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching social media presence:', error);
      throw error;
    }
  }

  // Get website analysis
  async getWebsiteAnalysis(websiteUrl) {
    try {
      const response = await this.api.get(`/website/analysis`, {
        params: { url: websiteUrl }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching website analysis:', error);
      throw error;
    }
  }

  // Get developer activity
  async getDeveloperActivity(tokenAddress) {
    try {
      const response = await this.api.get(`/tokens/developer-activity/solana/${tokenAddress}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching developer activity:', error);
      throw error;
    }
  }

  // Get trading volume analysis
  async getTradingVolumeAnalysis(tokenAddress) {
    try {
      const response = await this.api.get(`/tokens/volume/solana/${tokenAddress}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching trading volume analysis:', error);
      throw error;
    }
  }

  // Get price manipulation detection
  async getPriceManipulationDetection(tokenAddress) {
    try {
      const response = await this.api.get(`/tokens/price-manipulation/solana/${tokenAddress}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching price manipulation detection:', error);
      throw error;
    }
  }

  // Get wallet analysis
  async getWalletAnalysis(walletAddress) {
    try {
      const response = await this.api.get(`/wallets/risk-rating/solana/${walletAddress}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching wallet analysis:', error);
      throw error;
    }
  }

  // Search for tokens
  async searchTokens(query, limit = 10) {
    try {
      const response = await this.api.get(`/tokens/search`, {
        params: { query, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error searching tokens:', error);
      throw error;
    }
  }

  // Get rug score calculation
  async getRugScore(tokenAddress) {
    try {
      const response = await this.api.get(`/tokens/rug-score/solana/${tokenAddress}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching rug score:', error);
      throw error;
    }
  }

  // Get safety score
  async getSafetyScore(tokenAddress) {
    try {
      const response = await this.api.get(`/tokens/safety-score/solana/${tokenAddress}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching safety score:', error);
      throw error;
    }
  }

  // Get comprehensive report
  async getComprehensiveReport(tokenAddress) {
    try {
      const response = await this.api.get(`/tokens/report/solana/${tokenAddress}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching comprehensive report:', error);
      throw error;
    }
  }

  // Get market sentiment
  async getMarketSentiment(tokenAddress) {
    try {
      const response = await this.api.get(`/tokens/sentiment/solana/${tokenAddress}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching market sentiment:', error);
      throw error;
    }
  }

  // Get historical safety data
  async getHistoricalSafetyData(tokenAddress, timeframe = '30d') {
    try {
      const response = await this.api.get(`/tokens/historical-safety/solana/${tokenAddress}`, {
        params: { timeframe }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching historical safety data:', error);
      throw error;
    }
  }

  // Get community trust score
  async getCommunityTrustScore(tokenAddress) {
    try {
      const response = await this.api.get(`/tokens/community-trust/solana/${tokenAddress}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching community trust score:', error);
      throw error;
    }
  }

  // Get audit status
  async getAuditStatus(tokenAddress) {
    try {
      const response = await this.api.get(`/tokens/audit/solana/${tokenAddress}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching audit status:', error);
      throw error;
    }
  }

  // Get team information
  async getTeamInformation(tokenAddress) {
    try {
      const response = await this.api.get(`/tokens/team/solana/${tokenAddress}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching team information:', error);
      throw error;
    }
  }

  // Get funding analysis
  async getFundingAnalysis(tokenAddress) {
    try {
      const response = await this.api.get(`/tokens/funding/solana/${tokenAddress}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching funding analysis:', error);
      throw error;
    }
  }

  // Get regulatory compliance
  async getRegulatoryCompliance(tokenAddress) {
    try {
      const response = await this.api.get(`/tokens/compliance/solana/${tokenAddress}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching regulatory compliance:', error);
      throw error;
    }
  }

  // Get real-time alerts
  async getRealTimeAlerts(tokenAddress) {
    try {
      const response = await this.api.get(`/tokens/alerts/solana/${tokenAddress}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching real-time alerts:', error);
      throw error;
    }
  }

  // Subscribe to alerts
  async subscribeToAlerts(tokenAddress, email) {
    try {
      const response = await this.api.post(`/tokens/subscribe/solana/${tokenAddress}`, {
        email
      });
      return response.data;
    } catch (error) {
      console.error('Error subscribing to alerts:', error);
      throw error;
    }
  }

  // Get API usage statistics
  async getApiUsageStats() {
    try {
      const response = await this.api.get('/stats/usage');
      return response.data;
    } catch (error) {
      console.error('Error fetching API usage stats:', error);
      throw error;
    }
  }

  // Get supported networks
  async getSupportedNetworks() {
    try {
      const response = await this.api.get('/networks');
      return response.data;
    } catch (error) {
      console.error('Error fetching supported networks:', error);
      throw error;
    }
  }

  // Health check
  async healthCheck() {
    try {
      const response = await this.api.get('/health');
      return response.data;
    } catch (error) {
      console.error('Error performing health check:', error);
      throw error;
    }
  }

  // Utility method to calculate overall safety score
  calculateOverallSafetyScore(safetyData) {
    if (!safetyData) return 0;

    const weights = {
      honeypot: 0.25,
      liquidity: 0.20,
      contract: 0.15,
      social: 0.10,
      volume: 0.10,
      developer: 0.10,
      community: 0.10
    };

    let totalScore = 0;
    let totalWeight = 0;

    Object.keys(weights).forEach(key => {
      if (safetyData[key] && typeof safetyData[key].score === 'number') {
        totalScore += safetyData[key].score * weights[key];
        totalWeight += weights[key];
      }
    });

    return totalWeight > 0 ? totalScore / totalWeight : 0;
  }

  // Utility method to get safety level
  getSafetyLevel(score) {
    if (score >= 80) return 'SAFE';
    if (score >= 60) return 'MODERATE';
    if (score >= 40) return 'RISKY';
    return 'DANGEROUS';
  }

  // Utility method to get safety color
  getSafetyColor(level) {
    switch (level) {
      case 'SAFE':
        return '#00FF00';
      case 'MODERATE':
        return '#FFA500';
      case 'RISKY':
        return '#FF6600';
      case 'DANGEROUS':
        return '#FF0000';
      default:
        return '#808080';
    }
  }

  // Authenticate with Solana wallet for higher rate limits
  async authenticateWithWallet(wallet, message = "Sign-in to Rugcheck.xyz") {
    try {
      const timestamp = Date.now();
      const publicKey = wallet.publicKey.toString();
      
      const signMessage = {
        message,
        timestamp,
        publicKey
      };

      const encodedMessage = new TextEncoder().encode(JSON.stringify(signMessage));
      const signature = await wallet.signMessage(encodedMessage);

      const response = await this.api.post('/auth/login/solana', {
        signature: signature,
        wallet: publicKey,
        message: JSON.stringify(signMessage)
      });

      // Store the authentication token
      if (response.data.token) {
        this.api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      }

      return response.data;
    } catch (error) {
      console.error('Error authenticating with wallet:', error);
      throw error;
    }
  }
}

export default new RugcheckService(); 