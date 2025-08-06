import React, { useContext } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';
import { WalletContext } from '../contexts/WalletProvider';
import { useWallet } from '../hooks/useWallet';
import Header from '../components/Header';

// Main Screens
import DashboardScreen from '../screens/DashboardScreen';
import PoolsScreen from '../screens/PoolsScreen';
import PositionsScreen from '../screens/PositionsScreen';
import LendingScreen from '../screens/LendingScreen';
import SettingsScreen from '../screens/SettingsScreen';

// Pool Screens
import PoolDetailScreen from '../screens/PoolDetailScreen';
import CreatePoolScreen from '../screens/CreatePoolScreen';
import JoinPoolScreen from '../screens/JoinPoolScreen';

// Lending Screens
import LendingDetailScreen from '../screens/LendingDetailScreen';
import SupplyScreen from '../screens/SupplyScreen';
import BorrowScreen from '../screens/BorrowScreen';
import WithdrawScreen from '../screens/WithdrawScreen';
import RepayScreen from '../screens/RepayScreen';
import TokenSafetyScreen from '../screens/TokenSafetyScreen';
import LendingStrategiesScreen from '../screens/LendingStrategiesScreen';

// Settings Screens
import SecuritySettingsScreen from '../screens/SecuritySettingsScreen';
import TransactionHistoryScreen from '../screens/TransactionHistoryScreen';
import WalletScreen from '../screens/WalletScreen';

// Auth Screens
import ConnectWalletScreen from '../screens/ConnectWalletScreen';
import OnboardingScreen from '../screens/OnboardingScreen';

// Meteora Screens
import MeteoraPointsScreen from '../screens/MeteoraPointsScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Stack navigators for each tab
const DashboardStack = () => (
  <Stack.Navigator 
    screenOptions={{ 
      header: ({ route }) => (
        <Header title="Dashboard" />
      ),
    }}
  >
    <Stack.Screen name="DashboardMain" component={DashboardScreen} />
    <Stack.Screen name="WalletDetails" component={WalletScreen} />
    <Stack.Screen name="TransactionHistory" component={TransactionHistoryScreen} />
  </Stack.Navigator>
);

const PoolsStack = () => (
  <Stack.Navigator 
    screenOptions={{ 
      header: ({ route }) => (
        <Header title="Liquidity Pools" />
      ),
    }}
  >
    <Stack.Screen name="PoolsList" component={PoolsScreen} />
    <Stack.Screen name="PoolDetail" component={PoolDetailScreen} />
    <Stack.Screen name="CreatePool" component={CreatePoolScreen} />
    <Stack.Screen name="JoinPool" component={JoinPoolScreen} />
    <Stack.Screen name="MeteoraPoints" component={MeteoraPointsScreen} />
  </Stack.Navigator>
);

const PositionsStack = () => (
  <Stack.Navigator 
    screenOptions={{ 
      header: ({ route }) => (
        <Header title="My Positions" />
      ),
    }}
  >
    <Stack.Screen name="PositionsList" component={PositionsScreen} />
    <Stack.Screen name="PoolDetail" component={PoolDetailScreen} />
    <Stack.Screen name="TransactionHistory" component={TransactionHistoryScreen} />
  </Stack.Navigator>
);

const LendingStack = () => (
  <Stack.Navigator 
    screenOptions={{ 
      header: ({ route }) => (
        <Header title="DeFi Lending" />
      ),
    }}
  >
    <Stack.Screen name="LendingMain" component={LendingScreen} />
    <Stack.Screen name="LendingDetail" component={LendingDetailScreen} />
    <Stack.Screen name="Supply" component={SupplyScreen} />
    <Stack.Screen name="Borrow" component={BorrowScreen} />
    <Stack.Screen name="Withdraw" component={WithdrawScreen} />
            <Stack.Screen name="Repay" component={RepayScreen} />
        <Stack.Screen name="TokenSafety" component={TokenSafetyScreen} />
        <Stack.Screen name="LendingStrategies" component={LendingStrategiesScreen} />
  </Stack.Navigator>
);

const SettingsStack = () => (
  <Stack.Navigator 
    screenOptions={{ 
      header: ({ route }) => (
        <Header title="Settings" />
      ),
    }}
  >
    <Stack.Screen name="SettingsMain" component={SettingsScreen} />
    <Stack.Screen name="SecuritySettings" component={SecuritySettingsScreen} />
    <Stack.Screen name="TransactionHistory" component={TransactionHistoryScreen} />
    <Stack.Screen name="WalletDetails" component={WalletScreen} />
  </Stack.Navigator>
);

// Main tab navigator
const TabNavigator = () => {
  const theme = useTheme();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'view-dashboard' : 'view-dashboard-outline';
          } else if (route.name === 'Pools') {
            iconName = focused ? 'water' : 'water-outline';
          } else if (route.name === 'Positions') {
            iconName = focused ? 'chart-line' : 'chart-line';
          } else if (route.name === 'Lending') {
            iconName = focused ? 'bank' : 'bank-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'cog' : 'cog-outline';
          }

          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.outline,
          borderTopWidth: 1,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardStack}
        options={{ tabBarLabel: 'Dashboard' }}
      />
      <Tab.Screen 
        name="Pools" 
        component={PoolsStack}
        options={{ tabBarLabel: 'Pools' }}
      />
      <Tab.Screen 
        name="Positions" 
        component={PositionsStack}
        options={{ tabBarLabel: 'Positions' }}
      />
      <Tab.Screen 
        name="Lending" 
        component={LendingStack}
        options={{ tabBarLabel: 'Lending' }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsStack}
        options={{ tabBarLabel: 'Settings' }}
      />
    </Tab.Navigator>
  );
};

// Root navigator
const AppNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="ConnectWallet" component={ConnectWalletScreen} />
      <Stack.Screen name="MainApp" component={TabNavigator} />
    </Stack.Navigator>
  );
};

export default AppNavigator;