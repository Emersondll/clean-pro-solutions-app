import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../src/theme/theme';
import api from '../src/services/api';
import { useAuth } from '../src/context/AuthContext';

interface NotificationItem {
  id: string;
  recipientId: string;
  relatedEventId: string;
  message: string;
  channel: string;
  status: string;
  createdAt: string;
}

const formatRelativeTime = (iso: string): string => {
  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return 'Agora há pouco';
  if (hours < 24) return `${hours}h atrás`;
  const days = Math.floor(hours / 24);
  return `${days} dia${days > 1 ? 's' : ''} atrás`;
};

export default function Notifications() {
  const router = useRouter();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const response = await api.get(`/notifications/${user.id}`);
      setNotifications(response.data);
    } catch (error) {
      console.error('[Notifications] fetch error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Notificações</Text>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />
        }
        renderItem={({ item }) => {
          const isUnread = item.status === 'SENT';
          return (
            <TouchableOpacity style={[styles.notificationCard, isUnread && styles.unreadCard]}>
              <View style={styles.iconContainer}>
                <Ionicons
                  name="notifications"
                  size={24}
                  color={isUnread ? theme.colors.primary : theme.colors.textMuted}
                />
              </View>
              <View style={styles.contentContainer}>
                <Text style={[styles.notificationTitle, isUnread && styles.unreadText]}>
                  {item.channel === 'IN_APP' ? 'Notificação' : item.channel}
                </Text>
                <Text style={styles.notificationDesc}>{item.message}</Text>
                <Text style={styles.notificationTime}>{formatRelativeTime(item.createdAt)}</Text>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="notifications-off-outline" size={60} color={theme.colors.textMuted} />
              <Text style={styles.emptyText}>Nenhuma notificação no momento.</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
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
  title: { fontSize: 24, fontWeight: 'bold', color: theme.colors.text },
  listContainer: { padding: 24 },
  notificationCard: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    marginBottom: 16,
    ...theme.shadows.sm,
  },
  unreadCard: { borderLeftWidth: 4, borderLeftColor: theme.colors.primary },
  iconContainer: { marginRight: 16, justifyContent: 'center' },
  contentContainer: { flex: 1 },
  notificationTitle: { fontSize: 16, fontWeight: '600', color: theme.colors.text, marginBottom: 4 },
  unreadText: { fontWeight: 'bold', color: theme.colors.primary },
  notificationDesc: { fontSize: 14, color: theme.colors.textSecondary, marginBottom: 8 },
  notificationTime: { fontSize: 12, color: theme.colors.textMuted },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 60 },
  emptyText: { marginTop: 16, fontSize: 16, color: theme.colors.textMuted },
});
