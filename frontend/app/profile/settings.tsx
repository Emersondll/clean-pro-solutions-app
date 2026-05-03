import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../src/theme/theme';

export default function SettingsScreen() {
  const router = useRouter();
  const [pushNotif, setPushNotif] = useState(true);
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Preferências</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>Notificações</Text>
        
        <View style={styles.settingCard}>
          <View style={styles.settingInfo}>
            <Ionicons name="notifications" size={24} color={theme.colors.primary} />
            <Text style={styles.settingTitle}>Notificações Push</Text>
          </View>
          <Switch value={pushNotif} onValueChange={setPushNotif} trackColor={{ false: theme.colors.border, true: theme.colors.primary + '50' }} thumbColor={pushNotif ? theme.colors.primary : '#f4f3f4'} />
        </View>

        <View style={styles.settingCard}>
          <View style={styles.settingInfo}>
            <Ionicons name="mail" size={24} color={theme.colors.primary} />
            <Text style={styles.settingTitle}>E-mails Promocionais</Text>
          </View>
          <Switch value={emailNotif} onValueChange={setEmailNotif} trackColor={{ false: theme.colors.border, true: theme.colors.primary + '50' }} thumbColor={emailNotif ? theme.colors.primary : '#f4f3f4'} />
        </View>

        <View style={styles.settingCard}>
          <View style={styles.settingInfo}>
            <Ionicons name="chatbubble-ellipses" size={24} color={theme.colors.primary} />
            <Text style={styles.settingTitle}>Avisos por SMS</Text>
          </View>
          <Switch value={smsNotif} onValueChange={setSmsNotif} trackColor={{ false: theme.colors.border, true: theme.colors.primary + '50' }} thumbColor={smsNotif ? theme.colors.primary : '#f4f3f4'} />
        </View>

        <Text style={[styles.sectionTitle, { marginTop: 32 }]}>Aparência</Text>
        <View style={styles.settingCard}>
          <View style={styles.settingInfo}>
            <Ionicons name="moon" size={24} color={theme.colors.primary} />
            <Text style={styles.settingTitle}>Modo Escuro</Text>
          </View>
          <Switch value={darkMode} onValueChange={setDarkMode} trackColor={{ false: theme.colors.border, true: theme.colors.primary + '50' }} thumbColor={darkMode ? theme.colors.primary : '#f4f3f4'} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 50, paddingHorizontal: 24, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  backButton: { width: 40, height: 40, borderRadius: 12, backgroundColor: theme.colors.surface, alignItems: 'center', justifyContent: 'center', marginRight: 16, ...theme.shadows.sm },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: theme.colors.text },
  scrollContent: { padding: 24 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.text, marginBottom: 16 },
  settingCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: theme.colors.surface, padding: 16, borderRadius: 16, marginBottom: 12, ...theme.shadows.sm },
  settingInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  settingTitle: { fontSize: 16, fontWeight: '600', color: theme.colors.text },
});
