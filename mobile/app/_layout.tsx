import React from 'react';
import { Redirect, Stack } from 'expo-router';
import { AuthProvider, useAuthContext } from '@/context/AuthContext';
import LoadingSpinner from '@/components/common/LoadingSpinner';

function RootLayoutContent(): React.ReactElement {
  const { isLoading, user } = useAuthContext();

  if (isLoading) {
    return <LoadingSpinner message="Loading..." />;
  }

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(teacher)" />
      <Stack.Screen name="(student)" />
      <Stack.Screen name="(parent)" />
      <Stack.Screen name="index" />
    </Stack>
  );
}

export default function RootLayout(): React.ReactElement {
  return (
    <AuthProvider>
      <RootLayoutContent />
    </AuthProvider>
  );
}
