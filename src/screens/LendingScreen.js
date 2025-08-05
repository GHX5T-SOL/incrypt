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
  SegmentedButtons,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useWallet } from '../contexts/WalletProvider';
import { neonStyles } from '../theme';
import { formatCurrency, formatPercentage, formatNumber } from '../utils/format';

// Mock data for lending opportunities
const MOCK_LENDING_OPPORTUNITIES = [
  {
    id: '1',
    protocol: 'Kamino',
    protocolIcon: require('../../assets/protocols/kamino.png'),
    asset: {
      symbol: 'SOL',
      icon: require('../../assets/tokens/sol.png'),
    },
    supplyApy: 5.2,
    borrowApy: 7.8,
    totalSupplied: 28000000,
    totalBorrowed: 18000000,
    utilizationRate: 64.3,
    collateralFactor: 80,
    userSupplied: 2.5,
    userSuppliedValue: 375.63,
    userBorrowed: 0,
    userBorrowedValue: 0,
  },
  {
    id: '2',
    protocol: 'MarginFi',
    protocolIcon: require('../../assets/protocols/marginfi.png'),
    asset: {
      symbol: 'USDC',
      icon: require('../../assets/tokens/usdc.png'),
    },
    supplyApy: 7.8,
    borrowApy: 9.5,
    totalSupplied: 65000000,
    totalBorrowed: 48000000,
    utilizationRate: 73.8,
    collateralFactor: 90,
    userSupplied: 500,
    userSuppliedValue: 500,
    userBorrowed: 0,
    userBorrowedValue: 0,
  },
  {
    id: '3',
    protocol: 'Kamino',
    protocolIcon: require('../../assets/protocols/kamino.png'),
    asset: {
      symbol: 'JTO',
      icon: require('../../assets/tokens/jto.png'),
    },
    supplyApy: 9.4,
    borrowApy: 12.6,
    totalSupplied: 4500000,
    totalBorrowed: 2800000,
    utilizationRate: 62.2,
    collateralFactor: 70,
    userSupplied: 0,
    userSuppliedValue: 0,
    userBorrowed: 0,
    userBorrowedValue: 0,
  },
  {
    id: '4',
    protocol: 'MarginFi',
    protocolIcon: require('../../assets/protocols/marginfi.png'),
    asset: {
      symbol: 'BONK',
      icon: require('../../assets/tokens/bonk.png'),
    },
    supplyApy: 12.5,
    borrowApy: 18.2,
    totalSupplied: 3200000,
    totalBorrowed: 2100000,
    utilizationRate: 65.6,
    collateralFactor: 60,
    userSupplied: 0,
    userSuppliedValue: 0,
    userBorrowed: 0,
    userBorrowedValue: 0,
  },
  {
    id: '5',
    protocol: 'Kamino',
    protocolIcon: require('../../assets/protocols/kamino.png'),
    asset: {
      symbol: 'ORCA',
      icon: require('../../assets/tokens/orca.png'),
    },
    supplyApy: 8.7,
    borrowApy: 11.3,
    totalSupplied: 5800000,
    totalBorrowed: 3500000,
    utilizationRate: 60.3,
    collateralFactor: 75,
    userSupplied: 0,
    userSuppliedValue: 0,
    userBorrowed: 0,
    userBorrowedValue: 0,
  },
];

// Mock data for user lending positions
const MOCK_USER_POSITIONS = [
  {
    id: '1',
    lendingId: '1',
    type: 'supply',
    protocol: 'Kamino',
    protocolIcon: require('../../assets/protocols/kamino.png'),
    asset: {
      symbol: 'SOL',
      icon: require('../../assets/tokens/sol.png'),
    },
    amount: 2.5,
    value: 375.63,
    apy: 5.2,
    interestEarned: 4.32,
    collateral: true,
  },
  {
    id: '2',
    lendingId: '2',
    type: 'supply',
    protocol: 'MarginFi',
    protocolIcon: require('../../assets/protocols/marginfi.png'),
    asset: {
      symbol: 'USDC',
      icon: require('../../assets/tokens/usdc.png'),
    },
    amount: 500,
    value: 500,
    apy: 7.8,
    interestEarned: 8.65,
    collateral: true,
  },
];

