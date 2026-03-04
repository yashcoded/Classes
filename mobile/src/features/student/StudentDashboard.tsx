import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import Card from '@/components/common/Card';
import Badge from '@/components/common/Badge';
import ErrorMessage from '@/components/common/ErrorMessage';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';
import { useAttendance } from '@/hooks/useAttendance';
import { useSessions } from '@/hooks/useSessions';
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
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hi, {user?.name ?? 'Student'} 👋</Text>
          <Text style={styles.sub}>Ready to learn?</Text>
        </View>
        <TouchableOpacity onPress={() => { void logout(); }}>
          <Text style={styles.logout}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsRow}>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>{attendancePercent}%</Text>
          <Text style={styles.statLabel}>Attendance</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>{records.length}</Text>
          <Text style={styles.statLabel}>Classes</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>{upcomingSessions.length}</Text>
          <Text style={styles.statLabel}>Upcoming</Text>
        </Card>
      </View>

      <Text style={styles.sectionTitle}>Quick Actions</Text>
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

      <Text style={styles.sectionTitle}>Upcoming Sessions</Text>
      {upcomingSessions.length === 0 ? (
        <Card>
          <Text style={styles.emptyText}>No upcoming sessions</Text>
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
  );
};

const styles = StyleSheet.create({
  actionBtn: {
    backgroundColor: '#EEF2FF',
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 12,
  },
  actionText: {
    color: '#4F46E5',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  actionsRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
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
  logout: {
    color: '#EF4444',
    fontWeight: '600',
  },
  sectionTitle: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
  },
  sessionDate: {
    color: '#374151',
    flex: 1,
    fontSize: 14,
  },
  sessionRow: {
    alignItems: 'center',
    flexDirection: 'row',
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
});

export default StudentDashboard;
