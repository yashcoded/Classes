import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '@/components/common/Button';
import DateTimeField from '@/components/common/DateTimeField';
import ErrorMessage from '@/components/common/ErrorMessage';
import { colors } from '@/constants/branding';
import * as batchApi from '@/services/batchApi';

const CreateBatch: React.FC = () => {
  const router = useRouter();
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [scheduleDate, setScheduleDate] = useState<Date | null>(null);
  const [maxStudents, setMaxStudents] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const serializedSchedule = useMemo(() => {
    if (!scheduleDate) return undefined;
    return scheduleDate.toLocaleString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, [scheduleDate]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Batch name is required.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await batchApi.createBatch({
        name: name.trim(),
        subject: subject.trim() || undefined,
        schedule: serializedSchedule,
        maxStudents: maxStudents ? parseInt(maxStudents, 10) : undefined,
      });
      router.replace('/(teacher)/batches');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create batch');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Create New Batch</Text>

        {error ? <ErrorMessage message={error} /> : null}

        <Text style={styles.label}>Batch Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Math Grade 10 A"
          placeholderTextColor={colors.textMuted}
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>Subject</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Mathematics"
          placeholderTextColor={colors.textMuted}
          value={subject}
          onChangeText={setSubject}
        />

        <DateTimeField
          label="Schedule"
          value={scheduleDate}
          onChange={setScheduleDate}
          mode="datetime"
        />

        <Text style={styles.label}>Max Students</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 30"
          placeholderTextColor={colors.textMuted}
          value={maxStudents}
          onChangeText={setMaxStudents}
          keyboardType="numeric"
        />

        <Button
          title="Create Batch"
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
    paddingVertical: 14,
  },
  label: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 24,
  },
});

export default CreateBatch;
