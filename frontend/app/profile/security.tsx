import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../src/theme/theme';
import { Input } from '../../src/components/Input';
import { Button } from '../../src/components/Button';

export default function SecurityScreen() {
  const router = useRouter();
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [twoFactor, setTwoFactor] = useState(true);

  const handleUpdate = () => {
    Alert.alert('Sucesso', 'Configurações de segurança atualizadas!', [
      { text: 'OK', onPress: () => router.back() }
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Segurança</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>Alterar Senha</Text>
        <View style={styles.formCard}>
          <Input label="Senha Atual" value={currentPass} onChangeText={setCurrentPass} secureTextEntry icon="lock-closed-outline" />
          <Input label="Nova Senha" value={newPass} onChangeText={setNewPass} secureTextEntry icon="key-outline" />
          <Input label="Confirmar Nova Senha" value={confirmPass} onChangeText={setConfirmPass} secureTextEntry icon="checkmark-circle-outline" />
        </View>

        <Text style={[styles.sectionTitle, { marginTop: 32 }]}>Proteção Adicional</Text>
        <View style={styles.settingCard}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Autenticação em 2 Fatores</Text>
            <Text style={styles.settingDesc}>Exigir um código via SMS ao fazer login em novos dispositivos.</Text>
          </View>
          <Switch
            value={twoFactor}
            onValueChange={setTwoFactor}
            trackColor={{ false: theme.colors.border, true: theme.colors.primary + '50' }}
            thumbColor={twoFactor ? theme.colors.primary : '#f4f3f4'}
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button title="Atualizar Segurança" onPress={handleUpdate} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 50, paddingHorizontal: 24, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  backButton: { width: 40, height: 40, borderRadius: 12, backgroundColor: theme.colors.surface, alignItems: 'center', justifyContent: 'center', marginRight: 16, ...theme.shadows.sm },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: theme.colors.text },
  scrollContent: { padding: 24, paddingBottom: 100 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.text, marginBottom: 16 },
  formCard: { backgroundColor: theme.colors.surface, padding: 24, borderRadius: 24, ...theme.shadows.sm },
  settingCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surface, padding: 16, borderRadius: 16, ...theme.shadows.sm },
  settingInfo: { flex: 1, marginRight: 16 },
  settingTitle: { fontSize: 16, fontWeight: 'bold', color: theme.colors.text, marginBottom: 4 },
  settingDesc: { fontSize: 13, color: theme.colors.textSecondary, lineHeight: 18 },
  footer: { padding: 24, backgroundColor: theme.colors.background, borderTopWidth: 1, borderTopColor: theme.colors.border },
});
