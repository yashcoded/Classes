import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import Button from '@/components/common/Button';
import ErrorMessage from '@/components/common/ErrorMessage';
import * as sessionApi from '@/services/sessionApi';
import { useBatches } from '@/hooks/useBatches';
import type { Batch } from '@/types';
import { TouchableOpacity } from 'react-native';

const CreateSession: React.FC = () => {
  const router = useRouter();
  const { batches } = useBatches();
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!selectedBatchId) {
      setError('Please select a batch.');
      return;
    }
    if (!scheduledAt.trim()) {
      setError('Scheduled date/time is required.');
      return;
    }
    const dateValue = new Date(scheduledAt.trim());
    if (isNaN(dateValue.getTime())) {
      setError('Invalid date format. Use ISO format: 2024-06-01T10:00:00');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await sessionApi.createSession(selectedBatchId, dateValue.toISOString());
      router.back();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Schedule Session</Text>

      {error ? <ErrorMessage message={error} /> : null}

      <Text style={styles.label}>Select Batch *</Text>
      <View style={styles.batchList}>
        {batches.map((batch: Batch) => (
          <TouchableOpacity
            key={batch.id}
            style={[
              styles.batchItem,
              selectedBatchId === batch.id && styles.batchItemActive,
            ]}
            onPress={() => setSelectedBatchId(batch.id)}
          >
            <Text
              style={[
                styles.batchItemText,
                selectedBatchId === batch.id && styles.batchItemTextActive,
              ]}
            >
              {batch.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Scheduled Date & Time *</Text>
      <TextInput
        style={styles.input}
        placeholder="2024-06-01T10:00:00"
        placeholderTextColor="#9CA3AF"
        value={scheduledAt}
        onChangeText={setScheduledAt}
        autoCapitalize="none"
      />
      <Text style={styles.hint}>Enter in ISO 8601 format (e.g. 2024-06-01T10:00:00)</Text>

      <Button
        title="Schedule Session"
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
  batchItemText: {
    color: '#374151',
    fontSize: 14,
  },
  batchItemTextActive: {
    color: '#4F46E5',
    fontWeight: '600',
  },
  batchList: {
    marginBottom: 16,
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
  hint: {
    color: '#9CA3AF',
    fontSize: 12,
    marginBottom: 16,
    marginTop: -10,
  },
  input: {
    backgroundColor: '#ffffff',
    borderColor: '#D1D5DB',
    borderRadius: 8,
    borderWidth: 1,
    color: '#111827',
    fontSize: 15,
    marginBottom: 4,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  label: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  title: {
    color: '#111827',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 20,
  },
});

export default CreateSession;
