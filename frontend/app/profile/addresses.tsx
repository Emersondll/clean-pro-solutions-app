import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../src/theme/theme';
import { Button } from '../../src/components/Button';

export default function AddressesScreen() {
  const router = useRouter();

  const addresses = [
    { id: '1', title: 'Casa', address: 'Rua das Flores, 123', complement: 'Apto 45 - Centro', isDefault: true },
    { id: '2', title: 'Trabalho', address: 'Av. Paulista, 1000', complement: 'Conjunto 200 - Bela Vista', isDefault: false },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Meus Endereços</Text>
      </View>

      <FlatList
        data={addresses}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.addressCard}>
            <View style={styles.iconContainer}>
              <Ionicons name={item.title === 'Casa' ? 'home' : 'business'} size={24} color={theme.colors.primary} />
            </View>
            <View style={styles.infoContainer}>
              <View style={styles.titleRow}>
                <Text style={styles.title}>{item.title}</Text>
                {item.isDefault && <View style={styles.badge}><Text style={styles.badgeText}>Padrão</Text></View>}
              </View>
              <Text style={styles.addressText}>{item.address}</Text>
              <Text style={styles.complementText}>{item.complement}</Text>
            </View>
            <TouchableOpacity style={styles.menuBtn}>
              <Ionicons name="ellipsis-vertical" size={20} color={theme.colors.textMuted} />
            </TouchableOpacity>
          </View>
        )}
      />

      <View style={styles.footer}>
        <Button title="Adicionar Novo Endereço" icon="add" onPress={() => {}} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 50, paddingHorizontal: 24, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  backButton: { width: 40, height: 40, borderRadius: 12, backgroundColor: theme.colors.surface, alignItems: 'center', justifyContent: 'center', marginRight: 16, ...theme.shadows.sm },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: theme.colors.text },
  listContent: { padding: 24 },
  addressCard: { flexDirection: 'row', backgroundColor: theme.colors.surface, padding: 16, borderRadius: 16, marginBottom: 16, ...theme.shadows.sm },
  iconContainer: { width: 48, height: 48, borderRadius: 24, backgroundColor: theme.colors.primary + '15', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  infoContainer: { flex: 1, justifyContent: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4, gap: 8 },
  title: { fontSize: 16, fontWeight: 'bold', color: theme.colors.text },
  badge: { backgroundColor: theme.colors.secondary + '20', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  badgeText: { fontSize: 10, fontWeight: 'bold', color: theme.colors.secondary },
  addressText: { fontSize: 14, color: theme.colors.textSecondary, marginBottom: 2 },
  complementText: { fontSize: 12, color: theme.colors.textMuted },
  menuBtn: { padding: 8 },
  footer: { padding: 24, backgroundColor: theme.colors.background, borderTopWidth: 1, borderTopColor: theme.colors.border },
});
