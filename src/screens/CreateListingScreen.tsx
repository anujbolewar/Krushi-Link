import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, TextInput, Animated, Dimensions, Image, ActivityIndicator, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import QRCode from 'react-native-qrcode-svg';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import ViewShot from 'react-native-view-shot';
import { PriceChart } from '../components/ui/PriceChart';
import { traceChain } from '../services/tracechain';
import { useAuthStore } from '../hooks/useAuthStore';
import { COLORS } from '../theme/colors';

const { width } = Dimensions.get('window');

const CROPS = [
  { id: 'santra', name: 'संत्रा', icon: 'fruit-citrus' },
  { id: 'draksha', name: 'द्राक्ष', icon: 'fruit-grapes' },
  { id: 'soybean', name: 'सोयाबीन', icon: 'leaf' },
  { id: 'onion', name: 'कांदा', icon: 'nutrition' },
];

const MOCK_FORECAST = [
    { crop: 'soybean', district: 'Latur', date: '2026-04-01', low: 4800, mid: 5200, high: 5600, currency: 'INR', sourceData: [] },
    { crop: 'soybean', district: 'Latur', date: '2026-04-02', low: 4900, mid: 5300, high: 5700, currency: 'INR', sourceData: [] },
    { crop: 'soybean', district: 'Latur', date: '2026-04-03', low: 5000, mid: 5400, high: 5800, currency: 'INR', sourceData: [] },
];

