import React from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import Card from '@/components/common/Card';
import EmptyState from '@/components/common/EmptyState';
import ErrorMessage from '@/components/common/ErrorMessage';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useBatches } from '@/hooks/useBatches';
import type { Batch } from '@/types';

const BatchList: React.FC = () => {
  const router = useRouter();
  const { batches, isLoading, error, refresh } = useBatches();

  if (isLoading) return <LoadingSpinner message="Loading batches..." />;
  if (error) return <ErrorMessage message={error} onRetry={refresh} />;

  const renderItem = ({ item }: { item: Batch }) => (
    <TouchableOpacity
      onPress={() =>
        router.push(`/(teacher)/batches/${item.id}` as Parameters<typeof router.push>[0])
      }
    >
      <Card>
        <Text style={styles.batchName}>{item.name}</Text>
        {item.subject ? (
          <Text style={styles.subject}>{item.subject}</Text>
        ) : null}
        {item.schedule ? (
          <Text style={styles.schedule}>🗓 {item.schedule}</Text>
        ) : null}
        <View style={styles.meta}>
          {item.maxStudents ? (
            <Text style={styles.metaText}>Max: {item.maxStudents}</Text>
          ) : null}
          <Text style={[styles.metaText, item.isActive ? styles.active : styles.inactive]}>
            {item.isActive ? '● Active' : '● Inactive'}
          </Text>
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={batches}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState
            icon="📚"
            title="No batches yet"
            description="Tap + to create your first batch"
          />
        }
        onRefresh={refresh}
        refreshing={isLoading}
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/(teacher)/batches/create')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  active: {
    color: '#065F46',
  },
  batchName: {
    color: '#111827',
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
  },
  container: {
    backgroundColor: '#F9FAFB',
    flex: 1,
  },
  fab: {
    alignItems: 'center',
    backgroundColor: '#4F46E5',
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
  inactive: {
    color: '#9CA3AF',
  },
  list: {
    padding: 16,
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  metaText: {
    color: '#6B7280',
    fontSize: 13,
  },
  schedule: {
    color: '#6B7280',
    fontSize: 13,
    marginBottom: 4,
  },
  subject: {
    color: '#4F46E5',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
});

export default BatchList;
