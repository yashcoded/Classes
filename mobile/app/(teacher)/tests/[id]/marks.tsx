import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import EnterMarks from '@/features/teacher/EnterMarks';

export default function EnterMarksPage(): React.ReactElement {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <EnterMarks testId={id} />;
}
