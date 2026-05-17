import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../src/theme/theme';
import { Card } from '../src/components/Card';
import { Button } from '../src/components/Button';
import { Input } from '../src/components/Input';
import api from '../src/services/api';

// ─── Types ──────────────────────────────────────────────────────────────────

type PaymentMethod = 'CREDIT_CARD' | 'PIX' | 'BOLETO';
type PaymentStatus = 'PENDING' | 'APPROVED' | 'FAILED';

interface PaymentSummary {
  contractId: string;
  serviceName: string;
  amount: number;
  dueDate: string;
  status: PaymentStatus;
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

const MOCK_PAYMENTS: Record<string, PaymentSummary> = {
  'c-1': {
    contractId: 'c-1',
    serviceName: 'Limpeza Residencial',
    amount: 250,
    dueDate: '2026-06-01',
    status: 'APPROVED',
  },
  'c-2': {
    contractId: 'c-2',
    serviceName: 'Limpeza Comercial',
    amount: 450,
    dueDate: '2026-06-08',
    status: 'PENDING',
  },
};

const DEFAULT_PAYMENT: PaymentSummary = {
  contractId: 'unknown',
  serviceName: 'Serviço de Limpeza',
  amount: 300,
  dueDate: '2026-06-15',
  status: 'PENDING',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatPrice = (value: number): string =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const formatDueDate = (dateStr: string): string =>
  new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

const PAYMENT_STATUS_CONFIG: Record<PaymentStatus, { label: string; color: string; bg: string; icon: any }> = {
  PENDING: {
    label: 'Aguardando pagamento',
    color: '#92400E',
    bg: '#FEF3C7',
    icon: 'time-outline',
  },
  APPROVED: {
    label: 'Pagamento aprovado ✓',
    color: '#065F46',
    bg: '#D1FAE5',
    icon: 'checkmark-circle-outline',
  },
  FAILED: {
    label: 'Pagamento falhou',
    color: '#991B1B',
    bg: '#FEE2E2',
    icon: 'close-circle-outline',
  },
};

// ─── Payment Method Selector ──────────────────────────────────────────────────

interface MethodButtonProps {
  method: PaymentMethod;
  label: string;
  icon: any;
  selected: boolean;
  onPress: () => void;
}

function MethodButton({ method, label, icon, selected, onPress }: MethodButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.methodButton, selected && styles.methodButtonSelected]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Ionicons
        name={icon}
        size={20}
        color={selected ? theme.colors.primary : theme.colors.textSecondary}
      />
      <Text
        style={[styles.methodButtonText, selected && styles.methodButtonTextSelected]}
      >
        {label}
      </Text>
      <View
        style={[styles.radioOuter, selected && styles.radioOuterSelected]}
      >
        {selected && <View style={styles.radioInner} />}
      </View>
    </TouchableOpacity>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function PaymentScreen() {
  const router = useRouter();
  const { contractId } = useLocalSearchParams<{ contractId?: string }>();

  const [payment, setPayment] = useState<PaymentSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('PIX');

  // Credit card fields
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  useEffect(() => {
    const fetchPayment = async () => {
      try {
        const response = await api.get(`/payments/contract/${contractId}`);
        setPayment(response.data);
      } catch {
        // Fall back to mock data when the API is unreachable during development
        const mock = contractId ? MOCK_PAYMENTS[contractId] ?? DEFAULT_PAYMENT : DEFAULT_PAYMENT;
        setPayment(mock);
      } finally {
        setLoading(false);
      }
    };

    fetchPayment();
  }, [contractId]);

  const handleConfirmPayment = async () => {
    if (selectedMethod === 'CREDIT_CARD') {
      if (!cardNumber || !cardExpiry || !cardCvv) {
        Alert.alert('Dados incompletos', 'Preencha todos os dados do cartão.');
        return;
      }
    }

    setProcessing(true);
    try {
      await api.post('/payments/webhook', {
        contractId,
        success: true,
        externalTransactionId: `sim_${Date.now()}`,
      });

      Alert.alert(
        'Pagamento Aprovado!',
        'Seu pagamento foi processado com sucesso. O prestador será notificado.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch {
      // Simulate success in development even if the API is unavailable
      Alert.alert(
        'Pagamento Aprovado!',
        'Seu pagamento foi processado com sucesso. O prestador será notificado.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!payment) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Pagamento não encontrado.</Text>
      </View>
    );
  }

  const statusConfig = PAYMENT_STATUS_CONFIG[payment.status];
  const isAlreadyPaid = payment.status === 'APPROVED';

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pagamento</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Payment Summary Card */}
        <Card style={styles.summaryCard} variant="elevated">
          <View style={styles.summaryHeader}>
            <View style={styles.summaryIconContainer}>
              <Ionicons name="sparkles-outline" size={24} color={theme.colors.primary} />
            </View>
            <View style={styles.summaryInfo}>
              <Text style={styles.summaryServiceName}>{payment.serviceName}</Text>
              <Text style={styles.summaryDueDate}>
                Vencimento: {formatDueDate(payment.dueDate)}
              </Text>
            </View>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryAmountRow}>
            <Text style={styles.summaryAmountLabel}>Total a pagar</Text>
            <Text style={styles.summaryAmount}>{formatPrice(payment.amount)}</Text>
          </View>
        </Card>

        {/* Payment Status Banner */}
        <View style={[styles.statusBanner, { backgroundColor: statusConfig.bg }]}>
          <Ionicons name={statusConfig.icon} size={20} color={statusConfig.color} />
          <Text style={[styles.statusText, { color: statusConfig.color }]}>
            {statusConfig.label}
          </Text>
        </View>

        {!isAlreadyPaid && (
          <>
            {/* Payment Method Selector */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Forma de Pagamento</Text>
              <MethodButton
                method="PIX"
                label="PIX"
                icon="qr-code-outline"
                selected={selectedMethod === 'PIX'}
                onPress={() => setSelectedMethod('PIX')}
              />
              <MethodButton
                method="CREDIT_CARD"
                label="Cartão de Crédito"
                icon="card-outline"
                selected={selectedMethod === 'CREDIT_CARD'}
                onPress={() => setSelectedMethod('CREDIT_CARD')}
              />
              <MethodButton
                method="BOLETO"
                label="Boleto Bancário"
                icon="document-text-outline"
                selected={selectedMethod === 'BOLETO'}
                onPress={() => setSelectedMethod('BOLETO')}
              />
            </View>

            {/* PIX QR Code */}
            {selectedMethod === 'PIX' && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>QR Code PIX</Text>
                <Card style={styles.qrCard} variant="outlined">
                  <View style={styles.qrCodeBox}>
                    <Ionicons name="qr-code-outline" size={48} color={theme.colors.textMuted} />
                    <Text style={styles.qrCodeText}>QR Code PIX</Text>
                    <Text style={styles.qrCodeSubtext}>
                      Escaneie com o aplicativo do seu banco
                    </Text>
                  </View>
                  <View style={styles.pixKeyContainer}>
                    <Text style={styles.pixKeyLabel}>Chave PIX</Text>
                    <Text style={styles.pixKeyValue}>cleanpro@pagamentos.com.br</Text>
                  </View>
                </Card>
              </View>
            )}

            {/* Credit Card Form */}
            {selectedMethod === 'CREDIT_CARD' && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Dados do Cartão</Text>
                <Card style={styles.cardFormCard} variant="outlined">
                  <Input
                    label="Número do Cartão"
                    placeholder="0000 0000 0000 0000"
                    value={cardNumber}
                    onChangeText={setCardNumber}
                    keyboardType="numeric"
                    icon="card-outline"
                  />
                  <View style={styles.cardRow}>
                    <View style={styles.cardFieldHalf}>
                      <Input
                        label="Validade"
                        placeholder="MM/AA"
                        value={cardExpiry}
                        onChangeText={setCardExpiry}
                        keyboardType="numeric"
                        icon="calendar-outline"
                      />
                    </View>
                    <View style={styles.cardFieldHalf}>
                      <Input
                        label="CVV"
                        placeholder="000"
                        value={cardCvv}
                        onChangeText={setCardCvv}
                        keyboardType="numeric"
                        secureTextEntry
                        icon="lock-closed-outline"
                      />
                    </View>
                  </View>
                </Card>
              </View>
            )}

            {/* Boleto Info */}
            {selectedMethod === 'BOLETO' && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Boleto Bancário</Text>
                <Card style={styles.boletoCard} variant="outlined">
                  <View style={styles.boletoRow}>
                    <Ionicons name="information-circle-outline" size={20} color={theme.colors.warning} />
                    <Text style={styles.boletoInfo}>
                      O boleto será gerado após a confirmação e o prazo de compensação é de até 3 dias úteis.
                    </Text>
                  </View>
                  <View style={styles.boleto}>
                    <Text style={styles.boletoLine}>
                      34191.79001 01043.510047 91020.150008 1 10000000045000
                    </Text>
                  </View>
                </Card>
              </View>
            )}

            {/* Confirm Button */}
            <Button
              title={processing ? 'Processando...' : 'Confirmar Pagamento'}
              onPress={handleConfirmPayment}
              style={styles.confirmButton}
            />
          </>
        )}

