import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  Appbar,
  Card,
  Button,
  ProgressBar,
  Divider,
  ActivityIndicator,
  useTheme,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useWallet } from '../contexts/WalletProvider';
import { useConnection } from '../contexts/ConnectionProvider';
import { neonStyles } from '../theme';
import { formatNumber, formatPercentage } from '../utils/format';
import { VictoryPie, VictoryLabel } from 'victory-native';

// Meteora Points API endpoint (in a real app, this would be a real API)
const METEORA_POINTS_API = 'https://api.meteora.ag/points/';

const MeteoraPointsScreen = () => {
  const navigation = useNavigation();
  const theme = useTheme();
  const { publicKey, connected } = useWallet();
  const connection = useConnection();
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pointsData, setPointsData] = useState(null);
  const [activityHistory, setActivityHistory] = useState([]);
  const [rewardsHistory, setRewardsHistory] = useState([]);
  
  useEffect(() => {
    if (connected && publicKey) {
      fetchPointsData();
    } else {
      setLoading(false);
    }
  }, [connected, publicKey]);
  
  const fetchPointsData = async () => {
    setLoading(true);
    try {
      // In a real app, this would be an API call to Meteora's points API
      // For now, we'll simulate the data
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock data for Meteora Points
      const mockPointsData = {
        totalPoints: 12450,
        rank: 'Silver',
        percentile: 82, // Top 18%
        nextRank: 'Gold',
        pointsToNextRank: 2550,
        pointsBreakdown: {
          trading: 7230,
          liquidity: 4120,
          referrals: 850,
          other: 250,
        },
        weeklyChange: 840,
        weeklyChangePercentage: 7.2,
        eligibleForRewards: true,
        lastUpdated: new Date().toISOString(),
      };
      
      // Mock activity history
      const mockActivityHistory = [
        {
          id: '1',
          type: 'Trading',
          description: 'Swap SOL to USDC',
          points: 120,
          timestamp: '2023-07-07T14:32:15Z',
        },
        {
          id: '2',
          type: 'Liquidity',
          description: 'Added liquidity to SOL-USDC pool',
          points: 350,
          timestamp: '2023-07-06T10:15:42Z',
        },
        {
          id: '3',
          type: 'Referral',
          description: 'User xyz123 joined using your referral',
          points: 200,
          timestamp: '2023-07-05T18:22:30Z',
        },
        {
          id: '4',
          type: 'Trading',
          description: 'Swap BONK to SOL',
          points: 85,
          timestamp: '2023-07-04T09:45:12Z',
        },
        {
          id: '5',
          type: 'Liquidity',
          description: 'Added liquidity to BONK-SOL pool',
          points: 280,
          timestamp: '2023-07-03T16:38:55Z',
        },
      ];
      
      // Mock rewards history
      const mockRewardsHistory = [
        {
          id: '1',
          type: 'Token',
          description: 'Monthly METEOR token rewards',
          amount: '250 METEOR',
          value: '$125.00',
          timestamp: '2023-07-01T00:00:00Z',
          claimed: true,
        },
        {
          id: '2',
          type: 'NFT',
          description: 'Silver Tier NFT Badge',
          amount: '1 NFT',
          value: 'Collectible',
          timestamp: '2023-06-15T00:00:00Z',
          claimed: true,
        },
        {
          id: '3',
          type: 'Token',
          description: 'Trading competition rewards',
          amount: '100 METEOR',
          value: '$50.00',
          timestamp: '2023-06-01T00:00:00Z',
          claimed: true,
        },
        {
          id: '4',
          type: 'Fee Discount',
          description: 'Trading fee discount for August',
          amount: '10% off',
          value: 'Variable',
          timestamp: '2023-08-01T00:00:00Z',
          claimed: false,
        },
      ];
      
      setPointsData(mockPointsData);
      setActivityHistory(mockActivityHistory);
      setRewardsHistory(mockRewardsHistory);
      setLoading(false);
      setRefreshing(false);
    } catch (error) {
      console.error('Error fetching Meteora points data:', error);
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  const onRefresh = () => {
    setRefreshing(true);
    fetchPointsData();
  };
  
  const openMeteoraPointsDashboard = () => {
    Linking.openURL('https://app.meteora.ag/points');
  };
  
  const getPointsBreakdownData = () => {
    if (!pointsData) return [];
    
    const { pointsBreakdown } = pointsData;
    return [
      { x: 'Trading', y: pointsBreakdown.trading, color: theme.colors.primary },
      { x: 'Liquidity', y: pointsBreakdown.liquidity, color: theme.colors.secondary },
      { x: 'Referrals', y: pointsBreakdown.referrals, color: theme.colors.accent },
      { x: 'Other', y: pointsBreakdown.other, color: '#777777' },
    ];
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  if (loading && !refreshing) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <StatusBar style="light" />
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading Meteora points data...</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction color="#FFFFFF" onPress={() => navigation.goBack()} />
        <Appbar.Content title="Meteora Points" titleStyle={styles.headerTitle} />
        <Appbar.Action 
          icon="open-in-new" 
          color="#FFFFFF" 
          onPress={openMeteoraPointsDashboard} 
        />
      </Appbar.Header>
      
      {!connected ? (
        <View style={styles.connectWalletContainer}>
          <Image 
            source={require('../../assets/meteora-logo.png')} 
            style={styles.meteoraLogo}
            resizeMode="contain"
          />
          <Text style={styles.connectWalletTitle}>Meteora Points</Text>
          <Text style={styles.connectWalletText}>
            Connect your wallet to view your Meteora points, rank, and rewards
          </Text>
          <Button 
            mode="contained" 
            style={[styles.connectButton, { backgroundColor: theme.colors.primary }]}
            labelStyle={{ color: '#000000' }}
            onPress={() => navigation.navigate('ConnectWallet')}
          >
            Connect Wallet
          </Button>
        </View>
      ) : !pointsData ? (
        <View style={styles.noPointsContainer}>
          <Image 
            source={require('../../assets/meteora-logo.png')} 
            style={styles.meteoraLogo}
            resizeMode="contain"
          />
          <Text style={styles.noPointsTitle}>No Points Yet</Text>
          <Text style={styles.noPointsText}>
            Start trading or providing liquidity on Meteora to earn points and rewards
          </Text>
          <Button 
            mode="contained" 
            style={[styles.exploreButton, { backgroundColor: theme.colors.primary }]}
            labelStyle={{ color: '#000000' }}
            onPress={() => navigation.navigate('Pools')}
          >
            Explore Pools
          </Button>
        </View>
      ) : (
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh} 
              tintColor={theme.colors.primary}
            />
          }
        >
          {/* Points Summary Card */}
          <Card style={styles.summaryCard}>
            <Card.Content>
              <View style={styles.pointsHeader}>
                <View>
                  <Text style={styles.pointsLabel}>Total Points</Text>
                  <Text style={styles.pointsValue}>{formatNumber(pointsData.totalPoints, 0)}</Text>
                  <View style={styles.pointsChangeContainer}>
                    <MaterialCommunityIcons 
                      name={pointsData.weeklyChange >= 0 ? "arrow-up" : "arrow-down"} 
                      size={16} 
                      color={pointsData.weeklyChange >= 0 ? theme.colors.primary : theme.colors.error} 
                    />
                    <Text style={[
                      styles.pointsChangeText,
                      { color: pointsData.weeklyChange >= 0 ? theme.colors.primary : theme.colors.error }
                    ]}>
                      {pointsData.weeklyChange >= 0 ? '+' : ''}{formatNumber(pointsData.weeklyChange, 0)} ({formatPercentage(pointsData.weeklyChangePercentage)}) this week
                    </Text>
                  </View>
                </View>
                <View style={[
                  styles.rankBadge,
                  { backgroundColor: getRankColor(pointsData.rank, theme) }
                ]}>
                  <Text style={styles.rankText}>{pointsData.rank}</Text>
                  <Text style={styles.percentileText}>Top {100 - pointsData.percentile}%</Text>
                </View>
              </View>
              
              <View style={styles.nextRankContainer}>
                <View style={styles.nextRankHeader}>
                  <Text style={styles.nextRankLabel}>Next Rank: {pointsData.nextRank}</Text>
                  <Text style={styles.nextRankPoints}>
                    {formatNumber(pointsData.pointsToNextRank, 0)} points needed
                  </Text>
                </View>
                <ProgressBar 
                  progress={(pointsData.totalPoints) / (pointsData.totalPoints + pointsData.pointsToNextRank)} 
                  color={getRankColor(pointsData.nextRank, theme)}
                  style={styles.progressBar}
                />
              </View>
              
              <Text style={styles.lastUpdatedText}>
                Last updated: {formatDate(pointsData.lastUpdated)}
              </Text>
            </Card.Content>
          </Card>
          
          {/* Points Breakdown Card */}
          <Card style={styles.breakdownCard}>
            <Card.Content>
              <Text style={styles.sectionTitle}>Points Breakdown</Text>
              
              <View style={styles.chartContainer}>
                <VictoryPie
                  data={getPointsBreakdownData()}
                  width={250}
                  height={250}
                  colorScale={getPointsBreakdownData().map(d => d.color)}
                  innerRadius={70}
                  labelRadius={({ innerRadius }) => innerRadius + 30}
                  style={{
                    labels: {
                      fill: "white",
                      fontSize: 14,
                      fontWeight: "bold"
                    }
                  }}
                  labelComponent={<VictoryLabel style={{ fill: 'white' }} />}
                />
                <View style={styles.chartCenterContainer}>
                  <Text style={styles.chartCenterValue}>{formatNumber(pointsData.totalPoints, 0)}</Text>
                  <Text style={styles.chartCenterLabel}>Total Points</Text>
                </View>
              </View>
              
              <View style={styles.breakdownLegend}>
                {Object.entries(pointsData.pointsBreakdown).map(([key, value]) => (
                  <View key={key} style={styles.legendItem}>
                    <View style={[
                      styles.legendColor,
                      { backgroundColor: getLegendColor(key, theme) }
                    ]} />
                    <View style={styles.legendTextContainer}>
                      <Text style={styles.legendLabel}>{key.charAt(0).toUpperCase() + key.slice(1)}</Text>
                      <Text style={styles.legendValue}>{formatNumber(value, 0)} pts</Text>
                    </View>
                  </View>
                ))}
              </View>
            </Card.Content>
          </Card>
          
          {/* Recent Activity Card */}
          <Card style={styles.activityCard}>
            <Card.Content>
              <Text style={styles.sectionTitle}>Recent Activity</Text>
              
              {activityHistory.map((activity, index) => (
                <React.Fragment key={activity.id}>
                  <View style={styles.activityItem}>
                    <View style={styles.activityIconContainer}>
                      <MaterialCommunityIcons 
                        name={getActivityIcon(activity.type)} 
                        size={24} 
                        color={getActivityColor(activity.type, theme)} 
                      />
                    </View>
                    <View style={styles.activityContent}>
                      <Text style={styles.activityDescription}>{activity.description}</Text>
                      <Text style={styles.activityTimestamp}>{formatDate(activity.timestamp)}</Text>
                    </View>
                    <View style={styles.activityPoints}>
                      <Text style={[
                        styles.activityPointsText,
                        { color: theme.colors.primary }
                      ]}>
                        +{activity.points} pts
                      </Text>
                    </View>
                  </View>
                  {index < activityHistory.length - 1 && <Divider style={styles.divider} />}
                </React.Fragment>
              ))}
              
              <Button 
                mode="text" 
                onPress={openMeteoraPointsDashboard}
                style={styles.viewAllButton}
              >
                View All Activity
              </Button>
            </Card.Content>
          </Card>
          
          {/* Rewards Card */}
          <Card style={styles.rewardsCard}>
            <Card.Content>
              <Text style={styles.sectionTitle}>Rewards History</Text>
              
              {rewardsHistory.map((reward, index) => (
                <React.Fragment key={reward.id}>
                  <View style={styles.rewardItem}>
                    <View style={styles.rewardIconContainer}>
                      <MaterialCommunityIcons 
                        name={getRewardIcon(reward.type)} 
                        size={24} 
                        color={getRewardColor(reward.type, theme)} 
                      />
                    </View>
                    <View style={styles.rewardContent}>
                      <Text style={styles.rewardDescription}>{reward.description}</Text>
                      <Text style={styles.rewardAmount}>{reward.amount}</Text>
                      <Text style={styles.rewardTimestamp}>{formatDate(reward.timestamp)}</Text>
                    </View>
                    <View style={styles.rewardStatus}>
                      {reward.claimed ? (
                        <Chip 
                          style={[styles.claimedChip, { backgroundColor: 'rgba(0, 255, 159, 0.2)' }]}
                          textStyle={{ color: '#00FF9F', fontSize: 12 }}
                        >
                          Claimed
                        </Chip>
                      ) : (
                        <Button 
                          mode="contained" 
                          style={[styles.claimButton, { backgroundColor: theme.colors.primary }]}
                          labelStyle={{ color: '#000000', fontSize: 12 }}
                          onPress={() => {}}
                        >
                          Claim
                        </Button>
                      )}
                    </View>
                  </View>
                  {index < rewardsHistory.length - 1 && <Divider style={styles.divider} />}
                </React.Fragment>
              ))}
              
              <Button 
                mode="text" 
                onPress={openMeteoraPointsDashboard}
                style={styles.viewAllButton}
              >
                View All Rewards
              </Button>
            </Card.Content>
          </Card>
          
          {/* Learn More Card */}
          <Card style={styles.learnMoreCard}>
            <Card.Content>
              <Text style={styles.sectionTitle}>Learn More</Text>
              <Text style={styles.learnMoreText}>
                Meteora Points are earned by trading, providing liquidity, and participating in the Meteora ecosystem. Points can be redeemed for rewards, fee discounts, and exclusive access to new features.
              </Text>
              <Button 
                mode="contained" 
                style={[styles.learnMoreButton, { backgroundColor: theme.colors.primary }]}
                labelStyle={{ color: '#000000' }}
                onPress={() => Linking.openURL('https://docs.meteora.ag/meteora-points')}
              >
                Read Documentation
              </Button>
            </Card.Content>
          </Card>
        </ScrollView>
      )}
    </View>
  );
};

