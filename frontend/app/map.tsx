import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../src/theme/theme';

export default function MapScreen() {
  const router = useRouter();

  const [professionals] = useState([
    { id: '1', name: 'Maria Silva', rating: 4.9, distance: '1.2 km', price: 'R$ 150/dia' },
    { id: '2', name: 'João Santos', rating: 4.7, distance: '2.5 km', price: 'R$ 120/dia' },
    { id: '3', name: 'Ana Costa', rating: 5.0, distance: '3.1 km', price: 'R$ 180/dia' },
  ]);

  return (
    <View style={styles.container}>
      {/* Mock Map Background */}
      <View style={styles.mapPlaceholder}>
        <Ionicons name="map-outline" size={100} color={theme.colors.primary + '40'} />
        <Text style={styles.mapText}>Mapa Interativo</Text>
        <Text style={styles.mapSubtext}>(Integração com Google Maps na próxima fase)</Text>
      </View>

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={theme.colors.textSecondary} />
          <Text style={styles.searchText}>Buscando nos arredores...</Text>
        </View>
      </View>

      <View style={styles.bottomSheet}>
        <View style={styles.dragHandle} />
        <Text style={styles.sheetTitle}>3 profissionais perto de você</Text>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
          {professionals.map(prof => (
            <TouchableOpacity key={prof.id} style={styles.profCard} onPress={() => router.push(`/service-details/${prof.id}`)}>
              <View style={styles.profAvatar}>
                <Text style={styles.avatarText}>{prof.name[0]}</Text>
              </View>
              <Text style={styles.profName}>{prof.name}</Text>
              <View style={styles.profRow}>
                <Ionicons name="star" size={14} color="#F59E0B" />
                <Text style={styles.profRating}>{prof.rating}</Text>
                <Text style={styles.dot}>•</Text>
                <Text style={styles.profDistance}>{prof.distance}</Text>
              </View>
              <Text style={styles.profPrice}>{prof.price}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.surface },
  mapPlaceholder: { ...StyleSheet.absoluteFillObject, backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' },
  mapText: { fontSize: 24, fontWeight: 'bold', color: theme.colors.textSecondary, marginTop: 16 },
  mapSubtext: { fontSize: 14, color: theme.colors.textMuted, marginTop: 8 },
  header: { position: 'absolute', top: 50, left: 24, right: 24, flexDirection: 'row', alignItems: 'center', gap: 16 },
  backButton: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center', ...theme.shadows.md },
  searchBar: { flex: 1, height: 48, backgroundColor: '#FFF', borderRadius: 24, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 12, ...theme.shadows.md },
  searchText: { fontSize: 15, color: theme.colors.textSecondary },
  bottomSheet: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: theme.colors.background, borderTopLeftRadius: 32, borderTopRightRadius: 32, paddingVertical: 16, ...theme.shadows.md },
  dragHandle: { width: 40, height: 4, backgroundColor: theme.colors.border, borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  sheetTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.text, paddingHorizontal: 24, marginBottom: 16 },
  horizontalScroll: { paddingHorizontal: 24, paddingBottom: 24, gap: 16 },
  profCard: { width: 220, backgroundColor: theme.colors.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: theme.colors.border, ...theme.shadows.sm },
  profAvatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarText: { fontSize: 24, fontWeight: 'bold', color: '#FFF' },
  profName: { fontSize: 16, fontWeight: 'bold', color: theme.colors.text, marginBottom: 4 },
  profRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 12 },
  profRating: { fontSize: 14, fontWeight: '600', color: theme.colors.textSecondary },
  dot: { color: theme.colors.textMuted },
  profDistance: { fontSize: 14, color: theme.colors.textSecondary },
  profPrice: { fontSize: 16, fontWeight: 'bold', color: theme.colors.primary },
});
