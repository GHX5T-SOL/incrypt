import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Animated,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../theme';
import { useWallet } from '../contexts/WalletProvider';
import { useLending } from '../hooks/useLending';
import { formatSOL, formatUSD, formatPercentage } from '../utils/format';

const LendingDetailScreen = () => {
  const { connected, balance } = useWallet();
  const { 
    lendingMarkets, 
    userPositions, 
    loading, 
    supplyAsset, 
    borrowAsset, 
    withdrawAsset, 
    repayAsset 
  } = useLending();

  // Mock lending opportunity data
  const lendingOpportunity = {
    id: lendingId,
    protocol: 'Kamino',
    asset: 'SOL',
    apy: 5.2,
    tvl: 28000000,
    risk: 'low',
    icon: 'bank',
    description: 'Supply SOL to earn yield on Kamino Finance. Low risk, stable returns.',
    features: [
      'Instant liquidity',
      'No lock-up period',
      'Compound interest',
      'Low risk profile'
    ],
    requirements: [
      'Minimum 0.1 SOL',
      'Solana wallet',
      'Network fees apply'
    ]
  };

  const handleSupply = () => {
    if (!connected) {
      Alert.alert('Wallet Not Connected', 'Please connect your wallet to continue.');
      return;
    }

    Alert.alert(
      'Supply SOL',
      `Supply SOL to ${lendingOpportunity.protocol} at ${lendingOpportunity.apy}% APY?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Supply', 
          onPress: () => {
            setLoading(true);
            // Simulate transaction
            setTimeout(() => {
              setLoading(false);
              Alert.alert('Success', 'Your SOL has been supplied successfully!');
            }, 2000);
          }
        },
      ]
    );
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'low': return theme.colors.success;
      case 'medium': return theme.colors.warning;
      case 'high': return theme.colors.error;
      default: return theme.colors.textSecondary;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.protocolInfo}>
            <MaterialCommunityIcons 
              name={lendingOpportunity.icon} 
              size={48} 
              color={theme.colors.primary} 
            />
            <View style={styles.protocolDetails}>
              <Text style={styles.protocolName}>{lendingOpportunity.protocol}</Text>
              <Text style={styles.assetName}>{lendingOpportunity.asset} Lending</Text>
            </View>
          </View>
          <View style={[styles.riskBadge, { backgroundColor: getRiskColor(lendingOpportunity.risk) + '20' }]}>
            <Text style={[styles.riskText, { color: getRiskColor(lendingOpportunity.risk) }]}>
              {lendingOpportunity.risk.toUpperCase()} RISK
            </Text>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <NeonCard style={styles.statCard}>
            <Text style={styles.statLabel}>Supply APY</Text>
            <Text style={styles.statValue}>{formatPercentage(lendingOpportunity.apy)}</Text>
          </NeonCard>

          <NeonCard style={styles.statCard}>
            <Text style={styles.statLabel}>Total TVL</Text>
            <Text style={styles.statValue}>{formatUSD(lendingOpportunity.tvl)}</Text>
          </NeonCard>
        </View>

        {/* Description */}
        <NeonCard style={styles.descriptionCard}>
          <Text style={styles.descriptionTitle}>About this opportunity</Text>
          <Text style={styles.descriptionText}>{lendingOpportunity.description}</Text>
        </NeonCard>

        {/* Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Features</Text>
          {lendingOpportunity.features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <MaterialCommunityIcons 
                name="check-circle" 
                size={20} 
                color={theme.colors.success} 
              />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>

        {/* Requirements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Requirements</Text>
          {lendingOpportunity.requirements.map((requirement, index) => (
            <View key={index} style={styles.requirementItem}>
              <MaterialCommunityIcons 
                name="information" 
                size={20} 
                color={theme.colors.warning} 
              />
              <Text style={styles.requirementText}>{requirement}</Text>
            </View>
          ))}
        </View>

        {/* Supply Button */}
        <View style={styles.actionContainer}>
          <NeonButton
            title={loading ? "Processing..." : "Supply SOL"}
            onPress={handleSupply}
            disabled={loading || !connected}
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
            • Past performance does not guarantee future returns
          </Text>
        </NeonCard>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  protocolInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  protocolDetails: {
    marginLeft: 16,
  },
  protocolName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  assetName: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  riskBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  riskText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    marginHorizontal: 4,
  },
  statLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  descriptionCard: {
    marginBottom: 24,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    lineHeight: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 16,
    color: theme.colors.text,
    marginLeft: 12,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  requirementText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginLeft: 12,
  },
  actionContainer: {
    marginBottom: 24,
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
    marginBottom: 24,
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

export default LendingDetailScreen; 