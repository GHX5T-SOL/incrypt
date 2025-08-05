import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  Appbar,
  Searchbar,
  Chip,
  Card,
  Button,
  ActivityIndicator,
  useTheme,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useWallet } from '../contexts/WalletProvider';
import { neonStyles } from '../theme';
import { formatCurrency, formatPercentage } from '../utils/format';

const { width } = Dimensions.get('window');

// Mock data for pools
const MOCK_POOLS = [
  {
    id: '1',
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
      icon: require('../../assets/tokens/sol.png'),
    },
    token2: {
      symbol: 'USDC',
      icon: require('../../assets/tokens/usdc.png'),
    },
  },
  {
    id: '2',
    name: 'BONK-SOL',
    type: 'DAMM V2',
    tvl: 12800000,
    apr: 24.5,
    volume24h: 2100000,
    fees24h: 6300,
    feeScheduler: 'Linear',
    rugcheckScore: 88,
    token1: {
      symbol: 'BONK',
      icon: require('../../assets/tokens/bonk.png'),
    },
    token2: {
      symbol: 'SOL',
      icon: require('../../assets/tokens/sol.png'),
    },
  },
  {
    id: '3',
    name: 'JTO-USDC',
    type: 'DLMM',
    tvl: 8500000,
    apr: 15.8,
    volume24h: 1200000,
    fees24h: 3600,
    binSize: 5,
    rugcheckScore: 92,
    token1: {
      symbol: 'JTO',
      icon: require('../../assets/tokens/jto.png'),
    },
    token2: {
      symbol: 'USDC',
      icon: require('../../assets/tokens/usdc.png'),
    },
  },
  {
    id: '4',
    name: 'USDC-USDT',
    type: 'DAMM V2',
    tvl: 65000000,
    apr: 8.4,
    volume24h: 15000000,
    fees24h: 45000,
    feeScheduler: 'Exponential',
    rugcheckScore: 98,
    token1: {
      symbol: 'USDC',
      icon: require('../../assets/tokens/usdc.png'),
    },
    token2: {
      symbol: 'USDT',
      icon: require('../../assets/tokens/usdt.png'),
    },
  },
  {
    id: '5',
    name: 'SOL-BONK',
    type: 'DLMM',
    tvl: 7200000,
    apr: 22.1,
    volume24h: 1800000,
    fees24h: 5400,
    binSize: 15,
    rugcheckScore: 85,
    token1: {
      symbol: 'SOL',
      icon: require('../../assets/tokens/sol.png'),
    },
    token2: {
      symbol: 'BONK',
      icon: require('../../assets/tokens/bonk.png'),
    },
  },
  {
    id: '6',
    name: 'ORCA-SOL',
    type: 'DAMM V2',
    tvl: 5800000,
    apr: 19.7,
    volume24h: 950000,
    fees24h: 2850,
    feeScheduler: 'Linear',
    rugcheckScore: 90,
    token1: {
      symbol: 'ORCA',
      icon: require('../../assets/tokens/orca.png'),
    },
    token2: {
      symbol: 'SOL',
      icon: require('../../assets/tokens/sol.png'),
    },
  },
];

