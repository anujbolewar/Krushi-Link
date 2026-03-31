import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider, MD3LightTheme as DefaultTheme } from 'react-native-paper';
import { RootNavigator } from './src/navigation/StackNavigator';
import { COLORS } from './src/theme/colors';

// Define Paper Theme overriding default values
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: COLORS.primary,
    secondary: COLORS.accent,
    error: COLORS.error,
    background: COLORS.background,
    surface: COLORS.surface,
    onPrimary: COLORS.surface,
  },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <RootNavigator />
        <StatusBar style="auto" />
      </PaperProvider>
    </SafeAreaProvider>
  );
}
