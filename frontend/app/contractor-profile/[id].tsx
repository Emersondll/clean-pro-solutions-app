import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../src/theme/theme';
import { MOCK_CONTRACTORS } from '../../src/services/mockData';

interface Contractor {
  id: string;
  name: string;
  rating: number;
  specialties: string[];
  bio: string;
  portfolioPhotos: string[];
  certifications: string[];
  verificationStatus: string;
  reviewCount: number;
  location: string;
}

export default function ContractorProfileScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [contractor, setContractor] = useState<Contractor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContractor();
  }, [id]);

  const loadContractor = () => {
    setLoading(true);
    try {
      const found = MOCK_CONTRACTORS.find(c => c.id === id) || MOCK_CONTRACTORS[0];
      setContractor(found);
    } catch (e) {
      setContractor(MOCK_CONTRACTORS[0]);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Ionicons
        key={i}
        name={i < Math.floor(rating) ? 'star' : i < rating ? 'star-half' : 'star-outline'}
        size={16}
        color="#F59E0B"
      />
    ));
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!contractor) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Profissional não encontrado.</Text>
        <TouchableOpacity style={styles.backLinkButton} onPress={() => router.back()}>
          <Text style={styles.backLinkText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Perfil do Profissional</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{contractor.name[0]}</Text>
          </View>
          <Text style={styles.name}>{contractor.name}</Text>
          <View style={styles.ratingRow}>
            {renderStars(contractor.rating)}
            <Text style={styles.ratingNumber}>{contractor.rating.toFixed(1)}</Text>
            <Text style={styles.reviewCount}>({contractor.reviewCount} avaliações)</Text>
          </View>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={14} color={theme.colors.textSecondary} />
            <Text style={styles.locationText}>{contractor.location}</Text>
          </View>
          <View style={[styles.verificationBadge, contractor.verificationStatus === 'VERIFIED' ? styles.verifiedBadge : styles.pendingBadge]}>
            <Ionicons
              name={contractor.verificationStatus === 'VERIFIED' ? 'checkmark-circle' : 'time-outline'}
              size={14}
              color={contractor.verificationStatus === 'VERIFIED' ? theme.colors.success : theme.colors.warning}
            />
            <Text style={[styles.verificationText, contractor.verificationStatus === 'VERIFIED' ? styles.verifiedText : styles.pendingText]}>
              {contractor.verificationStatus === 'VERIFIED' ? 'Verificado' : 'Verificação Pendente'}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sobre</Text>
          <View style={styles.bioCard}>
            <Text style={styles.bioText}>{contractor.bio}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Especialidades</Text>
          <View style={styles.chipsRow}>
            {contractor.specialties.map((spec, idx) => (
              <View key={idx} style={styles.chip}>
                <Text style={styles.chipText}>{spec}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Certificações</Text>
          {contractor.certifications.length === 0 ? (
            <Text style={styles.emptyText}>Nenhuma certificação cadastrada.</Text>
          ) : (
            contractor.certifications.map((cert, idx) => (
              <View key={idx} style={styles.certItem}>
                <Ionicons name="ribbon-outline" size={18} color={theme.colors.primary} />
                <Text style={styles.certText}>{cert}</Text>
              </View>
            ))
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Portfólio</Text>
          {contractor.portfolioPhotos.length === 0 ? (
            <View style={styles.emptyPortfolio}>
              <Ionicons name="images-outline" size={40} color={theme.colors.textMuted} />
              <Text style={styles.emptyText}>Nenhuma foto no portfólio ainda.</Text>
            </View>
          ) : (
            <View style={styles.photosGrid}>
              {contractor.portfolioPhotos.map((photo, idx) => (
                <View key={idx} style={styles.photoPlaceholder}>
                  <Ionicons name="image-outline" size={32} color={theme.colors.textMuted} />
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push(`/booking?contractorId=${contractor.id}` as any)}
          >
            <Ionicons name="calendar-outline" size={18} color="#FFF" />
            <Text style={styles.primaryButtonText}>Agendar com este Profissional</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push(`/review?contractorId=${contractor.id}` as any)}
          >
            <Ionicons name="star-outline" size={18} color={theme.colors.primary} />
            <Text style={styles.secondaryButtonText}>Avaliar Profissional</Text>
          </TouchableOpacity>
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
  profileSection: { alignItems: 'center', marginBottom: 28 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    ...theme.shadows.md,
  },
  avatarText: { fontSize: 32, fontWeight: 'bold', color: '#FFF' },
  name: { fontSize: 22, fontWeight: 'bold', color: theme.colors.text, marginBottom: 8 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 },
  ratingNumber: { fontSize: 15, fontWeight: 'bold', color: theme.colors.text, marginLeft: 4 },
  reviewCount: { fontSize: 13, color: theme.colors.textSecondary },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 12 },
  locationText: { fontSize: 14, color: theme.colors.textSecondary },
  verificationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  verifiedBadge: { backgroundColor: theme.colors.success + '15' },
  pendingBadge: { backgroundColor: theme.colors.warning + '15' },
  verificationText: { fontSize: 13, fontWeight: '600' },
  verifiedText: { color: theme.colors.success },
  pendingText: { color: theme.colors.warning },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.text, marginBottom: 12 },
  bioCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  bioText: { fontSize: 15, color: theme.colors.textSecondary, lineHeight: 22 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: theme.colors.primary + '15',
    borderWidth: 1,
    borderColor: theme.colors.primary + '30',
  },
  chipText: { fontSize: 13, fontWeight: '600', color: theme.colors.primary },
  certItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  certText: { fontSize: 14, color: theme.colors.text, flex: 1 },
  emptyPortfolio: { alignItems: 'center', gap: 8, paddingVertical: 20 },
  emptyText: { color: theme.colors.textMuted, fontSize: 14, textAlign: 'center' },
  photosGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  photoPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  actionButtons: { gap: 12, marginTop: 8 },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
  },
  primaryButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  secondaryButton: {
    borderWidth: 1,
    borderColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: theme.colors.primary + '08',
  },
  secondaryButtonText: { color: theme.colors.primary, fontWeight: 'bold', fontSize: 16 },
});
