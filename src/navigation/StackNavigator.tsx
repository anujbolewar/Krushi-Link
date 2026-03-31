import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { TabNavigator } from './TabNavigator';
import { OnboardingNavigator } from './OnboardingNavigator';
import { SplashScreen } from '../screens/SplashScreen';
import { useAuthStore } from '../hooks/useAuthStore';

import { GradingScreen } from '../screens/GradingScreen';
import { CreateListingScreen } from '../screens/CreateListingScreen';

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Main: undefined;
  Grading: undefined;
  CreateListing: { gradingResult: any };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
  const isRegistered = useAuthStore((state) => state.isRegistered);

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'fade',
        }}
        initialRouteName="Splash"
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        
        {!isRegistered ? (
          <Stack.Screen name="Onboarding" component={OnboardingNavigator} />
        ) : (
          <>
            <Stack.Screen name="Main" component={TabNavigator} />
            <Stack.Screen name="Grading" component={GradingScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
