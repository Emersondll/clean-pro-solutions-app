import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { theme } from '../../src/theme/theme';
import { useAuth } from '../../src/context/AuthContext';
import { useHomeData } from '../../src/hooks/useHomeData';
import { Card } from '../../src/components/Card';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function Home() {
  const { user } = useAuth();
  const { data, loading, error, refresh } = useHomeData();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }
    if (text.length > 2) {
      searchTimerRef.current = setTimeout(() => {
        router.push(`/search?query=${encodeURIComponent(text)}` as any);
      }, 500);
    }
  };

  const handleSearchSubmit = () => {
    if (searchQuery.length > 2) {
      router.push(`/search?query=${encodeURIComponent(searchQuery)}` as any);
    }
  };

  if (loading && !data) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={refresh} colors={[theme.colors.primary]} />
      }
    >
      <View style={styles.welcomeSection}>
        <View>
          <Text style={styles.welcomeText}>Olá, {user?.name.split(' ')[0]} 👋</Text>
          <Text style={styles.subtitle}>Encontre o serviço perfeito hoje</Text>
        </View>
        <TouchableOpacity style={styles.notificationButton} onPress={() => router.push('/notifications')}>
          <Ionicons name="notifications-outline" size={24} color={theme.colors.text} />
          <View style={styles.badge} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color={theme.colors.textMuted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar serviços..."
          placeholderTextColor={theme.colors.textMuted}
          value={searchQuery}
          onChangeText={handleSearchChange}
          onSubmitEditing={handleSearchSubmit}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color={theme.colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      <Card style={styles.bannerCard} variant="elevated">
        <View style={styles.bannerContent}>
          <Text style={styles.bannerTitle}>Limpeza Completa</Text>
          <Text style={styles.bannerSubtitle}>20% de desconto na primeira contratação</Text>
          <TouchableOpacity style={styles.bannerButton} onPress={() => router.push('/(tabs)/jobs')}>
            <Text style={styles.bannerButtonText}>Aproveitar agora</Text>
          </TouchableOpacity>
        </View>
        <Ionicons name="sparkles" size={80} color="rgba(255,255,255,0.2)" style={styles.bannerIcon} />
      </Card>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Serviços Disponíveis</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/jobs')}>
            <Text style={styles.seeAllText}>Ver todos</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.servicesGrid}>
          {data?.availableServices.map((service: any) => (
            <TouchableOpacity key={service.id} style={styles.serviceItem} onPress={() => router.push(`/service-details/${service.id}`)}>
              <Card style={styles.serviceCard} variant="outlined">
                <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '10' }]}>
                  <Ionicons name="color-filter-outline" size={24} color={theme.colors.primary} />
                </View>
                <Text style={styles.serviceName}>{service.name}</Text>
                <Text style={styles.servicePrice}>A partir de R$ {service.price || '80'}</Text>
              </Card>
            </TouchableOpacity>
          )) || (
            <Text style={styles.emptyText}>Nenhum serviço disponível no momento.</Text>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ações Rápidas</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickActionsScroll}>
          <QuickAction icon="calendar-outline" title="Agendar" color="#3B82F6" route="/booking" />
          <QuickAction icon="document-text-outline" title="Contratos" color="#059669" route="/contracts" />
          <QuickAction icon="card-outline" title="Pagamento" color="#8B5CF6" route="/payment" />
          <QuickAction icon="time-outline" title="Disponib." color="#F59E0B" route="/availability" />
          <QuickAction icon="star-outline" title="Avaliar" color="#F59E0B" route="/review" />
          <QuickAction icon="chatbubbles-outline" title="Chat" color="#10B981" route="/chat" />
          <QuickAction icon="help-circle-outline" title="Suporte" color="#EF4444" route="/profile/support" />
          <QuickAction icon="search-outline" title="Busca" color="#6366F1" route="/search" />
        </ScrollView>
      </View>
    </ScrollView>
  );
}

function QuickAction({ icon, title, color, route }: { icon: any; title: string; color: string; route: string }) {
  const router = useRouter();
  return (
    <TouchableOpacity style={styles.quickActionItem} onPress={() => router.push(route as any)}>
      <View style={[styles.quickActionIcon, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={styles.quickActionTitle}>{title}</Text>
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  welcomeSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  notificationButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.sm,
  },
  badge: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.error,
    borderWidth: 1.5,
    borderColor: '#FFF',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.sm,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: theme.colors.text,
  },
  bannerCard: {
    backgroundColor: theme.colors.primary,
    padding: 24,
    marginBottom: 32,
    overflow: 'hidden',
  },
  bannerContent: {
    zIndex: 1,
  },
  bannerTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  bannerSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginTop: 4,
    maxWidth: '70%',
  },
  bannerButton: {
    backgroundColor: '#FFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginTop: 16,
  },
  bannerButtonText: {
    color: theme.colors.primary,
    fontWeight: '700',
    fontSize: 12,
  },
  bannerIcon: {
    position: 'absolute',
    right: -10,
    bottom: -10,
  },
  section: {
    marginBottom: 32,
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
    color: theme.colors.text,
  },
  seeAllText: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  serviceItem: {
    width: '47%',
  },
  serviceCard: {
    padding: 16,
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  serviceName: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.text,
  },
  servicePrice: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  emptyText: {
    textAlign: 'center',
    color: theme.colors.textMuted,
    width: '100%',
    marginTop: 20,
  },
  quickActionsScroll: {
    marginHorizontal: -24,
    paddingHorizontal: 24,
  },
  quickActionItem: {
    alignItems: 'center',
    marginRight: 24,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickActionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
});
