import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppBrandMark from '@/components/common/AppBrandMark';
import Card from '@/components/common/Card';
import Badge from '@/components/common/Badge';
import ErrorMessage from '@/components/common/ErrorMessage';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';
import { useAttendance } from '@/hooks/useAttendance';
import { useSessions } from '@/hooks/useSessions';
import { colors } from '@/constants/branding';
import type { SessionStatus } from '@/types';

const STATUS_BADGE: Record<SessionStatus, 'success' | 'info' | 'default' | 'warning'> = {
  active: 'success',
  cancelled: 'default',
  completed: 'info',
  scheduled: 'warning',
};

const StudentDashboard: React.FC = () => {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { records, isLoading: attendanceLoading } = useAttendance();
  const { sessions, isLoading: sessionLoading, error } = useSessions();

  const isLoading = attendanceLoading || sessionLoading;

  const now = new Date();
  const upcomingSessions = sessions
    .filter((s) => new Date(s.scheduledAt) > now)
    .slice(0, 3);

  const presentCount = records.filter((r) => r.status === 'present').length;
  const attendancePercent =
    records.length > 0
      ? Math.round((presentCount / records.length) * 100)
      : 0;

  if (isLoading) return <LoadingSpinner message="Loading..." />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <AppBrandMark variant="small" showTagline={false} />
          <Text style={styles.greeting}>Hi {user?.name ?? 'Student'}! 🎓✨</Text>
          <Text style={styles.subtitle}>Track attendance, crush tests & never miss a class 🚀</Text>
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
          <Text style={styles.statValue}>{attendancePercent}%</Text>
          <Text style={styles.statLabel}>✅ Attendance</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>{records.length}</Text>
          <Text style={styles.statLabel}>📝 Records</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>{upcomingSessions.length}</Text>
          <Text style={styles.statLabel}>🔜 Upcoming</Text>
        </Card>
      </View>

      {/* ── Shortcuts ── */}
      <Text style={styles.sectionTitle}>Your shortcuts ⚡</Text>
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => router.push('/(student)/qr-scan')}
        >
          <Text style={styles.actionText}>📷 Scan QR</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => router.push('/(student)/attendance')}
        >
          <Text style={styles.actionText}>📊 Attendance</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => router.push('/(student)/tests')}
        >
          <Text style={styles.actionText}>📝 Tests</Text>
        </TouchableOpacity>
      </View>

      {/* ── Upcoming ── */}
      <Text style={styles.sectionTitle}>Coming up 📅</Text>
      {upcomingSessions.length === 0 ? (
        <Card>
          <Text style={styles.emptyText}>All clear — check back for new sessions 🌟</Text>
        </Card>
      ) : (
        upcomingSessions.map((session) => (
          <Card key={session.id}>
            <View style={styles.sessionRow}>
              <Text style={styles.sessionDate}>
                {new Date(session.scheduledAt).toLocaleDateString(undefined, {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}
                {'  '}
                {new Date(session.scheduledAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
              <Badge label={session.status} variant={STATUS_BADGE[session.status]} />
            </View>
          </Card>
        ))
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
    fontSize: 24,
    fontWeight: '800',
  },
  statLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 6,
  },

  /* ── Actions ── */
  actionsRow: {
    flexDirection: 'row',
    marginHorizontal: -6,
    marginBottom: 24,
  },
  actionBtn: {
    backgroundColor: colors.primarySurface,
    borderRadius: 10,
    flex: 1,
    marginHorizontal: 6,
    paddingVertical: 14,
  },
  actionText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
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
  sessionRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sessionDate: {
    color: colors.textPrimary,
    flex: 1,
    fontSize: 14,
  },
});

export default StudentDashboard;
