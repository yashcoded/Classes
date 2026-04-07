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
import { SafeAreaView } from 'react-native-safe-area-context';
import Card from '@/components/common/Card';
import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';
import DateTimeField from '@/components/common/DateTimeField';
import ErrorMessage from '@/components/common/ErrorMessage';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';
import { colors } from '@/constants/branding';
import * as feeApi from '@/services/feeApi';
import * as notificationApi from '@/services/notificationApi';
import type { FeeRecord, FeeStatus, Notification } from '@/types';
import { useAuth } from '@/hooks/useAuth';

const FEE_BADGE: Record<FeeStatus, 'success' | 'warning' | 'danger'> = {
  paid: 'success',
  pending: 'warning',
  overdue: 'danger',
};

const FeeManagement: React.FC = () => {
  const { user } = useAuth();
  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [paymentUpdates, setPaymentUpdates] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [selectedFee, setSelectedFee] = useState<FeeRecord | null>(null);
  const [notifyAmount, setNotifyAmount] = useState('');
  const [notifyDate, setNotifyDate] = useState<Date | null>(new Date());
  const [notifyReference, setNotifyReference] = useState('');
  const [notifyNote, setNotifyNote] = useState('');
  const [notifyError, setNotifyError] = useState<string | null>(null);
  const [notifyLoading, setNotifyLoading] = useState(false);

  const [newStudentId, setNewStudentId] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newDueDate, setNewDueDate] = useState<Date | null>(new Date());
  const [newDescription, setNewDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [feeData, notificationData] = await Promise.all([
        feeApi.getAllFees(),
        notificationApi.getMyNotifications(),
      ]);
      setFees(feeData);
      setPaymentUpdates(
        notificationData
          .filter((n) => n.message.startsWith('PAYMENT_UPDATE|'))
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
      );
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
    if (!newDueDate) {
      setFormError('Due date is required.');
      return;
    }
    setCreating(true);
    setFormError(null);
    try {
      await feeApi.createFeeRecord({
        studentId: newStudentId.trim(),
        amount,
        dueDate: newDueDate.toISOString().split('T')[0] ?? '',
        description: newDescription.trim() || undefined,
      });
      setShowModal(false);
      setNewStudentId('');
      setNewAmount('');
      setNewDueDate(new Date());
      setNewDescription('');
      void load();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to create fee');
    } finally {
      setCreating(false);
    }
  };

  const openNotifyModal = (fee: FeeRecord) => {
    setSelectedFee(fee);
    setNotifyAmount(String(fee.amount));
    setNotifyDate(new Date());
    setNotifyReference('');
    setNotifyNote('');
    setNotifyError(null);
    setShowNotifyModal(true);
  };

  const handleSendPaymentUpdate = async () => {
    if (!selectedFee) return;
    const amount = parseFloat(notifyAmount);
    if (isNaN(amount) || amount <= 0) {
      setNotifyError('Please enter a valid amount paid.');
      return;
    }
    if (!notifyDate) {
      setNotifyError('Please select payment date.');
      return;
    }
    setNotifyLoading(true);
    setNotifyError(null);
    try {
      await notificationApi.sendPaymentUpdate({
        studentId: selectedFee.studentId,
        amount,
        paidOn: notifyDate.toISOString().split('T')[0] ?? '',
        reference: notifyReference.trim() || undefined,
        note: notifyNote.trim() || undefined,
      });
      setShowNotifyModal(false);
    } catch (err) {
      setNotifyError(err instanceof Error ? err.message : 'Failed to send payment update');
    } finally {
      setNotifyLoading(false);
    }
  };

  if (isLoading) return <LoadingSpinner message="Loading fees..." />;
  if (error) return <ErrorMessage message={error} onRetry={() => { void load(); }} />;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
    <View style={styles.container}>
      <FlatList
        data={fees}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View>
            <Text style={styles.title}>Track Payments</Text>
            <Text style={styles.subtitle}>Manage fee records and payment reminders</Text>
            {paymentUpdates.length > 0 ? (
              <View style={styles.historySection}>
                <Text style={styles.historyTitle}>Recent Payment Updates</Text>
                {paymentUpdates.slice(0, 5).map((item) => {
                  const lines = item.message
                    .split('\n')
                    .filter((line) => !line.startsWith('PAYMENT_UPDATE|'));
                  const sentByMe = item.senderId === user?.id;
                  return (
                    <Card key={item.id}>
                      <View style={styles.historyTopRow}>
                        <Text style={styles.historyItemTitle}>{item.title}</Text>
                        <Text style={[styles.historyBadge, sentByMe ? styles.badgeMine : styles.badgeOther]}>
                          {sentByMe ? '⬆️ Sent by me' : '⬇️ Received'}
                        </Text>
                      </View>
                      {lines.slice(0, 3).map((line, index) => (
                        <Text key={`${item.id}-${index}`} style={styles.historyItemLine}>
                          {line}
                        </Text>
                      ))}
                      <Text style={styles.historyItemTime}>
                        {new Date(item.createdAt).toLocaleString()}
                      </Text>
                    </Card>
                  );
                })}
              </View>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          <EmptyState icon="💰" title="No fee records" description="Tap + to create a fee record" />
        }
        renderItem={({ item }) => (
          <Card>
            <View style={styles.row}>
              <View style={styles.leftCol}>
                <Text style={styles.studentId}>
                  Student: {item.student?.name ?? item.studentId}
                </Text>
                <Text style={styles.amount}>Rs {item.amount}</Text>
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
                <TouchableOpacity
                  style={styles.notifyButton}
                  onPress={() => openNotifyModal(item)}
                >
                  <Text style={styles.notifyText}>Send Reminder/Update</Text>
                </TouchableOpacity>
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
            placeholderTextColor={colors.textMuted}
            value={newStudentId}
            onChangeText={setNewStudentId}
            autoCapitalize="none"
          />

          <Text style={styles.label}>Amount *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 5000"
            placeholderTextColor={colors.textMuted}
            value={newAmount}
            onChangeText={setNewAmount}
            keyboardType="numeric"
          />

          <DateTimeField
            label="Due Date"
            value={newDueDate}
            onChange={setNewDueDate}
            mode="date"
          />

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Monthly fee - June"
            placeholderTextColor={colors.textMuted}
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

      <Modal visible={showNotifyModal} animationType="slide" presentationStyle="pageSheet">
        <ScrollView style={styles.modal} contentContainerStyle={styles.modalContent}>
          <Text style={styles.modalTitle}>Notify Payment (Teacher)</Text>
          <Text style={styles.helpText}>
            Add amount, payment date, and payment mode/reference (UPI/cash/bank transfer) so parent can act quickly.
          </Text>
          {notifyError ? <ErrorMessage message={notifyError} /> : null}

          <Text style={styles.label}>Amount Paid *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 5000"
            placeholderTextColor={colors.textMuted}
            value={notifyAmount}
            onChangeText={setNotifyAmount}
            keyboardType="numeric"
          />

          <DateTimeField
            label="Payment Date *"
            value={notifyDate}
            onChange={setNotifyDate}
            mode="date"
          />

          <Text style={styles.label}>Mode / Reference</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. UPI TXN 123456"
            placeholderTextColor={colors.textMuted}
            value={notifyReference}
            onChangeText={setNotifyReference}
          />

          <Text style={styles.label}>Note</Text>
          <TextInput
            style={[styles.input, styles.multiline]}
            placeholder="Any extra context..."
            placeholderTextColor={colors.textMuted}
            value={notifyNote}
            onChangeText={setNotifyNote}
            multiline
            numberOfLines={3}
          />

          <View style={styles.modalButtons}>
            <Button
              title="Cancel"
              onPress={() => setShowNotifyModal(false)}
              variant="secondary"
              style={styles.modalBtn}
            />
            <Button
              title="Send Update"
              onPress={() => { void handleSendPaymentUpdate(); }}
              loading={notifyLoading}
              style={styles.modalBtn}
            />
          </View>
        </ScrollView>
      </Modal>
    </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  amount: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  safe: {
    backgroundColor: colors.background,
    flex: 1,
  },
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
  desc: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  dueDate: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  fab: {
    alignItems: 'center',
    backgroundColor: colors.primary,
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
    backgroundColor: '#F9FAFB',
    borderColor: '#D1D5DB',
    borderRadius: 6,
    borderWidth: 1,
    color: '#111827',
    fontSize: 14,
    marginBottom: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  label: {
    color: '#6B7280',
    fontSize: 12,
    marginBottom: 4,
  },
  list: {
    padding: 16,
    paddingBottom: 96,
  },
  title: {
    color: '#111827',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    color: '#6B7280',
    fontSize: 14,
    marginBottom: 16,
  },
  historySection: {
    marginBottom: 10,
  },
  historyTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  historyItemTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    flex: 1,
    fontWeight: '600',
    marginBottom: 2,
    marginRight: 8,
  },
  historyTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  historyBadge: {
    borderRadius: 8,
    fontSize: 11,
    overflow: 'hidden',
    paddingHorizontal: 8,
    paddingVertical: 3,
    textAlign: 'center',
  },
  badgeMine: {
    backgroundColor: colors.primarySurface,
    color: colors.primary,
    fontWeight: '700',
  },
  badgeOther: {
    backgroundColor: '#EEF2FF',
    color: '#4F46E5',
    fontWeight: '600',
  },
  historyItemLine: {
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: 2,
  },
  historyItemTime: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 6,
  },
  modal: {
    backgroundColor: colors.background,
    flex: 1,
  },
  modalBtn: {
    flex: 1,
    marginHorizontal: 6,
  },
  modalButtons: {
    flexDirection: 'row',
    marginTop: 12,
  },
  modalContent: {
    padding: 16,
  },
  modalTitle: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
  },
  helpText: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  multiline: {
    minHeight: 72,
    textAlignVertical: 'top',
  },
  notifyButton: {
    marginTop: 8,
  },
  notifyText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '600',
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
    minWidth: 118,
  },
  row: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  leftCol: {
    flex: 1,
    marginRight: 10,
  },
  studentId: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
});

export default FeeManagement;
