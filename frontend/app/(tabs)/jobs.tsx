import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { theme } from '../../src/theme/theme';
import { Card } from '../../src/components/Card';
import { Ionicons } from '@expo/vector-icons';
import api from '../../src/services/api';
import { useAuth } from '../../src/context/AuthContext';
import { useRouter } from 'expo-router';

interface Scheduling {
  id: string;
  serviceId: string;
  clientId: string;
  contractorId: string;
  startTime: string;
  endTime: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

const formatDate = (iso: string): string => {
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const STATUS_LABEL: Record<string, string> = {
  COMPLETED: 'Concluído',
  IN_PROGRESS: 'Em Andamento',
  PENDING: 'Pendente',
  CANCELED: 'Cancelado',
};

const STATUS_COLOR: Record<string, string> = {
  COMPLETED: theme.colors.success,
  IN_PROGRESS: theme.colors.secondary,
  PENDING: theme.colors.warning,
  CANCELED: theme.colors.textMuted,
};

export default function Jobs() {
  const { user } = useAuth();
  const router = useRouter();
  const [jobs, setJobs] = React.useState<Scheduling[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);

  const fetchJobs = async () => {
    if (!user) return;
    try {
      const response = await api.get(`/schedule/client/${user.id}`);
      setJobs(response.data);
    } catch (error) {
      console.error('[Jobs] fetchJobs error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  React.useEffect(() => {
    fetchJobs();
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchJobs();
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: theme.colors.textMuted }}>Carregando agendamentos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={jobs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />
        }
        ListHeaderComponent={<Text style={styles.headerTitle}>Meus Agendamentos</Text>}
        renderItem={({ item }) => {
          const color = STATUS_COLOR[item.status] ?? theme.colors.textMuted;
          return (
            <Card style={styles.jobCard}>
              <View style={styles.jobHeader}>
                <View style={styles.jobInfo}>
                  <Text style={styles.jobTitle}>Agendamento</Text>
                  <Text style={styles.jobDate}>{formatDate(item.startTime)}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: color + '20' }]}>
                  <Text style={[styles.statusText, { color }]}>
                    {STATUS_LABEL[item.status] ?? item.status}
                  </Text>
                </View>
              </View>

              <View style={styles.jobFooter}>
                <Text style={styles.jobMeta}>Até: {formatDate(item.endTime)}</Text>
                <TouchableOpacity
                  style={styles.detailsButton}
                  onPress={() => router.push(`/job-details/${item.id}`)}
                >
                  <Text style={styles.detailsButtonText}>Ver Detalhes</Text>
                  <Ionicons name="chevron-forward" size={16} color={theme.colors.primary} />
                </TouchableOpacity>
              </View>
            </Card>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="documents-outline" size={60} color={theme.colors.textMuted} />
            <Text style={styles.emptyText}>Nenhum agendamento encontrado.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  listContent: { padding: 24 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: theme.colors.text, marginBottom: 24 },
  jobCard: { marginBottom: 16, padding: 20 },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  jobInfo: { flex: 1, marginRight: 12 },
  jobTitle: { fontSize: 16, fontWeight: '700', color: theme.colors.text },
  jobDate: { fontSize: 13, color: theme.colors.textSecondary, marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 12, fontWeight: '700' },
  jobFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: 16,
  },
  jobMeta: { fontSize: 13, color: theme.colors.textSecondary },
  detailsButton: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  detailsButtonText: { fontSize: 14, color: theme.colors.primary, fontWeight: '700' },
  emptyContainer: { alignItems: 'center', marginTop: 60 },
  emptyText: { marginTop: 16, fontSize: 16, color: theme.colors.textMuted },
});
