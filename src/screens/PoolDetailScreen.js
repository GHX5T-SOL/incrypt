import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import {
  Appbar,
  Card,
  Button,
  Divider,
  ActivityIndicator,
  useTheme,
  ProgressBar,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { VictoryLine, VictoryChart, VictoryAxis, VictoryTheme } from 'victory-native';
import { useWallet } from '../contexts/WalletProvider';
import { neonStyles } from '../theme';
import { formatCurrency, formatPercentage, formatNumber, formatDate } from '../utils/format';

const { width } = Dimensions.get('window');

// Mock data for a specific pool
const getMockPoolData = (poolId) => {
  // In a real app, this would be an API call to get pool details
  const poolData = {
    id: poolId,
    name: 'SOL-USDC',
    type: 'DLMM',
    tvl: 42500000,
    apr: 18.2,
    volume24h: 3800000,
    fees24h: 12000,
    binSize: 10,
    rugcheckScore: 95,
    token1: {
      symbol: 'SOL',
      name: 'Solana',
      icon: require('../../assets/tokens/sol.png'),
      price: 150.25,
      reserve: 141500, // SOL amount in pool
    },
    token2: {
      symbol: 'USDC',
      name: 'USD Coin',
      icon: require('../../assets/tokens/usdc.png'),
      price: 1.00,
      reserve: 21250000, // USDC amount in pool
    },
    priceRange: {
      min: 135.22,
      max: 165.28,
      current: 150.25,
    },
    volumeHistory: [
      { date: '2023-07-01', volume: 3200000 },
      { date: '2023-07-02', volume: 2800000 },
      { date: '2023-07-03', volume: 3500000 },
      { date: '2023-07-04', volume: 4100000 },
      { date: '2023-07-05', volume: 3800000 },
      { date: '2023-07-06', volume: 3600000 },
      { date: '2023-07-07', volume: 3800000 },
    ],
    aprHistory: [
      { date: '2023-07-01', apr: 17.5 },
      { date: '2023-07-02', apr: 16.8 },
      { date: '2023-07-03', apr: 17.2 },
      { date: '2023-07-04', apr: 18.5 },
      { date: '2023-07-05', apr: 19.1 },
      { date: '2023-07-06', apr: 18.7 },
      { date: '2023-07-07', apr: 18.2 },
    ],
    priceHistory: [
      { date: '2023-07-01', price: 145.20 },
      { date: '2023-07-02', price: 147.50 },
      { date: '2023-07-03', price: 149.80 },
      { date: '2023-07-04', price: 152.30 },
      { date: '2023-07-05', price: 151.20 },
      { date: '2023-07-06', price: 149.70 },
      { date: '2023-07-07', price: 150.25 },
    ],
    poolAddress: '7Q3itPSu3XTYbNrRMSvEhXmwmWKNNX9JiMNSrqJqVYKP',
    createdAt: '2023-06-15T12:00:00Z',
    totalLiquidityProviders: 1245,
    totalFees: 1850000, // Total fees earned since creation
    feeStructure: {
      base: 0.25, // 0.25%
      variable: 0.05, // Additional 0.05% based on volatility
    },
  };
  
  return poolData;
};

const PoolDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const theme = useTheme();
  const { connected } = useWallet();
  
  const { poolId } = route.params;
  const [pool, setPool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeChart, setActiveChart] = useState('price'); // 'price', 'volume', 'apr'
  
  useEffect(() => {
    fetchPoolData();
  }, [poolId]);
  
  const fetchPoolData = async () => {
    setLoading(true);
    try {
      // In a real app, this would be an API call to Meteora
      // For now, we'll use mock data
      setTimeout(() => {
        const data = getMockPoolData(poolId);
        setPool(data);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching pool details:', error);
      setLoading(false);
    }
  };
  
  const navigateToJoinPool = () => {
    navigation.navigate('JoinPool', { poolId, pool });
  };
  
  const getChartData = () => {
    if (!pool) return [];
    
    switch (activeChart) {
      case 'price':
        return pool.priceHistory.map(item => ({
          x: new Date(item.date),
          y: item.price,
        }));
      case 'volume':
        return pool.volumeHistory.map(item => ({
          x: new Date(item.date),
          y: item.volume / 1000000, // Convert to millions for better display
        }));
      case 'apr':
        return pool.aprHistory.map(item => ({
          x: new Date(item.date),
          y: item.apr,
        }));
      default:
        return [];
    }
  };
  
  const getYAxisLabel = () => {
    switch (activeChart) {
      case 'price':
        return 'Price (USDC)';
      case 'volume':
        return 'Volume (M)';
      case 'apr':
        return 'APR (%)';
      default:
        return '';
    }
  };
  
  const getChartColor = () => {
    switch (activeChart) {
      case 'price':
        return theme.colors.primary;
      case 'volume':
        return theme.colors.secondary;
      case 'apr':
        return theme.colors.accent;
      default:
        return theme.colors.primary;
    }
  };
  
  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <StatusBar style="light" />
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading pool details...</Text>
      </View>
    );
  }
  
  if (!pool) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <StatusBar style="light" />
        <MaterialCommunityIcons name="alert-circle" size={64} color={theme.colors.error} />
        <Text style={styles.errorText}>Failed to load pool details</Text>
        <Button 
          mode="contained" 
          style={{ marginTop: 20, backgroundColor: theme.colors.primary }}
          labelStyle={{ color: '#000000' }}
          onPress={() => navigation.goBack()}
        >
          Go Back
        </Button>
      </View>
    );
  }
  
  // Calculate price position within range as percentage
  const priceRangePercentage = 
    ((pool.priceRange.current - pool.priceRange.min) / 
    (pool.priceRange.max - pool.priceRange.min)) * 100;
  
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction color="#FFFFFF" onPress={() => navigation.goBack()} />
        <Appbar.Content title={pool.name} subtitle={pool.type} titleStyle={styles.headerTitle} />
        <Appbar.Action 
          icon="share-variant" 
          color="#FFFFFF" 
          onPress={() => {}} 
        />
      </Appbar.Header>
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        {/* Pool Overview Card */}
        <Card style={styles.overviewCard}>
          <Card.Content>
            <View style={styles.poolHeader}>
              <View style={styles.tokenIcons}>
                <Image source={pool.token1.icon} style={styles.tokenIcon} />
                <Image source={pool.token2.icon} style={[styles.tokenIcon, styles.tokenIconOverlap]} />
              </View>
              <View style={[
                styles.poolTypeTag,
                { 
                  backgroundColor: pool.type === 'DLMM' 
                    ? 'rgba(255, 0, 255, 0.2)' 
                    : 'rgba(0, 255, 255, 0.2)' 
                }
              ]}>
                <Text style={[
                  styles.poolTypeText,
                  { 
                    color: pool.type === 'DLMM' 
                      ? theme.colors.secondary 
                      : theme.colors.accent 
                  }
                ]}>
                  {pool.type}
                </Text>
              </View>
            </View>
            
            <Text style={styles.poolName}>{pool.name}</Text>
            
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>TVL</Text>
                <Text style={styles.statValue}>${formatCurrency(pool.tvl)}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>APR</Text>
                <Text style={[styles.statValue, { color: theme.colors.primary }]}>
                  {formatPercentage(pool.apr)}
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>24h Volume</Text>
                <Text style={styles.statValue}>${formatCurrency(pool.volume24h)}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>24h Fees</Text>
                <Text style={styles.statValue}>${formatCurrency(pool.fees24h)}</Text>
              </View>
            </View>
            
            <View style={styles.actionButtons}>
              <Button 
                mode="contained" 
                style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
                labelStyle={{ color: '#000000' }}
                onPress={navigateToJoinPool}
              >
                Join Pool
              </Button>
              <Button 
                mode="outlined" 
                style={styles.actionButton}
                onPress={() => {}}
              >
                Simulate IL
              </Button>
            </View>
          </Card.Content>
        </Card>
        
        {/* Chart Card */}
        <Card style={styles.chartCard}>
          <Card.Content>
            <View style={styles.chartTabs}>
              <TouchableOpacity
                style={[
                  styles.chartTab,
                  activeChart === 'price' && { 
                    backgroundColor: 'rgba(0, 255, 159, 0.2)',
                    borderBottomColor: theme.colors.primary,
                    borderBottomWidth: 2,
                  }
                ]}
                onPress={() => setActiveChart('price')}
              >
                <Text style={[
                  styles.chartTabText,
                  activeChart === 'price' && { color: theme.colors.primary }
                ]}>
                  Price
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.chartTab,
                  activeChart === 'volume' && { 
                    backgroundColor: 'rgba(255, 0, 255, 0.2)',
                    borderBottomColor: theme.colors.secondary,
                    borderBottomWidth: 2,
                  }
                ]}
                onPress={() => setActiveChart('volume')}
              >
                <Text style={[
                  styles.chartTabText,
                  activeChart === 'volume' && { color: theme.colors.secondary }
                ]}>
                  Volume
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.chartTab,
                  activeChart === 'apr' && { 
                    backgroundColor: 'rgba(0, 255, 255, 0.2)',
                    borderBottomColor: theme.colors.accent,
                    borderBottomWidth: 2,
                  }
                ]}
                onPress={() => setActiveChart('apr')}
              >
                <Text style={[
                  styles.chartTabText,
                  activeChart === 'apr' && { color: theme.colors.accent }
                ]}>
                  APR
                </Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.chartContainer}>
              <VictoryChart
                width={width - 40}
                height={220}
                padding={{ top: 20, bottom: 40, left: 50, right: 20 }}
                theme={VictoryTheme.material}
                domainPadding={{ y: 10 }}
              >
                <VictoryAxis
                  tickFormat={(x) => {
                    const date = new Date(x);
                    return `${date.getMonth() + 1}/${date.getDate()}`;
                  }}
                  style={{
                    axis: { stroke: '#555555' },
                    tickLabels: { fill: '#AAAAAA', fontSize: 10 },
                    grid: { stroke: 'transparent' },
                  }}
                />
                <VictoryAxis
                  dependentAxis
                  label={getYAxisLabel()}
                  style={{
                    axis: { stroke: '#555555' },
                    tickLabels: { fill: '#AAAAAA', fontSize: 10 },
                    grid: { stroke: '#333333', strokeDasharray: '5,5' },
                    axisLabel: { fill: '#AAAAAA', padding: 35 },
                  }}
                />
                <VictoryLine
                  data={getChartData()}
                  style={{
                    data: { 
                      stroke: getChartColor(),
                      strokeWidth: 3,
                    },
                  }}
                  animate={{
                    duration: 500,
                    onLoad: { duration: 500 },
                  }}
                />
              </VictoryChart>
            </View>
          </Card.Content>
        </Card>
        
        {/* Token Reserves Card */}
        <Card style={styles.reservesCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Token Reserves</Text>
            
            <View style={styles.tokenReserve}>
              <View style={styles.tokenInfo}>
                <Image source={pool.token1.icon} style={styles.reserveTokenIcon} />
                <View>
                  <Text style={styles.tokenSymbol}>{pool.token1.symbol}</Text>
                  <Text style={styles.tokenName}>{pool.token1.name}</Text>
                </View>
              </View>
              <View style={styles.tokenValues}>
                <Text style={styles.tokenAmount}>{formatNumber(pool.token1.reserve)} {pool.token1.symbol}</Text>
                <Text style={styles.tokenValue}>${formatCurrency(pool.token1.reserve * pool.token1.price)}</Text>
              </View>
            </View>
            
            <Divider style={styles.divider} />
            
            <View style={styles.tokenReserve}>
              <View style={styles.tokenInfo}>
                <Image source={pool.token2.icon} style={styles.reserveTokenIcon} />
                <View>
                  <Text style={styles.tokenSymbol}>{pool.token2.symbol}</Text>
                  <Text style={styles.tokenName}>{pool.token2.name}</Text>
                </View>
              </View>
              <View style={styles.tokenValues}>
                <Text style={styles.tokenAmount}>{formatNumber(pool.token2.reserve)} {pool.token2.symbol}</Text>
                <Text style={styles.tokenValue}>${formatCurrency(pool.token2.reserve * pool.token2.price)}</Text>
              </View>
            </View>
          </Card.Content>
        </Card>
        
        {/* Price Range Card (for DLMM pools) */}
        {pool.type === 'DLMM' && (
          <Card style={styles.priceRangeCard}>
            <Card.Content>
              <Text style={styles.sectionTitle}>Price Range</Text>
              
              <View style={styles.priceRangeContainer}>
                <View style={styles.priceRangeLabels}>
                  <Text style={styles.priceRangeLabel}>Min</Text>
                  <Text style={styles.priceRangeLabel}>Current</Text>
                  <Text style={styles.priceRangeLabel}>Max</Text>
                </View>
                
                <View style={styles.priceRangeValues}>
                  <Text style={styles.priceRangeValue}>${formatNumber(pool.priceRange.min)}</Text>
                  <Text style={[styles.priceRangeValue, { color: theme.colors.primary }]}>
                    ${formatNumber(pool.priceRange.current)}
                  </Text>
                  <Text style={styles.priceRangeValue}>${formatNumber(pool.priceRange.max)}</Text>
                </View>
                
                <View style={styles.priceRangeBarContainer}>
                  <View style={styles.priceRangeBar}>
                    <View 
                      style={[
                        styles.priceRangeIndicator, 
                        { left: `${priceRangePercentage}%` }
                      ]} 
                    />
                  </View>
                </View>
                
                <View style={styles.binSizeContainer}>
                  <Text style={styles.binSizeLabel}>Bin Size:</Text>
                  <Text style={styles.binSizeValue}>{pool.binSize}%</Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        )}
        
        {/* Pool Details Card */}
        <Card style={styles.detailsCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Pool Details</Text>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Pool Address</Text>
              <Text style={styles.detailValue}>{pool.poolAddress.slice(0, 6)}...{pool.poolAddress.slice(-6)}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Created</Text>
              <Text style={styles.detailValue}>{formatDate(pool.createdAt)}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Liquidity Providers</Text>
              <Text style={styles.detailValue}>{formatNumber(pool.totalLiquidityProviders, 0)}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Total Fees Earned</Text>
              <Text style={styles.detailValue}>${formatCurrency(pool.totalFees)}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Fee Structure</Text>
              <Text style={styles.detailValue}>
                {formatPercentage(pool.feeStructure.base)} base + 
                {formatPercentage(pool.feeStructure.variable)} variable
              </Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Rugcheck Score</Text>
              <View style={styles.rugcheckContainer}>
                <Text style={[
                  styles.rugcheckScore,
                  { 
                    color: pool.rugcheckScore > 90 
                      ? '#00FF9F' 
                      : pool.rugcheckScore > 80 
                        ? '#FFFF00' 
                        : '#FF6B6B' 
                  }
                ]}>
                  {pool.rugcheckScore}
                </Text>
                <MaterialCommunityIcons 
                  name={
                    pool.rugcheckScore > 90 
                      ? 'shield-check' 
                      : pool.rugcheckScore > 80 
                        ? 'shield-half-full' 
                        : 'shield-alert'
                  } 
                  size={16} 
                  color={
                    pool.rugcheckScore > 90 
                      ? '#00FF9F' 
                      : pool.rugcheckScore > 80 
                        ? '#FFFF00' 
                        : '#FF6B6B'
                  } 
                  style={{ marginLeft: 5 }}
                />
              </View>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
      
      <View style={styles.bottomBar}>
        <Button 
          mode="contained" 
          style={[styles.joinButton, { backgroundColor: theme.colors.primary }]}
          labelStyle={{ color: '#000000', fontSize: 16 }}
          onPress={navigateToJoinPool}
        >
          Join Pool
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 10,
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 18,
    marginTop: 10,
    textAlign: 'center',
  },
  header: {
    backgroundColor: '#1A1A1A',
    elevation: 0,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 80, // Extra space for bottom bar
  },
  overviewCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    marginBottom: 16,
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
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  poolTypeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  poolName: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  statItem: {
    width: '50%',
    marginBottom: 16,
  },
  statLabel: {
    color: '#AAAAAA',
    fontSize: 14,
    marginBottom: 4,
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 5,
  },
  chartCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    marginBottom: 16,
  },
  chartTabs: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  chartTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  chartTabText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  chartContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  reservesCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  tokenReserve: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tokenInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reserveTokenIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  tokenSymbol: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  tokenName: {
    color: '#AAAAAA',
    fontSize: 14,
  },
  tokenValues: {
    alignItems: 'flex-end',
  },
  tokenAmount: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  tokenValue: {
    color: '#AAAAAA',
    fontSize: 14,
  },
  divider: {
    backgroundColor: '#2C2C2C',
    marginVertical: 12,
  },
  priceRangeCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    marginBottom: 16,
  },
  priceRangeContainer: {
    marginTop: 10,
  },
  priceRangeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  priceRangeLabel: {
    color: '#AAAAAA',
    fontSize: 14,
  },
  priceRangeValues: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  priceRangeValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  priceRangeBarContainer: {
    marginBottom: 16,
  },
  priceRangeBar: {
    height: 8,
    backgroundColor: '#2C2C2C',
    borderRadius: 4,
    position: 'relative',
  },
  priceRangeIndicator: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#00FF9F',
    top: -2,
    marginLeft: -6,
  },
  binSizeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  binSizeLabel: {
    color: '#AAAAAA',
    fontSize: 14,
    marginRight: 8,
  },
  binSizeValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  detailsCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    color: '#AAAAAA',
    fontSize: 14,
  },
  detailValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  rugcheckContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rugcheckScore: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(18, 18, 18, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#2C2C2C',
  },
  joinButton: {
    width: '100%',
    paddingVertical: 8,
  },
});

export default PoolDetailScreen;