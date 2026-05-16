import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../src/theme/theme';
import api from '../src/services/api';
import { useAuth } from '../src/context/AuthContext';

interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  content: string;
  sentAt: string;
}

export default function ChatScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const params = useLocalSearchParams<{
    roomId?: string;
    contractId?: string;
    contractorId?: string;
    clientId?: string;
    title?: string;
  }>();

  const [roomId, setRoomId] = useState<string | null>(params.roomId || null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState('');
  const [loadingRoom, setLoadingRoom] = useState(false);
  const [sending, setSending] = useState(false);

  const flatListRef = useRef<FlatList>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchMessages = async (rid: string) => {
    try {
      const res = await api.get(`/chat/${rid}/messages`);
      setMessages(res.data || []);
    } catch (e) {
      console.error('Failed to fetch messages', e);
    }
  };

  useEffect(() => {
    const initRoom = async () => {
      if (roomId) {
        await fetchMessages(roomId);
        return;
      }
      setLoadingRoom(true);
      try {
        const clientId = params.clientId || user?.id || '';
        const contractorId = params.contractorId || '';
        const contractId = params.contractId || '';
        const res = await api.post('/chat/rooms', { clientId, contractorId, contractId });
        const newRoomId = res.data?.id || res.data;
        setRoomId(newRoomId);
        await fetchMessages(newRoomId);
      } catch (e) {
        console.error('Failed to create room', e);
      } finally {
        setLoadingRoom(false);
      }
    };

    initRoom();
  }, []);

  useEffect(() => {
    if (!roomId) return;

    intervalRef.current = setInterval(() => {
      fetchMessages(roomId);
    }, 3000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [roomId]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!message.trim() || !roomId || !user) return;
    const content = message.trim();
    setMessage('');
    setSending(true);

    const optimisticMsg: ChatMessage = {
      id: `opt-${Date.now()}`,
      roomId,
      senderId: user.id,
      content,
      sentAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, optimisticMsg]);

    try {
      await api.post(`/chat/${roomId}/messages`, { senderId: user.id, content });
    } catch (e) {
      console.error('Failed to send message', e);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const displayTitle = params.title || 'Chat';
  const avatarLetter = displayTitle[0]?.toUpperCase() || 'C';

  if (loadingRoom) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Conectando ao chat...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{avatarLetter}</Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>{displayTitle}</Text>
            <Text style={styles.headerSubtitle}>Online agora</Text>
          </View>
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.chatContainer}
        renderItem={({ item }) => {
          const isSender = item.senderId === user?.id;
          return (
            <View style={[styles.messageWrapper, isSender ? styles.messageWrapperSender : styles.messageWrapperReceiver]}>
              <View style={[styles.messageBubble, isSender ? styles.messageBubbleSender : styles.messageBubbleReceiver]}>
                <Text style={[styles.messageText, isSender && styles.messageTextSender]}>{item.content}</Text>
                <Text style={[styles.timeText, isSender && styles.timeTextSender]}>{formatTime(item.sentAt)}</Text>
              </View>
            </View>
          );
        }}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
      />

      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.attachButton}>
          <Ionicons name="add" size={24} color={theme.colors.textSecondary} />
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder="Digite uma mensagem..."
          value={message}
          onChangeText={setMessage}
          multiline
        />
        <TouchableOpacity
          style={[styles.sendButton, message.trim().length > 0 && styles.sendButtonActive]}
          onPress={sendMessage}
          disabled={sending}
        >
          <Ionicons name="send" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  headerSubtitle: {
    fontSize: 12,
    color: theme.colors.success,
  },
  chatContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  messageWrapper: {
    marginBottom: 16,
    flexDirection: 'row',
  },
  messageWrapperSender: {
    justifyContent: 'flex-end',
  },
  messageWrapperReceiver: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
  },
  messageBubbleSender: {
    backgroundColor: theme.colors.primary,
    borderBottomRightRadius: 4,
  },
  messageBubbleReceiver: {
    backgroundColor: theme.colors.surface,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  messageText: {
    fontSize: 15,
    color: theme.colors.text,
    lineHeight: 22,
  },
  messageTextSender: {
    color: '#FFF',
  },
  timeText: {
    fontSize: 10,
    color: theme.colors.textMuted,
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  timeTextSender: {
    color: 'rgba(255,255,255,0.7)',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  attachButton: {
    padding: 8,
    marginRight: 4,
  },
  input: {
    flex: 1,
    backgroundColor: theme.colors.background,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    maxHeight: 100,
    minHeight: 40,
    fontSize: 15,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  sendButtonActive: {
    backgroundColor: theme.colors.primary,
  },
});
