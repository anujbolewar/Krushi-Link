import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Image, FlatList, Dimensions, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { SyncStatusDot } from '../components/ui/SyncStatusDot';
import { LotCard } from '../components/ui/LotCard';
import { useAuthStore } from '../hooks/useAuthStore';
import { COLORS } from '../theme/colors';

const { width } = Dimensions.get('window');

const MOCK_LOTS = [
  { id: 'LOT-102', cropType: 'soybean', quantity: 450, unit: 'kg', grade: 'A', priceFloor: 5600, status: 'posted' },
  { id: 'LOT-103', cropType: 'orange', quantity: 1200, unit: 'kg', grade: 'B', priceFloor: 45, status: 'posted' },
];

const QUICK_ACTIONS = [
    { id: 'grading', title: 'माल तपासा', icon: 'camera-outline', screen: 'Grading', color: '#40916C' },
    { id: 'listing', title: 'यादी करा', icon: 'clipboard-text-outline', screen: 'CreateListing', color: '#2D7A3A' },
    { id: 'prices', title: 'आजचा भाव', icon: 'trending-up', screen: 'PricesTab', color: '#1B4332' },
    { id: 'lots', title: 'माझा माल', icon: 'package-variant-closed', screen: 'ListingsTab', color: '#52B788' },
];

export const HomeScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const user = useAuthStore(state => state.user);
    const [hasMatch, setHasMatch] = useState(true);
    const [isAccepting, setIsAccepting] = useState(false);

    const getMarathiDate = () => {
        const d = new Date();
        const months = ['जानेवारी', 'फेब्रुवारी', 'मार्च', 'एप्रिल', 'मे', 'जून', 'जुलै', 'ऑगस्ट', 'सप्टेंबर', 'ऑक्टोबर', 'नोव्हेंबर', 'डिसेंबर'];
        return `${d.getDate()} ${months[d.getMonth()]} २०२६`;
    };

    const handleAcceptMatch = async () => {
        setIsAccepting(true);
        // Simulate POST /api/v1/matches/m1/accept
        await new Promise(resolve => setTimeout(resolve, 1500));
        setHasMatch(false);
        setIsAccepting(false);
        alert('खरेदीदार स्वीकारला! ट्रान्सपोर्ट डिटेल्स पाठवले आहेत.');
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Header Section */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>नमस्ते, {user?.name || 'बळीराजा'}! 🌾</Text>
                        <Text style={styles.dateText}>{getMarathiDate()}</Text>
                    </View>
                    <View style={styles.headerRight}>
                        <SyncStatusDot status="synced" />
                        <TouchableOpacity style={styles.profileButton}>
                            <MaterialCommunityIcons name="account-circle-outline" size={32} color="#1B4332" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Quick Actions Grid */}
                <View style={styles.grid}>
                    {QUICK_ACTIONS.map(action => (
                        <TouchableOpacity 
                            key={action.id} 
                            style={styles.gridItem}
                            onPress={() => navigation.navigate(action.screen)}
                        >
                            <View style={[styles.iconCircle, { backgroundColor: action.color + '15' }]}>
                                <MaterialCommunityIcons name={action.icon as any} size={32} color={action.color} />
                            </View>
                            <Text style={styles.gridText}>{action.title}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Buyer Match Notification */}
                {hasMatch && (
                    <View style={styles.matchCard}>
                        <View style={styles.matchHeader}>
                            <MaterialCommunityIcons name="bell-ring" size={24} color="#E9C46A" />
                            <Text style={styles.matchTitle}>खरेदीदार सापडला!</Text>
                        </View>
                        <Text style={styles.matchInfo}>रिलायन्स फ्रेश कडून ₹५,४५०/क्विंटल ऑफर आली आहे.</Text>
                        <View style={styles.matchActions}>
                            <TouchableOpacity style={styles.declineButton} onPress={() => setHasMatch(false)}>
                                <Text style={styles.declineText}>नको</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.acceptButton} onPress={handleAcceptMatch} disabled={isAccepting}>
                                {isAccepting ? <ActivityIndicator color="#FFFFFF" size="small" /> : <Text style={styles.acceptText}>स्वीकारा</Text>}
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* Active Listings */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>माझा सक्रिय माल (Active Lots)</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('ListingsTab')}>
                        <Text style={styles.viewAll}>सर्व पहा</Text>
                    </TouchableOpacity>
                </View>
                <FlatList 
                    data={MOCK_LOTS}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.lotList}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => (
                        <View style={styles.lotCardWrapper}>
                            <LotCard lot={item as any} onPress={() => {}} />
                        </View>
                    )}
                />

                {/* Market Pulse Card */}
                <TouchableOpacity style={styles.pulseCard} onPress={() => navigation.navigate('PricesTab')}>
                    <View style={styles.pulseInfo}>
                        <Text style={styles.pulseTitle}>आजचा बाजार भाव</Text>
                        <Text style={styles.pulseSubtitle}>सोयाबीनमध्ये ३% वाढ</Text>
                    </View>
                    <MaterialCommunityIcons name="chart-line" size={40} color="#FFFFFF" />
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F9F3' },
  scrollContent: { padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  greeting: { fontSize: 24, fontWeight: '900', color: '#1B4332' },
  dateText: { fontSize: 14, color: '#4A6741', fontWeight: 'bold' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  profileButton: { padding: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  gridItem: { 
    width: (width - 52) / 2, 
    aspectRatio: 1.1, 
    backgroundColor: '#FFFFFF', 
    borderRadius: 24, 
    justifyContent: 'center', 
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#E8F0E5',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2
  },
  iconCircle: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  gridText: { fontSize: 18, fontWeight: '800', color: '#1B4332' },
  matchCard: { backgroundColor: '#FFFAF0', borderWidth: 2, borderColor: '#E9C46A', borderRadius: 24, padding: 20, marginBottom: 24 },
  matchHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  matchTitle: { fontSize: 18, fontWeight: '900', color: '#574B28' },
  matchInfo: { fontSize: 15, color: '#6B5E33', marginBottom: 16 },
  matchActions: { flexDirection: 'row', gap: 12 },
  declineButton: { flex: 1, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E9C46A' },
  declineText: { fontWeight: 'bold', color: '#E9C46A' },
  acceptButton: { flex: 2, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center', backgroundColor: '#E9C46A' },
  acceptText: { fontWeight: 'bold', color: '#574B28' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '900', color: '#1B4332' },
  viewAll: { color: '#2D7A3A', fontWeight: 'bold' },
  lotList: { gap: 12 },
  lotCardWrapper: { width: width * 0.8 },
  pulseCard: { backgroundColor: '#1B4332', borderRadius: 24, padding: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24 },
  pulseTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '900' },
  pulseSubtitle: { color: '#52B788', fontSize: 14, fontWeight: 'bold', marginTop: 4 },
  pulseInfo: { flex: 1 }
});