const PoolsScreen = () => {
  const navigation = useNavigation();
  const theme = useTheme();
  const { connected } = useWallet();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    type: null, // 'DLMM' or 'DAMM V2'
    sortBy: 'tvl', // 'tvl', 'apr', 'volume'
    sortOrder: 'desc', // 'asc' or 'desc'
  });
  const [pools, setPools] = useState([]);
  const [filteredPools, setFilteredPools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchPools();
  }, []);

  useEffect(() => {
    applyFiltersAndSearch();
  }, [pools, filters, searchQuery]);

  const fetchPools = async () => {
    setLoading(true);
    try {
      // In a real app, this would be an API call to Meteora
      // For now, we'll use mock data
      setTimeout(() => {
        setPools(MOCK_POOLS);
        setLoading(false);
        setRefreshing(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching pools:', error);
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchPools();
  };

  const applyFiltersAndSearch = () => {
    let result = [...pools];
    
    // Apply type filter
    if (filters.type) {
      result = result.filter(pool => pool.type === filters.type);
    }
    
    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        pool => 
          pool.name.toLowerCase().includes(query) ||
          pool.token1.symbol.toLowerCase().includes(query) ||
          pool.token2.symbol.toLowerCase().includes(query)
      );
    }
    
    // Apply sorting
    result.sort((a, b) => {
      const factor = filters.sortOrder === 'asc' ? 1 : -1;
      return (a[filters.sortBy] - b[filters.sortBy]) * factor;
    });
    
    setFilteredPools(result);
  };

  const toggleTypeFilter = (type) => {
    setFilters(prev => ({
      ...prev,
      type: prev.type === type ? null : type,
    }));
  };

  const setSortBy = (sortBy) => {
    setFilters(prev => ({
      ...prev,
      sortBy,
      sortOrder: prev.sortBy === sortBy && prev.sortOrder === 'desc' ? 'asc' : 'desc',
    }));
  };

  const navigateToPoolDetail = (poolId) => {
    navigation.navigate('PoolDetail', { poolId });
  };

  const navigateToCreatePool = () => {
    navigation.navigate('CreatePool');
  };

  const renderPoolItem = ({ item }) => (
    <TouchableOpacity onPress={() => navigateToPoolDetail(item.id)}>
      <Card 
        style={[
          styles.poolCard, 
          item.type === 'DLMM' ? neonStyles.neonPurpleBorder : neonStyles.neonCyanBorder
        ]}
      >
        <Card.Content>
          <View style={styles.poolHeader}>
            <View style={styles.tokenIcons}>
              <Image source={item.token1.icon} style={styles.tokenIcon} />
              <Image source={item.token2.icon} style={[styles.tokenIcon, styles.tokenIconOverlap]} />
            </View>
            <View style={[
              styles.poolTypeTag,
              { 
                backgroundColor: item.type === 'DLMM' 
                  ? 'rgba(255, 0, 255, 0.2)' 
                  : 'rgba(0, 255, 255, 0.2)' 
              }
            ]}>
              <Text style={[
                styles.poolTypeText,
                { 
                  color: item.type === 'DLMM' 
                    ? theme.colors.secondary 
                    : theme.colors.accent 
                }
              ]}>
                {item.type}
              </Text>
            </View>
          </View>
          
          <Text style={styles.poolName}>{item.name}</Text>
          
          <View style={styles.poolStatsRow}>
            <View style={styles.poolStat}>
              <Text style={styles.poolStatLabel}>TVL</Text>
              <Text style={styles.poolStatValue}>${formatCurrency(item.tvl)}</Text>
            </View>
            <View style={styles.poolStat}>
              <Text style={styles.poolStatLabel}>APR</Text>
              <Text style={[
                styles.poolStatValue, 
                { color: theme.colors.primary }
              ]}>
                {formatPercentage(item.apr)}
              </Text>
            </View>
            <View style={styles.poolStat}>
              <Text style={styles.poolStatLabel}>24h Volume</Text>
              <Text style={styles.poolStatValue}>${formatCurrency(item.volume24h)}</Text>
            </View>
          </View>
          
          <View style={styles.poolDetailsRow}>
            {item.type === 'DLMM' ? (
              <View style={styles.poolDetail}>
                <Text style={styles.poolDetailLabel}>Bin Size</Text>
                <Text style={styles.poolDetailValue}>{item.binSize}%</Text>
              </View>
            ) : (
              <View style={styles.poolDetail}>
                <Text style={styles.poolDetailLabel}>Fee Scheduler</Text>
                <Text style={styles.poolDetailValue}>{item.feeScheduler}</Text>
              </View>
            )}
            
            <View style={styles.poolDetail}>
              <Text style={styles.poolDetailLabel}>24h Fees</Text>
              <Text style={styles.poolDetailValue}>${formatCurrency(item.fees24h)}</Text>
            </View>
            
            <View style={styles.poolDetail}>
              <Text style={styles.poolDetailLabel}>Rugcheck</Text>
              <View style={styles.rugcheckContainer}>
                <Text style={[
                  styles.rugcheckScore,
                  { 
                    color: item.rugcheckScore > 90 
                      ? '#00FF9F' 
                      : item.rugcheckScore > 80 
                        ? '#FFFF00' 
                        : '#FF6B6B' 
                  }
                ]}>
                  {item.rugcheckScore}
                </Text>
              </View>
            </View>
          </View>
          
          <View style={styles.poolActions}>
            <Button 
              mode="contained" 
              style={[styles.poolButton, { backgroundColor: theme.colors.primary }]}
              labelStyle={{ color: '#000000' }}
              onPress={() => navigateToPoolDetail(item.id)}
            >
              Details
            </Button>
            <Button 
              mode="outlined" 
              style={styles.poolButton}
              onPress={() => navigation.navigate('JoinPool', { poolId: item.id })}
            >
              Join Pool
            </Button>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <Appbar.Header style={styles.header}>
        <Appbar.Content title="Liquidity Pools" titleStyle={styles.headerTitle} />
        <Appbar.Action 
          icon="plus-circle" 
          color={theme.colors.primary}
          onPress={navigateToCreatePool} 
        />
      </Appbar.Header>
      
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search pools..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
          inputStyle={{ color: '#FFFFFF' }}
          iconColor={theme.colors.primary}
          placeholderTextColor="#777777"
        />
      </View>
      
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <Chip
            selected={filters.type === 'DLMM'}
            onPress={() => toggleTypeFilter('DLMM')}
            style={[
              styles.filterChip,
              filters.type === 'DLMM' && { backgroundColor: 'rgba(255, 0, 255, 0.2)' }
            ]}
            textStyle={{ 
              color: filters.type === 'DLMM' ? theme.colors.secondary : '#FFFFFF' 
            }}
          >
            DLMM
          </Chip>
          <Chip
            selected={filters.type === 'DAMM V2'}
            onPress={() => toggleTypeFilter('DAMM V2')}
            style={[
              styles.filterChip,
              filters.type === 'DAMM V2' && { backgroundColor: 'rgba(0, 255, 255, 0.2)' }
            ]}
            textStyle={{ 
              color: filters.type === 'DAMM V2' ? theme.colors.accent : '#FFFFFF' 
            }}
          >
            DAMM V2
          </Chip>
          <Chip
            selected={filters.sortBy === 'tvl'}
            onPress={() => setSortBy('tvl')}
            style={[
              styles.filterChip,
              filters.sortBy === 'tvl' && { backgroundColor: 'rgba(0, 255, 159, 0.2)' }
            ]}
            textStyle={{ 
              color: filters.sortBy === 'tvl' ? theme.colors.primary : '#FFFFFF' 
            }}
          >
            TVL {filters.sortBy === 'tvl' && (filters.sortOrder === 'desc' ? '↓' : '↑')}
          </Chip>
          <Chip
            selected={filters.sortBy === 'apr'}
            onPress={() => setSortBy('apr')}
            style={[
              styles.filterChip,
              filters.sortBy === 'apr' && { backgroundColor: 'rgba(0, 255, 159, 0.2)' }
            ]}
            textStyle={{ 
              color: filters.sortBy === 'apr' ? theme.colors.primary : '#FFFFFF' 
            }}
          >
            APR {filters.sortBy === 'apr' && (filters.sortOrder === 'desc' ? '↓' : '↑')}
          </Chip>
          <Chip
            selected={filters.sortBy === 'volume24h'}
            onPress={() => setSortBy('volume24h')}
            style={[
              styles.filterChip,
              filters.sortBy === 'volume24h' && { backgroundColor: 'rgba(0, 255, 159, 0.2)' }
            ]}
            textStyle={{ 
              color: filters.sortBy === 'volume24h' ? theme.colors.primary : '#FFFFFF' 
            }}
          >
            Volume {filters.sortBy === 'volume24h' && (filters.sortOrder === 'desc' ? '↓' : '↑')}
          </Chip>
        </ScrollView>
      </View>
      
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading pools...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredPools}
          renderItem={renderPoolItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
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
                name="flask-empty-outline" 
                size={64} 
                color={theme.colors.disabled} 
              />
              <Text style={styles.emptyText}>No pools found</Text>
              <Text style={styles.emptySubtext}>
                Try adjusting your filters or create a new pool
              </Text>
              <Button 
                mode="contained" 
                style={[styles.createButton, { backgroundColor: theme.colors.primary }]}
                labelStyle={{ color: '#000000' }}
                onPress={navigateToCreatePool}
              >
                Create Pool
              </Button>
            </View>
          }
        />
      )}
      
      {!loading && filteredPools.length > 0 && (
        <View style={styles.fabContainer}>
          <TouchableOpacity
            style={[styles.fab, { backgroundColor: theme.colors.primary }, neonStyles.neonContainer]}
            onPress={navigateToCreatePool}
          >
            <MaterialCommunityIcons name="plus" size={24} color="#000000" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
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
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchbar: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    elevation: 0,
  },
  filtersContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  filterChip: {
    marginRight: 8,
    backgroundColor: '#2C2C2C',
  },
  listContent: {
    padding: 16,
    paddingBottom: 80, // Extra padding for FAB
  },
  poolCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    marginBottom: 16,
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
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  poolStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  poolStat: {
    flex: 1,
  },
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
  poolDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#2C2C2C',
  },
  poolDetail: {
    flex: 1,
  },
  poolDetailLabel: {
    color: '#AAAAAA',
    fontSize: 12,
    marginBottom: 2,
  },
  poolDetailValue: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  rugcheckContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rugcheckScore: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  poolActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  poolButton: {
    flex: 1,
    marginHorizontal: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
  },
  emptySubtext: {
    color: '#AAAAAA',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
    paddingHorizontal: 32,
  },
  createButton: {
    paddingHorizontal: 24,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 16,
    right: 16,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default PoolsScreen;