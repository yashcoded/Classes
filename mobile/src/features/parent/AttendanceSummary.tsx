import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import Card from '@/components/common/Card';
import Badge from '@/components/common/Badge';
import EmptyState from '@/components/common/EmptyState';
import ErrorMessage from '@/components/common/ErrorMessage';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import * as reportApi from '@/services/reportApi';
import type { StudentReport, AttendanceRecord } from '@/types';

const AttendanceSummary: React.FC = () => {
  const [report, setReport] = useState<StudentReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await reportApi.getMyStudentReport();
      setReport(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load attendance');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  if (isLoading) return <LoadingSpinner message="Loading attendance..." />;
  if (error) return <ErrorMessage message={error} onRetry={() => { void load(); }} />;
  if (!report) return <ErrorMessage message="No data" />;

  const { attendanceSummary } = report;

  return (
    <View style={styles.container}>
      <Card style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Monthly Overview</Text>
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statPct}>{attendanceSummary.percentage}%</Text>
            <Text style={styles.statLabel}>Overall</Text>
          </View>
          <View style={styles.stat}>
            <Text style={[styles.statVal, styles.green]}>{attendanceSummary.present}</Text>
            <Text style={styles.statLabel}>Present</Text>
          </View>
          <View style={styles.stat}>
            <Text style={[styles.statVal, styles.red]}>{attendanceSummary.absent}</Text>
            <Text style={styles.statLabel}>Absent</Text>
          </View>
          <View style={styles.stat}>
            <Text style={[styles.statVal, styles.yellow]}>{attendanceSummary.late}</Text>
            <Text style={styles.statLabel}>Late</Text>
          </View>
        </View>
      </Card>

      <Text style={styles.sectionTitle}>Session History</Text>
      <FlatList
        data={[]}
        keyExtractor={(item: AttendanceRecord) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState
            icon="📅"
            title="No detailed records available"
            description="Contact your child's teacher for details"
          />
        }
        renderItem={({ item }: { item: AttendanceRecord }) => (
          <Card>
            <View style={styles.row}>
              <Text style={styles.date}>
                {new Date(item.checkedInAt).toLocaleDateString()}
              </Text>
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
    color: '#374151',
    fontSize: 14,
  },
  green: { color: '#065F46' },
  list: {
    padding: 16,
    paddingTop: 0,
  },
  red: { color: '#B91C1C' },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
    paddingHorizontal: 16,
  },
  stat: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    color: '#6B7280',
    fontSize: 11,
    marginTop: 2,
  },
  statPct: {
    color: '#4F46E5',
    fontSize: 24,
    fontWeight: '800',
  },
  statVal: {
    fontSize: 20,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  summaryCard: {
    margin: 16,
  },
  summaryTitle: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  yellow: { color: '#92400E' },
});

export default AttendanceSummary;
