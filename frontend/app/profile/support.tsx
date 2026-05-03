import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../src/theme/theme';

export default function SupportScreen() {
  const router = useRouter();

  const faqs = [
    { q: 'Como cancelo um agendamento?', a: 'Para cancelar, vá na aba "Trabalhos", selecione o trabalho e clique em "Cancelar". Cancelamentos com menos de 2h de antecedência podem ter taxa.' },
    { q: 'Como é calculado o valor?', a: 'O valor é calculado com base no tamanho do ambiente e no tipo de serviço escolhido.' },
    { q: 'Posso escolher o profissional?', a: 'Sim! Após agendar, os profissionais mais próximos da sua região aceitarão o pedido.' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ajuda & Suporte</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.contactCard}>
          <View style={styles.iconCircle}>
            <Ionicons name="headset" size={32} color={theme.colors.primary} />
          </View>
          <Text style={styles.contactTitle}>Precisando de ajuda?</Text>
          <Text style={styles.contactDesc}>Nossa equipe está disponível 24/7 para ajudar você com qualquer problema.</Text>
          <TouchableOpacity style={styles.chatButton} onPress={() => router.push('/chat?title=Atendimento ao Cliente')}>
            <Text style={styles.chatButtonText}>Falar no Chat</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Perguntas Frequentes</Text>
        {faqs.map((faq, index) => (
          <View key={index} style={styles.faqCard}>
            <Text style={styles.faqQuestion}>{faq.q}</Text>
            <Text style={styles.faqAnswer}>{faq.a}</Text>
          </View>
        ))}
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
  contactCard: { backgroundColor: theme.colors.primary + '15', borderRadius: 24, padding: 24, alignItems: 'center', marginBottom: 32 },
  iconCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: theme.colors.surface, alignItems: 'center', justifyContent: 'center', marginBottom: 16, ...theme.shadows.sm },
  contactTitle: { fontSize: 20, fontWeight: 'bold', color: theme.colors.primary, marginBottom: 8 },
  contactDesc: { fontSize: 14, color: theme.colors.textSecondary, textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  chatButton: { backgroundColor: theme.colors.primary, paddingHorizontal: 32, paddingVertical: 12, borderRadius: 24 },
  chatButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.text, marginBottom: 16 },
  faqCard: { backgroundColor: theme.colors.surface, padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: theme.colors.border },
  faqQuestion: { fontSize: 15, fontWeight: 'bold', color: theme.colors.text, marginBottom: 8 },
  faqAnswer: { fontSize: 14, color: theme.colors.textSecondary, lineHeight: 20 },
});
