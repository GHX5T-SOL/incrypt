import React, { useEffect, useState, useCallback } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  RefreshControl,
  Dimensions,
  Animated,
  Alert,
  SafeAreaView,
  Image
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useWallet } from '../hooks/useWallet';
import { useMeteora } from '../hooks/useMeteora';
import { theme, neonStyles } from '../theme';
import NeonCard from '../components/NeonCard';
import NeonButton from '../components/NeonButton';
import { formatSOL, formatUSD, formatPercentage, formatNumber } from '../utils/format';

const { width, height } = Dimensions.get('window');

const DashboardScreen = () => {
  let navigation;
  try {
    navigation = useNavigation();
  } catch (error) {
    console.log('Navigation not available, using fallback');
    navigation = {
      navigate: () => console.log('Navigation not available'),
      goBack: () => console.log('Navigation not available'),
    };
  }
  
  let walletData = { 
    connected: false, 
    balance: 0, 
    getShortAddress: () => '', 
    connect: () => console.log('Connect not available'),
    disconnect: () => console.log('Disconnect not available')
  };
  try {
    walletData = useWallet();
  } catch (error) {
    console.log('Wallet hook not available, using fallback');
  }
  
  let meteoraData = { pools: [], loading: false, fetchPools: () => {} };
  try {
    meteoraData = useMeteora();
  } catch (error) {
    console.log('Meteora hook not available, using fallback');
  }
  
  const { connected, balance, getShortAddress, connect, disconnect } = walletData;
  const { pools, loading: meteoraLoading, fetchPools } = meteoraData;
  
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    totalTVL: 0,
    totalPools: 0,
    avgAPR: 0,
    userPositions: 0,
    userTVL: 0,
  });
  const [featuredPools, setFeaturedPools] = useState([]);
  const [lendingOpportunities, setLendingOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    fetchDashboardData();
    startFadeAnimation();
  }, []);

  useEffect(() => {
    if (pools.length > 0) {
      updateDashboardData();
    }
  }, [pools]);

  const startFadeAnimation = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch Meteora pools
      await fetchPools();
      
      // Mock lending opportunities (in real app, this would come from lending services)
      setLendingOpportunities([
        {
          id: '1',
          protocol: 'Kamino',
          asset: 'SOL',
          apy: 5.2,
          tvl: 28000000,
          risk: 'low',
          icon: 'bank',
        },
        {
          id: '2',
          protocol: 'MarginFi',
          asset: 'USDC',
          apy: 3.8,
          tvl: 45000000,
          risk: 'low',
          icon: 'bank',
        },
        {
          id: '3',
          protocol: 'Kamino',
          asset: 'BONK',
          apy: 8.5,
          tvl: 12000000,
          risk: 'medium',
          icon: 'bank',
        },
      ]);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const updateDashboardData = () => {
    const totalTVL = pools.reduce((sum, pool) => sum + (pool.tvl || 0), 0);
    const avgAPR = pools.length > 0 
      ? pools.reduce((sum, pool) => sum + (pool.apr || 0), 0) / pools.length 
      : 0;

    setDashboardData({
      totalTVL,
      totalPools: pools.length,
      avgAPR,
      userPositions: 3, // Mock user positions
      userTVL: 2500, // Mock user TVL
    });

    // Set featured pools (top 3 by TVL)
    const topPools = pools
      .filter(pool => pool.tvl > 0)
      .sort((a, b) => b.tvl - a.tvl)
      .slice(0, 3)
      .map(pool => ({
        id: pool.id || pool.address,
        name: pool.name || `${pool.tokenA}/${pool.tokenB}`,
        type: pool.type || 'DLMM',
        tvl: pool.tvl || 0,
        apr: pool.apr || 0,
        volume24h: pool.volume24h || 0,
        safety: pool.safety || 'safe',
      }));

    setFeaturedPools(topPools);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  }, []);

  const navigateToPools = () => {
    navigation.navigate('Pools');
  };

  const navigateToPositions = () => {
    navigation.navigate('Positions');
  };

  const navigateToLending = () => {
    navigation.navigate('Lending');
  };

  const navigateToPoolDetail = (poolId) => {
    navigation.navigate('Pools', { screen: 'PoolDetail', params: { poolId } });
  };

  const navigateToLendingDetail = (lendingId) => {
    navigation.navigate('Lending', { screen: 'LendingDetail', params: { lendingId } });
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'low': return theme.colors.success;
      case 'medium': return theme.colors.warning;
      case 'high': return theme.colors.error;
      default: return theme.colors.textSecondary;
    }
  };

  const getPoolTypeColor = (type) => {
    switch (type) {
      case 'DLMM': return theme.colors.primary;
      case 'DAMM V2': return theme.colors.secondary;
      default: return theme.colors.accent;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
          />
        }
      >
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {/* Logo Section */}
          <View style={styles.logoSection}>
            <Image 
              source={require('../../assets/logo-neon.png')} 
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          {/* Quick Stats */}
          <View style={styles.statsContainer}>
            <NeonCard style={styles.statCard}>
              <MaterialCommunityIcons 
                name="chart-bubble" 
                size={24} 
                color={theme.colors.primary} 
              />
              <Text style={styles.statValue}>{formatNumber(dashboardData.totalPools)}</Text>
              <Text style={styles.statLabel}>Total Pools</Text>
            </NeonCard>

            <NeonCard style={styles.statCard}>
              <MaterialCommunityIcons 
                name="currency-usd" 
                size={24} 
                color={theme.colors.secondary} 
              />
              <Text style={styles.statValue}>{formatUSD(dashboardData.totalTVL)}</Text>
              <Text style={styles.statLabel}>Total TVL</Text>
            </NeonCard>

            <NeonCard style={styles.statCard}>
              <MaterialCommunityIcons 
                name="trending-up" 
                size={24} 
                color={theme.colors.accent} 
              />
              <Text style={styles.statValue}>{formatPercentage(dashboardData.avgAPR)}</Text>
              <Text style={styles.statLabel}>Avg APR</Text>
            </NeonCard>
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
            </View>
            <View style={styles.actionsGrid}>
              <TouchableOpacity style={styles.actionButton} onPress={navigateToPools}>
                <MaterialCommunityIcons 
                  name="chart-bubble" 
                  size={32} 
                  color={theme.colors.primary} 
                />
                <Text style={styles.actionText}>Browse Pools</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton} onPress={navigateToPositions}>
                <MaterialCommunityIcons 
                  name="wallet" 
                  size={32} 
                  color={theme.colors.secondary} 
                />
                <Text style={styles.actionText}>My Positions</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton} onPress={navigateToLending}>
                <MaterialCommunityIcons 
                  name="bank" 
                  size={32} 
                  color={theme.colors.accent} 
                />
                <Text style={styles.actionText}>Lending</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Lending', { screen: 'LendingStrategies' })}>
                <MaterialCommunityIcons 
                  name="trending-up" 
                  size={32} 
                  color={theme.colors.neonBlue} 
                />
                <Text style={styles.actionText}>Strategies</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Lending', { screen: 'TokenSafety' })}>
                <MaterialCommunityIcons 
                  name="shield-check" 
                  size={32} 
                  color={theme.colors.accent} 
                />
                <Text style={styles.actionText}>Token Safety</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Featured Pools */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Featured Pools</Text>
              <TouchableOpacity onPress={navigateToPools}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>
            
            {featuredPools.map((pool, index) => (
              <TouchableOpacity
                key={pool.id}
                style={styles.poolCard}
                onPress={() => navigateToPoolDetail(pool.id)}
                activeOpacity={0.7}
              >
                <View style={styles.poolHeader}>
                  <View style={styles.poolInfo}>
                    <Text style={styles.poolName}>{pool.name}</Text>
                    <View style={[styles.poolType, { backgroundColor: getPoolTypeColor(pool.type) + '20' }]}>
                      <Text style={[styles.poolTypeText, { color: getPoolTypeColor(pool.type) }]}>
                        {pool.type}
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.safetyBadge, { backgroundColor: pool.safety === 'safe' ? theme.colors.success + '20' : theme.colors.warning + '20' }]}>
                    <MaterialCommunityIcons 
                      name="shield-check" 
                      size={16} 
                      color={pool.safety === 'safe' ? theme.colors.success : theme.colors.warning} 
                    />
                  </View>
                </View>
                
                <View style={styles.poolStats}>
                  <View style={styles.poolStat}>
                    <Text style={styles.poolStatLabel}>TVL</Text>
                    <Text style={styles.poolStatValue}>{formatUSD(pool.tvl)}</Text>
                  </View>
                  <View style={styles.poolStat}>
                    <Text style={styles.poolStatLabel}>APR</Text>
                    <Text style={styles.poolStatValue}>{formatPercentage(pool.apr)}</Text>
                  </View>
                  <View style={styles.poolStat}>
                    <Text style={styles.poolStatLabel}>24h Vol</Text>
                    <Text style={styles.poolStatValue}>{formatUSD(pool.volume24h)}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Lending Opportunities */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Lending Opportunities</Text>
              <TouchableOpacity onPress={navigateToLending}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>
            
            {lendingOpportunities.map((opportunity, index) => (
              <TouchableOpacity
                key={opportunity.id}
                style={styles.lendingCard}
                onPress={() => navigateToLendingDetail(opportunity.id)}
                activeOpacity={0.7}
              >
                <View style={styles.lendingHeader}>
                  <View style={styles.lendingInfo}>
                    <MaterialCommunityIcons 
                      name={opportunity.icon} 
                      size={24} 
                      color={theme.colors.primary} 
                    />
                    <View style={styles.lendingDetails}>
                      <Text style={styles.lendingAsset}>{opportunity.asset}</Text>
                      <Text style={styles.lendingProtocol}>{opportunity.protocol}</Text>
                    </View>
                  </View>
                  <View style={[styles.riskBadge, { backgroundColor: getRiskColor(opportunity.risk) + '20' }]}>
                    <Text style={[styles.riskText, { color: getRiskColor(opportunity.risk) }]}>
                      Risk: {opportunity.risk.toUpperCase()}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.lendingStats}>
                  <View style={styles.lendingStat}>
                    <Text style={styles.lendingStatLabel}>APY</Text>
                    <Text style={styles.lendingStatValue}>{formatPercentage(opportunity.apy)}</Text>
                  </View>
                  <View style={styles.lendingStat}>
                    <Text style={styles.lendingStatLabel}>TVL</Text>
                    <Text style={styles.lendingStatValue}>{formatUSD(opportunity.tvl)}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* User Stats */}
          {connected && dashboardData.userPositions > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Your Activity</Text>
              <NeonCard variant="success" style={styles.userStatsCard}>
                <View style={styles.userStatsRow}>
                  <View style={styles.userStat}>
                    <Text style={styles.userStatValue}>{dashboardData.userPositions}</Text>
                    <Text style={styles.userStatLabel}>Active Positions</Text>
                  </View>
                  <View style={styles.userStat}>
                    <Text style={styles.userStatValue}>{formatUSD(dashboardData.userTVL)}</Text>
                    <Text style={styles.userStatLabel}>Your TVL</Text>
                  </View>
                </View>
              </NeonCard>
            </View>
          )}
        </Animated.View>
      </ScrollView>
      
      {/* Floating Wallet Connect Button */}
      <TouchableOpacity 
        style={[
          styles.floatingWalletButton,
          connected && styles.floatingWalletButtonConnected
        ]}
        onPress={() => {
          if (connected) {
            // Show wallet options
            Alert.alert(
              'Wallet Connected', 
              `Address: ${getShortAddress()}\nBalance: ${formatSOL(balance * 1e9)} SOL`,
              [
                { text: 'Disconnect', onPress: () => disconnect(), style: 'destructive' },
                { text: 'Cancel', style: 'cancel' }
              ]
            );
          } else {
            // Connect wallet
            connect();
          }
        }}
        activeOpacity={0.8}
      >
        <MaterialCommunityIcons 
          name={connected ? "wallet" : "wallet-outline"} 
          size={24} 
          color={connected ? theme.colors.success : theme.colors.primary} 
        />
        <Text style={[
          styles.floatingWalletText,
          { color: connected ? theme.colors.success : theme.colors.primary }
        ]}>
          {connected ? getShortAddress() : 'Connect'}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: 20,
    paddingTop: 10,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 10,
  },
  logo: {
    width: width * 0.6,
    height: width * 0.2,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    marginHorizontal: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  viewAllText: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionButton: {
    width: '48%',
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.outline,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: 8,
    textAlign: 'center',
  },
  poolCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.outline,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  poolHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  poolInfo: {
    flex: 1,
  },
  poolName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  poolType: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  poolTypeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  safetyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  poolStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  poolStat: {
    alignItems: 'center',
    flex: 1,
  },
  poolStatLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  poolStatValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  lendingCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.outline,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  lendingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  lendingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  lendingDetails: {
    marginLeft: 12,
  },
  lendingAsset: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  lendingProtocol: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  riskBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  riskText: {
    fontSize: 12,
    fontWeight: '600',
  },
  lendingStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  lendingStat: {
    alignItems: 'center',
    flex: 1,
  },
  lendingStatLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  lendingStatValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  userStatsCard: {
    padding: 16,
  },
  userStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  userStat: {
    alignItems: 'center',
    flex: 1,
  },
  userStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  userStatLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  floatingWalletButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 25,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: theme.colors.outline,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  floatingWalletButtonConnected: {
    borderColor: theme.colors.success,
    borderWidth: 2,
    backgroundColor: theme.colors.surface,
  },
  floatingWalletText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default DashboardScreen;