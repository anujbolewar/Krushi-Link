import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore } from '../hooks/useAuthStore';
import { COLORS } from '../theme/colors';

export const FarmerProfileScreen: React.FC = () => {
  const logout = useAuthStore((state) => state.logout);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1595273670150-db0a3d39074f?auto=format&fit=crop&q=80&w=200&h=200' }} 
              style={styles.avatar} 
            />
            <View style={styles.verifiedBadge}>
              <MaterialCommunityIcons name="check-decagram" size={24} color="#2D7A3A" />
            </View>
          </View>
          <Text style={styles.name}>राहुल पाटील</Text>
          <Text style={styles.location}>लातूर, महाराष्ट्र</Text>
          <View style={styles.idBadge}>
            <Text style={styles.idText}>शेतकरी ID: KL-2026-R89P</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <StatBox label="एकूण विक्री" value="१२" icon="shopping" />
          <StatBox label="मिळवलेले उत्पन्न" value="₹ २.४ लाख" icon="cash-multiple" />
          <StatBox label="विश्वासू विक्रेता" value="४.८" icon="star" />
        </View>

        <View style={styles.menuContainer}>
          <MenuItem icon="account-details-outline" label="माझी माहिती (My Info)" />
          <MenuItem icon="bank-outline" label="बँक तपशील (Bank Details)" />
          <MenuItem icon="file-document-outline" label="करारनामे (Documents)" />
          <MenuItem icon="cog-outline" label="सेटिंग्ज (Settings)" />
          <TouchableOpacity 
            style={[styles.menuItem, styles.logoutItem]} 
            onPress={logout}
          >
            <MaterialCommunityIcons name="logout" size={24} color="#E63946" />
            <Text style={[styles.menuLabel, styles.logoutLabel]}>बाहेर पडा (Logout)</Text>
          </TouchableOpacity>
        </View>
        
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const StatBox = ({ label, value, icon }: { label: string, value: string, icon: string }) => (
    <View style={styles.statBox}>
        <MaterialCommunityIcons name={icon as any} size={24} color="#2D7A3A" />
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
    </View>
);

const MenuItem = ({ icon, label }: { icon: string, label: string }) => (
    <TouchableOpacity style={styles.menuItem}>
        <View style={styles.menuIconCircle}>
            <MaterialCommunityIcons name={icon as any} size={20} color="#1B4332" />
        </View>
        <Text style={styles.menuLabel}>{label}</Text>
        <MaterialCommunityIcons name="chevron-right" size={20} color="#8DA68A" />
    </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9F3',
  },
  scrollContent: {
    padding: 24,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 2,
  },
  name: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1A2E1A',
    marginBottom: 4,
  },
  location: {
    fontSize: 16,
    color: '#4A6741',
    fontWeight: '500',
    marginBottom: 12,
  },
  idBadge: {
    backgroundColor: '#F0F7EE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D8E8D0',
  },
  idText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2D7A3A',
    letterSpacing: 1,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 20,
    alignItems: 'center',
    gap: 4,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E8F0E5',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A2E1A',
  },
  statLabel: {
    fontSize: 10,
    color: '#8DA68A',
    textAlign: 'center',
    fontWeight: '600',
  },
  menuContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#D8E8D0',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F7EE',
  },
  menuIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F7EE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#1B4332',
  },
  logoutItem: {
    borderBottomWidth: 0,
    marginTop: 8,
  },
  logoutLabel: {
    color: '#E63946',
  },
});
