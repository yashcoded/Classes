import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppBrandMark from '@/components/common/AppBrandMark';
import Card from '@/components/common/Card';
import ErrorMessage from '@/components/common/ErrorMessage';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import Badge from '@/components/common/Badge';
import { useAuth } from '@/hooks/useAuth';
import { useBatches } from '@/hooks/useBatches';
import { useSessions } from '@/hooks/useSessions';
import { colors } from '@/constants/branding';
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
    <SafeAreaView style={styles.safe} edges={['top']}>
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* ── Header ────────────────────────────── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <AppBrandMark variant="small" showTagline={false} />
          <Text style={styles.greeting}>Hey {user?.name ?? 'Teacher'}! 👋✨</Text>
          <Text style={styles.subtitle}>
            Your classroom command center — batches, sessions & attendance 📊
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

      {/* ── Stats ─────────────────────────────── */}
      <View style={styles.statsRow}>
        <TouchableOpacity
          style={styles.statTap}
          onPress={() => router.push('/(teacher)/batches')}
          activeOpacity={0.85}
        >
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{batches.length}</Text>
            <Text style={styles.statLabel}>📚 Batches</Text>
          </Card>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.statTap}
          onPress={() => router.push('/(teacher)/sessions')}
          activeOpacity={0.85}
        >
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{sessions.length}</Text>
            <Text style={styles.statLabel}>📅 Sessions</Text>
          </Card>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.statTap}
          onPress={() => router.push('/(teacher)/approvals')}
          activeOpacity={0.85}
        >
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{todaySessions.length}</Text>
            <Text style={styles.statLabel}>✅ Approvals</Text>
          </Card>
        </TouchableOpacity>
      </View>

      {/* ── Quick actions ─────────────────────── */}
      <Text style={styles.sectionTitle}>Quick wins ⚡</Text>
      <View style={styles.actionsRow}>
        {[
          { label: '➕ New batch', route: '/(teacher)/batches/create' as const },
          { label: '➕ New session', route: '/(teacher)/sessions/create' as const },
          { label: '📝 Enter marks', route: '/(teacher)/tests' as const },
          { label: '💳 Track payments', route: '/(teacher)/fees' as const },
          { label: '🔔 Send reminder', route: '/(teacher)/notifications/send' as const },
        ].map((action) => (
          <TouchableOpacity
            key={action.label}
            style={styles.actionBtn}
            onPress={() => router.push(action.route)}
          >
            <Text style={styles.actionText}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Today's sessions ──────────────────── */}
      <Text style={styles.sectionTitle}>Today&apos;s lineup 🎯</Text>
      {todaySessions.length === 0 ? (
        <Card>
          <Text style={styles.emptyText}>No sessions today — enjoy the breather ☕</Text>
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
    marginHorizontal: 0,
    marginBottom: 0,
    paddingVertical: 18,
  },
  statTap: {
    flex: 1,
    marginHorizontal: 6,
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
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  actionBtn: {
    backgroundColor: colors.primarySurface,
    borderRadius: 10,
    marginBottom: 10,
    paddingVertical: 14,
    width: '48%',
  },
  actionText: {
    color: colors.primary,
    fontSize: 13,
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
  sessionTime: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
});

export default TeacherDashboard;
