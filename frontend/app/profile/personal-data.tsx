import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../src/theme/theme';
import { Input } from '../../src/components/Input';
import { Button } from '../../src/components/Button';

export default function PersonalDataScreen() {
  const router = useRouter();
  const [name, setName] = useState('Emerson Silva');
  const [email, setEmail] = useState('emerson@email.com');
  const [phone, setPhone] = useState('(11) 98765-4321');
  const [cpf, setCpf] = useState('123.456.789-00');

  const handleSave = () => {
    Alert.alert('Sucesso', 'Seus dados foram atualizados com sucesso!', [
      { text: 'OK', onPress: () => router.back() }
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dados Pessoais</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{name.charAt(0)}</Text>
          </View>
          <TouchableOpacity style={styles.editAvatarBtn}>
            <Ionicons name="camera" size={16} color="#FFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          <Input label="Nome Completo" value={name} onChangeText={setName} icon="person-outline" />
          <Input label="E-mail" value={email} onChangeText={setEmail} icon="mail-outline" keyboardType="email-address" />
          <Input label="Telefone" value={phone} onChangeText={setPhone} icon="call-outline" keyboardType="phone-pad" />
          <Input label="CPF" value={cpf} onChangeText={setCpf} icon="document-text-outline" keyboardType="numeric" />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button title="Salvar Alterações" onPress={handleSave} />
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
  avatarContainer: { alignSelf: 'center', marginBottom: 32, position: 'relative' },
  avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 36, fontWeight: 'bold', color: '#FFF' },
  editAvatarBtn: { position: 'absolute', bottom: 0, right: 0, width: 32, height: 32, borderRadius: 16, backgroundColor: theme.colors.secondary, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: theme.colors.background },
  form: { backgroundColor: theme.colors.surface, padding: 24, borderRadius: 24, ...theme.shadows.sm },
  footer: { padding: 24, backgroundColor: theme.colors.background, borderTopWidth: 1, borderTopColor: theme.colors.border },
});
