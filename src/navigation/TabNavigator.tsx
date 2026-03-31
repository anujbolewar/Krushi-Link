import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { HomeScreen } from '../screens/HomeScreen';
import { MyLotsScreen } from '../screens/MyLotsScreen';
import { PriceDiscoveryScreen } from '../screens/PriceDiscoveryScreen';
import { FarmerProfileScreen } from '../screens/FarmerProfileScreen';
import { COLORS } from '../theme/colors';

export type MainTabParamList = {
  Home: undefined;
  Listings: undefined;
  Prices: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

export const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#2D7A3A',
        tabBarInactiveTintColor: '#8DA68A',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E8F0E5',
          height: 70,
          paddingBottom: 12,
          paddingTop: 12,
        },
        headerStyle: {
          backgroundColor: '#1B4332',
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: '900',
        },
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ 
          title: 'मुख्य',
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="home-variant" size={size} color={color} /> 
        }} 
      />
      <Tab.Screen 
        name="Listings" 
        component={MyLotsScreen} 
        options={{ 
          title: 'विक्री',
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="shopping" size={size} color={color} /> 
        }} 
      />
      <Tab.Screen 
        name="Prices" 
        component={PriceDiscoveryScreen} 
        options={{ 
          title: 'दर',
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="trending-up" size={size} color={color} /> 
        }} 
      />
      <Tab.Screen 
        name="Profile" 
        component={FarmerProfileScreen} 
        options={{ 
          title: 'प्रोफाइल',
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="account" size={size} color={color} /> 
        }} 
      />
    </Tab.Navigator>
  );
};
