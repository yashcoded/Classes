import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import ErrorMessage from '@/components/common/ErrorMessage';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';
import * as testApi from '@/services/testApi';
import * as batchApi from '@/services/batchApi';
import type { BatchMembership, Test, TestResult } from '@/types';

interface EnterMarksProps {
  testId: string;
}

interface StudentMark {
  studentId: string;
  studentName: string;
  marks: string;
  remarks: string;
  existingResult?: TestResult;
}

const EnterMarks: React.FC<EnterMarksProps> = ({ testId }) => {
  const [test, setTest] = useState<Test | null>(null);
  const [marks, setMarks] = useState<StudentMark[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [testData, existingResults] = await Promise.all([
        testApi.getTest(testId),
        testApi.getTestResults(testId),
      ]);
      setTest(testData);

      const members: BatchMembership[] = await batchApi.getBatchMembers(
        testData.batchId,
      );
      const resultMap = new Map(
        existingResults.map((r) => [r.studentId, r]),
      );

      setMarks(
        members
          .filter((m) => m.status === 'active')
          .map((m) => ({
            studentId: m.studentId,
            studentName: m.student?.name ?? m.studentId,
            marks: resultMap.get(m.studentId)?.marksObtained?.toString() ?? '',
            remarks: resultMap.get(m.studentId)?.remarks ?? '',
            existingResult: resultMap.get(m.studentId),
          })),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  }, [testId]);

  useEffect(() => { void load(); }, [load]);

  const updateMark = (studentId: string, field: 'marks' | 'remarks', value: string) => {
    setMarks((prev) =>
      prev.map((m) => (m.studentId === studentId ? { ...m, [field]: value } : m)),
    );
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    setSuccess(false);
    try {
      for (const entry of marks) {
        const marksNum = parseFloat(entry.marks);
        if (!isNaN(marksNum)) {
          await testApi.submitTestResult(
            testId,
            entry.studentId,
            marksNum,
            entry.remarks || undefined,
          );
        }
      }
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit marks');
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) return <LoadingSpinner message="Loading students..." />;
  if (error) return <ErrorMessage message={error} onRetry={() => { void load(); }} />;
  if (!test) return <ErrorMessage message="Test not found" />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{test.title}</Text>
      <Text style={styles.subtitle}>Max Marks: {test.maxMarks}</Text>

      {success ? (
        <View style={styles.successBox}>
          <Text style={styles.successText}>✅ Marks saved successfully!</Text>
        </View>
      ) : null}

      {marks.length === 0 ? (
        <EmptyState icon="👥" title="No students in this batch" />
      ) : (
        <FlatList
          data={marks}
          keyExtractor={(item) => item.studentId}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <Card>
              <Text style={styles.studentName}>{item.studentName}</Text>
              <View style={styles.inputRow}>
                <View style={styles.marksContainer}>
                  <Text style={styles.fieldLabel}>Marks</Text>
                  <TextInput
                    style={styles.marksInput}
                    placeholder={`/ ${test.maxMarks}`}
                    placeholderTextColor="#9CA3AF"
                    value={item.marks}
                    onChangeText={(v) => updateMark(item.studentId, 'marks', v)}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.remarksContainer}>
                  <Text style={styles.fieldLabel}>Remarks</Text>
                  <TextInput
                    style={styles.remarksInput}
                    placeholder="Optional"
                    placeholderTextColor="#9CA3AF"
                    value={item.remarks}
                    onChangeText={(v) => updateMark(item.studentId, 'remarks', v)}
                  />
                </View>
              </View>
            </Card>
          )}
        />
      )}

      <Button
        title="Save All Marks"
        onPress={() => { void handleSubmit(); }}
        loading={submitting}
        style={styles.button}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  button: {
    marginTop: 12,
  },
  container: {
    backgroundColor: '#F9FAFB',
    flex: 1,
  },
  content: {
    padding: 16,
  },
  fieldLabel: {
    color: '#6B7280',
    fontSize: 12,
    marginBottom: 4,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  marksContainer: {
    flex: 1,
  },
  marksInput: {
    backgroundColor: '#F9FAFB',
    borderColor: '#D1D5DB',
    borderRadius: 6,
    borderWidth: 1,
    color: '#111827',
    fontSize: 15,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  remarksContainer: {
    flex: 2,
  },
  remarksInput: {
    backgroundColor: '#F9FAFB',
    borderColor: '#D1D5DB',
    borderRadius: 6,
    borderWidth: 1,
    color: '#111827',
    fontSize: 14,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  studentName: {
    color: '#111827',
    fontSize: 15,
    fontWeight: '600',
  },
  subTitle: {
    color: '#6B7280',
    fontSize: 14,
    marginBottom: 16,
  },
  subtitle: {
    color: '#6B7280',
    fontSize: 14,
    marginBottom: 16,
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
    fontWeight: '600',
    textAlign: 'center',
  },
  title: {
    color: '#111827',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
});

export default EnterMarks;
