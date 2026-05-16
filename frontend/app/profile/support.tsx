import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../src/theme/theme';
import api from '../../src/services/api';
import { useAuth } from '../../src/context/AuthContext';

const TICKET_TYPES = ['SUPPORT', 'DISPUTE', 'COMPLAINT'] as const;
const TICKET_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const;

type TicketType = typeof TICKET_TYPES[number];
type TicketPriority = typeof TICKET_PRIORITIES[number];

interface Ticket {
  id: string;
  requesterId: string;
  contractId?: string;
  type: TicketType;
  priority: TicketPriority;
  status: string;
  subject: string;
  description: string;
  resolution: string | null;
  createdAt: string;
  updatedAt: string;
}

const typeLabels: Record<TicketType, string> = {
  SUPPORT: 'Suporte',
  DISPUTE: 'Disputa',
  COMPLAINT: 'Reclamação',
};

const priorityLabels: Record<TicketPriority, string> = {
  LOW: 'Baixa',
  MEDIUM: 'Média',
  HIGH: 'Alta',
  URGENT: 'Urgente',
};

const priorityColors: Record<TicketPriority, string> = {
  LOW: theme.colors.textMuted,
  MEDIUM: theme.colors.warning,
  HIGH: theme.colors.error,
  URGENT: '#DC2626',
};

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

const faqs = [
  { q: 'Como cancelo um agendamento?', a: 'Para cancelar, vá na aba "Trabalhos", selecione o trabalho e clique em "Cancelar". Cancelamentos com menos de 2h de antecedência podem ter taxa.' },
  { q: 'Como é calculado o valor?', a: 'O valor é calculado com base no tamanho do ambiente e no tipo de serviço escolhido.' },
  { q: 'Posso escolher o profissional?', a: 'Sim! Após agendar, os profissionais mais próximos da sua região aceitarão o pedido.' },
];

