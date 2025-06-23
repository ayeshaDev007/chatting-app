import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ListRenderItem,
  StyleSheet,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import Pusher from 'pusher-js';

// Replace with your computer's local IP address
const API_BASE_URL = 'http://192.168.1.168:3000/api';

interface Message {
  id: number;
  username: string;
  message: string;
  timestamp: string;
  isSystem?: boolean;
}

export default function ChatScreen() {
  const { username } = useLocalSearchParams<{ username: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const flatListRef = useRef<FlatList<Message> | null>(null);
  const pusherRef = useRef<Pusher | null>(null);

  useEffect(() => {
    if (!username) return;
    loadMessages();
    initializePusher();
    notifyUserJoined();
    return () => {
      notifyUserLeft();
      if (pusherRef.current) {
        pusherRef.current.disconnect();
      }
    };
  }, [username]);

  const loadMessages = async (): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/messages`);
      const data: Message[] = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Error loading messages:', error);
      Alert.alert('Error', 'Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  };

  const initializePusher = (): void => {
    pusherRef.current = new Pusher('98557c8f31caaa95093c', {
      cluster: 'ap2',
    });
    const channel = pusherRef.current.subscribe('chat-room');
    channel.bind('new-message', (data: Message) => {
      setMessages(prevMessages => [...prevMessages, data]);
    });
    channel.bind('pusher:subscription_succeeded', () => {
      setIsConnected(true);
    });
    channel.bind('pusher:subscription_error', (status: any) => {
      console.error('Pusher subscription error:', status);
      Alert.alert('Connection Error', 'Failed to connect to chat room');
    });
  };

  const notifyUserJoined = async (): Promise<void> => {
    try {
      await fetch(`${API_BASE_URL}/user-joined`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });
    } catch (error) {
      console.error('Error notifying user joined:', error);
    }
  };

  const notifyUserLeft = async (): Promise<void> => {
    try {
      await fetch(`${API_BASE_URL}/user-left`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });
    } catch (error) {
      console.error('Error notifying user left:', error);
    }
  };

  const sendMessage = async (): Promise<void> => {
    if (newMessage.trim().length === 0) return;
    const messageText = newMessage.trim();
    setNewMessage('');
    try {
      const response = await fetch(`${API_BASE_URL}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, message: messageText }),
      });
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message');
      setNewMessage(messageText);
    }
  };

  const renderMessage: ListRenderItem<Message> = ({ item }) => {
    const isOwnMessage = item.username === username;
    const isSystem = item.isSystem;
    if (isSystem) {
      return (
        <View style={styles.systemMessageContainer}>
          <Text style={styles.systemMessage}>{item.message}</Text>
        </View>
      );
    }
    return (
      <View style={[
        styles.messageContainer,
        isOwnMessage ? styles.ownMessageContainer : styles.otherMessageContainer,
      ]}>
        <View style={[
          styles.messageBubble,
          isOwnMessage ? styles.ownMessageBubble : styles.otherMessageBubble,
        ]}>
          {!isOwnMessage && (
            <Text style={styles.username}>{item.username}</Text>
          )}
          <Text style={[
            styles.messageText,
            isOwnMessage ? styles.ownMessageText : styles.otherMessageText,
          ]}>
            {item.message}
          </Text>
          <Text style={styles.timestamp}>
            {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading messages...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.statusBar}>
        <Text style={styles.statusText}>
          {isConnected ? '🟢 Connected' : '🔴 Connecting...'}
        </Text>
      </View>
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id.toString()}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="Type a message..."
          value={newMessage}
          onChangeText={setNewMessage}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            !newMessage.trim() ? styles.sendButtonDisabled : styles.sendButtonEnabled,
          ]}
          onPress={sendMessage}
          disabled={!newMessage.trim()}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  statusBar: {
    padding: 10,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  statusText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#6b7280',
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: 10,
  },
  systemMessageContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  systemMessage: {
    fontSize: 12,
    color: '#6b7280',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  messageContainer: {
    marginVertical: 6,
    flexDirection: 'row',
  },
  ownMessageContainer: {
    justifyContent: 'flex-end',
  },
  otherMessageContainer: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  ownMessageBubble: {
    backgroundColor: '#3b82f6',
    borderBottomRightRadius: 6,
  },
  otherMessageBubble: {
    backgroundColor: 'white',
    borderBottomLeftRadius: 6,
  },
  username: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
    fontWeight: 'bold',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  ownMessageText: {
    color: 'white',
  },
  otherMessageText: {
    color: '#1f2937',
  },
  timestamp: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 10,
    fontSize: 16,
    maxHeight: 96,
  },
  sendButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonEnabled: {
    backgroundColor: '#3b82f6',
  },
  sendButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  sendButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 