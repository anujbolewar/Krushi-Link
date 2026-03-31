import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../theme/colors';

interface GradeChipProps {
  grade: 'A' | 'B' | 'C';
  size?: 'sm' | 'lg';
}

const GRADE_CONFIG = {
  A: { color: COLORS.grade_a, label: 'उत्तम' },
  B: { color: COLORS.grade_b, label: 'चांगले' },
  C: { color: COLORS.grade_c, label: 'साधारण' },
};

export const GradeChip: React.FC<GradeChipProps> = ({ grade, size = 'sm' }) => {
  const config = GRADE_CONFIG[grade] || GRADE_CONFIG.C;
  const isLarge = size === 'lg';

  return (
    <View style={[
      styles.container, 
      { backgroundColor: config.color + '20', borderColor: config.color }, // Add slight transparency for bg
      isLarge && styles.containerLg
    ]}>
      <Text style={[
        styles.text, 
        { color: config.color },
        isLarge && styles.textLg
      ]}>
        {grade} • {config.label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
  containerLg: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  text: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  textLg: {
    fontSize: 16,
  },
});
