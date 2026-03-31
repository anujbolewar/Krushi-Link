import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { COLORS } from '../../theme/colors';

interface SyncStatusDotProps {
  status: 'synced' | 'pending' | 'offline';
}

export const SyncStatusDot: React.FC<SyncStatusDotProps> = ({ status }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (status === 'pending') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.5,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [status, pulseAnim]);

  const getColor = () => {
    switch (status) {
      case 'synced':
        return COLORS.success;
      case 'pending':
        return COLORS.warning;
      case 'offline':
        return COLORS.error;
      default:
        return COLORS.offline;
    }
  };

  return (
    <View style={styles.container}>
      {status === 'pending' && (
        <Animated.View
          style={[
            styles.pulse,
            { backgroundColor: getColor() + '60', transform: [{ scale: pulseAnim }] },
          ]}
        />
      )}
      <View style={[styles.dot, { backgroundColor: getColor() }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    zIndex: 2,
  },
  pulse: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    zIndex: 1,
  },
});
