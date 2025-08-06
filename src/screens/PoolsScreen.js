import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  StatusBar,
  Animated,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useWallet } from '../hooks/useWallet';
import { useMeteora } from '../hooks/useMeteora';
import { theme, neonStyles } from '../theme';
import NeonCard from '../components/NeonCard';
import NeonButton from '../components/NeonButton';
import { formatUSD, formatPercentage, formatNumber, getSafetyColor, formatSafetyScore } from '../utils/format';

const { width } = Dimensions.get('window');

const PoolsScreen = () => {
  let navigation;
  try {
    navigation = useNavigation();
  } catch (error) {
    console.log('Navigation not available in PoolsScreen, using fallback');
    navigation = {
      navigate: () => console.log('Navigation not available'),
      goBack: () => console.log('Navigation not available'),
    };
  }
  
  let walletData = { connected: false };
  try {
    walletData = useWallet();
  } catch (error) {
    console.log('Wallet hook not available in PoolsScreen, using fallback');
  }
  
  let meteoraData = { pools: [], loading: false, fetchPools: () => {} };
  try {
    meteoraData = useMeteora();
  } catch (error) {
    console.log('Meteora hook not available in PoolsScreen, using fallback');
  }
  
  const { connected } = walletData;
  const { pools, loading, fetchPools } = meteoraData;
  
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [sortBy, setSortBy] = useState('tvl');
  const [showFilters, setShowFilters] = useState(false);
  const [filteredPools, setFilteredPools] = useState([]);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    fetchPools();
    startFadeAnimation();
  }, []);

  useEffect(() => {
    applyFiltersAndSearch();
  }, [pools, searchQuery, selectedType, sortBy]);

  const startFadeAnimation = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  };

  const applyFiltersAndSearch = () => {
    let filtered = [...pools];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(pool => 
        pool.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pool.tokenA?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pool.tokenB?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter(pool => pool.type === selectedType);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'tvl':
          return (b.tvl || 0) - (a.tvl || 0);
        case 'apr':
          return (b.apr || 0) - (a.apr || 0);
        case 'volume':
          return (b.volume24h || 0) - (a.volume24h || 0);
        case 'safety':
          return (b.safetyScore || 0) - (a.safetyScore || 0);
        default:
          return 0;
      }
    });

    setFilteredPools(filtered);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchPools();
    setRefreshing(false);
  }, [fetchPools]);

  const navigateToPoolDetail = (poolId) => {
    navigation.navigate('PoolDetail', { poolId });
  };

  const navigateToCreatePool = () => {
    navigation.navigate('CreatePool');
  };

  const getPoolTypeColor = (type) => {
    switch (type) {
      case 'DLMM': return theme.colors.primary;
      case 'DAMM V2': return theme.colors.secondary;
      default: return theme.colors.accent;
    }
  };

  const getSortIcon = (currentSort) => {
    if (sortBy === currentSort) {
      return 'chevron-up';
    }
    return 'chevron-down';
  };

  const renderPoolItem = ({ item, index }) => (
    <Animated.View
      style={[
        styles.poolItem,
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
        style={styles.poolCard}
        onPress={() => navigateToPoolDetail(item.id || item.address)}
        activeOpacity={0.7}
      >
        <View style={styles.poolHeader}>
          <View style={styles.poolInfo}>
            <View style={styles.tokenPair}>
              <View style={styles.tokenIcon}>
                <MaterialCommunityIcons 
                  name="currency-btc" 
                  size={20} 
                  color={theme.colors.primary} 
                />
              </View>
              <View style={styles.tokenIcon}>
                <MaterialCommunityIcons 
                  name="currency-usd" 
                  size={20} 
                  color={theme.colors.secondary} 
                />
              </View>
            </View>
            <View style={styles.poolDetails}>
              <Text style={styles.poolName}>
                {item.name || `${item.tokenA}/${item.tokenB}`}
              </Text>
              <View style={[styles.poolType, { backgroundColor: getPoolTypeColor(item.type) + '20' }]}>
                <Text style={[styles.poolTypeText, { color: getPoolTypeColor(item.type) }]}>
                  {item.type}
                </Text>
              </View>
            </View>
          </View>
          
          <View style={styles.safetyIndicator}>
            <MaterialCommunityIcons 
              name="shield-check" 
              size={16} 
              color={getSafetyColor(item.safetyScore || 80)} 
            />
            <Text style={[styles.safetyScore, { color: getSafetyColor(item.safetyScore || 80) }]}>
              {item.safetyScore || 80}
            </Text>
          </View>
        </View>

        <View style={styles.poolStats}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>TVL</Text>
            <Text style={styles.statValue}>{formatUSD(item.tvl || 0)}</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>APR</Text>
            <Text style={[styles.statValue, { color: theme.colors.primary }]}>
              {formatPercentage(item.apr || 0)}
            </Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>24h Vol</Text>
            <Text style={styles.statValue}>{formatUSD(item.volume24h || 0)}</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Fees</Text>
            <Text style={styles.statValue}>{formatUSD(item.fees24h || 0)}</Text>
          </View>
        </View>

        {item.binSize && (
          <View style={styles.binInfo}>
            <Text style={styles.binLabel}>Bin Size: {item.binSize}</Text>
          </View>
        )}

        {item.feeScheduler && (
          <View style={styles.schedulerInfo}>
            <Text style={styles.schedulerLabel}>Fee Scheduler: {item.feeScheduler}</Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );

  const renderFilterChip = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.filterChip,
        selectedType === item.value && styles.filterChipActive
      ]}
      onPress={() => setSelectedType(item.value)}
    >
      <Text style={[
        styles.filterChipText,
        selectedType === item.value && styles.filterChipTextActive
      ]}>
        {item.label}
      </Text>
    </TouchableOpacity>
  );

  const renderSortButton = (label, value, key) => (
    <TouchableOpacity
      key={key}
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
        name={getSortIcon(value)} 
        size={16} 
        color={sortBy === value ? theme.colors.primary : theme.colors.textSecondary} 
      />
    </TouchableOpacity>
  );

  const filterOptions = [
    { label: 'All', value: 'all' },
    { label: 'DLMM', value: 'DLMM' },
    { label: 'DAMM V2', value: 'DAMM V2' },
  ];

  const sortOptions = [
    { label: 'TVL', value: 'tvl' },
    { label: 'APR', value: 'apr' },
    { label: 'Volume', value: 'volume' },
    { label: 'Safety', value: 'safety' },
  ];

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Liquidity Pools</Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={navigateToCreatePool}
          >
            <MaterialCommunityIcons 
              name="plus" 
              size={20} 
              color={theme.colors.primary} 
            />
            <Text style={styles.createButtonText}>Create</Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <MaterialCommunityIcons 
            name="magnify" 
            size={20} 
            color={theme.colors.textSecondary} 
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search pools..."
            placeholderTextColor={theme.colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Filters */}
        <View style={styles.filtersContainer}>
          <FlatList
            data={filterOptions}
            renderItem={renderFilterChip}
            keyExtractor={(item) => item.value}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterList}
          />
        </View>

        {/* Sort Options */}
        <View style={styles.sortContainer}>
          {sortOptions.map((option) => renderSortButton(option.label, option.value, option.value))}
        </View>
      </View>

      {/* Pool List */}
      <FlatList
        data={filteredPools}
        renderItem={renderPoolItem}
        keyExtractor={(item) => item.id || item.address}
        contentContainerStyle={styles.poolList}
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
              name="chart-bubble" 
              size={64} 
              color={theme.colors.textSecondary} 
            />
            <Text style={styles.emptyTitle}>No pools found</Text>
            <Text style={styles.emptySubtitle}>
              {loading ? 'Loading pools...' : 'Try adjusting your filters'}
            </Text>
          </View>
        }
        ListHeaderComponent={
          <View style={styles.statsHeader}>
            <Text style={styles.statsTitle}>
              {filteredPools.length} pools found
            </Text>
            <Text style={styles.statsSubtitle}>
              Total TVL: {formatUSD(filteredPools.reduce((sum, pool) => sum + (pool.tvl || 0), 0))}
            </Text>
          </View>
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
    padding: 16,
    paddingBottom: 8,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  createButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
    marginLeft: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.outline,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text,
    marginLeft: 12,
  },
  filtersContainer: {
    marginBottom: 12,
  },
  filterList: {
    paddingRight: 16,
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
    marginBottom: 8,
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
  poolList: {
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
  poolItem: {
    marginBottom: 12,
  },
  poolCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.outline,
  },
  poolHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
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
    fontSize: 18,
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
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  poolStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
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
  binInfo: {
    marginTop: 8,
  },
  binLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  schedulerInfo: {
    marginTop: 4,
  },
  schedulerLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
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

export default PoolsScreen;