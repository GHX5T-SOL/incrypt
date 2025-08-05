import React from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity 
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';
import { useWallet } from '../hooks/useWallet';
import { theme } from '../theme';
import NeonCard from '../components/NeonCard';
import { formatSOL, formatUSD } from '../utils/format';

const WalletScreen = () => {
  const themeColors = useTheme();
  const { 
    connected, 
    getWalletAddress, 
    getShortAddress, 
    balance,
    loading 
  } = useWallet();

  if (!connected) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Wallet not connected</Text>
      </View>
    );
  }

  const walletAddress = getWalletAddress();
  const shortAddress = getShortAddress();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Wallet Overview */}
        <NeonCard variant="success" style={styles.walletCard}>
          <View style={styles.walletHeader}>
            <MaterialCommunityIcons 
              name="wallet" 
              size={32} 
              color={theme.colors.success} 
            />
            <Text style={styles.walletTitle}>Connected Wallet</Text>
          </View>
          
          <View style={styles.balanceContainer}>
            <Text style={styles.balanceLabel}>SOL Balance</Text>
            <Text style={styles.balanceAmount}>
              {loading ? 'Loading...' : formatSOL(balance * 1e9)}
            </Text>
            <Text style={styles.balanceUSD}>
              ≈ {formatUSD(balance * 100)} {/* Assuming $100 per SOL */}
            </Text>
          </View>

          <View style={styles.addressContainer}>
            <Text style={styles.addressLabel}>Wallet Address</Text>
            <TouchableOpacity style={styles.addressButton}>
              <Text style={styles.addressText}>{shortAddress}</Text>
              <MaterialCommunityIcons 
                name="content-copy" 
                size={16} 
                color={theme.colors.primary} 
              />
            </TouchableOpacity>
          </View>
        </NeonCard>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.actionButton}>
              <MaterialCommunityIcons 
                name="send" 
                size={24} 
                color={theme.colors.primary} 
              />
              <Text style={styles.actionText}>Send</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <MaterialCommunityIcons 
                name="download" 
                size={24} 
                color={theme.colors.secondary} 
              />
              <Text style={styles.actionText}>Receive</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <MaterialCommunityIcons 
                name="swap-horizontal" 
                size={24} 
                color={theme.colors.accent} 
              />
              <Text style={styles.actionText}>Swap</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <MaterialCommunityIcons 
                name="chart-line" 
                size={24} 
                color={theme.colors.neonBlue} 
              />
              <Text style={styles.actionText}>Stake</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <NeonCard style={styles.activityCard}>
            <Text style={styles.noActivityText}>No recent activity</Text>
            <Text style={styles.noActivitySubtext}>
              Your transaction history will appear here
            </Text>
          </NeonCard>
        </View>

        {/* Network Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Network</Text>
          <NeonCard style={styles.networkCard}>
            <View style={styles.networkInfo}>
              <MaterialCommunityIcons 
                name="server-network" 
                size={20} 
                color={theme.colors.primary} 
              />
              <Text style={styles.networkText}>Solana Mainnet</Text>
            </View>
            <View style={styles.networkStatus}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Connected</Text>
            </View>
          </NeonCard>
        </View>
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
  errorText: {
    color: theme.colors.error,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 50,
  },
  walletCard: {
    marginBottom: 24,
  },
  walletHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  walletTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginLeft: 12,
  },
  balanceContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  balanceLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  balanceUSD: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  addressContainer: {
    marginTop: 16,
  },
  addressLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 8,
  },
  addressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: 8,
  },
  addressText: {
    fontSize: 16,
    color: theme.colors.text,
    fontFamily: 'monospace',
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
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: theme.colors.outline,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: 8,
  },
  activityCard: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noActivityText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  noActivitySubtext: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  networkCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  networkInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  networkText: {
    fontSize: 16,
    color: theme.colors.text,
    marginLeft: 8,
  },
  networkStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.success,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    color: theme.colors.success,
  },
});

export default WalletScreen; 