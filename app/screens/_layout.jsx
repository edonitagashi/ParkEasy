import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
<>
  <Tabs
    screenOptions={{
      tabBarActiveTintColor: '#2E7D6A',
      tabBarInactiveTintColor: 'gray',
      tabBarStyle: {
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#E9F8F6',
        height: 60,
        paddingBottom: 8,
        paddingTop: 8,
      },
      headerShown: false,
    }}
    initialRouteName="nearby"
  >
    <Tabs.Screen
      name="nearby"
      options={{
        title: 'Nearby',
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="location" size={size} color={color} />
        ),
      }}
    />
    <Tabs.Screen
      name="SearchParkingScreen"
      options={{
        title: 'Search',
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="search" size={size} color={color} />
        ),
      }}
    />
    <Tabs.Screen
      name="HistoryScreen"
      options={{
        title: 'Bookings',
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="calendar" size={size} color={color} />
        ),
      }}
    />
    
    
    {/* NDRYSHIMI: Nëse keni FavoritesScreen, ndryshoni emrin dhe ikonën */}
    <Tabs.Screen
      name="FavoritesScreen"
      options={{
        title: 'Favorites', // Ndryshoni këtu emrin që dëshironi
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="heart" size={size} color={color} /> // Ikonë zemer
        ),
      }}
    />

    <Tabs.Screen
      name="profile"
      options={{
        title: 'Profile',
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="person" size={size} color={color} />
        ),
      }}
    />
    
    <Tabs.Screen
      name="[...unmatched]"
      options={{ href: null }}
    />
  </Tabs>
</>
  );
}