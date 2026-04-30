import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity,
  RefreshControl
} from 'react-native';
import { theme } from '../../src/theme/theme';
import { Card } from '../../src/components/Card';
import { Ionicons } from '@expo/vector-icons';

const MOCK_JOBS = [
  { id: '1', title: 'Limpeza Residencial', status: 'COMPLETED', date: '25 Abr 2024', price: 'R$ 150,00' },
  { id: '2', title: 'Limpeza Pós-Obra', status: 'IN_PROGRESS', date: '30 Abr 2024', price: 'R$ 450,00' },
  { id: '3', title: 'Limpeza de Sofá', status: 'PENDING', date: '02 Mai 2024', price: 'R$ 200,00' },
];

export default function Jobs() {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return theme.colors.success;
      case 'IN_PROGRESS': return theme.colors.secondary;
      case 'PENDING': return theme.colors.warning;
      default: return theme.colors.textMuted;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'Concluído';
      case 'IN_PROGRESS': return 'Em Andamento';
      case 'PENDING': return 'Pendente';
      default: return status;
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={MOCK_JOBS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />
        }
        ListHeaderComponent={
          <Text style={styles.headerTitle}>Meus Trabalhos</Text>
        }
        renderItem={({ item }) => (
          <Card style={styles.jobCard}>
            <View style={styles.jobHeader}>
              <View>
                <Text style={styles.jobTitle}>{item.title}</Text>
                <Text style={styles.jobDate}>{item.date}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '15' }]}>
                <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                  {getStatusText(item.status)}
                </Text>
              </View>
            </View>
            
            <View style={styles.jobFooter}>
              <Text style={styles.jobPrice}>{item.price}</Text>
              <TouchableOpacity style={styles.detailsButton}>
                <Text style={styles.detailsButtonText}>Ver Detalhes</Text>
                <Ionicons name="chevron-forward" size={16} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>
          </Card>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="documents-outline" size={60} color={theme.colors.textMuted} />
            <Text style={styles.emptyText}>Nenhum trabalho encontrado.</Text>
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
  listContent: {
    padding: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 24,
  },
  jobCard: {
    marginBottom: 16,
    padding: 20,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
  },
  jobDate: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  jobFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: 16,
  },
  jobPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.text,
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailsButtonText: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: theme.colors.textMuted,
  },
});
