import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LotCard } from '../components/ui/LotCard';
import { COLORS } from '../theme/colors';

const MOCK_LOTS = [
  { id: 'LOT-102', cropType: 'soybean', quantity: 450, unit: 'kg', grade: 'A', priceFloor: 5600, status: 'matched' },
  { id: 'LOT-105', cropType: 'onion', quantity: 1200, unit: 'kg', grade: 'B', priceFloor: 1800, status: 'listed' },
];

export const MyLotsScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.header}>
                <Text style={styles.title}>माझ्या विक्री (My Lots)</Text>
                <TouchableOpacity style={styles.addButton}>
                    <MaterialCommunityIcons name="plus-circle" size={24} color="#FFFFFF" />
                    <Text style={styles.addButtonText}>नवीन विक्री</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.list}>
                {MOCK_LOTS.map((lot: any) => (
                    <LotCard key={lot.id} lot={lot} onPress={() => {}} />
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
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1B4332',
  },
  addButton: {
    backgroundColor: '#2D7A3A',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  list: {
    gap: 4,
  }
});
