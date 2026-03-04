import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import Button from '@/components/common/Button';
import ErrorMessage from '@/components/common/ErrorMessage';
import * as batchApi from '@/services/batchApi';

const CreateBatch: React.FC = () => {
  const router = useRouter();
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [schedule, setSchedule] = useState('');
  const [maxStudents, setMaxStudents] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        schedule: schedule.trim() || undefined,
        maxStudents: maxStudents ? parseInt(maxStudents, 10) : undefined,
      });
      router.back();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create batch');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Create New Batch</Text>

      {error ? <ErrorMessage message={error} /> : null}

      <Text style={styles.label}>Batch Name *</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Math Grade 10 A"
        placeholderTextColor="#9CA3AF"
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>Subject</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Mathematics"
        placeholderTextColor="#9CA3AF"
        value={subject}
        onChangeText={setSubject}
      />

      <Text style={styles.label}>Schedule</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Mon/Wed/Fri 9:00 AM"
        placeholderTextColor="#9CA3AF"
        value={schedule}
        onChangeText={setSchedule}
      />

      <Text style={styles.label}>Max Students</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. 30"
        placeholderTextColor="#9CA3AF"
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
  );
};

const styles = StyleSheet.create({
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
  title: {
    color: '#111827',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 20,
  },
});

export default CreateBatch;
