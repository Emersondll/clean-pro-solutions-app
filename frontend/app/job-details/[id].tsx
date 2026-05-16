import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../src/theme/theme';
import { Button } from '../../src/components/Button';
import api from '../../src/services/api';
import { useAuth } from '../../src/context/AuthContext';
import { MOCK_JOB_DETAILS } from '../../src/services/mockData';

interface JobDetail {
  id: string;
  serviceId: string;
  serviceName: string;
  clientId: string;
  contractorId: string;
  contractorName: string;
  contractorRating: number;
  startTime: string;
  endTime: string;
  status: string;
  agreedPrice: number;
  address: string;
  schedulingId: string;
  contractId: string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'COMPLETED': return theme.colors.success;
    case 'IN_PROGRESS': return theme.colors.secondary;
    case 'PENDING': return theme.colors.warning;
    case 'CANCELED': return theme.colors.error;
    default: return theme.colors.textMuted;
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'COMPLETED': return 'Concluído';
    case 'IN_PROGRESS': return 'Em Andamento';
    case 'PENDING': return 'Pendente';
    case 'CANCELED': return 'Cancelado';
    default: return status;
  }
};

const formatDateTime = (iso: string) => {
  try {
    return new Date(iso).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
};

export default function JobDetails() {
  const router = useRouter();
  const { user } = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [job, setJob] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [canceling, setCanceling] = useState(false);

  useEffect(() => {
    loadJob();
  }, [id]);

  const loadJob = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/schedule/${id}`);
      setJob(res.data as JobDetail);
    } catch (e) {
      // Fallback to mock data
      const detail = (MOCK_JOB_DETAILS as Record<string, any>)[id as string] || MOCK_JOB_DETAILS['job-2'];
      setJob(detail as JobDetail);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelWithRefund = () => {
    if (!job) return;
    Alert.alert(
      'Cancelar com Reembolso',
      'Ao cancelar este serviço, você receberá um reembolso de acordo com a política:\n\n• Cancelamento com mais de 24h de antecedência: 100% de reembolso\n• Cancelamento com menos de 24h: 50% de reembolso\n\nDeseja prosseguir?',
      [
        { text: 'Não', style: 'cancel' },
        {
          text: 'Sim, Cancelar',
          style: 'destructive',
          onPress: async () => {
            setCanceling(true);
            try {
              await api.patch(`/contract/${job.contractId}/cancel-with-refund`);
              Alert.alert('Cancelado', 'Seu serviço foi cancelado e o reembolso será processado em até 5 dias úteis.', [
                { text: 'OK', onPress: () => router.back() },
              ]);
            } catch (e: any) {
              const msg = e?.response?.data?.message ?? 'Erro ao cancelar o serviço.';
              Alert.alert('Erro', msg);
            } finally {
              setCanceling(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!job) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Trabalho não encontrado.</Text>
        <TouchableOpacity style={styles.backLinkButton} onPress={() => router.back()}>
          <Text style={styles.backLinkText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const canCancel = job.status === 'PENDING' || job.status === 'IN_PROGRESS';
  const canReview = job.status === 'COMPLETED';
  const canDispute = job.status === 'COMPLETED' || job.status === 'CANCELED';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalhes do Trabalho</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.statusContainer}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(job.status) + '15' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(job.status) }]}>
              {getStatusText(job.status)}
            </Text>
          </View>
        </View>

        <Text style={styles.title}>{job.serviceName}</Text>
        <Text style={styles.price}>R$ {job.agreedPrice.toFixed(2).replace('.', ',')}</Text>

        <View style={styles.card}>
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={20} color={theme.colors.textSecondary} />
            <Text style={styles.infoText}>Início: {formatDateTime(job.startTime)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={20} color={theme.colors.textSecondary} />
            <Text style={styles.infoText}>Término: {formatDateTime(job.endTime)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={20} color={theme.colors.textSecondary} />
            <Text style={styles.infoText}>{job.address}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Profissional</Text>
        <View style={styles.card}>
          <View style={styles.professionalInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{job.contractorName[0]}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.profName}>{job.contractorName}</Text>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={14} color="#F59E0B" />
                <Text style={styles.ratingText}>{job.contractorRating}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.profileButton}
              onPress={() => router.push(`/contractor-profile/${job.contractorId}` as any)}
            >
              <Text style={styles.profileButtonText}>Ver Perfil</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.chatButton}
            onPress={() =>
              router.push(
                `/chat?contractId=${job.contractId}&contractorId=${job.contractorId}&clientId=${user?.id}&title=${encodeURIComponent(job.contractorName)}` as any
              )
            }
          >
            <Ionicons name="chatbubble-outline" size={20} color={theme.colors.primary} />
            <Text style={styles.chatButtonText}>Chat com Profissional</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.actionsSection}>
          {canCancel && (
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton, canceling && styles.buttonDisabled]}
              onPress={handleCancelWithRefund}
              disabled={canceling}
            >
              {canceling ? (
                <ActivityIndicator size="small" color={theme.colors.error} />
              ) : (
                <>
                  <Ionicons name="close-circle-outline" size={18} color={theme.colors.error} />
                  <Text style={styles.cancelButtonText}>Cancelar com Reembolso</Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {canReview && (
            <TouchableOpacity
              style={[styles.actionButton, styles.reviewButton]}
              onPress={() => router.push('/review' as any)}
            >
              <Ionicons name="star-outline" size={18} color={theme.colors.warning} />
              <Text style={styles.reviewButtonText}>Avaliar Serviço</Text>
            </TouchableOpacity>
          )}

          {canDispute && (
            <TouchableOpacity
              style={[styles.actionButton, styles.disputeButton]}
              onPress={() =>
                router.push(`/profile/support?contractId=${job.contractId}` as any)
              }
            >
              <Ionicons name="alert-circle-outline" size={18} color={theme.colors.textSecondary} />
              <Text style={styles.disputeButtonText}>Abrir Disputa</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    gap: 16,
  },
  errorText: { fontSize: 16, color: theme.colors.textSecondary },
  backLinkButton: { backgroundColor: theme.colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  backLinkText: { color: '#FFF', fontWeight: 'bold' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 16,
    backgroundColor: theme.colors.background,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    ...theme.shadows.sm,
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: theme.colors.text },
  scrollContent: { padding: 24, paddingBottom: 40 },
  statusContainer: { alignItems: 'flex-start', marginBottom: 16 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  statusText: { fontSize: 12, fontWeight: 'bold' },
  title: { fontSize: 24, fontWeight: 'bold', color: theme.colors.text, marginBottom: 8 },
  price: { fontSize: 28, fontWeight: '800', color: theme.colors.primary, marginBottom: 24 },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    ...theme.shadows.sm,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  divider: { height: 1, backgroundColor: theme.colors.border, marginVertical: 4 },
  infoText: { fontSize: 15, color: theme.colors.textSecondary, flex: 1 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.text, marginBottom: 12 },
  professionalInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 12 },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 20, fontWeight: 'bold', color: '#FFF' },
  profName: { fontSize: 16, fontWeight: 'bold', color: theme.colors.text },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  ratingText: { fontSize: 14, color: theme.colors.textSecondary },
  profileButton: { backgroundColor: theme.colors.primary + '15', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  profileButtonText: { color: theme.colors.primary, fontWeight: 'bold', fontSize: 13 },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: theme.colors.primary + '15',
    paddingVertical: 12,
    borderRadius: 12,
  },
  chatButtonText: { color: theme.colors.primary, fontWeight: 'bold', fontSize: 14 },
  actionsSection: { gap: 12 },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  cancelButton: { borderColor: theme.colors.error, backgroundColor: theme.colors.error + '08' },
  cancelButtonText: { color: theme.colors.error, fontWeight: 'bold', fontSize: 15 },
  reviewButton: { borderColor: theme.colors.warning, backgroundColor: theme.colors.warning + '10' },
  reviewButtonText: { color: theme.colors.warning, fontWeight: 'bold', fontSize: 15 },
  disputeButton: { borderColor: theme.colors.border, backgroundColor: theme.colors.surface },
  disputeButtonText: { color: theme.colors.textSecondary, fontWeight: 'bold', fontSize: 15 },
  buttonDisabled: { opacity: 0.6 },
});
