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
  Modal,
  FlatList,
  Image,
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
  let navigation;
  try {
    navigation = useNavigation();
  } catch (error) {
    console.log('Navigation not available in CreatePoolScreen, using fallback');
    navigation = {
      navigate: () => console.log('Navigation not available'),
      goBack: () => console.log('Navigation not available'),
    };
  }
  
  let walletData = { connected: false, balance: 0 };
  try {
    walletData = useWallet();
  } catch (error) {
    console.log('Wallet hook not available in CreatePoolScreen, using fallback');
  }
  
  let meteoraData = { createPool: () => {}, loading: false };
  try {
    meteoraData = useMeteora();
  } catch (error) {
    console.log('Meteora hook not available in CreatePoolScreen, using fallback');
  }
  
  const { connected, balance } = walletData;
  const { createPool, loading } = meteoraData;
  
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
  const [searchQuery, setSearchQuery] = useState('');
  const [showContractInput, setShowContractInput] = useState(false);
  const [contractAddress, setContractAddress] = useState('');

  // DAMM-specific state
  const [feeTier, setFeeTier] = useState('0.25');
  const [startTime, setStartTime] = useState('now');
  const [dynamicFee, setDynamicFee] = useState(true);
  const [feeCollectionToken, setFeeCollectionToken] = useState('both');
  const [feeScheduler, setFeeScheduler] = useState(true);
  const [feeSchedulerMode, setFeeSchedulerMode] = useState('exponential');
  const [customStartTime, setCustomStartTime] = useState('');

  // Enhanced token list with more details
  const availableTokens = [
    { 
      symbol: 'SOL', 
      name: 'Solana', 
      price: 150.25, 
      balance: 10, 
      icon: require('../../assets/tokens/sol.png'),
      address: 'So11111111111111111111111111111111111111112',
      marketCap: 65000000000,
      volume24h: 2500000000
    },
    { 
      symbol: 'USDC', 
      name: 'USD Coin', 
      price: 1.00, 
      balance: 1500, 
      icon: require('../../assets/tokens/usdc.png'),
      address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      marketCap: 25000000000,
      volume24h: 5000000000
    },
    { 
      symbol: 'BONK', 
      name: 'Bonk', 
      price: 0.00001234, 
      balance: 10000000, 
      icon: require('../../assets/tokens/bonk.png'),
      address: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
      marketCap: 850000000,
      volume24h: 15000000
    },
    { 
      symbol: 'JTO', 
      name: 'Jito', 
      price: 2.45, 
      balance: 100, 
      icon: require('../../assets/tokens/jto.png'),
      address: 'j1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn',
      marketCap: 245000000,
      volume24h: 5000000
    },
    { 
      symbol: 'ORCA', 
      name: 'Orca', 
      price: 0.75, 
      balance: 200, 
      icon: require('../../assets/orca-logo.webp'),
      address: 'orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE',
      marketCap: 75000000,
      volume24h: 2000000
    },
    { 
      symbol: 'RAY', 
      name: 'Raydium', 
      price: 0.85, 
      balance: 500, 
      icon: 'currency-btc', // Fallback to icon
      address: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',
      marketCap: 85000000,
      volume24h: 3000000
    },
    { 
      symbol: 'SRM', 
      name: 'Serum', 
      price: 0.12, 
      balance: 1000, 
      icon: 'currency-btc', // Fallback to icon
      address: 'SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt',
      marketCap: 12000000,
      volume24h: 800000
    },
  ];

  // Filter tokens based on search query
  const filteredTokens = availableTokens.filter(token =>
    token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    token.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
    setSearchQuery('');
    setShowContractInput(false);
  };

  const openTokenSelector = (tokenPosition) => {
    setSelectingToken(tokenPosition);
    setShowTokenSelector(true);
    setSearchQuery('');
    setShowContractInput(false);
  };

  const handleContractAddressSubmit = () => {
    if (contractAddress.trim()) {
      // Mock token for demonstration
      const customToken = {
        symbol: 'CUSTOM',
        name: 'Custom Token',
        price: 0,
        balance: 0,
        icon: 'currency-btc',
        address: contractAddress.trim(),
        marketCap: 0,
        volume24h: 0
      };
      handleSelectToken(customToken);
    }
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
      <Modal
        visible={showTokenSelector}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowTokenSelector(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.tokenSelector}>
            <View style={styles.tokenSelectorHeader}>
              <Text style={styles.tokenSelectorTitle}>Select Token</Text>
              <TouchableOpacity 
                onPress={() => setShowTokenSelector(false)}
                style={styles.closeButton}
              >
                <MaterialCommunityIcons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.searchContainer}>
              <MaterialCommunityIcons name="magnify" size={20} color={theme.colors.textSecondary} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search by name or paste address"
                placeholderTextColor={theme.colors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery && (
                <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearSearchButton}>
                  <MaterialCommunityIcons name="close" size={16} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              style={styles.contractAddressButton}
              onPress={() => setShowContractInput(!showContractInput)}
            >
              <MaterialCommunityIcons 
                name="plus-circle" 
                size={20} 
                color={theme.colors.primary} 
              />
              <Text style={styles.contractAddressText}>Add Custom Token</Text>
            </TouchableOpacity>

            {showContractInput && (
              <View style={styles.contractInputContainer}>
                <TextInput
                  style={styles.contractInput}
                  placeholder="Enter contract address"
                  placeholderTextColor={theme.colors.textSecondary}
                  value={contractAddress}
                  onChangeText={setContractAddress}
                  keyboardType="default"
                />
                <TouchableOpacity
                  style={styles.addCustomTokenButton}
                  onPress={handleContractAddressSubmit}
                >
                  <Text style={styles.addCustomTokenText}>Add Token</Text>
                </TouchableOpacity>
              </View>
            )}

            <FlatList
              data={filteredTokens}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.tokenItem}
                  onPress={() => handleSelectToken(item)}
                >
                  <View style={styles.tokenIconContainer}>
                    {typeof item.icon === 'string' ? (
                      <MaterialCommunityIcons 
                        name={item.icon} 
                        size={32} 
                        color={theme.colors.primary} 
                      />
                    ) : (
                      <Image 
                        source={item.icon} 
                        style={styles.tokenModalImage}
                        resizeMode="contain"
                      />
                    )}
                  </View>
                  <View style={styles.tokenInfo}>
                    <Text style={styles.tokenSymbol}>{item.symbol}</Text>
                    <Text style={styles.tokenName}>{item.name}</Text>
                    <Text style={styles.tokenAddress} numberOfLines={1}>
                      {item.address.slice(0, 8)}...{item.address.slice(-8)}
                    </Text>
                  </View>
                  <View style={styles.tokenDetails}>
                    <Text style={styles.tokenPrice}>
                      ${formatUSD(item.price)}
                    </Text>
                    <Text style={styles.tokenBalance}>
                      {formatNumber(item.balance)} {item.symbol}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.symbol}
              ListEmptyComponent={() => (
                <View style={styles.emptyList}>
                  <MaterialCommunityIcons 
                    name="magnify" 
                    size={48} 
                    color={theme.colors.textSecondary} 
                  />
                  <Text style={styles.emptyListText}>No tokens found</Text>
                  <Text style={styles.emptyListSubtext}>
                    Try searching with a different term or add a custom token
                  </Text>
                </View>
              )}
              contentContainerStyle={styles.tokenList}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>
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
              {/* Base Token */}
              <View style={styles.tokenInputContainer}>
                <Text style={styles.tokenLabel}>Base Token</Text>
                <TouchableOpacity
                  style={styles.tokenSelectorButton}
                  onPress={() => openTokenSelector(1)}
                >
                  <View style={styles.tokenDisplay}>
                    {token1 ? (
                      <>
                        <View style={styles.tokenIconContainer}>
                          {typeof token1.icon === 'string' ? (
                            <MaterialCommunityIcons 
                              name={token1.icon} 
                              size={24} 
                              color={theme.colors.primary} 
                            />
                          ) : (
                            <Image 
                              source={token1.icon} 
                              style={styles.tokenImage}
                              resizeMode="contain"
                            />
                          )}
                        </View>
                        <View style={styles.tokenInfo}>
                          <Text style={styles.tokenSymbol}>{token1.symbol}</Text>
                          <Text style={styles.tokenName}>{token1.name}</Text>
                        </View>
                      </>
                    ) : (
                      <>
                        <View style={styles.tokenIconContainer}>
                          <MaterialCommunityIcons 
                            name="plus" 
                            size={24} 
                            color={theme.colors.textSecondary} 
                          />
                        </View>
                        <View style={styles.tokenInfo}>
                          <Text style={styles.tokenPlaceholder}>Select Base Token</Text>
                        </View>
                      </>
                    )}
                  </View>
                  <MaterialCommunityIcons 
                    name="chevron-down" 
                    size={20} 
                    color={theme.colors.textSecondary} 
                  />
                </TouchableOpacity>
              </View>
              
              {/* Quote Token */}
              <View style={styles.tokenInputContainer}>
                <Text style={styles.tokenLabel}>Quote Token</Text>
                <Text style={styles.tokenDescription}>
                  SOL or stables (e.g. USDC, USDT) are usually used as the Quote token, which represents the price used to trade the Base token.
                </Text>
                <TouchableOpacity
                  style={styles.tokenSelectorButton}
                  onPress={() => openTokenSelector(2)}
                >
                  <View style={styles.tokenDisplay}>
                    {token2 ? (
                      <>
                        <View style={styles.tokenIconContainer}>
                          {typeof token2.icon === 'string' ? (
                            <MaterialCommunityIcons 
                              name={token2.icon} 
                              size={24} 
                              color={theme.colors.secondary} 
                            />
                          ) : (
                            <Image 
                              source={token2.icon} 
                              style={styles.tokenImage}
                              resizeMode="contain"
                            />
                          )}
                        </View>
                        <View style={styles.tokenInfo}>
                          <Text style={styles.tokenSymbol}>{token2.symbol}</Text>
                          <Text style={styles.tokenName}>{token2.name}</Text>
                        </View>
                      </>
                    ) : (
                      <>
                        <View style={styles.tokenIconContainer}>
                          <MaterialCommunityIcons 
                            name="plus" 
                            size={24} 
                            color={theme.colors.textSecondary} 
                          />
                        </View>
                        <View style={styles.tokenInfo}>
                          <Text style={styles.tokenPlaceholder}>Select Quote Token</Text>
                        </View>
                      </>
                    )}
                  </View>
                  <MaterialCommunityIcons 
                    name="chevron-down" 
                    size={20} 
                    color={theme.colors.textSecondary} 
                  />
                </TouchableOpacity>
              </View>
            </View>
            
            {token1 && token2 && (
              <View style={styles.tokenPairInfo}>
                <Text style={styles.tokenPairText}>
                  Creating {token1.symbol}/{token2.symbol} pool
                </Text>
                <Text style={styles.tokenPairSubtext}>
                  {token1.name} • {token2.name}
                </Text>
              </View>
            )}
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

          {/* DAMM V2 Specific Configuration */}
          {poolType === 'DAMM V2' && (
            <>
              {/* Fee Tier Selection */}
              <NeonCard style={styles.section}>
                <Text style={styles.sectionTitle}>Fee Tier</Text>
                <Text style={styles.sectionSubtitle}>The % pool will earn in fee</Text>
                <View style={styles.feeTierContainer}>
                  {['0.25', '0.3', '1', '2', '4', '6'].map((tier) => (
                    <TouchableOpacity
                      key={tier}
                      style={[
                        styles.feeTierButton,
                        feeTier === tier && styles.feeTierButtonActive
                      ]}
                      onPress={() => setFeeTier(tier)}
                    >
                      <Text style={[
                        styles.feeTierText,
                        feeTier === tier && styles.feeTierTextActive
                      ]}>
                        {tier}%
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </NeonCard>

              {/* Start Time Selection */}
              <NeonCard style={styles.section}>
                <Text style={styles.sectionTitle}>Start Time</Text>
                <View style={styles.startTimeContainer}>
                  <TouchableOpacity
                    style={[
                      styles.startTimeButton,
                      startTime === 'now' && styles.startTimeButtonActive
                    ]}
                    onPress={() => setStartTime('now')}
                  >
                    <Text style={[
                      styles.startTimeText,
                      startTime === 'now' && styles.startTimeTextActive
                    ]}>
                      Start Now
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.startTimeButton,
                      startTime === 'custom' && styles.startTimeButtonActive
                    ]}
                    onPress={() => setStartTime('custom')}
                  >
                    <Text style={[
                      styles.startTimeText,
                      startTime === 'custom' && styles.startTimeTextActive
                    ]}>
                      Custom
                    </Text>
                  </TouchableOpacity>
                </View>
                
                {startTime === 'custom' && (
                  <View style={styles.customTimeContainer}>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter custom start time"
                      placeholderTextColor={theme.colors.textSecondary}
                      value={customStartTime}
                      onChangeText={setCustomStartTime}
                    />
                  </View>
                )}
              </NeonCard>

              {/* Pool's Fee Configuration */}
              <NeonCard style={styles.section}>
                <Text style={styles.sectionTitle}>Pool's Fee Configuration</Text>
                
                {/* Dynamic Fee */}
                <View style={styles.configRow}>
                  <View style={styles.configLabelContainer}>
                    <Text style={styles.configLabel}>Dynamic Fee</Text>
                  </View>
                  <View style={styles.toggleContainer}>
                    <TouchableOpacity
                      style={[
                        styles.toggleButton,
                        dynamicFee && styles.toggleButtonActive
                      ]}
                      onPress={() => setDynamicFee(true)}
                    >
                      <Text style={[
                        styles.toggleText,
                        dynamicFee && styles.toggleTextActive
                      ]}>
                        Yes
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.toggleButton,
                        !dynamicFee && styles.toggleButtonActive
                      ]}
                      onPress={() => setDynamicFee(false)}
                    >
                      <Text style={[
                        styles.toggleText,
                        !dynamicFee && styles.toggleTextActive
                      ]}>
                        No
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Fee Collection Token */}
                <View style={styles.configRow}>
                  <View style={styles.configLabelContainer}>
                    <Text style={styles.configLabel}>Fee Collection Token</Text>
                    <MaterialCommunityIcons 
                      name="help-circle" 
                      size={16} 
                      color={theme.colors.textSecondary} 
                    />
                  </View>
                  <View style={styles.feeCollectionContainer}>
                    <TouchableOpacity
                      style={[
                        styles.feeCollectionButton,
                        feeCollectionToken === 'both' && styles.feeCollectionButtonActive
                      ]}
                      onPress={() => setFeeCollectionToken('both')}
                    >
                      <MaterialCommunityIcons 
                        name="currency-usd" 
                        size={16} 
                        color={feeCollectionToken === 'both' ? theme.colors.background : theme.colors.textSecondary} 
                      />
                      <Text style={[
                        styles.feeCollectionText,
                        feeCollectionToken === 'both' && styles.feeCollectionTextActive
                      ]}>
                        Base + Quote
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[
                        styles.feeCollectionButton,
                        feeCollectionToken === 'quote' && styles.feeCollectionButtonActive
                      ]}
                      onPress={() => setFeeCollectionToken('quote')}
                    >
                      <MaterialCommunityIcons 
                        name="currency-usd" 
                        size={16} 
                        color={feeCollectionToken === 'quote' ? theme.colors.background : theme.colors.textSecondary} 
                      />
                      <Text style={[
                        styles.feeCollectionText,
                        feeCollectionToken === 'quote' && styles.feeCollectionTextActive
                      ]}>
                        Quote
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Fee Scheduler */}
                <View style={styles.configRow}>
                  <View style={styles.configLabelContainer}>
                    <Text style={styles.configLabel}>Fee Scheduler</Text>
                  </View>
                  <View style={styles.toggleContainer}>
                    <TouchableOpacity
                      style={[
                        styles.toggleButton,
                        feeScheduler && styles.toggleButtonActive
                      ]}
                      onPress={() => setFeeScheduler(true)}
                    >
                      <Text style={[
                        styles.toggleText,
                        feeScheduler && styles.toggleTextActive
                      ]}>
                        Yes
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.toggleButton,
                        !feeScheduler && styles.toggleButtonActive
                      ]}
                      onPress={() => setFeeScheduler(false)}
                    >
                      <Text style={[
                        styles.toggleText,
                        !feeScheduler && styles.toggleTextActive
                      ]}>
                        No
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Fee Scheduler Mode */}
                {feeScheduler && (
                  <View style={styles.configRow}>
                    <View style={styles.configLabelContainer}>
                      <Text style={styles.configLabel}>Fee Scheduler Mode</Text>
                    </View>
                    <View style={styles.schedulerModeContainer}>
                      <TouchableOpacity
                        style={[
                          styles.schedulerModeButton,
                          feeSchedulerMode === 'exponential' && styles.schedulerModeButtonActive
                        ]}
                        onPress={() => setFeeSchedulerMode('exponential')}
                      >
                        <Text style={[
                          styles.schedulerModeText,
                          feeSchedulerMode === 'exponential' && styles.schedulerModeTextActive
                        ]}>
                          Exponential
                        </Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        style={[
                          styles.schedulerModeButton,
                          feeSchedulerMode === 'linear' && styles.schedulerModeButtonActive
                        ]}
                        onPress={() => setFeeSchedulerMode('linear')}
                      >
                        <Text style={[
                          styles.schedulerModeText,
                          feeSchedulerMode === 'linear' && styles.schedulerModeTextActive
                        ]}>
                          Linear
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </NeonCard>
            </>
          )}

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
  sectionSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
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
    flexDirection: 'column', // Changed to column
    alignItems: 'stretch', // Changed to stretch
    gap: 16, // Added gap between token inputs
  },
  tokenInputContainer: {
    // Added styles for token input container
  },
  tokenLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 8,
  },
  tokenDescription: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 12,
  },
  tokenSelectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.outline,
    padding: 16,
  },
  tokenDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  tokenIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tokenInfo: {
    flex: 1,
  },
  tokenSymbol: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  tokenName: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  tokenPlaceholder: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  tokenDivider: {
    marginHorizontal: 16,
  },
  tokenPairInfo: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.outline,
  },
  tokenPairText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  tokenPairSubtext: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  safetyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
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
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.outline,
    padding: 12,
    fontSize: 16,
    color: theme.colors.text,
    marginBottom: 8,
  },
  balanceText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  configItem: {
    marginBottom: 16,
  },
  configLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 8,
  },
  feeTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  feeTypeButton: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.outline,
    marginHorizontal: 2,
  },
  feeTypeButtonActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '20',
  },
  feeTypeText: {
    fontSize: 14,
    color: theme.colors.text,
  },
  feeTypeTextActive: {
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  submitContainer: {
    marginTop: 24,
  },
  submitButton: {
    width: '100%',
  },
  connectWarning: {
    fontSize: 14,
    color: theme.colors.warning,
    textAlign: 'center',
    marginTop: 12,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  tokenSelector: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.colors.outline,
  },
  tokenSelectorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  tokenSelectorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  closeButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceVariant,
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
  clearSearchButton: {
    padding: 8,
  },
  contractAddressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    paddingVertical: 12,
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.outline,
  },
  contractAddressText: {
    fontSize: 14,
    color: theme.colors.primary,
    marginLeft: 8,
    fontWeight: '600',
  },
  contractInputContainer: {
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.outline,
  },
  contractInput: {
    fontSize: 16,
    color: theme.colors.text,
    paddingVertical: 8,
  },
  addCustomTokenButton: {
    marginTop: 12,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
  },
  addCustomTokenText: {
    fontSize: 14,
    color: theme.colors.background,
    fontWeight: '600',
  },
  tokenList: {
    flexGrow: 1,
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyListText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginTop: 12,
  },
  emptyListSubtext: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  tokenItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outline,
  },
  tokenDetails: {
    alignItems: 'flex-end',
  },
  tokenPrice: {
    fontSize: 14,
    color: theme.colors.text,
  },
  tokenBalance: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  tokenAddress: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  // DAMM-specific styles
  feeTierContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  feeTierButton: {
    width: '30%',
    alignItems: 'center',
    padding: 12,
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.outline,
    marginBottom: 8,
  },
  feeTierButtonActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '20',
  },
  feeTierText: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: '600',
  },
  feeTierTextActive: {
    color: theme.colors.primary,
  },
  startTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  startTimeButton: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.outline,
    marginHorizontal: 4,
  },
  startTimeButtonActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  startTimeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  startTimeTextActive: {
    color: theme.colors.background,
  },
  customTimeContainer: {
    marginTop: 16,
  },
  configRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outline,
  },
  configLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.outline,
  },
  toggleButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  toggleButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  toggleText: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: '600',
  },
  toggleTextActive: {
    color: theme.colors.background,
  },
  feeCollectionContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  feeCollectionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.outline,
  },
  feeCollectionButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  feeCollectionText: {
    fontSize: 14,
    color: theme.colors.text,
    marginLeft: 4,
    fontWeight: '600',
  },
  feeCollectionTextActive: {
    color: theme.colors.background,
  },
  schedulerModeContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  schedulerModeButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.outline,
  },
  schedulerModeButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  schedulerModeText: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: '600',
  },
  schedulerModeTextActive: {
    color: theme.colors.background,
  },
  tokenImage: {
    width: 24,
    height: 24,
  },
  tokenModalImage: {
    width: 32,
    height: 32,
  },
});

export default CreatePoolScreen;