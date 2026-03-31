import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Svg, Path } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../hooks/useAuthStore';

const { width } = Dimensions.get('window');

const WheatIcon = ({ color }: { color: string }) => (
  <Svg width="120" height="120" viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2C12 2 10 6 10 10C10 14 12 18 12 18M12 2C12 2 14 6 14 10C14 14 12 18 12 18M12 18V22M7 8C7 8 8 9 9 10M17 8C17 8 16 9 15 10M6 12C6 12 8 13 9 14M18 12C18 12 16 13 15 14"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </Svg>
);

export const SplashScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const isRegistered = useAuthStore((state) => state.isRegistered);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      if (isRegistered) {
        navigation.replace('Main');
      } else {
        navigation.replace('Onboarding');
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [isRegistered, navigation]);

  return (
    <LinearGradient
      colors={['#1B4332', '#2D7A3A', '#52B788']}
      style={styles.container}
    >
      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <View style={styles.iconContainer}>
          <WheatIcon color="#FFFFFF" />
        </View>
        <Text style={styles.logoText}>कृषिLink</Text>
        <Text style={styles.tagline}>शेतापासून जगापर्यंत</Text>
      </Animated.View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 24,
  },
  logoText: {
    fontSize: 42,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  tagline: {
    fontSize: 18,
    color: '#FFFFFF',
    marginTop: 8,
    opacity: 0.9,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
});
