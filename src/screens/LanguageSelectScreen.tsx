import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../hooks/useAuthStore';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';

const LANGUAGES = [
  { id: 'marathi', label: 'मराठी', icon: 'translate' },
  { id: 'hindi', label: 'हिंदी', icon: 'translate' },
  { id: 'english', label: 'English', icon: 'alphabetical' },
] as const;

export const LanguageSelectScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const setLanguage = useAuthStore((state) => state.setLanguage);

  const handleSelect = (lang: 'marathi' | 'hindi' | 'english') => {
    setLanguage(lang);
    navigation.navigate('VoiceOnboarding');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>भाषा निवडा</Text>
          <Text style={styles.subtitle}>कृपया तुमची आवडती भाषा निवडा</Text>
        </View>

        <View style={styles.cardsContainer}>
          {LANGUAGES.map((lang) => (
            <TouchableOpacity
              key={lang.id}
              style={styles.card}
              onPress={() => handleSelect(lang.id)}
              activeOpacity={0.8}
            >
              <View style={styles.cardContent}>
                <View style={styles.iconCircle}>
                  <MaterialCommunityIcons name={lang.icon} size={32} color={COLORS.primary} />
                </View>
                <Text style={styles.cardLabel}>{lang.label}</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS.textMuted} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9F3',
  },
  scrollContent: {
    padding: 24,
    paddingTop: 60,
  },
  header: {
    marginBottom: 48,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#1A2E1A',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    color: '#4A6741',
    fontWeight: '500',
  },
  cardsContainer: {
    gap: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    height: 96,
    borderRadius: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E8F0E5',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F0F7EE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardLabel: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1B4332',
  },
});
