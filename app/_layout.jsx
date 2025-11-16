import React from 'react';
import { Stack } from 'expo-router';
import { RoleProvider } from './context/RoleContext';

export default function RootLayout() {
  return (
    <RoleProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </RoleProvider>
  );
}
