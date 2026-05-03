import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../src/theme/theme';

export default function ChatScreen() {
  const router = useRouter();
  const { title } = useLocalSearchParams();
  const [message, setMessage] = useState('');
  
  const [messages, setMessages] = useState([
    { id: '1', text: 'Olá! Tudo bem? Meu nome é Maria, serei a profissional responsável pela sua limpeza.', isSender: false, time: '10:30' },
    { id: '2', text: 'Olá Maria! Tudo ótimo. Que bom, estou aguardando.', isSender: true, time: '10:32' },
    { id: '3', text: 'Chegarei por volta das 14h, conforme agendado. Há alguma instrução especial para a portaria?', isSender: false, time: '10:35' },
  ]);

  const sendMessage = () => {
    if (message.trim().length > 0) {
      setMessages([...messages, { 
        id: Date.now().toString(), 
        text: message, 
        isSender: true, 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      }]);
      setMessage('');
    }
  };

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
            <Text style={styles.avatarText}>M</Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>{title || 'Maria Silva'}</Text>
            <Text style={styles.headerSubtitle}>Online agora</Text>
          </View>
        </View>
      </View>

      <FlatList
        data={messages}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.chatContainer}
        renderItem={({ item }) => (
          <View style={[styles.messageWrapper, item.isSender ? styles.messageWrapperSender : styles.messageWrapperReceiver]}>
            <View style={[styles.messageBubble, item.isSender ? styles.messageBubbleSender : styles.messageBubbleReceiver]}>
              <Text style={[styles.messageText, item.isSender && styles.messageTextSender]}>{item.text}</Text>
              <Text style={[styles.timeText, item.isSender && styles.timeTextSender]}>{item.time}</Text>
            </View>
          </View>
        )}
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
