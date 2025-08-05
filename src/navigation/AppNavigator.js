import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';

// Screens
import DashboardScreen from '../screens/DashboardScreen';
import PoolsScreen from '../screens/PoolsScreen';
import PositionsScreen from '../screens/PositionsScreen';
import LendingScreen from '../screens/LendingScreen';
import SettingsScreen from '../screens/SettingsScreen';
import PoolDetailScreen from '../screens/PoolDetailScreen';
import CreatePoolScreen from '../screens/CreatePoolScreen';
import JoinPoolScreen from '../screens/JoinPoolScreen';
import LendingDetailScreen from '../screens/LendingDetailScreen';
import WalletScreen from '../screens/WalletScreen';

// Auth Screens
import ConnectWalletScreen from '../screens/ConnectWalletScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Stack navigators for each tab
const DashboardStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="DashboardMain" component={DashboardScreen} />
    <Stack.Screen name="WalletDetails" component={WalletScreen} />
  </Stack.Navigator>
);

const PoolsStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="PoolsList" component={PoolsScreen} />
    <Stack.Screen name="PoolDetail" component={PoolDetailScreen} />
    <Stack.Screen name="CreatePool" component={CreatePoolScreen} />
    <Stack.Screen name="JoinPool" component={JoinPoolScreen} />
  </Stack.Navigator>
);

const PositionsStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="PositionsList" component={PositionsScreen} />
    <Stack.Screen name="PoolDetail" component={PoolDetailScreen} />
  </Stack.Navigator>
);

const LendingStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="LendingMain" component={LendingScreen} />
    <Stack.Screen name="LendingDetail" component={LendingDetailScreen} />
  </Stack.Navigator>
);

// Main tab navigator
const TabNavigator = () => {
  const theme = useTheme();
  
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.background,
          borderTopColor: theme.colors.outline,
          height: 60,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.disabled,
      }}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardStack} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="view-dashboard" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Pools" 
        component={PoolsStack} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="chart-bubble" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Positions" 
        component={PositionsStack} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="wallet" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Lending" 
        component={LendingStack} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="bank" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cog" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// Root navigator
const AppNavigator = () => {
  const { connected } = { connected: false }; // Replace with useWallet() when implemented
  
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ConnectWallet" component={ConnectWalletScreen} />
      <Stack.Screen name="Main" component={TabNavigator} />
    </Stack.Navigator>
  );
};

export default AppNavigator;