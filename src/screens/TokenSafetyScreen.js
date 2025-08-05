import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  Animated,
} from 'react-native';
import { useRugcheck } from '../hooks/useRugcheck';
import { useTheme } from '../theme';
import { NeonButton } from '../components/NeonButton';
import { NeonCard } from '../components/NeonCard';
import { formatAddress, formatPercentage } from '../utils/format';

const TokenSafetyScreen = () => {
  const theme = useTheme();
  const {
    loading,
    error,
    safetyData,
    analyzeToken,
    analyzePool,
    analyzeWebsite,
    analyzeWallet,
    getSafetyLevel,
    getSafetyColor,
    clearSafetyData,
  } = useRugcheck();

  const [tokenAddress, setTokenAddress] = useState('');
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleAnalyzeToken = async () => {
    if (!tokenAddress.trim()) {
      Alert.alert('Error', 'Please enter a token address');
      return;
    }

    try {
      await analyzeToken(tokenAddress.trim());
    } catch (err) {
      Alert.alert('Analysis Failed', err.message || 'Failed to analyze token');
    }
  };

  const handleClearData = () => {
    clearSafetyData();
    setTokenAddress('');
  };

  const renderSafetyScore = () => {
    if (!safetyData) return null;

    const { overallScore, safetyLevel, safetyColor } = safetyData;
    
    return (
      <NeonCard variant="primary" style={styles.scoreCard}>
        <Text style={[styles.scoreTitle, { color: theme.colors.text }]}>
          Overall Safety Score
        </Text>
        <View style={styles.scoreContainer}>
          <Text style={[styles.scoreValue, { color: safetyColor }]}>
            {overallScore.toFixed(1)}%
          </Text>
          <Text style={[styles.scoreLevel, { color: safetyColor }]}>
            {safetyLevel}
          </Text>
        </View>
        <View style={styles.scoreBar}>
          <View 
            style={[
              styles.scoreProgress, 
              { 
                width: `${overallScore}%`,
                backgroundColor: safetyColor 
              }
            ]} 
          />
        </View>
      </NeonCard>
    );
  };

  const renderSafetyDetails = () => {
    if (!safetyData) return null;

    const sections = [
      {
        title: 'Honeypot Check',
        data: safetyData.honeypotCheck,
        key: 'honeypot'
      },
      {
        title: 'Liquidity Analysis',
        data: safetyData.liquidityAnalysis,
        key: 'liquidity'
      },
      {
        title: 'Contract Verification',
        data: safetyData.contractVerification,
        key: 'contract'
      },
      {
        title: 'Risk Assessment',
        data: safetyData.riskAssessment,
        key: 'risk'
      },
      {
        title: 'Social Media',
        data: safetyData.socialMedia,
        key: 'social'
      },
      {
        title: 'Developer Activity',
        data: safetyData.developerActivity,
        key: 'developer'
      },
      {
        title: 'Volume Analysis',
        data: safetyData.volumeAnalysis,
        key: 'volume'
      },
      {
        title: 'Price Manipulation',
        data: safetyData.priceManipulation,
        key: 'manipulation'
      },
      {
        title: 'Community Trust',
        data: safetyData.communityTrust,
        key: 'community'
      },
      {
        title: 'Audit Status',
        data: safetyData.auditStatus,
        key: 'audit'
      }
    ];

    return sections.map(section => (
      <NeonCard key={section.key} style={styles.detailCard}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          {section.title}
        </Text>
        {section.data ? (
          <View style={styles.sectionContent}>
            {Object.entries(section.data).map(([key, value]) => (
              <View key={key} style={styles.dataRow}>
                <Text style={[styles.dataLabel, { color: theme.colors.textSecondary }]}>
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:
                </Text>
                <Text style={[styles.dataValue, { color: theme.colors.text }]}>
                  {typeof value === 'boolean' 
                    ? (value ? '✅ Yes' : '❌ No')
                    : typeof value === 'number'
                    ? value.toFixed(2)
                    : String(value)
                  }
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={[styles.noData, { color: theme.colors.textSecondary }]}>
            No data available
          </Text>
        )}
      </NeonCard>
    ));
  };

  const renderTokenMetadata = () => {
    if (!safetyData?.metadata) return null;

    const { metadata } = safetyData;

    return (
      <NeonCard style={styles.metadataCard}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Token Information
        </Text>
        <View style={styles.metadataContent}>
          <View style={styles.dataRow}>
            <Text style={[styles.dataLabel, { color: theme.colors.textSecondary }]}>
              Name:
            </Text>
            <Text style={[styles.dataValue, { color: theme.colors.text }]}>
              {metadata.name || 'Unknown'}
            </Text>
          </View>
          <View style={styles.dataRow}>
            <Text style={[styles.dataLabel, { color: theme.colors.textSecondary }]}>
              Symbol:
            </Text>
            <Text style={[styles.dataValue, { color: theme.colors.text }]}>
              {metadata.symbol || 'Unknown'}
            </Text>
          </View>
          <View style={styles.dataRow}>
            <Text style={[styles.dataLabel, { color: theme.colors.textSecondary }]}>
              Decimals:
            </Text>
            <Text style={[styles.dataValue, { color: theme.colors.text }]}>
              {metadata.decimals || 'Unknown'}
            </Text>
          </View>
          <View style={styles.dataRow}>
            <Text style={[styles.dataLabel, { color: theme.colors.textSecondary }]}>
              Address:
            </Text>
            <Text style={[styles.dataValue, { color: theme.colors.text }]}>
              {formatAddress(metadata.address || tokenAddress)}
            </Text>
          </View>
        </View>
      </NeonCard>
    );
  };

  const renderTeamInfo = () => {
    if (!safetyData?.teamInfo) return null;

    const { teamInfo } = safetyData;

    return (
      <NeonCard style={styles.teamCard}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Team Information
        </Text>
        <View style={styles.teamContent}>
          {Object.entries(teamInfo).map(([key, value]) => (
            <View key={key} style={styles.dataRow}>
              <Text style={[styles.dataLabel, { color: theme.colors.textSecondary }]}>
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:
              </Text>
              <Text style={[styles.dataValue, { color: theme.colors.text }]}>
                {typeof value === 'boolean' 
                  ? (value ? '✅ Yes' : '❌ No')
                  : String(value)
                }
              </Text>
            </View>
          ))}
        </View>
      </NeonCard>
    );
  };

  const renderSentiment = () => {
    if (!safetyData?.sentiment) return null;

    const { sentiment } = safetyData;

    return (
      <NeonCard style={styles.sentimentCard}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Market Sentiment
        </Text>
        <View style={styles.sentimentContent}>
          <View style={styles.sentimentItem}>
            <Text style={[styles.sentimentLabel, { color: theme.colors.textSecondary }]}>
              Overall Sentiment:
            </Text>
            <Text style={[styles.sentimentValue, { color: theme.colors.text }]}>
              {sentiment.overall || 'Neutral'}
            </Text>
          </View>
          <View style={styles.sentimentItem}>
            <Text style={[styles.sentimentLabel, { color: theme.colors.textSecondary }]}>
              Confidence:
            </Text>
            <Text style={[styles.sentimentValue, { color: theme.colors.text }]}>
              {formatPercentage(sentiment.confidence || 0)}
            </Text>
          </View>
        </View>
      </NeonCard>
    );
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <Animated.View style={{ opacity: fadeAnim }}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Token Safety Analysis
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Analyze token safety and detect potential risks
        </Text>

        <NeonCard style={styles.inputCard}>
          <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
            Token Address
          </Text>
          <TextInput
            style={[styles.input, { 
              color: theme.colors.text,
              borderColor: theme.colors.border,
              backgroundColor: theme.colors.surface
            }]}
            value={tokenAddress}
            onChangeText={setTokenAddress}
            placeholder="Enter Solana token address..."
            placeholderTextColor={theme.colors.textSecondary}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <View style={styles.buttonContainer}>
            <NeonButton
              title="Analyze Token"
              onPress={handleAnalyzeToken}
              loading={loading}
              disabled={!tokenAddress.trim()}
              style={styles.analyzeButton}
            />
            <NeonButton
              title="Clear"
              variant="secondary"
              onPress={handleClearData}
              style={styles.clearButton}
            />
          </View>
        </NeonCard>

        {error && (
          <NeonCard variant="error" style={styles.errorCard}>
            <Text style={[styles.errorText, { color: theme.colors.error }]}>
              {error}
            </Text>
          </NeonCard>
        )}

        {safetyData && (
          <>
            {renderSafetyScore()}
            {renderTokenMetadata()}
            {renderTeamInfo()}
            {renderSentiment()}
            {renderSafetyDetails()}
          </>
        )}

        {!safetyData && !loading && (
          <NeonCard style={styles.emptyCard}>
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              Enter a token address to begin safety analysis
            </Text>
          </NeonCard>
        )}
      </Animated.View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  inputCard: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  analyzeButton: {
    flex: 1,
  },
  clearButton: {
    flex: 1,
  },
  errorCard: {
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
  },
  scoreCard: {
    marginBottom: 16,
    alignItems: 'center',
  },
  scoreTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  scoreValue: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  scoreLevel: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 4,
  },
  scoreBar: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  scoreProgress: {
    height: '100%',
    borderRadius: 4,
  },
  detailCard: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  sectionContent: {
    gap: 8,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dataLabel: {
    fontSize: 14,
    flex: 1,
  },
  dataValue: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  noData: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  metadataCard: {
    marginBottom: 16,
  },
  metadataContent: {
    gap: 8,
  },
  teamCard: {
    marginBottom: 16,
  },
  teamContent: {
    gap: 8,
  },
  sentimentCard: {
    marginBottom: 16,
  },
  sentimentContent: {
    gap: 8,
  },
  sentimentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sentimentLabel: {
    fontSize: 14,
    flex: 1,
  },
  sentimentValue: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  emptyCard: {
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default TokenSafetyScreen; 