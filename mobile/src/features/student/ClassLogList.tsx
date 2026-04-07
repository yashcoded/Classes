import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text } from 'react-native';
import Card from '@/components/common/Card';
import EmptyState from '@/components/common/EmptyState';
import ErrorMessage from '@/components/common/ErrorMessage';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import * as classLogApi from '@/services/classLogApi';
import { useBatches } from '@/hooks/useBatches';
import type { ClassLog } from '@/types';

const ClassLogList: React.FC = () => {
  const { batches } = useBatches();
  const [logs, setLogs] = useState<ClassLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (batches.length === 0) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const allLogs = await Promise.all(
        batches.map((b) => classLogApi.getBatchClassLogs(b.id)),
      );
      const flat = allLogs.flat().sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      );
      setLogs(flat);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load class logs');
    } finally {
      setIsLoading(false);
    }
  }, [batches]);

  useEffect(() => { void load(); }, [load]);

  if (isLoading) return <LoadingSpinner message="Loading class logs..." />;
  if (error) return <ErrorMessage message={error} onRetry={() => { void load(); }} />;

  return (
    <FlatList
      style={styles.container}
      data={logs}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      onRefresh={() => { void load(); }}
      refreshing={isLoading}
      ListEmptyComponent={
        <EmptyState icon="📝" title="No class logs yet" />
      }
      renderItem={({ item }: { item: ClassLog }) => (
        <Card>
          <Text style={styles.date}>{new Date(item.date).toLocaleDateString()}</Text>
          <Text style={styles.topic}>{item.topicTaught}</Text>
          {item.subtopic ? (
            <Text style={styles.subtopic}>{item.subtopic}</Text>
          ) : null}
          {item.homework ? (
            <Text style={styles.homework}>📚 HW: {item.homework}</Text>
          ) : null}
          {item.remarks ? (
            <Text style={styles.remarks}>💬 {item.remarks}</Text>
          ) : null}
        </Card>
      )}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F9FAFB',
    flex: 1,
  },
  date: {
    color: '#9CA3AF',
    fontSize: 12,
    marginBottom: 4,
  },
  homework: {
    color: '#374151',
    fontSize: 13,
    marginTop: 6,
  },
  list: {
    padding: 16,
  },
  remarks: {
    color: '#6B7280',
    fontSize: 13,
    fontStyle: 'italic',
    marginTop: 4,
  },
  subtopic: {
    color: '#6B7280',
    fontSize: 14,
    marginBottom: 4,
  },
  topic: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
});

export default ClassLogList;
