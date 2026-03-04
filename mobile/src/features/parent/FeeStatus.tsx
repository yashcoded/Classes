import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import Card from '@/components/common/Card';
import Badge from '@/components/common/Badge';
import EmptyState from '@/components/common/EmptyState';
import ErrorMessage from '@/components/common/ErrorMessage';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import * as feeApi from '@/services/feeApi';
import type { FeeRecord, FeeStatus } from '@/types';

const FEE_BADGE: Record<FeeStatus, 'success' | 'warning' | 'danger'> = {
  paid: 'success',
  pending: 'warning',
  overdue: 'danger',
};

const FeeStatus_: React.FC = () => {
  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await feeApi.getMyFees();
      setFees(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load fees');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  if (isLoading) return <LoadingSpinner message="Loading fees..." />;
  if (error) return <ErrorMessage message={error} onRetry={() => { void load(); }} />;

  const totalDue = fees
    .filter((f) => f.status !== 'paid')
    .reduce((sum, f) => sum + f.amount, 0);

  return (
    <View style={styles.container}>
      <Card style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Total Due</Text>
        <Text style={styles.summaryAmount}>₹{totalDue}</Text>
        <Text style={styles.summaryMeta}>
          {fees.filter((f) => f.status === 'pending').length} pending ·{' '}
          {fees.filter((f) => f.status === 'overdue').length} overdue ·{' '}
          {fees.filter((f) => f.status === 'paid').length} paid
        </Text>
      </Card>

      <FlatList
        data={fees}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        onRefresh={() => { void load(); }}
        refreshing={isLoading}
        ListEmptyComponent={
          <EmptyState icon="💰" title="No fee records" />
        }
        renderItem={({ item }: { item: FeeRecord }) => (
          <Card>
            <View style={styles.row}>
              <View>
                <Text style={styles.amount}>₹{item.amount}</Text>
                <Text style={styles.due}>
                  Due: {new Date(item.dueDate).toLocaleDateString()}
                </Text>
                {item.description ? (
                  <Text style={styles.desc}>{item.description}</Text>
                ) : null}
                {item.paidDate ? (
                  <Text style={styles.paidDate}>
                    Paid: {new Date(item.paidDate).toLocaleDateString()}
                  </Text>
                ) : null}
              </View>
              <Badge label={item.status} variant={FEE_BADGE[item.status]} />
            </View>
          </Card>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  amount: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  container: {
    backgroundColor: '#F9FAFB',
    flex: 1,
  },
  desc: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 2,
  },
  due: {
    color: '#6B7280',
    fontSize: 13,
  },
  list: {
    padding: 16,
    paddingTop: 0,
  },
  paidDate: {
    color: '#065F46',
    fontSize: 12,
    marginTop: 2,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryAmount: {
    color: '#EF4444',
    fontSize: 32,
    fontWeight: '800',
    marginVertical: 4,
  },
  summaryCard: {
    alignItems: 'center',
    margin: 16,
  },
  summaryLabel: {
    color: '#6B7280',
    fontSize: 14,
  },
  summaryMeta: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 4,
  },
});

export default FeeStatus_;
