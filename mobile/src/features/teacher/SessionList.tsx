import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import Card from '@/components/common/Card';
import EmptyState from '@/components/common/EmptyState';
import ErrorMessage from '@/components/common/ErrorMessage';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import Badge from '@/components/common/Badge';
import { useSessions } from '@/hooks/useSessions';
import type { ClassSession, SessionStatus } from '@/types';

const STATUS_BADGE: Record<SessionStatus, 'success' | 'info' | 'default' | 'warning'> = {
  active: 'success',
  cancelled: 'default',
  completed: 'info',
  scheduled: 'warning',
};

const SessionList: React.FC = () => {
  const router = useRouter();
  const { sessions, isLoading, error, refresh } = useSessions();

  if (isLoading) return <LoadingSpinner message="Loading sessions..." />;
  if (error) return <ErrorMessage message={error} onRetry={refresh} />;

  const renderItem = ({ item }: { item: ClassSession }) => (
    <TouchableOpacity
      onPress={() =>
        router.push(
          `/(teacher)/sessions/${item.id}` as Parameters<typeof router.push>[0],
        )
      }
    >
      <Card>
        <Text style={styles.date}>
          {new Date(item.scheduledAt).toLocaleDateString(undefined, {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </Text>
        <Text style={styles.time}>
          {new Date(item.scheduledAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
        <Badge label={item.status} variant={STATUS_BADGE[item.status]} />
      </Card>
    </TouchableOpacity>
  );

  return (
    <FlatList
      style={styles.container}
      data={sessions}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={styles.list}
      ListEmptyComponent={
        <EmptyState
          icon="📅"
          title="No sessions yet"
          description="Create a session from a batch"
        />
      }
      onRefresh={refresh}
      refreshing={isLoading}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F9FAFB',
    flex: 1,
  },
  date: {
    color: '#111827',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  list: {
    padding: 16,
  },
  time: {
    color: '#6B7280',
    fontSize: 13,
    marginBottom: 8,
  },
});

export default SessionList;
