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
import { useNavigation } from '@react-navigation/native';
import {
  Appbar,
  Card,
  Button,
  TextInput,
  RadioButton,
  Divider,
  ActivityIndicator,
  useTheme,
  SegmentedButtons,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useWallet } from '../contexts/WalletProvider';
import { useConnection } from '../contexts/ConnectionProvider';
import { neonStyles } from '../theme';
import { formatCurrency, formatPercentage } from '../utils/format';
import Toast from 'react-native-toast-message';

// Mock token data
const MOCK_TOKENS = [
  {
    symbol: 'SOL',
    name: 'Solana',
    icon: require('../../assets/tokens/sol.png'),
    price: 150.25,
    balance: 10,
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    icon: require('../../assets/tokens/usdc.png'),
    price: 1.00,
    balance: 1500,
  },
  {
    symbol: 'BONK',
    name: 'Bonk',
    icon: require('../../assets/tokens/bonk.png'),
    price: 0.00001234,
    balance: 10000000,
  },
  {
    symbol: 'JTO',
    name: 'Jito',
    icon: require('../../assets/tokens/jto.png'),
    price: 2.45,
    balance: 100,
  },
  {
    symbol: 'ORCA',
    name: 'Orca',
    icon: require('../../assets/tokens/orca.png'),
    price: 0.75,
    balance: 200,
  },
];

