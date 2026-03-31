import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, SafeAreaView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore } from '../hooks/useAuthStore';
import { COLORS } from '../theme/colors';

const QRPlaceholder = () => (
    <View style={styles.qrContainer}>
        <View style={styles.qrContent}>
            {[...Array(9)].map((_, i) => (
                <View key={i} style={styles.qrBlock} />
            ))}
            <View style={styles.qrLogo}>
                <MaterialCommunityIcons name="corn" size={32} color={COLORS.primary} />
            </View>
        </View>
    </View>
);

export const OnboardingCompleteScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const setRegistered = useAuthStore((state) => state.setRegistered);
    
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 5,
                useNativeDriver: true,
            }),
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            })
        ]).start();
    }, []);

    const handleFinish = () => {
        setRegistered(true);
        // The StackNavigator will re-render and pick up the MainTab automatically
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Animated.View style={[styles.successIcon, { transform: [{ scale: scaleAnim }] }]}>
                    <MaterialCommunityIcons name="check-circle" size={80} color="#2D7A3A" />
                </Animated.View>

                <Animated.View style={{ opacity: fadeAnim, alignItems: 'center' }}>
                    <Text style={styles.title}>अभिनंदन!</Text>
                    <Text style={styles.subtitle}>तुमची नोंदणी यशस्वी झाली आहे</Text>
                    
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>तुमचं कृषी ओळखपत्र (Farmer ID)</Text>
                        <QRPlaceholder />
                        <Text style={styles.farmerId}>KL-2026-R89P</Text>
                    </View>
                </Animated.View>

                <TouchableOpacity 
                    style={styles.finishButton}
                    onPress={handleFinish}
                >
                    <Text style={styles.finishButtonText}>डॅशबोर्डवर जा</Text>
                    <MaterialCommunityIcons name="arrow-right" size={24} color="#FFFFFF" />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7F9F3',
    },
    content: {
        flex: 1,
        padding: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    successIcon: {
        marginBottom: 24,
    },
    title: {
        fontSize: 36,
        fontWeight: '900',
        color: '#1A2E1A',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 18,
        color: '#4A6741',
        marginBottom: 40,
        textAlign: 'center',
    },
    card: {
        backgroundColor: '#FFFFFF',
        width: '100%',
        padding: 24,
        borderRadius: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
        borderWidth: 1,
        borderColor: '#E8F0E5',
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1B4332',
        marginBottom: 20,
    },
    qrContainer: {
        width: 160,
        height: 160,
        backgroundColor: '#F0F7EE',
        borderRadius: 16,
        padding: 12,
        marginBottom: 16,
    },
    qrContent: {
        flex: 1,
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    qrBlock: {
        width: 32,
        height: 32,
        backgroundColor: '#1B4332',
        borderRadius: 4,
        opacity: 0.8,
    },
    qrLogo: {
        position: 'absolute',
        backgroundColor: '#F0F7EE',
        padding: 4,
        borderRadius: 8,
    },
    farmerId: {
        fontSize: 18,
        fontWeight: '800',
        color: '#2D7A3A',
        letterSpacing: 2,
    },
    finishButton: {
        position: 'absolute',
        bottom: 40,
        backgroundColor: '#2D7A3A',
        width: '100%',
        height: 64,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 6,
    },
    finishButtonText: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: 'bold',
        marginRight: 10,
    },
});
