import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Card from '@/components/common/Card';
import Badge from '@/components/common/Badge';
import EmptyState from '@/components/common/EmptyState';
import ErrorMessage from '@/components/common/ErrorMessage';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useAttendance } from '@/hooks/useAttendance';
import type { AttendanceRecord, AttendanceStatus } from '@/types';

const FILTERS: { label: string; value: AttendanceStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Present', value: 'present' },
  { label: 'Absent', value: 'absent' },
  { label: 'Late', value: 'late' },
];

const AttendanceHistory: React.FC = () => {
  const { records, isLoading, error, refresh } = useAttendance();
  const [filter, setFilter] = useState<AttendanceStatus | 'all'>('all');

  const filtered =
    filter === 'all' ? records : records.filter((r) => r.status === filter);

  if (isLoading) return <LoadingSpinner message="Loading attendance..." />;
  if (error) return <ErrorMessage message={error} onRetry={refresh} />;

  return (
    <View style={styles.container}>
      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.value}
            style={[styles.filterBtn, filter === f.value && styles.filterBtnActive]}
            onPress={() => setFilter(f.value)}
          >
            <Text
              style={[styles.filterText, filter === f.value && styles.filterTextActive]}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        onRefresh={refresh}
        refreshing={isLoading}
        ListEmptyComponent={
          <EmptyState icon="📊" title="No attendance records" />
        }
        renderItem={({ item }: { item: AttendanceRecord }) => (
          <Card>
            <View style={styles.row}>
              <View>
                <Text style={styles.date}>
                  {new Date(item.checkedInAt).toLocaleDateString(undefined, {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </Text>
                <Text style={styles.method}>
                  via {item.checkInMethod} ·{' '}
                  {new Date(item.checkedInAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
              <Badge
                label={item.status}
                variant={
                  item.status === 'present'
                    ? 'success'
                    : item.status === 'late'
                    ? 'warning'
                    : 'danger'
                }
              />
            </View>
          </Card>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F9FAFB',
    flex: 1,
  },
  date: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '600',
  },
  filterBtn: {
    borderColor: '#D1D5DB',
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  filterBtnActive: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    padding: 12,
  },
  filterText: {
    color: '#6B7280',
    fontSize: 13,
  },
  filterTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  list: {
    padding: 16,
    paddingTop: 4,
  },
  method: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 2,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default AttendanceHistory;