const CreatePoolScreen = () => {
  const navigation = useNavigation();
  const theme = useTheme();
  const { publicKey, balance, sendTransaction } = useWallet();
  const connection = useConnection();
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [poolType, setPoolType] = useState('DLMM'); // 'DLMM' or 'DAMM V2'
  const [token1, setToken1] = useState(null);
  const [token2, setToken2] = useState(null);
  const [token1Amount, setToken1Amount] = useState('');
  const [token2Amount, setToken2Amount] = useState('');
  const [feeType, setFeeType] = useState('fixed'); // 'fixed', 'linear', or 'exponential'
  const [fixedFee, setFixedFee] = useState('0.3'); // percentage
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [binSize, setBinSize] = useState('10'); // percentage
  const [showTokenSelector, setShowTokenSelector] = useState(false);
  const [selectingToken, setSelectingToken] = useState(1); // 1 or 2
  
  // Calculate the other token amount based on price ratio when one token amount changes
  useEffect(() => {
    if (!token1 || !token2) return;
    
    if (token1Amount && !isNaN(parseFloat(token1Amount))) {
      const amount1 = parseFloat(token1Amount);
      const token1Price = MOCK_TOKENS.find(t => t.symbol === token1)?.price || 0;
      const token2Price = MOCK_TOKENS.find(t => t.symbol === token2)?.price || 0;
      
      if (token1Price && token2Price) {
        const amount2 = amount1 * token1Price / token2Price;
        setToken2Amount(amount2.toFixed(6));
      }
    }
  }, [token1Amount, token1, token2]);
  
  useEffect(() => {
    if (!token1 || !token2) return;
    
    if (token2Amount && !isNaN(parseFloat(token2Amount))) {
      const amount2 = parseFloat(token2Amount);
      const token1Price = MOCK_TOKENS.find(t => t.symbol === token1)?.price || 0;
      const token2Price = MOCK_TOKENS.find(t => t.symbol === token2)?.price || 0;
      
      if (token1Price && token2Price) {
        const amount1 = amount2 * token2Price / token1Price;
        setToken1Amount(amount1.toFixed(6));
      }
    }
  }, [token2Amount, token1, token2]);
  
  // Set default price range when tokens are selected
  useEffect(() => {
    if (token1 && token2 && poolType === 'DLMM') {
      const token1Price = MOCK_TOKENS.find(t => t.symbol === token1)?.price || 0;
      const token2Price = MOCK_TOKENS.find(t => t.symbol === token2)?.price || 0;
      
      if (token1Price && token2Price) {
        const currentPrice = token1Price / token2Price;
        setMinPrice((currentPrice * 0.9).toFixed(6)); // 10% below current price
        setMaxPrice((currentPrice * 1.1).toFixed(6)); // 10% above current price
      }
    }
  }, [token1, token2, poolType]);
  
  const handleSelectToken = (tokenSymbol) => {
    if (selectingToken === 1) {
      if (tokenSymbol === token2) {
        // Can't select the same token for both positions
        Alert.alert('Error', 'Please select different tokens for each position');
        return;
      }
      setToken1(tokenSymbol);
    } else {
      if (tokenSymbol === token1) {
        // Can't select the same token for both positions
        Alert.alert('Error', 'Please select different tokens for each position');
        return;
      }
      setToken2(tokenSymbol);
    }
    
    setShowTokenSelector(false);
  };
  
  const openTokenSelector = (tokenPosition) => {
    setSelectingToken(tokenPosition);
    setShowTokenSelector(true);
  };
  
  const handleSubmit = async () => {
    if (!publicKey) {
      Alert.alert('Error', 'Please connect your wallet first');
      return;
    }
    
    if (!token1 || !token2) {
      Alert.alert('Error', 'Please select both tokens');
      return;
    }
    
    if (!token1Amount || parseFloat(token1Amount) <= 0 || !token2Amount || parseFloat(token2Amount) <= 0) {
      Alert.alert('Error', 'Please enter valid amounts for both tokens');
      return;
    }
    
    if (poolType === 'DLMM') {
      if (!minPrice || !maxPrice || parseFloat(minPrice) <= 0 || parseFloat(maxPrice) <= 0) {
        Alert.alert('Error', 'Please enter valid price range values');
        return;
      }
      if (parseFloat(minPrice) >= parseFloat(maxPrice)) {
        Alert.alert('Error', 'Min price must be less than max price');
        return;
      }
      if (!binSize || parseFloat(binSize) <= 0) {
        Alert.alert('Error', 'Please enter a valid bin size');
        return;
      }
    }
    
    if (feeType === 'fixed' && (!fixedFee || parseFloat(fixedFee) <= 0)) {
      Alert.alert('Error', 'Please enter a valid fee percentage');
      return;
    }
    
    setSubmitting(true);
    
    try {
      // In a real app, this would create and send a transaction to create the pool
      // For now, we'll simulate a successful transaction
      setTimeout(() => {
        Toast.show({
          type: 'success',
          text1: 'Success!',
          text2: 'You have successfully created a new pool',
        });
        setSubmitting(false);
        navigation.navigate('Pools');
      }, 2000);
    } catch (error) {
      console.error('Error creating pool:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to create pool. Please try again.',
      });
      setSubmitting(false);
    }
  };
  
  const renderTokenSelector = () => {
    return (
      <Card style={styles.tokenSelectorCard}>
        <Card.Content>
          <View style={styles.tokenSelectorHeader}>
            <Text style={styles.tokenSelectorTitle}>Select Token</Text>
            <TouchableOpacity onPress={() => setShowTokenSelector(false)}>
              <MaterialCommunityIcons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          
          <Divider style={styles.divider} />
          
          <ScrollView style={styles.tokenList}>
            {MOCK_TOKENS.map((token) => (
              <TouchableOpacity
                key={token.symbol}
                style={styles.tokenItem}
                onPress={() => handleSelectToken(token.symbol)}
              >
                <View style={styles.tokenItemLeft}>
                  <Image source={token.icon} style={styles.tokenItemIcon} />
                  <View>
                    <Text style={styles.tokenItemSymbol}>{token.symbol}</Text>
                    <Text style={styles.tokenItemName}>{token.name}</Text>
                  </View>
                </View>
                <View style={styles.tokenItemRight}>
                  <Text style={styles.tokenItemBalance}>{token.balance}</Text>
                  <Text style={styles.tokenItemValue}>${token.price.toFixed(token.price < 0.01 ? 8 : 2)}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Card.Content>
      </Card>
    );
  };
  
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction color="#FFFFFF" onPress={() => navigation.goBack()} />
        <Appbar.Content title="Create Pool" titleStyle={styles.headerTitle} />
      </Appbar.Header>
      
      {showTokenSelector ? (
        renderTokenSelector()
      ) : (
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
          {/* Pool Type Card */}
          <Card style={styles.formCard}>
            <Card.Content>
              <Text style={styles.sectionTitle}>Pool Type</Text>
              
              <SegmentedButtons
                value={poolType}
                onValueChange={setPoolType}
                buttons={[
                  {
                    value: 'DLMM',
                    label: 'DLMM',
                    style: poolType === 'DLMM' ? { backgroundColor: 'rgba(255, 0, 255, 0.2)' } : {},
                  },
                  {
                    value: 'DAMM V2',
                    label: 'DAMM V2',
                    style: poolType === 'DAMM V2' ? { backgroundColor: 'rgba(0, 255, 255, 0.2)' } : {},
                  },
                ]}
                style={styles.segmentedButtons}
              />
              
              <Text style={styles.poolTypeDescription}>
                {poolType === 'DLMM' 
                  ? 'Dynamic Liquidity Market Maker: Concentrated liquidity with customizable price ranges and bin sizes.'
                  : 'Dynamic Automated Market Maker V2: Single or paired liquidity with dynamic fee structures.'}
              </Text>
            </Card.Content>
          </Card>
          
          {/* Token Selection Card */}
          <Card style={styles.formCard}>
            <Card.Content>
              <Text style={styles.sectionTitle}>Select Tokens</Text>
              
              <View style={styles.tokenSelectionContainer}>
                <TouchableOpacity
                  style={styles.tokenSelector}
                  onPress={() => openTokenSelector(1)}
                >
                  {token1 ? (
                    <View style={styles.selectedToken}>
                      <Image 
                        source={MOCK_TOKENS.find(t => t.symbol === token1)?.icon} 
                        style={styles.selectedTokenIcon} 
                      />
                      <Text style={styles.selectedTokenSymbol}>{token1}</Text>
                    </View>
                  ) : (
                    <Text style={styles.tokenSelectorText}>Select Token 1</Text>
                  )}
                  <MaterialCommunityIcons name="chevron-down" size={24} color="#AAAAAA" />
                </TouchableOpacity>
                
                <MaterialCommunityIcons name="plus" size={24} color="#AAAAAA" style={styles.tokenSeparator} />
                
                <TouchableOpacity
                  style={styles.tokenSelector}
                  onPress={() => openTokenSelector(2)}
                >
                  {token2 ? (
                    <View style={styles.selectedToken}>
                      <Image 
                        source={MOCK_TOKENS.find(t => t.symbol === token2)?.icon} 
                        style={styles.selectedTokenIcon} 
                      />
                      <Text style={styles.selectedTokenSymbol}>{token2}</Text>
                    </View>
                  ) : (
                    <Text style={styles.tokenSelectorText}>Select Token 2</Text>
                  )}
                  <MaterialCommunityIcons name="chevron-down" size={24} color="#AAAAAA" />
                </TouchableOpacity>
              </View>
            </Card.Content>
          </Card>
          
          {/* Initial Liquidity Card */}
          {token1 && token2 && (
            <Card style={styles.formCard}>
              <Card.Content>
                <Text style={styles.sectionTitle}>Initial Liquidity</Text>
                
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>{token1} Amount</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.input}
                      value={token1Amount}
                      onChangeText={setToken1Amount}
                      keyboardType="numeric"
                      placeholder={`Enter ${token1} amount`}
                      placeholderTextColor="#777777"
                      mode="outlined"
                      outlineColor="#2C2C2C"
                      activeOutlineColor={theme.colors.primary}
                      right={
                        <TextInput.Affix
                          text={token1}
                          textStyle={{ color: '#AAAAAA' }}
                        />
                      }
                    />
                    <TouchableOpacity
                      style={styles.maxButton}
                      onPress={() => {
                        const token = MOCK_TOKENS.find(t => t.symbol === token1);
                        if (token) {
                          setToken1Amount(token.balance.toString());
                        }
                      }}
                    >
                      <Text style={styles.maxButtonText}>MAX</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.balanceText}>
                    Balance: {MOCK_TOKENS.find(t => t.symbol === token1)?.balance} {token1}
                  </Text>
                </View>
                
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>{token2} Amount</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.input}
                      value={token2Amount}
                      onChangeText={setToken2Amount}
                      keyboardType="numeric"
                      placeholder={`Enter ${token2} amount`}
                      placeholderTextColor="#777777"
                      mode="outlined"
                      outlineColor="#2C2C2C"
                      activeOutlineColor={theme.colors.primary}
                      right={
                        <TextInput.Affix
                          text={token2}
                          textStyle={{ color: '#AAAAAA' }}
                        />
                      }
                    />
                    <TouchableOpacity
                      style={styles.maxButton}
                      onPress={() => {
                        const token = MOCK_TOKENS.find(t => t.symbol === token2);
                        if (token) {
                          setToken2Amount(token.balance.toString());
                        }
                      }}
                    >
                      <Text style={styles.maxButtonText}>MAX</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.balanceText}>
                    Balance: {MOCK_TOKENS.find(t => t.symbol === token2)?.balance} {token2}
                  </Text>
                </View>
              </Card.Content>
            </Card>
          )}
          
          {/* DLMM Settings Card */}
          {token1 && token2 && poolType === 'DLMM' && (
            <Card style={styles.formCard}>
              <Card.Content>
                <Text style={styles.sectionTitle}>DLMM Settings</Text>
                
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Min Price ({token2}/{token1})</Text>
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
                  />
                </View>
                
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Max Price ({token2}/{token1})</Text>
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
                  />
                </View>
                
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Bin Size (%)</Text>
                  <TextInput
                    style={styles.input}
                    value={binSize}
                    onChangeText={setBinSize}
                    keyboardType="numeric"
                    placeholder="Enter bin size percentage"
                    placeholderTextColor="#777777"
                    mode="outlined"
                    outlineColor="#2C2C2C"
                    activeOutlineColor={theme.colors.primary}
                    right={
                      <TextInput.Affix
                        text="%"
                        textStyle={{ color: '#AAAAAA' }}
                      />
                    }
                  />
                  <Text style={styles.helperText}>
                    Smaller bin sizes provide more precise pricing but may reduce liquidity per bin.
                  </Text>
                </View>
              </Card.Content>
            </Card>
          )}
          
          {/* Fee Settings Card */}
          {token1 && token2 && (
            <Card style={styles.formCard}>
              <Card.Content>
                <Text style={styles.sectionTitle}>Fee Settings</Text>
                
                <View style={styles.feeTypeContainer}>
                  <RadioButton.Group onValueChange={value => setFeeType(value)} value={feeType}>
                    <View style={styles.radioOption}>
                      <RadioButton 
                        value="fixed" 
                        color={theme.colors.primary}
                        uncheckedColor="#AAAAAA"
                      />
                      <Text style={styles.radioLabel}>Fixed Fee</Text>
                    </View>
                    
                    {poolType === 'DAMM V2' && (
                      <>
                        <View style={styles.radioOption}>
                          <RadioButton 
                            value="linear" 
                            color={theme.colors.primary}
                            uncheckedColor="#AAAAAA"
                          />
                          <Text style={styles.radioLabel}>Linear Fee Scheduler</Text>
                        </View>
                        
                        <View style={styles.radioOption}>
                          <RadioButton 
                            value="exponential" 
                            color={theme.colors.primary}
                            uncheckedColor="#AAAAAA"
                          />
                          <Text style={styles.radioLabel}>Exponential Fee Scheduler</Text>
                        </View>
                      </>
                    )}
                  </RadioButton.Group>
                </View>
                
                {feeType === 'fixed' && (
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Fee Percentage</Text>
                    <TextInput
                      style={styles.input}
                      value={fixedFee}
                      onChangeText={setFixedFee}
                      keyboardType="numeric"
                      placeholder="Enter fee percentage"
                      placeholderTextColor="#777777"
                      mode="outlined"
                      outlineColor="#2C2C2C"
                      activeOutlineColor={theme.colors.primary}
                      right={
                        <TextInput.Affix
                          text="%"
                          textStyle={{ color: '#AAAAAA' }}
                        />
                      }
                    />
                    <Text style={styles.helperText}>
                      Recommended: 0.3% for stable pairs, 0.5% for volatile pairs
                    </Text>
                  </View>
                )}
                
                {feeType === 'linear' && (
                  <View style={styles.feeSchedulerInfo}>
                    <Text style={styles.feeSchedulerText}>
                      Linear fee scheduler adjusts fees based on volatility, starting at 0.1% and increasing linearly up to 1% during high volatility.
                    </Text>
                  </View>
                )}
                
                {feeType === 'exponential' && (
                  <View style={styles.feeSchedulerInfo}>
                    <Text style={styles.feeSchedulerText}>
                      Exponential fee scheduler increases fees exponentially during high volatility, starting at 0.1% and potentially reaching up to 2% during extreme market conditions.
                    </Text>
                  </View>
                )}
              </Card.Content>
            </Card>
          )}
          
          {/* Submit Button */}
          {token1 && token2 && (
            <Button
              mode="contained"
              style={[styles.submitButton, { backgroundColor: theme.colors.primary }]}
              labelStyle={{ color: '#000000', fontSize: 16 }}
              onPress={handleSubmit}
              loading={submitting}
              disabled={submitting}
            >
              Create Pool
            </Button>
          )}
        </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 30,
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
  segmentedButtons: {
    marginBottom: 16,
  },
  poolTypeDescription: {
    color: '#AAAAAA',
    fontSize: 14,
    lineHeight: 20,
  },
  tokenSelectionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tokenSelector: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#2C2C2C',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#3C3C3C',
  },
  tokenSelectorText: {
    color: '#AAAAAA',
    fontSize: 16,
  },
  selectedToken: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedTokenIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  selectedTokenSymbol: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  tokenSeparator: {
    marginHorizontal: 10,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    color: '#AAAAAA',
    fontSize: 14,
    marginBottom: 8,
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
    color: '#00FF9F',
    fontSize: 12,
    fontWeight: 'bold',
  },
  balanceText: {
    color: '#AAAAAA',
    fontSize: 12,
    marginTop: 4,
  },
  helperText: {
    color: '#AAAAAA',
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
  },
  feeTypeContainer: {
    marginBottom: 16,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  radioLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    marginLeft: 8,
  },
  feeSchedulerInfo: {
    backgroundColor: '#2C2C2C',
    padding: 12,
    borderRadius: 8,
  },
  feeSchedulerText: {
    color: '#AAAAAA',
    fontSize: 14,
    lineHeight: 20,
  },
  submitButton: {
    marginBottom: 20,
    paddingVertical: 8,
  },
  tokenSelectorCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    margin: 16,
    flex: 1,
  },
  tokenSelectorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  tokenSelectorTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  divider: {
    backgroundColor: '#2C2C2C',
    marginBottom: 16,
  },
  tokenList: {
    maxHeight: '85%',
  },
  tokenItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2C',
  },
  tokenItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tokenItemIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  tokenItemSymbol: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  tokenItemName: {
    color: '#AAAAAA',
    fontSize: 14,
  },
  tokenItemRight: {
    alignItems: 'flex-end',
  },
  tokenItemBalance: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  tokenItemValue: {
    color: '#AAAAAA',
    fontSize: 14,
  },
});

export default CreatePoolScreen;