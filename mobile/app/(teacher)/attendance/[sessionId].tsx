import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import AttendanceReview from '@/features/teacher/AttendanceReview';

export default function AttendanceReviewPage(): React.ReactElement {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  return <AttendanceReview sessionId={sessionId} />;
}
