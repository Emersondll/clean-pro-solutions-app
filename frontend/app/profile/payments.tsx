import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../src/theme/theme';
import { Button } from '../../src/components/Button';

export default function PaymentsScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pagamentos</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>Cartões Salvos</Text>
        
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="card" size={32} color={theme.colors.primary} />
            <Text style={styles.cardBrand}>Mastercard</Text>
          </View>
          <Text style={styles.cardNumber}>**** **** **** 4567</Text>
          <View style={styles.cardFooter}>
            <Text style={styles.cardName}>EMERSON SILVA</Text>
            <Text style={styles.cardExp}>12/28</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.addBtn}>
          <Ionicons name="add-circle-outline" size={24} color={theme.colors.primary} />
          <Text style={styles.addBtnText}>Adicionar Novo Cartão</Text>
        </TouchableOpacity>

        <Text style={[styles.sectionTitle, { marginTop: 32 }]}>Pix</Text>
        <View style={styles.pixCard}>
          <Ionicons name="qr-code-outline" size={24} color={theme.colors.secondary} />
          <View style={styles.pixInfo}>
            <Text style={styles.pixTitle}>Chave Pix Cadastrada</Text>
            <Text style={styles.pixKey}>123.456.789-00</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 50, paddingHorizontal: 24, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  backButton: { width: 40, height: 40, borderRadius: 12, backgroundColor: theme.colors.surface, alignItems: 'center', justifyContent: 'center', marginRight: 16, ...theme.shadows.sm },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: theme.colors.text },
  scrollContent: { padding: 24 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.text, marginBottom: 16 },
  card: { backgroundColor: '#1E293B', borderRadius: 16, padding: 24, marginBottom: 16, ...theme.shadows.md },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  cardBrand: { color: '#FFF', fontSize: 16, fontWeight: 'bold', fontStyle: 'italic' },
  cardNumber: { color: '#FFF', fontSize: 22, letterSpacing: 2, marginBottom: 24, fontFamily: 'monospace' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  cardName: { color: '#FFF', fontSize: 14, opacity: 0.8 },
  cardExp: { color: '#FFF', fontSize: 14, opacity: 0.8 },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 12 },
  addBtnText: { color: theme.colors.primary, fontSize: 16, fontWeight: '600' },
  pixCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surface, padding: 16, borderRadius: 16, ...theme.shadows.sm },
  pixInfo: { marginLeft: 16 },
  pixTitle: { fontSize: 14, color: theme.colors.textSecondary, marginBottom: 4 },
  pixKey: { fontSize: 16, fontWeight: 'bold', color: theme.colors.text },
});
