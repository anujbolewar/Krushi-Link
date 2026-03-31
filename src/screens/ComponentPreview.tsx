import React, { useState } from 'react';
import { ScrollView, View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { VoiceButton } from '../components/ui/VoiceButton';
import { GradeChip } from '../components/ui/GradeChip';
import { OfflineBar } from '../components/ui/OfflineBar';
import { PriceChart } from '../components/ui/PriceChart';
import { LotCard } from '../components/ui/LotCard';
import { SyncStatusDot } from '../components/ui/SyncStatusDot';
import { PriceForecast, Lot } from '@krushilink/shared/types';

const MOCK_FORECAST: PriceForecast[] = [
  { crop: 'soybean', district: 'Latur', date: '2026-04-01', low: 4800, mid: 5200, high: 5600, currency: 'INR', sourceData: [] },
  { crop: 'soybean', district: 'Latur', date: '2026-04-02', low: 4900, mid: 5300, high: 5700, currency: 'INR', sourceData: [] },
  { crop: 'soybean', district: 'Latur', date: '2026-04-03', low: 5000, mid: 5400, high: 5800, currency: 'INR', sourceData: [] },
  { crop: 'soybean', district: 'Latur', date: '2026-04-04', low: 5100, mid: 5500, high: 5900, currency: 'INR', sourceData: [] },
  { crop: 'soybean', district: 'Latur', date: '2026-04-05', low: 5200, mid: 5600, high: 6000, currency: 'INR', sourceData: [] },
  { crop: 'soybean', district: 'Latur', date: '2026-04-06', low: 5300, mid: 5700, high: 6100, currency: 'INR', sourceData: [] },
  { crop: 'soybean', district: 'Latur', date: '2026-04-07', low: 5400, mid: 5800, high: 6200, currency: 'INR', sourceData: [] },
];

const MOCK_LOT: Lot = {
  id: 'LOT-123456',
  sscc: '123456789012345678',
  farmerId: 'F-1',
  cropType: 'soybean',
  quantity: 500,
  unit: 'kg',
  grade: 'A',
  priceFloor: 5500,
  status: 'matched',
  harvestDate: '2026-03-30',
  gps: { lat: 18.4, lng: 76.5 },
  images: [],
  traceEvents: [],
  createdAt: new Date().toISOString(),
};

export const ComponentPreview: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isOffline, setIsOffline] = useState(true);

  return (
    <SafeAreaView style={styles.container}>
      <OfflineBar isOffline={isOffline} pendingSyncCount={3} />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.header}>KrushiLink UI Preview</Text>

        <Section title="Sync Status Dot">
          <View style={styles.row}>
            <View style={styles.item}><SyncStatusDot status="synced" /><Text>Synced</Text></View>
            <View style={styles.item}><SyncStatusDot status="pending" /><Text>Pending</Text></View>
            <View style={styles.item}><SyncStatusDot status="offline" /><Text>Offline</Text></View>
          </View>
        </Section>

        <Section title="Voice Button (Tap to toggle)">
          <VoiceButton 
            onPress={() => setIsRecording(!isRecording)} 
            isRecording={isRecording} 
            isProcessing={false}
            label={isRecording ? "ऐकत आहे..." : "बोला"} 
          />
        </Section>

        <Section title="Grade Chips">
          <View style={styles.row}>
            <GradeChip grade="A" size="sm" />
            <GradeChip grade="B" size="sm" />
            <GradeChip grade="C" size="sm" />
          </View>
          <View style={[styles.row, { marginTop: 10 }]}>
            <GradeChip grade="A" size="lg" />
            <GradeChip grade="B" size="lg" />
          </View>
        </Section>

        <Section title="Price Forecast (Stacked Bar)">
          <PriceChart forecast={MOCK_FORECAST} crop="soybean" />
        </Section>

        <Section title="Lot Card">
          <LotCard lot={MOCK_LOT} onPress={() => {}} />
          <LotCard lot={{...MOCK_LOT, status: 'listed', cropType: 'orange', id: 'LOT-987654'}} onPress={() => {}} />
        </Section>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const Section: React.FC<{title: string, children: React.ReactNode}> = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9F3',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
  },
  header: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1B4332',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 30,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 14,
    color: '#8DA68A',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  item: {
    alignItems: 'center',
  }
});
