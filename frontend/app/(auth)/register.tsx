import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView, 
  TouchableOpacity,
  Alert 
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { theme } from '../../src/theme/theme';
import { Input } from '../../src/components/Input';
import { Button } from '../../src/components/Button';
import { Ionicons } from '@expo/vector-icons';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState<'CUSTOMER' | 'CONTRACTOR'>('CUSTOMER');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    setLoading(true);
    try {
      await signUp({ name, email, password, role: userType });
      Alert.alert('Sucesso', 'Conta criada com sucesso! Faça login para continuar.', [
        { text: 'OK', onPress: () => router.replace('/(auth)/login') }
      ]);
    } catch (error: any) {
      Alert.alert('Erro no Cadastro', error.response?.data?.message || 'Não foi possível criar sua conta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Criar Conta</Text>
          <Text style={styles.subtitle}>Junte-se à maior rede de limpeza</Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Nome Completo"
            placeholder="Seu nome"
            value={name}
            onChangeText={setName}
            icon="person-outline"
          />

          <Input
            label="Email"
            placeholder="seu@email.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            icon="mail-outline"
          />

          <Input
            label="Senha"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            icon="lock-closed-outline"
          />

          <View style={styles.typeContainer}>
            <Text style={styles.label}>Eu sou um:</Text>
            <View style={styles.typeButtons}>
              <TouchableOpacity 
                style={[
                  styles.typeButton, 
                  userType === 'CUSTOMER' && styles.typeButtonActive
                ]}
                onPress={() => setUserType('CUSTOMER')}
              >
                <Ionicons 
                  name="home" 
                  size={20} 
                  color={userType === 'CUSTOMER' ? '#FFF' : theme.colors.primary} 
                />
                <Text style={[
                  styles.typeButtonText,
                  userType === 'CUSTOMER' && styles.typeButtonTextActive
                ]}>Cliente</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[
                  styles.typeButton, 
                  userType === 'CONTRACTOR' && styles.typeButtonActive
                ]}
                onPress={() => setUserType('CONTRACTOR')}
              >
                <Ionicons 
                  name="briefcase" 
                  size={20} 
                  color={userType === 'CONTRACTOR' ? '#FFF' : theme.colors.primary} 
                />
                <Text style={[
                  styles.typeButtonText,
                  userType === 'CONTRACTOR' && styles.typeButtonTextActive
                ]}>Profissional</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Button 
            title="Cadastrar" 
            onPress={handleRegister} 
            loading={loading}
            style={styles.submitButton}
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Já tem uma conta? </Text>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity>
                <Text style={styles.linkText}>Faça login</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  header: {
    marginTop: 40,
    marginBottom: 32,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    ...theme.shadows.sm,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  form: {
    backgroundColor: theme.colors.surface,
    borderRadius: 24,
    padding: 24,
    ...theme.shadows.sm,
  },
  typeContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: 12,
    marginLeft: 4,
  },
  typeButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    gap: 8,
  },
  typeButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  typeButtonText: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  typeButtonTextActive: {
    color: '#FFF',
  },
  submitButton: {
    height: 56,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
  linkText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
});
