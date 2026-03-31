import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../theme/colors';

interface OfflineBarProps {
  isOffline: boolean;
  pendingSyncCount: number;
}

export const OfflineBar: React.FC<OfflineBarProps> = ({ isOffline, pendingSyncCount }) => {
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (isOffline) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isOffline, slideAnim]);

  return (
    <Animated.View 
      style={[
        styles.container, 
        { 
          paddingTop: insets.top ? insets.top + -8 : 10,
          transform: [{ translateY: slideAnim }] 
        }
      ]}
    >
      <MaterialCommunityIcons name="wifi-off" size={20} color={COLORS.textPrimary} />
      <Text style={styles.text}>
        Offline Mode. {pendingSyncCount} item(s) pending sync.
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.warning,
    paddingBottom: 10,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  text: {
    marginLeft: 8,
    color: COLORS.textPrimary,
    fontWeight: 'bold',
    fontSize: 14,
  },
});
