import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import Card from '@/components/common/Card';
import Badge from '@/components/common/Badge';
import EmptyState from '@/components/common/EmptyState';
import ErrorMessage from '@/components/common/ErrorMessage';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import * as testApi from '@/services/testApi';
import type { TestResult } from '@/types';

const TestResults: React.FC = () => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await testApi.getMyTestResults();
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load results');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  if (isLoading) return <LoadingSpinner message="Loading results..." />;
  if (error) return <ErrorMessage message={error} onRetry={() => { void load(); }} />;

  const getGradeVariant = (
    pct: number,
  ): 'success' | 'info' | 'warning' | 'danger' => {
    if (pct >= 80) return 'success';
    if (pct >= 60) return 'info';
    if (pct >= 40) return 'warning';
    return 'danger';
  };

  return (
    <FlatList
      style={styles.container}
      data={results}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      onRefresh={() => { void load(); }}
      refreshing={isLoading}
      ListEmptyComponent={
        <EmptyState icon="📝" title="No test results yet" />
      }
      renderItem={({ item }: { item: TestResult }) => {
        const maxMarks = item.test?.maxMarks ?? 100;
        const pct = Math.round((item.marksObtained / maxMarks) * 100);
        return (
          <Card>
            <Text style={styles.testTitle}>
              {item.test?.title ?? 'Test'}
            </Text>
            <Text style={styles.date}>
              {new Date(item.gradedAt).toLocaleDateString()}
            </Text>
            <View style={styles.row}>
              <Text style={styles.marks}>
                {item.marksObtained} / {maxMarks}
              </Text>
              <Badge label={`${pct}%`} variant={getGradeVariant(pct)} />
            </View>
            {item.remarks ? (
              <Text style={styles.remarks}>💬 {item.remarks}</Text>
            ) : null}
          </Card>
        );
      }}
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
    marginBottom: 8,
  },
  list: {
    padding: 16,
  },
  marks: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '700',
  },
  remarks: {
    color: '#6B7280',
    fontSize: 13,
    fontStyle: 'italic',
    marginTop: 6,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  testTitle: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
});

export default TestResults;
