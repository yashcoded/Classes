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
import * as notificationApi from '@/services/notificationApi';
import type { NotificationTargetType } from '@/types';

const TARGET_TYPES: { label: string; value: NotificationTargetType }[] = [
  { label: '🎒 Student', value: 'student' },
  { label: '👨‍👩‍👧 Parent', value: 'parent' },
  { label: '📚 Batch', value: 'batch' },
  { label: '👩‍🏫 Teacher', value: 'teacher' },
  { label: '🔑 Admin', value: 'admin' },
];

const SendNotification: React.FC = () => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetType, setTargetType] = useState<NotificationTargetType>('batch');
  const [targetId, setTargetId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSend = async () => {
    if (!title.trim() || !message.trim() || !targetId.trim()) {
      setError('Title, message, and target ID are required.');
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await notificationApi.sendNotification({
        title: title.trim(),
        message: message.trim(),
        targetType,
        targetId: targetId.trim(),
      });
      setSuccess(true);
      setTitle('');
      setMessage('');
      setTargetId('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send notification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Send Notification</Text>
      {error ? <ErrorMessage message={error} /> : null}
      {success ? (
        <View style={styles.successBox}>
          <Text style={styles.successText}>✅ Notification sent!</Text>
        </View>
      ) : null}

      <Text style={styles.label}>Title *</Text>
      <TextInput
        style={styles.input}
        placeholder="Notification title"
        placeholderTextColor="#9CA3AF"
        value={title}
        onChangeText={setTitle}
      />

      <Text style={styles.label}>Message *</Text>
      <TextInput
        style={[styles.input, styles.multiline]}
        placeholder="Write your message..."
        placeholderTextColor="#9CA3AF"
        value={message}
        onChangeText={setMessage}
        multiline
        numberOfLines={4}
      />

      <Text style={styles.label}>Target Type</Text>
      <View style={styles.targetRow}>
        {TARGET_TYPES.map((t) => (
          <TouchableOpacity
            key={t.value}
            style={[styles.targetBtn, targetType === t.value && styles.targetBtnActive]}
            onPress={() => setTargetType(t.value)}
          >
            <Text
              style={[
                styles.targetBtnText,
                targetType === t.value && styles.targetBtnTextActive,
              ]}
            >
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Target ID *</Text>
      <TextInput
        style={styles.input}
        placeholder={`Enter ${targetType} ID`}
        placeholderTextColor="#9CA3AF"
        value={targetId}
        onChangeText={setTargetId}
        autoCapitalize="none"
      />

      <Button
        title="Send Notification"
        onPress={() => { void handleSend(); }}
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
  heading: {
    color: '#111827',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 20,
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
    minHeight: 100,
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
  targetBtn: {
    borderColor: '#D1D5DB',
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
    marginRight: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  targetBtnActive: {
    backgroundColor: '#EEF2FF',
    borderColor: '#4F46E5',
  },
  targetBtnText: {
    color: '#6B7280',
    fontSize: 13,
  },
  targetBtnTextActive: {
    color: '#4F46E5',
    fontWeight: '600',
  },
  targetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
});

export default SendNotification;
