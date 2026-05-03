import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../src/theme/theme';
import { Button } from '../src/components/Button';

export default function BookingScreen() {
  const router = useRouter();
  const [selectedService, setSelectedService] = useState('Limpeza Padrão');
  const [selectedDate, setSelectedDate] = useState('Hoje');
  const [selectedTime, setSelectedTime] = useState('14:00');

  const services = ['Limpeza Padrão', 'Limpeza Pesada', 'Pós-Obra', 'Pré-Mudança'];
  const dates = ['Hoje', 'Amanhã', 'Sábado', 'Domingo'];
  const times = ['08:00', '10:00', '14:00', '16:00'];

  const handleBooking = () => {
    Alert.alert(
      'Resumo do Agendamento',
      `Serviço: ${selectedService}\nData: ${selectedDate}\nHora: ${selectedTime}\nTotal: R$ 150,00`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Confirmar', 
          onPress: () => {
            Alert.alert('Sucesso', 'Serviço agendado com sucesso!');
            router.replace('/(tabs)/home');
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Agendar Serviço</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>Qual serviço você precisa?</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          {services.map(service => (
            <TouchableOpacity 
              key={service} 
              style={[styles.chip, selectedService === service && styles.chipActive]}
              onPress={() => setSelectedService(service)}
            >
              <Text style={[styles.chipText, selectedService === service && styles.chipTextActive]}>
                {service}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.sectionTitle}>Quando?</Text>
        <View style={styles.grid}>
          {dates.map(date => (
            <TouchableOpacity 
              key={date} 
              style={[styles.gridItem, selectedDate === date && styles.gridItemActive]}
              onPress={() => setSelectedDate(date)}
            >
              <Text style={[styles.gridItemText, selectedDate === date && styles.gridItemTextActive]}>
                {date}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Que horas?</Text>
        <View style={styles.grid}>
          {times.map(time => (
            <TouchableOpacity 
              key={time} 
              style={[styles.gridItem, selectedTime === time && styles.gridItemActive]}
              onPress={() => setSelectedTime(time)}
            >
              <Text style={[styles.gridItemText, selectedTime === time && styles.gridItemTextActive]}>
                {time}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.addressCard}>
          <View style={styles.addressHeader}>
            <Ionicons name="location" size={20} color={theme.colors.primary} />
            <Text style={styles.addressTitle}>Endereço do Serviço</Text>
          </View>
          <Text style={styles.addressText}>Rua das Flores, 123, Apto 45 - Centro</Text>
          <TouchableOpacity>
            <Text style={styles.changeAddressText}>Mudar Endereço</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Valor Estimado</Text>
          <Text style={styles.priceValue}>R$ 150,00</Text>
        </View>
        <Button title="Confirmar Agendamento" onPress={handleBooking} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', paddingTop: 50, paddingHorizontal: 24, paddingBottom: 16, backgroundColor: theme.colors.background
  },
  backButton: { width: 40, height: 40, borderRadius: 12, backgroundColor: theme.colors.surface, alignItems: 'center', justifyContent: 'center', marginRight: 16, ...theme.shadows.sm },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: theme.colors.text },
  scrollContent: { padding: 24, paddingBottom: 100 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.text, marginBottom: 16, marginTop: 8 },
  horizontalScroll: { marginBottom: 24, marginHorizontal: -24, paddingHorizontal: 24 },
  chip: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 20, backgroundColor: theme.colors.surface, marginRight: 12, borderWidth: 1, borderColor: theme.colors.border },
  chipActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  chipText: { fontSize: 14, fontWeight: '600', color: theme.colors.textSecondary },
  chipTextActive: { color: '#FFF' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  gridItem: { width: '48%', paddingVertical: 16, borderRadius: 12, backgroundColor: theme.colors.surface, alignItems: 'center', borderWidth: 1, borderColor: theme.colors.border },
  gridItemActive: { backgroundColor: theme.colors.primary + '15', borderColor: theme.colors.primary },
  gridItemText: { fontSize: 15, fontWeight: '600', color: theme.colors.textSecondary },
  gridItemTextActive: { color: theme.colors.primary },
  addressCard: { backgroundColor: theme.colors.surface, borderRadius: 16, padding: 16, marginTop: 8, ...theme.shadows.sm },
  addressHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
  addressTitle: { fontSize: 16, fontWeight: 'bold', color: theme.colors.text },
  addressText: { fontSize: 14, color: theme.colors.textSecondary, marginBottom: 12, lineHeight: 20 },
  changeAddressText: { color: theme.colors.primary, fontWeight: 'bold', fontSize: 14 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: theme.colors.surface, padding: 24, borderTopWidth: 1, borderTopColor: theme.colors.border },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  priceLabel: { fontSize: 14, color: theme.colors.textSecondary, fontWeight: '600' },
  priceValue: { fontSize: 24, fontWeight: 'bold', color: theme.colors.primary },
});
