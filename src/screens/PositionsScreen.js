import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  Appbar,
  Card,
  Button,
  Chip,
  Divider,
  ActivityIndicator,
  useTheme,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useWallet } from '../contexts/WalletProvider';
import { neonStyles } from '../theme';
import { formatCurrency, formatPercentage, formatNumber } from '../utils/format';

// Mock data for user positions
const MOCK_POSITIONS = [
  {
    id: '1',
    poolId: '1',
    poolName: 'SOL-USDC',
    poolType: 'DLMM',
    token1: {
      symbol: 'SOL',
      amount: 2.5,
      value: 375.63,
      icon: require('../../assets/tokens/sol.png'),
    },
    token2: {
      symbol: 'USDC',
      amount: 375,
      value: 375,
      icon: require('../../assets/tokens/usdc.png'),
    },
    totalValue: 750.63,
    apr: 18.2,
    feesEarned: 12.45,
    priceRange: {
      min: 135.22,
      max: 165.28,
      current: 150.25,
    },
    inRange: true,
    createdAt: '2023-07-01T12:00:00Z',
  },
  {
    id: '2',
    poolId: '2',
    poolName: 'BONK-SOL',
    poolType: 'DAMM V2',
    token1: {
      symbol: 'BONK',
      amount: 5000000,
      value: 61.7,
      icon: require('../../assets/tokens/bonk.png'),
    },
    token2: {
      symbol: 'SOL',
      amount: 0.41,
      value: 61.6,
      icon: require('../../assets/tokens/sol.png'),
    },
    totalValue: 123.3,
    apr: 24.5,
    feesEarned: 5.67,
    createdAt: '2023-07-03T15:30:00Z',
  },
  {
    id: '3',
    poolId: '3',
    poolName: 'JTO-USDC',
    poolType: 'DLMM',
    token1: {
      symbol: 'JTO',
      amount: 20.4,
      value: 50,
      icon: require('../../assets/tokens/jto.png'),
    },
    token2: {
      symbol: 'USDC',
      amount: 50,
      value: 50,
      icon: require('../../assets/tokens/usdc.png'),
    },
    totalValue: 100,
    apr: 15.8,
    feesEarned: 1.23,
    priceRange: {
      min: 2.2,
      max: 2.7,
      current: 2.45,
    },
    inRange: true,
    createdAt: '2023-07-05T09:15:00Z',
  },
];

