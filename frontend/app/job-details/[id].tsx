import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../src/theme/theme';
import { Button } from '../../src/components/Button';

export default function JobDetails() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  // MOCK DATA
  const job = {
    id,
    title: 'Limpeza Residencial - Apartamento',
    date: 'Amanhã, 14:00',
    status: 'IN_PROGRESS',
    price: 'R$ 150,00',
    address: 'Rua das Flores, 123 - Apto 45',
    professional: {
      name: 'Maria Silva',
      rating: 4.9,
    }
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

        <Text style={styles.title}>{job.title}</Text>
        <Text style={styles.price}>{job.price}</Text>

        <View style={styles.card}>
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={20} color={theme.colors.textSecondary} />
            <Text style={styles.infoText}>{job.date}</Text>
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
              <Text style={styles.avatarText}>{job.professional.name[0]}</Text>
            </View>
            <View>
              <Text style={styles.profName}>{job.professional.name}</Text>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={14} color="#F59E0B" />
                <Text style={styles.ratingText}>{job.professional.rating}</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity style={styles.chatButton} onPress={() => router.push('/coming-soon?title=Chat com Profissional')}>
            <Ionicons name="chatbubble-outline" size={20} color={theme.colors.primary} />
            <Text style={styles.chatButtonText}>Mensagem</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {job.status === 'COMPLETED' && (
        <View style={styles.footer}>
          <Button 
            title="Avaliar Serviço" 
            onPress={() => router.push('/coming-soon?title=Avaliar Serviço')} 
            style={styles.actionButton}
          />
        </View>
      )}
      {job.status === 'IN_PROGRESS' && (
        <View style={styles.footer}>
          <Button 
            title="Finalizar Serviço" 
            onPress={() => router.push('/coming-soon?title=Finalizar Serviço')} 
            style={styles.actionButton}
          />
        </View>
      )}
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
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 100,
  },
  statusContainer: {
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 8,
  },
  price: {
    fontSize: 28,
    fontWeight: '800',
    color: theme.colors.primary,
    marginBottom: 24,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    ...theme.shadows.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: 8,
  },
  infoText: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 12,
  },
  professionalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  profName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  ratingText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: theme.colors.primary + '15',
    paddingVertical: 12,
    borderRadius: 12,
  },
  chatButtonText: {
    color: theme.colors.primary,
    fontWeight: 'bold',
    fontSize: 14,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    backgroundColor: theme.colors.background,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  actionButton: {
    height: 56,
  },
});
