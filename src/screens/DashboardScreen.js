import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  RefreshControl,
  Dimensions,
  Image
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Card, Title, Paragraph, Button, useTheme, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useWallet } from '../contexts/WalletProvider';
import { useConnection } from '../contexts/ConnectionProvider';
import { neonStyles } from '../theme';
import { formatAddress, formatCurrency } from '../utils/format';

const { width } = Dimensions.get('window');

const DashboardScreen = () => {
  const navigation = useNavigation();
  const theme = useTheme();
  const { publicKey, balance } = useWallet();
  const connection = useConnection();
  
  const [refreshing, setRefreshing] = useState(false);
  const [poolStats, setPoolStats] = useState({
    totalPools: 0,
    totalTVL: 0,
    avgAPR: 0,
  });
  const [featuredPools, setFeaturedPools] = useState([]);
  const [lendingOpportunities, setLendingOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // In a real app, these would be API calls to Meteora and lending protocols
      // For now, we'll use mock data
      
      // Mock pool stats
      setPoolStats({
        totalPools: 156,
        totalTVL: 245000000, // $245M
        avgAPR: 12.4, // 12.4%
      });
      
      // Mock featured pools
      setFeaturedPools([
        {
          id: '1',
          name: 'SOL-USDC',
          type: 'DLMM',
          tvl: 42500000, // $42.5M
          apr: 18.2,
          volume24h: 3800000, // $3.8M
          icon1: require('../../assets/tokens/sol.png'),
          icon2: require('../../assets/tokens/usdc.png'),
        },
        {
          id: '2',
          name: 'BONK-SOL',
          type: 'DAMM V2',
          tvl: 12800000, // $12.8M
          apr: 24.5,
          volume24h: 2100000, // $2.1M
          icon1: require('../../assets/tokens/bonk.png'),
          icon2: require('../../assets/tokens/sol.png'),
        },
        {
          id: '3',
          name: 'JTO-USDC',
          type: 'DLMM',
          tvl: 8500000, // $8.5M
          apr: 15.8,
          volume24h: 1200000, // $1.2M
          icon1: require('../../assets/tokens/jto.png'),
          icon2: require('../../assets/tokens/usdc.png'),
        },
      ]);
      
      // Mock lending opportunities
      setLendingOpportunities([
        {
          id: '1',
          protocol: 'Kamino',
          asset: 'SOL',
          apy: 5.2,
          tvl: 28000000, // $28M
          icon: require('../../assets/tokens/sol.png'),
        },
        {
          id: '2',
          protocol: 'MarginFi',
          asset: 'USDC',
          apy: 7.8,
          tvl: 65000000, // $65M
          icon: require('../../assets/tokens/usdc.png'),
        },
        {
          id: '3',
          protocol: 'Kamino',
          asset: 'JTO',
          apy: 9.4,
          tvl: 4500000, // $4.5M
          icon: require('../../assets/tokens/jto.png'),
        },
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const navigateToPoolDetail = (poolId) => {
    navigation.navigate('Pools', { 
      screen: 'PoolDetail',
      params: { poolId }
    });
  };

  const navigateToLendingDetail = (lendingId) => {
    navigation.navigate('Lending', {
      screen: 'LendingDetail',
      params: { lendingId }
    });
  };

  const navigateToWallet = () => {
    navigation.navigate('WalletDetails');
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
      }
    >
      {/* Wallet Card */}
      <TouchableOpacity onPress={navigateToWallet}>
        <Card style={[styles.walletCard, neonStyles.neonContainer]}>
          <Card.Content>
            <View style={styles.walletHeader}>
              <View>
                <Text style={styles.walletLabel}>Your Wallet</Text>
                <Text style={styles.walletAddress}>{formatAddress(publicKey?.toString())}</Text>
              </View>
              <MaterialCommunityIcons name="wallet" size={24} color={theme.colors.primary} />
            </View>
            
            <View style={styles.balanceContainer}>
              <Text style={styles.balanceLabel}>Balance</Text>
              <Text style={styles.balanceValue}>{balance.toFixed(4)} SOL</Text>
              <Text style={styles.balanceUsd}>${(balance * 150).toFixed(2)} USD</Text>
            </View>
            
            <View style={styles.walletActions}>
              <Button 
                mode="contained" 
                style={[styles.walletButton, { backgroundColor: theme.colors.primary }]}
                labelStyle={{ color: '#000000' }}
                onPress={() => {}}
              >
                Send
              </Button>
              <Button 
                mode="contained" 
                style={[styles.walletButton, { backgroundColor: theme.colors.primary }]}
                labelStyle={{ color: '#000000' }}
                onPress={() => {}}
              >
                Receive
              </Button>
            </View>
          </Card.Content>
        </Card>
      </TouchableOpacity>

      {/* Market Overview */}
      <Card style={styles.overviewCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Market Overview</Title>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{poolStats.totalPools}</Text>
              <Text style={styles.statLabel}>Active Pools</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>${formatCurrency(poolStats.totalTVL)}</Text>
              <Text style={styles.statLabel}>Total TVL</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{poolStats.avgAPR.toFixed(1)}%</Text>
              <Text style={styles.statLabel}>Avg. APR</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Featured Pools */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Title style={styles.sectionTitle}>Featured Pools</Title>
          <TouchableOpacity onPress={() => navigation.navigate('Pools')}>
            <Text style={[styles.viewAll, { color: theme.colors.primary }]}>View All</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {featuredPools.map((pool) => (
            <TouchableOpacity 
              key={pool.id} 
              onPress={() => navigateToPoolDetail(pool.id)}
            >
              <Card style={[styles.poolCard, neonStyles.neonPurpleBorder]}>
                <Card.Content>
                  <View style={styles.poolHeader}>
                    <View style={styles.tokenIcons}>
                      <Image source={pool.icon1} style={styles.tokenIcon} />
                      <Image source={pool.icon2} style={[styles.tokenIcon, styles.tokenIconOverlap]} />
                    </View>
                    <View style={styles.poolTypeTag}>
                      <Text style={styles.poolTypeText}>{pool.type}</Text>
                    </View>
                  </View>
                  
                  <Text style={styles.poolName}>{pool.name}</Text>
                  
                  <View style={styles.poolStats}>
                    <View style={styles.poolStat}>
                      <Text style={styles.poolStatLabel}>TVL</Text>
                      <Text style={styles.poolStatValue}>${formatCurrency(pool.tvl)}</Text>
                    </View>
                    <View style={styles.poolStat}>
                      <Text style={styles.poolStatLabel}>APR</Text>
                      <Text style={[styles.poolStatValue, { color: theme.colors.primary }]}>
                        {pool.apr.toFixed(1)}%
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.poolVolume}>
                    <Text style={styles.poolVolumeLabel}>24h Volume</Text>
                    <Text style={styles.poolVolumeValue}>${formatCurrency(pool.volume24h)}</Text>
                  </View>
                </Card.Content>
              </Card>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Lending Opportunities */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Title style={styles.sectionTitle}>Lending Opportunities</Title>
          <TouchableOpacity onPress={() => navigation.navigate('Lending')}>
            <Text style={[styles.viewAll, { color: theme.colors.primary }]}>View All</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {lendingOpportunities.map((lending) => (
            <TouchableOpacity 
              key={lending.id} 
              onPress={() => navigateToLendingDetail(lending.id)}
            >
              <Card style={[styles.lendingCard, neonStyles.neonCyanBorder]}>
                <Card.Content>
                  <View style={styles.lendingHeader}>
                    <Image source={lending.icon} style={styles.lendingIcon} />
                    <View style={styles.lendingProtocolTag}>
                      <Text style={styles.lendingProtocolText}>{lending.protocol}</Text>
                    </View>
                  </View>
                  
                  <Text style={styles.lendingAsset}>{lending.asset}</Text>
                  
                  <View style={styles.lendingStats}>
                    <View style={styles.lendingStat}>
                      <Text style={styles.lendingStatLabel}>Supply APY</Text>
                      <Text style={[styles.lendingStatValue, { color: theme.colors.accent }]}>
                        {lending.apy.toFixed(1)}%
                      </Text>
                    </View>
                    <View style={styles.lendingStat}>
                      <Text style={styles.lendingStatLabel}>TVL</Text>
                      <Text style={styles.lendingStatValue}>${formatCurrency(lending.tvl)}</Text>
                    </View>
                  </View>
                  
                  <Button 
                    mode="outlined" 
                    style={[styles.lendingButton, { borderColor: theme.colors.accent }]}
                    labelStyle={{ color: theme.colors.accent }}
                    onPress={() => navigateToLendingDetail(lending.id)}
                  >
                    Lend Now
                  </Button>
                </Card.Content>
              </Card>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Quick Actions */}
      <Card style={styles.actionsCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Quick Actions</Title>
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => navigation.navigate('Pools', { screen: 'CreatePool' })}
            >
              <MaterialCommunityIcons name="plus-circle" size={24} color="#000000" />
              <Text style={styles.actionButtonText}>Create Pool</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: theme.colors.secondary }]}
              onPress={() => navigation.navigate('Pools')}
            >
              <MaterialCommunityIcons name="chart-bubble" size={24} color="#000000" />
              <Text style={styles.actionButtonText}>Join Pool</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: theme.colors.accent }]}
              onPress={() => navigation.navigate('Lending')}
            >
              <MaterialCommunityIcons name="bank" size={24} color="#000000" />
              <Text style={styles.actionButtonText}>Lend Assets</Text>
            </TouchableOpacity>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 30,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 10,
  },
  walletCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    marginBottom: 20,
    elevation: 4,
  },
  walletHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  walletLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  walletAddress: {
    color: '#AAAAAA',
    fontSize: 14,
  },
  balanceContainer: {
    marginBottom: 20,
  },
  balanceLabel: {
    color: '#AAAAAA',
    fontSize: 14,
    marginBottom: 5,
  },
  balanceValue: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
  },
  balanceUsd: {
    color: '#AAAAAA',
    fontSize: 16,
  },
  walletActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  walletButton: {
    flex: 1,
    marginHorizontal: 5,
  },
  overviewCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  statLabel: {
    color: '#AAAAAA',
    fontSize: 14,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  viewAll: {
    fontSize: 14,
    fontWeight: '500',
  },
  poolCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    width: width * 0.7,
    marginRight: 12,
    borderWidth: 1,
  },
  poolHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  tokenIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tokenIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  tokenIconOverlap: {
    marginLeft: -10,
  },
  poolTypeTag: {
    backgroundColor: 'rgba(255, 0, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  poolTypeText: {
    color: '#FF00FF',
    fontSize: 12,
    fontWeight: '500',
  },
  poolName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  poolStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  poolStat: {},
  poolStatLabel: {
    color: '#AAAAAA',
    fontSize: 12,
    marginBottom: 2,
  },
  poolStatValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  poolVolume: {
    marginTop: 5,
  },
  poolVolumeLabel: {
    color: '#AAAAAA',
    fontSize: 12,
    marginBottom: 2,
  },
  poolVolumeValue: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  lendingCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    width: width * 0.7,
    marginRight: 12,
    borderWidth: 1,
  },
  lendingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  lendingIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  lendingProtocolTag: {
    backgroundColor: 'rgba(0, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  lendingProtocolText: {
    color: '#00FFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  lendingAsset: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  lendingStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  lendingStat: {},
  lendingStatLabel: {
    color: '#AAAAAA',
    fontSize: 12,
    marginBottom: 2,
  },
  lendingStatValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  lendingButton: {
    borderWidth: 1,
  },
  actionsCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 12,
    marginHorizontal: 5,
  },
  actionButtonText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 5,
  },
});

export default DashboardScreen;