import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';

const CROPS = ['सोयाबीन', 'कांदा', 'द्राक्ष', 'संत्री'];

export const FarmDetailsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [formData, setFormData] = useState({ name: 'राहुल पाटील', village: '', taluka: '', crop: '' });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>शेतीची माहिती</Text>
          <Text style={styles.subtitle}>कृपया तुमच्या शेतीचा तपशील भरा</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>पूर्ण नाव</Text>
            <TextInput 
              style={styles.input} 
              value={formData.name} 
              onChangeText={(t) => setFormData({...formData, name: t})} 
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>गाव</Text>
            <TextInput 
              style={styles.input} 
              placeholder="तुमचे गाव लिहा"
              value={formData.village} 
              onChangeText={(t) => setFormData({...formData, village: t})} 
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>तालुका</Text>
            <TextInput 
              style={styles.input} 
              placeholder="तुमचा तालुका लिहा"
              value={formData.taluka} 
              onChangeText={(t) => setFormData({...formData, taluka: t})} 
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>प्रमुख पीक</Text>
            <View style={styles.cropChips}>
              {CROPS.map(c => (
                <TouchableOpacity 
                  key={c} 
                  style={[styles.chip, formData.crop === c && styles.activeChip]}
                  onPress={() => setFormData({...formData, crop: c})}
                >
                  <Text style={[styles.chipText, formData.crop === c && styles.activeChipText]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.submitButton}
          onPress={() => navigation.navigate('OnboardingComplete')}
        >
          <Text style={styles.submitButtonText}>पूर्तता करा</Text>
        </TouchableOpacity>
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
    paddingTop: 40,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1A2E1A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#4A6741',
    fontWeight: '500',
  },
  form: {
    gap: 20,
    marginBottom: 40,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1B4332',
    marginLeft: 4,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8F0E5',
    borderRadius: 16,
    height: 56,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1A2E1A',
  },
  cropChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8F0E5',
  },
  activeChip: {
    backgroundColor: '#2D7A3A',
    borderColor: '#2D7A3A',
  },
  chipText: {
    color: '#4A6741',
    fontWeight: '600',
  },
  activeChipText: {
    color: '#FFFFFF',
  },
  submitButton: {
    backgroundColor: '#2D7A3A',
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
});
