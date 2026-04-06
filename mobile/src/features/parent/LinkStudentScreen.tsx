import React, { useCallback, useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import ErrorMessage from '@/components/common/ErrorMessage';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';
import * as approvalApi from '@/services/approvalApi';
import type { User, StudentParentLink } from '@/types';

const RELATIONS = ['Mother', 'Father', 'Guardian', 'Other'];

const LinkStudentScreen: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
  const [relation, setRelation] = useState('Mother');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [existingLinks, setExistingLinks] = useState<StudentParentLink[]>([]);
  const [loadingLinks, setLoadingLinks] = useState(true);

  useEffect(() => {
    void (async () => {
      try {
        const links = await approvalApi.getMyParentStudentLinks();
        setExistingLinks(links);
      } catch {
        /* ignore */
      } finally {
        setLoadingLinks(false);
      }
    })();
  }, [success]);

  const handleSearch = useCallback(async () => {
    if (searchQuery.trim().length < 2) return;
    setSearching(true);
    setError(null);
    try {
      const results = await approvalApi.searchStudents(searchQuery.trim());
      setSearchResults(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setSearching(false);
    }
  }, [searchQuery]);

  const handleSubmit = useCallback(async () => {
    if (!selectedStudent || !user) return;
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      await approvalApi.requestParentStudentLink(
        selectedStudent.id,
        user.id,
        relation,
      );
      setSuccess(`Link request sent for ${selectedStudent.name}. Awaiting teacher approval.`);
      setSelectedStudent(null);
      setSearchQuery('');
      setSearchResults([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send request');
    } finally {
      setSubmitting(false);
    }
  }, [selectedStudent, user, relation]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Link to Student</Text>
        <View style={{ width: 40 }} />
      </View>

      {error ? <ErrorMessage message={error} /> : null}
      {success ? (
        <View style={styles.successBox}>
          <Text style={styles.successText}>{success}</Text>
        </View>
      ) : null}

      <Text style={styles.sectionTitle}>Search for a student</Text>
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Student name or email..."
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Button
          title="Search"
          onPress={() => { void handleSearch(); }}
          loading={searching}
          style={styles.searchBtn}
        />
      </View>

      {searchResults.length > 0 && (
        <View style={styles.resultsSection}>
          {searchResults.map((student) => (
            <TouchableOpacity
              key={student.id}
              style={[
                styles.resultItem,
                selectedStudent?.id === student.id && styles.resultItemActive,
              ]}
              onPress={() => setSelectedStudent(student)}
            >
              <Text
                style={[
                  styles.resultName,
                  selectedStudent?.id === student.id && styles.resultNameActive,
                ]}
              >
                {student.name}
              </Text>
              <Text style={styles.resultEmail}>{student.email}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {selectedStudent && (
        <View style={styles.linkForm}>
          <Text style={styles.sectionTitle}>
            Link to: {selectedStudent.name}
          </Text>
          <Text style={styles.label}>Relation:</Text>
          <View style={styles.relationRow}>
            {RELATIONS.map((r) => (
              <TouchableOpacity
                key={r}
                style={[styles.relationBtn, relation === r && styles.relationBtnActive]}
                onPress={() => setRelation(r)}
              >
                <Text style={[styles.relationText, relation === r && styles.relationTextActive]}>
                  {r}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Button
            title="Send Link Request"
            onPress={() => { void handleSubmit(); }}
            loading={submitting}
            style={styles.submitBtn}
          />
        </View>
      )}

      <Text style={[styles.sectionTitle, { marginTop: 24 }]}>My Link Requests</Text>
      {loadingLinks ? (
        <LoadingSpinner />
      ) : existingLinks.length === 0 ? (
        <Card>
          <Text style={styles.emptyText}>No link requests yet</Text>
        </Card>
      ) : (
        existingLinks.map((link) => (
          <Card key={link.id} style={styles.linkCard}>
            <View style={styles.linkRow}>
              <Text style={styles.linkLabel}>Student ID: {link.studentId}</Text>
              <View
                style={[
                  styles.statusBadge,
                  link.status === 'approved' && styles.statusApproved,
                  link.status === 'rejected' && styles.statusRejected,
                  link.status === 'pending' && styles.statusPending,
                ]}
              >
                <Text style={styles.statusText}>{link.status}</Text>
              </View>
            </View>
            <Text style={styles.linkDetail}>Relation: {link.relation}</Text>
          </Card>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  backText: {
    color: '#4F46E5',
    fontSize: 15,
    fontWeight: '600',
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
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    marginTop: 8,
  },
  label: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  linkCard: {
    marginBottom: 8,
  },
  linkDetail: {
    color: '#6B7280',
    fontSize: 13,
    marginTop: 4,
  },
  linkForm: {
    marginTop: 16,
  },
  linkLabel: {
    color: '#374151',
    flex: 1,
    fontSize: 14,
  },
  linkRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  relationBtn: {
    borderColor: '#D1D5DB',
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    marginHorizontal: 3,
    paddingVertical: 8,
  },
  relationBtnActive: {
    backgroundColor: '#EEF2FF',
    borderColor: '#4F46E5',
  },
  relationRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  relationText: {
    color: '#6B7280',
    fontSize: 13,
    textAlign: 'center',
  },
  relationTextActive: {
    color: '#4F46E5',
    fontWeight: '600',
  },
  resultEmail: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 2,
  },
  resultItem: {
    backgroundColor: '#ffffff',
    borderColor: '#D1D5DB',
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 6,
    padding: 12,
  },
  resultItemActive: {
    backgroundColor: '#EEF2FF',
    borderColor: '#4F46E5',
  },
  resultName: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '500',
  },
  resultNameActive: {
    color: '#4F46E5',
    fontWeight: '600',
  },
  resultsSection: {
    marginTop: 12,
  },
  searchBtn: {
    marginLeft: 8,
  },
  searchInput: {
    backgroundColor: '#ffffff',
    borderColor: '#D1D5DB',
    borderRadius: 8,
    borderWidth: 1,
    color: '#111827',
    flex: 1,
    fontSize: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchRow: {
    flexDirection: 'row',
  },
  sectionTitle: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
    marginTop: 4,
  },
  statusApproved: {
    backgroundColor: '#D1FAE5',
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusPending: {
    backgroundColor: '#FEF3C7',
  },
  statusRejected: {
    backgroundColor: '#FEE2E2',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  submitBtn: {
    marginTop: 4,
  },
  successBox: {
    backgroundColor: '#D1FAE5',
    borderRadius: 8,
    marginBottom: 16,
    padding: 12,
  },
  successText: {
    color: '#065F46',
    fontSize: 14,
  },
  title: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '700',
  },
});

export default LinkStudentScreen;
