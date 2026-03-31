import { PriceForecast } from '@krushilink/shared/types';

export const MOCK_PRICES: Record<string, Record<string, PriceForecast[]>> = {
  nagpur: {
    orange: [
      { crop: 'orange', district: 'Nagpur', date: '2026-03-25', low: 40, mid: 42, high: 44, currency: 'INR', sourceData: [] },
      { crop: 'orange', district: 'Nagpur', date: '2026-03-26', low: 43, mid: 45, high: 47, currency: 'INR', sourceData: [] },
      { crop: 'orange', district: 'Nagpur', date: '2026-03-27', low: 41, mid: 43, high: 45, currency: 'INR', sourceData: [] },
      { crop: 'orange', district: 'Nagpur', date: '2026-03-28', low: 44, mid: 46, high: 48, currency: 'INR', sourceData: [] },
      { crop: 'orange', district: 'Nagpur', date: '2026-03-29', low: 46, mid: 48, high: 50, currency: 'INR', sourceData: [] },
      { crop: 'orange', district: 'Nagpur', date: '2026-03-30', low: 42, mid: 44, high: 46, currency: 'INR', sourceData: [] },
      { crop: 'orange', district: 'Nagpur', date: '2026-03-31', low: 45, mid: 47, high: 49, currency: 'INR', sourceData: [] },
    ],
    soybean: [
      { crop: 'soybean', district: 'Nagpur', date: '2026-03-31', low: 5200, mid: 5400, high: 5600, currency: 'INR', sourceData: [] },
    ]
  },
  nashik: {
    grape: [
      { crop: 'grape', district: 'Nashik', date: '2026-03-31', low: 65, mid: 70, high: 75, currency: 'INR', sourceData: [] },
    ],
    onion: [
      { crop: 'onion', district: 'Nashik', date: '2026-03-31', low: 18, mid: 22, high: 26, currency: 'INR', sourceData: [] },
    ]
  }
};

export const getForecast = (district: string, crop: string): PriceForecast[] => {
  return MOCK_PRICES[district.toLowerCase()]?.[crop.toLowerCase()] || [];
};