const PositionsScreen = () => {
  const navigation = useNavigation();
  const theme = useTheme();
  const { publicKey, connected } = useWallet();
  
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [totalValue, setTotalValue] = useState(0);
  const [totalFeesEarned, setTotalFeesEarned] = useState(0);
  
  useEffect(() => {
    fetchPositions();
  }, []);
  
  useEffect(() => {
    if (positions.length > 0) {
      const value = positions.reduce((sum, pos) => sum + pos.totalValue, 0);
      const fees = positions.reduce((sum, pos) => sum + pos.feesEarned, 0);
      
      setTotalValue(value);
      setTotalFeesEarned(fees);
    }
  }, [positions]);
  
  const fetchPositions = async () => {
    setLoading(true);
    try {
      // In a real app, this would be an API call to fetch user positions
      // For now, we'll use mock data
      setTimeout(() => {
        setPositions(MOCK_POSITIONS);
        setLoading(false);
        setRefreshing(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching positions:', error);
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  const onRefresh = () => {
    setRefreshing(true);
    fetchPositions();
  };
  
  const navigateToPoolDetail = (poolId) => {
    navigation.navigate('PoolDetail', { poolId });
  };
  
  const handleRemoveLiquidity = (positionId) => {
    // In a real app, this would navigate to a remove liquidity screen
    // or show a modal to confirm removal
    console.log('Remove liquidity for position:', positionId);
  };
  
  const renderPositionItem = ({ item }) => (
    <Card style={[
      styles.positionCard, 
      item.poolType === 'DLMM' ? neonStyles.neonPurpleBorder : neonStyles.neonCyanBorder
    ]}>
      <Card.Content>
        <View style={styles.positionHeader}>
          <View style={styles.tokenIcons}>
            <Image source={item.token1.icon} style={styles.tokenIcon} />
            <Image source={item.token2.icon} style={[styles.tokenIcon, styles.tokenIconOverlap]} />
          </View>
          <View style={[
            styles.poolTypeTag,
            { 
              backgroundColor: item.poolType === 'DLMM' 
                ? 'rgba(255, 0, 255, 0.2)' 
                : 'rgba(0, 255, 255, 0.2)' 
            }
          ]}>
            <Text style={[
              styles.poolTypeText,
              { 
                color: item.poolType === 'DLMM' 
                  ? theme.colors.secondary 
                  : theme.colors.accent 
              }
            ]}>
              {item.poolType}
            </Text>
          </View>
        </View>
        
        <Text style={styles.poolName}>{item.poolName}</Text>
        
        <View style={styles.valueContainer}>
          <Text style={styles.valueLabel}>Total Value</Text>
          <Text style={styles.valueAmount}>${formatNumber(item.totalValue)}</Text>
        </View>
        
        <View style={styles.tokensContainer}>
          <View style={styles.tokenInfo}>
            <Image source={item.token1.icon} style={styles.tokenInfoIcon} />
            <View>
              <Text style={styles.tokenAmount}>{formatNumber(item.token1.amount)} {item.token1.symbol}</Text>
              <Text style={styles.tokenValue}>${formatNumber(item.token1.value)}</Text>
            </View>
          </View>
          
          <View style={styles.tokenInfo}>
            <Image source={item.token2.icon} style={styles.tokenInfoIcon} />
            <View>
              <Text style={styles.tokenAmount}>{formatNumber(item.token2.amount)} {item.token2.symbol}</Text>
              <Text style={styles.tokenValue}>${formatNumber(item.token2.value)}</Text>
            </View>
          </View>
        </View>
        
        <Divider style={styles.divider} />
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>APR</Text>
            <Text style={[styles.statValue, { color: theme.colors.primary }]}>
              {formatPercentage(item.apr)}
            </Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Fees Earned</Text>
            <Text style={styles.statValue}>${formatNumber(item.feesEarned)}</Text>
          </View>
          
          {item.poolType === 'DLMM' && (
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Status</Text>
              <Chip 
                style={[
                  styles.statusChip,
                  { 
                    backgroundColor: item.inRange 
                      ? 'rgba(0, 255, 159, 0.2)' 
                      : 'rgba(255, 59, 48, 0.2)' 
                  }
                ]}
                textStyle={{ 
                  color: item.inRange ? '#00FF9F' : '#FF3B30',
                  fontSize: 12,
                }}
              >
                {item.inRange ? 'In Range' : 'Out of Range'}
              </Chip>
            </View>
          )}
        </View>
        
        <View style={styles.actionsContainer}>
          <Button 
            mode="contained" 
            style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
            labelStyle={{ color: '#000000' }}
            onPress={() => navigateToPoolDetail(item.poolId)}
          >
            Details
          </Button>
          <Button 
            mode="outlined" 
            style={styles.actionButton}
            onPress={() => handleRemoveLiquidity(item.id)}
          >
            Remove
          </Button>
        </View>
      </Card.Content>
    </Card>
  );
  
  if (loading && !refreshing) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <StatusBar style="light" />
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading your positions...</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <Appbar.Header style={styles.header}>
        <Appbar.Content title="My Positions" titleStyle={styles.headerTitle} />
      </Appbar.Header>
      
      {!connected ? (
        <View style={styles.connectWalletContainer}>
          <MaterialCommunityIcons name="wallet-outline" size={64} color={theme.colors.disabled} />
          <Text style={styles.connectWalletText}>Connect your wallet to view positions</Text>
          <Button 
            mode="contained" 
            style={[styles.connectButton, { backgroundColor: theme.colors.primary }]}
            labelStyle={{ color: '#000000' }}
            onPress={() => navigation.navigate('ConnectWallet')}
          >
            Connect Wallet
          </Button>
        </View>
      ) : positions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="flask-empty-outline" size={64} color={theme.colors.disabled} />
          <Text style={styles.emptyText}>No positions found</Text>
          <Text style={styles.emptySubtext}>
            Join a liquidity pool to start earning fees
          </Text>
          <Button 
            mode="contained" 
            style={[styles.browseButton, { backgroundColor: theme.colors.primary }]}
            labelStyle={{ color: '#000000' }}
            onPress={() => navigation.navigate('Pools')}
          >
            Browse Pools
          </Button>
        </View>
      ) : (
        <>
          <Card style={styles.summaryCard}>
            <Card.Content>
              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Total Value</Text>
                  <Text style={styles.summaryValue}>${formatNumber(totalValue)}</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Total Fees Earned</Text>
                  <Text style={styles.summaryValue}>${formatNumber(totalFeesEarned)}</Text>
                </View>
              </View>
            </Card.Content>
          </Card>
          
          <FlatList
            data={positions}
            renderItem={renderPositionItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl 
                refreshing={refreshing} 
                onRefresh={onRefresh} 
                tintColor={theme.colors.primary}
              />
            }
          />
        </>
      )}
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
  header: {
    backgroundColor: '#1A1A1A',
    elevation: 0,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  connectWalletContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  connectWalletText: {
    color: '#FFFFFF',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  connectButton: {
    paddingHorizontal: 24,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
  },
  browseButton: {
    paddingHorizontal: 24,
  },
  summaryCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    margin: 16,
    marginBottom: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    color: '#AAAAAA',
    fontSize: 14,
    marginBottom: 4,
  },
  summaryValue: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
  },
  positionCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  positionHeader: {
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
    marginBottom: 12,
  },
  valueContainer: {
    marginBottom: 12,
  },
  valueLabel: {
    color: '#AAAAAA',
    fontSize: 14,
  },
  valueAmount: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  tokensContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  tokenInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tokenInfoIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  tokenAmount: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  tokenValue: {
    color: '#AAAAAA',
    fontSize: 12,
  },
  divider: {
    backgroundColor: '#2C2C2C',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    color: '#AAAAAA',
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  statusChip: {
    height: 24,
    alignSelf: 'flex-start',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 5,
  },
});

export default PositionsScreen;