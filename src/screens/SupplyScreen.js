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
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useWallet } from '../hooks/useWallet';
import { useLending } from '../hooks/useLending';
import { theme } from '../theme';
import NeonCard from '../components/NeonCard';
import NeonButton from '../components/NeonButton';
import { formatUSD, formatPercentage, formatNumber } from '../utils/format';

const SupplyScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { marketId } = route.params;
  const { connected, balance } = useWallet();
  const { lendingMarkets, supplyAsset, loading } = useLending();
  
  const [amount, setAmount] = useState('');
  const [supplying, setSupplying] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [safetyCheck, setSafetyCheck] = useState(null);

  const market = lendingMarkets.find(m => m.id === marketId);

  useEffect(() => {
    startFadeAnimation();
    performSafetyCheck();
  }, [market]);

  const startFadeAnimation = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  };

  const performSafetyCheck = async () => {
    if (!market) return;

    try {
      // In real app, this would call Rugcheck API
      const safetyScore = Math.floor(Math.random() * 20) + 80; // Mock score 80-100
      setSafetyCheck({
        score: safetyScore,
        safe: safetyScore >= 85,
        warnings: safetyScore < 90 ? ['Asset has moderate risk'] : [],
      });
    } catch (error) {
      console.error('Safety check failed:', error);
    }
  };

  const handleMaxAmount = () => {
    if (!market) return;
    
    // In real app, this would get actual wallet balance for the asset
    const maxAmount = balance * 0.95; // Use 95% of balance to account for fees
    setAmount(maxAmount.toFixed(6));
  };

  const validateAmount = () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return false;
    }

    if (parseFloat(amount) > balance) {
      Alert.alert('Error', 'Insufficient balance');
      return false;
    }

    if (safetyCheck && !safetyCheck.safe) {
      Alert.alert(
        'Safety Warning',
        'This asset has safety concerns. Do you want to proceed?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Proceed', onPress: handleSupply },
        ]
      );
      return false;
    }

    return true;
  };

  const handleSupply = async () => {
    if (!connected) {
      Alert.alert('Wallet Not Connected', 'Please connect your wallet to supply assets');
      return;
    }

    if (!validateAmount()) return;

    setSupplying(true);

    try {
      await supplyAsset(marketId, parseFloat(amount), market.asset.symbol);
      
      Alert.alert(
        'Success',
        `Successfully supplied ${amount} ${market.asset.symbol}!`,
        [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]
      );
    } catch (error) {
      console.error('Error supplying asset:', error);
      Alert.alert('Error', 'Failed to supply asset. Please try again.');
    } finally {
      setSupplying(false);
    }
  };

  const getSafetyColor = (score) => {
    if (score >= 90) return theme.colors.success;
    if (score >= 80) return theme.colors.warning;
    return theme.colors.error;
  };

  const calculateEstimatedAPY = () => {
    if (!market || !amount) return 0;
    return (parseFloat(amount) * market.supplyApy) / 100;
  };

  if (!market) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <MaterialCommunityIcons 
            name="loading" 
            size={48} 
            color={theme.colors.primary} 
          />
          <Text style={styles.loadingText}>Loading market details...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <ScrollView style={styles.content}>
        <Animated.View style={[styles.formContainer, { opacity: fadeAnim }]}>
          {/* Market Header */}
          <NeonCard style={styles.headerCard}>
            <View style={styles.marketHeader}>
              <View style={styles.marketInfo}>
                <View style={styles.assetIcon}>
                  <MaterialCommunityIcons 
                    name="currency-btc" 
                    size={32} 
                    color={theme.colors.primary} 
                  />
                </View>
                <View style={styles.marketDetails}>
                  <Text style={styles.assetSymbol}>{market.asset.symbol}</Text>
                  <Text style={styles.protocolName}>{market.protocol}</Text>
                </View>
              </View>
              
              <View style={styles.apyBadge}>
                <Text style={styles.apyLabel}>Supply APY</Text>
                <Text style={[styles.apyValue, { color: theme.colors.success }]}>
                  {formatPercentage(market.supplyApy)}
                </Text>
              </View>
            </View>
          </NeonCard>

          {/* Safety Check */}
          {safetyCheck && (
            <NeonCard 
              style={styles.safetyCard}
              variant={safetyCheck.safe ? 'success' : 'warning'}
            >
              <View style={styles.safetyHeader}>
                <MaterialCommunityIcons 
                  name={safetyCheck.safe ? "shield-check" : "shield-alert"} 
                  size={24} 
                  color={getSafetyColor(safetyCheck.score)} 
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

          {/* Supply Amount */}
          <NeonCard style={styles.amountCard}>
            <Text style={styles.sectionTitle}>Supply Amount</Text>
            
            <View style={styles.amountInput}>
              <Text style={styles.amountLabel}>{market.asset.symbol} Amount</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="0.0"
                  placeholderTextColor={theme.colors.textSecondary}
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="numeric"
                />
                <TouchableOpacity
                  style={styles.maxButton}
                  onPress={handleMaxAmount}
                >
                  <Text style={styles.maxButtonText}>MAX</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.balanceText}>
                Balance: {formatNumber(balance)} {market.asset.symbol}
              </Text>
            </View>
          </NeonCard>

          {/* Market Stats */}
          <NeonCard style={styles.statsCard}>
            <Text style={styles.sectionTitle}>Market Information</Text>
            
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Total Supplied</Text>
                <Text style={styles.statValue}>{formatUSD(market.totalSupplied)}</Text>
              </View>
              
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Utilization Rate</Text>
                <Text style={styles.statValue}>{formatPercentage(market.utilizationRate)}</Text>
              </View>
              
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Collateral Factor</Text>
                <Text style={styles.statValue}>{formatPercentage(market.collateralFactor)}</Text>
              </View>
              
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Borrow APY</Text>
                <Text style={styles.statValue}>{formatPercentage(market.borrowApy)}</Text>
              </View>
            </View>
          </NeonCard>

          {/* Estimated Returns */}
          {amount && parseFloat(amount) > 0 && (
            <NeonCard style={styles.returnsCard}>
              <Text style={styles.sectionTitle}>Estimated Returns</Text>
              
              <View style={styles.returnsGrid}>
                <View style={styles.returnItem}>
                  <Text style={styles.returnLabel}>Daily APY</Text>
                  <Text style={styles.returnValue}>
                    {formatPercentage(market.supplyApy / 365)}
                  </Text>
                </View>
                
                <View style={styles.returnItem}>
                  <Text style={styles.returnLabel}>Weekly APY</Text>
                  <Text style={styles.returnValue}>
                    {formatPercentage(market.supplyApy / 52)}
                  </Text>
                </View>
                
                <View style={styles.returnItem}>
                  <Text style={styles.returnLabel}>Monthly APY</Text>
                  <Text style={styles.returnValue}>
                    {formatPercentage(market.supplyApy / 12)}
                  </Text>
                </View>
                
                <View style={styles.returnItem}>
                  <Text style={styles.returnLabel}>Estimated Daily</Text>
                  <Text style={styles.returnValue}>
                    {formatUSD(calculateEstimatedAPY() / 365)}
                  </Text>
                </View>
              </View>
            </NeonCard>
          )}

          {/* Risk Information */}
          <NeonCard variant="warning" style={styles.riskCard}>
            <Text style={styles.sectionTitle}>Risk Information</Text>
            
            <View style={styles.riskItems}>
              <View style={styles.riskItem}>
                <MaterialCommunityIcons 
                  name="alert-circle" 
                  size={20} 
                  color={theme.colors.warning} 
                />
                <Text style={styles.riskText}>
                  Smart contract risk - protocols can have bugs or vulnerabilities
                </Text>
              </View>
              
              <View style={styles.riskItem}>
                <MaterialCommunityIcons 
                  name="alert-circle" 
                  size={20} 
                  color={theme.colors.warning} 
                />
                <Text style={styles.riskText}>
                  Liquidation risk - if collateral value drops significantly
                </Text>
              </View>
              
              <View style={styles.riskItem}>
                <MaterialCommunityIcons 
                  name="alert-circle" 
                  size={20} 
                  color={theme.colors.warning} 
                />
                <Text style={styles.riskText}>
                  Market risk - APY rates can change based on market conditions
                </Text>
              </View>
            </View>
          </NeonCard>

          {/* Supply Button */}
          <View style={styles.actionContainer}>
            <NeonButton
              title={supplying ? "Supplying..." : `Supply ${market.asset.symbol}`}
              onPress={handleSupply}
              disabled={supplying || !connected || !amount}
              variant="primary"
              style={styles.supplyButton}
            />
            
            {!connected && (
              <Text style={styles.connectWarning}>
                Connect your wallet to supply assets
              </Text>
            )}
          </View>

          {/* Additional Info */}
          <NeonCard style={styles.infoCard}>
            <Text style={styles.infoTitle}>Important Information</Text>
            <Text style={styles.infoText}>
              • Your supplied assets can be withdrawn at any time{'\n'}
              • Interest is paid out continuously{'\n'}
              • Network fees apply to all transactions{'\n'}
              • Past performance does not guarantee future returns{'\n'}
              • Collateral factor determines borrowing power
            </Text>
          </NeonCard>
        </Animated.View>
      </ScrollView>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginTop: 16,
  },
  headerCard: {
    marginBottom: 16,
  },
  marketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  marketInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  assetIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  marketDetails: {
    flex: 1,
  },
  assetSymbol: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  protocolName: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  apyBadge: {
    alignItems: 'center',
  },
  apyLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  apyValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  safetyCard: {
    marginBottom: 16,
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
  amountCard: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 16,
  },
  amountInput: {
    marginBottom: 16,
  },
  amountLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  input: {
    flex: 1,
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.outline,
    marginRight: 8,
  },
  maxButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: theme.colors.primary + '20',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  maxButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  balanceText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  statsCard: {
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
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
  returnsCard: {
    marginBottom: 16,
  },
  returnsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  returnItem: {
    width: '48%',
    marginBottom: 12,
  },
  returnLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  returnValue: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  riskCard: {
    marginBottom: 16,
  },
  riskItems: {
    marginBottom: 8,
  },
  riskItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  riskText: {
    fontSize: 14,
    color: theme.colors.text,
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  actionContainer: {
    marginBottom: 16,
  },
  supplyButton: {
    marginBottom: 12,
  },
  connectWarning: {
    fontSize: 14,
    color: theme.colors.warning,
    textAlign: 'center',
  },
  infoCard: {
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
});

export default SupplyScreen; 