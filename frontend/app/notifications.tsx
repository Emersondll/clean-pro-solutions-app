import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../src/theme/theme';

const MOCK_NOTIFICATIONS = [
  { id: '1', title: 'Agendamento Confirmado', description: 'Seu agendamento para Limpeza Completa foi confirmado para amanhã às 14h.', time: '2h atrás', read: false },
  { id: '2', title: 'Novo cupom disponível', description: 'Use o cupom CLEAN20 para ganhar 20% de desconto na sua próxima contratação!', time: '1 dia atrás', read: true },
  { id: '3', title: 'Avalie o último serviço', description: 'Como foi sua experiência com o profissional João Silva? Deixe sua avaliação.', time: '3 dias atrás', read: true },
];

export default function Notifications() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Notificações</Text>
      </View>

      <FlatList
        data={MOCK_NOTIFICATIONS}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <TouchableOpacity style={[styles.notificationCard, !item.read && styles.unreadCard]}>
            <View style={styles.iconContainer}>
              <Ionicons name="notifications" size={24} color={!item.read ? theme.colors.primary : theme.colors.textMuted} />
            </View>
            <View style={styles.contentContainer}>
              <Text style={[styles.notificationTitle, !item.read && styles.unreadText]}>{item.title}</Text>
              <Text style={styles.notificationDesc}>{item.description}</Text>
              <Text style={styles.notificationTime}>{item.time}</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off-outline" size={60} color={theme.colors.textMuted} />
            <Text style={styles.emptyText}>Nenhuma notificação no momento.</Text>
          </View>
        }
      />
    </View>
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
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 24,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    ...theme.shadows.sm,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  listContainer: {
    padding: 24,
  },
  notificationCard: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    marginBottom: 16,
    ...theme.shadows.sm,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  iconContainer: {
    marginRight: 16,
    justifyContent: 'center',
  },
  contentContainer: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  unreadText: {
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  notificationDesc: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 8,
  },
  notificationTime: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: theme.colors.textMuted,
  },
});
