import React from 'react';
import { Stack } from 'expo-router';

export default function TeacherLayout(): React.ReactElement {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="pending-approval" />
      <Stack.Screen name="approvals" />
      <Stack.Screen name="batches/index" />
      <Stack.Screen name="batches/[id]" />
      <Stack.Screen name="batches/create" />
      <Stack.Screen name="sessions/index" />
      <Stack.Screen name="sessions/[id]" />
      <Stack.Screen name="sessions/create" />
      <Stack.Screen name="attendance/[sessionId]" />
      <Stack.Screen name="class-logs/create" />
      <Stack.Screen name="tests/index" />
      <Stack.Screen name="tests/create" />
      <Stack.Screen name="tests/[id]/marks" />
      <Stack.Screen name="fees/index" />
      <Stack.Screen name="notifications/send" />
    </Stack>
  );
}
