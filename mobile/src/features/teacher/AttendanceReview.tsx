import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Card from '@/components/common/Card';
import Badge from '@/components/common/Badge';
import ErrorMessage from '@/components/common/ErrorMessage';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';
import * as attendanceApi from '@/services/attendanceApi';
import type { AttendanceRecord, AttendanceStatus } from '@/types';

interface AttendanceReviewProps {
  sessionId: string;
}

const STATUSES: AttendanceStatus[] = ['present', 'absent', 'late'];

const AttendanceReview: React.FC<AttendanceReviewProps> = ({ sessionId }) => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await attendanceApi.getSessionAttendance(sessionId);
      setRecords(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load attendance');
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  useEffect(() => { void load(); }, [load]);

  const handleOverride = async (studentId: string, newStatus: AttendanceStatus) => {
    try {
      await attendanceApi.markManualAttendance(sessionId, studentId, newStatus);
      void load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update attendance');
    }
  };

  if (isLoading) return <LoadingSpinner message="Loading attendance..." />;
  if (error) return <ErrorMessage message={error} onRetry={() => { void load(); }} />;

  return (
    <FlatList
      style={styles.container}
      data={records}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      ListEmptyComponent={
        <EmptyState icon="👥" title="No attendance records" />
      }
      renderItem={({ item }) => (
        <Card>
          <View style={styles.row}>
            <View>
              <Text style={styles.name}>{item.student?.name ?? item.studentId}</Text>
              <Text style={styles.method}>via {item.checkInMethod}</Text>
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
          <View style={styles.overrideRow}>
            <Text style={styles.overrideLabel}>Override:</Text>
            {STATUSES.map((s) => (
              <TouchableOpacity
                key={s}
                style={[
                  styles.overrideBtn,
                  item.status === s && styles.overrideBtnActive,
                ]}
                onPress={() => { void handleOverride(item.studentId, s); }}
              >
                <Text
                  style={[
                    styles.overrideBtnText,
                    item.status === s && styles.overrideBtnTextActive,
                  ]}
                >
                  {s}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
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
  list: {
    padding: 16,
  },
  method: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 2,
  },
  name: {
    color: '#111827',
    fontSize: 15,
    fontWeight: '600',
  },
  overrideBtn: {
    borderColor: '#D1D5DB',
    borderRadius: 6,
    borderWidth: 1,
    marginLeft: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  overrideBtnActive: {
    backgroundColor: '#EEF2FF',
    borderColor: '#4F46E5',
  },
  overrideBtnText: {
    color: '#6B7280',
    fontSize: 12,
    textTransform: 'capitalize',
  },
  overrideBtnTextActive: {
    color: '#4F46E5',
    fontWeight: '600',
  },
  overrideLabel: {
    color: '#6B7280',
    fontSize: 12,
  },
  overrideRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default AttendanceReview;
