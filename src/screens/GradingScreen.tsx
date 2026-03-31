import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, Image, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { gradingService, GradingResultData } from '../services/grading';
import { GradeChip } from '../components/ui/GradeChip';
import { COLORS } from '../theme/colors';

const { width, height } = Dimensions.get('window');

const PROGRESS_STEPS = ["कॅमेरा सुरू करत आहे...", "विश्लेषण...", "दर्जा तपासत आहे...", "पूर्ण!"];

export const GradingScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const [permission, requestPermission] = useCameraPermissions();
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisStep, setAnalysisStep] = useState(0);
    const [capturedPhotos, setCapturedPhotos] = useState<string[]>([]);
    const [results, setResults] = useState<GradingResultData | null>(null);
    const [lightLevel, setLightLevel] = useState<'good' | 'amber' | 'red'>('good');
    
    const cameraRef = useRef<CameraView | null>(null);
    const slideAnim = useRef(new Animated.Value(height)).current;
    const bracketAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (!permission) {
            requestPermission();
        }

        // Simple animated bracket effect
        Animated.loop(
            Animated.sequence([
                Animated.timing(bracketAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
                Animated.timing(bracketAnim, { toValue: 0, duration: 1500, useNativeDriver: true }),
            ])
        ).start();
    }, [permission]);

    const handleCapture = async () => {
        if (!cameraRef.current) return;
        
        try {
            // Simplified capture for demo
            const photo = await cameraRef.current.takePictureAsync({ quality: 0.8, base64: true });
            if (!photo) return;
            
            const newPhotos = [...capturedPhotos, photo.uri];
            setCapturedPhotos(newPhotos);

            if (newPhotos.length >= 3) {
                // Start Analysis
                setIsAnalyzing(true);
                setAnalysisStep(1);

                // Simulation of step progress
                const stepInterval = setInterval(() => {
                    setAnalysisStep(prev => (prev < 3 ? prev + 1 : prev));
                }, 1000);

                const result = await gradingService.analyzeImages(newPhotos, 'LOT-123');
                setResults(result);
                clearInterval(stepInterval);
                setAnalysisStep(3);
                
                // Show Result Card
                Animated.spring(slideAnim, {
                    toValue: height * 0.35,
                    useNativeDriver: true,
                    bounciness: 4
                }).start();
            }
        } catch (e) {
            console.error('Capture failed', e);
        }
    };

    if (!permission) return <View style={styles.container} />;
    if (!permission.granted) return <View style={styles.container}><Text style={{color: 'white'}}>नो कॅमेरा एक्सेस</Text></View>;

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <MaterialCommunityIcons name="arrow-left" size={28} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>माल तपासा (AI Grading)</Text>
                <View style={{ width: 28 }} />
            </View>

            {/* Viewfinder */}
            <View style={styles.viewfinderContainer}>
                <CameraView 
                    style={styles.camera} 
                    facing="back"
                    ref={cameraRef}
                >
                    <View style={styles.overlay}>
                        <Animated.View style={[styles.brackets, { opacity: bracketAnim }]}>
                            <View style={[styles.corner, styles.topLeft]} />
                            <View style={[styles.corner, styles.topRight]} />
                            <View style={[styles.corner, styles.bottomLeft]} />
                            <View style={[styles.corner, styles.bottomRight]} />
                        </Animated.View>
                        
                        <Text style={styles.instructionText}>माल सपाट ठेवा, नैसर्गिक प्रकाशात</Text>
                        
                        <View style={styles.lightIndicator}>
                           <View style={[styles.lightDot, { backgroundColor: lightLevel === 'good' ? '#4BB543' : lightLevel === 'amber' ? '#ffcc00' : '#ff3300' }]} />
                           <Text style={styles.lightLabel}>प्रकाश: {lightLevel === 'good' ? 'उत्तम' : 'मध्यम'}</Text>
                        </View>
                    </View>
                </CameraView>
            </View>

            {/* Shutter Area */}
            <View style={styles.shutterArea}>
                <View style={styles.thumbnails}>
                    {[0, 1, 2].map(i => (
                        <View key={i} style={styles.thumbnailSlot}>
                            {capturedPhotos[i] ? (
                                <Image source={{ uri: capturedPhotos[i] }} style={styles.photo} />
                            ) : (
                                <MaterialCommunityIcons name="image-outline" size={20} color="#8DA68A" />
                            )}
                        </View>
                    ))}
                </View>

                <TouchableOpacity 
                  style={[styles.shutter, capturedPhotos.length >= 3 && styles.disabledShutter]} 
                  onPress={handleCapture}
                  disabled={capturedPhotos.length >= 3}
                >
                    <View style={styles.shutterInner} />
                </TouchableOpacity>

                <View style={{ width: 80 }} /> 
            </View>

            {/* Analysis Progress */}
            {isAnalyzing && !results && (
                <View style={styles.analysisOverlay}>
                    <ActivityIndicator size="large" color="#FFFFFF" />
                    <Text style={styles.analysisStepText}>{PROGRESS_STEPS[analysisStep]}</Text>
                </View>
            )}

            {/* Result Card */}
            <Animated.View style={[styles.resultCard, { transform: [{ translateY: slideAnim }] }]}>
                <View style={styles.handle} />
                {results && (
                    <View style={styles.resultContent}>
                        <View style={styles.gradeCircleContainer}>
                             <View style={[styles.gradeCircle, { borderColor: results.grade === 'A' ? '#4BB543' : '#F4A261' }]}>
                                <Text style={[styles.gradeText, { color: results.grade === 'A' ? '#4BB543' : '#F4A261' }]}>{results.grade}</Text>
                             </View>
                             <Text style={styles.gradeLabel}>{results.grade === 'A' ? 'उत्तम दर्जा' : 'चांगला दर्जा'}</Text>
                        </View>

                        <View style={styles.detailsRow}>
                             {results.defects.map((d, i) => (
                                 <View key={i} style={styles.defectChip}>
                                     <Text style={styles.defectText}>{d}</Text>
                                 </View>
                             ))}
                             <View style={styles.moistureBox}>
                                 <MaterialCommunityIcons name="water-outline" size={20} color={results.moisture ? '#F4A261' : '#4BB543'} />
                                 <Text style={[styles.moistureText, { color: results.moisture ? '#F4A261' : '#4BB543' }]}>{results.moisture ? 'ओलावा' : 'कोरडे'}</Text>
                             </View>
                        </View>

                        <Text style={styles.metadata}>
                            वेळ: {new Date().toLocaleTimeString()}  |  GPS: २१.१४, ७९.०८ (Nagpur)
                        </Text>

                        <View style={styles.actionButtons}>
                            <TouchableOpacity style={styles.secondaryButton}>
                                <MaterialCommunityIcons name="file-pdf-box" size={24} color="#2D7A3A" />
                                <Text style={styles.secondaryButtonText}>प्रमाणपत्र</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('CreateListing', { gradingResult: results })}>
                                <Text style={styles.primaryButtonText}>पुढे - विकणे</Text>
                                <MaterialCommunityIcons name="arrow-right" size={24} color="#FFFFFF" />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
    },
    header: {
        paddingTop: 50,
        paddingHorizontal: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: 20,
    },
    headerTitle: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    viewfinderContainer: {
        height: height * 0.65,
        width: width,
        overflow: 'hidden',
        borderRadius: 20,
    },
    camera: {
        flex: 1,
    },
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    brackets: {
        width: width * 0.7,
        height: width * 0.7,
        justifyContent: 'center',
        alignItems: 'center',
    },
    corner: {
        position: 'absolute',
        width: 40,
        height: 40,
        borderColor: '#4BB543',
    },
    topLeft: { left: -10, top: -10, borderLeftWidth: 4, borderTopWidth: 4 },
    topRight: { right: -10, top: -10, borderRightWidth: 4, borderTopWidth: 4 },
    bottomLeft: { left: -10, bottom: -10, borderLeftWidth: 4, borderBottomWidth: 4 },
    bottomRight: { right: -10, bottom: -10, borderRightWidth: 4, borderBottomWidth: 4 },
    instructionText: {
        color: '#FFFFFF',
        marginTop: 40,
        fontSize: 14,
        fontWeight: 'bold',
        backgroundColor: 'rgba(0,0,0,0.4)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    lightIndicator: {
        position: 'absolute',
        top: 20,
        right: 20,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
    },
    lightDot: { width: 10, height: 10, borderRadius: 5, marginRight: 6 },
    lightLabel: { color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' },
    shutterArea: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 30,
        paddingTop: 30,
    },
    thumbnails: { flexDirection: 'row', gap: 10 },
    thumbnailSlot: {
        width: 48,
        height: 48,
        backgroundColor: '#1A2E1A',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#2D7A3A',
    },
    photo: { width: 48, height: 48 },
    shutter: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    shutterInner: {
        width: 62,
        height: 62,
        borderRadius: 31,
        borderWidth: 2,
        borderColor: '#000000',
    },
    disabledShutter: { opacity: 0.3 },
    analysisOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100,
    },
    analysisStepText: { color: '#FFFFFF', marginTop: 16, fontSize: 18, fontWeight: '900' },
    resultCard: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: height * 0.7,
        backgroundColor: '#F7F9F3',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 24,
    },
    handle: {
        width: 40,
        height: 5,
        backgroundColor: '#D8E8D0',
        borderRadius: 10,
        alignSelf: 'center',
        marginBottom: 20,
    },
    resultContent: { flex: 1, alignItems: 'center' },
    gradeCircleContainer: { alignItems: 'center', marginBottom: 24 },
    gradeCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 6,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    gradeText: { fontSize: 48, fontWeight: '900' },
    gradeLabel: { fontSize: 24, fontWeight: 'bold', color: '#1B4332' },
    detailsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center', marginBottom: 20 },
    defectChip: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#D8E8D0',
    },
    defectText: { color: '#4A6741', fontWeight: 'bold' },
    moistureBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#D8E8D0',
        gap: 6,
    },
    moistureText: { fontWeight: 'bold' },
    metadata: { color: '#8DA68A', fontSize: 12, marginBottom: 30 },
    actionButtons: { width: '100%', gap: 16 },
    primaryButton: {
        flexDirection: 'row',
        backgroundColor: '#2D7A3A',
        height: 64,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
    },
    primaryButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
    secondaryButton: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        height: 56,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#2D7A3A',
        gap: 12,
    },
    secondaryButtonText: { color: '#2D7A3A', fontSize: 18, fontWeight: 'bold' },
});
