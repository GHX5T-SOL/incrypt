import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { theme } from '../theme';

const ChatBubble = ({ message, isUser }) => {
  const bubbleStyle = isUser ? styles.userBubble : styles.aiBubble;
  const textStyle = isUser ? styles.userText : styles.aiText;
  const containerStyle = isUser ? styles.userContainer : styles.aiContainer;

  return (
    <View style={containerStyle}>
      <View style={[styles.bubble, bubbleStyle]}>
        <Markdown
          style={{
            body: textStyle,
            strong: { ...textStyle, fontWeight: 'bold' },
            em: { ...textStyle, fontStyle: 'italic' },
            code_block: {
              ...textStyle,
              backgroundColor: theme.colors.surface,
              padding: 8,
              borderRadius: 4,
              fontFamily: 'monospace',
            },
            code_inline: {
              ...textStyle,
              backgroundColor: theme.colors.surface,
              padding: 2,
              borderRadius: 2,
              fontFamily: 'monospace',
            },
            bullet_list: textStyle,
            ordered_list: textStyle,
            list_item: textStyle,
            blockquote: {
              ...textStyle,
              borderLeftWidth: 3,
              borderLeftColor: theme.colors.primary,
              paddingLeft: 8,
              marginLeft: 8,
            },
          }}
        >
          {message.text}
        </Markdown>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
  },
  userContainer: {
    alignItems: 'flex-end',
    marginLeft: 40,
    marginRight: 8,
  },
  aiContainer: {
    alignItems: 'flex-start',
    marginRight: 40,
    marginLeft: 8,
  },
  bubble: {
    padding: 12,
    borderRadius: 16,
    maxWidth: '100%',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  userBubble: {
    backgroundColor: theme.colors.secondary,
    borderWidth: 1,
    borderColor: theme.colors.secondary,
  },
  aiBubble: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  userText: {
    color: theme.colors.background,
    fontSize: 14,
    lineHeight: 20,
  },
  aiText: {
    color: theme.colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
});

export default ChatBubble; 