export const CreateListingScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const gradingResult = route.params?.gradingResult || { grade: 'B' };
    const user = useAuthStore(state => state.user);
    
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        cropType: 'soybean',
        quantity: '',
        unit: 'KG',
        harvestDate: new Date(),
        priceFloor: '',
        mandiPrice: 5250, // Reference
    });
    const [isPublishing, setIsPublishing] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [sscc, setSscc] = useState('');
    
    const qrRef = useRef<any>(null);
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const handleNext = () => setStep(prev => prev + 1);
    const handlePrev = () => setStep(prev => prev - 1);

    const handlePublish = async () => {
        setIsPublishing(true);
        
        // 1. Simulate API POST /api/v1/lots
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // 2. Generate SSCC and Record to TraceChain
        const newSscc = traceChain.generateSSCC(user?.id || 'FRM-001', 'LOT-123');
        setSscc(newSscc);
        
        await traceChain.recordEvent({
            type: 'lot_listing',
            timestamp: Date.now(),
            farmerId: user?.id || 'FRM-001',
            lotId: 'LOT-123',
            gps: { lat: 21.1444, lng: 79.0882 },
            sscc: newSscc,
            details: formData
        });

        setIsPublishing(false);
        setShowSuccess(true);
        
        Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
    };

    const handleSaveQR = async () => {
        const uri = await qrRef.current.capture();
        
        if (Platform.OS === 'web') {
            const link = document.createElement('a');
            link.href = uri;
            link.download = `KrushiLink_QR_${sscc}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            return;
        }

        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status === 'granted') {
            await MediaLibrary.saveToLibraryAsync(uri);
            alert('QR जतन झाला!');
        }
    };

    const handleShare = async () => {
        const uri = await qrRef.current.capture();
        await Sharing.shareAsync(uri);
    };

    if (showSuccess) {
        return (
            <SafeAreaView style={styles.successContainer}>
                <Animated.View style={[styles.successContent, { opacity: fadeAnim }]}>
                    <MaterialCommunityIcons name="check-decagram" size={100} color="#2D7A3A" />
                    <Text style={styles.successTitle}>प्रकाशित झाले!</Text>
                    <Text style={styles.successSubtitle}>तुमचा माल आता मार्केटमध्ये उपलब्ध आहे</Text>
                    
                    <ViewShot ref={qrRef} options={{ format: 'png', quality: 0.9 }}>
                        <View style={styles.qrWrapper}>
                            <Text style={styles.qrHeader}>KRUSHILINK ID</Text>
                            <QRCode value={sscc} size={200} color="#1B4332" backgroundColor="#FFFFFF" />
                            <Text style={styles.ssccText}>{sscc}</Text>
                        </View>
                    </ViewShot>

                    <View style={styles.blockchainIndicator}>
                        <MaterialCommunityIcons name="link-variant" size={20} color="#2D7A3A" />
                        <Text style={styles.blockchainText}>ब्लॉकचेन नोंद झाली ✓</Text>
                    </View>

                    <View style={styles.successActions}>
                        <TouchableOpacity style={styles.outlineButton} onPress={handleSaveQR}>
                           <MaterialCommunityIcons name="download" size={24} color="#2D7A3A" />
                           <Text style={styles.outlineButtonText}>जतन करा</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.outlineButton} onPress={handleShare}>
                           <MaterialCommunityIcons name="whatsapp" size={24} color="#2D7A3A" />
                           <Text style={styles.outlineButtonText}>शेअर करा</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('Main')}>
                        <Text style={styles.primaryButtonText}>डॅशबोर्डवर जा</Text>
                    </TouchableOpacity>
                </Animated.View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Step Indicator */}
            <View style={styles.stepIndicator}>
                <View style={[styles.stepBar, step >= 1 && styles.activeStep]} />
                <View style={[styles.stepBar, step >= 2 && styles.activeStep]} />
                <View style={[styles.stepBar, step >= 3 && styles.activeStep]} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {step === 1 && (
                    <View style={styles.stepContent}>
                        <Text style={styles.title}>मालाचा तपशील</Text>
                        
                        <Text style={styles.label}>पिकाचा प्रकार</Text>
                        <View style={styles.cropGrid}>
                            {CROPS.map(c => (
                                <TouchableOpacity 
                                    key={c.id} 
                                    style={[styles.cropCard, formData.cropType === c.id && styles.activeCrop]}
                                    onPress={() => setFormData({...formData, cropType: c.id})}
                                >
                                    <MaterialCommunityIcons 
                                        name={c.icon as any} 
                                        size={32} 
                                        color={formData.cropType === c.id ? '#FFFFFF' : '#4A6741'} 
                                    />
                                    <Text style={[styles.cropText, formData.cropType === c.id && styles.activeCropText]}>{c.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={styles.label}>प्रमाण (Quantity)</Text>
                        <View style={styles.inputRow}>
                            <View style={styles.inputContainer}>
                                <TextInput 
                                    style={styles.input} 
                                    placeholder="प्रमाण लिहा" 
                                    keyboardType="numeric"
                                    value={formData.quantity}
                                    onChangeText={t => setFormData({...formData, quantity: t})}
                                />
                                <TouchableOpacity style={styles.micButton}>
                                    <MaterialCommunityIcons name="microphone" size={20} color="#2D7A3A" />
                                </TouchableOpacity>
                            </View>
                            <View style={styles.unitToggle}>
                                {['KG', 'QUINTAL'].map(u => (
                                    <TouchableOpacity 
                                        key={u} 
                                        style={[styles.unitButton, formData.unit === u && styles.activeUnit]}
                                        onPress={() => setFormData({...formData, unit: u})}
                                    >
                                        <Text style={[styles.unitText, formData.unit === u && styles.activeUnitText]}>{u}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <TouchableOpacity style={styles.actionButton} onPress={handleNext}>
                            <Text style={styles.actionButtonText}>पुढे जा</Text>
                            <MaterialCommunityIcons name="arrow-right" size={24} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>
                )}

                {step === 2 && (
                    <View style={styles.stepContent}>
                        <Text style={styles.title}>भाव ठरवा</Text>
                        
                        <View style={styles.chartSection}>
                            <Text style={styles.labelText}>बाजार भाव अंदाज (Forecast)</Text>
                            <PriceChart forecast={MOCK_FORECAST as any} crop={formData.cropType} />
                        </View>

                        <View style={styles.referenceBox}>
                            <MaterialCommunityIcons name="information" size={24} color="#2D7A3A" />
                            <View>
                                <Text style={styles.refLabel}>आजचा सरासरी मंडी भाव</Text>
                                <Text style={styles.refValue}>₹ ५,२५० / क्विंटल (नागपूर)</Text>
                            </View>
                        </View>

                        <Text style={styles.label}>तुमचा किमान भाव (Price Floor)</Text>
                        <View style={styles.priceInputRow}>
                            <TextInput 
                                style={styles.priceInput} 
                                placeholder="₹ 0.00"
                                keyboardType="numeric"
                                value={formData.priceFloor}
                                onChangeText={t => setFormData({...formData, priceFloor: t})}
                            />
                            {user?.role === 'FPO' && (
                                <View style={styles.fpoBadge}>
                                    <Text style={styles.fpoText}>FPO सुचवतो: ₹ ५,३२०</Text>
                                </View>
                            )}
                        </View>

                        <View style={styles.buttonRow}>
                           <TouchableOpacity style={styles.backButton} onPress={handlePrev}>
                               <Text style={styles.backButtonText}>मागे</Text>
                           </TouchableOpacity>
                           <TouchableOpacity style={styles.actionButton} onPress={handleNext}>
                                <Text style={styles.actionButtonText}>समीक्षा (Review)</Text>
                           </TouchableOpacity>
                        </View>
                    </View>
                )}

                {step === 3 && (
                    <View style={styles.stepContent}>
                        <Text style={styles.title}>मालाची समीक्षा</Text>
                        
                        <View style={styles.summaryCard}>
                            <View style={styles.summaryItem}>
                                <Text style={styles.summaryLabel}>पीक:</Text>
                                <Text style={styles.summaryValue}>सोयाबीन (Grade {gradingResult.grade})</Text>
                            </View>
                            <View style={styles.summaryItem}>
                                <Text style={styles.summaryLabel}>प्रमाण:</Text>
                                <Text style={styles.summaryValue}>{formData.quantity} {formData.unit}</Text>
                            </View>
                            <View style={styles.summaryItem}>
                                <Text style={styles.summaryLabel}>किमान भाव:</Text>
                                <Text style={styles.summaryValue}>₹ {formData.priceFloor} / {formData.unit}</Text>
                            </View>
                            <View style={styles.traceBadge}>
                                <MaterialCommunityIcons name="shield-check" size={20} color="#2D7A3A" />
                                <Text style={styles.traceText}>ब्लॉकचेन सुरक्षित (TraceChain Checked)</Text>
                            </View>
                        </View>

                        <TouchableOpacity style={styles.publishButton} onPress={handlePublish} disabled={isPublishing}>
                            {isPublishing ? <ActivityIndicator color="#FFFFFF" /> : (
                                <>
                                    <Text style={styles.publishButtonText}>यादीत टाका (Publish)</Text>
                                    <MaterialCommunityIcons name="cloud-upload" size={24} color="#FFFFFF" />
                                </>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.cancelButton} onPress={handlePrev}>
                            <Text style={styles.cancelText}>माहिती बदला</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F9F3' },
  stepIndicator: { flexDirection: 'row', gap: 8, paddingHorizontal: 24, paddingTop: 20, marginBottom: 20 },
  stepBar: { flex: 1, height: 4, backgroundColor: '#D8E8D0', borderRadius: 2 },
  activeStep: { backgroundColor: '#2D7A3A' },
  scrollContent: { padding: 24 },
  stepContent: { gap: 16 },
  title: { fontSize: 28, fontWeight: '900', color: '#1B4332', marginBottom: 8 },
  label: { fontSize: 16, fontWeight: '700', color: '#1B4332', marginTop: 8 },
  cropGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  cropCard: { 
    width: (width - 60) / 2, 
    height: 100, 
    backgroundColor: '#FFFFFF', 
    borderRadius: 20, 
    justifyContent: 'center', 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8F0E5',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2
  },
  activeCrop: { backgroundColor: '#2D7A3A', borderColor: '#2D7A3A' },
  cropText: { fontSize: 16, fontWeight: 'bold', color: '#4A6741', marginTop: 8 },
  activeCropText: { color: '#FFFFFF' },
  inputRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  inputContainer: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 16, height: 56, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, borderWidth: 1, borderColor: '#E8F0E5' },
  input: { flex: 1, fontSize: 18, color: '#1B4332', fontWeight: 'bold' },
  micButton: { padding: 8 },
  unitToggle: { flexDirection: 'row', backgroundColor: '#E8F0E5', borderRadius: 12, padding: 4 },
  unitButton: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  activeUnit: { backgroundColor: '#FFFFFF' },
  unitText: { fontSize: 12, fontWeight: '900', color: '#8DA68A' },
  activeUnitText: { color: '#2D7A3A' },
  actionButton: { height: 60, backgroundColor: '#2D7A3A', borderRadius: 20, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 24, shadowColor: '#2D7A3A', shadowOpacity: 0.2, shadowRadius: 10, elevation: 8 },
  actionButtonText: { color: '#FFFFFF', fontSize: 20, fontWeight: 'bold' },
  chartSection: { marginVertical: 10 },
  labelText: { fontSize: 14, color: '#8DA68A', marginBottom: 12, fontWeight: 'bold' },
  referenceBox: { backgroundColor: '#F0F7EE', padding: 16, borderRadius: 20, flexDirection: 'row', gap: 16, alignItems: 'center', borderWidth: 1, borderColor: '#D8E8D0' },
  refLabel: { fontSize: 12, color: '#4A6741' },
  refValue: { fontSize: 18, fontWeight: '900', color: '#2D7A3A' },
  priceInputRow: { gap: 12 },
  priceInput: { backgroundColor: '#FFFFFF', height: 72, borderRadius: 20, paddingHorizontal: 24, fontSize: 32, fontWeight: '900', color: '#1B4332', textAlign: 'center', borderWidth: 1, borderColor: '#E8F0E5' },
  fpoBadge: { backgroundColor: '#1B4332', alignSelf: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  fpoText: { color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' },
  buttonRow: { flexDirection: 'row', gap: 12, marginTop: 20 },
  backButton: { flex: 1, height: 60, borderRadius: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#2D7A3A' },
  backButtonText: { color: '#2D7A3A', fontSize: 18, fontWeight: 'bold' },
  summaryCard: { backgroundColor: '#FFFFFF', padding: 24, borderRadius: 24, gap: 16, borderWidth: 1, borderColor: '#D8E8D0' },
  summaryItem: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryLabel: { color: '#8DA68A', fontSize: 16 },
  summaryValue: { color: '#1B4332', fontSize: 16, fontWeight: 'bold' },
  traceBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12, padding: 12, backgroundColor: '#F0F7EE', borderRadius: 12 },
  traceText: { color: '#2D7A3A', fontSize: 12, fontWeight: 'bold' },
  publishButton: { height: 72, backgroundColor: '#2D7A3A', borderRadius: 24, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 24, shadowColor: '#2D7A3A', shadowOpacity: 0.3, shadowRadius: 15, elevation: 12 },
  publishButtonText: { color: '#FFFFFF', fontSize: 20, fontWeight: 'bold' },
  cancelButton: { alignSelf: 'center', marginTop: 20 },
  cancelText: { color: '#8DA68A', fontWeight: 'bold' },
  successContainer: { flex: 1, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center' },
  successContent: { padding: 40, alignItems: 'center', width: '100%' },
  successTitle: { fontSize: 36, fontWeight: '900', color: '#1A2E1A', marginTop: 20 },
  successSubtitle: { fontSize: 16, color: '#4A6741', textAlign: 'center', marginTop: 8 },
  qrWrapper: { marginTop: 40, padding: 24, backgroundColor: '#FFFFFF', borderRadius: 32, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 20, elevation: 10, borderWidth: 1, borderColor: '#F0F7EE' },
  qrHeader: { fontSize: 12, fontWeight: 'bold', letterSpacing: 4, color: '#8DA68A', marginBottom: 20 },
  ssccText: { marginTop: 20, fontSize: 14, fontWeight: '900', color: '#1B4332', letterSpacing: 2 },
  blockchainIndicator: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 32, paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#F0F7EE', borderRadius: 20 },
  blockchainText: { color: '#2D7A3A', fontWeight: 'bold' },
  successActions: { flexDirection: 'row', gap: 12, marginTop: 40 },
  outlineButton: { flex: 1, height: 56, borderWidth: 2, borderColor: '#D8E8D0', borderRadius: 18, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  outlineButtonText: { color: '#4A6741', fontWeight: 'bold' },
  primaryButton: { height: 60, backgroundColor: '#2D7A3A', borderRadius: 20, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32, marginTop: 24 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' }
});
