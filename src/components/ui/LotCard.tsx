import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Lot } from '@krushilink/shared/types';
import { COLORS } from '../../theme/colors';
import { GradeChip } from './GradeChip';

interface LotCardProps {
  lot: Lot;
  onPress: () => void;
}

const CROP_EMOJI: Record<string, string> = {
  orange: '🍊',
  grape: '🍇',
  soybean: '🫘',
  onion: '🧅'
};

const getStatusConfig = (status: Lot['status']) => {
  switch (status) {
    case 'listed':
      return { color: '#007BFF', label: 'Listed' };
    case 'matched':
      return { color: COLORS.warning, label: 'Matched' };
    case 'sold':
      return { color: COLORS.success, label: 'Sold' };
    default:
      return { color: COLORS.textMuted, label: 'Draft' };
  }
};

export const LotCard: React.FC<LotCardProps> = ({ lot, onPress }) => {
  const statusConfig = getStatusConfig(lot.status);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.header}>
        <View style={styles.cropInfo}>
          <Text style={styles.emoji}>{CROP_EMOJI[lot.cropType] || '🌾'}</Text>
          <Text style={styles.cropName}>{lot.cropType.toUpperCase()}</Text>
        </View>
        <View style={[styles.statusPill, { backgroundColor: statusConfig.color }]}>
          <Text style={styles.statusText}>{statusConfig.label}</Text>
        </View>
      </View>

      <View style={styles.detailsContainer}>
        <View style={styles.detailColumn}>
          <Text style={styles.label}>Quantity</Text>
          <Text style={styles.value}>{lot.quantity} {lot.unit}</Text>
        </View>
        
        <View style={styles.detailColumn}>
          <Text style={styles.label}>Price Floor</Text>
          <Text style={styles.value}>₹{lot.priceFloor}</Text>
        </View>

        <View style={styles.detailColumn}>
          <Text style={styles.label}>Grade</Text>
          {lot.grade ? (
            <GradeChip grade={lot.grade} size="sm" />
          ) : (
            <Text style={styles.value}>N/A</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cropInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 24,
    marginRight: 8,
  },
  cropName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  statusPill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: COLORS.surface,
    fontSize: 12,
    fontWeight: 'bold',
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  detailColumn: {
    flex: 1,
    alignItems: 'flex-start',
  },
  label: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
});
