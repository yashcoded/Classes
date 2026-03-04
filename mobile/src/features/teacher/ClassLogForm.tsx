import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import Button from '@/components/common/Button';
import ErrorMessage from '@/components/common/ErrorMessage';
import * as classLogApi from '@/services/classLogApi';
import { useBatches } from '@/hooks/useBatches';
import type { Batch } from '@/types';

const ClassLogForm: React.FC = () => {
  const router = useRouter();
  const { batches } = useBatches();
  const [batchId, setBatchId] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0] ?? '');
  const [topicTaught, setTopicTaught] = useState('');
  const [subtopic, setSubtopic] = useState('');
  const [homework, setHomework] = useState('');
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!batchId) {
      setError('Please select a batch.');
      return;
    }
    if (!topicTaught.trim()) {
      setError('Topic taught is required.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await classLogApi.createClassLog({
        batchId,
        sessionId: sessionId.trim() || undefined,
        date: date.trim(),
        topicTaught: topicTaught.trim(),
        subtopic: subtopic.trim() || undefined,
        homework: homework.trim() || undefined,
        remarks: remarks.trim() || undefined,
      });
      router.back();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create class log');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>New Class Log</Text>
      {error ? <ErrorMessage message={error} /> : null}

      <Text style={styles.label}>Batch *</Text>
      <View style={styles.batchList}>
        {batches.map((batch: Batch) => (
          <TouchableOpacity
            key={batch.id}
            style={[styles.batchItem, batchId === batch.id && styles.batchItemActive]}
            onPress={() => setBatchId(batch.id)}
          >
            <Text style={[styles.batchText, batchId === batch.id && styles.batchTextActive]}>
              {batch.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Session ID (optional)</Text>
      <TextInput
        style={styles.input}
        placeholder="Leave blank if not session-specific"
        placeholderTextColor="#9CA3AF"
        value={sessionId}
        onChangeText={setSessionId}
        autoCapitalize="none"
      />

      <Text style={styles.label}>Date *</Text>
      <TextInput
        style={styles.input}
        placeholder="YYYY-MM-DD"
        placeholderTextColor="#9CA3AF"
        value={date}
        onChangeText={setDate}
      />

      <Text style={styles.label}>Topic Taught *</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Quadratic Equations"
        placeholderTextColor="#9CA3AF"
        value={topicTaught}
        onChangeText={setTopicTaught}
      />

      <Text style={styles.label}>Subtopic</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Discriminant"
        placeholderTextColor="#9CA3AF"
        value={subtopic}
        onChangeText={setSubtopic}
      />

      <Text style={styles.label}>Homework</Text>
      <TextInput
        style={[styles.input, styles.multiline]}
        placeholder="Describe homework assigned..."
        placeholderTextColor="#9CA3AF"
        value={homework}
        onChangeText={setHomework}
        multiline
        numberOfLines={3}
      />

      <Text style={styles.label}>Remarks</Text>
      <TextInput
        style={[styles.input, styles.multiline]}
        placeholder="Any additional remarks..."
        placeholderTextColor="#9CA3AF"
        value={remarks}
        onChangeText={setRemarks}
        multiline
        numberOfLines={3}
      />

      <Button
        title="Save Class Log"
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
  title: {
    color: '#111827',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 20,
  },
});

export default ClassLogForm;
