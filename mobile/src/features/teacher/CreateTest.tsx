import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '@/components/common/Button';
import DateTimeField from '@/components/common/DateTimeField';
import ErrorMessage from '@/components/common/ErrorMessage';
import { colors } from '@/constants/branding';
import * as testApi from '@/services/testApi';
import { useBatches } from '@/hooks/useBatches';
import type { Batch } from '@/types';

const CreateTest: React.FC = () => {
  const router = useRouter();
  const { batches } = useBatches();
  const [batchId, setBatchId] = useState('');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState<Date | null>(new Date());
  const [maxMarks, setMaxMarks] = useState('');
  const [description, setDescription] = useState('');
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
        date: formattedDate,
        maxMarks: maxMarksNum,
        description: description.trim() || undefined,
      });
      router.replace('/(teacher)/tests');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create test');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
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
          placeholderTextColor={colors.textMuted}
          value={title}
          onChangeText={setTitle}
        />

        <DateTimeField
          label="Date *"
          value={date}
          onChange={setDate}
          mode="date"
        />

        <Text style={styles.label}>Max Marks *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 100"
          placeholderTextColor={colors.textMuted}
          value={maxMarks}
          onChangeText={setMaxMarks}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          placeholder="Optional description..."
          placeholderTextColor={colors.textMuted}
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

export default CreateTest;
