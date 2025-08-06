import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useWallet } from '../hooks/useWallet';
import { useLending } from '../hooks/useLending';
import { theme } from '../theme';
import NeonCard from '../components/NeonCard';
import NeonButton from '../components/NeonButton';
import { formatUSD, formatPercentage, formatNumber } from '../utils/format';

const LendingStrategiesScreen = () => {
  let navigation;
  try {
    navigation = useNavigation();
  } catch (error) {
    console.log('Navigation not available in LendingStrategiesScreen, using fallback');
    navigation = {
      navigate: () => console.log('Navigation not available'),
      goBack: () => console.log('Navigation not available'),
    };
  }
  
  let walletData = { connected: false, balance: 0 };
  try {
    walletData = useWallet();
  } catch (error) {
    console.log('Wallet hook not available in LendingStrategiesScreen, using fallback');
  }
  
  let lendingData = { userPositions: [], getHealthFactor: () => 0, getNetAPY: () => 0 };
  try {
    lendingData = useLending();
  } catch (error) {
    console.log('Lending hook not available in LendingStrategiesScreen, using fallback');
  }
  
  const { connected, balance } = walletData;
  const { userPositions, getHealthFactor, getNetAPY } = lendingData;
  
  const [selectedStrategy, setSelectedStrategy] = useState(null);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    startFadeAnimation();
  }, []);

  const startFadeAnimation = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  };

  const healthFactor = getHealthFactor(userPositions);
  const netAPY = getNetAPY(userPositions);

  const strategies = [
    {
      id: '1',
      name: 'Conservative Yield',
      description: 'Low-risk strategy focusing on stable assets with consistent returns',
      icon: 'shield-check',
      risk: 'low',
      expectedAPY: 4.5,
      minDeposit: 100,
      maxDeposit: 10000,
      features: [
        'Stable assets only (USDC, USDT)',
        'Diversified across protocols',
        'Auto-rebalancing',
        'Liquidation protection'
      ],
      requirements: [
        'Minimum $100 deposit',
        'Stable asset holdings',
        'Conservative risk tolerance'
      ]
    },
    {
      id: '2',
      name: 'Balanced Growth',
      description: 'Moderate risk strategy with mix of stable and volatile assets',
      icon: 'chart-line',
      risk: 'medium',
      expectedAPY: 8.2,
      minDeposit: 500,
      maxDeposit: 50000,
      features: [
        'Mix of stable and volatile assets',
        'Dynamic rebalancing',
        'Yield optimization',
        'Risk management tools'
      ],
      requirements: [
        'Minimum $500 deposit',
        'Mixed asset portfolio',
        'Medium risk tolerance'
      ]
    },
    {
      id: '3',
      name: 'Aggressive Yield',
      description: 'High-risk strategy maximizing returns through leverage and volatile assets',
      icon: 'lightning-bolt',
      risk: 'high',
      expectedAPY: 15.8,
      minDeposit: 1000,
      maxDeposit: 100000,
      features: [
        'High-yield volatile assets',
        'Leverage optimization',
        'Advanced risk management',
        'Real-time monitoring'
      ],
      requirements: [
        'Minimum $1,000 deposit',
        'High risk tolerance',
        'Active portfolio management'
      ]
    },
    {
      id: '4',
      name: 'Delta-Neutral',
      description: 'Market-neutral strategy using hedging to minimize directional risk',
      icon: 'scale-balance',
      risk: 'medium',
      expectedAPY: 6.5,
      minDeposit: 2000,
      maxDeposit: 200000,
      features: [
        'Market-neutral positions',
        'Hedging strategies',
        'Volatility harvesting',
        'Risk-adjusted returns'
      ],
      requirements: [
        'Minimum $2,000 deposit',
        'Understanding of derivatives',
        'Active management capability'
      ]
    }
  ];

  const handleStrategySelect = (strategy) => {
    if (!connected) {
      Alert.alert('Wallet Not Connected', 'Please connect your wallet to use strategies');
      return;
    }

    if (balance < strategy.minDeposit) {
      Alert.alert(
        'Insufficient Balance',
        `This strategy requires a minimum of $${strategy.minDeposit}. Your balance is $${formatUSD(balance)}.`
      );
      return;
    }

    setSelectedStrategy(strategy);
    navigation.navigate('StrategyDetail', { strategyId: strategy.id });
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'low': return theme.colors.success;
      case 'medium': return theme.colors.warning;
      case 'high': return theme.colors.error;
      default: return theme.colors.textSecondary;
    }
  };

  const getRiskLabel = (risk) => {
    switch (risk) {
      case 'low': return 'LOW RISK';
      case 'medium': return 'MEDIUM RISK';
      case 'high': return 'HIGH RISK';
      default: return 'UNKNOWN';
    }
  };

  const renderStrategyCard = (strategy) => (
    <Animated.View
      key={strategy.id}
      style={[
        styles.strategyCard,
        { 
          opacity: fadeAnim,
          transform: [{
            translateY: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [50, 0],
            }),
          }],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.strategyTouchable}
        onPress={() => handleStrategySelect(strategy)}
        activeOpacity={0.7}
      >
        <View style={styles.strategyHeader}>
          <View style={styles.strategyInfo}>
            <View style={[styles.strategyIcon, { backgroundColor: getRiskColor(strategy.risk) + '20' }]}>
              <MaterialCommunityIcons 
                name={strategy.icon} 
                size={24} 
                color={getRiskColor(strategy.risk)} 
              />
            </View>
            <View style={styles.strategyDetails}>
              <Text style={styles.strategyName}>{strategy.name}</Text>
              <Text style={styles.strategyDescription}>{strategy.description}</Text>
            </View>
          </View>
          
          <View style={[styles.riskBadge, { backgroundColor: getRiskColor(strategy.risk) + '20' }]}>
            <Text style={[styles.riskText, { color: getRiskColor(strategy.risk) }]}>
              {getRiskLabel(strategy.risk)}
            </Text>
          </View>
        </View>

        <View style={styles.strategyStats}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Expected APY</Text>
            <Text style={[styles.statValue, { color: theme.colors.success }]}>
              {formatPercentage(strategy.expectedAPY)}
            </Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Min Deposit</Text>
            <Text style={styles.statValue}>{formatUSD(strategy.minDeposit)}</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Max Deposit</Text>
            <Text style={styles.statValue}>{formatUSD(strategy.maxDeposit)}</Text>
          </View>
        </View>

        <View style={styles.strategyFeatures}>
          {strategy.features.slice(0, 2).map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <MaterialCommunityIcons 
                name="check-circle" 
                size={16} 
                color={theme.colors.success} 
              />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <ScrollView style={styles.content}>
        <Animated.View style={[styles.formContainer, { opacity: fadeAnim }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Lending Strategies</Text>
            <Text style={styles.headerSubtitle}>
              Optimize your DeFi lending with advanced strategies
            </Text>
          </View>

          {/* Portfolio Summary */}
          {connected && (
            <NeonCard style={styles.portfolioCard}>
              <Text style={styles.sectionTitle}>Your Portfolio</Text>
              
              <View style={styles.portfolioStats}>
                <View style={styles.portfolioStat}>
                  <Text style={styles.portfolioStatLabel}>Net APY</Text>
                  <Text style={[styles.portfolioStatValue, { color: theme.colors.success }]}>
                    {formatPercentage(netAPY)}
                  </Text>
                </View>
                
                <View style={styles.portfolioStat}>
                  <Text style={styles.portfolioStatLabel}>Health Factor</Text>
                  <Text style={[
                    styles.portfolioStatValue, 
                    { color: healthFactor > 1.5 ? theme.colors.success : theme.colors.warning }
                  ]}>
                    {healthFactor ? healthFactor.toFixed(2) : 'N/A'}
                  </Text>
                </View>
                
                <View style={styles.portfolioStat}>
                  <Text style={styles.portfolioStatLabel}>Positions</Text>
                  <Text style={styles.portfolioStatValue}>
                    {userPositions.length}
                  </Text>
                </View>
              </View>
            </NeonCard>
          )}

          {/* Strategy Categories */}
          <View style={styles.categoriesContainer}>
            <Text style={styles.sectionTitle}>Available Strategies</Text>
            
            {strategies.map(renderStrategyCard)}
          </View>

          {/* Risk Disclaimer */}
          <NeonCard variant="warning" style={styles.disclaimerCard}>
            <Text style={styles.disclaimerTitle}>Risk Disclaimer</Text>
            <Text style={styles.disclaimerText}>
              • All strategies involve risk of loss{'\n'}
              • Past performance does not guarantee future returns{'\n'}
              • APY rates are variable and subject to change{'\n'}
              • Ensure you understand the risks before investing{'\n'}
              • Consider your risk tolerance and investment goals
            </Text>
          </NeonCard>

          {/* Quick Actions */}
          <View style={styles.actionsContainer}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigation.navigate('Lending')}
              >
                <MaterialCommunityIcons 
                  name="bank" 
                  size={24} 
                  color={theme.colors.primary} 
                />
                <Text style={styles.actionButtonText}>View Markets</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigation.navigate('Positions')}
              >
                <MaterialCommunityIcons 
                  name="wallet" 
                  size={24} 
                  color={theme.colors.secondary} 
                />
                <Text style={styles.actionButtonText}>My Positions</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigation.navigate('Analytics')}
              >
                <MaterialCommunityIcons 
                  name="chart-line" 
                  size={24} 
                  color={theme.colors.accent} 
                />
                <Text style={styles.actionButtonText}>Analytics</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Educational Content */}
          <NeonCard style={styles.educationCard}>
            <Text style={styles.sectionTitle}>Strategy Education</Text>
            
            <View style={styles.educationItems}>
              <View style={styles.educationItem}>
                <MaterialCommunityIcons 
                  name="school" 
                  size={20} 
                  color={theme.colors.primary} 
                />
                <Text style={styles.educationText}>
                  Learn about different DeFi lending strategies and their risks
                </Text>
              </View>
              
              <View style={styles.educationItem}>
                <MaterialCommunityIcons 
                  name="calculator" 
                  size={20} 
                  color={theme.colors.secondary} 
                />
                <Text style={styles.educationText}>
                  Use our yield calculator to estimate potential returns
                </Text>
              </View>
              
              <View style={styles.educationItem}>
                <MaterialCommunityIcons 
                  name="shield-check" 
                  size={20} 
                  color={theme.colors.success} 
                />
                <Text style={styles.educationText}>
                  Understand risk management and safety best practices
                </Text>
              </View>
            </View>
          </NeonCard>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
  },
  formContainer: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    lineHeight: 22,
  },
  portfolioCard: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 16,
  },
  portfolioStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  portfolioStat: {
    alignItems: 'center',
    flex: 1,
  },
  portfolioStatLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  portfolioStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  categoriesContainer: {
    marginBottom: 24,
  },
  strategyCard: {
    marginBottom: 16,
  },
  strategyTouchable: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.outline,
  },
  strategyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  strategyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  strategyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  strategyDetails: {
    flex: 1,
  },
  strategyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  strategyDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  riskBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  riskText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  strategyStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  strategyFeatures: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  featureText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginLeft: 4,
  },
  disclaimerCard: {
    marginBottom: 24,
  },
  disclaimerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 12,
  },
  disclaimerText: {
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 20,
  },
  actionsContainer: {
    marginBottom: 24,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.outline,
    marginHorizontal: 4,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: 8,
    textAlign: 'center',
  },
  educationCard: {
    marginBottom: 16,
  },
  educationItems: {
    marginBottom: 8,
  },
  educationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  educationText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
});

export default LendingStrategiesScreen; 