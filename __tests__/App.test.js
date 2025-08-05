import React from 'react';
import { render } from '@testing-library/react-native';
import App from '../App';

// Mock the native modules
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

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
}));

// Mock React Native Reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock Material Community Icons
jest.mock('@expo/vector-icons/MaterialCommunityIcons', () => 'Icon');

// Mock our custom hooks
jest.mock('../src/hooks/useWallet', () => ({
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

jest.mock('../src/hooks/useMeteora', () => ({
  useMeteora: () => ({
    pools: [],
    loading: false,
    error: null,
    fetchPools: jest.fn(),
    createPool: jest.fn(),
    joinPool: jest.fn(),
  }),
}));

jest.mock('../src/hooks/useLending', () => ({
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

describe('App Component', () => {
  it('renders without crashing', () => {
    const { getByText } = render(<App />);
    expect(getByText).toBeDefined();
  });

  it('shows app branding', () => {
    const { getByText } = render(<App />);
    expect(getByText('Incrypt')).toBeTruthy();
  });
}); 