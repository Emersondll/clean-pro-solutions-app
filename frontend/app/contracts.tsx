import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../src/theme/theme';
import { Card } from '../src/components/Card';
import { useAuth } from '../src/context/AuthContext';
import api from '../src/services/api';

// ─── Types ──────────────────────────────────────────────────────────────────

type ContractStatus = 'PENDING_PAYMENT' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

interface Contract {
  id: string;
  serviceId: string;
  contractorName: string;
  scheduledDate: string;
  agreedPrice: number;
  status: ContractStatus;
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

const MOCK_CONTRACTS: Contract[] = [
  {
    id: 'c-1',
    serviceId: 'Limpeza Residencial',
    contractorName: 'Pedro Santos',
    scheduledDate: '2026-06-01T10:00:00Z',
    agreedPrice: 250,
    status: 'CONFIRMED',
  },
  {
    id: 'c-2',
    serviceId: 'Limpeza Comercial',
    contractorName: 'Ana Costa',
    scheduledDate: '2026-06-08T09:00:00Z',
    agreedPrice: 450,
    status: 'PENDING_PAYMENT',
  },
  {
    id: 'c-3',
    serviceId: 'Limpeza Pós-Obra',
    contractorName: 'Carlos Lima',
    scheduledDate: '2026-05-20T14:00:00Z',
    agreedPrice: 800,
    status: 'COMPLETED',
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<ContractStatus, { label: string; color: string; bg: string }> = {
  PENDING_PAYMENT: { label: 'Aguard. Pagamento', color: '#92400E', bg: '#FEF3C7' },
  CONFIRMED: { label: 'Confirmado', color: '#065F46', bg: '#D1FAE5' },
  CANCELLED: { label: 'Cancelado', color: '#991B1B', bg: '#FEE2E2' },
  COMPLETED: { label: 'Concluído', color: '#1E3A8A', bg: '#DBEAFE' },
};

const FILTER_TABS: { label: string; value: ContractStatus | 'ALL' }[] = [
  { label: 'Todos', value: 'ALL' },
  { label: 'Pendente', value: 'PENDING_PAYMENT' },
  { label: 'Confirmado', value: 'CONFIRMED' },
  { label: 'Cancelado', value: 'CANCELLED' },
];

const formatPrice = (value: number): string =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const formatDate = (iso: string): string => {
  const date = new Date(iso);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// ─── Contract Card ────────────────────────────────────────────────────────────

interface ContractCardProps {
  contract: Contract;
  onPress: () => void;
}

function ContractCard({ contract, onPress }: ContractCardProps) {
  const status = STATUS_CONFIG[contract.status] ?? STATUS_CONFIG.PENDING_PAYMENT;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.75}>
      <Card style={styles.contractCard} variant="outlined">
        <View style={styles.cardHeader}>
          <View style={styles.serviceIconContainer}>
            <Ionicons name="sparkles-outline" size={22} color={theme.colors.primary} />
          </View>
          <View style={styles.cardHeaderText}>
            <Text style={styles.serviceName} numberOfLines={1}>
              {contract.serviceId}
            </Text>
            <Text style={styles.contractorName}>{contract.contractorName}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
            <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.footerItem}>
            <Ionicons name="calendar-outline" size={14} color={theme.colors.textSecondary} />
            <Text style={styles.footerText}>{formatDate(contract.scheduledDate)}</Text>
          </View>
          <Text style={styles.priceText}>{formatPrice(contract.agreedPrice)}</Text>
        </View>
      </Card>
    </TouchableOpacity>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ContractsScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<ContractStatus | 'ALL'>('ALL');

  const fetchContracts = useCallback(async () => {
    try {
      const response = await api.get(`/contracts/client/${user?.id}`);
      setContracts(response.data ?? []);
    } catch {
      // Fall back to mock data when the API is unreachable during development
      setContracts(MOCK_CONTRACTS);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchContracts();
  };

  const filteredContracts =
    activeFilter === 'ALL'
      ? contracts
      : contracts.filter((c) => c.status === activeFilter);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Meus Contratos</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Filter Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContent}
      >
        {FILTER_TABS.map((tab) => (
          <TouchableOpacity
            key={tab.value}
            style={[styles.filterTab, activeFilter === tab.value && styles.filterTabActive]}
            onPress={() => setActiveFilter(tab.value)}
          >
            <Text
              style={[
                styles.filterTabText,
                activeFilter === tab.value && styles.filterTabTextActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Content */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Carregando contratos...</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[theme.colors.primary]}
            />
          }
        >
          {filteredContracts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconContainer}>
                <Ionicons name="document-text-outline" size={48} color={theme.colors.textMuted} />
              </View>
              <Text style={styles.emptyTitle}>Nenhum contrato encontrado</Text>
              <Text style={styles.emptySubtitle}>
                {activeFilter === 'ALL'
                  ? 'Você ainda não possui contratos.'
                  : 'Nenhum contrato com este status.'}
              </Text>
            </View>
          ) : (
            filteredContracts.map((contract) => (
              <ContractCard
                key={contract.id}
                contract={contract}
                onPress={() => router.push(`/contract-details/${contract.id}` as any)}
              />
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
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
  filterScroll: {
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  filterContent: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginRight: 8,
  },
  filterTabActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  filterTabTextActive: {
    color: '#FFF',
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
    gap: 12,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIconContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    ...theme.shadows.sm,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  contractCard: {
    padding: 16,
    marginBottom: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  serviceIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: theme.colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardHeaderText: {
    flex: 1,
  },
  serviceName: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 2,
  },
  contractorName: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  priceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
});
