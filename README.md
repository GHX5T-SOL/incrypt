<div align="center">
  <img src="https://i.ibb.co/qLdSqrMR/logo-primary.png" alt="Incrypt Logo" width="200"/>
  
  # Incrypt
  
  **Mobile DeFi Hub with AI Intelligence for Solana**
  
  [![React Native](https://img.shields.io/badge/React%20Native-0.73-blue.svg)](https://reactnative.dev/)
  [![Expo](https://img.shields.io/badge/Expo-49.0.0-black.svg)](https://expo.dev/)
  [![Solana](https://img.shields.io/badge/Solana-1.98.4-purple.svg)](https://solana.com/)
  [![License](https://img.shields.io/badge/License-CC%20BY--NC%204.0-red.svg)](LICENSE.md)
  
  *The ultimate mobile DeFi experience on Solana*
</div>

---

## 🚀 **About Incrypt**

Incrypt is a comprehensive mobile DeFi application built for the Solana blockchain, designed to provide users with seamless access to liquidity farming, lending, borrowing, and token safety analysis - all from their mobile device and using AI Intelligence to build De-fi Yield Strategies

### 🤖 **IncryptAI - Your AI DeFi Companion**

IncryptAI is the revolutionary AI-powered feature that transforms how you interact with DeFi on Solana. Powered by advanced AI technology, IncryptAI provides:

**🎯 Core Capabilities:**
- **Yield Strategy Optimization** - Get personalized recommendations for Meteora DLMM/DAMM strategies with real-time APR calculations and risk assessments
- **Leveraged Farming Design** - Create complex strategies combining Kamino lending with Meteora liquidity provision for maximum yield
- **Token Safety Analysis** - Instantly analyze any token using Rugcheck and DexScreener data for comprehensive risk assessment
- **Market Intelligence** - Receive real-time insights on Solana DeFi trends, opportunities, and emerging protocols
- **Strategy Building** - Step-by-step guides for complex DeFi operations with cyberpunk-themed explanations

**💡 How It Works:**
- **Natural Language Interface** - Ask questions in plain English like "What's the best yield strategy for SOL-USDC on Meteora?"
- **Real-time Data Integration** - AI pulls live data from Meteora, Kamino, MarginFi, Rugcheck, and DexScreener
- **Personalized Responses** - Get tailored advice based on your risk tolerance and investment goals
- **Actionable Insights** - Receive specific, implementable strategies with clear steps and risk warnings

**🔒 Security & Compliance:**
- **No Financial Advice** - All responses include appropriate disclaimers
- **DYOR Emphasis** - Always encourages users to do their own research
- **Risk Warnings** - Comprehensive risk disclosures for all strategies
- **Privacy First** - No sensitive data stored in chat history

**🎨 Cyberpunk Aesthetic:**
- **Neon Glow Effects** - Stunning visual feedback with animated neon borders
- **Dark Theme** - Easy on the eyes with high contrast readability
- **Markdown Support** - Rich formatting for strategies, code blocks, and lists
- **Responsive Design** - Optimized for mobile with keyboard-avoiding views

IncryptAI represents the future of DeFi interaction - combining the power of artificial intelligence with the cutting-edge protocols of Solana to create an unparalleled user experience.

### 🎯 **Built for Solana Mobile Hackathon**

This project is specifically designed for the Solana Seeker and Solana Dapp Store, but is compatible with all Android devices, iOS and Desktop, leveraging the full power of the **Solana Mobile Stack (SMS)** and **Mobile Wallet Adapter (MWA)** to create the most advanced mobile DeFi experience on Solana.

---

## 🔗 **Protocol Integrations**

### **Meteora Protocol**
- **DLMM Pools** - Dynamic Liquidity Market Maker
- **DAMM V1/V2** - Dynamic Automatic Market Maker
- **DBC** - Dynamic Bonding Curve
- **Alpha Vault** - Advanced yield optimization
- **Stake2Earn** - Earn rewards through staking
- **Program IDs**: All official Meteora program IDs integrated
- **SDK Integration**: Direct blockchain interaction via Meteora SDK

### **Kamino Finance**
- **Lend Markets** - Supply and borrow assets
- **Vaults** - Advanced yield strategies
- **Liquidity Pools** - Automated market making
- **Program ID**: `GzFgdRJXmawPhGeBsyRCDLx4jAKPsvbUqoqitzppkzkW`
- **SDK Version**: `@kamino-finance/klend-sdk@7.0.6`

### **MarginFi**
- **Bank-based Lending** - Traditional lending markets
- **Market-based Lending** - Advanced lending strategies
- **Program ID**: Official MarginFi program IDs
- **SDK**: `@mrgnlabs/marginfi-client-v2@1.0.0`

### **Rugcheck API**
- **Token Safety Analysis** - Comprehensive risk assessment
- **Honeypot Detection** - Identify malicious tokens
- **Liquidity Analysis** - Check liquidity depth and locks
- **Contract Verification** - Verify smart contract authenticity
- **Rate Limits**: 10 reports/min (unauthenticated), 60 reports/min (authenticated)
- **Authentication**: Optional Solana wallet signing for higher limits

### **DexScreener API**
- **Real-time DEX Data** - Multi-chain DEX analytics
- **Token Profiles** - Comprehensive token information
- **Market Trends** - Trending tokens and market insights
- **Price Data** - Real-time price feeds

### **CoinGecko API**
- **Price Data** - Real-time cryptocurrency prices
- **Market Cap** - Token market capitalization
- **Trading Volume** - 24h trading volume data
- **API Key**: Configured and ready

### **Jupiter API**
- **Swap Routing** - Best swap routes across DEXs
- **Price Quotes** - Real-time price quotes
- **Token Lists** - Comprehensive token database
- **API Key**: Configured and ready

---

## 📱 **Solana Mobile Stack Integration**

### **Mobile Wallet Adapter (MWA)**
```javascript
import { MobileWalletAdapterProvider } from '@solana-mobile/wallet-adapter-mobile';

const APP_IDENTITY = {
  name: 'Incrypt',
  uri: 'https://incrypt.network',
  icon: 'https://incrypt.network/icon.png',
};
```

### **Key SMS Features**
- ✅ **Wallet Selection** - Connect to Phantom, Backpack, and other Solana wallets
- ✅ **Transaction Signing** - Secure transaction signing through mobile wallets
- ✅ **Session Management** - Persistent wallet connections
- ✅ **Deep Linking** - Seamless app-to-wallet communication
- ✅ **Biometric Authentication** - Enhanced security with device biometrics

---

## 🏗️ **Architecture**

### **Tech Stack**
- **Frontend**: React Native with Expo
- **Blockchain**: Solana Web3.js
- **Wallet**: Solana Mobile Stack (MWA)
- **UI**: Custom neon theme with React Native Reanimated
- **State Management**: React Context + Custom Hooks
- **Testing**: Jest + React Native Testing Library
- **Build**: Expo EAS Build

### **Project Structure**
```
incrypt/
├── src/
│   ├── components/          # Reusable UI components
│   ├── contexts/           # React Context providers
│   ├── hooks/             # Custom React hooks
│   ├── navigation/        # Navigation configuration
│   ├── screens/          # App screens
│   ├── services/         # API services
│   ├── theme/           # Theme configuration
│   └── utils/           # Utility functions
├── assets/              # App icons and logos
├── __tests__/          # Test files
└── docs/              # Documentation
```

---

## 🚀 **Getting Started**

### **Prerequisites**
- Node.js 18+ 
- npm or yarn
- Expo CLI
- Solana wallet (Phantom, Backpack, etc.)

### **Installation**
1. **Clone the repository**
   ```bash
   git clone https://github.com/GHX5T-SOL/incrypt.git
   cd incrypt
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npx expo start
   ```

---

## 📱 **Features Overview**

### **🎯 Dashboard**
- Real-time portfolio overview
- Quick actions for common DeFi operations
- Featured pools and lending opportunities
- Safety scores and risk assessment

### **🌊 Liquidity Farming (Meteora)**
- **DLMM Pools** - Dynamic Liquidity Market Maker
- **DAMM V1/V2** - Dynamic Automatic Market Maker
- **DBC** - Dynamic Bonding Curve
- **Alpha Vault** - Advanced yield optimization
- **Stake2Earn** - Earn rewards through staking

### **💰 DeFi Lending**
- **Kamino Finance** - Lend, borrow, and earn
- **MarginFi** - Bank-based and market-based lending
- **Health Factor Monitoring** - Real-time risk assessment
- **APY Optimization** - Maximize your yields

### **🛡️ Token Safety**
- **Rugcheck Integration** - Comprehensive token analysis
- **Honeypot Detection** - Identify malicious tokens
- **Liquidity Analysis** - Check liquidity depth
- **Contract Verification** - Verify smart contract authenticity
- **Risk Assessment** - Multi-factor risk evaluation

### **🤖 IncryptAI**
- **AI-Powered Chat Interface** - Natural language DeFi assistance
- **Yield Strategy Optimization** - Personalized Meteora recommendations
- **Token Safety Analysis** - Instant risk assessment via AI
- **Leveraged Farming Design** - Complex strategy creation
- **Market Intelligence** - Real-time DeFi insights and trends

### **🔒 Security Features**
- **Biometric Authentication** - Enhanced security
- **Transaction Confirmation** - Double-check all transactions
- **Risk Warnings** - Real-time risk alerts
- **Emergency Lockdown** - Quick security measures

---

## 🧪 **Testing**

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

---

## 📦 **Building for Production**

### **Development Build**
```bash
npx eas build --profile development --platform android
```

### **Production Build**
```bash
npx eas build --profile production --platform android
```

### **Preview Build**
```bash
npx eas build --profile preview --platform android
```

---

## 🔧 **Development**

### **Available Scripts**
```bash
npm start          # Start Expo development server
npm run android    # Run on Android
npm run ios        # Run on iOS
npm run web        # Run on web
npm test           # Run tests
npm run lint       # Run ESLint
npm run type-check # Run TypeScript check
```

### **Code Quality**
- **ESLint** - Code linting and formatting
- **Prettier** - Code formatting
- **Jest** - Unit and integration testing
- **TypeScript** - Type safety (optional)

---

## 📊 **Performance**

- **Bundle Size**: Optimized for mobile
- **Startup Time**: < 3 seconds
- **Memory Usage**: Efficient memory management
- **Battery Life**: Optimized for mobile devices

---

## 🔒 **Security**

- **Wallet Security**: Solana Mobile Stack integration
- **API Security**: Secure API key management
- **Transaction Security**: Multi-layer transaction verification
- **Data Privacy**: Local storage with encryption

---

## 🌐 **Deployment**

### **Expo EAS Build**
The app is configured for [Expo EAS Build](https://docs.expo.dev/build/introduction/) with three profiles:

- **Development**: For testing and development
- **Preview**: For internal testing
- **Production**: For app store release

---

## 🤝 **Contributing**

This project is licensed under **CC BY-NC 4.0** - see [LICENSE.md](LICENSE.md) for details.

**⚠️ Commercial Use Prohibited**: Commercial use is strictly prohibited without explicit permission.

---

## 📞 **Support**

- **Email**: incryptinvestments@protonmail.com
- **Documentation**: [Project Wiki](https://github.com/GHX5T-SOL/incrypt/wiki)
- **Issues**: [GitHub Issues](https://github.com/GHX5T-SOL/incrypt/issues)

---

## 🙏 **Acknowledgments**

- **Solana Mobile Team** - For the incredible Solana Mobile Stack
- **Meteora** - For the comprehensive DeFi protocol suite
- **Kamino Finance** - For the advanced lending platform
- **MarginFi** - For the innovative lending solutions
- **Rugcheck** - For the token safety analysis tools
- **DexScreener** - For comprehensive DEX data
- **CoinGecko** - For reliable price data
- **Jupiter** - For efficient swap routing
- **Codigo AI** - For a Solana Focused IDE

---

## 📄 **License**

This project is licensed under the **Creative Commons Attribution-NonCommercial 4.0 International License** - see [LICENSE.md](LICENSE.md) for details.

**Copyright © 2025 Incrypt. All rights reserved.**

---

<div align="center">
  <p><strong>Built with ❤️ for the Solana Mobile Hackathon</strong></p>
  <p>🚀 <a href="https://solanamobile.radiant.nexus">Solana Mobile Hackathon</a> | 📱 <a href="https://docs.solanamobile.com/developers/overview">Solana Mobile Stack</a></p>
</div>
