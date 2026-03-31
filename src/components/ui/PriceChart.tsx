import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { PriceForecast } from '@krushilink/shared/types';
import { COLORS } from '../../theme/colors';

const screenWidth = Dimensions.get('window').width;

interface PriceChartProps {
  forecast: PriceForecast[];
  crop: string;
}

// Map English crop names to Marathi, extend as needed
const CROP_MAP: Record<string, string> = {
  orange: 'संत्री',
  grape: 'द्राक्ष',
  soybean: 'सोयाबीन',
  onion: 'कांदा'
};

// Convert numbers to Marathi numerals
const toMarathiNumerals = (num: number | string) => {
  const digits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
  return num.toString().replace(/[0-9]/g, (w) => digits[parseInt(w, 10)]);
};

export const PriceChart: React.FC<PriceChartProps> = ({ forecast, crop }) => {
  if (!forecast || forecast.length === 0) return null;

  const labels = forecast.map(f => {
    // Show short date e.g., '10/3' -> Marathi numerals
    const d = new Date(f.date);
    return toMarathiNumerals(`${d.getDate()}/${d.getMonth() + 1}`);
  });

  const lowData = forecast.map(f => f.low);
  const midData = forecast.map(f => f.mid);
  const highData = forecast.map(f => f.high);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {CROP_MAP[crop.toLowerCase()] || crop} - ७ दिवसांचा अंदाज
      </Text>
      
      <LineChart
        data={{
          labels,
          datasets: [
            {
              data: highData,
              color: (opacity = 1) => `rgba(64, 145, 108, ${opacity})`, // Greenish for High
            },
            {
              data: midData,
              color: (opacity = 1) => `rgba(244, 162, 97, ${opacity})`, // Orange for Mid
            },
            {
              data: lowData,
              color: (opacity = 1) => `rgba(230, 57, 70, ${opacity})`, // Reddish for Low
            }
          ],
          legend: ["कमाल", "मध्यम", "किमान"]
        }}
        width={screenWidth - 40}
        height={220}
        yAxisLabel="₹ "
        formatYLabel={(yLabel) => toMarathiNumerals(yLabel)}
        chartConfig={{
          backgroundColor: COLORS.surface,
          backgroundGradientFrom: COLORS.surface,
          backgroundGradientTo: COLORS.surface,
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(45, 122, 58, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(26, 46, 26, ${opacity})`,
          style: {
            borderRadius: 16,
          },
          propsForDots: {
            r: "4",
            strokeWidth: "2"
          }
        }}
        bezier
        style={styles.chart}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 16,
    textAlign: 'center',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  }
});
