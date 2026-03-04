import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Button from '@/components/common/Button';
import ErrorMessage from '@/components/common/ErrorMessage';
import * as batchApi from '@/services/batchApi';
import { useBatches } from '@/hooks/useBatches';
import type { Batch } from '@/types';

const StudentTransfer: React.FC = () => {
  const { batches } = useBatches();
  const [sourceBatchId, setSourceBatchId] = useState('');
  const [studentId, setStudentId] = useState('');
  const [targetBatchId, setTargetBatchId] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!sourceBatchId || !studentId.trim() || !targetBatchId) {
      setError('Source batch, student ID, and target batch are all required.');
      return;
    }
    if (sourceBatchId === targetBatchId) {
      setError('Source and target batch must be different.');
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await batchApi.transferStudent(
        sourceBatchId,
        studentId.trim(),
        targetBatchId,
        reason.trim() || undefined,
      );
      setSuccess(true);
      setStudentId('');
      setReason('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Transfer failed');
    } finally {
      setLoading(false);
    }
  };

  const renderBatchSelector = (
    label: string,
    selected: string,
    onSelect: (id: string) => void,
    exclude?: string,
  ) => (
    <>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.batchList}>
        {batches
          .filter((b: Batch) => b.id !== exclude)
          .map((batch: Batch) => (
            <TouchableOpacity
              key={batch.id}
              style={[styles.batchItem, selected === batch.id && styles.batchItemActive]}
              onPress={() => onSelect(batch.id)}
            >
              <Text style={[styles.batchText, selected === batch.id && styles.batchTextActive]}>
                {batch.name}
              </Text>
            </TouchableOpacity>
          ))}
      </View>
    </>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Transfer Student</Text>
      {error ? <ErrorMessage message={error} /> : null}
      {success ? (
        <View style={styles.successBox}>
          <Text style={styles.successText}>✅ Student transferred successfully!</Text>
        </View>
      ) : null}

      {renderBatchSelector('From Batch *', sourceBatchId, setSourceBatchId)}

      <Text style={styles.label}>Student ID *</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter student ID"
        placeholderTextColor="#9CA3AF"
        value={studentId}
        onChangeText={setStudentId}
        autoCapitalize="none"
      />

      {renderBatchSelector(
        'To Batch *',
        targetBatchId,
        setTargetBatchId,
        sourceBatchId,
      )}

      <Text style={styles.label}>Reason (optional)</Text>
      <TextInput
        style={[styles.input, styles.multiline]}
        placeholder="Reason for transfer..."
        placeholderTextColor="#9CA3AF"
        value={reason}
        onChangeText={setReason}
        multiline
        numberOfLines={3}
      />

      <Button
        title="Transfer Student"
        onPress={() => { void handleSubmit(); }}
        loading={loading}
        style={styles.button}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  batchItem: {
    borderColor: '#D1D5DB',
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  batchItemActive: {
    backgroundColor: '#EEF2FF',
    borderColor: '#4F46E5',
  },
  batchList: {
    marginBottom: 16,
  },
  batchText: {
    color: '#374151',
    fontSize: 14,
  },
  batchTextActive: {
    color: '#4F46E5',
    fontWeight: '600',
  },
  button: {
    marginTop: 8,
  },
  container: {
    backgroundColor: '#F9FAFB',
    flex: 1,
  },
  content: {
    padding: 20,
  },
  input: {
    backgroundColor: '#ffffff',
    borderColor: '#D1D5DB',
    borderRadius: 8,
    borderWidth: 1,
    color: '#111827',
    fontSize: 15,
    marginBottom: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  label: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  multiline: {
    minHeight: 80,
    textAlignVertical: 'top',
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
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 20,
  },
});

export default StudentTransfer;
