import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Card from '@/components/common/Card';
import ErrorMessage from '@/components/common/ErrorMessage';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import Badge from '@/components/common/Badge';
import EmptyState from '@/components/common/EmptyState';
import { colors } from '@/constants/branding';
import * as batchApi from '@/services/batchApi';
import * as sessionApi from '@/services/sessionApi';
import * as classLogApi from '@/services/classLogApi';
import type { Batch, BatchMembership, ClassLog, ClassSession, SessionStatus } from '@/types';

interface BatchDetailProps {
  batchId: string;
}

type TabName = 'Members' | 'Sessions' | 'Logs';

const STATUS_BADGE: Record<SessionStatus, 'success' | 'info' | 'default' | 'warning'> = {
  active: 'success',
  cancelled: 'default',
  completed: 'info',
  scheduled: 'warning',
};

const BatchDetail: React.FC<BatchDetailProps> = ({ batchId }) => {
  const router = useRouter();
  const [batch, setBatch] = useState<Batch | null>(null);
  const [members, setMembers] = useState<BatchMembership[]>([]);
  const [sessions, setSessions] = useState<ClassSession[]>([]);
  const [logs, setLogs] = useState<ClassLog[]>([]);
  const [activeTab, setActiveTab] = useState<TabName>('Members');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [batchData, membersData, sessionsData, logsData] = await Promise.all([
        batchApi.getBatch(batchId),
        batchApi.getBatchMembers(batchId),
        sessionApi.getBatchSessions(batchId),
        classLogApi.getBatchClassLogs(batchId),
      ]);
      setBatch(batchData);
      setMembers(membersData);
      setSessions(sessionsData);
      setLogs(logsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load batch');
    } finally {
      setIsLoading(false);
    }
  }, [batchId]);

  useEffect(() => { void load(); }, [load]);

  const handleRemoveStudent = async (studentId: string) => {
    try {
      await batchApi.removeStudentFromBatch(batchId, studentId);
      void load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove student');
    }
  };

  if (isLoading) return <LoadingSpinner message="Loading batch details..." />;
  if (error) return <ErrorMessage message={error} onRetry={() => { void load(); }} />;
  if (!batch) return <ErrorMessage message="Batch not found" />;

  const TABS: TabName[] = ['Members', 'Sessions', 'Logs'];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
    <View style={styles.container}>
      <Card style={styles.batchHeader}>
        <Text style={styles.batchName}>{batch.name}</Text>
        {batch.subject ? <Text style={styles.subject}>{batch.subject}</Text> : null}
        {batch.schedule ? <Text style={styles.schedule}>🗓 {batch.schedule}</Text> : null}
      </Card>

      <View style={styles.tabs}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === 'Members' && (
        <FlatList
          data={members}
          keyExtractor={(m) => m.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <Card>
              <View style={styles.memberRow}>
                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>
                    {item.student?.name ?? item.studentId}
                  </Text>
                  <Text style={styles.memberEmail}>{item.student?.email ?? ''}</Text>
                </View>
                <View style={styles.memberActions}>
                  <Badge
                    label={item.status}
                    variant={item.status === 'active' ? 'success' : 'default'}
                  />
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => { void handleRemoveStudent(item.studentId); }}
                  >
                    <Text style={styles.removeText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Card>
          )}
          ListEmptyComponent={
            <EmptyState icon="👥" title="No members yet" />
          }
        />
      )}

      {activeTab === 'Sessions' && (
        <FlatList
          data={sessions}
          keyExtractor={(s) => s.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() =>
                router.push(
                  `/(teacher)/sessions/${item.id}` as Parameters<typeof router.push>[0],
                )
              }
            >
              <Card>
                <View style={styles.sessionRow}>
                  <Text style={styles.sessionDate}>
                    {new Date(item.scheduledAt).toLocaleDateString()}
                  </Text>
                  <Badge label={item.status} variant={STATUS_BADGE[item.status]} />
                </View>
              </Card>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <EmptyState icon="📅" title="No sessions yet" />
          }
        />
      )}

      {activeTab === 'Logs' && (
        <ScrollView contentContainerStyle={styles.listContent}>
          {logs.length === 0 ? (
            <EmptyState icon="📝" title="No class logs yet" />
          ) : (
            logs.map((log) => (
              <Card key={log.id}>
                <Text style={styles.logDate}>
                  {new Date(log.date).toLocaleDateString()}
                </Text>
                <Text style={styles.logTopic}>{log.topicTaught}</Text>
                {log.homework ? (
                  <Text style={styles.logMeta}>📚 HW: {log.homework}</Text>
                ) : null}
              </Card>
            ))
          )}
        </ScrollView>
      )}
    </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    backgroundColor: colors.background,
    flex: 1,
  },
  batchHeader: {
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 0,
  },
  batchName: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  container: {
    flex: 1,
  },
  listContent: {
    padding: 20,
  },
  logDate: {
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: 4,
  },
  logMeta: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 4,
  },
  logTopic: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  memberActions: {
    alignItems: 'flex-end',
    gap: 6,
  },
  memberEmail: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  memberInfo: {
    flex: 1,
    marginRight: 12,
  },
  memberName: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  memberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  removeButton: {
    marginTop: 6,
  },
  removeText: {
    color: colors.danger,
    fontSize: 13,
  },
  schedule: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  sessionDate: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '500',
  },
  sessionRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  subject: {
    color: colors.primary,
    fontSize: 14,
    marginBottom: 2,
  },
  tab: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: 8,
    paddingVertical: 10,
  },
  tabActive: {
    borderBottomColor: colors.primary,
    borderBottomWidth: 2,
  },
  tabText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
    includeFontPadding: false,
    lineHeight: 18,
    textAlign: 'center',
  },
  tabTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  tabs: {
    backgroundColor: colors.surface,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 12,
    overflow: 'hidden',
    paddingHorizontal: 4,
    paddingTop: 2,
  },
});

export default BatchDetail;
