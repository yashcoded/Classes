import React, { useCallback, useEffect, useState } from 'react';
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
import * as testApi from '@/services/testApi';
import { useBatches } from '@/hooks/useBatches';
import type { Batch, Test } from '@/types';

const TestList: React.FC = () => {
  const router = useRouter();
  const { batches, isLoading: batchLoading } = useBatches();
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [tests, setTests] = useState<Test[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTests = useCallback(async (batchId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await testApi.getBatchTests(batchId);
      setTests(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tests');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (batches.length > 0 && !selectedBatchId) {
      const firstId = batches[0]?.id ?? '';
      setSelectedBatchId(firstId);
      if (firstId) void loadTests(firstId);
    }
  }, [batches, selectedBatchId, loadTests]);

  const handleSelectBatch = (id: string) => {
    setSelectedBatchId(id);
    void loadTests(id);
  };

  if (batchLoading) return <LoadingSpinner message="Loading..." />;

  return (
    <View style={styles.container}>
      <FlatList
        horizontal
        data={batches}
        keyExtractor={(b) => b.id}
        style={styles.batchTabs}
        contentContainerStyle={styles.batchTabsContent}
        renderItem={({ item }: { item: Batch }) => (
          <TouchableOpacity
            style={[
              styles.batchTab,
              selectedBatchId === item.id && styles.batchTabActive,
            ]}
            onPress={() => handleSelectBatch(item.id)}
          >
            <Text
              style={[
                styles.batchTabText,
                selectedBatchId === item.id && styles.batchTabTextActive,
              ]}
            >
              {item.name}
            </Text>
          </TouchableOpacity>
        )}
      />

      {error ? <ErrorMessage message={error} /> : null}
      {isLoading ? (
        <LoadingSpinner message="Loading tests..." />
      ) : (
        <FlatList
          data={tests}
          keyExtractor={(t) => t.id}
          contentContainerStyle={[
            styles.list,
            tests.length === 0 ? styles.emptyList : null,
          ]}
          ListEmptyComponent={
            <EmptyState
              icon="📝"
              title="No tests yet"
              description="Create a test for this batch"
            />
          }
          renderItem={({ item }: { item: Test }) => (
            <TouchableOpacity
              onPress={() =>
                router.push(
                  `/(teacher)/tests/${item.id}/marks` as Parameters<typeof router.push>[0],
                )
              }
            >
              <Card>
                <Text style={styles.testTitle}>{item.title}</Text>
                <Text style={styles.testMeta}>
                  📅 {new Date(item.date).toLocaleDateString()} · Max:{' '}
                  {item.maxMarks} marks
                </Text>
                {item.description ? (
                  <Text style={styles.testDesc}>{item.description}</Text>
                ) : null}
              </Card>
            </TouchableOpacity>
          )}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/(teacher)/tests/create')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  batchTab: {
    borderColor: '#D1D5DB',
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  batchTabActive: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  batchTabText: {
    color: '#6B7280',
    fontSize: 13,
  },
  batchTabTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  batchTabs: {
    maxHeight: 52,
  },
  batchTabsContent: {
    padding: 12,
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
  list: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: 96,
  },
  emptyList: {
    justifyContent: 'center',
  },
  testDesc: {
    color: '#6B7280',
    fontSize: 13,
    marginTop: 4,
  },
  testMeta: {
    color: '#6B7280',
    fontSize: 13,
    marginTop: 4,
  },
  testTitle: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TestList;
