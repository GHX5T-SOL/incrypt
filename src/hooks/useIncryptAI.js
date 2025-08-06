import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import OpenAI from 'openai';

const CHAT_HISTORY_KEY = 'incrypt_ai_chat_history';
const MAX_HISTORY_LENGTH = 50;

export const useIncryptAI = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initialize OpenAI client
  const openai = new OpenAI({
    apiKey: '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',
    dangerouslyAllowBrowser: true, // For React Native
  });

  // Load chat history from AsyncStorage
  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        const savedHistory = await AsyncStorage.getItem(CHAT_HISTORY_KEY);
        if (savedHistory) {
          setMessages(JSON.parse(savedHistory));
        } else {
          // Initialize with welcome message
          const welcomeMessage = {
            id: 'welcome',
            role: 'ai',
            text: `🎯 **Welcome to IncryptAI**\n\nI'm your cyberpunk Solana DeFi companion. I can help you with:\n\n• **Yield Strategies** - Optimize your LP positions on Meteora\n• **Risk Analysis** - Check token safety via Rugcheck/DexScreener\n• **Custom Builds** - Create leveraged farming strategies\n• **Market Insights** - Real-time DeFi data and trends\n\n*Ask me anything about Solana DeFi!*`,
            timestamp: new Date().toISOString(),
          };
          setMessages([welcomeMessage]);
        }
      } catch (error) {
        console.error('Error loading chat history:', error);
        setError('Failed to load chat history');
      }
    };

    loadChatHistory();
  }, []);

  // Save chat history to AsyncStorage
  const saveChatHistory = useCallback(async (newMessages) => {
    try {
      await AsyncStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(newMessages));
    } catch (error) {
      console.error('Error saving chat history:', error);
    }
  }, []);

  // System prompt for AI
  const systemPrompt = `You are IncryptAI, a cyberpunk Solana DeFi expert and AI companion. Your role is to help users navigate the complex world of Solana DeFi with style and precision.

**Your Capabilities:**
- **Yield Optimization**: Guide users through Meteora DLMM/DAMM strategies, APR calculations, and risk management
- **Leveraged Farming**: Help design strategies combining Kamino lending with Meteora liquidity provision
- **Token Safety**: Analyze tokens using Rugcheck and DexScreener data for risk assessment
- **Market Analysis**: Provide real-time insights on Solana DeFi trends and opportunities
- **Strategy Building**: Create step-by-step guides for complex DeFi operations

**Response Style:**
- Use cyberpunk terminology and aesthetic ("Initiate yield protocol...", "Deploy liquidity matrix...")
- Keep responses concise but informative
- Use markdown formatting for better readability
- Include actionable steps when possible
- Always emphasize security and risk management
- Reference specific protocols (Meteora, Kamino, MarginFi) when relevant

**Important Guidelines:**
- Never provide financial advice - always include disclaimers
- Emphasize DYOR (Do Your Own Research)
- Suggest checking multiple sources for verification
- Include risk warnings for complex strategies
- Keep the cyberpunk theme consistent

**Example Response Format:**
\`\`\`
🎯 **Strategy Analysis Complete**

**Protocol**: Meteora DLMM
**Risk Level**: Medium
**Estimated APR**: 15-25%

**Deployment Steps:**
1. Navigate to pool selection
2. Configure price range
3. Deploy liquidity
4. Monitor position

⚠️ **Risk Warning**: Past performance doesn't guarantee future returns.
\`\`\`

Remember: You're helping users navigate the neon-lit world of Solana DeFi with style and substance.`;

  // Send message to AI
  const sendMessage = useCallback(async (userMessage) => {
    if (!userMessage.trim()) return;

    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      text: userMessage,
      timestamp: new Date().toISOString(),
    };

    // Add user message to chat
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setLoading(true);
    setError(null);

    try {
      // Prepare conversation history for AI
      const conversationHistory = updatedMessages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.text,
      }));

      // Call OpenAI API
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          ...conversationHistory,
        ],
        max_tokens: 500,
        temperature: 0.7,
      });

      const aiResponse = completion.choices[0]?.message?.content || 'Sorry, I encountered an error. Please try again.';

      const aiMsg = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        text: aiResponse,
        timestamp: new Date().toISOString(),
      };

      const finalMessages = [...updatedMessages, aiMsg];
      
      // Limit history length
      if (finalMessages.length > MAX_HISTORY_LENGTH) {
        finalMessages.splice(1, finalMessages.length - MAX_HISTORY_LENGTH);
      }

      setMessages(finalMessages);
      await saveChatHistory(finalMessages);

    } catch (error) {
      console.error('Error calling AI API:', error);
      setError('AI node offline - retrying...');
      
      // Add error message to chat
      const errorMsg = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        text: '⚠️ **Connection Error**\n\nI\'m experiencing technical difficulties. Please try again in a moment.\n\n*Error: AI service temporarily unavailable*',
        timestamp: new Date().toISOString(),
      };
      
      const finalMessages = [...updatedMessages, errorMsg];
      setMessages(finalMessages);
      await saveChatHistory(finalMessages);
    } finally {
      setLoading(false);
    }
  }, [messages, saveChatHistory]);

  // Clear chat history
  const clearChat = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(CHAT_HISTORY_KEY);
      const welcomeMessage = {
        id: 'welcome',
        role: 'ai',
        text: `🎯 **Welcome to IncryptAI**\n\nI'm your cyberpunk Solana DeFi companion. I can help you with:\n\n• **Yield Strategies** - Optimize your LP positions on Meteora\n• **Risk Analysis** - Check token safety via Rugcheck/DexScreener\n• **Custom Builds** - Create leveraged farming strategies\n• **Market Insights** - Real-time DeFi data and trends\n\n*Ask me anything about Solana DeFi!*`,
        timestamp: new Date().toISOString(),
      };
      setMessages([welcomeMessage]);
      setError(null);
    } catch (error) {
      console.error('Error clearing chat:', error);
    }
  }, []);

  return {
    messages,
    loading,
    error,
    sendMessage,
    clearChat,
  };
}; 