import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import Card from '@/components/common/Card';
import Badge from '@/components/common/Badge';
import ErrorMessage from '@/components/common/ErrorMessage';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';
import * as reportApi from '@/services/reportApi';
import * as notificationApi from '@/services/notificationApi';
import type { StudentReport, Notification } from '@/types';

const ParentDashboard: React.FC = () => {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [report, setReport] = useState<StudentReport | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [reportData, notifData] = await Promise.all([
        reportApi.getMyStudentReport(),
        notificationApi.getMyNotifications(),
      ]);
      setReport(reportData);
      setNotifications(notifData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  if (isLoading) return <LoadingSpinner message="Loading dashboard..." />;
  if (error) return <ErrorMessage message={error} onRetry={() => { void load(); }} />;

  const unreadCount = notifications.filter((n) => !n.readBy.includes(user?.id ?? '')).length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {user?.name ?? 'Parent'} 👋</Text>
          <Text style={styles.sub}>Your child&apos;s overview</Text>
        </View>
        <TouchableOpacity onPress={() => { void logout(); }}>
          <Text style={styles.logout}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsRow}>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>
            {report?.attendanceSummary?.percentage ?? 0}%
          </Text>
          <Text style={styles.statLabel}>Attendance</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>{report?.testResults?.length ?? 0}</Text>
          <Text style={styles.statLabel}>Tests</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>{unreadCount}</Text>
          <Text style={styles.statLabel}>Unread</Text>
        </Card>
      </View>

      <Text style={styles.sectionTitle}>Quick Links</Text>
      <View style={styles.quickLinks}>
        {[
          { label: '📊 Attendance', route: '/(parent)/attendance' as const },
          { label: '📝 Tests', route: '/(parent)/tests' as const },
          { label: '💰 Fees', route: '/(parent)/fees' as const },
          { label: '🔔 Notifications', route: '/(parent)/notifications' as const },
          { label: '📈 Progress', route: '/(parent)/progress' as const },
        ].map((link) => (
          <TouchableOpacity
            key={link.label}
            style={styles.linkBtn}
            onPress={() => router.push(link.route)}
          >
            <Text style={styles.linkText}>{link.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Latest Test</Text>
      {report?.testResults && report.testResults.length > 0 ? (
        (() => {
          const latest = report.testResults[report.testResults.length - 1];
          if (!latest) return null;
          const pct = latest.test
            ? Math.round((latest.marksObtained / latest.test.maxMarks) * 100)
            : 0;
          return (
            <Card>
              <Text style={styles.testTitle}>{latest.test?.title ?? 'Test'}</Text>
              <View style={styles.testRow}>
                <Text style={styles.marks}>
                  {latest.marksObtained} / {latest.test?.maxMarks ?? 100}
                </Text>
                <Badge
                  label={`${pct}%`}
                  variant={pct >= 60 ? 'success' : pct >= 40 ? 'warning' : 'danger'}
                />
              </View>
            </Card>
          );
        })()
      ) : (
        <Card>
          <Text style={styles.emptyText}>No test results yet</Text>
        </Card>
      )}

      <Text style={styles.sectionTitle}>Fee Status</Text>
      {report?.fees && report.fees.length > 0 ? (
        (() => {
          const pending = report.fees.filter((f) => f.status !== 'paid');
          const totalDue = pending.reduce((sum, f) => sum + f.amount, 0);
          return (
            <Card>
              <View style={styles.feeRow}>
                <Text style={styles.feeLabel}>
                  {pending.length} pending fee{pending.length !== 1 ? 's' : ''}
                </Text>
                <Text style={styles.feeAmount}>₹{totalDue}</Text>
              </View>
              <TouchableOpacity onPress={() => router.push('/(parent)/fees')}>
                <Text style={styles.viewLink}>View Details →</Text>
              </TouchableOpacity>
            </Card>
          );
        })()
      ) : (
        <Card>
          <Text style={styles.emptyText}>No pending fees 🎉</Text>
        </Card>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F9FAFB',
    flex: 1,
  },
  content: {
    padding: 16,
  },
  emptyText: {
    color: '#9CA3AF',
    textAlign: 'center',
  },
  feeAmount: {
    color: '#EF4444',
    fontSize: 18,
    fontWeight: '700',
  },
  feeLabel: {
    color: '#374151',
    fontSize: 14,
    flex: 1,
  },
  feeRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  greeting: {
    color: '#111827',
    fontSize: 22,
    fontWeight: '700',
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    marginTop: 8,
  },
  linkBtn: {
    backgroundColor: '#EEF2FF',
    borderRadius: 8,
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  linkText: {
    color: '#4F46E5',
    fontSize: 14,
    fontWeight: '600',
  },
  logout: {
    color: '#EF4444',
    fontWeight: '600',
  },
  marks: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '700',
  },
  quickLinks: {
    marginBottom: 8,
  },
  sectionTitle: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
    marginTop: 4,
  },
  statCard: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 16,
  },
  statLabel: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 4,
  },
  statValue: {
    color: '#4F46E5',
    fontSize: 22,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  sub: {
    color: '#6B7280',
    fontSize: 13,
    marginTop: 2,
  },
  testRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  testTitle: {
    color: '#111827',
    fontSize: 15,
    fontWeight: '600',
  },
  viewLink: {
    color: '#4F46E5',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
  },
});

export default ParentDashboard;
