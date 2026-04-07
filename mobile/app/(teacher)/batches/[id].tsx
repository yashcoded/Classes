import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import BatchDetail from '@/features/teacher/BatchDetail';

export default function BatchDetailPage(): React.ReactElement {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <BatchDetail batchId={id} />;
}
