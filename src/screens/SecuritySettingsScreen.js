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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useWallet } from '../hooks/useWallet';
import { theme } from '../theme';
import NeonCard from '../components/NeonCard';
import NeonButton from '../components/NeonButton';

const SecuritySettingsScreen = () => {
  const navigation = useNavigation();
  const { connected, getWalletAddress } = useWallet();
  
  const [fadeAnim] = useState(new Animated.Value(0));
  const [securitySettings, setSecuritySettings] = useState({
    biometricAuth: false,
    autoLock: true,
    autoLockDelay: 5, // minutes
    transactionConfirmations: true,
    maxTransactionAmount: 1000,
    suspiciousActivityAlerts: true,
    twoFactorAuth: false,
    sessionTimeout: 30, // minutes
    ipWhitelist: false,
    deviceManagement: true,
    securityLogs: true,
  });

  useEffect(() => {
    loadSecuritySettings();
    startFadeAnimation();
  }, []);

  const startFadeAnimation = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  };

  const loadSecuritySettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('security_settings');
      if (savedSettings) {
        setSecuritySettings(prev => ({ ...prev, ...JSON.parse(savedSettings) }));
      }
    } catch (error) {
      console.error('Error loading security settings:', error);
    }
  };

  const saveSecuritySettings = async (newSettings) => {
    try {
      await AsyncStorage.setItem('security_settings', JSON.stringify(newSettings));
      setSecuritySettings(newSettings);
    } catch (error) {
      console.error('Error saving security settings:', error);
    }
  };

  const handleSettingChange = (key, value) => {
    const newSettings = { ...securitySettings, [key]: value };
    saveSecuritySettings(newSettings);
  };

  const handleBiometricToggle = () => {
    Alert.alert(
      'Biometric Authentication',
      'This will enable fingerprint or face ID authentication for app access. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Enable', 
          onPress: () => {
            // In real app, this would check biometric availability
            handleSettingChange('biometricAuth', !securitySettings.biometricAuth);
            Alert.alert('Success', 'Biometric authentication enabled');
          }
        },
      ]
    );
  };

  const handleTwoFactorToggle = () => {
    Alert.alert(
      'Two-Factor Authentication',
      'This will enable additional security layer for transactions. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Enable', 
          onPress: () => {
            handleSettingChange('twoFactorAuth', !securitySettings.twoFactorAuth);
            navigation.navigate('TwoFactorSetup');
          }
        },
      ]
    );
  };

  const handleDeviceManagement = () => {
    navigation.navigate('DeviceManagement');
  };

  const handleSecurityLogs = () => {
    navigation.navigate('SecurityLogs');
  };

  const handleIPWhitelist = () => {
    navigation.navigate('IPWhitelist');
  };

  const getSecurityScore = () => {
    let score = 0;
    const totalChecks = 8;
    
    if (securitySettings.biometricAuth) score++;
    if (securitySettings.autoLock) score++;
    if (securitySettings.transactionConfirmations) score++;
    if (securitySettings.suspiciousActivityAlerts) score++;
    if (securitySettings.twoFactorAuth) score++;
    if (securitySettings.ipWhitelist) score++;
    if (securitySettings.deviceManagement) score++;
    if (securitySettings.securityLogs) score++;
    
    return Math.round((score / totalChecks) * 100);
  };

  const getSecurityLevel = (score) => {
    if (score >= 80) return { level: 'HIGH', color: theme.colors.success };
    if (score >= 60) return { level: 'MEDIUM', color: theme.colors.warning };
    return { level: 'LOW', color: theme.colors.error };
  };

  const renderSecurityItem = (item) => (
    <TouchableOpacity
      style={styles.securityItem}
      onPress={item.onPress}
      disabled={item.disabled}
    >
      <View style={styles.securityLeft}>
        <View style={[styles.securityIcon, { backgroundColor: item.iconColor + '20' }]}>
          <MaterialCommunityIcons 
            name={item.icon} 
            size={20} 
            color={item.iconColor} 
          />
        </View>
        <View style={styles.securityInfo}>
          <Text style={styles.securityTitle}>{item.title}</Text>
          {item.subtitle && (
            <Text style={styles.securitySubtitle}>{item.subtitle}</Text>
          )}
        </View>
      </View>
      
      <View style={styles.securityRight}>
        {item.type === 'switch' ? (
          <Switch
            value={item.value}
            onValueChange={item.onChange}
            trackColor={{ false: theme.colors.surfaceVariant, true: item.iconColor }}
            thumbColor={item.value ? theme.colors.surface : theme.colors.outline}
          />
        ) : (
          <View style={styles.securityValue}>
            <Text style={[styles.securityValueText, { color: item.valueColor }]}>
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

  const securityScore = getSecurityScore();
  const securityLevel = getSecurityLevel(securityScore);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <ScrollView style={styles.content}>
        <Animated.View style={[styles.formContainer, { opacity: fadeAnim }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Security Settings</Text>
            <Text style={styles.headerSubtitle}>
              Configure your app security preferences
            </Text>
          </View>

          {/* Security Score */}
          <NeonCard style={styles.scoreCard}>
            <View style={styles.scoreHeader}>
              <Text style={styles.scoreTitle}>Security Score</Text>
              <View style={[styles.scoreBadge, { backgroundColor: securityLevel.color + '20' }]}>
                <Text style={[styles.scoreLevel, { color: securityLevel.color }]}>
                  {securityLevel.level}
                </Text>
              </View>
            </View>
            
            <View style={styles.scoreProgress}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      width: `${securityScore}%`,
                      backgroundColor: securityLevel.color 
                    }
                  ]} 
                />
              </View>
              <Text style={styles.scoreValue}>{securityScore}%</Text>
            </View>
            
            <Text style={styles.scoreDescription}>
              {securityScore >= 80 
                ? 'Excellent security configuration'
                : securityScore >= 60 
                ? 'Good security, consider enabling more features'
                : 'Security needs improvement'
              }
            </Text>
          </NeonCard>

          {/* Authentication */}
          <NeonCard style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Authentication</Text>
            
            {renderSecurityItem({
              icon: 'fingerprint',
              title: 'Biometric Authentication',
              subtitle: 'Use fingerprint or face ID',
              type: 'switch',
              value: securitySettings.biometricAuth,
              onChange: handleBiometricToggle,
              iconColor: theme.colors.primary
            })}
            
            {renderSecurityItem({
              icon: 'shield-key',
              title: 'Two-Factor Authentication',
              subtitle: 'Additional security layer',
              type: 'switch',
              value: securitySettings.twoFactorAuth,
              onChange: handleTwoFactorToggle,
              iconColor: theme.colors.secondary
            })}
            
            {renderSecurityItem({
              icon: 'lock-clock',
              title: 'Auto Lock',
              subtitle: 'Lock app after inactivity',
              type: 'switch',
              value: securitySettings.autoLock,
              onChange: (value) => handleSettingChange('autoLock', value),
              iconColor: theme.colors.warning
            })}
            
            {renderSecurityItem({
              icon: 'timer-sand',
              title: 'Session Timeout',
              subtitle: `${securitySettings.sessionTimeout} minutes`,
              value: `${securitySettings.sessionTimeout} min`,
              valueColor: theme.colors.textSecondary,
              iconColor: theme.colors.textSecondary,
              onPress: () => navigation.navigate('SessionTimeout')
            })}
          </NeonCard>

          {/* Transaction Security */}
          <NeonCard style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Transaction Security</Text>
            
            {renderSecurityItem({
              icon: 'shield-check',
              title: 'Transaction Confirmations',
              subtitle: 'Require confirmation for all transactions',
              type: 'switch',
              value: securitySettings.transactionConfirmations,
              onChange: (value) => handleSettingChange('transactionConfirmations', value),
              iconColor: theme.colors.success
            })}
            
            {renderSecurityItem({
              icon: 'currency-usd',
              title: 'Max Transaction Amount',
              subtitle: 'Set maximum transaction limit',
              value: `$${securitySettings.maxTransactionAmount}`,
              valueColor: theme.colors.warning,
              iconColor: theme.colors.warning,
              onPress: () => navigation.navigate('TransactionLimits')
            })}
            
            {renderSecurityItem({
              icon: 'alert-circle',
              title: 'Suspicious Activity Alerts',
              subtitle: 'Get notified of unusual activity',
              type: 'switch',
              value: securitySettings.suspiciousActivityAlerts,
              onChange: (value) => handleSettingChange('suspiciousActivityAlerts', value),
              iconColor: theme.colors.error
            })}
          </NeonCard>

          {/* Device & Network Security */}
          <NeonCard style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Device & Network</Text>
            
            {renderSecurityItem({
              icon: 'devices',
              title: 'Device Management',
              subtitle: 'Manage connected devices',
              value: 'Manage',
              valueColor: theme.colors.primary,
              iconColor: theme.colors.primary,
              onPress: handleDeviceManagement
            })}
            
            {renderSecurityItem({
              icon: 'ip-network',
              title: 'IP Whitelist',
              subtitle: 'Restrict access to trusted IPs',
              type: 'switch',
              value: securitySettings.ipWhitelist,
              onChange: (value) => handleSettingChange('ipWhitelist', value),
              iconColor: theme.colors.accent
            })}
            
            {renderSecurityItem({
              icon: 'security',
              title: 'Security Logs',
              subtitle: 'View security activity history',
              value: 'View',
              valueColor: theme.colors.primary,
              iconColor: theme.colors.primary,
              onPress: handleSecurityLogs
            })}
          </NeonCard>

          {/* Security Recommendations */}
          <NeonCard variant="warning" style={styles.recommendationsCard}>
            <Text style={styles.sectionTitle}>Security Recommendations</Text>
            
            <View style={styles.recommendationsList}>
              {!securitySettings.biometricAuth && (
                <View style={styles.recommendationItem}>
                  <MaterialCommunityIcons 
                    name="fingerprint" 
                    size={20} 
                    color={theme.colors.warning} 
                  />
                  <Text style={styles.recommendationText}>
                    Enable biometric authentication for enhanced security
                  </Text>
                </View>
              )}
              
              {!securitySettings.twoFactorAuth && (
                <View style={styles.recommendationItem}>
                  <MaterialCommunityIcons 
                    name="shield-key" 
                    size={20} 
                    color={theme.colors.warning} 
                  />
                  <Text style={styles.recommendationText}>
                    Enable two-factor authentication for transactions
                  </Text>
                </View>
              )}
              
              {!securitySettings.ipWhitelist && (
                <View style={styles.recommendationItem}>
                  <MaterialCommunityIcons 
                    name="ip-network" 
                    size={20} 
                    color={theme.colors.warning} 
                  />
                  <Text style={styles.recommendationText}>
                    Consider IP whitelisting for additional protection
                  </Text>
                </View>
              )}
            </View>
          </NeonCard>

          {/* Emergency Actions */}
          <NeonCard variant="error" style={styles.emergencyCard}>
            <Text style={styles.sectionTitle}>Emergency Actions</Text>
            
            <TouchableOpacity
              style={styles.emergencyButton}
              onPress={() => navigation.navigate('EmergencyLockdown')}
            >
              <MaterialCommunityIcons 
                name="shield-alert" 
                size={24} 
                color={theme.colors.error} 
              />
              <Text style={[styles.emergencyButtonText, { color: theme.colors.error }]}>
                Emergency Lockdown
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.emergencyButton}
              onPress={() => navigation.navigate('RecoveryOptions')}
            >
              <MaterialCommunityIcons 
                name="key-variant" 
                size={24} 
                color={theme.colors.warning} 
              />
              <Text style={[styles.emergencyButtonText, { color: theme.colors.warning }]}>
                Recovery Options
              </Text>
            </TouchableOpacity>
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
  scoreCard: {
    marginBottom: 24,
  },
  scoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  scoreBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  scoreLevel: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  scoreProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: 4,
    marginRight: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  scoreValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  scoreDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
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
  securityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outline,
  },
  securityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  securityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  securityInfo: {
    flex: 1,
  },
  securityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  securitySubtitle: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    lineHeight: 16,
  },
  securityRight: {
    alignItems: 'center',
  },
  securityValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  securityValueText: {
    fontSize: 14,
    fontWeight: '500',
    marginRight: 4,
  },
  recommendationsCard: {
    marginBottom: 16,
  },
  recommendationsList: {
    marginBottom: 8,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  recommendationText: {
    fontSize: 14,
    color: theme.colors.text,
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  emergencyCard: {
    marginBottom: 16,
  },
  emergencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.error + '30',
  },
  emergencyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
});

export default SecuritySettingsScreen; 