import React from 'react';
import { Stack } from 'expo-router';

export default function StudentLayout(): React.ReactElement {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="batch" />
      <Stack.Screen name="qr-scan" />
      <Stack.Screen name="attendance" />
      <Stack.Screen name="class-logs" />
      <Stack.Screen name="tests" />
    </Stack>
  );
}
