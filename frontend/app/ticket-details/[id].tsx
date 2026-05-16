import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../src/theme/theme';
import api from '../../src/services/api';

interface Ticket {
  id: string;
  requesterId: string;
  contractId?: string;
  type: string;
  priority: string;
  status: string;
  subject: string;
  description: string;
  resolution: string | null;
  createdAt: string;
  updatedAt: string;
}

const statusColors: Record<string, string> = {
  OPEN: theme.colors.warning,
  IN_PROGRESS: theme.colors.secondary,
  RESOLVED: theme.colors.success,
  CLOSED: theme.colors.textMuted,
};

const statusLabels: Record<string, string> = {
  OPEN: 'Aberto',
  IN_PROGRESS: 'Em Andamento',
  RESOLVED: 'Resolvido',
  CLOSED: 'Fechado',
};

const typeLabels: Record<string, string> = {
  SUPPORT: 'Suporte',
  DISPUTE: 'Disputa',
  COMPLAINT: 'Reclamação',
};

const priorityLabels: Record<string, string> = {
  LOW: 'Baixa',
  MEDIUM: 'Média',
  HIGH: 'Alta',
  URGENT: 'Urgente',
};

const priorityColors: Record<string, string> = {
  LOW: theme.colors.textMuted,
  MEDIUM: theme.colors.warning,
  HIGH: theme.colors.error,
  URGENT: '#DC2626',
};

export default function TicketDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    loadTicket();
  }, [id]);

  const loadTicket = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/tickets/${id}`);
      setTicket(res.data);
    } catch (e) {
      console.error('Failed to load ticket', e);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = async () => {
    Alert.alert(
      'Fechar Ticket',
      'Tem certeza que deseja fechar este ticket?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Fechar',
          onPress: async () => {
            setClosing(true);
            try {
              await api.patch(`/tickets/${id}/close`);
              Alert.alert('Sucesso', 'Ticket fechado com sucesso.', [
                { text: 'OK', onPress: () => router.back() },
              ]);
            } catch (e: any) {
              const msg = e?.response?.data?.message ?? 'Erro ao fechar ticket.';
              Alert.alert('Erro', msg);
            } finally {
              setClosing(false);
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

  if (!ticket) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Ticket não encontrado.</Text>
        <TouchableOpacity style={styles.backLinkButton} onPress={() => router.back()}>
          <Text style={styles.backLinkText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const statusColor = statusColors[ticket.status] || theme.colors.textMuted;
  const priorityColor = priorityColors[ticket.priority] || theme.colors.textMuted;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalhes do Ticket</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.statusRow}>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>
              {statusLabels[ticket.status] || ticket.status}
            </Text>
          </View>
          <View style={[styles.priorityBadge, { backgroundColor: priorityColor + '20' }]}>
            <Text style={[styles.priorityText, { color: priorityColor }]}>
              {priorityLabels[ticket.priority] || ticket.priority}
            </Text>
          </View>
        </View>

        <Text style={styles.subject}>{ticket.subject}</Text>

        <View style={styles.metaCard}>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Tipo</Text>
            <Text style={styles.metaValue}>{typeLabels[ticket.type] || ticket.type}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Criado em</Text>
            <Text style={styles.metaValue}>{new Date(ticket.createdAt).toLocaleString('pt-BR')}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Atualizado em</Text>
            <Text style={styles.metaValue}>{new Date(ticket.updatedAt).toLocaleString('pt-BR')}</Text>
          </View>
          {ticket.contractId ? (
            <>
              <View style={styles.divider} />
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Contrato</Text>
                <Text style={styles.metaValue}>{ticket.contractId}</Text>
              </View>
            </>
          ) : null}
        </View>

        <Text style={styles.sectionTitle}>Descrição</Text>
        <View style={styles.descriptionCard}>
          <Text style={styles.descriptionText}>{ticket.description}</Text>
        </View>

        {ticket.resolution ? (
          <>
            <Text style={styles.sectionTitle}>Resolução</Text>
            <View style={[styles.descriptionCard, styles.resolutionCard]}>
              <Ionicons name="checkmark-circle" size={18} color={theme.colors.success} style={styles.resolutionIcon} />
              <Text style={styles.resolutionText}>{ticket.resolution}</Text>
            </View>
          </>
        ) : null}

        {ticket.status === 'OPEN' ? (
          <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
        ) : null}

        {ticket.status === 'RESOLVED' ? (
          <TouchableOpacity
            style={[styles.closeButton, closing && styles.buttonDisabled]}
            onPress={handleClose}
            disabled={closing}
          >
            {closing ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Text style={styles.closeButtonText}>Fechar Ticket</Text>
            )}
          </TouchableOpacity>
        ) : null}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
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
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: theme.colors.text },
  scrollContent: { padding: 24, paddingBottom: 40 },
  statusRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  statusText: { fontSize: 13, fontWeight: 'bold' },
  priorityBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  priorityText: { fontSize: 13, fontWeight: 'bold' },
  subject: { fontSize: 22, fontWeight: 'bold', color: theme.colors.text, marginBottom: 20 },
  metaCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.sm,
  },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  metaLabel: { fontSize: 14, color: theme.colors.textSecondary },
  metaValue: { fontSize: 14, fontWeight: '600', color: theme.colors.text },
  divider: { height: 1, backgroundColor: theme.colors.border },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: theme.colors.text, marginBottom: 12 },
  descriptionCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  descriptionText: { fontSize: 15, color: theme.colors.textSecondary, lineHeight: 22 },
  resolutionCard: {
    backgroundColor: theme.colors.success + '10',
    borderColor: theme.colors.success + '30',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  resolutionIcon: { marginTop: 1 },
  resolutionText: { fontSize: 15, color: theme.colors.text, lineHeight: 22, flex: 1 },
  cancelButton: {
    borderWidth: 1,
    borderColor: theme.colors.error,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  cancelButtonText: { color: theme.colors.error, fontWeight: 'bold', fontSize: 16 },
  closeButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  closeButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  buttonDisabled: { opacity: 0.6 },
  errorText: { fontSize: 16, color: theme.colors.textSecondary },
  backLinkButton: { backgroundColor: theme.colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  backLinkText: { color: '#FFF', fontWeight: 'bold' },
});
