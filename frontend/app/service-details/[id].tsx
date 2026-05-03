import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../src/theme/theme';
import { Button } from '../../src/components/Button';

export default function ServiceDetails() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  // MOCK DATA based on ID
  const service = {
    id,
    name: 'Limpeza Completa',
    description: 'Serviço de limpeza profunda para residências. Inclui todos os cômodos, janelas, chão e móveis. Produtos de limpeza inclusos.',
    price: '150',
    duration: '4-6 horas',
    rating: 4.8,
    reviews: 124,
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.imagePlaceholder}>
          <Ionicons name="sparkles" size={80} color={theme.colors.primary} />
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>{service.name}</Text>
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="star" size={16} color="#F59E0B" />
              <Text style={styles.statText}>{service.rating} ({service.reviews} avaliações)</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="time-outline" size={16} color={theme.colors.textSecondary} />
              <Text style={styles.statText}>{service.duration}</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Descrição</Text>
          <Text style={styles.description}>{service.description}</Text>

          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>A partir de</Text>
            <Text style={styles.priceValue}>R$ {service.price}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button 
          title="Agendar Serviço" 
          onPress={() => router.push(`/coming-soon?title=Agendar Serviço`)} 
          style={styles.bookButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    position: 'absolute',
    top: 40,
    left: 24,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.sm,
  },
  imagePlaceholder: {
    height: 250,
    backgroundColor: theme.colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 24,
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 22,
    marginBottom: 24,
  },
  priceContainer: {
    backgroundColor: theme.colors.surface,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  priceLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
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
  bookButton: {
    height: 56,
  },
});
