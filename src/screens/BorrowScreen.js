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

const BorrowScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { marketId } = route.params;
  const { connected, balance } = useWallet();
  const { lendingMarkets, borrowAsset, loading } = useLending();
  
  const [amount, setAmount] = useState('');
  const [borrowing, setBorrowing] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [healthFactor, setHealthFactor] = useState(0);

  const market = lendingMarkets.find(m => m.id === marketId);

  useEffect(() => {
    startFadeAnimation();
    calculateHealthFactor();
  }, [market, amount]);

  const startFadeAnimation = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  };

  const calculateHealthFactor = () => {
    if (!market || !amount) {
      setHealthFactor(0);
      return;
    }

    // Mock health factor calculation
    const borrowedAmount = parseFloat(amount) || 0;
    const collateralValue = balance * 0.8; // Assume 80% collateral factor
    const healthFactorValue = collateralValue / borrowedAmount;
    setHealthFactor(healthFactorValue);
  };

  const handleMaxAmount = () => {
    if (!market) return;
    
    // In real app, this would calculate max borrowable amount
    const maxBorrowable = balance * market.collateralFactor / 100 * 0.8; // 80% of max
    setAmount(maxBorrowable.toFixed(6));
  };

  const validateAmount = () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return false;
    }

    if (healthFactor < 1.1) {
      Alert.alert(
        'Health Factor Warning',
        'Your health factor is too low. This could lead to liquidation.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Proceed', onPress: handleBorrow },
        ]
      );
      return false;
    }

    return true;
  };

  const handleBorrow = async () => {
    if (!connected) {
      Alert.alert('Wallet Not Connected', 'Please connect your wallet to borrow assets');
      return;
    }

    if (!validateAmount()) return;

    setBorrowing(true);

    try {
      await borrowAsset(marketId, parseFloat(amount), market.asset.symbol);
      
      Alert.alert(
        'Success',
        `Successfully borrowed ${amount} ${market.asset.symbol}!`,
        [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]
      );
    } catch (error) {
      console.error('Error borrowing asset:', error);
      Alert.alert('Error', 'Failed to borrow asset. Please try again.');
    } finally {
      setBorrowing(false);
    }
  };

  const getHealthFactorColor = (factor) => {
    if (factor >= 1.5) return theme.colors.success;
    if (factor >= 1.1) return theme.colors.warning;
    return theme.colors.error;
  };

  const calculateInterestCost = () => {
    if (!market || !amount) return 0;
    return (parseFloat(amount) * market.borrowApy) / 100;
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
                <Text style={styles.apyLabel}>Borrow APY</Text>
                <Text style={[styles.apyValue, { color: theme.colors.warning }]}>
                  {formatPercentage(market.borrowApy)}
                </Text>
              </View>
            </View>
          </NeonCard>

          {/* Health Factor Warning */}
          {healthFactor > 0 && healthFactor < 1.5 && (
            <NeonCard variant="warning" style={styles.healthCard}>
              <View style={styles.healthHeader}>
                <MaterialCommunityIcons 
                  name="alert-triangle" 
                  size={24} 
                  color={theme.colors.warning} 
                />
                <Text style={styles.healthTitle}>Health Factor Warning</Text>
              </View>
              <Text style={styles.healthText}>
                Your health factor is {healthFactor.toFixed(2)}. Keep it above 1.1 to avoid liquidation.
              </Text>
            </NeonCard>
          )}

          {/* Borrow Amount */}
          <NeonCard style={styles.amountCard}>
            <Text style={styles.sectionTitle}>Borrow Amount</Text>
            
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
                Available to borrow: {formatNumber(balance * market.collateralFactor / 100)} {market.asset.symbol}
              </Text>
            </View>
          </NeonCard>

          {/* Health Factor */}
          <NeonCard style={styles.healthFactorCard}>
            <Text style={styles.sectionTitle}>Health Factor</Text>
            
            <View style={styles.healthFactorDisplay}>
              <View style={styles.healthFactorValue}>
                <Text style={[styles.healthFactorNumber, { color: getHealthFactorColor(healthFactor) }]}>
                  {healthFactor.toFixed(2)}
                </Text>
                <Text style={styles.healthFactorLabel}>Current Health Factor</Text>
              </View>
              
              <View style={styles.healthFactorBar}>
                <View style={styles.healthBar}>
                  <View 
                    style={[
                      styles.healthBarFill, 
                      { 
                        width: `${Math.min(healthFactor * 50, 100)}%`,
                        backgroundColor: getHealthFactorColor(healthFactor)
                      }
                    ]} 
                  />
                </View>
                <View style={styles.healthBarLabels}>
                  <Text style={styles.healthBarLabel}>1.0</Text>
                  <Text style={styles.healthBarLabel}>2.0</Text>
                </View>
              </View>
            </View>
          </NeonCard>

          {/* Market Stats */}
          <NeonCard style={styles.statsCard}>
            <Text style={styles.sectionTitle}>Market Information</Text>
            
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Collateral Factor</Text>
                <Text style={styles.statValue}>{formatPercentage(market.collateralFactor)}</Text>
              </View>
              
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Utilization Rate</Text>
                <Text style={styles.statValue}>{formatPercentage(market.utilizationRate)}</Text>
              </View>
              
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Total Borrowed</Text>
                <Text style={styles.statValue}>{formatUSD(market.totalBorrowed)}</Text>
              </View>
              
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Supply APY</Text>
                <Text style={styles.statValue}>{formatPercentage(market.supplyApy)}</Text>
              </View>
            </View>
          </NeonCard>

          {/* Cost Analysis */}
          {amount && parseFloat(amount) > 0 && (
            <NeonCard style={styles.costCard}>
              <Text style={styles.sectionTitle}>Cost Analysis</Text>
              
              <View style={styles.costGrid}>
                <View style={styles.costItem}>
                  <Text style={styles.costLabel}>Annual Interest</Text>
                  <Text style={styles.costValue}>
                    {formatUSD(calculateInterestCost())}
                  </Text>
                </View>
                
                <View style={styles.costItem}>
                  <Text style={styles.costLabel}>Monthly Interest</Text>
                  <Text style={styles.costValue}>
                    {formatUSD(calculateInterestCost() / 12)}
                  </Text>
                </View>
                
                <View style={styles.costItem}>
                  <Text style={styles.costLabel}>Daily Interest</Text>
                  <Text style={styles.costValue}>
                    {formatUSD(calculateInterestCost() / 365)}
                  </Text>
                </View>
                
                <View style={styles.costItem}>
                  <Text style={styles.costLabel}>Interest Rate</Text>
                  <Text style={styles.costValue}>
                    {formatPercentage(market.borrowApy)}
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
                  Interest rate risk - borrowing costs can increase
                </Text>
              </View>
              
              <View style={styles.riskItem}>
                <MaterialCommunityIcons 
                  name="alert-circle" 
                  size={20} 
                  color={theme.colors.warning} 
                />
                <Text style={styles.riskText}>
                  Market risk - asset prices can be volatile
                </Text>
              </View>
            </View>
          </NeonCard>

          {/* Borrow Button */}
          <View style={styles.actionContainer}>
            <NeonButton
              title={borrowing ? "Borrowing..." : `Borrow ${market.asset.symbol}`}
              onPress={handleBorrow}
              disabled={borrowing || !connected || !amount}
              variant="warning"
              style={styles.borrowButton}
            />
            
            {!connected && (
              <Text style={styles.connectWarning}>
                Connect your wallet to borrow assets
              </Text>
            )}
          </View>

          {/* Additional Info */}
          <NeonCard style={styles.infoCard}>
            <Text style={styles.infoTitle}>Important Information</Text>
            <Text style={styles.infoText}>
              • You must maintain a health factor above 1.1{'\n'}
              • Interest is charged continuously{'\n'}
              • You can repay at any time{'\n'}
              • Monitor your health factor regularly{'\n'}
              • Collateral can be liquidated if health factor drops
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
  healthCard: {
    marginBottom: 16,
  },
  healthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  healthTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginLeft: 8,
  },
  healthText: {
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 20,
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
  healthFactorCard: {
    marginBottom: 16,
  },
  healthFactorDisplay: {
    alignItems: 'center',
  },
  healthFactorValue: {
    alignItems: 'center',
    marginBottom: 16,
  },
  healthFactorNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  healthFactorLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  healthFactorBar: {
    width: '100%',
  },
  healthBar: {
    height: 8,
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  healthBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  healthBarLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  healthBarLabel: {
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
  costCard: {
    marginBottom: 16,
  },
  costGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  costItem: {
    width: '48%',
    marginBottom: 12,
  },
  costLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  costValue: {
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
  borrowButton: {
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

export default BorrowScreen; 