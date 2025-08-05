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

const RepayScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { positionId } = route.params;
  const { connected, balance } = useWallet();
  const { userPositions, repayAsset, loading } = useLending();
  
  const [amount, setAmount] = useState('');
  const [repaying, setRepaying] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  const position = userPositions.find(p => p.id === positionId);

  useEffect(() => {
    startFadeAnimation();
  }, [position]);

  const startFadeAnimation = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  };

  const handleMaxAmount = () => {
    if (!position) return;
    setAmount(position.amount.toString());
  };

  const validateAmount = () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return false;
    }

    if (parseFloat(amount) > position.amount) {
      Alert.alert('Error', 'Amount exceeds your borrowed balance');
      return false;
    }

    if (parseFloat(amount) > balance) {
      Alert.alert('Error', 'Insufficient balance to repay');
      return false;
    }

    return true;
  };

  const handleRepay = async () => {
    if (!connected) {
      Alert.alert('Wallet Not Connected', 'Please connect your wallet to repay assets');
      return;
    }

    if (!validateAmount()) return;

    setRepaying(true);

    try {
      await repayAsset(positionId, parseFloat(amount));
      
      Alert.alert(
        'Success',
        `Successfully repaid ${amount} ${position.asset.symbol}!`,
        [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]
      );
    } catch (error) {
      console.error('Error repaying asset:', error);
      Alert.alert('Error', 'Failed to repay asset. Please try again.');
    } finally {
      setRepaying(false);
    }
  };

  if (!position) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <MaterialCommunityIcons 
            name="loading" 
            size={48} 
            color={theme.colors.primary} 
          />
          <Text style={styles.loadingText}>Loading position details...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <ScrollView style={styles.content}>
        <Animated.View style={[styles.formContainer, { opacity: fadeAnim }]}>
          {/* Position Header */}
          <NeonCard style={styles.headerCard}>
            <View style={styles.positionHeader}>
              <View style={styles.positionInfo}>
                <View style={styles.assetIcon}>
                  <MaterialCommunityIcons 
                    name="currency-btc" 
                    size={32} 
                    color={theme.colors.primary} 
                  />
                </View>
                <View style={styles.positionDetails}>
                  <Text style={styles.assetSymbol}>{position.asset.symbol}</Text>
                  <Text style={styles.protocolName}>{position.protocol}</Text>
                </View>
              </View>
              
              <View style={styles.apyBadge}>
                <Text style={styles.apyLabel}>Borrow APY</Text>
                <Text style={[styles.apyValue, { color: theme.colors.warning }]}>
                  {formatPercentage(position.apy)}
                </Text>
              </View>
            </View>
          </NeonCard>

          {/* Current Position */}
          <NeonCard style={styles.positionCard}>
            <Text style={styles.sectionTitle}>Current Position</Text>
            
            <View style={styles.positionStats}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Borrowed Amount</Text>
                <Text style={styles.statValue}>
                  {formatNumber(position.amount)} {position.asset.symbol}
                </Text>
                <Text style={styles.statValueUSD}>{formatUSD(position.value)}</Text>
              </View>
              
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Interest Owed</Text>
                <Text style={[styles.statValue, { color: theme.colors.warning }]}>
                  {formatUSD(position.earned)}
                </Text>
              </View>
            </View>
          </NeonCard>

          {/* Wallet Balance */}
          <NeonCard style={styles.balanceCard}>
            <Text style={styles.sectionTitle}>Wallet Balance</Text>
            
            <View style={styles.balanceInfo}>
              <Text style={styles.balanceLabel}>Available {position.asset.symbol}</Text>
              <Text style={styles.balanceValue}>
                {formatNumber(balance)} {position.asset.symbol}
              </Text>
              <Text style={styles.balanceValueUSD}>{formatUSD(balance * 150)}</Text>
            </View>
          </NeonCard>

          {/* Repay Amount */}
          <NeonCard style={styles.amountCard}>
            <Text style={styles.sectionTitle}>Repay Amount</Text>
            
            <View style={styles.amountInput}>
              <Text style={styles.amountLabel}>{position.asset.symbol} Amount</Text>
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
                Borrowed: {formatNumber(position.amount)} {position.asset.symbol}
              </Text>
            </View>
          </NeonCard>

          {/* Repay Button */}
          <View style={styles.actionContainer}>
            <NeonButton
              title={repaying ? "Repaying..." : `Repay ${position.asset.symbol}`}
              onPress={handleRepay}
              disabled={repaying || !connected || !amount}
              variant="success"
              style={styles.repayButton}
            />
            
            {!connected && (
              <Text style={styles.connectWarning}>
                Connect your wallet to repay assets
              </Text>
            )}
          </View>

          {/* Additional Info */}
          <NeonCard style={styles.infoCard}>
            <Text style={styles.infoTitle}>Important Information</Text>
            <Text style={styles.infoText}>
              • Repaying reduces your borrowed amount and interest{'\n'}
              • You can repay any amount up to your borrowed balance{'\n'}
              • Network fees apply to repayment transactions{'\n'}
              • Repayment may take a few minutes to process{'\n'}
              • Interest is calculated continuously
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
  positionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  positionInfo: {
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
  positionDetails: {
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
  positionCard: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 16,
  },
  positionStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 2,
  },
  statValueUSD: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  balanceCard: {
    marginBottom: 16,
  },
  balanceInfo: {
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  balanceValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 2,
  },
  balanceValueUSD: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  amountCard: {
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
  actionContainer: {
    marginBottom: 16,
  },
  repayButton: {
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

export default RepayScreen; 