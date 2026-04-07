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
import Card from '@/components/common/Card';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import Button from '@/components/common/Button';
import { colors } from '@/constants/branding';
import * as approvalApi from '@/services/approvalApi';
import type { StudentTeacherLink, StudentParentLink } from '@/types';

interface STLinkWithNames extends StudentTeacherLink {
  studentName: string;
  teacherName: string;
}

interface SPLinkWithNames extends StudentParentLink {
  studentName: string;
  parentName: string;
}

const TeacherApprovals: React.FC = () => {
  const router = useRouter();
  const [studentLinks, setStudentLinks] = useState<STLinkWithNames[]>([]);
  const [parentLinks, setParentLinks] = useState<SPLinkWithNames[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [stLinks, spLinks] = await Promise.all([
        approvalApi.getPendingStudentTeacherLinks(),
        approvalApi.getPendingParentStudentLinks(),
      ]);
      setStudentLinks(stLinks);
      setParentLinks(spLinks);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleStudentApproval = useCallback(
    async (linkId: string, name: string, approved: boolean) => {
      const doIt = async () => {
        setProcessing(linkId);
        try {
          await approvalApi.approveStudentTeacherLink(linkId, approved);
          setStudentLinks((prev) => prev.filter((l) => l.id !== linkId));
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Failed';
          if (Platform.OS === 'web') window.alert(msg);
          else Alert.alert('Error', msg);
        } finally {
          setProcessing(null);
        }
      };
      if (Platform.OS === 'web') {
        if (window.confirm(`${approved ? 'Approve' : 'Reject'} ${name}?`)) await doIt();
      } else {
        Alert.alert(
          approved ? 'Approve Student' : 'Reject Student',
          `Are you sure you want to ${approved ? 'approve' : 'reject'} ${name}?`,
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Yes', onPress: () => { void doIt(); } },
          ],
        );
      }
    },
    [],
  );

  const handleParentApproval = useCallback(
    async (linkId: string, parentName: string, approved: boolean) => {
      const doIt = async () => {
        setProcessing(linkId);
        try {
          await approvalApi.approveParentStudentLink(linkId, approved);
          setParentLinks((prev) => prev.filter((l) => l.id !== linkId));
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Failed';
          if (Platform.OS === 'web') window.alert(msg);
          else Alert.alert('Error', msg);
        } finally {
          setProcessing(null);
        }
      };
      if (Platform.OS === 'web') {
        if (window.confirm(`${approved ? 'Approve' : 'Reject'} link for ${parentName}?`)) await doIt();
      } else {
        Alert.alert(
          approved ? 'Approve Link' : 'Reject Link',
          `${approved ? 'Approve' : 'Reject'} parent-student link for ${parentName}?`,
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Yes', onPress: () => { void doIt(); } },
          ],
        );
      }
    },
    [],
  );

  if (isLoading) return <LoadingSpinner message="Loading approvals..." />;
  if (error) return <ErrorMessage message={error} onRetry={() => { void load(); }} />;

  const totalPending = studentLinks.length + parentLinks.length;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>Approvals ✅ ({totalPending})</Text>

      <Text style={styles.sectionTitle}>
        Student join requests ({studentLinks.length})
      </Text>
      {studentLinks.length === 0 ? (
        <Card>
          <Text style={styles.emptyText}>No pending student requests</Text>
        </Card>
      ) : (
        studentLinks.map((link) => (
          <Card key={link.id} style={styles.card}>
            <Text style={styles.name}>{link.studentName}</Text>
            <Text style={styles.detail}>
              Requested: {new Date(link.createdAt).toLocaleDateString()}
            </Text>
            <View style={styles.actionRow}>
              <Button
                title="Approve"
                onPress={() => { void handleStudentApproval(link.id, link.studentName, true); }}
                loading={processing === link.id}
                style={styles.approveBtn}
              />
              <Button
                title="Reject"
                variant="danger"
                onPress={() => { void handleStudentApproval(link.id, link.studentName, false); }}
                loading={processing === link.id}
                style={styles.rejectBtn}
              />
            </View>
          </Card>
        ))
      )}

      <Text style={styles.sectionTitle}>
        Parent-student link requests ({parentLinks.length})
      </Text>
      {parentLinks.length === 0 ? (
        <Card>
          <Text style={styles.emptyText}>No pending parent-student link requests</Text>
        </Card>
      ) : (
        parentLinks.map((link) => (
          <Card key={link.id} style={styles.card}>
            <Text style={styles.name}>{link.parentName}</Text>
            <Text style={styles.detail}>
              Wants to link with student: {link.studentName}
            </Text>
            <Text style={styles.detail}>Relation: {link.relation}</Text>
            <View style={styles.actionRow}>
              <Button
                title="Approve"
                onPress={() => { void handleParentApproval(link.id, link.parentName, true); }}
                loading={processing === link.id}
                style={styles.approveBtn}
              />
              <Button
                title="Reject"
                variant="danger"
                onPress={() => { void handleParentApproval(link.id, link.parentName, false); }}
                loading={processing === link.id}
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
  },
  header: {
    marginBottom: 8,
  },
  backBtn: {
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  backText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '600',
  },
  title: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 24,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
    marginTop: 8,
  },
  emptyText: {
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: 4,
  },
  card: {
    marginBottom: 12,
  },
  name: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  detail: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
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

export default TeacherApprovals;
