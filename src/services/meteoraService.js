import axios from 'axios';

const METEORA_API_BASE = 'https://api.meteora.ag';

// Official Meteora Program IDs
const METEORA_PROGRAMS = {
  DLMM: 'LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo',
  DAMM_V1: 'Eo7WjKq67rjJQSZxS6z3YkapzY3eMj6Xy8X5EQVn5UaB',
  DAMM_V2: 'cpamdpZCGKUy5JxQXB4dcpGPiikHawvSWAd6mEn1sGG',
  DBC: 'dbcij3LWUppWqq96dh6gJWwBifmcGfLSB5D4DuSMaqN',
  ALPHA_VAULT: 'vaU6kP7iNEGkbmPkLmZfGwiGxd4Mob24QQCie5R9kd2',
  STAKE2EARN: 'FEESngU3neckdwib9X3KWqdL7Mjmqk9XNp3uh5JbP4KP',
  VAULT: '24Uqj9JCLxUeoC3hGfh5W3s9FM9uCHDS2SG3LYwBpyTi',
  LOCK: 'LocpQgucEQHbqNABEYvBvwoxCPsSbG91A1QaQhQQqjn',
  DYNAMIC_FEE_SHARING: 'dfsdo2UqvwfN8DuUVrMRNfQe11VaiNoKcMqLHVvDPzh',
  FARM: 'FarmuwXPWXvefWUeqFAa5w6rifLkq5X6E8bimYvrhCB1',
  MERCURIAL_STABLE_SWAP: 'MERLuDFBMmsHnsBPZw2sDQZHvXFMwp8EdjudcU2HKky'
};

// Devnet Program IDs (for testing)
const METEORA_DEVNET_PROGRAMS = {
  DLMM: 'LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo', // Same as mainnet for now
  DAMM_V1: 'Eo7WjKq67rjJQSZxS6z3YkapzY3eMj6Xy8X5EQVn5UaB',
  DAMM_V2: 'cpamdpZCGKUy5JxQXB4dcpGPiikHawvSWAd6mEn1sGG',
  DBC: 'dbcij3LWUppWqq96dh6gJWwBifmcGfLSB5D4DuSMaqN',
  ALPHA_VAULT: 'vaU6kP7iNEGkbmPkLmZfGwiGxd4Mob24QQCie5R9kd2',
  STAKE2EARN: 'FEESngU3neckdwib9X3KWqdL7Mjmqk9XNp3uh5JbP4KP',
  VAULT: '24Uqj9JCLxUeoC3hGfh5W3s9FM9uCHDS2SG3LYwBpyTi',
  LOCK: 'LocpQgucEQHbqNABEYvBvwoxCPsSbG91A1QaQhQQqjn',
  DYNAMIC_FEE_SHARING: 'dfsdo2UqvwfN8DuUVrMRNfQe11VaiNoKcMqLHVvDPzh',
  FARM: 'FarmuwXPWXvefWUeqFAa5w6rifLkq5X6E8bimYvrhCB1',
  MERCURIAL_STABLE_SWAP: 'MERLuDFBMmsHnsBPZw2sDQZHvXFMwp8EdjudcU2HKky'
};

class MeteoraService {
  constructor() {
    this.api = axios.create({
      baseURL: METEORA_API_BASE,
      timeout: 10000,
    });
    this.programs = METEORA_PROGRAMS;
    this.devnetPrograms = METEORA_DEVNET_PROGRAMS;
  }

  // Get program ID for specific program type
  getProgramId(programType, isDevnet = false) {
    const programs = isDevnet ? this.devnetPrograms : this.programs;
    return programs[programType] || null;
  }

  // Get all program IDs
  getAllProgramIds(isDevnet = false) {
    return isDevnet ? this.devnetPrograms : this.programs;
  }

  // Get all pools
  async getPools() {
    try {
      const response = await this.api.get('/pools');
      return response.data;
    } catch (error) {
      console.error('Error fetching Meteora pools:', error);
      throw error;
    }
  }

