import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { PriceChart } from '../components/ui/PriceChart';
import { getForecast } from '../data/mockPrices';
import { COLORS } from '../theme/colors';

const CROPS = [
  { id: 'orange', name: 'संत्रा', icon: 'fruit-citrus' },
  { id: 'grape', name: 'द्राक्ष', icon: 'fruit-grapes' },
  { id: 'soybean', name: 'सोयाबीन', icon: 'leaf' },
  { id: 'onion', name: 'कांदा', icon: 'nutrition' },
];

const DISTRICTS = ['Nagpur', 'Nashik'];

export const PriceDiscoveryScreen: React.FC = () => {
    const [selectedCrop, setSelectedCrop] = useState('orange');
    const [selectedDistrict, setSelectedDistrict] = useState('Nagpur');
    const [lookback, setLookback] = useState(30);
    const [forecast, setForecast] = useState<any[]>([]);

    useEffect(() => {
        const data = getForecast(selectedDistrict, selectedCrop);
        setForecast(data);
    }, [selectedCrop, selectedDistrict]);

    const todayPrice = forecast[forecast.length - 1]?.mid || 0;
    const prevPrice = forecast[forecast.length - 2]?.mid || todayPrice;
    const trend = todayPrice >= prevPrice ? 'up' : 'down';

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <Text style={styles.headerTitle}>बाजार भाव शोध (Price Discovery)</Text>

                {/* District Selector */}
                <View style={styles.districtContainer}>
                    {DISTRICTS.map(d => (
                        <TouchableOpacity 
                            key={d} 
                            style={[styles.districtTab, selectedDistrict === d && styles.activeDistrict]}
                            onPress={() => setSelectedDistrict(d)}
                        >
                            <Text style={[styles.districtText, selectedDistrict === d && styles.activeDistrictText]}>{d}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Crop Selector Tabs */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cropTabs}>
                    {CROPS.map(c => (
                        <TouchableOpacity 
                            key={c.id} 
                            style={[styles.cropTab, selectedCrop === c.id && styles.activeCropTab]}
                            onPress={() => setSelectedCrop(c.id)}
                        >
                            <MaterialCommunityIcons 
                                name={c.icon as any} 
                                size={20} 
                                color={selectedCrop === c.id ? '#FFFFFF' : '#2D7A3A'} 
                            />
                            <Text style={[styles.cropTabText, selectedCrop === c.id && styles.activeCropTabText]}>{c.name}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Price Today Card */}
                <View style={styles.todayCard}>
                    <View style={styles.todayInfo}>
                        <Text style={styles.todayLabel}>आजचा भाव ({selectedDistrict})</Text>
                        <View style={styles.priceRow}>
                            <Text style={styles.priceValue}>₹ {todayPrice}</Text>
                            <Text style={styles.unitText}>/ किलो</Text>
                        </View>
                    </View>
                    <View style={[styles.trendBadge, { backgroundColor: trend === 'up' ? '#D8E8D0' : '#FAD2D2' }]}>
                        <MaterialCommunityIcons 
                            name={trend === 'up' ? 'trending-up' : 'trending-down'} 
                            size={24} 
                            color={trend === 'up' ? '#2D7A3A' : '#E63946'} 
                        />
                        <Text style={[styles.trendText, { color: trend === 'up' ? '#2D7A3A' : '#E63946' }]}>
                            {trend === 'up' ? '+२%' : '-१%'}
                        </Text>
                    </View>
                </View>

                {/* Forecast Chart */}
                <PriceChart forecast={forecast} crop={selectedCrop} />

                <Text style={styles.sourceText}>स्रोत: e-NAM + AgMarkNet | दर १० मिनिटांनी अपडेट</Text>

                {/* Lookback Toggle */}
                <View style={styles.lookbackToggle}>
                    {[30, 60, 90].map(v => (
                        <TouchableOpacity 
                            key={v} 
                            style={[styles.lookbackBtn, lookback === v && styles.activeLookback]}
                            onPress={() => setLookback(v)}
                        >
                            <Text style={[styles.lookbackText, lookback === v && styles.activeLookbackText]}>{v} दिवस</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F9F3' },
  scrollContent: { padding: 20 },
  headerTitle: { fontSize: 24, fontWeight: '900', color: '#1B4332', marginBottom: 20 },
  districtContainer: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  districtTab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E8F0E5' },
  activeDistrict: { backgroundColor: '#2D7A3A', borderColor: '#2D7A3A' },
  districtText: { color: '#4A6741', fontWeight: 'bold' },
  activeDistrictText: { color: '#FFFFFF' },
  cropTabs: { marginBottom: 24 },
  cropTab: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, backgroundColor: '#FFFFFF', marginRight: 10, borderWidth: 1, borderColor: '#E8F0E5' },
  activeCropTab: { backgroundColor: '#2D7A3A', borderColor: '#2D7A3A' },
  cropTabText: { color: '#2D7A3A', fontWeight: '800' },
  activeCropTabText: { color: '#FFFFFF' },
  todayCard: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: '#D8E8D0', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  todayLabel: { fontSize: 14, color: '#8DA68A', fontWeight: 'bold', marginBottom: 4 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  priceValue: { fontSize: 36, fontWeight: '900', color: '#1B4332' },
  unitText: { fontSize: 16, color: '#4A6741', fontWeight: 'bold' },
  trendBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 },
  trendText: { fontWeight: '900', fontSize: 14 },
  sourceText: { fontSize: 10, color: '#8DA68A', textAlign: 'center', marginTop: 12, fontStyle: 'italic' },
  lookbackToggle: { flexDirection: 'row', backgroundColor: '#E8F0E5', borderRadius: 20, padding: 6, marginTop: 24 },
  lookbackBtn: { flex: 1, height: 40, justifyContent: 'center', alignItems: 'center', borderRadius: 16 },
  activeLookback: { backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, elevation: 2 },
  lookbackText: { color: '#8DA68A', fontWeight: 'bold' },
  activeLookbackText: { color: '#2D7A3A' }
});
