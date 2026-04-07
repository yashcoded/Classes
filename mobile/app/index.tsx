import React from 'react';
import { Redirect } from 'expo-router';
import { useAuthContext } from '@/context/AuthContext';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function Index(): React.ReactElement {
  const { user, isLoading } = useAuthContext();

  if (isLoading) {
    return <LoadingSpinner message="Loading..." />;
  }

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  if (user.role === 'teacher') {
    if (user.status === 'pending') {
      return <Redirect href="/(teacher)/pending-approval" />;
    }
    return <Redirect href="/(teacher)/dashboard" />;
  }

  if (user.role === 'student') {
    return <Redirect href="/(student)/dashboard" />;
  }

  if (user.role === 'parent') {
    return <Redirect href="/(parent)/dashboard" />;
  }

  if (user.role === 'admin') {
    return <Redirect href="/(admin)/dashboard" />;
  }

  return <Redirect href="/(auth)/login" />;
}
