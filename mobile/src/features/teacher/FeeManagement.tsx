import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Card from '@/components/common/Card';
import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';
import ErrorMessage from '@/components/common/ErrorMessage';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';
import * as feeApi from '@/services/feeApi';
import type { FeeRecord, FeeStatus } from '@/types';

const FEE_BADGE: Record<FeeStatus, 'success' | 'warning' | 'danger'> = {
  paid: 'success',
  pending: 'warning',
  overdue: 'danger',
};

const FeeManagement: React.FC = () => {
  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  // New fee form state
  const [newStudentId, setNewStudentId] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newDueDate, setNewDueDate] = useState(
    new Date().toISOString().split('T')[0] ?? '',
  );
  const [newDescription, setNewDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await feeApi.getAllFees();
      setFees(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load fees');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const handleMarkPaid = async (id: string) => {
    try {
      await feeApi.markFeePaid(id);
      void load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark as paid');
    }
  };

  const handleCreateFee = async () => {
    if (!newStudentId.trim() || !newAmount.trim()) {
      setFormError('Student ID and amount are required.');
      return;
    }
    const amount = parseFloat(newAmount);
    if (isNaN(amount) || amount <= 0) {
      setFormError('Amount must be a positive number.');
      return;
    }
    setCreating(true);
    setFormError(null);
    try {
      await feeApi.createFeeRecord({
        studentId: newStudentId.trim(),
        amount,
        dueDate: newDueDate.trim(),
        description: newDescription.trim() || undefined,
      });
      setShowModal(false);
      setNewStudentId('');
      setNewAmount('');
      setNewDescription('');
      void load();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to create fee');
    } finally {
      setCreating(false);
    }
  };

  if (isLoading) return <LoadingSpinner message="Loading fees..." />;
  if (error) return <ErrorMessage message={error} onRetry={() => { void load(); }} />;

  return (
    <View style={styles.container}>
      <FlatList
        data={fees}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState icon="💰" title="No fee records" description="Tap + to create a fee record" />
        }
        renderItem={({ item }) => (
          <Card>
            <View style={styles.row}>
              <View>
                <Text style={styles.studentId}>
                  Student: {item.student?.name ?? item.studentId}
                </Text>
                <Text style={styles.amount}>₹{item.amount}</Text>
                <Text style={styles.dueDate}>
                  Due: {new Date(item.dueDate).toLocaleDateString()}
                </Text>
                {item.description ? (
                  <Text style={styles.desc}>{item.description}</Text>
                ) : null}
              </View>
              <View style={styles.rightCol}>
                <Badge label={item.status} variant={FEE_BADGE[item.status]} />
                {item.status !== 'paid' && (
                  <TouchableOpacity
                    style={styles.payButton}
                    onPress={() => { void handleMarkPaid(item.id); }}
                  >
                    <Text style={styles.payText}>Mark Paid</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </Card>
        )}
      />

      <TouchableOpacity style={styles.fab} onPress={() => setShowModal(true)}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet">
        <ScrollView style={styles.modal} contentContainerStyle={styles.modalContent}>
          <Text style={styles.modalTitle}>Create Fee Record</Text>
          {formError ? <ErrorMessage message={formError} /> : null}

          <Text style={styles.label}>Student ID *</Text>
          <TextInput
            style={styles.input}
            placeholder="Student ID"
            placeholderTextColor="#9CA3AF"
            value={newStudentId}
            onChangeText={setNewStudentId}
            autoCapitalize="none"
          />

          <Text style={styles.label}>Amount *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 5000"
            placeholderTextColor="#9CA3AF"
            value={newAmount}
            onChangeText={setNewAmount}
            keyboardType="numeric"
          />

          <Text style={styles.label}>Due Date</Text>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#9CA3AF"
            value={newDueDate}
            onChangeText={setNewDueDate}
          />

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Monthly fee - June"
            placeholderTextColor="#9CA3AF"
            value={newDescription}
            onChangeText={setNewDescription}
          />

          <View style={styles.modalButtons}>
            <Button
              title="Cancel"
              onPress={() => setShowModal(false)}
              variant="secondary"
              style={styles.modalBtn}
            />
            <Button
              title="Create"
              onPress={() => { void handleCreateFee(); }}
              loading={creating}
              style={styles.modalBtn}
            />
          </View>
        </ScrollView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  amount: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  container: {
    backgroundColor: '#F9FAFB',
    flex: 1,
  },
  desc: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 2,
  },
  dueDate: {
    color: '#6B7280',
    fontSize: 13,
  },
  fab: {
    alignItems: 'center',
    backgroundColor: '#4F46E5',
    borderRadius: 28,
    bottom: 24,
    elevation: 6,
    height: 56,
    justifyContent: 'center',
    position: 'absolute',
    right: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    width: 56,
  },
  fabText: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '300',
    lineHeight: 32,
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
  list: {
    padding: 16,
  },
  modal: {
    backgroundColor: '#F9FAFB',
    flex: 1,
  },
  modalBtn: {
    flex: 1,
    marginHorizontal: 6,
  },
  modalButtons: {
    flexDirection: 'row',
    marginTop: 8,
  },
  modalContent: {
    padding: 24,
  },
  modalTitle: {
    color: '#111827',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
  },
  payButton: {
    backgroundColor: '#D1FAE5',
    borderRadius: 6,
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  payText: {
    color: '#065F46',
    fontSize: 12,
    fontWeight: '600',
  },
  rightCol: {
    alignItems: 'flex-end',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  studentId: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
});

export default FeeManagement;
