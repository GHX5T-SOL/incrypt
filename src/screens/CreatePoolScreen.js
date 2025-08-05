import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
  Animated,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useWallet } from '../hooks/useWallet';
import { useMeteora } from '../hooks/useMeteora';
import { theme } from '../theme';
import NeonCard from '../components/NeonCard';
import NeonButton from '../components/NeonButton';
import { formatUSD, formatPercentage, formatNumber } from '../utils/format';

const CreatePoolScreen = () => {
  const navigation = useNavigation();
  const { connected, balance } = useWallet();
  const { createPool, loading } = useMeteora();
  
  const [submitting, setSubmitting] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  
  // Form state
  const [poolType, setPoolType] = useState('DLMM');
  const [token1, setToken1] = useState(null);
  const [token2, setToken2] = useState(null);
  const [token1Amount, setToken1Amount] = useState('');
  const [token2Amount, setToken2Amount] = useState('');
  const [feeType, setFeeType] = useState('fixed');
  const [fixedFee, setFixedFee] = useState('0.3');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [binSize, setBinSize] = useState('10');
  const [showTokenSelector, setShowTokenSelector] = useState(false);
  const [selectingToken, setSelectingToken] = useState(1);
  const [safetyCheck, setSafetyCheck] = useState(null);

  // Mock tokens for demonstration
  const availableTokens = [
    { symbol: 'SOL', name: 'Solana', price: 150.25, balance: 10, icon: 'currency-btc' },
    { symbol: 'USDC', name: 'USD Coin', price: 1.00, balance: 1500, icon: 'currency-usd' },
    { symbol: 'BONK', name: 'Bonk', price: 0.00001234, balance: 10000000, icon: 'currency-btc' },
    { symbol: 'JTO', name: 'Jito', price: 2.45, balance: 100, icon: 'currency-btc' },
    { symbol: 'ORCA', name: 'Orca', price: 0.75, balance: 200, icon: 'currency-btc' },
  ];

  useEffect(() => {
    startFadeAnimation();
  }, []);

  const startFadeAnimation = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  };

  const handleSelectToken = (token) => {
    if (selectingToken === 1) {
      setToken1(token);
    } else {
      setToken2(token);
    }
    setShowTokenSelector(false);
  };

  const openTokenSelector = (tokenPosition) => {
    setSelectingToken(tokenPosition);
    setShowTokenSelector(true);
  };

  const calculateToken2Amount = () => {
    if (!token1 || !token2 || !token1Amount) return;
    
    const amount1 = parseFloat(token1Amount);
    const token1Price = token1.price;
    const token2Price = token2.price;
    
    const token2Amount = (amount1 * token1Price) / token2Price;
    setToken2Amount(token2Amount.toFixed(6));
  };

  useEffect(() => {
    calculateToken2Amount();
  }, [token1Amount, token1, token2]);

  const validateForm = () => {
    if (!token1 || !token2) {
      Alert.alert('Error', 'Please select both tokens');
      return false;
    }
    
    if (!token1Amount || !token2Amount) {
      Alert.alert('Error', 'Please enter amounts for both tokens');
      return false;
    }
    
    if (parseFloat(token1Amount) <= 0 || parseFloat(token2Amount) <= 0) {
      Alert.alert('Error', 'Token amounts must be greater than 0');
      return false;
    }
    
    if (poolType === 'DLMM' && (!minPrice || !maxPrice)) {
      Alert.alert('Error', 'Please enter price range for DLMM pool');
      return false;
    }
    
    return true;
  };

  const performSafetyCheck = async () => {
    if (!token1 || !token2) return;
    
    try {
      // In real app, this would call Rugcheck API
      const safetyScore = Math.floor(Math.random() * 20) + 80; // Mock score 80-100
      setSafetyCheck({
        score: safetyScore,
        safe: safetyScore >= 85,
        warnings: safetyScore < 90 ? ['Token has moderate risk'] : [],
      });
    } catch (error) {
      console.error('Safety check failed:', error);
    }
  };

  useEffect(() => {
    if (token1 && token2) {
      performSafetyCheck();
    }
  }, [token1, token2]);

  const handleSubmit = async () => {
    if (!connected) {
      Alert.alert('Wallet Not Connected', 'Please connect your wallet to create a pool');
      return;
    }

    if (!validateForm()) return;

    if (safetyCheck && !safetyCheck.safe) {
      Alert.alert(
        'Safety Warning',
        'One or more tokens have safety concerns. Do you want to proceed?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Proceed', onPress: submitPool },
        ]
      );
    } else {
      submitPool();
    }
  };

  const submitPool = async () => {
    setSubmitting(true);
    
    try {
      const poolData = {
        type: poolType,
        tokenA: token1.symbol,
        tokenB: token2.symbol,
        amountA: parseFloat(token1Amount),
        amountB: parseFloat(token2Amount),
        feeType,
        fee: parseFloat(fixedFee),
        minPrice: parseFloat(minPrice),
        maxPrice: parseFloat(maxPrice),
        binSize: parseFloat(binSize),
      };

      // In real app, this would call Meteora API
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      
      Alert.alert(
        'Success',
        'Pool created successfully!',
        [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]
      );
    } catch (error) {
      console.error('Error creating pool:', error);
      Alert.alert('Error', 'Failed to create pool. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getPoolTypeColor = (type) => {
    return type === poolType ? theme.colors.primary : theme.colors.textSecondary;
  };

  const renderTokenSelector = () => {
    if (!showTokenSelector) return null;

    return (
      <View style={styles.tokenSelectorOverlay}>
        <View style={styles.tokenSelector}>
          <View style={styles.tokenSelectorHeader}>
            <Text style={styles.tokenSelectorTitle}>Select Token</Text>
            <TouchableOpacity onPress={() => setShowTokenSelector(false)}>
              <MaterialCommunityIcons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.tokenList}>
            {availableTokens.map((token) => (
              <TouchableOpacity
                key={token.symbol}
                style={styles.tokenItem}
                onPress={() => handleSelectToken(token)}
              >
                <MaterialCommunityIcons 
                  name={token.icon} 
                  size={24} 
                  color={theme.colors.primary} 
                />
                <View style={styles.tokenInfo}>
                  <Text style={styles.tokenSymbol}>{token.symbol}</Text>
                  <Text style={styles.tokenName}>{token.name}</Text>
                </View>
                <View style={styles.tokenBalance}>
                  <Text style={styles.tokenBalanceText}>
                    {formatNumber(token.balance)} {token.symbol}
                  </Text>
                  <Text style={styles.tokenPrice}>
                    ${formatUSD(token.price)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <ScrollView style={styles.content}>
        <Animated.View style={[styles.formContainer, { opacity: fadeAnim }]}>
          {/* Pool Type Selection */}
          <NeonCard style={styles.section}>
            <Text style={styles.sectionTitle}>Pool Type</Text>
            <View style={styles.poolTypeContainer}>
              <TouchableOpacity
                style={[
                  styles.poolTypeButton,
                  poolType === 'DLMM' && styles.poolTypeButtonActive
                ]}
                onPress={() => setPoolType('DLMM')}
              >
                <MaterialCommunityIcons 
                  name="chart-bubble" 
                  size={24} 
                  color={getPoolTypeColor('DLMM')} 
                />
                <Text style={[
                  styles.poolTypeText,
                  { color: getPoolTypeColor('DLMM') }
                ]}>
                  DLMM
                </Text>
                <Text style={styles.poolTypeDescription}>
                  Dynamic Liquidity Market Maker
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.poolTypeButton,
                  poolType === 'DAMM V2' && styles.poolTypeButtonActive
                ]}
                onPress={() => setPoolType('DAMM V2')}
              >
                <MaterialCommunityIcons 
                  name="chart-line" 
                  size={24} 
                  color={getPoolTypeColor('DAMM V2')} 
                />
                <Text style={[
                  styles.poolTypeText,
                  { color: getPoolTypeColor('DAMM V2') }
                ]}>
                  DAMM V2
                </Text>
                <Text style={styles.poolTypeDescription}>
                  Dynamic AMM with advanced features
                </Text>
              </TouchableOpacity>
            </View>
          </NeonCard>

          {/* Token Selection */}
          <NeonCard style={styles.section}>
            <Text style={styles.sectionTitle}>Token Pair</Text>
            <View style={styles.tokenSelectionContainer}>
              <TouchableOpacity
                style={styles.tokenSelector}
                onPress={() => openTokenSelector(1)}
              >
                <View style={styles.tokenDisplay}>
                  {token1 ? (
                    <>
                      <MaterialCommunityIcons 
                        name={token1.icon} 
                        size={24} 
                        color={theme.colors.primary} 
                      />
                      <Text style={styles.tokenSymbol}>{token1.symbol}</Text>
                    </>
                  ) : (
                    <>
                      <MaterialCommunityIcons 
                        name="plus" 
                        size={24} 
                        color={theme.colors.textSecondary} 
                      />
                      <Text style={styles.tokenPlaceholder}>Select Token</Text>
                    </>
                  )}
                </View>
              </TouchableOpacity>
              
              <View style={styles.tokenDivider}>
                <MaterialCommunityIcons 
                  name="arrow-right" 
                  size={20} 
                  color={theme.colors.textSecondary} 
                />
              </View>
              
              <TouchableOpacity
                style={styles.tokenSelector}
                onPress={() => openTokenSelector(2)}
              >
                <View style={styles.tokenDisplay}>
                  {token2 ? (
                    <>
                      <MaterialCommunityIcons 
                        name={token2.icon} 
                        size={24} 
                        color={theme.colors.secondary} 
                      />
                      <Text style={styles.tokenSymbol}>{token2.symbol}</Text>
                    </>
                  ) : (
                    <>
                      <MaterialCommunityIcons 
                        name="plus" 
                        size={24} 
                        color={theme.colors.textSecondary} 
                      />
                      <Text style={styles.tokenPlaceholder}>Select Token</Text>
                    </>
                  )}
                </View>
              </TouchableOpacity>
            </View>
          </NeonCard>

          {/* Safety Check */}
          {safetyCheck && (
            <NeonCard 
              style={styles.section}
              variant={safetyCheck.safe ? 'success' : 'warning'}
            >
              <View style={styles.safetyHeader}>
                <MaterialCommunityIcons 
                  name={safetyCheck.safe ? "shield-check" : "shield-alert"} 
                  size={24} 
                  color={safetyCheck.safe ? theme.colors.success : theme.colors.warning} 
                />
                <Text style={styles.safetyTitle}>
                  Safety Score: {safetyCheck.score}/100
                </Text>
              </View>
              {safetyCheck.warnings.length > 0 && (
                <View style={styles.warningsContainer}>
                  {safetyCheck.warnings.map((warning, index) => (
                    <Text key={index} style={styles.warningText}>• {warning}</Text>
                  ))}
                </View>
              )}
            </NeonCard>
          )}

          {/* Token Amounts */}
          <NeonCard style={styles.section}>
            <Text style={styles.sectionTitle}>Initial Liquidity</Text>
            <View style={styles.amountContainer}>
              <View style={styles.amountInput}>
                <Text style={styles.amountLabel}>{token1?.symbol || 'Token 1'}</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0.0"
                  placeholderTextColor={theme.colors.textSecondary}
                  value={token1Amount}
                  onChangeText={setToken1Amount}
                  keyboardType="numeric"
                />
                {token1 && (
                  <Text style={styles.balanceText}>
                    Balance: {formatNumber(token1.balance)} {token1.symbol}
                  </Text>
                )}
              </View>
              
              <View style={styles.amountInput}>
                <Text style={styles.amountLabel}>{token2?.symbol || 'Token 2'}</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0.0"
                  placeholderTextColor={theme.colors.textSecondary}
                  value={token2Amount}
                  onChangeText={setToken2Amount}
                  keyboardType="numeric"
                />
                {token2 && (
                  <Text style={styles.balanceText}>
                    Balance: {formatNumber(token2.balance)} {token2.symbol}
                  </Text>
                )}
              </View>
            </View>
          </NeonCard>

          {/* Pool Configuration */}
          <NeonCard style={styles.section}>
            <Text style={styles.sectionTitle}>Pool Configuration</Text>
            
            {/* Fee Configuration */}
            <View style={styles.configItem}>
              <Text style={styles.configLabel}>Fee Type</Text>
              <View style={styles.feeTypeContainer}>
                {['fixed', 'linear', 'exponential'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.feeTypeButton,
                      feeType === type && styles.feeTypeButtonActive
                    ]}
                    onPress={() => setFeeType(type)}
                  >
                    <Text style={[
                      styles.feeTypeText,
                      feeType === type && styles.feeTypeTextActive
                    ]}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            {/* Fee Rate */}
            <View style={styles.configItem}>
              <Text style={styles.configLabel}>Fee Rate (%)</Text>
              <TextInput
                style={styles.input}
                placeholder="0.3"
                placeholderTextColor={theme.colors.textSecondary}
                value={fixedFee}
                onChangeText={setFixedFee}
                keyboardType="numeric"
              />
            </View>
            
            {/* DLMM Specific Settings */}
            {poolType === 'DLMM' && (
              <>
                <View style={styles.configItem}>
                  <Text style={styles.configLabel}>Min Price</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0.0"
                    placeholderTextColor={theme.colors.textSecondary}
                    value={minPrice}
                    onChangeText={setMinPrice}
                    keyboardType="numeric"
                  />
                </View>
                
                <View style={styles.configItem}>
                  <Text style={styles.configLabel}>Max Price</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0.0"
                    placeholderTextColor={theme.colors.textSecondary}
                    value={maxPrice}
                    onChangeText={setMaxPrice}
                    keyboardType="numeric"
                  />
                </View>
                
                <View style={styles.configItem}>
                  <Text style={styles.configLabel}>Bin Size (%)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="10"
                    placeholderTextColor={theme.colors.textSecondary}
                    value={binSize}
                    onChangeText={setBinSize}
                    keyboardType="numeric"
                  />
                </View>
              </>
            )}
          </NeonCard>

          {/* Submit Button */}
          <View style={styles.submitContainer}>
            <NeonButton
              title={submitting ? "Creating Pool..." : "Create Pool"}
              onPress={handleSubmit}
              disabled={submitting || !connected}
              variant="primary"
              style={styles.submitButton}
            />
            
            {!connected && (
              <Text style={styles.connectWarning}>
                Connect your wallet to create a pool
              </Text>
            )}
          </View>
        </Animated.View>
      </ScrollView>
      
      {renderTokenSelector()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
  },
  formContainer: {
    padding: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 16,
  },
  poolTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  poolTypeButton: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.outline,
    marginHorizontal: 4,
  },
  poolTypeButtonActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '20',
  },
  poolTypeText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  poolTypeDescription: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  tokenSelectionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tokenSelector: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.outline,
    padding: 16,
  },
  tokenDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tokenSymbol: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginLeft: 8,
  },
  tokenPlaceholder: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginLeft: 8,
  },
  tokenDivider: {
    marginHorizontal: 16,
  },
  safetyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  safetyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginLeft: 8,
  },
  warningsContainer: {
    marginTop: 8,
  },
  warningText: {
    fontSize: 14,
    color: theme.colors.warning,
    marginBottom: 4,
  },
  amountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  amountInput: {
    flex: 1,
    marginHorizontal: 4,
  },
  amountLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.outline,
  },
  balanceText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  configItem: {
    marginBottom: 16,
  },
  configLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 8,
  },
  feeTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  feeTypeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.outline,
    marginHorizontal: 2,
    alignItems: 'center',
  },
  feeTypeButtonActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '20',
  },
  feeTypeText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  feeTypeTextActive: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  submitContainer: {
    marginTop: 24,
  },
  submitButton: {
    marginBottom: 12,
  },
  connectWarning: {
    fontSize: 14,
    color: theme.colors.warning,
    textAlign: 'center',
  },
  tokenSelectorOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  tokenSelector: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  tokenSelectorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  tokenSelectorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  tokenList: {
    maxHeight: 400,
  },
  tokenItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outline,
  },
  tokenInfo: {
    flex: 1,
    marginLeft: 12,
  },
  tokenSymbol: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  tokenName: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  tokenBalance: {
    alignItems: 'flex-end',
  },
  tokenBalanceText: {
    fontSize: 14,
    color: theme.colors.text,
  },
  tokenPrice: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
});

export default CreatePoolScreen;