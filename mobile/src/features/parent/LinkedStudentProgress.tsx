import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Card from '@/components/common/Card';
import EmptyState from '@/components/common/EmptyState';
import ErrorMessage from '@/components/common/ErrorMessage';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import * as reportApi from '@/services/reportApi';
import type { StudentReport } from '@/types';

const LinkedStudentProgress: React.FC = () => {
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
      setError(err instanceof Error ? err.message : 'Failed to load progress');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  if (isLoading) return <LoadingSpinner message="Loading progress..." />;
  if (error?.includes('No approved student link found')) {
    return (
      <EmptyState
        icon="🔗"
        title="Link a student first"
        description="Approve a parent-student link to view progress."
      />
    );
  }
  if (error) return <ErrorMessage message={error} onRetry={() => { void load(); }} />;
  if (!report) return <ErrorMessage message="No data available" />;

  const { attendanceSummary } = report;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{report.student.name}&apos;s Progress</Text>

      <Text style={styles.sectionTitle}>Attendance</Text>
      <Card>
        <View style={styles.attendanceGauge}>
          <Text style={styles.percentText}>{attendanceSummary.percentage}%</Text>
          <Text style={styles.gaugeLabel}>Overall Attendance</Text>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{attendanceSummary.present}</Text>
            <Text style={styles.statLabel}>Present</Text>
          </View>
          <View style={styles.stat}>
            <Text style={[styles.statValue, styles.absentColor]}>
              {attendanceSummary.absent}
            </Text>
            <Text style={styles.statLabel}>Absent</Text>
          </View>
          <View style={styles.stat}>
            <Text style={[styles.statValue, styles.lateColor]}>
              {attendanceSummary.late}
            </Text>
            <Text style={styles.statLabel}>Late</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{attendanceSummary.total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
        </View>
      </Card>

      <Text style={styles.sectionTitle}>Recent Test Results</Text>
      {report.testResults.slice(-3).map((result) => (
        <Card key={result.id}>
          <Text style={styles.testTitle}>{result.test?.title ?? 'Test'}</Text>
          <Text style={styles.testMeta}>
            {result.marksObtained} / {result.test?.maxMarks ?? 100} marks ·{' '}
            {result.test
              ? `${Math.round((result.marksObtained / result.test.maxMarks) * 100)}%`
              : ''}
          </Text>
        </Card>
      ))}

      <Text style={styles.sectionTitle}>Recent Class Logs</Text>
      {report.recentClassLogs.slice(0, 5).map((log) => (
        <Card key={log.id}>
          <Text style={styles.logDate}>{new Date(log.date).toLocaleDateString()}</Text>
          <Text style={styles.logTopic}>{log.topicTaught}</Text>
          {log.homework ? (
            <Text style={styles.logMeta}>📚 HW: {log.homework}</Text>
          ) : null}
        </Card>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  absentColor: {
    color: '#EF4444',
  },
  attendanceGauge: {
    alignItems: 'center',
    marginBottom: 16,
  },
  container: {
    backgroundColor: '#F9FAFB',
    flex: 1,
  },
  content: {
    padding: 16,
  },
  gaugeLabel: {
    color: '#6B7280',
    fontSize: 13,
    marginTop: 4,
  },
  lateColor: {
    color: '#F59E0B',
  },
  logDate: {
    color: '#9CA3AF',
    fontSize: 12,
    marginBottom: 2,
  },
  logMeta: {
    color: '#6B7280',
    fontSize: 13,
    marginTop: 4,
  },
  logTopic: {
    color: '#111827',
    fontSize: 15,
    fontWeight: '600',
  },
  percentText: {
    color: '#4F46E5',
    fontSize: 40,
    fontWeight: '800',
  },
  sectionTitle: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
    marginTop: 8,
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
  statValue: {
    color: '#065F46',
    fontSize: 20,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
  },
  testMeta: {
    color: '#6B7280',
    fontSize: 13,
    marginTop: 4,
  },
  testTitle: {
    color: '#111827',
    fontSize: 15,
    fontWeight: '600',
  },
  title: {
    color: '#111827',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
    marginTop: 8,
  },
});

export default LinkedStudentProgress;
