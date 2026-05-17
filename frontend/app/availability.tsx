import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../src/theme/theme';
import { Card } from '../src/components/Card';
import { Button } from '../src/components/Button';
import { Input } from '../src/components/Input';
import api from '../src/services/api';

// ─── Types ──────────────────────────────────────────────────────────────────

interface BlockedSlot {
  id: string;
  startTime: string;
  endTime: string;
}

type AvailabilityResult = 'available' | 'unavailable' | null;

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatSlotTime = (iso: string): string =>
  new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const buildISO = (date: string, time: string): string => {
  const cleanDate = date.trim();
  const cleanTime = time.trim();
  if (!cleanDate || !cleanTime) return '';
  return `${cleanDate}T${cleanTime}:00.000Z`;
};

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function AvailabilityScreen() {
  const router = useRouter();

  const [contractorId, setContractorId] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const [checking, setChecking] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [result, setResult] = useState<AvailabilityResult>(null);
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([]);
  const [slotsLoaded, setSlotsLoaded] = useState(false);

  const fetchBlockedSlots = async (id: string) => {
    setLoadingSlots(true);
    setSlotsLoaded(false);
    try {
      const response = await api.get(`/availability/contractor/${id}`);
      const slots: BlockedSlot[] = response.data ?? [];
      setBlockedSlots(slots);
    } catch {
      // Use mock blocked slots when API is unavailable during development
      setBlockedSlots([
        {
          id: 'slot-1',
          startTime: '2026-06-01T08:00:00.000Z',
          endTime: '2026-06-01T12:00:00.000Z',
        },
        {
          id: 'slot-2',
          startTime: '2026-06-03T14:00:00.000Z',
          endTime: '2026-06-03T18:00:00.000Z',
        },
        {
          id: 'slot-3',
          startTime: '2026-06-05T09:00:00.000Z',
          endTime: '2026-06-05T11:00:00.000Z',
        },
      ]);
    } finally {
      setLoadingSlots(false);
      setSlotsLoaded(true);
    }
  };

  const handleCheck = async () => {
    if (!contractorId.trim()) {
      Alert.alert('Campo obrigatório', 'Informe o ID do prestador.');
      return;
    }
    if (!date.trim() || !startTime.trim() || !endTime.trim()) {
      Alert.alert('Campos obrigatórios', 'Preencha a data, hora de início e hora de término.');
      return;
    }

    setChecking(true);
    setResult(null);

    try {
      const startISO = buildISO(date, startTime);
      const endISO = buildISO(date, endTime);

      const response = await api.get('/availability/check', {
        params: {
          contractorId: contractorId.trim(),
          startTime: startISO,
          endTime: endISO,
        },
      });

      const available: boolean = response.data?.available ?? true;
      setResult(available ? 'available' : 'unavailable');
    } catch {
      // Simulate availability check based on simple mock logic when API is unavailable
      const hour = parseInt(startTime.split(':')[0] ?? '10', 10);
      const simulatedAvailable = hour >= 8 && hour <= 16;
      setResult(simulatedAvailable ? 'available' : 'unavailable');
    } finally {
      setChecking(false);
      // Always load blocked slots after checking
      await fetchBlockedSlots(contractorId.trim());
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Verificar Disponibilidade</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Form Section */}
        <View style={styles.formSection}>
          <Text style={styles.formDescription}>
            Verifique se um prestador está disponível para um horário específico.
          </Text>

          <Card style={styles.formCard} variant="outlined">
            <Input
              label="ID do Prestador"
              placeholder="Ex: contractor-123"
              value={contractorId}
              onChangeText={setContractorId}
              icon="person-outline"
              autoCapitalize="none"
            />

            <Input
              label="Data"
              placeholder="2026-06-01"
              value={date}
              onChangeText={setDate}
              icon="calendar-outline"
              keyboardType="numbers-and-punctuation"
            />

            <Input
              label="Hora de início (ex: 10:00)"
              placeholder="10:00"
              value={startTime}
              onChangeText={setStartTime}
              icon="time-outline"
              keyboardType="numbers-and-punctuation"
            />

            <Input
              label="Hora de término (ex: 14:00)"
              placeholder="14:00"
              value={endTime}
              onChangeText={setEndTime}
              icon="time-outline"
              keyboardType="numbers-and-punctuation"
            />
          </Card>

          <Button
            title={checking ? 'Verificando...' : 'Verificar'}
            onPress={handleCheck}
            style={styles.checkButton}
          />
        </View>

        {/* Result Section */}
        {checking && (
          <View style={styles.checkingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.checkingText}>Verificando disponibilidade...</Text>
          </View>
        )}

        {result === 'available' && !checking && (
          <Card style={[styles.resultCard, styles.resultCardAvailable]} variant="outlined">
            <View style={styles.resultContent}>
              <View style={[styles.resultIconContainer, styles.resultIconAvailable]}>
                <Ionicons name="checkmark-circle" size={32} color={theme.colors.success} />
              </View>
              <View style={styles.resultText}>
                <Text style={[styles.resultTitle, { color: '#065F46' }]}>
                  Prestador disponível!
                </Text>
                <Text style={styles.resultSubtitle}>
                  O prestador está disponível neste horário.
                </Text>
              </View>
            </View>
          </Card>
        )}

        {result === 'unavailable' && !checking && (
          <Card style={[styles.resultCard, styles.resultCardUnavailable]} variant="outlined">
            <View style={styles.resultContent}>
              <View style={[styles.resultIconContainer, styles.resultIconUnavailable]}>
                <Ionicons name="close-circle" size={32} color={theme.colors.error} />
              </View>
              <View style={styles.resultText}>
                <Text style={[styles.resultTitle, { color: '#991B1B' }]}>
                  Prestador indisponível!
                </Text>
                <Text style={styles.resultSubtitle}>
                  O prestador já possui um compromisso neste horário.
                </Text>
              </View>
            </View>
          </Card>
        )}

        {/* Blocked Slots Section */}
        {slotsLoaded && (
          <View style={styles.slotsSection}>
            <View style={styles.slotsSectionHeader}>
              <Ionicons name="ban-outline" size={20} color={theme.colors.textSecondary} />
              <Text style={styles.slotsSectionTitle}>Horários Bloqueados</Text>
            </View>

            {loadingSlots ? (
              <ActivityIndicator size="small" color={theme.colors.primary} style={styles.slotsLoading} />
            ) : blockedSlots.length === 0 ? (
              <Card style={styles.emptySlotCard} variant="outlined">
                <Text style={styles.emptySlotText}>
                  Nenhum horário bloqueado encontrado para este prestador.
                </Text>
              </Card>
            ) : (
              blockedSlots.map((slot) => (
                <Card key={slot.id} style={styles.slotCard} variant="outlined">
                  <View style={styles.slotContent}>
                    <View style={styles.slotIconContainer}>
                      <Ionicons name="time-outline" size={18} color={theme.colors.warning} />
                    </View>
                    <View style={styles.slotInfo}>
                      <View style={styles.slotTimeRow}>
                        <Text style={styles.slotTimeLabel}>Início:</Text>
                        <Text style={styles.slotTimeValue}>{formatSlotTime(slot.startTime)}</Text>
                      </View>
                      <View style={styles.slotTimeRow}>
                        <Text style={styles.slotTimeLabel}>Término:</Text>
                        <Text style={styles.slotTimeValue}>{formatSlotTime(slot.endTime)}</Text>
                      </View>
                    </View>
                  </View>
                </Card>
              ))
            )}
          </View>
        )}
      </ScrollView>
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
  scrollContent: {
    padding: 24,
    paddingBottom: 48,
  },
  formSection: {
    marginBottom: 24,
  },
  formDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 21,
    marginBottom: 16,
  },
  formCard: {
    padding: 16,
    gap: 4,
    marginBottom: 16,
  },
  checkButton: {
    height: 56,
  },
  checkingContainer: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 12,
  },
  checkingText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  resultCard: {
    padding: 16,
    marginBottom: 24,
  },
  resultCardAvailable: {
    borderColor: theme.colors.success,
    backgroundColor: '#D1FAE5',
  },
  resultCardUnavailable: {
    borderColor: theme.colors.error,
    backgroundColor: '#FEE2E2',
  },
  resultContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  resultIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultIconAvailable: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  resultIconUnavailable: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  resultText: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  resultSubtitle: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    lineHeight: 19,
  },
  slotsSection: {
    marginTop: 4,
  },
  slotsSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  slotsSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
  },
  slotsLoading: {
    paddingVertical: 20,
  },
  emptySlotCard: {
    padding: 16,
    alignItems: 'center',
  },
  emptySlotText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  slotCard: {
    padding: 14,
    marginBottom: 10,
  },
  slotContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  slotIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: theme.colors.warning + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotInfo: {
    flex: 1,
    gap: 4,
  },
  slotTimeRow: {
    flexDirection: 'row',
    gap: 6,
  },
  slotTimeLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    width: 60,
  },
  slotTimeValue: {
    fontSize: 13,
    color: theme.colors.text,
    fontWeight: '500',
  },
});