// Helper functions
const getRankColor = (rank, theme) => {
  switch (rank.toLowerCase()) {
    case 'bronze':
      return '#CD7F32';
    case 'silver':
      return '#C0C0C0';
    case 'gold':
      return '#FFD700';
    case 'platinum':
      return '#E5E4E2';
    case 'diamond':
      return theme.colors.accent;
    default:
      return theme.colors.primary;
  }
};

const getLegendColor = (key, theme) => {
  switch (key.toLowerCase()) {
    case 'trading':
      return theme.colors.primary;
    case 'liquidity':
      return theme.colors.secondary;
    case 'referrals':
      return theme.colors.accent;
    default:
      return '#777777';
  }
};

const getActivityIcon = (type) => {
  switch (type.toLowerCase()) {
    case 'trading':
      return 'swap-horizontal';
    case 'liquidity':
      return 'water';
    case 'referral':
      return 'account-multiple';
    default:
      return 'star';
  }
};

const getActivityColor = (type, theme) => {
  switch (type.toLowerCase()) {
    case 'trading':
      return theme.colors.primary;
    case 'liquidity':
      return theme.colors.secondary;
    case 'referral':
      return theme.colors.accent;
    default:
      return '#777777';
  }
};

const getRewardIcon = (type) => {
  switch (type.toLowerCase()) {
    case 'token':
      return 'currency-usd';
    case 'nft':
      return 'image';
    case 'fee discount':
      return 'percent';
    default:
      return 'gift';
  }
};

