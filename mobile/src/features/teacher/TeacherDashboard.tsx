import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import Card from '@/components/common/Card';
import ErrorMessage from '@/components/common/ErrorMessage';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import Badge from '@/components/common/Badge';
import { useAuth } from '@/hooks/useAuth';
import { useBatches } from '@/hooks/useBatches';
import { useSessions } from '@/hooks/useSessions';
import type { SessionStatus } from '@/types';

const STATUS_BADGE: Record<SessionStatus, 'success' | 'info' | 'default' | 'warning'> = {
  active: 'success',
  cancelled: 'default',
  completed: 'info',
  scheduled: 'warning',
};

const TeacherDashboard: React.FC = () => {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { batches, isLoading: batchLoading } = useBatches();
  const { sessions, isLoading: sessionLoading, error } = useSessions();

  const isLoading = batchLoading || sessionLoading;

  const today = new Date().toDateString();
  const todaySessions = sessions.filter(
    (s) => new Date(s.scheduledAt).toDateString() === today,
  );

  if (isLoading) return <LoadingSpinner message="Loading dashboard..." />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {user?.name ?? 'Teacher'} 👋</Text>
          <Text style={styles.subGreeting}>Here&apos;s your overview</Text>
        </View>
        <TouchableOpacity onPress={() => { void logout(); }}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsRow}>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>{batches.length}</Text>
          <Text style={styles.statLabel}>Batches</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>{sessions.length}</Text>
          <Text style={styles.statLabel}>Sessions</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>{todaySessions.length}</Text>
          <Text style={styles.statLabel}>Today</Text>
        </Card>
      </View>

      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actionsRow}>
        {[
          { label: '+ Batch', route: '/(teacher)/batches/create' as const },
          { label: '+ Session', route: '/(teacher)/sessions/create' as const },
          { label: '📊 Reports', route: '/(teacher)/batches/' as const },
        ].map((action) => (
          <TouchableOpacity
            key={action.label}
            style={styles.actionButton}
            onPress={() => router.push(action.route)}
          >
            <Text style={styles.actionText}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Today&apos;s Sessions</Text>
      {todaySessions.length === 0 ? (
        <Card>
          <Text style={styles.emptyText}>No sessions scheduled for today</Text>
        </Card>
      ) : (
        todaySessions.map((session) => (
          <TouchableOpacity
            key={session.id}
            onPress={() =>
              router.push(`/(teacher)/sessions/${session.id}` as Parameters<typeof router.push>[0])
            }
          >
            <Card>
              <View style={styles.sessionRow}>
                <Text style={styles.sessionTime}>
                  {new Date(session.scheduledAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
                <Badge label={session.status} variant={STATUS_BADGE[session.status]} />
              </View>
            </Card>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  actionButton: {
    backgroundColor: '#EEF2FF',
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 12,
  },
  actionText: {
    color: '#4F46E5',
    fontSize: 13,
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
  logoutText: {
    color: '#EF4444',
    fontWeight: '600',
  },
  sectionTitle: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
    marginTop: 4,
  },
  sessionRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sessionTime: {
    color: '#374151',
    fontSize: 15,
    fontWeight: '600',
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
    fontSize: 24,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  subGreeting: {
    color: '#6B7280',
    fontSize: 13,
    marginTop: 2,
  },
});

export default TeacherDashboard;
