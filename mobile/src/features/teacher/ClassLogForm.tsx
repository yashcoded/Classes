import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '@/components/common/Button';
import DateTimeField from '@/components/common/DateTimeField';
import ErrorMessage from '@/components/common/ErrorMessage';
import { colors } from '@/constants/branding';
import * as classLogApi from '@/services/classLogApi';
import { useBatches } from '@/hooks/useBatches';
import type { Batch } from '@/types';

const ClassLogForm: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{
    batchId?: string;
    sessionId?: string;
    date?: string;
  }>();
  const { batches } = useBatches();
  const [batchId, setBatchId] = useState(params.batchId ?? '');
  const [sessionId, setSessionId] = useState(params.sessionId ?? '');
  const [date, setDate] = useState<Date | null>(
    params.date ? new Date(params.date) : new Date(),
  );
  const [topicTaught, setTopicTaught] = useState('');
  const [subtopic, setSubtopic] = useState('');
  const [homework, setHomework] = useState('');
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formattedDate = useMemo(() => {
    if (!date) return new Date().toISOString().split('T')[0] ?? '';
    return date.toISOString().split('T')[0] ?? '';
  }, [date]);

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
        date: formattedDate,
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
    <SafeAreaView style={styles.safe} edges={['top']}>
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
          placeholderTextColor={colors.textMuted}
          value={sessionId}
          onChangeText={setSessionId}
          autoCapitalize="none"
        />

        <DateTimeField
          label="Date *"
          value={date}
          onChange={setDate}
          mode="date"
        />

        <Text style={styles.label}>Topic Taught *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Quadratic Equations"
          placeholderTextColor={colors.textMuted}
          value={topicTaught}
          onChangeText={setTopicTaught}
        />

        <Text style={styles.label}>Subtopic</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Discriminant"
          placeholderTextColor={colors.textMuted}
          value={subtopic}
          onChangeText={setSubtopic}
        />

        <Text style={styles.label}>Homework</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          placeholder="Describe homework assigned..."
          placeholderTextColor={colors.textMuted}
          value={homework}
          onChangeText={setHomework}
          multiline
          numberOfLines={3}
        />

        <Text style={styles.label}>Remarks</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          placeholder="Any additional remarks..."
          placeholderTextColor={colors.textMuted}
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
    paddingVertical: 10,
  },
  batchItemActive: {
    backgroundColor: colors.primarySurface,
    borderColor: colors.primary,
  },
  batchList: {
    marginBottom: 16,
  },
  batchText: {
    color: colors.textPrimary,
    fontSize: 14,
  },
  batchTextActive: {
    color: colors.primary,
    fontWeight: '600',
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
  label: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  multiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  title: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 20,
  },
});

export default ClassLogForm;