export default function SupportScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const params = useLocalSearchParams<{ contractId?: string }>();

  const [activeTab, setActiveTab] = useState<'open' | 'list'>('open');
  const [ticketType, setTicketType] = useState<TicketType>('SUPPORT');
  const [ticketPriority, setTicketPriority] = useState<TicketPriority>('LOW');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(false);

  useEffect(() => {
    if (activeTab === 'list') {
      loadTickets();
    }
  }, [activeTab]);

  const loadTickets = async () => {
    if (!user) return;
    setLoadingTickets(true);
    try {
      const res = await api.get(`/tickets/requester/${user.id}`);
      setTickets(res.data || []);
    } catch (e) {
      console.error('Failed to load tickets', e);
    } finally {
      setLoadingTickets(false);
    }
  };

  const handleSubmit = async () => {
    if (!subject.trim() || !description.trim()) {
      Alert.alert('Atenção', 'Por favor preencha todos os campos.');
      return;
    }
    if (!user) return;
    setSubmitting(true);
    setSuccessMsg('');
    try {
      await api.post('/tickets', {
        requesterId: user.id,
        contractId: params.contractId || undefined,
        type: ticketType,
        priority: ticketPriority,
        subject: subject.trim(),
        description: description.trim(),
      });
      setSuccessMsg('Ticket aberto com sucesso!');
      setSubject('');
      setDescription('');
      setTicketType('SUPPORT');
      setTicketPriority('LOW');
      setTimeout(() => {
        setSuccessMsg('');
        setActiveTab('list');
      }, 1500);
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? 'Erro ao abrir ticket.';
      Alert.alert('Erro', msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ajuda & Suporte</Text>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'open' && styles.tabActive]}
          onPress={() => setActiveTab('open')}
        >
          <Text style={[styles.tabText, activeTab === 'open' && styles.tabTextActive]}>Abrir Ticket</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'list' && styles.tabActive]}
          onPress={() => setActiveTab('list')}
        >
          <Text style={[styles.tabText, activeTab === 'list' && styles.tabTextActive]}>Meus Tickets</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'open' ? (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {successMsg ? (
            <View style={styles.successBanner}>
              <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
              <Text style={styles.successText}>{successMsg}</Text>
            </View>
          ) : null}

          <Text style={styles.sectionTitle}>Tipo de Solicitação</Text>
          <View style={styles.chipsRow}>
            {TICKET_TYPES.map(t => (
              <TouchableOpacity
                key={t}
                style={[styles.chip, ticketType === t && styles.chipActive]}
                onPress={() => setTicketType(t)}
              >
                <Text style={[styles.chipText, ticketType === t && styles.chipTextActive]}>{typeLabels[t]}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Prioridade</Text>
          <View style={styles.chipsRow}>
            {TICKET_PRIORITIES.map(p => (
              <TouchableOpacity
                key={p}
                style={[styles.chip, ticketPriority === p && styles.chipActive]}
                onPress={() => setTicketPriority(p)}
              >
                <Text style={[styles.chipText, ticketPriority === p && styles.chipTextActive]}>{priorityLabels[p]}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Assunto</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Digite o assunto..."
            value={subject}
            onChangeText={setSubject}
          />

          <Text style={styles.sectionTitle}>Descrição</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            placeholder="Descreva o problema em detalhes..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />

          <TouchableOpacity
            style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Text style={styles.submitButtonText}>Abrir Ticket</Text>
            )}
          </TouchableOpacity>

          <Text style={[styles.sectionTitle, { marginTop: 32 }]}>Perguntas Frequentes</Text>
          {faqs.map((faq, index) => (
            <View key={index} style={styles.faqCard}>
              <Text style={styles.faqQuestion}>{faq.q}</Text>
              <Text style={styles.faqAnswer}>{faq.a}</Text>
            </View>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.listContainer}>
          {loadingTickets ? (
            <View style={styles.centerContent}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
          ) : tickets.length === 0 ? (
            <View style={styles.centerContent}>
              <Ionicons name="ticket-outline" size={48} color={theme.colors.textMuted} />
              <Text style={styles.emptyText}>Nenhum ticket encontrado</Text>
            </View>
          ) : (
            <FlatList
              data={tickets}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.ticketList}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.ticketCard}
                  onPress={() => router.push(`/ticket-details/${item.id}` as any)}
                >
                  <View style={styles.ticketHeader}>
                    <Text style={styles.ticketSubject} numberOfLines={1}>{item.subject}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: (statusColors[item.status] || theme.colors.textMuted) + '20' }]}>
                      <Text style={[styles.statusText, { color: statusColors[item.status] || theme.colors.textMuted }]}>
                        {statusLabels[item.status] || item.status}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.ticketMeta}>
                    <View style={[styles.badge, { backgroundColor: (priorityColors[item.priority] || theme.colors.textMuted) + '20' }]}>
                      <Text style={[styles.badgeText, { color: priorityColors[item.priority] || theme.colors.textMuted }]}>
                        {priorityLabels[item.priority] || item.priority}
                      </Text>
                    </View>
                    <View style={[styles.badge, { backgroundColor: theme.colors.primary + '15' }]}>
                      <Text style={[styles.badgeText, { color: theme.colors.primary }]}>
                        {typeLabels[item.type as TicketType] || item.type}
                      </Text>
                    </View>
                    <Text style={styles.ticketDate}>
                      {new Date(item.createdAt).toLocaleDateString('pt-BR')}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
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
  tabBar: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textMuted,
  },
  tabTextActive: {
    color: theme.colors.primary,
  },
  scrollContent: { padding: 24, paddingBottom: 40 },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: theme.colors.success + '15',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  successText: { color: theme.colors.success, fontWeight: '600', fontSize: 14 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: theme.colors.text, marginBottom: 12 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  chipActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  chipText: { fontSize: 13, fontWeight: '600', color: theme.colors.textSecondary },
  chipTextActive: { color: '#FFF' },
  textInput: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 20,
  },
  textArea: { minHeight: 100 },
  submitButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  submitButtonDisabled: { opacity: 0.6 },
  submitButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  faqCard: {
    backgroundColor: theme.colors.surface,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  faqQuestion: { fontSize: 15, fontWeight: 'bold', color: theme.colors.text, marginBottom: 8 },
  faqAnswer: { fontSize: 14, color: theme.colors.textSecondary, lineHeight: 20 },
  listContainer: { flex: 1 },
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  emptyText: { color: theme.colors.textMuted, fontSize: 15, marginTop: 8 },
  ticketList: { padding: 16 },
  ticketCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.sm,
  },
  ticketHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  ticketSubject: {
    fontSize: 15,
    fontWeight: 'bold',
    color: theme.colors.text,
    flex: 1,
    marginRight: 8,
  },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 12, fontWeight: 'bold' },
  ticketMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  ticketDate: { fontSize: 12, color: theme.colors.textMuted, marginLeft: 'auto' },
});
