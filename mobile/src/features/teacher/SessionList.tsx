import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Card from '@/components/common/Card';
import EmptyState from '@/components/common/EmptyState';
import ErrorMessage from '@/components/common/ErrorMessage';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import Badge from '@/components/common/Badge';
import { colors } from '@/constants/branding';
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
    <SafeAreaView style={styles.safe} edges={['top']}>
    <View style={styles.container}>
      <FlatList
        data={sessions}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState
            icon="📅"
            title="No sessions yet"
            description="Tap + to create a session"
          />
        }
        onRefresh={refresh}
        refreshing={isLoading}
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/(teacher)/sessions/create')}
        activeOpacity={0.85}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    backgroundColor: colors.background,
    flex: 1,
  },
  container: {
    flex: 1,
  },
  fab: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 28,
    bottom: 24,
    elevation: 6,
    height: 56,
    justifyContent: 'center',
    position: 'absolute',
    right: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    width: 56,
  },
  fabText: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '300',
    lineHeight: 32,
  },
  date: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  list: {
    padding: 20,
  },
  time: {
    color: colors.textSecondary,
    fontSize: 13,
    marginBottom: 8,
  },
});

export default SessionList;
