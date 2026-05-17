import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../src/theme/theme';
import { Card } from '../../src/components/Card';
import { Button } from '../../src/components/Button';
import api from '../../src/services/api';

// ─── Types ──────────────────────────────────────────────────────────────────

type ContractStatus = 'PENDING_PAYMENT' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

interface ContractDetail {
  id: string;
  serviceId: string;
  contractorName: string;
  contractorAvatar?: string;
  clientName: string;
  scheduledDate: string;
  duration: string;
  address: string;
  agreedPrice: number;
  paymentStatus: string;
  paymentMethod: string;
  status: ContractStatus;
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

const MOCK_CONTRACTS: ContractDetail[] = [
  {
    id: 'c-1',
    serviceId: 'Limpeza Residencial',
    contractorName: 'Pedro Santos',
    clientName: 'Você',
    scheduledDate: '2026-06-01T10:00:00Z',
    duration: '4 horas',
    address: 'Rua das Flores, 123 - Centro',
    agreedPrice: 250,
    paymentStatus: 'PAID',
    paymentMethod: 'Cartão de Crédito',
    status: 'CONFIRMED',
  },
  {
    id: 'c-2',
    serviceId: 'Limpeza Comercial',
    contractorName: 'Ana Costa',
    clientName: 'Você',
    scheduledDate: '2026-06-08T09:00:00Z',
    duration: '6 horas',
    address: 'Av. Paulista, 1000 - Bela Vista',
    agreedPrice: 450,
    paymentStatus: 'PENDING',
    paymentMethod: 'PIX',
    status: 'PENDING_PAYMENT',
  },
  {
    id: 'c-3',
    serviceId: 'Limpeza Pós-Obra',
    contractorName: 'Carlos Lima',
    clientName: 'Você',
    scheduledDate: '2026-05-20T14:00:00Z',
    duration: '8 horas',
    address: 'Rua Vergueiro, 500 - Vila Mariana',
    agreedPrice: 800,
    paymentStatus: 'PAID',
    paymentMethod: 'Boleto',
    status: 'COMPLETED',
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<ContractStatus, { label: string; color: string; bg: string; icon: any }> = {
  PENDING_PAYMENT: { label: 'Aguardando Pagamento', color: '#92400E', bg: '#FEF3C7', icon: 'time-outline' },
  CONFIRMED: { label: 'Confirmado', color: '#065F46', bg: '#D1FAE5', icon: 'checkmark-circle-outline' },
  CANCELLED: { label: 'Cancelado', color: '#991B1B', bg: '#FEE2E2', icon: 'close-circle-outline' },
  COMPLETED: { label: 'Concluído', color: '#1E3A8A', bg: '#DBEAFE', icon: 'checkmark-done-circle-outline' },
};

const SAGA_STEPS = [
  { key: 'CREATED', label: 'Contrato Criado' },
  { key: 'PAYMENT', label: 'Pagamento' },
  { key: 'CONFIRMED', label: 'Confirmado' },
  { key: 'COMPLETED', label: 'Concluído' },
];

const getCompletedSteps = (status: ContractStatus): string[] => {
  switch (status) {
    case 'PENDING_PAYMENT':
      return ['CREATED'];
    case 'CONFIRMED':
      return ['CREATED', 'PAYMENT', 'CONFIRMED'];
    case 'COMPLETED':
      return ['CREATED', 'PAYMENT', 'CONFIRMED', 'COMPLETED'];
    case 'CANCELLED':
      return ['CREATED'];
    default:
      return ['CREATED'];
  }
};

const formatPrice = (value: number): string =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

// ─── Sub-components ───────────────────────────────────────────────────────────

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

function Section({ title, children }: SectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Card style={styles.sectionCard} variant="outlined">
        {children}
      </Card>
    </View>
  );
}

interface InfoRowProps {
  icon: any;
  label: string;
  value: string;
}

function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>
        <Ionicons name={icon} size={16} color={theme.colors.primary} />
      </View>
      <View style={styles.infoText}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ContractDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [contract, setContract] = useState<ContractDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContract = async () => {
      try {
        const response = await api.get(`/contracts/${id}`);
        setContract(response.data);
      } catch {
        // Fall back to mock data when the API is unreachable during development
        const mock = MOCK_CONTRACTS.find((c) => c.id === id) ?? MOCK_CONTRACTS[0];
        setContract(mock);
      } finally {
        setLoading(false);
      }
    };

    fetchContract();
  }, [id]);

  const handleCancel = () => {
    Alert.alert(
      'Cancelar Contrato',
      'Tem certeza que deseja cancelar este contrato?',
      [
        { text: 'Não', style: 'cancel' },
        { text: 'Sim, cancelar', style: 'destructive', onPress: () => router.back() },
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

  if (!contract) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Contrato não encontrado.</Text>
      </View>
    );
  }

  const statusConfig = STATUS_CONFIG[contract.status];
  const completedSteps = getCompletedSteps(contract.status);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalhes do Contrato</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Status Banner */}
        <View style={[styles.statusBanner, { backgroundColor: statusConfig.bg }]}>
          <Ionicons name={statusConfig.icon} size={28} color={statusConfig.color} />
          <Text style={[styles.statusBannerText, { color: statusConfig.color }]}>
            {statusConfig.label}
          </Text>
        </View>

        {/* Service Info */}
        <Section title="Informações do Serviço">
          <InfoRow icon="sparkles-outline" label="Serviço" value={contract.serviceId} />
          <View style={styles.divider} />
          <InfoRow icon="calendar-outline" label="Data e Hora" value={formatDate(contract.scheduledDate)} />
          <View style={styles.divider} />
          <InfoRow icon="time-outline" label="Duração Estimada" value={contract.duration} />
          <View style={styles.divider} />
          <InfoRow icon="location-outline" label="Endereço" value={contract.address} />
        </Section>

        {/* Financial Info */}
        <Section title="Financeiro">
          <InfoRow icon="cash-outline" label="Valor Acordado" value={formatPrice(contract.agreedPrice)} />
          <View style={styles.divider} />
          <InfoRow
            icon="card-outline"
            label="Status do Pagamento"
            value={contract.paymentStatus === 'PAID' ? 'Pago' : 'Pendente'}
          />
          <View style={styles.divider} />
          <InfoRow icon="wallet-outline" label="Forma de Pagamento" value={contract.paymentMethod} />
        </Section>

        {/* Parties */}
        <Section title="Partes">
          <View style={styles.partyRow}>
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={24} color={theme.colors.primary} />
            </View>
            <View style={styles.partyInfo}>
              <Text style={styles.partyRole}>Cliente</Text>
              <Text style={styles.partyName}>{contract.clientName}</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.partyRow}>
            <View style={[styles.avatarPlaceholder, { backgroundColor: '#EEF2FF' }]}>
              <Ionicons name="construct" size={24} color="#6366F1" />
            </View>
            <View style={styles.partyInfo}>
              <Text style={styles.partyRole}>Prestador</Text>
              <Text style={styles.partyName}>{contract.contractorName}</Text>
            </View>
          </View>
        </Section>

        {/* SAGA Timeline */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Histórico do Contrato</Text>
          <Card style={styles.sectionCard} variant="outlined">
            {SAGA_STEPS.map((step, index) => {
              const isCompleted = completedSteps.includes(step.key);
              const isLast = index === SAGA_STEPS.length - 1;
              return (
                <View key={step.key} style={styles.timelineItem}>
                  <View style={styles.timelineLeft}>
                    <View
                      style={[
                        styles.timelineDot,
                        isCompleted ? styles.timelineDotCompleted : styles.timelineDotPending,
                      ]}
                    >
                      {isCompleted && (
                        <Ionicons name="checkmark" size={12} color="#FFF" />
                      )}
                    </View>
                    {!isLast && (
                      <View
                        style={[
                          styles.timelineLine,
                          isCompleted ? styles.timelineLineCompleted : styles.timelineLinePending,
                        ]}
                      />
                    )}
                  </View>
                  <Text
                    style={[
                      styles.timelineLabel,
                      isCompleted ? styles.timelineLabelCompleted : styles.timelineLabelPending,
                    ]}
                  >
                    {step.label}
                  </Text>
                </View>
              );
            })}
          </Card>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          {contract.status === 'PENDING_PAYMENT' && (
            <Button
              title="Pagar Agora"
              onPress={() => router.push(`/payment?contractId=${contract.id}` as any)}
              style={styles.primaryButton}
            />
          )}
          {contract.status === 'CONFIRMED' && (
            <>
              <Button
                title="Falar com Prestador"
                onPress={() => router.push('/chat' as any)}
                style={styles.primaryButton}
              />
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                <Text style={styles.cancelButtonText}>Cancelar Contrato</Text>
              </TouchableOpacity>
            </>
          )}
          {contract.status === 'COMPLETED' && (
            <Button
              title="Avaliar Serviço"
              onPress={() => router.push(`/review?contractId=${contract.id}` as any)}
              style={styles.primaryButton}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background,
  },
  errorText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 24,
    paddingBottom: 16,
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
    ...theme.shadows.sm,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 48,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    gap: 12,
  },
  statusBannerText: {
    fontSize: 16,
    fontWeight: '700',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 10,
  },
  sectionCard: {
    padding: 16,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  infoIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: theme.colors.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  infoText: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    color: theme.colors.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: '500',
    lineHeight: 20,
  },
  partyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  partyInfo: {
    flex: 1,
  },
  partyRole: {
    fontSize: 11,
    color: theme.colors.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  partyName: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.text,
    marginTop: 2,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  timelineLeft: {
    alignItems: 'center',
    width: 28,
    marginRight: 12,
  },
  timelineDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineDotCompleted: {
    backgroundColor: theme.colors.primary,
  },
  timelineDotPending: {
    backgroundColor: theme.colors.border,
    borderWidth: 2,
    borderColor: theme.colors.textMuted,
  },
  timelineLine: {
    width: 2,
    height: 24,
    marginTop: 2,
  },
  timelineLineCompleted: {
    backgroundColor: theme.colors.primary,
  },
  timelineLinePending: {
    backgroundColor: theme.colors.border,
  },
  timelineLabel: {
    fontSize: 14,
    paddingTop: 4,
    paddingBottom: 20,
  },
  timelineLabelCompleted: {
    color: theme.colors.text,
    fontWeight: '600',
  },
  timelineLabelPending: {
    color: theme.colors.textMuted,
  },
  actions: {
    marginTop: 8,
    gap: 12,
  },
  primaryButton: {
    height: 56,
  },
  cancelButton: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: theme.colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.error,
  },
});
