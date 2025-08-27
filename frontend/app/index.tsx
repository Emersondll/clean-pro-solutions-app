import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Image,
  Alert,
  Platform,
  TextInput as RNTextInput
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

// Types
interface User {
  id: string;
  email: string;
  name: string;
  user_type: 'customer' | 'professional' | 'admin';
  avatar?: string;
}

interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  base_price: number;
  unit: string;
  icon?: string;
}

interface Job {
  id: string;
  title: string;
  description: string;
  status: string;
  scheduled_date: string;
  budget_min: number;
  budget_max: number;
  location: {
    city: string;
    state: string;
  };
}

// API Configuration
const API_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

// API Helper
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const token = await AsyncStorage.getItem('auth_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}/api${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Network error' }));
    throw new Error(error.detail || 'API Error');
  }

  return response.json();
};

// Main App Component
export default function LimpezaProApp() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeScreen, setActiveScreen] = useState<'home' | 'auth' | 'profile' | 'jobs'>('home');

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (token) {
        const userData = await apiCall('/auth/me');
        setUser(userData);
      }
    } catch (error) {
      console.log('Not authenticated');
      await AsyncStorage.removeItem('auth_token');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <AuthScreen onAuthSuccess={setUser} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      {activeScreen === 'home' && <HomeScreen user={user} />}
      {activeScreen === 'jobs' && <JobsScreen user={user} />}
      {activeScreen === 'profile' && <ProfileScreen user={user} onLogout={() => {
        setUser(null);
        AsyncStorage.removeItem('auth_token');
      }} />}
      
      <BottomNavigation 
        activeScreen={activeScreen} 
        onScreenChange={setActiveScreen}
        userType={user.user_type}
      />
    </SafeAreaView>
  );
}

// Loading Screen
function LoadingScreen() {
  return (
    <View style={styles.centerContainer}>
      <Ionicons name="cleaning" size={60} color="#4CAF50" />
      <Text style={styles.loadingText}>LimpezaPro</Text>
    </View>
  );
}

