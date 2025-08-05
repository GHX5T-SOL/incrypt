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
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useWallet } from '../hooks/useWallet';
import { useMeteora } from '../hooks/useMeteora';
import { theme } from '../theme';
import NeonCard from '../components/NeonCard';
import NeonButton from '../components/NeonButton';
import { formatUSD, formatPercentage, formatNumber, getSafetyColor } from '../utils/format';

const { width } = Dimensions.get('window');

const PoolDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { poolId } = route.params;
  const { connected, balance } = useWallet();
  const { pools, joinPool, loading } = useMeteora();
  
  const [pool, setPool] = useState(null);
  const [joining, setJoining] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    startFadeAnimation();
    findPool();
  }, [poolId, pools]);

  const startFadeAnimation = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  };

  const findPool = () => {
    const foundPool = pools.find(p => p.id === poolId || p.address === poolId);
    if (foundPool) {
      setPool(foundPool);
    } else {
      // Mock pool data for demonstration
      setPool({
        id: poolId,
        name: 'SOL-USDC',
        type: 'DLMM',
        tokenA: 'SOL',
        tokenB: 'USDC',
        tvl: 42500000,
        apr: 18.2,
        volume24h: 3800000,
        fees24h: 12000,
        binSize: 10,
        safetyScore: 95,
        description: 'High-yield SOL-USDC liquidity pool with concentrated liquidity.',
        features: [
          'Concentrated liquidity',
          'Dynamic fee adjustment',
          'Auto-compounding rewards',
          'Low impermanent loss'
        ],
        risks: [
          'Market volatility',
          'Impermanent loss',
          'Smart contract risk'
        ],
        chartData: [
          { time: '1D', apr: 18.2, tvl: 42500000 },
          { time: '7D', apr: 17.8, tvl: 41800000 },
          { time: '30D', apr: 16.5, tvl: 39500000 },
        ]
      });
    }
  };

  const handleJoinPool = () => {
    if (!connected) {
      Alert.alert('Wallet Not Connected', 'Please connect your wallet to join this pool');
      return;
    }

    Alert.alert(
      'Join Pool',
      `Join ${pool.name} pool?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Join', onPress: joinPoolAction },
      ]
    );
  };

  const joinPoolAction = async () => {
    setJoining(true);
    
    try {
      // In real app, this would call Meteora API
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      
      Alert.alert(
        'Success',
        'Successfully joined the pool!',
        [
          { text: 'OK', onPress: () => navigation.navigate('Positions') }
        ]
      );
    } catch (error) {
      console.error('Error joining pool:', error);
      Alert.alert('Error', 'Failed to join pool. Please try again.');
    } finally {
      setJoining(false);
    }
  };

  const getPoolTypeColor = (type) => {
    switch (type) {
      case 'DLMM': return theme.colors.primary;
      case 'DAMM V2': return theme.colors.secondary;
      default: return theme.colors.accent;
    }
  };

  if (!pool) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <MaterialCommunityIcons 
            name="loading" 
            size={48} 
            color={theme.colors.primary} 
          />
          <Text style={styles.loadingText}>Loading pool details...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <ScrollView style={styles.content}>
        <Animated.View style={[styles.detailContainer, { opacity: fadeAnim }]}>
          {/* Pool Header */}
          <NeonCard style={styles.headerCard}>
            <View style={styles.poolHeader}>
              <View style={styles.poolInfo}>
                <View style={styles.tokenPair}>
                  <View style={styles.tokenIcon}>
                    <MaterialCommunityIcons 
                      name="currency-btc" 
                      size={24} 
                      color={theme.colors.primary} 
                    />
                  </View>
                  <View style={styles.tokenIcon}>
                    <MaterialCommunityIcons 
                      name="currency-usd" 
                      size={24} 
                      color={theme.colors.secondary} 
                    />
                  </View>
                </View>
                <View style={styles.poolDetails}>
                  <Text style={styles.poolName}>{pool.name}</Text>
                  <View style={[styles.poolType, { backgroundColor: getPoolTypeColor(pool.type) + '20' }]}>
                    <Text style={[styles.poolTypeText, { color: getPoolTypeColor(pool.type) }]}>
                      {pool.type}
                    </Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.safetyIndicator}>
                <MaterialCommunityIcons 
                  name="shield-check" 
                  size={20} 
                  color={getSafetyColor(pool.safetyScore || 80)} 
                />
                <Text style={[styles.safetyScore, { color: getSafetyColor(pool.safetyScore || 80) }]}>
                  {pool.safetyScore || 80}
                </Text>
              </View>
            </View>
            
            <Text style={styles.poolDescription}>{pool.description}</Text>
          </NeonCard>

          {/* Key Stats */}
          <View style={styles.statsContainer}>
            <NeonCard style={styles.statCard}>
              <Text style={styles.statLabel}>TVL</Text>
              <Text style={styles.statValue}>{formatUSD(pool.tvl)}</Text>
            </NeonCard>
            
            <NeonCard style={styles.statCard}>
              <Text style={styles.statLabel}>APR</Text>
              <Text style={[styles.statValue, { color: theme.colors.primary }]}>
                {formatPercentage(pool.apr)}
              </Text>
            </NeonCard>
            
            <NeonCard style={styles.statCard}>
              <Text style={styles.statLabel}>24h Vol</Text>
              <Text style={styles.statValue}>{formatUSD(pool.volume24h)}</Text>
            </NeonCard>
          </View>

          {/* Pool Metrics */}
          <NeonCard style={styles.metricsCard}>
            <Text style={styles.sectionTitle}>Pool Metrics</Text>
            <View style={styles.metricsGrid}>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>24h Fees</Text>
                <Text style={styles.metricValue}>{formatUSD(pool.fees24h)}</Text>
              </View>
              
              {pool.binSize && (
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>Bin Size</Text>
                  <Text style={styles.metricValue}>{pool.binSize}%</Text>
                </View>
              )}
              
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Safety Score</Text>
                <Text style={[styles.metricValue, { color: getSafetyColor(pool.safetyScore || 80) }]}>
                  {pool.safetyScore || 80}/100
                </Text>
              </View>
              
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Pool Type</Text>
                <Text style={styles.metricValue}>{pool.type}</Text>
              </View>
            </View>
          </NeonCard>

          {/* Features */}
          <NeonCard style={styles.featuresCard}>
            <Text style={styles.sectionTitle}>Features</Text>
            {pool.features?.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <MaterialCommunityIcons 
                  name="check-circle" 
                  size={20} 
                  color={theme.colors.success} 
                />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </NeonCard>

          {/* Risks */}
          <NeonCard variant="warning" style={styles.risksCard}>
            <Text style={styles.sectionTitle}>Risks</Text>
            {pool.risks?.map((risk, index) => (
              <View key={index} style={styles.riskItem}>
                <MaterialCommunityIcons 
                  name="alert-circle" 
                  size={20} 
                  color={theme.colors.warning} 
                />
                <Text style={styles.riskText}>{risk}</Text>
              </View>
            ))}
          </NeonCard>

          {/* Performance Chart */}
          <NeonCard style={styles.chartCard}>
            <Text style={styles.sectionTitle}>Performance</Text>
            <View style={styles.chartContainer}>
              {pool.chartData?.map((data, index) => (
                <View key={index} style={styles.chartItem}>
                  <Text style={styles.chartTime}>{data.time}</Text>
                  <Text style={styles.chartAPR}>{formatPercentage(data.apr)}</Text>
                  <Text style={styles.chartTVL}>{formatUSD(data.tvl)}</Text>
                </View>
              ))}
            </View>
          </NeonCard>

          {/* Action Buttons */}
          <View style={styles.actionContainer}>
            <NeonButton
              title={joining ? "Joining Pool..." : "Join Pool"}
              onPress={handleJoinPool}
              disabled={joining || !connected}
              variant="primary"
              style={styles.joinButton}
            />
            
            <NeonButton
              title="View Analytics"
              onPress={() => navigation.navigate('PoolAnalytics', { poolId })}
              variant="secondary"
              style={styles.analyticsButton}
            />
            
            {!connected && (
              <Text style={styles.connectWarning}>
                Connect your wallet to join this pool
              </Text>
            )}
          </View>

          {/* Additional Info */}
          <NeonCard style={styles.infoCard}>
            <Text style={styles.infoTitle}>Important Information</Text>
            <Text style={styles.infoText}>
              • Pool fees are distributed to liquidity providers{'\n'}
              • Impermanent loss may occur in volatile markets{'\n'}
              • Withdrawals are subject to pool conditions{'\n'}
              • Past performance does not guarantee future returns
            </Text>
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
  detailContainer: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginTop: 16,
  },
  headerCard: {
    marginBottom: 16,
  },
  poolHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  poolInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  tokenPair: {
    flexDirection: 'row',
    marginRight: 12,
  },
  tokenIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: -8,
  },
  poolDetails: {
    flex: 1,
  },
  poolName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  poolType: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  poolTypeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  safetyIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  safetyScore: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  poolDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    marginHorizontal: 4,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  metricsCard: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricItem: {
    width: '48%',
    marginBottom: 12,
  },
  metricLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  featuresCard: {
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    color: theme.colors.text,
    marginLeft: 12,
  },
  risksCard: {
    marginBottom: 16,
  },
  riskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  riskText: {
    fontSize: 14,
    color: theme.colors.text,
    marginLeft: 12,
  },
  chartCard: {
    marginBottom: 16,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  chartItem: {
    alignItems: 'center',
    flex: 1,
  },
  chartTime: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  chartAPR: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 2,
  },
  chartTVL: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  actionContainer: {
    marginBottom: 16,
  },
  joinButton: {
    marginBottom: 12,
  },
  analyticsButton: {
    marginBottom: 12,
  },
  connectWarning: {
    fontSize: 14,
    color: theme.colors.warning,
    textAlign: 'center',
  },
  infoCard: {
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
});

export default PoolDetailScreen;