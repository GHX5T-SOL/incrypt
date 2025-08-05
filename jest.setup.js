import '@testing-library/jest-dom';

// Mock React Native modules
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');
jest.mock('react-native/Libraries/Components/TextInput/TextInput', () => 'TextInput');
jest.mock('react-native/Libraries/Components/View/View', () => 'View');
jest.mock('react-native/Libraries/Components/Text/Text', () => 'Text');
jest.mock('react-native/Libraries/Components/TouchableOpacity/TouchableOpacity', () => 'TouchableOpacity');
jest.mock('react-native/Libraries/Components/ScrollView/ScrollView', () => 'ScrollView');
jest.mock('react-native/Libraries/Components/FlatList/FlatList', () => 'FlatList');
jest.mock('react-native/Libraries/Components/Switch/Switch', () => 'Switch');
jest.mock('react-native/Libraries/Components/StatusBar/StatusBar', () => 'StatusBar');

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock Expo modules
jest.mock('expo', () => ({
  ...jest.requireActual('expo'),
  Linking: {
    makeUrl: jest.fn(),
    canOpenURL: jest.fn(),
    openURL: jest.fn(),
  },
  StatusBar: {
    setStatusBarStyle: jest.fn(),
  },
}));

// Mock Solana Mobile Stack
jest.mock('@solana-mobile/mobile-wallet-adapter-react-native', () => ({
  MobileWalletAdapterProvider: ({ children }) => children,
  useMobileWalletAdapter: () => ({
    connected: false,
    connecting: false,
    disconnecting: false,
    select: jest.fn(),
    disconnect: jest.fn(),
  }),
}));

// Mock React Native Reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock Material Community Icons
jest.mock('@expo/vector-icons/MaterialCommunityIcons', () => 'Icon');

// Mock React Native Paper
jest.mock('react-native-paper', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  
  return {
    Provider: ({ children }) => children,
    useTheme: () => ({
      colors: {
        primary: '#00FF9F',
        secondary: '#FF00FF',
        background: '#000000',
        surface: '#1A1A1A',
        text: '#FFFFFF',
        textSecondary: '#CCCCCC',
        success: '#00FF00',
        warning: '#FFAA00',
        error: '#FF0000',
        outline: '#333333',
        surfaceVariant: '#2A2A2A',
        disabled: '#666666',
        accent: '#00FFFF',
      },
      dark: true,
    }),
    Button: ({ onPress, children, ...props }) => (
      <View onTouchEnd={onPress} {...props}>
        <Text>{children}</Text>
      </View>
    ),
    Card: ({ children, ...props }) => (
      <View {...props}>
        <Text>{children}</Text>
      </View>
    ),
    TextInput: ({ value, onChangeText, ...props }) => (
      <View>
        <Text>{value}</Text>
      </View>
    ),
    Switch: ({ value, onValueChange, ...props }) => (
      <View onTouchEnd={() => onValueChange(!value)} {...props}>
        <Text>{value ? 'ON' : 'OFF'}</Text>
      </View>
    ),
  };
});

// Mock our custom hooks
jest.mock('./src/hooks/useWallet', () => ({
  useWallet: () => ({
    connected: false,
    connecting: false,
    wallet: null,
    balance: 0,
    connect: jest.fn(),
    disconnect: jest.fn(),
    getWalletAddress: jest.fn(() => ''),
    getShortAddress: jest.fn(() => ''),
  }),
}));

jest.mock('./src/hooks/useMeteora', () => ({
  useMeteora: () => ({
    pools: [],
    loading: false,
    error: null,
    fetchPools: jest.fn(),
    createPool: jest.fn(),
    joinPool: jest.fn(),
  }),
}));

jest.mock('./src/hooks/useLending', () => ({
  useLending: () => ({
    lendingMarkets: [],
    userPositions: [],
    loading: false,
    error: null,
    fetchLendingData: jest.fn(),
    supplyAsset: jest.fn(),
    borrowAsset: jest.fn(),
    withdrawAsset: jest.fn(),
    repayAsset: jest.fn(),
    getHealthFactor: jest.fn(),
    getNetAPY: jest.fn(),
  }),
}));

// Mock navigation
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    push: jest.fn(),
    pop: jest.fn(),
  }),
  useRoute: () => ({
    params: {},
  }),
}));

// Mock Alert
jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn(),
}));

// Global test setup
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock timers
jest.useFakeTimers();

// Setup test environment
beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  jest.clearAllTimers();
}); 