const getRewardColor = (type, theme) => {
  switch (type.toLowerCase()) {
    case 'token':
      return theme.colors.primary;
    case 'nft':
      return theme.colors.secondary;
    case 'fee discount':
      return theme.colors.accent;
    default:
      return '#777777';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 10,
  },
  header: {
    backgroundColor: '#1A1A1A',
    elevation: 0,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  connectWalletContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  meteoraLogo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  connectWalletTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  connectWalletText: {
    color: '#AAAAAA',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  connectButton: {
    paddingHorizontal: 24,
  },
  noPointsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noPointsTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  noPointsText: {
    color: '#AAAAAA',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  exploreButton: {
    paddingHorizontal: 24,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 30,
  },
  summaryCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    marginBottom: 16,
  },
  pointsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  pointsLabel: {
    color: '#AAAAAA',
    fontSize: 14,
  },
  pointsValue: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
  },
  pointsChangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  pointsChangeText: {
    fontSize: 14,
    marginLeft: 4,
  },
  rankBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
  },
  rankText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  percentileText: {
    color: '#000000',
    fontSize: 12,
  },
  nextRankContainer: {
    marginBottom: 16,
  },
  nextRankHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  nextRankLabel: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  nextRankPoints: {
    color: '#AAAAAA',
    fontSize: 14,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  lastUpdatedText: {
    color: '#777777',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'right',
  },
  breakdownCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 16,
  },
  chartCenterContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartCenterValue: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  chartCenterLabel: {
    color: '#AAAAAA',
    fontSize: 12,
  },
  breakdownLegend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    marginBottom: 12,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  legendTextContainer: {
    flex: 1,
  },
  legendLabel: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  legendValue: {
    color: '#AAAAAA',
    fontSize: 12,
  },
  activityCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    marginBottom: 16,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  activityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2C2C2C',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityDescription: {
    color: '#FFFFFF',
    fontSize: 14,
    marginBottom: 4,
  },
  activityTimestamp: {
    color: '#777777',
    fontSize: 12,
  },
  activityPoints: {
    marginLeft: 8,
  },
  activityPointsText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  divider: {
    backgroundColor: '#2C2C2C',
  },
  viewAllButton: {
    marginTop: 12,
  },
  rewardsCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    marginBottom: 16,
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  rewardIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2C2C2C',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rewardContent: {
    flex: 1,
  },
  rewardDescription: {
    color: '#FFFFFF',
    fontSize: 14,
    marginBottom: 2,
  },
  rewardAmount: {
    color: '#AAAAAA',
    fontSize: 12,
    marginBottom: 2,
  },
  rewardTimestamp: {
    color: '#777777',
    fontSize: 12,
  },
  rewardStatus: {
    marginLeft: 8,
  },
  claimedChip: {
    height: 24,
  },
  claimButton: {
    height: 30,
    justifyContent: 'center',
  },
  learnMoreCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    marginBottom: 16,
  },
  learnMoreText: {
    color: '#AAAAAA',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  learnMoreButton: {
    alignSelf: 'flex-start',
  },
});

export default MeteoraPointsScreen;