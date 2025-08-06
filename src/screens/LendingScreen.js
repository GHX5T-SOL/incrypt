import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
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

const LendingScreen = () => {
  let navigation;
  try {
    navigation = useNavigation();
  } catch (error) {
    console.log('Navigation not available in LendingScreen, using fallback');
    navigation = {
      navigate: () => console.log('Navigation not available'),
      goBack: () => console.log('Navigation not available'),
    };
  }
  
  let walletData = { connected: false, balance: 0 };
  try {
    walletData = useWallet();
  } catch (error) {
    console.log('Wallet hook not available in LendingScreen, using fallback');
  }
  
  let lendingData = { 
    lendingMarkets: [], 
    userPositions: [], 
    loading: false, 
    fetchLendingData: () => {},
    supplyAsset: () => {},
    borrowAsset: () => {},
    withdrawAsset: () => {},
    repayAsset: () => {}
  };
  try {
    lendingData = useLending();
  } catch (error) {
    console.log('Lending hook not available in LendingScreen, using fallback');
  }
  
  const { connected, balance } = walletData;
  const { 
    lendingMarkets, 
    userPositions, 
    loading, 
    fetchLendingData, 
    supplyAsset, 
    borrowAsset, 
    withdrawAsset, 
    repayAsset 
  } = lendingData;
  
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState('markets'); // 'markets', 'positions', 'strategies'
  const [selectedProtocol, setSelectedProtocol] = useState('all'); // 'all', 'kamino', 'marginfi'
  const [sortBy, setSortBy] = useState('apy'); // 'apy', 'tvl', 'utilization'
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    fetchLendingData();
    startFadeAnimation();
  }, []);

  const startFadeAnimation = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchLendingData();
    setRefreshing(false);
  }, [fetchLendingData]);

  const navigateToLendingDetail = (marketId) => {
    navigation.navigate('LendingDetail', { marketId });
  };

  const navigateToSupply = (marketId) => {
    navigation.navigate('SupplyScreen', { marketId });
  };

  const navigateToBorrow = (marketId) => {
    navigation.navigate('BorrowScreen', { marketId });
  };

  const navigateToStrategies = () => {
    navigation.navigate('LendingStrategies');
  };

  const getProtocolColor = (protocol) => {
    switch (protocol.toLowerCase()) {
      case 'kamino': return theme.colors.primary;
      case 'marginfi': return theme.colors.secondary;
      default: return theme.colors.accent;
    }
  };

  const getRiskColor = (utilization) => {
    if (utilization > 80) return theme.colors.error;
    if (utilization > 60) return theme.colors.warning;
    return theme.colors.success;
  };

  const renderMarketItem = ({ item, index }) => (
    <Animated.View
      style={[
        styles.marketItem,
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
        style={styles.marketCard}
        onPress={() => navigateToLendingDetail(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.marketHeader}>
          <View style={styles.marketInfo}>
            <View style={styles.assetIcon}>
              <MaterialCommunityIcons 
                name="currency-btc" 
                size={24} 
                color={theme.colors.primary} 
              />
            </View>
            <View style={styles.marketDetails}>
              <Text style={styles.assetSymbol}>{item.asset.symbol}</Text>
              <View style={[styles.protocolBadge, { backgroundColor: getProtocolColor(item.protocol) + '20' }]}>
                <Text style={[styles.protocolText, { color: getProtocolColor(item.protocol) }]}>
                  {item.protocol}
                </Text>
              </View>
            </View>
          </View>
          
          <View style={styles.utilizationIndicator}>
            <MaterialCommunityIcons 
              name="trending-up" 
              size={16} 
              color={getRiskColor(item.utilizationRate)} 
            />
            <Text style={[styles.utilizationText, { color: getRiskColor(item.utilizationRate) }]}>
              {formatPercentage(item.utilizationRate)}
            </Text>
          </View>
        </View>

        <View style={styles.marketStats}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Supply APY</Text>
            <Text style={[styles.statValue, { color: theme.colors.success }]}>
              {formatPercentage(item.supplyApy)}
            </Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Borrow APY</Text>
            <Text style={[styles.statValue, { color: theme.colors.warning }]}>
              {formatPercentage(item.borrowApy)}
            </Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Total Supplied</Text>
            <Text style={styles.statValue}>{formatUSD(item.totalSupplied)}</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Collateral Factor</Text>
            <Text style={styles.statValue}>{formatPercentage(item.collateralFactor)}</Text>
          </View>
        </View>

        {/* User Position Summary */}
        {(item.userSupplied > 0 || item.userBorrowed > 0) && (
          <View style={styles.userPosition}>
            <Text style={styles.userPositionTitle}>Your Position</Text>
            <View style={styles.userPositionStats}>
              {item.userSupplied > 0 && (
                <View style={styles.userStat}>
                  <Text style={styles.userStatLabel}>Supplied</Text>
                  <Text style={styles.userStatValue}>
                    {formatNumber(item.userSupplied)} {item.asset.symbol}
                  </Text>
                  <Text style={styles.userStatValueUSD}>
                    {formatUSD(item.userSuppliedValue)}
                  </Text>
                </View>
              )}
              
              {item.userBorrowed > 0 && (
                <View style={styles.userStat}>
                  <Text style={styles.userStatLabel}>Borrowed</Text>
                  <Text style={styles.userStatValue}>
                    {formatNumber(item.userBorrowed)} {item.asset.symbol}
                  </Text>
                  <Text style={styles.userStatValueUSD}>
                    {formatUSD(item.userBorrowedValue)}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.supplyButton]}
            onPress={() => navigateToSupply(item.id)}
          >
            <MaterialCommunityIcons 
              name="plus-circle" 
              size={16} 
              color={theme.colors.success} 
            />
            <Text style={[styles.actionButtonText, { color: theme.colors.success }]}>
              Supply
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.borrowButton]}
            onPress={() => navigateToBorrow(item.id)}
          >
            <MaterialCommunityIcons 
              name="minus-circle" 
              size={16} 
              color={theme.colors.warning} 
            />
            <Text style={[styles.actionButtonText, { color: theme.colors.warning }]}>
              Borrow
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderPositionItem = ({ item, index }) => (
    <Animated.View
      style={[
        styles.positionItem,
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
      <NeonCard style={styles.positionCard}>
        <View style={styles.positionHeader}>
          <View style={styles.positionInfo}>
            <View style={styles.assetIcon}>
              <MaterialCommunityIcons 
                name="currency-btc" 
                size={24} 
                color={theme.colors.primary} 
              />
            </View>
            <View style={styles.positionDetails}>
              <Text style={styles.assetSymbol}>{item.asset.symbol}</Text>
              <Text style={styles.protocolName}>{item.protocol}</Text>
            </View>
          </View>
          
          <View style={[styles.positionType, { backgroundColor: item.type === 'supply' ? theme.colors.success + '20' : theme.colors.warning + '20' }]}>
            <Text style={[styles.positionTypeText, { color: item.type === 'supply' ? theme.colors.success : theme.colors.warning }]}>
              {item.type.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.positionStats}>
          <View style={styles.positionStat}>
            <Text style={styles.positionStatLabel}>Amount</Text>
            <Text style={styles.positionStatValue}>
              {formatNumber(item.amount)} {item.asset.symbol}
            </Text>
            <Text style={styles.positionStatValueUSD}>
              {formatUSD(item.value)}
            </Text>
          </View>
          
          <View style={styles.positionStat}>
            <Text style={styles.positionStatLabel}>APY</Text>
            <Text style={[styles.positionStatValue, { color: item.type === 'supply' ? theme.colors.success : theme.colors.warning }]}>
              {formatPercentage(item.apy)}
            </Text>
          </View>
          
          <View style={styles.positionStat}>
            <Text style={styles.positionStatLabel}>Earned</Text>
            <Text style={styles.positionStatValue}>
              {formatUSD(item.earned)}
            </Text>
          </View>
        </View>

        <View style={styles.positionActions}>
          {item.type === 'supply' ? (
            <TouchableOpacity
              style={[styles.positionAction, styles.withdrawAction]}
              onPress={() => navigation.navigate('WithdrawScreen', { positionId: item.id })}
            >
              <MaterialCommunityIcons 
                name="download" 
                size={16} 
                color={theme.colors.warning} 
              />
              <Text style={[styles.positionActionText, { color: theme.colors.warning }]}>
                Withdraw
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.positionAction, styles.repayAction]}
              onPress={() => navigation.navigate('RepayScreen', { positionId: item.id })}
            >
              <MaterialCommunityIcons 
                name="upload" 
                size={16} 
                color={theme.colors.success} 
              />
              <Text style={[styles.positionActionText, { color: theme.colors.success }]}>
                Repay
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </NeonCard>
    </Animated.View>
  );

  const renderTabButton = (label, value) => (
    <TouchableOpacity
      style={[
        styles.tabButton,
        selectedTab === value && styles.tabButtonActive
      ]}
      onPress={() => setSelectedTab(value)}
    >
      <Text style={[
        styles.tabButtonText,
        selectedTab === value && styles.tabButtonTextActive
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderProtocolFilter = (label, value) => (
    <TouchableOpacity
      style={[
        styles.filterChip,
        selectedProtocol === value && styles.filterChipActive
      ]}
      onPress={() => setSelectedProtocol(value)}
    >
      <Text style={[
        styles.filterChipText,
        selectedProtocol === value && styles.filterChipTextActive
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderSortButton = (label, value) => (
    <TouchableOpacity
      style={[
        styles.sortButton,
        sortBy === value && styles.sortButtonActive
      ]}
      onPress={() => setSortBy(value)}
    >
      <Text style={[
        styles.sortButtonText,
        sortBy === value && styles.sortButtonTextActive
      ]}>
        {label}
      </Text>
      <MaterialCommunityIcons 
        name={sortBy === value ? 'chevron-up' : 'chevron-down'} 
        size={16} 
        color={sortBy === value ? theme.colors.primary : theme.colors.textSecondary} 
      />
    </TouchableOpacity>
  );

  const filteredMarkets = lendingMarkets.filter(market => {
    if (selectedProtocol !== 'all' && market.protocol.toLowerCase() !== selectedProtocol) {
      return false;
    }
    return true;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'apy':
        return b.supplyApy - a.supplyApy;
      case 'tvl':
        return b.totalSupplied - a.totalSupplied;
      case 'utilization':
        return b.utilizationRate - a.utilizationRate;
      default:
        return 0;
    }
  });

  const userPositionsData = userPositions.filter(position => {
    if (selectedProtocol !== 'all' && position.protocol.toLowerCase() !== selectedProtocol) {
      return false;
    }
    return true;
  });

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>DeFi Lending</Text>
        <TouchableOpacity
          style={styles.strategiesButton}
          onPress={navigateToStrategies}
        >
          <MaterialCommunityIcons 
            name="lightning-bolt" 
            size={20} 
            color={theme.colors.accent} 
          />
          <Text style={styles.strategiesButtonText}>Strategies</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {renderTabButton('Markets', 'markets')}
        {renderTabButton('Positions', 'positions')}
        {renderTabButton('Analytics', 'analytics')}
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <View style={styles.protocolFilters}>
          {renderProtocolFilter('All', 'all')}
          {renderProtocolFilter('Kamino', 'kamino')}
          {renderProtocolFilter('MarginFi', 'marginfi')}
        </View>
        
        <View style={styles.sortContainer}>
          {renderSortButton('APY', 'apy')}
          {renderSortButton('TVL', 'tvl')}
          {renderSortButton('Utilization', 'utilization')}
        </View>
      </View>

      {/* Content */}
      <FlatList
        data={selectedTab === 'markets' ? filteredMarkets : userPositionsData}
        renderItem={selectedTab === 'markets' ? renderMarketItem : renderPositionItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons 
              name={selectedTab === 'markets' ? "bank" : "wallet"} 
              size={64} 
              color={theme.colors.textSecondary} 
            />
            <Text style={styles.emptyTitle}>
              {selectedTab === 'markets' ? 'No markets found' : 'No positions found'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {loading ? 'Loading...' : 'Try adjusting your filters'}
            </Text>
          </View>
        }
        ListHeaderComponent={
          selectedTab === 'markets' && (
            <View style={styles.statsHeader}>
              <Text style={styles.statsTitle}>
                {filteredMarkets.length} markets available
              </Text>
              <Text style={styles.statsSubtitle}>
                Total TVL: {formatUSD(filteredMarkets.reduce((sum, market) => sum + market.totalSupplied, 0))}
              </Text>
            </View>
          )
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  strategiesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.accent,
  },
  strategiesButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.accent,
    marginLeft: 4,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
    marginHorizontal: 4,
  },
  tabButtonActive: {
    backgroundColor: theme.colors.primary + '20',
  },
  tabButtonText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  tabButtonTextActive: {
    color: theme.colors.primary,
  },
  filtersContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  protocolFilters: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: theme.colors.outline,
  },
  filterChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterChipText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  filterChipTextActive: {
    color: '#000000',
    fontWeight: '600',
  },
  sortContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  sortButtonActive: {
    backgroundColor: theme.colors.primary + '20',
  },
  sortButtonText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginRight: 4,
  },
  sortButtonTextActive: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
  },
  statsHeader: {
    marginBottom: 16,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  statsSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  marketItem: {
    marginBottom: 12,
  },
  marketCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.outline,
  },
  marketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  marketInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  assetIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  marketDetails: {
    flex: 1,
  },
  assetSymbol: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  protocolBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  protocolText: {
    fontSize: 12,
    fontWeight: '600',
  },
  utilizationIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  utilizationText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  marketStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    width: '48%',
    marginBottom: 12,
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
  userPosition: {
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  userPositionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 8,
  },
  userPositionStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  userStat: {
    alignItems: 'center',
    flex: 1,
  },
  userStatLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  userStatValue: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  userStatValueUSD: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginHorizontal: 4,
    borderWidth: 1,
  },
  supplyButton: {
    borderColor: theme.colors.success,
    backgroundColor: theme.colors.success + '10',
  },
  borrowButton: {
    borderColor: theme.colors.warning,
    backgroundColor: theme.colors.warning + '10',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  positionItem: {
    marginBottom: 12,
  },
  positionCard: {
    padding: 16,
  },
  positionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  positionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  positionDetails: {
    marginLeft: 12,
  },
  protocolName: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  positionType: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  positionTypeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  positionStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  positionStat: {
    alignItems: 'center',
    flex: 1,
  },
  positionStatLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  positionStatValue: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  positionStatValueUSD: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  positionActions: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  positionAction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  withdrawAction: {
    borderColor: theme.colors.warning,
    backgroundColor: theme.colors.warning + '10',
  },
  repayAction: {
    borderColor: theme.colors.success,
    backgroundColor: theme.colors.success + '10',
  },
  positionActionText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});

export default LendingScreen;