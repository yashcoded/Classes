import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppBrandMark from '@/components/common/AppBrandMark';
import Card from '@/components/common/Card';
import Badge from '@/components/common/Badge';
import ErrorMessage from '@/components/common/ErrorMessage';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';
import * as reportApi from '@/services/reportApi';
import * as notificationApi from '@/services/notificationApi';
import { colors } from '@/constants/branding';
import type { StudentReport, Notification } from '@/types';

const ParentDashboard: React.FC = () => {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [report, setReport] = useState<StudentReport | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [reportHint, setReportHint] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setReportHint(null);
    try {
      const [reportResult, notifResult] = await Promise.allSettled([
        reportApi.getMyStudentReport(),
        notificationApi.getMyNotifications(),
      ]);

      if (notifResult.status === 'fulfilled') {
        setNotifications(notifResult.value);
      } else {
        throw notifResult.reason;
      }

      if (reportResult.status === 'fulfilled') {
        setReport(reportResult.value);
      } else {
        const reportError =
          reportResult.reason instanceof Error
            ? reportResult.reason.message
            : 'Failed to load student report';
        if (reportError.includes('No approved student link found')) {
          setReport(null);
          setReportHint('Link a student account to view attendance, tests, and fee progress.');
        } else {
          throw reportResult.reason;
        }
      }
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
    <SafeAreaView style={styles.safe} edges={['top']}>
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <AppBrandMark variant="small" showTagline={false} />
          <Text style={styles.greeting}>Hi {user?.name ?? 'Parent'}! 👪💛</Text>
          <Text style={styles.subtitle}>
            Stay close to your learner&apos;s progress & wins 🌟
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => {
            void (async () => {
              await logout();
              router.replace('/(auth)/login');
            })();
          }}
          style={styles.logoutBtn}
        >
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>
      </View>

      {/* ── Stats ── */}
      <View style={styles.statsRow}>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>
            {report?.attendanceSummary?.percentage ?? 0}%
          </Text>
          <Text style={styles.statLabel}>✅ Attendance</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>{report?.testResults?.length ?? 0}</Text>
          <Text style={styles.statLabel}>📝 Tests</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>{unreadCount}</Text>
          <Text style={styles.statLabel}>🔔 Unread</Text>
        </Card>
      </View>

      {reportHint ? (
        <Card>
          <Text style={styles.emptyText}>{reportHint}</Text>
          <TouchableOpacity onPress={() => router.push('/(parent)/link-student')}>
            <Text style={styles.viewLink}>Link a student now →</Text>
          </TouchableOpacity>
        </Card>
      ) : null}

      {/* ── Quick links (2-column grid) ── */}
      <Text style={styles.sectionTitle}>Family hub ⚡</Text>
      <View style={styles.linksGrid}>
        {[
          { label: '🔗 Link student', route: '/(parent)/link-student' as const },
          { label: '📊 Attendance', route: '/(parent)/attendance' as const },
          { label: '📝 Tests', route: '/(parent)/tests' as const },
          { label: '💳 Fees', route: '/(parent)/fees' as const },
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

      {/* ── Latest test ── */}
      <Text style={styles.sectionTitle}>Latest test 🏆</Text>
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

      {/* ── Fee status ── */}
      <Text style={styles.sectionTitle}>Fee status 💰</Text>
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
                <Text style={styles.viewLink}>View details →</Text>
              </TouchableOpacity>
            </Card>
          );
        })()
      ) : (
        <Card>
          <Text style={styles.emptyText}>No pending fees</Text>
        </Card>
      )}
    </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    backgroundColor: colors.background,
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 12,
  },

  /* ── Header ── */
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  headerLeft: {
    flex: 1,
    marginRight: 12,
  },
  greeting: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '700',
    marginTop: 2,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  logoutBtn: {
    paddingVertical: 4,
    paddingLeft: 8,
  },
  logoutText: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: '600',
  },

  /* ── Stats ── */
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: -6,
    marginBottom: 24,
  },
  statCard: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 6,
    marginBottom: 0,
    paddingVertical: 18,
  },
  statValue: {
    color: colors.primary,
    fontSize: 22,
    fontWeight: '800',
  },
  statLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 6,
  },

  /* ── Quick links grid ── */
  linksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
    justifyContent: 'space-between',
  },
  linkBtn: {
    backgroundColor: colors.primarySurface,
    borderRadius: 10,
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    width: '48%',
  },
  linkText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },

  /* ── Sections ── */
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  emptyText: {
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: 4,
  },

  /* ── Test card ── */
  testTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  testRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  marks: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },

  /* ── Fee card ── */
  feeRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  feeLabel: {
    color: colors.textPrimary,
    fontSize: 14,
    flex: 1,
  },
  feeAmount: {
    color: colors.danger,
    fontSize: 18,
    fontWeight: '700',
  },
  viewLink: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
});

export default ParentDashboard;
