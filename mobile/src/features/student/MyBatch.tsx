import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import Card from '@/components/common/Card';
import EmptyState from '@/components/common/EmptyState';
import ErrorMessage from '@/components/common/ErrorMessage';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useBatches } from '@/hooks/useBatches';
import type { Batch } from '@/types';

const MyBatch: React.FC = () => {
  const { batches, isLoading, error, refresh } = useBatches();

  if (isLoading) return <LoadingSpinner message="Loading batches..." />;
  if (error) return <ErrorMessage message={error} onRetry={refresh} />;

  const renderItem = ({ item }: { item: Batch }) => (
    <Card>
      <Text style={styles.batchName}>{item.name}</Text>
      {item.subject ? (
        <Text style={styles.subject}>📚 {item.subject}</Text>
      ) : null}
      {item.schedule ? (
        <Text style={styles.schedule}>🗓 {item.schedule}</Text>
      ) : null}
      <View style={styles.meta}>
        {item.maxStudents ? (
          <Text style={styles.metaText}>Max students: {item.maxStudents}</Text>
        ) : null}
        <Text style={[styles.metaText, item.isActive ? styles.active : styles.inactive]}>
          {item.isActive ? '● Active' : '● Inactive'}
        </Text>
      </View>
    </Card>
  );

  return (
    <FlatList
      style={styles.container}
      data={batches}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={styles.list}
      ListEmptyComponent={
        <EmptyState
          icon="📚"
          title="Not enrolled in any batch"
          description="Ask your teacher to add you to a batch"
        />
      }
      onRefresh={refresh}
      refreshing={isLoading}
    />
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
    marginBottom: 6,
  },
  container: {
    backgroundColor: '#F9FAFB',
    flex: 1,
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
    fontSize: 14,
    marginBottom: 4,
  },
  subject: {
    color: '#4F46E5',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
});

export default MyBatch;
