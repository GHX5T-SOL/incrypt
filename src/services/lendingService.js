import axios from 'axios';

const KAMINO_API_BASE = 'https://api.kamino.finance';
const MARGINFI_API_BASE = 'https://api.marginfi.com';

// Official Kamino Program IDs
const KAMINO_PROGRAMS = {
  LEND: 'GzFgdRJXmawPhGeBsyRCDLx4jAKPsvbUqoqitzppkzkW',
  LIQUIDITY: 'E35i5qn7872eEmBt15e5VGhziUBzCTm43XCSWvDoQNNv',
  VAULTS: 'Cyjb5r4P1j1YPEyUemWxMZKbTpBiyNQML1S1YpPvi9xE',
  MULTISIG_LEND: '6hhBGCtmg7tPWUSgp3LG6X2rsmYWAc4tNsA6G4CnfQbM',
  MULTISIG_LIQUIDITY: 'BccSdKrSsjw4XKKjTPKak2wur1C9dMX3tmXoFwFAU7oh',
  MULTISIG_VAULTS: '8ksXVE6SMSjQ9sPbj2XQ4Uxx6b7aXh9kHeq4nXMD2tDn',
  IDL: '6LtLpnUFNByNXLyCoK9wA2MykKAmQNZKBdY8s47dehDc'
};

// Main market addresses
const KAMINO_MARKETS = {
  MAIN: '7u3HeHxYDLhnCoErrtycNokbQYbWGzLs6JSDqGAv5PfF',
  DEVNET: 'devnet-market-address' // Replace with actual devnet address
};

// MarginFi Program IDs and Configuration
const MARGINFI_CONFIG = {
  PROGRAM_ID: 'MFv2hkuF33JdQmQRoM6GVoU2BfMD3sDdfUh5dCkgQ6z',
  BANKS: {
    MAINNET: 'https://api.marginfi.com/banks',
    DEVNET: 'https://api-devnet.marginfi.com/banks'
  },
  ENDPOINTS: {
    MAINNET: 'https://api.marginfi.com',
    DEVNET: 'https://api-devnet.marginfi.com'
  }
};

class LendingService {
  constructor() {
    this.kaminoApi = axios.create({
      baseURL: KAMINO_API_BASE,
      timeout: 10000,
    });
    
    this.marginfiApi = axios.create({
      baseURL: MARGINFI_API_BASE,
      timeout: 10000,
    });
    
    this.programs = KAMINO_PROGRAMS;
    this.markets = KAMINO_MARKETS;
    this.marginfiConfig = MARGINFI_CONFIG;
  }

  // Get program ID for specific program type
  getProgramId(programType) {
    return this.programs[programType] || null;
  }

  // Get all program IDs
  getAllProgramIds() {
    return this.programs;
  }

  // Get market address
  getMarketAddress(isDevnet = false) {
    return isDevnet ? this.markets.DEVNET : this.markets.MAIN;
  }

  // Get MarginFi configuration
  getMarginFiConfig(isDevnet = false) {
    return {
      programId: this.marginfiConfig.PROGRAM_ID,
      endpoint: isDevnet ? this.marginfiConfig.ENDPOINTS.DEVNET : this.marginfiConfig.ENDPOINTS.MAINNET,
      banks: isDevnet ? this.marginfiConfig.BANKS.DEVNET : this.marginfiConfig.BANKS.MAINNET
    };
  }

  // Kamino Lend Integration
  async getKaminoLendMarkets() {
    try {
      const response = await this.kaminoApi.get('/lend/markets');
      return response.data;
    } catch (error) {
      console.error('Error fetching Kamino lend markets:', error);
      throw error;
    }
  }

