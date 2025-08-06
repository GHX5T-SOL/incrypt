import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  StatusBar,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import {
  Appbar,
  Card,
  Button,
  TextInput,
  Slider,
  Switch,
  Divider,
  ActivityIndicator,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useWallet } from '../contexts/WalletProvider';
import { useConnection } from '../contexts/ConnectionProvider';
import { theme, neonStyles } from '../theme';
import { formatCurrency, formatPercentage, formatNumber } from '../utils/format';
import Toast from 'react-native-toast-message';

// Mock data for a specific pool (same as in PoolDetailScreen)
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
    poolAddress: '7Q3itPSu3XTYbNrRMSvEhXmwmWKNNX9JiMNSrqJqVYKP',
  };
  
  return poolData;
};

const JoinPoolScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { publicKey, balance, sendTransaction } = useWallet();
  const connection = useConnection();
  
  const { poolId } = route.params;
  const [pool, setPool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [token1Amount, setToken1Amount] = useState('');
  const [token2Amount, setToken2Amount] = useState('');
  const [singleSided, setSingleSided] = useState(false);
  const [selectedToken, setSelectedToken] = useState(null); // For single-sided liquidity
  const [customRange, setCustomRange] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [autoCompound, setAutoCompound] = useState(true);
  
  useEffect(() => {
    fetchPoolData();
  }, [poolId]);
  
  useEffect(() => {
    if (pool) {
      // Initialize with default values
      setMinPrice(pool.priceRange.min.toString());
      setMaxPrice(pool.priceRange.max.toString());
      setSelectedToken(pool.token1.symbol);
    }
  }, [pool]);
  
  // Calculate the other token amount based on price ratio when one token amount changes
  useEffect(() => {
    if (!pool || singleSided) return;
    
    if (token1Amount && !isNaN(parseFloat(token1Amount))) {
      const amount1 = parseFloat(token1Amount);
      const amount2 = amount1 * pool.token1.price / pool.token2.price;
      setToken2Amount(amount2.toFixed(6));
    }
  }, [token1Amount, pool, singleSided]);
  
  useEffect(() => {
    if (!pool || singleSided) return;
    
    if (token2Amount && !isNaN(parseFloat(token2Amount))) {
      const amount2 = parseFloat(token2Amount);
      const amount1 = amount2 * pool.token2.price / pool.token1.price;
      setToken1Amount(amount1.toFixed(6));
    }
  }, [token2Amount, pool, singleSided]);
  
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
  
  const handleSubmit = async () => {
    if (!publicKey) {
      Alert.alert('Error', 'Please connect your wallet first');
      return;
    }
    
    if (singleSided) {
      if (selectedToken === pool.token1.symbol && (!token1Amount || parseFloat(token1Amount) <= 0)) {
        Alert.alert('Error', `Please enter a valid ${pool.token1.symbol} amount`);
        return;
      }
      if (selectedToken === pool.token2.symbol && (!token2Amount || parseFloat(token2Amount) <= 0)) {
        Alert.alert('Error', `Please enter a valid ${pool.token2.symbol} amount`);
        return;
      }
    } else {
      if (!token1Amount || parseFloat(token1Amount) <= 0 || !token2Amount || parseFloat(token2Amount) <= 0) {
        Alert.alert('Error', 'Please enter valid amounts for both tokens');
        return;
      }
    }
    
    if (customRange) {
      if (!minPrice || !maxPrice || parseFloat(minPrice) <= 0 || parseFloat(maxPrice) <= 0) {
        Alert.alert('Error', 'Please enter valid price range values');
        return;
      }
      if (parseFloat(minPrice) >= parseFloat(maxPrice)) {
        Alert.alert('Error', 'Min price must be less than max price');
        return;
      }
    }
    
    setSubmitting(true);
    
    try {
      // In a real app, this would create and send a transaction to join the pool
      // For now, we'll simulate a successful transaction
      setTimeout(() => {
        Toast.show({
          type: 'success',
          text1: 'Success!',
          text2: 'You have successfully joined the pool',
        });
        setSubmitting(false);
        navigation.navigate('Positions');
      }, 2000);
    } catch (error) {
      console.error('Error joining pool:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to join pool. Please try again.',
      });
      setSubmitting(false);
    }
  };
  
  const calculateExpectedLiquidity = () => {
    if (!pool || (!token1Amount && !token2Amount)) return 0;
    
    let liquidityValue = 0;
    
    if (singleSided) {
      if (selectedToken === pool.token1.symbol && token1Amount) {
        liquidityValue = parseFloat(token1Amount) * pool.token1.price;
      } else if (selectedToken === pool.token2.symbol && token2Amount) {
        liquidityValue = parseFloat(token2Amount) * pool.token2.price;
      }
    } else {
      if (token1Amount && token2Amount) {
        liquidityValue = 
          parseFloat(token1Amount) * pool.token1.price + 
          parseFloat(token2Amount) * pool.token2.price;
      }
    }
    
    return liquidityValue;
  };
  
  const calculateExpectedAPR = () => {
    // In a real app, this would calculate the expected APR based on the liquidity provided
    // For now, we'll return the pool's APR
    return pool ? pool.apr : 0;
  };
  
  const toggleSingleSided = () => {
    setSingleSided(!singleSided);
    // Reset amounts when toggling
    setToken1Amount('');
    setToken2Amount('');
  };
  
  const toggleCustomRange = () => {
    setCustomRange(!customRange);
    if (!customRange) {
      // When enabling custom range, initialize with pool's range
      setMinPrice(pool.priceRange.min.toString());
      setMaxPrice(pool.priceRange.max.toString());
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
  
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction color="#FFFFFF" onPress={() => navigation.goBack()} />
        <Appbar.Content title="Join Pool" subtitle={pool.name} titleStyle={styles.headerTitle} />
      </Appbar.Header>
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        {/* Pool Info Card */}
        <Card style={styles.poolCard}>
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
            
            <View style={styles.poolStats}>
              <View style={styles.poolStat}>
                <Text style={styles.poolStatLabel}>Current Price</Text>
                <Text style={styles.poolStatValue}>
                  ${formatNumber(pool.priceRange.current)}
                </Text>
              </View>
              <View style={styles.poolStat}>
                <Text style={styles.poolStatLabel}>APR</Text>
                <Text style={[styles.poolStatValue, { color: theme.colors.primary }]}>
                  {formatPercentage(pool.apr)}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>
        
        {/* Liquidity Type Card */}
        <Card style={styles.formCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Liquidity Type</Text>
            
            <View style={styles.toggleContainer}>
              <Text style={styles.toggleLabel}>Single-sided Liquidity</Text>
              <Switch
                value={singleSided}
                onValueChange={toggleSingleSided}
                color={theme.colors.primary}
              />
            </View>
            
            {singleSided && (
              <View style={styles.tokenSelection}>
                <Text style={styles.inputLabel}>Select Token</Text>
                <View style={styles.tokenButtons}>
                  <TouchableOpacity
                    style={[
                      styles.tokenButton,
                      selectedToken === pool.token1.symbol && {
                        backgroundColor: 'rgba(0, 255, 159, 0.2)',
                        borderColor: theme.colors.primary,
                      },
                    ]}
                    onPress={() => setSelectedToken(pool.token1.symbol)}
                  >
                    <Image source={pool.token1.icon} style={styles.tokenButtonIcon} />
                    <Text style={styles.tokenButtonText}>{pool.token1.symbol}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.tokenButton,
                      selectedToken === pool.token2.symbol && {
                        backgroundColor: 'rgba(0, 255, 159, 0.2)',
                        borderColor: theme.colors.primary,
                      },
                    ]}
                    onPress={() => setSelectedToken(pool.token2.symbol)}
                  >
                    <Image source={pool.token2.icon} style={styles.tokenButtonIcon} />
                    <Text style={styles.tokenButtonText}>{pool.token2.symbol}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </Card.Content>
        </Card>
        
        {/* Amount Inputs Card */}
        <Card style={styles.formCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Amount</Text>
            
            {(!singleSided || (singleSided && selectedToken === pool.token1.symbol)) && (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>{pool.token1.symbol} Amount</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    value={token1Amount}
                    onChangeText={setToken1Amount}
                    keyboardType="numeric"
                    placeholder={`Enter ${pool.token1.symbol} amount`}
                    placeholderTextColor="#777777"
                    mode="outlined"
                    outlineColor="#2C2C2C"
                    activeOutlineColor={theme.colors.primary}
                    right={
                      <TextInput.Affix
                        text={pool.token1.symbol}
                        textStyle={{ color: '#AAAAAA' }}
                      />
                    }
                  />
                  <TouchableOpacity
                    style={styles.maxButton}
                    onPress={() => {
                      // In a real app, this would set the max available balance
                      setToken1Amount('10');
                    }}
                  >
                    <Text style={styles.maxButtonText}>MAX</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.balanceText}>
                  Balance: 10 {pool.token1.symbol} (${formatNumber(10 * pool.token1.price)})
                </Text>
              </View>
            )}
            
            {(!singleSided || (singleSided && selectedToken === pool.token2.symbol)) && (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>{pool.token2.symbol} Amount</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    value={token2Amount}
                    onChangeText={setToken2Amount}
                    keyboardType="numeric"
                    placeholder={`Enter ${pool.token2.symbol} amount`}
                    placeholderTextColor="#777777"
                    mode="outlined"
                    outlineColor="#2C2C2C"
                    activeOutlineColor={theme.colors.primary}
                    right={
                      <TextInput.Affix
                        text={pool.token2.symbol}
                        textStyle={{ color: '#AAAAAA' }}
                      />
                    }
                  />
                  <TouchableOpacity
                    style={styles.maxButton}
                    onPress={() => {
                      // In a real app, this would set the max available balance
                      setToken2Amount('1500');
                    }}
                  >
                    <Text style={styles.maxButtonText}>MAX</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.balanceText}>
                  Balance: 1,500 {pool.token2.symbol} (${formatNumber(1500 * pool.token2.price)})
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>
        
        {/* Price Range Card (for DLMM pools) */}
        {pool.type === 'DLMM' && (
          <Card style={styles.formCard}>
            <Card.Content>
              <Text style={styles.sectionTitle}>Price Range</Text>
              
              <View style={styles.toggleContainer}>
                <Text style={styles.toggleLabel}>Custom Price Range</Text>
                <Switch
                  value={customRange}
                  onValueChange={toggleCustomRange}
                  color={theme.colors.primary}
                />
              </View>
              
              {customRange ? (
                <View>
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Min Price ({pool.token2.symbol})</Text>
                    <TextInput
                      style={styles.input}
                      value={minPrice}
                      onChangeText={setMinPrice}
                      keyboardType="numeric"
                      placeholder="Enter min price"
                      placeholderTextColor="#777777"
                      mode="outlined"
                      outlineColor="#2C2C2C"
                      activeOutlineColor={theme.colors.primary}
                      right={
                        <TextInput.Affix
                          text={pool.token2.symbol}
                          textStyle={{ color: '#AAAAAA' }}
                        />
                      }
                    />
                  </View>
                  
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Max Price ({pool.token2.symbol})</Text>
                    <TextInput
                      style={styles.input}
                      value={maxPrice}
                      onChangeText={setMaxPrice}
                      keyboardType="numeric"
                      placeholder="Enter max price"
                      placeholderTextColor="#777777"
                      mode="outlined"
                      outlineColor="#2C2C2C"
                      activeOutlineColor={theme.colors.primary}
                      right={
                        <TextInput.Affix
                          text={pool.token2.symbol}
                          textStyle={{ color: '#AAAAAA' }}
                        />
                      }
                    />
                  </View>
                </View>
              ) : (
                <View style={styles.defaultRangeContainer}>
                  <Text style={styles.defaultRangeText}>
                    Using pool's default range: ${formatNumber(pool.priceRange.min)} - ${formatNumber(pool.priceRange.max)}
                  </Text>
                </View>
              )}
            </Card.Content>
          </Card>
        )}
        
        {/* Options Card */}
        <Card style={styles.formCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Options</Text>
            
            <View style={styles.toggleContainer}>
              <Text style={styles.toggleLabel}>Auto-compound Rewards</Text>
              <Switch
                value={autoCompound}
                onValueChange={setAutoCompound}
                color={theme.colors.primary}
              />
            </View>
            
            <Text style={styles.optionDescription}>
              Automatically reinvest earned fees to increase your position over time
            </Text>
          </Card.Content>
        </Card>
        
        {/* Summary Card */}
        <Card style={styles.summaryCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Summary</Text>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Expected Liquidity</Text>
              <Text style={styles.summaryValue}>
                ${formatNumber(calculateExpectedLiquidity())}
              </Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Expected APR</Text>
              <Text style={[styles.summaryValue, { color: theme.colors.primary }]}>
                {formatPercentage(calculateExpectedAPR())}
              </Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Pool Share</Text>
              <Text style={styles.summaryValue}>
                {formatPercentage(calculateExpectedLiquidity() / (pool.tvl + calculateExpectedLiquidity()) * 100)}
              </Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Estimated Gas Fee</Text>
              <Text style={styles.summaryValue}>0.000005 SOL (~$0.00075)</Text>
            </View>
            
            <Divider style={styles.divider} />
            
            <Button
              mode="contained"
              style={[styles.submitButton, { backgroundColor: theme.colors.primary }]}
              labelStyle={{ color: '#000000', fontSize: 16 }}
              onPress={handleSubmit}
              loading={submitting}
              disabled={submitting}
            >
              Join Pool
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>
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
    paddingBottom: 30,
  },
  poolCard: {
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
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  poolStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  poolStat: {
    flex: 1,
  },
  poolStatLabel: {
    color: '#AAAAAA',
    fontSize: 14,
    marginBottom: 4,
  },
  poolStatValue: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '500',
  },
  formCard: {
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
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  toggleLabel: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  tokenSelection: {
    marginTop: 8,
  },
  inputLabel: {
    color: '#AAAAAA',
    fontSize: 14,
    marginBottom: 8,
  },
  tokenButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tokenButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '48%',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2C2C2C',
    backgroundColor: '#2C2C2C',
  },
  tokenButtonIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  tokenButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#1E1E1E',
    color: '#FFFFFF',
    height: 50,
  },
  maxButton: {
    position: 'absolute',
    right: 60,
    backgroundColor: 'rgba(0, 255, 159, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  maxButtonText: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  balanceText: {
    color: '#AAAAAA',
    fontSize: 12,
    marginTop: 4,
  },
  defaultRangeContainer: {
    backgroundColor: '#2C2C2C',
    padding: 12,
    borderRadius: 8,
  },
  defaultRangeText: {
    color: '#FFFFFF',
    fontSize: 14,
    textAlign: 'center',
  },
  optionDescription: {
    color: '#AAAAAA',
    fontSize: 14,
    marginTop: 4,
  },
  summaryCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    color: '#AAAAAA',
    fontSize: 16,
  },
  summaryValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  divider: {
    backgroundColor: '#2C2C2C',
    marginVertical: 16,
  },
  submitButton: {
    width: '100%',
    paddingVertical: 8,
  },
});

export default JoinPoolScreen;