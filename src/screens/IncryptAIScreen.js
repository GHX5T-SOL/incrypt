import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Animated,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useIncryptAI } from '../hooks/useIncryptAI';
import ChatBubble from '../components/ChatBubble';
import NeonInput from '../components/NeonInput';
import NeonCard from '../components/NeonCard';
import { theme } from '../theme';

const IncryptAIScreen = () => {
  const { messages, loading, error, sendMessage, clearChat } = useIncryptAI();
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef(null);
  const [showExamples, setShowExamples] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim()) return;
    
    const message = inputText.trim();
    setInputText('');
    await sendMessage(message);
  };

  const handleClearChat = () => {
    Alert.alert(
      'Clear Chat History',
      'Are you sure you want to clear all chat messages?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: clearChat },
      ]
    );
  };

  const exampleQueries = [
    {
      title: 'Yield Strategy',
      query: 'What\'s the best yield strategy for SOL-USDC on Meteora DLMM?',
      icon: 'chart-line',
    },
    {
      title: 'Token Safety',
      query: 'Is this token safe? [Paste address]',
      icon: 'shield-check',
    },
    {
      title: 'Leveraged Farming',
      query: 'Help me create a leveraged farming strategy with Kamino lending',
      icon: 'bank',
    },
    {
      title: 'Market Analysis',
      query: 'What are the current trends in Solana DeFi?',
      icon: 'trending-up',
    },
  ];

  const renderMessage = ({ item }) => (
    <ChatBubble message={item} isUser={item.role === 'user'} />
  );

  const renderExampleQuery = ({ item }) => (
    <TouchableOpacity
      style={styles.exampleCard}
      onPress={() => {
        setInputText(item.query);
        setShowExamples(false);
      }}
      activeOpacity={0.7}
    >
      <MaterialCommunityIcons
        name={item.icon}
        size={20}
        color={theme.colors.primary}
      />
      <Text style={styles.exampleTitle}>{item.title}</Text>
      <Text style={styles.exampleQuery}>{item.query}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
          <View style={styles.headerContent}>
            <View style={styles.titleContainer}>
              <MaterialCommunityIcons
                name="brain"
                size={28}
                color={theme.colors.primary}
              />
              <Text style={styles.title}>IncryptAI</Text>
            </View>
            <TouchableOpacity
              style={styles.clearButton}
              onPress={handleClearChat}
            >
              <MaterialCommunityIcons
                name="delete-sweep"
                size={20}
                color={theme.colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
          
          {/* Info Card */}
          <NeonCard style={styles.infoCard}>
            <Text style={styles.infoTitle}>Your AI DeFi Companion</Text>
            <Text style={styles.infoText}>
              Ask about strategies, build custom yields, analyze risks, and more. 
              Powered by advanced AI for real-time Solana DeFi insights.
            </Text>
          </NeonCard>

          {/* Examples Toggle */}
          <TouchableOpacity
            style={styles.examplesToggle}
            onPress={() => setShowExamples(!showExamples)}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name={showExamples ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={theme.colors.primary}
            />
            <Text style={styles.examplesToggleText}>
              {showExamples ? 'Hide Examples' : 'Show Examples'}
            </Text>
          </TouchableOpacity>

          {/* Examples Section */}
          {showExamples && (
            <Animated.View style={[styles.examplesContainer, { opacity: fadeAnim }]}>
              <FlatList
                data={exampleQueries}
                renderItem={renderExampleQuery}
                keyExtractor={(item, index) => index.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.examplesList}
              />
            </Animated.View>
          )}
        </Animated.View>

        {/* Chat Messages */}
        <View style={styles.chatContainer}>
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messagesList}
            showsVerticalScrollIndicator={false}
          />
          
          {/* Loading Indicator */}
          {loading && (
            <View style={styles.loadingContainer}>
              <MaterialCommunityIcons
                name="loading"
                size={20}
                color={theme.colors.primary}
                style={styles.loadingIcon}
              />
              <Text style={styles.loadingText}>AI is thinking...</Text>
            </View>
          )}
        </View>

        {/* Input */}
        <NeonInput
          value={inputText}
          onChangeText={setInputText}
          onSend={handleSend}
          disabled={loading}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginLeft: 8,
    textShadowColor: theme.colors.primary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  clearButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.outline,
  },
  infoCard: {
    marginBottom: 16,
    padding: 16,
    alignItems: 'center',
    textAlign: 'center',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  infoText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    textAlign: 'center',
  },
  examplesToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    marginBottom: 8,
  },
  examplesToggleText: {
    fontSize: 14,
    color: theme.colors.primary,
    marginLeft: 4,
    fontWeight: '600',
  },
  examplesContainer: {
    marginBottom: 16,
  },
  examplesList: {
    paddingHorizontal: 8,
  },
  exampleCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: theme.colors.outline,
    width: 200,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  exampleTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginTop: 4,
    marginBottom: 4,
  },
  exampleQuery: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    lineHeight: 14,
  },
  chatContainer: {
    flex: 1,
    paddingHorizontal: 8,
  },
  messagesList: {
    paddingVertical: 8,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  loadingIcon: {
    marginRight: 8,
  },
  loadingText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
});

export default IncryptAIScreen; 