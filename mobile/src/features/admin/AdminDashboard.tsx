import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppBrandMark from '@/components/common/AppBrandMark';
import Card from '@/components/common/Card';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import Button from '@/components/common/Button';
import { colors } from '@/constants/branding';
import { useAuth } from '@/hooks/useAuth';
import * as approvalApi from '@/services/approvalApi';
import type { User } from '@/types';

const AdminDashboard: React.FC = () => {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [pendingTeachers, setPendingTeachers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const teachers = await approvalApi.getPendingTeachers();
      setPendingTeachers(teachers);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleApproval = useCallback(
    async (teacherId: string, teacherName: string, approved: boolean) => {
      const action = approved ? 'approve' : 'reject';
      const doIt = async () => {
        setProcessing(teacherId);
        try {
          await approvalApi.approveTeacher(teacherId, approved);
          setPendingTeachers((prev) => prev.filter((t) => t.id !== teacherId));
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Failed';
          if (Platform.OS === 'web') {
            window.alert(msg);
          } else {
            Alert.alert('Error', msg);
          }
        } finally {
          setProcessing(null);
        }
      };

      if (Platform.OS === 'web') {
        if (window.confirm(`${action.charAt(0).toUpperCase() + action.slice(1)} ${teacherName}?`)) {
          await doIt();
        }
      } else {
        Alert.alert(
          `${action.charAt(0).toUpperCase() + action.slice(1)} Teacher`,
          `Are you sure you want to ${action} ${teacherName}?`,
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Yes', onPress: () => { void doIt(); } },
          ],
        );
      }
    },
    [],
  );

  if (isLoading) return <LoadingSpinner message="Loading admin panel..." />;
  if (error) return <ErrorMessage message={error} onRetry={() => { void load(); }} />;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <AppBrandMark variant="small" showTagline={false} />
          <Text style={styles.greeting}>Admin HQ 🛡️</Text>
          <Text style={styles.subtitle}>
            {user?.name ?? 'Administrator'} — you&apos;ve got this ✨
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

      {/* ── Pending approvals ── */}
      <Text style={styles.sectionTitle}>
        Pending teacher approvals 📋 ({pendingTeachers.length})
      </Text>

      {pendingTeachers.length === 0 ? (
        <Card>
          <Text style={styles.emptyText}>No pending requests</Text>
        </Card>
      ) : (
        pendingTeachers.map((teacher) => (
          <Card key={teacher.id} style={styles.teacherCard}>
            <Text style={styles.teacherName}>{teacher.name}</Text>
            <Text style={styles.teacherEmail}>{teacher.email}</Text>
            {teacher.phone ? (
              <Text style={styles.teacherPhone}>{teacher.phone}</Text>
            ) : null}
            <Text style={styles.teacherDate}>
              Registered: {new Date(teacher.createdAt).toLocaleDateString()}
            </Text>
            <View style={styles.actionRow}>
              <Button
                title="Approve"
                onPress={() => { void handleApproval(teacher.id, teacher.name, true); }}
                loading={processing === teacher.id}
                style={styles.approveBtn}
              />
              <Button
                title="Reject"
                variant="danger"
                onPress={() => { void handleApproval(teacher.id, teacher.name, false); }}
                loading={processing === teacher.id}
                style={styles.rejectBtn}
              />
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

  /* ── Teacher cards ── */
  teacherCard: {
    marginBottom: 12,
  },
  teacherName: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  teacherEmail: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  teacherPhone: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  teacherDate: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 4,
  },
  actionRow: {
    flexDirection: 'row',
    marginTop: 12,
  },
  approveBtn: {
    flex: 1,
    marginRight: 6,
  },
  rejectBtn: {
    flex: 1,
    marginLeft: 6,
  },
});

export default AdminDashboard;
