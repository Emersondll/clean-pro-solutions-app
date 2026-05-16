import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../src/theme/theme';
import { Card } from '../src/components/Card';
import api from '../src/services/api';

interface Service {
  id: string;
  name: string;
  price: number;
  description: string;
}

export default function SearchScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ query?: string }>();
  const [query, setQuery] = useState(params.query || '');
  const [results, setResults] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (query.length > 2) {
      performSearch(query);
    }
  }, []);

  const handleQueryChange = (text: string) => {
    setQuery(text);
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }
    if (text.length > 2) {
      searchTimerRef.current = setTimeout(() => {
        performSearch(text);
      }, 500);
    } else {
      setResults([]);
    }
  };

  const performSearch = async (q: string) => {
    setLoading(true);
    try {
      const res = await api.get(`/services/search?query=${encodeURIComponent(q)}`);
      setResults(res.data || []);
    } catch (e) {
      console.error('Search failed', e);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color={theme.colors.textMuted} />
          <TextInput
            ref={inputRef}
            style={styles.searchInput}
            placeholder="Buscar serviços..."
            placeholderTextColor={theme.colors.textMuted}
            value={query}
            onChangeText={handleQueryChange}
            returnKeyType="search"
            autoFocus
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => { setQuery(''); setResults([]); }}>
              <Ionicons name="close-circle" size={18} color={theme.colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {loading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Buscando...</Text>
        </View>
      ) : query.length <= 2 ? (
        <View style={styles.centerContent}>
          <Ionicons name="search-outline" size={48} color={theme.colors.textMuted} />
          <Text style={styles.hintText}>Digite pelo menos 3 caracteres para buscar</Text>
        </View>
      ) : results.length === 0 ? (
        <View style={styles.centerContent}>
          <Ionicons name="alert-circle-outline" size={48} color={theme.colors.textMuted} />
          <Text style={styles.emptyTitle}>Nenhum resultado</Text>
          <Text style={styles.emptySubtitle}>Tente outro termo de busca</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.serviceItem}
              onPress={() => router.push(`/service-details/${item.id}` as any)}
            >
              <Card style={styles.serviceCard} variant="outlined">
                <View style={styles.serviceCardContent}>
                  <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '10' }]}>
                    <Ionicons name="color-filter-outline" size={24} color={theme.colors.primary} />
                  </View>
                  <View style={styles.serviceInfo}>
                    <Text style={styles.serviceName}>{item.name}</Text>
                    <Text style={styles.serviceDescription} numberOfLines={2}>{item.description}</Text>
                    <Text style={styles.servicePrice}>A partir de R$ {item.price},00</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
                </View>
              </Card>
            </TouchableOpacity>
          )}
          ListHeaderComponent={
            <Text style={styles.resultsCount}>{results.length} resultado{results.length !== 1 ? 's' : ''} encontrado{results.length !== 1 ? 's' : ''}</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    gap: 8,
  },
  backButton: {
    padding: 8,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: theme.colors.text,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 32,
  },
  loadingText: { color: theme.colors.textSecondary, fontSize: 14 },
  hintText: { color: theme.colors.textMuted, fontSize: 15, textAlign: 'center' },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.text },
  emptySubtitle: { fontSize: 14, color: theme.colors.textSecondary, textAlign: 'center' },
  listContent: { padding: 16 },
  resultsCount: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginBottom: 12,
    fontWeight: '500',
  },
  serviceItem: { marginBottom: 12 },
  serviceCard: { padding: 16 },
  serviceCardContent: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  serviceInfo: { flex: 1 },
  serviceName: { fontSize: 16, fontWeight: 'bold', color: theme.colors.text },
  serviceDescription: { fontSize: 13, color: theme.colors.textSecondary, marginTop: 2, lineHeight: 18 },
  servicePrice: { fontSize: 14, fontWeight: '700', color: theme.colors.primary, marginTop: 6 },
});
