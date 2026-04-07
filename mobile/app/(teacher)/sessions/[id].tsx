import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import SessionDetail from '@/features/teacher/SessionDetail';

export default function SessionDetailPage(): React.ReactElement {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <SessionDetail sessionId={id} />;
}
