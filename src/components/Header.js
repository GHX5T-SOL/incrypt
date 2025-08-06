import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { WalletContext } from '../contexts/WalletProvider';
import { useWallet } from '../contexts/WalletProvider';
import { formatAddress } from '../utils/format';
import { theme } from '../theme';

const Header = ({ title, showWalletButton = true, onWalletPress }) => {
  const { connected, connecting, getWalletAddress, getShortAddress } = useWallet();
  const { connect, disconnect } = useContext(WalletContext);

  const handleWalletPress = () => {
    if (connected) {
      // Show wallet options or disconnect
      if (onWalletPress) {
        onWalletPress();
      } else {
        disconnect();
      }
    } else {
      // Connect wallet
      connect();
    }
  };

  const getWalletButtonContent = () => {
    if (connecting) {
      return (
        <View style={styles.walletButton}>
          <MaterialCommunityIcons 
            name="loading" 
            size={16} 
            color={theme.colors.primary} 
            style={styles.spinningIcon}
          />
          <Text style={[styles.walletText, { color: theme.colors.primary }]}>
            Connecting...
          </Text>
        </View>
      );
    }

    if (connected) {
      const walletAddress = getWalletAddress();
      const shortAddress = getShortAddress();
      
      return (
        <View style={styles.walletButton}>
          <MaterialCommunityIcons 
            name="wallet" 
            size={16} 
            color={theme.colors.success} 
          />
          <Text style={[styles.walletText, { color: theme.colors.success }]}>
            {shortAddress}
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.walletButton}>
        <MaterialCommunityIcons 
          name="wallet-outline" 
          size={16} 
          color={theme.colors.primary} 
        />
        <Text style={[styles.walletText, { color: theme.colors.primary }]}>
          Connect
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.header}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{title}</Text>
      </View>
      
      {showWalletButton && (
        <TouchableOpacity
          style={[
            styles.walletButtonContainer,
            connected && styles.connectedWalletButton
          ]}
          onPress={handleWalletPress}
          activeOpacity={0.7}
        >
          {getWalletButtonContent()}
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outline,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  walletButtonContainer: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  connectedWalletButton: {
    borderColor: theme.colors.success,
    backgroundColor: theme.colors.surface,
  },
  walletButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  walletText: {
    fontSize: 14,
    fontWeight: '600',
  },
  spinningIcon: {
    // Add rotation animation if needed
  },
});

export default Header; 