const LendingScreen = () => {
  const navigation = useNavigation();
  const theme = useTheme();
  const { publicKey, connected } = useWallet();
  
  const [activeTab, setActiveTab] = useState('opportunities');
  const [opportunities, setOpportunities] = useState([]);
  const [userPositions, setUserPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [totalSupplied, setTotalSupplied] = useState(0);
  const [totalBorrowed, setTotalBorrowed] = useState(0);
  const [netApy, setNetApy] = useState(0);
  
  useEffect(() => {
    fetchData();
  }, []);
  
  useEffect(() => {
    if (userPositions.length > 0) {
      const supplied = userPositions
        .filter(pos => pos.type === 'supply')
        .reduce((sum, pos) => sum + pos.value, 0);
      
      const borrowed = userPositions
        .filter(pos => pos.type === 'borrow')
        .reduce((sum, pos) => sum + pos.value, 0);
      
      // Calculate weighted average APY
      let supplyInterest = 0;
      let borrowInterest = 0;
      
      userPositions.forEach(pos => {
        if (pos.type === 'supply') {
          supplyInterest += (pos.value * pos.apy) / 100;
        } else {
          borrowInterest += (pos.value * pos.apy) / 100;
        }
      });
      
      const netInterest = supplyInterest - borrowInterest;
      const netApyValue = supplied > 0 ? (netInterest / supplied) * 100 : 0;
      
      setTotalSupplied(supplied);
      setTotalBorrowed(borrowed);
      setNetApy(netApyValue);
    }
  }, [userPositions]);
  
  const fetchData = async () => {
    setLoading(true);
    try {
      // In a real app, these would be API calls to lending protocols
      // For now, we'll use mock data
      setTimeout(() => {
        setOpportunities(MOCK_LENDING_OPPORTUNITIES);
        setUserPositions(MOCK_USER_POSITIONS);
        setLoading(false);
        setRefreshing(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching lending data:', error);
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };
  
  const navigateToLendingDetail = (lendingId) => {
    navigation.navigate('LendingDetail', { lendingId });
  };
  
  const renderOpportunityItem = ({ item }) => (
    <TouchableOpacity onPress={() => navigateToLendingDetail(item.id)}>
      <Card style={styles.opportunityCard}>
        <Card.Content>
          <View style={styles.opportunityHeader}>
            <View style={styles.protocolInfo}>
              <Image source={item.protocolIcon} style={styles.protocolIcon} />
              <Text style={styles.protocolName}>{item.protocol}</Text>
            </View>
            <View style={styles.assetInfo}>
              <Image source={item.asset.icon} style={styles.assetIcon} />
              <Text style={styles.assetSymbol}>{item.asset.symbol}</Text>
            </View>
          </View>
          
          <Divider style={styles.divider} />
          
          <View style={styles.ratesContainer}>
            <View style={styles.rateItem}>
              <Text style={styles.rateLabel}>Supply APY</Text>
              <Text style={[styles.rateValue, { color: theme.colors.primary }]}>
                {formatPercentage(item.supplyApy)}
              </Text>
            </View>
            
            <View style={styles.rateItem}>
              <Text style={styles.rateLabel}>Borrow APY</Text>
              <Text style={[styles.rateValue, { color: theme.colors.secondary }]}>
                {formatPercentage(item.borrowApy)}
              </Text>
            </View>
          </View>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Total Supplied</Text>
              <Text style={styles.statValue}>${formatCurrency(item.totalSupplied)}</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Utilization</Text>
              <Text style={styles.statValue}>{formatPercentage(item.utilizationRate)}</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Collateral Factor</Text>
              <Text style={styles.statValue}>{formatPercentage(item.collateralFactor)}</Text>
            </View>
          </View>
          
          {item.userSupplied > 0 && (
            <View style={styles.userPositionContainer}>
              <Text style={styles.userPositionLabel}>Your Supply</Text>
              <Text style={styles.userPositionValue}>
                {formatNumber(item.userSupplied)} {item.asset.symbol} (${formatNumber(item.userSuppliedValue)})
              </Text>
            </View>
          )}
          
          {item.userBorrowed > 0 && (
            <View style={styles.userPositionContainer}>
              <Text style={styles.userPositionLabel}>Your Borrow</Text>
              <Text style={styles.userPositionValue}>
                {formatNumber(item.userBorrowed)} {item.asset.symbol} (${formatNumber(item.userBorrowedValue)})
              </Text>
            </View>
          )}
          
          <View style={styles.actionsContainer}>
            <Button 
              mode="contained" 
              style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
              labelStyle={{ color: '#000000' }}
              onPress={() => navigateToLendingDetail(item.id)}
            >
              Supply
            </Button>
            <Button 
              mode="outlined" 
              style={styles.actionButton}
              onPress={() => navigateToLendingDetail(item.id)}
            >
              Borrow
            </Button>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
  
  const renderPositionItem = ({ item }) => (
    <Card style={[
      styles.positionCard, 
      item.type === 'supply' ? neonStyles.neonPurpleBorder : neonStyles.neonCyanBorder
    ]}>
      <Card.Content>
        <View style={styles.positionHeader}>
          <View style={styles.positionHeaderLeft}>
            <Image source={item.protocolIcon} style={styles.positionProtocolIcon} />
            <Text style={styles.positionProtocolName}>{item.protocol}</Text>
          </View>
          <Chip 
            style={[
              styles.positionTypeChip,
              { 
                backgroundColor: item.type === 'supply' 
                  ? 'rgba(255, 0, 255, 0.2)' 
                  : 'rgba(0, 255, 255, 0.2)' 
              }
            ]}
            textStyle={{ 
              color: item.type === 'supply' ? theme.colors.secondary : theme.colors.accent,
              fontSize: 12,
            }}
          >
            {item.type === 'supply' ? 'Supply' : 'Borrow'}
          </Chip>
        </View>
        
        <View style={styles.positionAssetInfo}>
          <Image source={item.asset.icon} style={styles.positionAssetIcon} />
          <View>
            <Text style={styles.positionAmount}>{formatNumber(item.amount)} {item.asset.symbol}</Text>
            <Text style={styles.positionValue}>${formatNumber(item.value)}</Text>
          </View>
        </View>
        
        <Divider style={styles.divider} />
        
        <View style={styles.positionDetailsContainer}>
          <View style={styles.positionDetailItem}>
            <Text style={styles.positionDetailLabel}>APY</Text>
            <Text style={[
              styles.positionDetailValue, 
              { color: item.type === 'supply' ? theme.colors.primary : theme.colors.secondary }
            ]}>
              {formatPercentage(item.apy)}
            </Text>
          </View>
          
          <View style={styles.positionDetailItem}>
            <Text style={styles.positionDetailLabel}>Interest Earned</Text>
            <Text style={styles.positionDetailValue}>${formatNumber(item.interestEarned)}</Text>
          </View>
          
          {item.type === 'supply' && (
            <View style={styles.positionDetailItem}>
              <Text style={styles.positionDetailLabel}>Collateral</Text>
              <Chip 
                style={[
                  styles.collateralChip,
                  { 
                    backgroundColor: item.collateral 
                      ? 'rgba(0, 255, 159, 0.2)' 
                      : 'rgba(255, 59, 48, 0.2)' 
                  }
                ]}
                textStyle={{ 
                  color: item.collateral ? '#00FF9F' : '#FF3B30',
                  fontSize: 12,
                }}
              >
                {item.collateral ? 'Yes' : 'No'}
              </Chip>
            </View>
          )}
        </View>
        
        <View style={styles.positionActionsContainer}>
          {item.type === 'supply' ? (
            <>
              <Button 
                mode="contained" 
                style={[styles.positionActionButton, { backgroundColor: theme.colors.primary }]}
                labelStyle={{ color: '#000000' }}
                onPress={() => navigateToLendingDetail(item.lendingId)}
              >
                Add
              </Button>
              <Button 
                mode="outlined" 
                style={styles.positionActionButton}
                onPress={() => navigateToLendingDetail(item.lendingId)}
              >
                Withdraw
              </Button>
            </>
          ) : (
            <>
              <Button 
                mode="contained" 
                style={[styles.positionActionButton, { backgroundColor: theme.colors.primary }]}
                labelStyle={{ color: '#000000' }}
                onPress={() => navigateToLendingDetail(item.lendingId)}
              >
                Repay
              </Button>
              <Button 
                mode="outlined" 
                style={styles.positionActionButton}
                onPress={() => navigateToLendingDetail(item.lendingId)}
              >
                Borrow More
              </Button>
            </>
          )}
        </View>
      </Card.Content>
    </Card>
  );
  
  if (loading && !refreshing) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <StatusBar style="light" />
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading lending opportunities...</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <Appbar.Header style={styles.header}>
        <Appbar.Content title="Lending" titleStyle={styles.headerTitle} />
      </Appbar.Header>
      
      {!connected ? (
        <View style={styles.connectWalletContainer}>
          <MaterialCommunityIcons name="wallet-outline" size={64} color={theme.colors.disabled} />
          <Text style={styles.connectWalletText}>Connect your wallet to view lending opportunities</Text>
          <Button 
            mode="contained" 
            style={[styles.connectButton, { backgroundColor: theme.colors.primary }]}
            labelStyle={{ color: '#000000' }}
            onPress={() => navigation.navigate('ConnectWallet')}
          >
            Connect Wallet
          </Button>
        </View>
      ) : (
        <>
          <View style={styles.tabContainer}>
            <SegmentedButtons
              value={activeTab}
              onValueChange={setActiveTab}
              buttons={[
                {
                  value: 'opportunities',
                  label: 'Opportunities',
                },
                {
                  value: 'positions',
                  label: 'Your Positions',
                },
              ]}
              style={styles.segmentedButtons}
            />
          </View>
          
          {activeTab === 'positions' && userPositions.length > 0 && (
            <Card style={styles.summaryCard}>
              <Card.Content>
                <View style={styles.summaryRow}>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Supply Balance</Text>
                    <Text style={styles.summaryValue}>${formatNumber(totalSupplied)}</Text>
                  </View>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Borrow Balance</Text>
                    <Text style={styles.summaryValue}>${formatNumber(totalBorrowed)}</Text>
                  </View>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Net APY</Text>
                    <Text style={[styles.summaryValue, { color: theme.colors.primary }]}>
                      {formatPercentage(netApy)}
                    </Text>
                  </View>
                </View>
              </Card.Content>
            </Card>
          )}
          
          {activeTab === 'opportunities' ? (
            <FlatList
              data={opportunities}
              renderItem={renderOpportunityItem}
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
          ) : userPositions.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="bank-outline" size={64} color={theme.colors.disabled} />
              <Text style={styles.emptyText}>No lending positions found</Text>
              <Text style={styles.emptySubtext}>
                Supply or borrow assets to start earning or leveraging your positions
              </Text>
              <Button 
                mode="contained" 
                style={[styles.browseButton, { backgroundColor: theme.colors.primary }]}
                labelStyle={{ color: '#000000' }}
                onPress={() => setActiveTab('opportunities')}
              >
                View Opportunities
              </Button>
            </View>
          ) : (
            <FlatList
              data={userPositions}
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
          )}
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
  tabContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  segmentedButtons: {
    backgroundColor: '#1E1E1E',
  },
  summaryCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 12,
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
    fontSize: 12,
    marginBottom: 4,
  },
  summaryValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
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
  listContent: {
    padding: 16,
  },
  opportunityCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    marginBottom: 16,
  },
  opportunityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  protocolInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  protocolIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  protocolName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  assetInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C2C2C',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  assetIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 6,
  },
  assetSymbol: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  divider: {
    backgroundColor: '#2C2C2C',
    marginBottom: 16,
  },
  ratesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  rateItem: {
    flex: 1,
    alignItems: 'center',
  },
  rateLabel: {
    color: '#AAAAAA',
    fontSize: 14,
    marginBottom: 4,
  },
  rateValue: {
    fontSize: 20,
    fontWeight: 'bold',
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
    marginBottom: 2,
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  userPositionContainer: {
    backgroundColor: '#2C2C2C',
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
  },
  userPositionLabel: {
    color: '#AAAAAA',
    fontSize: 12,
    marginBottom: 4,
  },
  userPositionValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 5,
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
    marginBottom: 12,
  },
  positionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  positionProtocolIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  positionProtocolName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  positionTypeChip: {
    height: 24,
  },
  positionAssetInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  positionAssetIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  positionAmount: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  positionValue: {
    color: '#AAAAAA',
    fontSize: 14,
  },
  positionDetailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  positionDetailItem: {
    flex: 1,
  },
  positionDetailLabel: {
    color: '#AAAAAA',
    fontSize: 12,
    marginBottom: 4,
  },
  positionDetailValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  collateralChip: {
    height: 24,
    alignSelf: 'flex-start',
  },
  positionActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  positionActionButton: {
    flex: 1,
    marginHorizontal: 5,
  },
});

export default LendingScreen;