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
  Switch,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useWallet } from '../hooks/useWallet';
import { theme } from '../theme';
import NeonCard from '../components/NeonCard';
import NeonButton from '../components/NeonButton';
import { formatUSD, formatNumber } from '../utils/format';

const SettingsScreen = () => {
  const navigation = useNavigation();
  const { connected, disconnect, getWalletAddress, getShortAddress, balance } = useWallet();
  
  const [loading, setLoading] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [settings, setSettings] = useState({
    theme: 'dark',
    notifications: true,
    biometricAuth: false,
    autoLock: true,
    transactionHistory: true,
    securityLevel: 'high',
    slippageTolerance: 0.5,
    gasOptimization: true,
    priceAlerts: true,
    riskWarnings: true,
  });

  useEffect(() => {
    loadSettings();
    startFadeAnimation();
  }, []);

  const startFadeAnimation = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  };

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('app_settings');
      if (savedSettings) {
        setSettings(prev => ({ ...prev, ...JSON.parse(savedSettings) }));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async (newSettings) => {
    try {
      await AsyncStorage.setItem('app_settings', JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const handleSettingChange = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    saveSettings(newSettings);
  };

  const handleDisconnect = () => {
    Alert.alert(
      'Disconnect Wallet',
      'Are you sure you want to disconnect your wallet? This will clear all your data.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Disconnect', 
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await disconnect();
              Alert.alert('Success', 'Wallet disconnected successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to disconnect wallet');
            } finally {
              setLoading(false);
            }
          }
        },
      ]
    );
  };

  const handleExportData = () => {
    Alert.alert(
      'Export Data',
      'This will export your transaction history and settings. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Export', 
          onPress: () => {
            // In real app, this would export data to file
            Alert.alert('Success', 'Data exported successfully');
          }
        },
      ]
    );
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all your data including transaction history. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear All', 
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              Alert.alert('Success', 'All data cleared successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear data');
            }
          }
        },
      ]
    );
  };

  const getSecurityLevelColor = (level) => {
    switch (level) {
      case 'high': return theme.colors.success;
      case 'medium': return theme.colors.warning;
      case 'low': return theme.colors.error;
      default: return theme.colors.textSecondary;
    }
  };

  const renderSettingItem = (item) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={item.onPress}
      disabled={item.disabled}
    >
      <View style={styles.settingLeft}>
        <View style={[styles.settingIcon, { backgroundColor: item.iconColor + '20' }]}>
          <MaterialCommunityIcons 
            name={item.icon} 
            size={20} 
            color={item.iconColor} 
          />
        </View>
        <View style={styles.settingInfo}>
          <Text style={styles.settingTitle}>{item.title}</Text>
          {item.subtitle && (
            <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
          )}
        </View>
      </View>
      
      <View style={styles.settingRight}>
        {item.type === 'switch' ? (
          <Switch
            value={item.value}
            onValueChange={item.onChange}
            trackColor={{ false: theme.colors.surfaceVariant, true: item.iconColor }}
            thumbColor={item.value ? theme.colors.surface : theme.colors.outline}
          />
        ) : item.type === 'input' ? (
          <TextInput
            style={styles.settingInput}
            value={item.value}
            onChangeText={item.onChange}
            placeholder={item.placeholder}
            placeholderTextColor={theme.colors.textSecondary}
            keyboardType="numeric"
          />
        ) : (
          <View style={styles.settingValue}>
            <Text style={[styles.settingValueText, { color: item.valueColor }]}>
              {item.value}
            </Text>
            <MaterialCommunityIcons 
              name="chevron-right" 
              size={20} 
              color={theme.colors.textSecondary} 
            />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <ScrollView style={styles.content}>
        <Animated.View style={[styles.formContainer, { opacity: fadeAnim }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Settings & Security</Text>
            <Text style={styles.headerSubtitle}>
              Manage your app preferences and security settings
            </Text>
          </View>

          {/* Wallet Section */}
          <NeonCard style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Wallet</Text>
            
            {renderSettingItem({
              icon: 'wallet',
              title: 'Wallet Address',
              subtitle: connected ? getWalletAddress() : 'Not connected',
              value: connected ? getShortAddress() : 'Connect Wallet',
              valueColor: connected ? theme.colors.success : theme.colors.warning,
              iconColor: connected ? theme.colors.success : theme.colors.warning,
              onPress: () => {
                if (connected) {
                  Alert.alert('Wallet Address', getWalletAddress());
                } else {
                  navigation.navigate('ConnectWallet');
                }
              }
            })}
            
            {connected && renderSettingItem({
              icon: 'currency-usd',
              title: 'SOL Balance',
              value: `${formatNumber(balance)} SOL`,
              valueColor: theme.colors.primary,
              iconColor: theme.colors.primary,
              onPress: () => navigation.navigate('Wallet')
            })}
            
            {connected && renderSettingItem({
              icon: 'export',
              title: 'Export Data',
              subtitle: 'Export transaction history and settings',
              value: 'Export',
              valueColor: theme.colors.primary,
              iconColor: theme.colors.primary,
              onPress: handleExportData
            })}
            
            {connected && (
              <TouchableOpacity
                style={[styles.settingItem, styles.dangerItem]}
                onPress={handleDisconnect}
              >
                <View style={styles.settingLeft}>
                  <View style={[styles.settingIcon, { backgroundColor: theme.colors.error + '20' }]}>
                    <MaterialCommunityIcons 
                      name="logout" 
                      size={20} 
                      color={theme.colors.error} 
                    />
                  </View>
                  <View style={styles.settingInfo}>
                    <Text style={[styles.settingTitle, { color: theme.colors.error }]}>
                      Disconnect Wallet
                    </Text>
                    <Text style={styles.settingSubtitle}>
                      Clear wallet connection and data
                    </Text>
                  </View>
                </View>
                
                <MaterialCommunityIcons 
                  name="chevron-right" 
                  size={20} 
                  color={theme.colors.error} 
                />
              </TouchableOpacity>
            )}
          </NeonCard>

          {/* Security Section */}
          <NeonCard style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Security</Text>
            
            {renderSettingItem({
              icon: 'shield-check',
              title: 'Security Level',
              subtitle: 'Configure security preferences',
              value: settings.securityLevel.toUpperCase(),
              valueColor: getSecurityLevelColor(settings.securityLevel),
              iconColor: getSecurityLevelColor(settings.securityLevel),
              onPress: () => navigation.navigate('SecuritySettings')
            })}
            
            {renderSettingItem({
              icon: 'fingerprint',
              title: 'Biometric Authentication',
              subtitle: 'Use fingerprint or face ID',
              type: 'switch',
              value: settings.biometricAuth,
              onChange: (value) => handleSettingChange('biometricAuth', value),
              iconColor: theme.colors.primary
            })}
            
            {renderSettingItem({
              icon: 'lock-clock',
              title: 'Auto Lock',
              subtitle: 'Lock app after inactivity',
              type: 'switch',
              value: settings.autoLock,
              onChange: (value) => handleSettingChange('autoLock', value),
              iconColor: theme.colors.warning
            })}
            
            {renderSettingItem({
              icon: 'alert-circle',
              title: 'Risk Warnings',
              subtitle: 'Show safety warnings',
              type: 'switch',
              value: settings.riskWarnings,
              onChange: (value) => handleSettingChange('riskWarnings', value),
              iconColor: theme.colors.warning
            })}
          </NeonCard>

          {/* App Settings */}
          <NeonCard style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>App Settings</Text>
            
            {renderSettingItem({
              icon: 'theme-light-dark',
              title: 'Theme',
              subtitle: 'Choose app appearance',
              value: settings.theme === 'dark' ? 'Dark Mode' : 'Light Mode',
              valueColor: theme.colors.secondary,
              iconColor: theme.colors.secondary,
              onPress: () => {
                const newTheme = settings.theme === 'dark' ? 'light' : 'dark';
                handleSettingChange('theme', newTheme);
              }
            })}
            
            {renderSettingItem({
              icon: 'bell',
              title: 'Notifications',
              subtitle: 'Receive app notifications',
              type: 'switch',
              value: settings.notifications,
              onChange: (value) => handleSettingChange('notifications', value),
              iconColor: theme.colors.accent
            })}
            
            {renderSettingItem({
              icon: 'tag',
              title: 'Price Alerts',
              subtitle: 'Get price change notifications',
              type: 'switch',
              value: settings.priceAlerts,
              onChange: (value) => handleSettingChange('priceAlerts', value),
              iconColor: theme.colors.accent
            })}
            
            {renderSettingItem({
              icon: 'history',
              title: 'Transaction History',
              subtitle: 'Save transaction records',
              type: 'switch',
              value: settings.transactionHistory,
              onChange: (value) => handleSettingChange('transactionHistory', value),
              iconColor: theme.colors.primary
            })}
          </NeonCard>

          {/* Trading Settings */}
          <NeonCard style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Trading Settings</Text>
            
            {renderSettingItem({
              icon: 'percent',
              title: 'Slippage Tolerance',
              subtitle: 'Maximum price slippage',
              type: 'input',
              value: settings.slippageTolerance.toString(),
              onChange: (value) => handleSettingChange('slippageTolerance', parseFloat(value) || 0.5),
              placeholder: '0.5',
              iconColor: theme.colors.warning
            })}
            
            {renderSettingItem({
              icon: 'gas-station',
              title: 'Gas Optimization',
              subtitle: 'Optimize transaction fees',
              type: 'switch',
              value: settings.gasOptimization,
              onChange: (value) => handleSettingChange('gasOptimization', value),
              iconColor: theme.colors.success
            })}
          </NeonCard>

          {/* Data Management */}
          <NeonCard style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Data Management</Text>
            
            {renderSettingItem({
              icon: 'database',
              title: 'Storage Usage',
              subtitle: 'Manage app data storage',
              value: '2.3 MB',
              valueColor: theme.colors.textSecondary,
              iconColor: theme.colors.primary,
              onPress: () => navigation.navigate('StorageSettings')
            })}
            
            <TouchableOpacity
              style={[styles.settingItem, styles.dangerItem]}
              onPress={handleClearData}
            >
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: theme.colors.error + '20' }]}>
                  <MaterialCommunityIcons 
                    name="delete" 
                    size={20} 
                    color={theme.colors.error} 
                  />
                </View>
                <View style={styles.settingInfo}>
                  <Text style={[styles.settingTitle, { color: theme.colors.error }]}>
                    Clear All Data
                  </Text>
                  <Text style={styles.settingSubtitle}>
                    Permanently delete all app data
                  </Text>
                </View>
              </View>
              
              <MaterialCommunityIcons 
                name="chevron-right" 
                size={20} 
                color={theme.colors.error} 
              />
            </TouchableOpacity>
          </NeonCard>

          {/* About Section */}
          <NeonCard style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>About</Text>
            
            {renderSettingItem({
              icon: 'information',
              title: 'Version',
              value: '1.0.0',
              valueColor: theme.colors.textSecondary,
              iconColor: theme.colors.textSecondary,
              onPress: () => navigation.navigate('About')
            })}
            
            {renderSettingItem({
              icon: 'file-document',
              title: 'Terms of Service',
              value: 'View',
              valueColor: theme.colors.primary,
              iconColor: theme.colors.primary,
              onPress: () => navigation.navigate('Terms')
            })}
            
            {renderSettingItem({
              icon: 'shield-lock',
              title: 'Privacy Policy',
              value: 'View',
              valueColor: theme.colors.primary,
              iconColor: theme.colors.primary,
              onPress: () => navigation.navigate('Privacy')
            })}
            
            {renderSettingItem({
              icon: 'github',
              title: 'GitHub',
              value: 'View Source',
              valueColor: theme.colors.primary,
              iconColor: theme.colors.primary,
              onPress: () => {
                // In real app, this would open GitHub
                Alert.alert('GitHub', 'Repository link would open here');
              }
            })}
          </NeonCard>

          {/* Support Section */}
          <NeonCard style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Support</Text>
            
            {renderSettingItem({
              icon: 'help-circle',
              title: 'Help & FAQ',
              value: 'View',
              valueColor: theme.colors.primary,
              iconColor: theme.colors.primary,
              onPress: () => navigation.navigate('Help')
            })}
            
            {renderSettingItem({
              icon: 'email',
              title: 'Contact Support',
              value: 'Email',
              valueColor: theme.colors.primary,
              iconColor: theme.colors.primary,
              onPress: () => {
                Alert.alert('Contact', 'incryptinvestments@protonmail.com');
              }
            })}
            
            {renderSettingItem({
              icon: 'bug',
              title: 'Report Bug',
              value: 'Report',
              valueColor: theme.colors.warning,
              iconColor: theme.colors.warning,
              onPress: () => navigation.navigate('BugReport')
            })}
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
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    lineHeight: 22,
  },
  sectionCard: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outline,
  },
  dangerItem: {
    borderBottomColor: theme.colors.error + '30',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    lineHeight: 16,
  },
  settingRight: {
    alignItems: 'center',
  },
  settingValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValueText: {
    fontSize: 14,
    fontWeight: '500',
    marginRight: 4,
  },
  settingInput: {
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.outline,
    minWidth: 80,
    textAlign: 'center',
  },
});

export default SettingsScreen; 