  // Get pool details by address
  async getPoolDetails(poolAddress) {
    try {
      const response = await this.api.get(`/pools/${poolAddress}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching pool details:', error);
      throw error;
    }
  }

  // Get DLMM pools
  async getDLMMPools() {
    try {
      const response = await this.api.get('/pools/dlmm');
      return response.data;
    } catch (error) {
      console.error('Error fetching DLMM pools:', error);
      throw error;
    }
  }

  // Get DAMM V1 pools
  async getDAMMV1Pools() {
    try {
      const response = await this.api.get('/pools/damm-v1');
      return response.data;
    } catch (error) {
      console.error('Error fetching DAMM V1 pools:', error);
      throw error;
    }
  }

  // Get DAMM V2 pools
  async getDAMMV2Pools() {
    try {
      const response = await this.api.get('/pools/damm-v2');
      return response.data;
    } catch (error) {
      console.error('Error fetching DAMM V2 pools:', error);
      throw error;
    }
  }

  // Get DBC pools (Dynamic Bonding Curve)
  async getDBCPools() {
    try {
      const response = await this.api.get('/pools/dbc');
      return response.data;
    } catch (error) {
      console.error('Error fetching DBC pools:', error);
      throw error;
    }
  }

  // Get Alpha Vault pools
  async getAlphaVaultPools() {
    try {
      const response = await this.api.get('/pools/alpha-vault');
      return response.data;
    } catch (error) {
      console.error('Error fetching Alpha Vault pools:', error);
      throw error;
    }
  }

  // Get Stake2Earn pools
  async getStake2EarnPools() {
    try {
      const response = await this.api.get('/pools/stake2earn');
      return response.data;
    } catch (error) {
      console.error('Error fetching Stake2Earn pools:', error);
      throw error;
    }
  }

  // Get Dynamic Vault pools
  async getDynamicVaultPools() {
    try {
      const response = await this.api.get('/pools/dynamic-vault');
      return response.data;
    } catch (error) {
      console.error('Error fetching Dynamic Vault pools:', error);
      throw error;
    }
  }

  // Get pool analytics
  async getPoolAnalytics(poolAddress) {
    try {
      const response = await this.api.get(`/pools/${poolAddress}/analytics`);
      return response.data;
    } catch (error) {
      console.error('Error fetching pool analytics:', error);
      throw error;
    }
  }

  // Get user positions
  async getUserPositions(walletAddress) {
    try {
      const response = await this.api.get(`/positions/${walletAddress}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user positions:', error);
      throw error;
    }
  }

  // Get user stakes (Stake2Earn)
  async getUserStakes(walletAddress) {
    try {
      const response = await this.api.get(`/stakes/${walletAddress}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user stakes:', error);
      throw error;
    }
  }

  // Get fee rewards for user
  async getUserFeeRewards(walletAddress) {
    try {
      const response = await this.api.get(`/rewards/${walletAddress}/fees`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user fee rewards:', error);
      throw error;
    }
  }

  // Create pool (placeholder for future implementation)
  async createPool(poolData) {
    try {
      const response = await this.api.post('/pools/create', poolData);
      return response.data;
    } catch (error) {
      console.error('Error creating pool:', error);
      throw error;
    }
  }

  // Join pool
  async joinPool(poolAddress, joinData) {
    try {
      const response = await this.api.post(`/pools/${poolAddress}/join`, joinData);
      return response.data;
    } catch (error) {
      console.error('Error joining pool:', error);
      throw error;
    }
  }

  // Stake tokens (Stake2Earn)
  async stakeTokens(poolAddress, stakeData) {
    try {
      const response = await this.api.post(`/pools/${poolAddress}/stake`, stakeData);
      return response.data;
    } catch (error) {
      console.error('Error staking tokens:', error);
      throw error;
    }
  }

  // Unstake tokens (Stake2Earn)
  async unstakeTokens(poolAddress, unstakeData) {
    try {
      const response = await this.api.post(`/pools/${poolAddress}/unstake`, unstakeData);
      return response.data;
    } catch (error) {
      console.error('Error unstaking tokens:', error);
      throw error;
    }
  }

  // Claim fee rewards
  async claimFeeRewards(poolAddress, claimData) {
    try {
      const response = await this.api.post(`/pools/${poolAddress}/claim-rewards`, claimData);
      return response.data;
    } catch (error) {
      console.error('Error claiming fee rewards:', error);
      throw error;
    }
  }

  // Get dynamic fee sharing info
  async getDynamicFeeSharing(poolAddress) {
    try {
      const response = await this.api.get(`/pools/${poolAddress}/fee-sharing`);
      return response.data;
    } catch (error) {
      console.error('Error fetching dynamic fee sharing:', error);
      throw error;
    }
  }

  // Get lock information
  async getLockInfo(lockAddress) {
    try {
      const response = await this.api.get(`/locks/${lockAddress}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching lock info:', error);
      throw error;
    }
  }

  // Get farm information
  async getFarmInfo(farmAddress) {
    try {
      const response = await this.api.get(`/farms/${farmAddress}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching farm info:', error);
      throw error;
    }
  }
}

export default new MeteoraService(); 