import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Image,
  Alert 
} from 'react-native';
import { theme } from '../../src/theme/theme';
import { useAuth } from '../../src/context/AuthContext';
import { Card } from '../../src/components/Card';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function Profile() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair da sua conta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Sair', 
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/(auth)/login');
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {user?.name.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
          </Text>
        </View>
        <Text style={styles.userName}>{user?.name || 'Usuário'}</Text>
        <Text style={styles.userEmail}>{user?.email || 'email@exemplo.com'}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>
            {user?.userType === 'CONTRACTOR' ? 'Profissional' : 'Cliente'}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Minha Conta</Text>
        <Card style={styles.optionsCard}>
          <ProfileOption icon="person-outline" title="Dados Pessoais" onPress={() => router.push('/coming-soon?title=Dados Pessoais')} />
          <ProfileOption icon="location-outline" title="Meus Endereços" onPress={() => router.push('/coming-soon?title=Meus Endereços')} />
          <ProfileOption icon="card-outline" title="Pagamentos" onPress={() => router.push('/coming-soon?title=Pagamentos')} />
          <ProfileOption icon="shield-checkmark-outline" title="Segurança" border={false} onPress={() => router.push('/coming-soon?title=Segurança')} />
        </Card>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferências</Text>
        <Card style={styles.optionsCard}>
          <ProfileOption icon="notifications-outline" title="Notificações" onPress={() => router.push('/coming-soon?title=Notificações')} />
          <ProfileOption icon="moon-outline" title="Modo Escuro" onPress={() => router.push('/coming-soon?title=Modo Escuro')} />
          <ProfileOption icon="help-circle-outline" title="Ajuda & Suporte" border={false} onPress={() => router.push('/coming-soon?title=Ajuda & Suporte')} />
        </Card>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color={theme.colors.error} />
        <Text style={styles.logoutText}>Sair da Conta</Text>
      </TouchableOpacity>

      <Text style={styles.versionText}>Versão 1.0.0 (Beta)</Text>
    </ScrollView>
  );
}

function ProfileOption({ icon, title, border = true, onPress }: { icon: any; title: string; border?: boolean; onPress?: () => void }) {
  return (
    <TouchableOpacity style={[styles.optionItem, border && styles.optionBorder]} onPress={onPress}>
      <View style={styles.optionContent}>
        <Ionicons name={icon} size={22} color={theme.colors.textSecondary} />
        <Text style={styles.optionTitle}>{title}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    ...theme.shadows.md,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFF',
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  userEmail: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  roleBadge: {
    backgroundColor: theme.colors.primary + '15',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 12,
  },
  roleText: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 12,
    marginLeft: 4,
  },
  optionsCard: {
    padding: 0,
    overflow: 'hidden',
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  optionBorder: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionTitle: {
    fontSize: 15,
    color: theme.colors.text,
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
    paddingVertical: 16,
  },
  logoutText: {
    color: theme.colors.error,
    fontSize: 16,
    fontWeight: '700',
  },
  versionText: {
    textAlign: 'center',
    color: theme.colors.textMuted,
    fontSize: 12,
    marginTop: 24,
  },
});
