import React from 'react';
import { Stack } from 'expo-router';

export default function ParentLayout(): React.ReactElement {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="link-student" />
      <Stack.Screen name="progress" />
      <Stack.Screen name="attendance" />
      <Stack.Screen name="tests" />
      <Stack.Screen name="fees" />
      <Stack.Screen name="notifications" />
    </Stack>
  );
}
