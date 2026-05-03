import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../src/theme/theme';
import { Button } from '../src/components/Button';

export default function ReviewScreen() {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const tags = ['Pontual', 'Cuidadoso(a)', 'Simpático(a)', 'Ótimo serviço', 'Rápido(a)'];

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = () => {
    if (rating === 0) {
      Alert.alert('Atenção', 'Por favor, selecione uma nota de 1 a 5 estrelas.');
      return;
    }

    Alert.alert('Avaliação Enviada', 'Muito obrigado pelo seu feedback!', [
      { text: 'OK', onPress: () => router.replace('/(tabs)/home') }
    ]);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="close" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Avaliar Serviço</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>M</Text>
          </View>
          <Text style={styles.profName}>Maria Silva</Text>
          <Text style={styles.serviceName}>Limpeza Residencial</Text>
        </View>

        <Text style={styles.question}>Como foi o serviço?</Text>
        
        <View style={styles.starsContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity key={star} onPress={() => setRating(star)} style={styles.starButton}>
              <Ionicons 
                name={star <= rating ? 'star' : 'star-outline'} 
                size={40} 
                color={star <= rating ? '#F59E0B' : theme.colors.border} 
              />
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.ratingText}>
          {rating === 0 ? 'Selecione uma nota' : 
           rating === 1 ? 'Muito Ruim' : 
           rating === 2 ? 'Ruim' : 
           rating === 3 ? 'Razoável' : 
           rating === 4 ? 'Bom' : 'Excelente!'}
        </Text>

        {rating > 0 && (
          <>
            <Text style={styles.subQuestion}>O que mais gostou?</Text>
            <View style={styles.tagsContainer}>
              {tags.map(tag => (
                <TouchableOpacity 
                  key={tag} 
                  style={[styles.tag, selectedTags.includes(tag) && styles.tagActive]}
                  onPress={() => toggleTag(tag)}
                >
                  <Text style={[styles.tagText, selectedTags.includes(tag) && styles.tagTextActive]}>{tag}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.subQuestion}>Deixe um comentário (opcional)</Text>
            <TextInput
              style={styles.commentInput}
              placeholder="Conte-nos mais sobre sua experiência..."
              value={comment}
              onChangeText={setComment}
              multiline
              textAlignVertical="top"
            />
          </>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Button title="Enviar Avaliação" onPress={handleSubmit} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 50, paddingHorizontal: 24, paddingBottom: 16 },
  backButton: { width: 40, height: 40, borderRadius: 12, backgroundColor: theme.colors.surface, alignItems: 'center', justifyContent: 'center', marginRight: 16, ...theme.shadows.sm },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: theme.colors.text },
  scrollContent: { padding: 24, paddingBottom: 100 },
  profCard: { alignItems: 'center', marginBottom: 32 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 12, ...theme.shadows.md },
  avatarText: { fontSize: 32, fontWeight: 'bold', color: '#FFF' },
  profName: { fontSize: 22, fontWeight: 'bold', color: theme.colors.text },
  serviceName: { fontSize: 14, color: theme.colors.textSecondary, marginTop: 4 },
  question: { fontSize: 20, fontWeight: 'bold', color: theme.colors.text, textAlign: 'center', marginBottom: 24 },
  starsContainer: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 16 },
  starButton: { padding: 4 },
  ratingText: { fontSize: 16, color: theme.colors.textSecondary, textAlign: 'center', marginBottom: 32, fontWeight: '600' },
  subQuestion: { fontSize: 16, fontWeight: 'bold', color: theme.colors.text, marginBottom: 16, marginTop: 8 },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 32 },
  tag: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface },
  tagActive: { backgroundColor: theme.colors.primary + '15', borderColor: theme.colors.primary },
  tagText: { color: theme.colors.textSecondary, fontWeight: '600' },
  tagTextActive: { color: theme.colors.primary },
  commentInput: { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 16, padding: 16, height: 120, fontSize: 15 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 24, backgroundColor: theme.colors.background, borderTopWidth: 1, borderTopColor: theme.colors.border },
});
