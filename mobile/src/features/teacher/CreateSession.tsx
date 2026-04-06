import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '@/components/common/Button';
import DateTimeField from '@/components/common/DateTimeField';
import ErrorMessage from '@/components/common/ErrorMessage';
import * as classLogApi from '@/services/classLogApi';
import { colors } from '@/constants/branding';
import * as sessionApi from '@/services/sessionApi';
import { TextInput } from 'react-native';
import { useBatches } from '@/hooks/useBatches';
import type { Batch } from '@/types';

const CreateSession: React.FC = () => {
  const router = useRouter();
  const { batches } = useBatches();
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [scheduledAt, setScheduledAt] = useState<Date | null>(null);
  const [topicTaught, setTopicTaught] = useState('');
  const [subtopic, setSubtopic] = useState('');
  const [homework, setHomework] = useState('');
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!selectedBatchId) {
      setError('Please select a batch.');
      return;
    }
    if (!scheduledAt) {
      setError('Scheduled date/time is required.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const session = await sessionApi.createSession(selectedBatchId, scheduledAt.toISOString());
      if (topicTaught.trim()) {
        await classLogApi.createClassLog({
          batchId: selectedBatchId,
          sessionId: session.id,
          date: scheduledAt.toISOString().split('T')[0] ?? new Date().toISOString().split('T')[0] ?? '',
          topicTaught: topicTaught.trim(),
          subtopic: subtopic.trim() || undefined,
          homework: homework.trim() || undefined,
          remarks: remarks.trim() || undefined,
        });
      }
      router.replace('/(teacher)/sessions');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Schedule Session</Text>

        {error ? <ErrorMessage message={error} /> : null}

        <Text style={styles.label}>Select Batch *</Text>
        <View style={styles.batchList}>
          {batches.length === 0 ? (
            <Text style={styles.hint}>No batches yet - create one first.</Text>
          ) : (
            batches.map((batch: Batch) => (
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
            ))
          )}
        </View>

        <DateTimeField
          label="Scheduled Date & Time *"
          value={scheduledAt}
          onChange={setScheduledAt}
          mode="datetime"
        />

        <Text style={styles.label}>Agenda / Topic taught (optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Quadratic equations"
          placeholderTextColor={colors.textMuted}
          value={topicTaught}
          onChangeText={setTopicTaught}
        />

        <Text style={styles.label}>Subtopic (optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Factorization and roots"
          placeholderTextColor={colors.textMuted}
          value={subtopic}
          onChangeText={setSubtopic}
        />

        <Text style={styles.label}>Homework (optional)</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          placeholder="Homework assigned"
          placeholderTextColor={colors.textMuted}
          value={homework}
          onChangeText={setHomework}
          multiline
          numberOfLines={3}
        />

        <Text style={styles.label}>Remarks (optional)</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          placeholder="Any additional notes"
          placeholderTextColor={colors.textMuted}
          value={remarks}
          onChangeText={setRemarks}
          multiline
          numberOfLines={3}
        />

        <Button
          title="Schedule Session"
          onPress={() => { void handleSubmit(); }}
          loading={loading}
          style={styles.button}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    backgroundColor: colors.background,
    flex: 1,
  },
  batchItem: {
    borderColor: colors.border,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  batchItemActive: {
    backgroundColor: colors.primarySurface,
    borderColor: colors.primary,
  },
  batchItemText: {
    color: colors.textPrimary,
    fontSize: 14,
  },
  batchItemTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  batchList: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  hint: {
    color: colors.textMuted,
    fontSize: 12,
    marginBottom: 16,
    marginTop: 0,
  },
  label: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 10,
    borderWidth: 1,
    color: colors.textPrimary,
    fontSize: 15,
    marginBottom: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  multiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  title: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 24,
  },
});

export default CreateSession;