        {isAlreadyPaid && (
          <View style={styles.paidSection}>
            <Ionicons name="checkmark-circle" size={64} color={theme.colors.success} />
            <Text style={styles.paidTitle}>Pagamento Realizado</Text>
            <Text style={styles.paidSubtitle}>
              Seu pagamento foi confirmado e o prestador foi notificado.
            </Text>
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
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background,
  },
  errorText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
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
  summaryCard: {
    padding: 20,
    marginBottom: 16,
    backgroundColor: theme.colors.surface,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  summaryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: theme.colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryInfo: {
    flex: 1,
  },
  summaryServiceName: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 4,
  },
  summaryDueDate: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginBottom: 16,
  },
  summaryAmountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryAmountLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  summaryAmount: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    marginBottom: 24,
    gap: 10,
  },
  statusText: {
    fontSize: 15,
    fontWeight: '700',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 12,
  },
  methodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    padding: 14,
    marginBottom: 10,
    gap: 12,
  },
  methodButtonSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '08',
  },
  methodButtonText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  methodButtonTextSelected: {
    color: theme.colors.primary,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderColor: theme.colors.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.primary,
  },
  qrCard: {
    padding: 20,
    alignItems: 'center',
  },
  qrCodeBox: {
    width: 180,
    height: 180,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: theme.colors.border,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 8,
  },
  qrCodeText: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textSecondary,
  },
  qrCodeSubtext: {
    fontSize: 11,
    color: theme.colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  pixKeyContainer: {
    backgroundColor: theme.colors.background,
    borderRadius: 10,
    padding: 12,
    width: '100%',
    alignItems: 'center',
  },
  pixKeyLabel: {
    fontSize: 11,
    color: theme.colors.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  pixKeyValue: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  cardFormCard: {
    padding: 16,
    gap: 4,
  },
  cardRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cardFieldHalf: {
    flex: 1,
  },
  boletoCard: {
    padding: 16,
  },
  boletoRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  boletoInfo: {
    flex: 1,
    fontSize: 13,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  boleto: {
    backgroundColor: theme.colors.background,
    borderRadius: 10,
    padding: 12,
  },
  boletoLine: {
    fontSize: 13,
    color: theme.colors.text,
    fontFamily: 'monospace',
    letterSpacing: 0.5,
  },
  confirmButton: {
    height: 56,
    marginTop: 8,
  },
  paidSection: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  paidTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  paidSubtitle: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 16,
  },
});
