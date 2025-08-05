import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StatusBar,
  Animated,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useWallet } from '../hooks/useWallet';
import { theme } from '../theme';
import NeonCard from '../components/NeonCard';
import { formatUSD, formatNumber, formatTimeAgo } from '../utils/format';

const TransactionHistoryScreen = () => {
  const navigation = useNavigation();
  const { connected, getWalletAddress } = useWallet();
  
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadTransactions();
    startFadeAnimation();
  }, []);

  useEffect(() => {
    filterTransactions();
  }, [transactions, selectedFilter, searchQuery]);

  const startFadeAnimation = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  };

  const loadTransactions = async () => {
    setLoading(true);
    // Mock transaction data - in real app, this would fetch from blockchain
    const mockTransactions = [
      {
        id: '1',
        type: 'supply',
        protocol: 'Kamino',
        asset: 'SOL',
        amount: 2.5,
        value: 375.63,
        status: 'completed',
        timestamp: Date.now() - 3600000, // 1 hour ago
        txHash: '0x1234567890abcdef...',
        gasFee: 0.001,
      },
      {
        id: '2',
        type: 'borrow',
        protocol: 'MarginFi',
        asset: 'USDC',
        amount: 500,
        value: 500,
        status: 'completed',
        timestamp: Date.now() - 7200000, // 2 hours ago
        txHash: '0xabcdef1234567890...',
        gasFee: 0.002,
      },
      {
        id: '3',
        type: 'swap',
        protocol: 'Meteora',
        asset: 'SOL',
        amount: 1.2,
        value: 180.25,
        status: 'pending',
        timestamp: Date.now() - 1800000, // 30 minutes ago
        txHash: '0x7890abcdef123456...',
        gasFee: 0.0015,
      },
      {
        id: '4',
        type: 'withdraw',
        protocol: 'Kamino',
        asset: 'SOL',
        amount: 1.0,
        value: 150.50,
        status: 'failed',
        timestamp: Date.now() - 86400000, // 1 day ago
        txHash: '0x4567890abcdef123...',
        gasFee: 0.001,
      },
    ];
    
    setTimeout(() => {
      setTransactions(mockTransactions);
      setLoading(false);
    }, 1000);
  };

  const filterTransactions = () => {
    let filtered = transactions;

    // Filter by type
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(tx => tx.type === selectedFilter);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(tx => 
        tx.asset.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.protocol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.txHash.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredTransactions(filtered);
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'supply': return 'plus-circle';
      case 'borrow': return 'minus-circle';
      case 'withdraw': return 'download';
      case 'repay': return 'upload';
      case 'swap': return 'swap-horizontal';
      default: return 'currency-btc';
    }
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case 'supply': return theme.colors.success;
      case 'borrow': return theme.colors.warning;
      case 'withdraw': return theme.colors.primary;
      case 'repay': return theme.colors.success;
      case 'swap': return theme.colors.accent;
      default: return theme.colors.textSecondary;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return theme.colors.success;
      case 'pending': return theme.colors.warning;
      case 'failed': return theme.colors.error;
      default: return theme.colors.textSecondary;
    }
  };

  const renderTransactionItem = ({ item, index }) => (
    <Animated.View
      style={[
        styles.transactionItem,
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
        style={styles.transactionCard}
        onPress={() => navigation.navigate('TransactionDetail', { transactionId: item.id })}
        activeOpacity={0.7}
      >
        <View style={styles.transactionHeader}>
          <View style={styles.transactionInfo}>
            <View style={[styles.transactionIcon, { backgroundColor: getTransactionColor(item.type) + '20' }]}>
              <MaterialCommunityIcons 
                name={getTransactionIcon(item.type)} 
                size={24} 
                color={getTransactionColor(item.type)} 
              />
            </View>
            <View style={styles.transactionDetails}>
              <Text style={styles.transactionType}>
                {item.type.charAt(0).toUpperCase() + item.type.slice(1)} {item.asset}
              </Text>
              <Text style={styles.transactionProtocol}>{item.protocol}</Text>
            </View>
          </View>
          
          <View style={styles.transactionAmount}>
            <Text style={[styles.amountText, { color: getTransactionColor(item.type) }]}>
              {item.type === 'borrow' || item.type === 'withdraw' ? '-' : '+'}
              {formatNumber(item.amount)} {item.asset}
            </Text>
            <Text style={styles.amountValue}>{formatUSD(item.value)}</Text>
          </View>
        </View>

        <View style={styles.transactionFooter}>
          <View style={styles.transactionMeta}>
            <View style={styles.metaItem}>
              <MaterialCommunityIcons 
                name="clock-outline" 
                size={16} 
                color={theme.colors.textSecondary} 
              />
              <Text style={styles.metaText}>{formatTimeAgo(item.timestamp)}</Text>
            </View>
            
            <View style={styles.metaItem}>
              <MaterialCommunityIcons 
                name="gas-station" 
                size={16} 
                color={theme.colors.textSecondary} 
              />
              <Text style={styles.metaText}>{formatNumber(item.gasFee)} SOL</Text>
            </View>
          </View>
          
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {item.status.toUpperCase()}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderFilterButton = (label, value) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        selectedFilter === value && styles.filterButtonActive
      ]}
      onPress={() => setSelectedFilter(value)}
    >
      <Text style={[
        styles.filterButtonText,
        selectedFilter === value && styles.filterButtonTextActive
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const getTransactionStats = () => {
    const total = transactions.length;
    const completed = transactions.filter(tx => tx.status === 'completed').length;
    const pending = transactions.filter(tx => tx.status === 'pending').length;
    const failed = transactions.filter(tx => tx.status === 'failed').length;
    
    return { total, completed, pending, failed };
  };

  const stats = getTransactionStats();

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Transaction History</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={loadTransactions}
        >
          <MaterialCommunityIcons 
            name="refresh" 
            size={24} 
            color={theme.colors.primary} 
          />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <NeonCard style={styles.statsCard}>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.colors.success }]}>{stats.completed}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.colors.warning }]}>{stats.pending}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.colors.error }]}>{stats.failed}</Text>
            <Text style={styles.statLabel}>Failed</Text>
          </View>
        </View>
      </NeonCard>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInput}>
          <MaterialCommunityIcons 
            name="magnify" 
            size={20} 
            color={theme.colors.textSecondary} 
          />
          <TextInput
            style={styles.searchTextInput}
            placeholder="Search transactions..."
            placeholderTextColor={theme.colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <MaterialCommunityIcons 
                name="close" 
                size={20} 
                color={theme.colors.textSecondary} 
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        {renderFilterButton('All', 'all')}
        {renderFilterButton('Supply', 'supply')}
        {renderFilterButton('Borrow', 'borrow')}
        {renderFilterButton('Withdraw', 'withdraw')}
        {renderFilterButton('Swap', 'swap')}
      </View>

      {/* Transactions List */}
      <FlatList
        data={filteredTransactions}
        renderItem={renderTransactionItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons 
              name="history" 
              size={64} 
              color={theme.colors.textSecondary} 
            />
            <Text style={styles.emptyTitle}>
              {loading ? 'Loading transactions...' : 'No transactions found'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {loading ? 'Please wait...' : 'Try adjusting your filters or search'}
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
  refreshButton: {
    padding: 8,
  },
  statsCard: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: theme.colors.outline,
  },
  searchTextInput: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text,
    marginLeft: 8,
    marginRight: 8,
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: theme.colors.outline,
  },
  filterButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterButtonText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  filterButtonTextActive: {
    color: '#000000',
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
  },
  transactionItem: {
    marginBottom: 12,
  },
  transactionCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.outline,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  transactionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  transactionProtocol: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  amountValue: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  transactionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionMeta: {
    flexDirection: 'row',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  metaText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginLeft: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
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

export default TransactionHistoryScreen; 