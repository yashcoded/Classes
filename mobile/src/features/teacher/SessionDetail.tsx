import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import Card from '@/components/common/Card';
import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';
import ErrorMessage from '@/components/common/ErrorMessage';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';
import * as sessionApi from '@/services/sessionApi';
import * as attendanceApi from '@/services/attendanceApi';
import type { AttendanceRecord, ClassSession, SessionStatus } from '@/types';

interface SessionDetailProps {
  sessionId: string;
}

const STATUS_BADGE: Record<SessionStatus, 'success' | 'info' | 'default' | 'warning'> = {
  active: 'success',
  cancelled: 'default',
  completed: 'info',
  scheduled: 'warning',
};

const SessionDetail: React.FC<SessionDetailProps> = ({ sessionId }) => {
  const router = useRouter();
  const [session, setSession] = useState<ClassSession | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [sessionData, attendanceData] = await Promise.all([
        sessionApi.getSession(sessionId),
        attendanceApi.getSessionAttendance(sessionId),
      ]);
      setSession(sessionData);
      setAttendance(attendanceData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load session');
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  useEffect(() => { void load(); }, [load]);

  const handleStart = async () => {
    setActionLoading(true);
    try {
      const updated = await sessionApi.startSession(sessionId);
      setSession(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start session');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEnd = async () => {
    setActionLoading(true);
    try {
      const updated = await sessionApi.endSession(sessionId);
      setSession(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to end session');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRefreshQR = async () => {
    setActionLoading(true);
    try {
      const updated = await sessionApi.refreshQR(sessionId);
      setSession(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh QR');
    } finally {
      setActionLoading(false);
    }
  };

  if (isLoading) return <LoadingSpinner message="Loading session..." />;
  if (error) return <ErrorMessage message={error} onRetry={() => { void load(); }} />;
  if (!session) return <ErrorMessage message="Session not found" />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card>
        <View style={styles.sessionHeader}>
          <Text style={styles.sessionDate}>
            {new Date(session.scheduledAt).toLocaleDateString(undefined, {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
          <Badge
            label={session.status}
            variant={STATUS_BADGE[session.status]}
          />
        </View>
        <Text style={styles.sessionTime}>
          🕐{' '}
          {new Date(session.scheduledAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
        {session.startedAt ? (
          <Text style={styles.meta}>
            Started: {new Date(session.startedAt).toLocaleTimeString()}
          </Text>
        ) : null}
        {session.endedAt ? (
          <Text style={styles.meta}>
            Ended: {new Date(session.endedAt).toLocaleTimeString()}
          </Text>
        ) : null}
      </Card>

      {session.qrCode ? (
        <Card>
          <Text style={styles.qrLabel}>QR Code (share with students)</Text>
          <View style={styles.qrBox}>
            <Text style={styles.qrCode}>{session.qrCode}</Text>
          </View>
          {session.qrExpiresAt ? (
            <Text style={styles.qrExpiry}>
              Expires: {new Date(session.qrExpiresAt).toLocaleTimeString()}
            </Text>
          ) : null}
        </Card>
      ) : null}

      <View style={styles.actionsRow}>
        {session.status === 'scheduled' && (
          <Button
            title="▶ Start"
            onPress={() => { void handleStart(); }}
            loading={actionLoading}
            style={styles.actionBtn}
          />
        )}
        {session.status === 'active' && (
          <>
            <Button
              title="⏹ End"
              onPress={() => { void handleEnd(); }}
              loading={actionLoading}
              variant="danger"
              style={styles.actionBtn}
            />
            <Button
              title="🔄 Refresh QR"
              onPress={() => { void handleRefreshQR(); }}
              loading={actionLoading}
              variant="secondary"
              style={styles.actionBtn}
            />
          </>
        )}
        <Button
          title="👁 Attendance"
          onPress={() =>
            router.push(
              `/(teacher)/attendance/${sessionId}` as Parameters<typeof router.push>[0],
            )
          }
          variant="secondary"
          style={styles.actionBtn}
        />
      </View>

      <Text style={styles.sectionTitle}>
        Attendance ({attendance.length})
      </Text>
      {attendance.length === 0 ? (
        <EmptyState icon="👥" title="No attendance records yet" />
      ) : (
        <FlatList
          data={attendance}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <Card>
              <View style={styles.attendanceRow}>
                <Text style={styles.studentName}>
                  {item.student?.name ?? item.studentId}
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
              <Text style={styles.checkInMeta}>
                via {item.checkInMethod} •{' '}
                {new Date(item.checkedInAt).toLocaleTimeString()}
              </Text>
            </Card>
          )}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  actionBtn: {
    flex: 1,
    marginHorizontal: 4,
  },
  actionsRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  attendanceRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  checkInMeta: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 4,
  },
  container: {
    backgroundColor: '#F9FAFB',
    flex: 1,
  },
  content: {
    padding: 16,
  },
  meta: {
    color: '#6B7280',
    fontSize: 13,
    marginTop: 4,
  },
  qrBox: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    marginVertical: 8,
    padding: 16,
  },
  qrCode: {
    color: '#1F2937',
    fontFamily: 'monospace',
    fontSize: 14,
    textAlign: 'center',
  },
  qrExpiry: {
    color: '#9CA3AF',
    fontSize: 12,
    textAlign: 'right',
  },
  qrLabel: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  sectionTitle: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
  },
  sessionDate: {
    color: '#111827',
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
  },
  sessionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 8,
  },
  sessionTime: {
    color: '#6B7280',
    fontSize: 14,
  },
  studentName: {
    color: '#111827',
    fontSize: 15,
    fontWeight: '500',
  },
});

export default SessionDetail;
