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
import Card from '@/components/common/Card';
import ErrorMessage from '@/components/common/ErrorMessage';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import Badge from '@/components/common/Badge';
import EmptyState from '@/components/common/EmptyState';
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
                <View>
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
  );
};

const styles = StyleSheet.create({
  batchHeader: {
    margin: 16,
    marginBottom: 0,
  },
  batchName: {
    color: '#111827',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  container: {
    backgroundColor: '#F9FAFB',
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  logDate: {
    color: '#6B7280',
    fontSize: 12,
    marginBottom: 4,
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
  memberActions: {
    alignItems: 'flex-end',
    gap: 6,
  },
  memberEmail: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 2,
  },
  memberName: {
    color: '#111827',
    fontSize: 15,
    fontWeight: '600',
  },
  memberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  removeButton: {
    marginTop: 6,
  },
  removeText: {
    color: '#EF4444',
    fontSize: 13,
  },
  schedule: {
    color: '#6B7280',
    fontSize: 13,
    marginTop: 2,
  },
  sessionDate: {
    color: '#374151',
    fontSize: 15,
    fontWeight: '500',
  },
  sessionRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  subject: {
    color: '#4F46E5',
    fontSize: 14,
    marginBottom: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
  },
  tabActive: {
    borderBottomColor: '#4F46E5',
    borderBottomWidth: 2,
  },
  tabText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  tabTextActive: {
    color: '#4F46E5',
    fontWeight: '700',
  },
  tabs: {
    backgroundColor: '#ffffff',
    borderBottomColor: '#E5E7EB',
    borderBottomWidth: 1,
    flexDirection: 'row',
    marginTop: 12,
  },
});

export default BatchDetail;