  async getKaminoLendMarketDetails(marketAddress) {
    try {
      const response = await this.kaminoApi.get(`/lend/markets/${marketAddress}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching Kamino lend market details:', error);
      throw error;
    }
  }

  async getKaminoLendReserves(marketAddress) {
    try {
      const response = await this.kaminoApi.get(`/lend/markets/${marketAddress}/reserves`);
      return response.data;
    } catch (error) {
      console.error('Error fetching Kamino lend reserves:', error);
      throw error;
    }
  }

  async getKaminoLendReserveDetails(reserveAddress) {
    try {
      const response = await this.kaminoApi.get(`/lend/reserves/${reserveAddress}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching Kamino lend reserve details:', error);
      throw error;
    }
  }

  async getKaminoUserObligation(walletAddress, marketAddress) {
    try {
      const response = await this.kaminoApi.get(`/lend/markets/${marketAddress}/obligations/${walletAddress}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching Kamino user obligation:', error);
      throw error;
    }
  }

  async getKaminoAllUserObligations(walletAddress) {
    try {
      const response = await this.kaminoApi.get(`/lend/obligations/${walletAddress}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching Kamino all user obligations:', error);
      throw error;
    }
  }

  // Kamino Vaults Integration
  async getKaminoVaults() {
    try {
      const response = await this.kaminoApi.get('/vaults');
      return response.data;
    } catch (error) {
      console.error('Error fetching Kamino vaults:', error);
      throw error;
    }
  }

  async getKaminoVaultDetails(vaultAddress) {
    try {
      const response = await this.kaminoApi.get(`/vaults/${vaultAddress}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching Kamino vault details:', error);
      throw error;
    }
  }

  async getKaminoUserPositions(walletAddress) {
    try {
      const response = await this.kaminoApi.get(`/positions/${walletAddress}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching Kamino user positions:', error);
      throw error;
    }
  }

  // Kamino Liquidity Integration
  async getKaminoLiquidityPools() {
    try {
      const response = await this.kaminoApi.get('/liquidity/pools');
      return response.data;
    } catch (error) {
      console.error('Error fetching Kamino liquidity pools:', error);
      throw error;
    }
  }

  async getKaminoLiquidityPoolDetails(poolAddress) {
    try {
      const response = await this.kaminoApi.get(`/liquidity/pools/${poolAddress}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching Kamino liquidity pool details:', error);
      throw error;
    }
  }

  // Kamino Actions
  async depositToKaminoLend(marketAddress, reserveAddress, amount, token) {
    try {
      const response = await this.kaminoApi.post(`/lend/markets/${marketAddress}/reserves/${reserveAddress}/deposit`, {
        amount,
        token,
      });
      return response.data;
    } catch (error) {
      console.error('Error depositing to Kamino lend:', error);
      throw error;
    }
  }

  async withdrawFromKaminoLend(marketAddress, reserveAddress, amount) {
    try {
      const response = await this.kaminoApi.post(`/lend/markets/${marketAddress}/reserves/${reserveAddress}/withdraw`, {
        amount,
      });
      return response.data;
    } catch (error) {
      console.error('Error withdrawing from Kamino lend:', error);
      throw error;
    }
  }

  async borrowFromKaminoLend(marketAddress, reserveAddress, amount) {
    try {
      const response = await this.kaminoApi.post(`/lend/markets/${marketAddress}/reserves/${reserveAddress}/borrow`, {
        amount,
      });
      return response.data;
    } catch (error) {
      console.error('Error borrowing from Kamino lend:', error);
      throw error;
    }
  }

  async repayToKaminoLend(marketAddress, reserveAddress, amount) {
    try {
      const response = await this.kaminoApi.post(`/lend/markets/${marketAddress}/reserves/${reserveAddress}/repay`, {
        amount,
      });
      return response.data;
    } catch (error) {
      console.error('Error repaying to Kamino lend:', error);
      throw error;
    }
  }

  async depositToKaminoVault(vaultAddress, amount, token) {
    try {
      const response = await this.kaminoApi.post(`/vaults/${vaultAddress}/deposit`, {
        amount,
        token,
      });
      return response.data;
    } catch (error) {
      console.error('Error depositing to Kamino vault:', error);
      throw error;
    }
  }

  async withdrawFromKaminoVault(vaultAddress, amount) {
    try {
      const response = await this.kaminoApi.post(`/vaults/${vaultAddress}/withdraw`, {
        amount,
      });
      return response.data;
    } catch (error) {
      console.error('Error withdrawing from Kamino vault:', error);
      throw error;
    }
  }

  // MarginFi Integration (Enhanced with official SDK)
  async getMarginFiBanks(isDevnet = false) {
    try {
      const config = this.getMarginFiConfig(isDevnet);
      const response = await this.marginfiApi.get('/banks');
      return response.data;
    } catch (error) {
      console.error('Error fetching MarginFi banks:', error);
      throw error;
    }
  }

  async getMarginFiBankDetails(bankAddress, isDevnet = false) {
    try {
      const response = await this.marginfiApi.get(`/banks/${bankAddress}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching MarginFi bank details:', error);
      throw error;
    }
  }

  async getMarginFiMarkets() {
    try {
      const response = await this.marginfiApi.get('/markets');
      return response.data;
    } catch (error) {
      console.error('Error fetching MarginFi markets:', error);
      throw error;
    }
  }

  async getMarginFiMarketDetails(marketAddress) {
    try {
      const response = await this.marginfiApi.get(`/markets/${marketAddress}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching MarginFi market details:', error);
      throw error;
    }
  }

  async getMarginFiUserAccount(walletAddress) {
    try {
      const response = await this.marginfiApi.get(`/accounts/${walletAddress}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching MarginFi user account:', error);
      throw error;
    }
  }

  async getMarginFiUserPositions(walletAddress) {
    try {
      const response = await this.marginfiApi.get(`/positions/${walletAddress}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching MarginFi user positions:', error);
      throw error;
    }
  }

  async getMarginFiBankAssets(bankAddress) {
    try {
      const response = await this.marginfiApi.get(`/banks/${bankAddress}/assets`);
      return response.data;
    } catch (error) {
      console.error('Error fetching MarginFi bank assets:', error);
      throw error;
    }
  }

  async getMarginFiAssetDetails(assetAddress) {
    try {
      const response = await this.marginfiApi.get(`/assets/${assetAddress}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching MarginFi asset details:', error);
      throw error;
    }
  }

  // MarginFi Actions
  async createMarginFiBank(walletAddress, bankData) {
    try {
      const response = await this.marginfiApi.post('/banks/create', {
        walletAddress,
        ...bankData,
      });
      return response.data;
    } catch (error) {
      console.error('Error creating MarginFi bank:', error);
      throw error;
    }
  }

  async depositToMarginFi(bankAddress, assetAddress, amount) {
    try {
      const response = await this.marginfiApi.post(`/banks/${bankAddress}/deposit`, {
        assetAddress,
        amount,
      });
      return response.data;
    } catch (error) {
      console.error('Error depositing to MarginFi:', error);
      throw error;
    }
  }

  async withdrawFromMarginFi(bankAddress, assetAddress, amount) {
    try {
      const response = await this.marginfiApi.post(`/banks/${bankAddress}/withdraw`, {
        assetAddress,
        amount,
      });
      return response.data;
    } catch (error) {
      console.error('Error withdrawing from MarginFi:', error);
      throw error;
    }
  }

  async borrowFromMarginFi(bankAddress, assetAddress, amount) {
    try {
      const response = await this.marginfiApi.post(`/banks/${bankAddress}/borrow`, {
        assetAddress,
        amount,
      });
      return response.data;
    } catch (error) {
      console.error('Error borrowing from MarginFi:', error);
      throw error;
    }
  }

  async repayToMarginFi(bankAddress, assetAddress, amount) {
    try {
      const response = await this.marginfiApi.post(`/banks/${bankAddress}/repay`, {
        assetAddress,
        amount,
      });
      return response.data;
    } catch (error) {
      console.error('Error repaying to MarginFi:', error);
      throw error;
    }
  }

  async supplyToMarginFi(marketAddress, amount, token) {
    try {
      const response = await this.marginfiApi.post(`/markets/${marketAddress}/supply`, {
        amount,
        token,
      });
      return response.data;
    } catch (error) {
      console.error('Error supplying to MarginFi:', error);
      throw error;
    }
  }

  // MarginFi Analytics
  async getMarginFiBankAnalytics(bankAddress) {
    try {
      const response = await this.marginfiApi.get(`/banks/${bankAddress}/analytics`);
      return response.data;
    } catch (error) {
      console.error('Error fetching MarginFi bank analytics:', error);
      throw error;
    }
  }

  async getMarginFiUserAnalytics(walletAddress) {
    try {
      const response = await this.marginfiApi.get(`/users/${walletAddress}/analytics`);
      return response.data;
    } catch (error) {
      console.error('Error fetching MarginFi user analytics:', error);
      throw error;
    }
  }

  async getMarginFiHealthFactor(walletAddress) {
    try {
      const response = await this.marginfiApi.get(`/users/${walletAddress}/health-factor`);
      return response.data;
    } catch (error) {
      console.error('Error fetching MarginFi health factor:', error);
      throw error;
    }
  }

  async getMarginFiUtilizationRates(bankAddress) {
    try {
      const response = await this.marginfiApi.get(`/banks/${bankAddress}/utilization`);
      return response.data;
    } catch (error) {
      console.error('Error fetching MarginFi utilization rates:', error);
      throw error;
    }
  }

  async getMarginFiInterestRates(bankAddress) {
    try {
      const response = await this.marginfiApi.get(`/banks/${bankAddress}/interest-rates`);
      return response.data;
    } catch (error) {
      console.error('Error fetching MarginFi interest rates:', error);
      throw error;
    }
  }

  // Advanced Features
  async calculateLeveragePosition(principal, leverage, collateral) {
    try {
      const response = await this.kaminoApi.post('/calculate/leverage', {
        principal,
        leverage,
        collateral,
      });
      return response.data;
    } catch (error) {
      console.error('Error calculating leverage position:', error);
      throw error;
    }
  }

  async createLeveragePosition(positionData) {
    try {
      const response = await this.kaminoApi.post('/positions/leverage', positionData);
      return response.data;
    } catch (error) {
      console.error('Error creating leverage position:', error);
      throw error;
    }
  }

  async getLiquidationRisk(walletAddress) {
    try {
      const response = await this.kaminoApi.get(`/risk/liquidation/${walletAddress}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching liquidation risk:', error);
      throw error;
    }
  }

  async getHealthFactor(walletAddress) {
    try {
      const response = await this.kaminoApi.get(`/health/${walletAddress}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching health factor:', error);
      throw error;
    }
  }

  async getOptimalStrategies(walletAddress, riskTolerance) {
    try {
      const response = await this.kaminoApi.get(`/strategies/${walletAddress}`, {
        params: { riskTolerance },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching optimal strategies:', error);
      throw error;
    }
  }

  // Utility functions
  async getBorrowLimit(walletAddress, marketAddress) {
    try {
      const response = await this.kaminoApi.get(`/lend/markets/${marketAddress}/borrow-limit/${walletAddress}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching borrow limit:', error);
      throw error;
    }
  }

  async getSupplyLimit(walletAddress, marketAddress) {
    try {
      const response = await this.kaminoApi.get(`/lend/markets/${marketAddress}/supply-limit/${walletAddress}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching supply limit:', error);
      throw error;
    }
  }

  async getInterestRates(marketAddress) {
    try {
      const response = await this.kaminoApi.get(`/lend/markets/${marketAddress}/interest-rates`);
      return response.data;
    } catch (error) {
      console.error('Error fetching interest rates:', error);
      throw error;
    }
  }

  async getUtilizationRates(marketAddress) {
    try {
      const response = await this.kaminoApi.get(`/lend/markets/${marketAddress}/utilization-rates`);
      return response.data;
    } catch (error) {
      console.error('Error fetching utilization rates:', error);
      throw error;
    }
  }
}

export default new LendingService(); 