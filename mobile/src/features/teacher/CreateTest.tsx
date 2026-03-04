import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import Button from '@/components/common/Button';
import ErrorMessage from '@/components/common/ErrorMessage';
import * as testApi from '@/services/testApi';
import { useBatches } from '@/hooks/useBatches';
import type { Batch } from '@/types';

const CreateTest: React.FC = () => {
  const router = useRouter();
  const { batches } = useBatches();
  const [batchId, setBatchId] = useState('');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0] ?? '');
  const [maxMarks, setMaxMarks] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!batchId) {
      setError('Please select a batch.');
      return;
    }
    if (!title.trim() || !maxMarks.trim()) {
      setError('Title and max marks are required.');
      return;
    }
    const maxMarksNum = parseInt(maxMarks, 10);
    if (isNaN(maxMarksNum) || maxMarksNum <= 0) {
      setError('Max marks must be a positive number.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await testApi.createTest({
        batchId,
        title: title.trim(),
        date: date.trim(),
        maxMarks: maxMarksNum,
        description: description.trim() || undefined,
      });
      router.back();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create test');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Create Test</Text>
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

      <Text style={styles.label}>Test Title *</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Mid-term Exam"
        placeholderTextColor="#9CA3AF"
        value={title}
        onChangeText={setTitle}
      />

      <Text style={styles.label}>Date *</Text>
      <TextInput
        style={styles.input}
        placeholder="YYYY-MM-DD"
        placeholderTextColor="#9CA3AF"
        value={date}
        onChangeText={setDate}
      />

      <Text style={styles.label}>Max Marks *</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. 100"
        placeholderTextColor="#9CA3AF"
        value={maxMarks}
        onChangeText={setMaxMarks}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, styles.multiline]}
        placeholder="Optional description..."
        placeholderTextColor="#9CA3AF"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={3}
      />

      <Button
        title="Create Test"
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

export default CreateTest;
