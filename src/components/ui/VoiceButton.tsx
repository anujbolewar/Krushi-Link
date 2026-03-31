import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../theme/colors';

interface VoiceButtonProps {
  onPress: () => void;
  isRecording: boolean;
  isProcessing: boolean;
  label?: string; // e.g. 'बोला'
}

export const VoiceButton: React.FC<VoiceButtonProps> = ({ onPress, isRecording, isProcessing, label }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.3,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [isRecording, pulseAnim]);

  const getBackgroundColor = () => {
    if (isRecording) return COLORS.error;
    if (isProcessing) return COLORS.primaryLight;
    return COLORS.primary;
  };

  return (
    <View style={styles.container}>
      <View style={styles.buttonWrapper}>
        {isRecording && (
          <Animated.View
            style={[
              styles.pulseCircle,
              { transform: [{ scale: pulseAnim }], backgroundColor: COLORS.error + '40' },
            ]}
          />
        )}
        <TouchableOpacity
          style={[styles.button, { backgroundColor: getBackgroundColor() }]}
          onPress={onPress}
          activeOpacity={0.8}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator size="large" color={COLORS.surface} />
          ) : (
            <MaterialCommunityIcons name="microphone" size={40} color={COLORS.surface} />
          )}
        </TouchableOpacity>
      </View>
      {label && <Text style={styles.label}>{label}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonWrapper: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 16,
  },
  pulseCircle: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  button: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  label: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
});