// Auth Screen
function AuthScreen({ onAuthSuccess }: { onAuthSuccess: (user: User) => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    user_type: 'customer' as 'customer' | 'professional'
  });

  const handleAuth = async () => {
    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const payload = isLogin 
        ? { email: formData.email, password: formData.password }
        : formData;

      const response = await apiCall(endpoint, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      await AsyncStorage.setItem('auth_token', response.token);
      onAuthSuccess(response.user);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.authContainer}>
      <View style={styles.authHeader}>
        <Ionicons name="cleaning" size={80} color="#4CAF50" />
        <Text style={styles.appTitle}>LimpezaPro</Text>
        <Text style={styles.appSubtitle}>
          Conectando você aos melhores profissionais de limpeza
        </Text>
      </View>

      <View style={styles.authForm}>
        <Text style={styles.authTitle}>
          {isLogin ? 'Entrar' : 'Criar Conta'}
        </Text>

        {!isLogin && (
          <>
            <TextInput
              placeholder="Nome completo"
              value={formData.name}
              onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
            />
            
            <View style={styles.userTypeContainer}>
              <Text style={styles.label}>Tipo de usuário:</Text>
              <View style={styles.userTypeButtons}>
                <TouchableOpacity
                  style={[
                    styles.userTypeButton,
                    formData.user_type === 'customer' && styles.userTypeButtonActive
                  ]}
                  onPress={() => setFormData(prev => ({ ...prev, user_type: 'customer' }))}
                >
                  <Ionicons name="home" size={20} color={formData.user_type === 'customer' ? '#FFF' : '#4CAF50'} />
                  <Text style={[
                    styles.userTypeText,
                    formData.user_type === 'customer' && styles.userTypeTextActive
                  ]}>
                    Cliente
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.userTypeButton,
                    formData.user_type === 'professional' && styles.userTypeButtonActive
                  ]}
                  onPress={() => setFormData(prev => ({ ...prev, user_type: 'professional' }))}
                >
                  <Ionicons name="briefcase" size={20} color={formData.user_type === 'professional' ? '#FFF' : '#4CAF50'} />
                  <Text style={[
                    styles.userTypeText,
                    formData.user_type === 'professional' && styles.userTypeTextActive
                  ]}>
                    Profissional
                  </Text>
                </TouchableOpacity>
              </div>
            </View>
          </>
        )}

        <TextInput
          placeholder="Email"
          value={formData.email}
          onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          placeholder="Senha"
          value={formData.password}
          onChangeText={(text) => setFormData(prev => ({ ...prev, password: text }))}
          secureTextEntry
        />

        <TouchableOpacity style={styles.authButton} onPress={handleAuth}>
          <Text style={styles.authButtonText}>
            {isLogin ? 'Entrar' : 'Criar Conta'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.switchAuthButton}
          onPress={() => setIsLogin(!isLogin)}
        >
          <Text style={styles.switchAuthText}>
            {isLogin ? 'Não tem conta? Criar uma' : 'Já tem conta? Entrar'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// Simple TextInput Component
function TextInput({ style, ...props }: any) {
  return (
    <View style={[styles.inputContainer, style]}>
      <Text style={styles.inputText} {...props} />
    </View>
  );
}

// Home Screen
function HomeScreen({ user }: { user: User }) {
  const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>([]);
  const [stats, setStats] = useState<any>({});

  useEffect(() => {
    loadServiceCategories();
    loadStats();
  }, []);

  const loadServiceCategories = async () => {
    try {
      const categories = await apiCall('/services/categories');
      setServiceCategories(categories);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await apiCall('/dashboard/stats');
      setStats(statsData);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const seedCategories = async () => {
    try {
      await apiCall('/seed/categories', { method: 'POST' });
      loadServiceCategories();
      Alert.alert('Sucesso', 'Categorias de serviço carregadas!');
    } catch (error) {
      Alert.alert('Erro', error.message);
    }
  };

  return (
    <ScrollView style={styles.screenContainer}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>
          Olá, {user.name}! 👋
        </Text>
        <Text style={styles.userTypeText}>
          {user.user_type === 'customer' ? 'Cliente' : 'Profissional'}
        </Text>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        {user.user_type === 'customer' ? (
          <>
            <StatsCard title="Total de Jobs" value={stats.total_jobs || 0} icon="briefcase" />
            <StatsCard title="Jobs Ativos" value={stats.active_jobs || 0} icon="time" />
            <StatsCard title="Concluídos" value={stats.completed_jobs || 0} icon="checkmark-circle" />
          </>
        ) : (
          <>
            <StatsCard title="Jobs Realizados" value={stats.total_jobs || 0} icon="briefcase" />
            <StatsCard title="Avaliação" value={stats.rating?.toFixed(1) || '0.0'} icon="star" />
            <StatsCard title="Concluídos" value={stats.completed_jobs || 0} icon="checkmark-circle" />
          </>
        )}
      </View>

      {/* Service Categories */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Categorias de Serviço</Text>
          {serviceCategories.length === 0 && (
            <TouchableOpacity style={styles.seedButton} onPress={seedCategories}>
              <Text style={styles.seedButtonText}>Carregar Dados</Text>
            </TouchableOpacity>
          )}
        </View>

        {serviceCategories.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
            {serviceCategories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </ScrollView>
        ) : (
          <Text style={styles.emptyText}>
            Nenhuma categoria encontrada. Toque em "Carregar Dados" para inicializar.
          </Text>
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ações Rápidas</Text>
        <View style={styles.quickActions}>
          {user.user_type === 'customer' ? (
            <>
              <QuickActionButton 
                icon="add-circle" 
                title="Novo Job" 
                subtitle="Postar serviço"
                onPress={() => Alert.alert('Info', 'Funcionalidade em desenvolvimento')}
              />
              <QuickActionButton 
                icon="search" 
                title="Buscar" 
                subtitle="Profissionais"
                onPress={() => Alert.alert('Info', 'Funcionalidade em desenvolvimento')}
              />
            </>
          ) : (
            <>
              <QuickActionButton 
                icon="person-add" 
                title="Perfil" 
                subtitle="Completar perfil"
                onPress={() => Alert.alert('Info', 'Funcionalidade em desenvolvimento')}
              />
              <QuickActionButton 
                icon="briefcase" 
                title="Jobs" 
                subtitle="Disponíveis"
                onPress={() => Alert.alert('Info', 'Funcionalidade em desenvolvimento')}
              />
            </>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

// Jobs Screen
function JobsScreen({ user }: { user: User }) {
  const [jobs, setJobs] = useState<Job[]>([]);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      const jobsData = await apiCall('/jobs');
      setJobs(jobsData);
    } catch (error) {
      console.error('Error loading jobs:', error);
    }
  };

  return (
    <ScrollView style={styles.screenContainer}>
      <Text style={styles.screenTitle}>
        {user.user_type === 'customer' ? 'Meus Jobs' : 'Jobs Disponíveis'}
      </Text>

      {jobs.length > 0 ? (
        jobs.map((job) => (
          <JobCard key={job.id} job={job} userType={user.user_type} />
        ))
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="briefcase-outline" size={60} color="#CCC" />
          <Text style={styles.emptyText}>
            {user.user_type === 'customer' 
              ? 'Você ainda não tem jobs postados' 
              : 'Nenhum job disponível no momento'
            }
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

// Profile Screen
function ProfileScreen({ user, onLogout }: { user: User; onLogout: () => void }) {
  return (
    <ScrollView style={styles.screenContainer}>
      <Text style={styles.screenTitle}>Perfil</Text>

      <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          {user.avatar ? (
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={40} color="#FFF" />
            </View>
          )}
        </View>

        <Text style={styles.profileName}>{user.name}</Text>
        <Text style={styles.profileEmail}>{user.email}</Text>
        <Text style={styles.profileType}>
          {user.user_type === 'customer' ? 'Cliente' : 'Profissional'}
        </Text>
      </View>

      <View style={styles.profileOptions}>
        <ProfileOption icon="person-circle" title="Editar Perfil" />
        <ProfileOption icon="settings" title="Configurações" />
        <ProfileOption icon="help-circle" title="Ajuda" />
        <ProfileOption icon="information-circle" title="Sobre" />
        
        <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
          <Ionicons name="log-out" size={20} color="#FF5252" />
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// Component Helpers
function StatsCard({ title, value, icon }: { title: string; value: string | number; icon: string }) {
  return (
    <View style={styles.statsCard}>
      <Ionicons name={icon as any} size={24} color="#4CAF50" />
      <Text style={styles.statsValue}>{value}</Text>
      <Text style={styles.statsTitle}>{title}</Text>
    </View>
  );
}

function CategoryCard({ category }: { category: ServiceCategory }) {
  return (
    <View style={styles.categoryCard}>
      <Ionicons name="cleaning" size={32} color="#4CAF50" />
      <Text style={styles.categoryName}>{category.name}</Text>
      <Text style={styles.categoryPrice}>
        R$ {category.base_price} {category.unit}
      </Text>
    </View>
  );
}

function QuickActionButton({ 
  icon, 
  title, 
  subtitle, 
  onPress 
}: { 
  icon: string; 
  title: string; 
  subtitle: string; 
  onPress: () => void; 
}) {
  return (
    <TouchableOpacity style={styles.quickActionButton} onPress={onPress}>
      <Ionicons name={icon as any} size={28} color="#4CAF50" />
      <Text style={styles.quickActionTitle}>{title}</Text>
      <Text style={styles.quickActionSubtitle}>{subtitle}</Text>
    </TouchableOpacity>
  );
}

function JobCard({ job, userType }: { job: Job; userType: string }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'posted': return '#2196F3';
      case 'assigned': return '#FF9800';
      case 'in_progress': return '#9C27B0';
      case 'completed': return '#4CAF50';
      case 'cancelled': return '#F44336';
      default: return '#666';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'posted': return 'Publicado';
      case 'assigned': return 'Atribuído';
      case 'in_progress': return 'Em Progresso';
      case 'completed': return 'Concluído';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  return (
    <View style={styles.jobCard}>
      <View style={styles.jobHeader}>
        <Text style={styles.jobTitle}>{job.title}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(job.status) }]}>
          <Text style={styles.statusText}>{getStatusText(job.status)}</Text>
        </View>
      </View>
      
      <Text style={styles.jobDescription} numberOfLines={2}>
        {job.description}
      </Text>
      
      <View style={styles.jobInfo}>
        <View style={styles.jobInfoRow}>
          <Ionicons name="location" size={14} color="#666" />
          <Text style={styles.jobInfoText}>
            {job.location.city}, {job.location.state}
          </Text>
        </View>
        
        <View style={styles.jobInfoRow}>
          <Ionicons name="cash" size={14} color="#666" />
          <Text style={styles.jobInfoText}>
            R$ {job.budget_min} - R$ {job.budget_max}
          </Text>
        </View>
      </View>
    </View>
  );
}

function ProfileOption({ icon, title }: { icon: string; title: string }) {
  return (
    <TouchableOpacity style={styles.profileOption}>
      <Ionicons name={icon as any} size={24} color="#666" />
      <Text style={styles.profileOptionText}>{title}</Text>
      <Ionicons name="chevron-forward" size={20} color="#CCC" />
    </TouchableOpacity>
  );
}

function BottomNavigation({ 
  activeScreen, 
  onScreenChange, 
  userType 
}: { 
  activeScreen: string; 
  onScreenChange: (screen: any) => void; 
  userType: string; 
}) {
  return (
    <View style={styles.bottomNav}>
      <TouchableOpacity
        style={[styles.navItem, activeScreen === 'home' && styles.navItemActive]}
        onPress={() => onScreenChange('home')}
      >
        <Ionicons 
          name={activeScreen === 'home' ? 'home' : 'home-outline'} 
          size={24} 
          color={activeScreen === 'home' ? '#4CAF50' : '#666'} 
        />
        <Text style={[styles.navText, activeScreen === 'home' && styles.navTextActive]}>
          Início
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.navItem, activeScreen === 'jobs' && styles.navItemActive]}
        onPress={() => onScreenChange('jobs')}
      >
        <Ionicons 
          name={activeScreen === 'jobs' ? 'briefcase' : 'briefcase-outline'} 
          size={24} 
          color={activeScreen === 'jobs' ? '#4CAF50' : '#666'} 
        />
        <Text style={[styles.navText, activeScreen === 'jobs' && styles.navTextActive]}>
          Jobs
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.navItem, activeScreen === 'profile' && styles.navItemActive]}
        onPress={() => onScreenChange('profile')}
      >
        <Ionicons 
          name={activeScreen === 'profile' ? 'person' : 'person-outline'} 
          size={24} 
          color={activeScreen === 'profile' ? '#4CAF50' : '#666'} 
        />
        <Text style={[styles.navText, activeScreen === 'profile' && styles.navTextActive]}>
          Perfil
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: 16,
  },
  
  // Auth Styles
  authContainer: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  authHeader: {
    alignItems: 'center',
    marginBottom: 40,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: 16,
  },
  appSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  authForm: {
    backgroundColor: '#FFF',
    padding: 24,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  authTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 24,
    textAlign: 'center',
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    backgroundColor: '#F9F9F9',
  },
  inputText: {
    fontSize: 16,
    color: '#333',
  },
  userTypeContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  userTypeButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  userTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#4CAF50',
    borderRadius: 8,
    gap: 8,
  },
  userTypeButtonActive: {
    backgroundColor: '#4CAF50',
  },
  userTypeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
  },
  userTypeTextActive: {
    color: '#FFF',
  },
  authButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  authButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  switchAuthButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  switchAuthText: {
    color: '#4CAF50',
    fontSize: 16,
  },
  
  // Screen Styles
  screenContainer: {
    flex: 1,
    padding: 16,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  
  // Home Screen
  header: {
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  
  // Stats
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statsCard: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statsValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  statsTitle: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  
  // Sections
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  seedButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  seedButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  
  // Categories
  categoriesScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  categoryCard: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginRight: 12,
    minWidth: 120,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginTop: 8,
  },
  categoryPrice: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  
  // Quick Actions
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  quickActionSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  
  // Jobs
  jobCard: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '600',
  },
  jobDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  jobInfo: {
    gap: 4,
  },
  jobInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  jobInfoText: {
    fontSize: 12,
    color: '#666',
  },
  
  // Profile
  profileCard: {
    backgroundColor: '#FFF',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  profileType: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  profileOptions: {
    gap: 1,
  },
  profileOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    gap: 12,
  },
  profileOptionText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    gap: 12,
    marginTop: 12,
  },
  logoutText: {
    fontSize: 16,
    color: '#FF5252',
    fontWeight: '600',
  },
  
  // Bottom Navigation
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    paddingVertical: 8,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  navItemActive: {
    backgroundColor: 'transparent',
  },
  navText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  navTextActive: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  
  // Empty States
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
  },
});