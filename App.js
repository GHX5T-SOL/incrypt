import React from 'react';
import { View, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  return (
    <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ color: '#fff', fontSize: 24, marginBottom: 20 }}>
        Incrypt - Minimal Version
      </Text>
      <Text style={{ color: '#fff', fontSize: 16 }}>
        App is working!
      </Text>
      <StatusBar style="light" />
    </View>
  );
}