import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LanguageSelectScreen } from '../screens/LanguageSelectScreen';
import { VoiceOnboardingScreen } from '../screens/VoiceOnboardingScreen';
import { FarmDetailsScreen } from '../screens/FarmDetailsScreen';
import { OnboardingCompleteScreen } from '../screens/OnboardingCompleteScreen';

export type OnboardingStackParamList = {
  LanguageSelect: undefined;
  VoiceOnboarding: undefined;
  FarmDetails: undefined;
  OnboardingComplete: undefined;
};

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export const OnboardingNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="LanguageSelect" component={LanguageSelectScreen} />
      <Stack.Screen name="VoiceOnboarding" component={VoiceOnboardingScreen} />
      <Stack.Screen name="FarmDetails" component={FarmDetailsScreen} />
      <Stack.Screen name="OnboardingComplete" component={OnboardingCompleteScreen} />
    </Stack.Navigator>
  );
};
