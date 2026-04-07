import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Card from '@/components/common/Card';
import Badge from '@/components/common/Badge';
import EmptyState from '@/components/common/EmptyState';
import ErrorMessage from '@/components/common/ErrorMessage';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import Button from '@/components/common/Button';
import DateTimeField from '@/components/common/DateTimeField';
import * as feeApi from '@/services/feeApi';
import * as notificationApi from '@/services/notificationApi';
import type { FeeRecord, FeeStatus, Notification } from '@/types';
import { useAuth } from '@/hooks/useAuth';

const FEE_BADGE: Record<FeeStatus, 'success' | 'warning' | 'danger'> = {
  paid: 'success',
  pending: 'warning',
  overdue: 'danger',
};

const FeeStatus_: React.FC = () => {
  const { user } = useAuth();
  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [paymentUpdates, setPaymentUpdates] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [selectedFee, setSelectedFee] = useState<FeeRecord | null>(null);
  const [notifyAmount, setNotifyAmount] = useState('');
  const [notifyDate, setNotifyDate] = useState<Date | null>(new Date());
  const [notifyReference, setNotifyReference] = useState('');
  const [notifyNote, setNotifyNote] = useState('');
  const [notifyError, setNotifyError] = useState<string | null>(null);
  const [notifyLoading, setNotifyLoading] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [feeData, notificationData] = await Promise.all([
        feeApi.getMyFees(),
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

  if (isLoading) return <LoadingSpinner message="Loading fees..." />;
  if (error?.includes('No approved student link found')) {
    return (
      <EmptyState
        icon="🔗"
        title="Link a student first"
        description="Approve a parent-student link to view fee records."
      />
    );
  }
  if (error) return <ErrorMessage message={error} onRetry={() => { void load(); }} />;

  const totalDue = fees
    .filter((f) => f.status !== 'paid')
    .reduce((sum, f) => sum + f.amount, 0);

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

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
    <View style={styles.container}>
      <Card style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Total Due</Text>
        <Text style={styles.summaryAmount}>₹{totalDue}</Text>
        <Text style={styles.summaryMeta}>
          {fees.filter((f) => f.status === 'pending').length} pending ·{' '}
          {fees.filter((f) => f.status === 'overdue').length} overdue ·{' '}
          {fees.filter((f) => f.status === 'paid').length} paid
        </Text>
      </Card>

      <FlatList
        data={fees}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          paymentUpdates.length > 0 ? (
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
          ) : null
        }
        onRefresh={() => { void load(); }}
        refreshing={isLoading}
        ListEmptyComponent={
          <EmptyState icon="💰" title="No fee records" />
        }
        renderItem={({ item }: { item: FeeRecord }) => (
          <Card>
            <View style={styles.row}>
              <View style={styles.leftCol}>
                <Text style={styles.amount}>₹{item.amount}</Text>
                <Text style={styles.due}>
                  Due: {new Date(item.dueDate).toLocaleDateString()}
                </Text>
                {item.description ? (
                  <Text style={styles.desc}>{item.description}</Text>
                ) : null}
                {item.paidDate ? (
                  <Text style={styles.paidDate}>
                    Paid: {new Date(item.paidDate).toLocaleDateString()}
                  </Text>
                ) : null}
                <TouchableOpacity style={styles.notifyBtn} onPress={() => openNotifyModal(item)}>
                  <Text style={styles.notifyBtnText}>Notify Payment</Text>
                </TouchableOpacity>
              </View>
              <Badge label={item.status} variant={FEE_BADGE[item.status]} />
            </View>
          </Card>
        )}
      />

      <Modal visible={showNotifyModal} animationType="slide" presentationStyle="pageSheet">
        <ScrollView style={styles.modal} contentContainerStyle={styles.modalContent}>
          <Text style={styles.modalTitle}>Notify Payment (Parent)</Text>
          <Text style={styles.helpText}>
            Add amount, payment date, and payment mode/reference (UPI/cash/bank transfer) so teacher can verify quickly.
          </Text>
          {notifyError ? <ErrorMessage message={notifyError} /> : null}

          <Text style={styles.label}>Amount Paid *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 5000"
            placeholderTextColor="#9CA3AF"
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
            placeholderTextColor="#9CA3AF"
            value={notifyReference}
            onChangeText={setNotifyReference}
          />

          <Text style={styles.label}>Note</Text>
          <TextInput
            style={[styles.input, styles.multiline]}
            placeholder="Any extra context..."
            placeholderTextColor="#9CA3AF"
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
  safe: {
    backgroundColor: '#F9FAFB',
    flex: 1,
  },
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
  due: {
    color: '#6B7280',
    fontSize: 13,
  },
  list: {
    padding: 16,
    paddingTop: 0,
    paddingBottom: 24,
  },
  historySection: {
    marginBottom: 10,
  },
  historyTitle: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  historyItemTitle: {
    color: '#111827',
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
    backgroundColor: '#EEF2FF',
    color: '#4F46E5',
    fontWeight: '700',
  },
  badgeOther: {
    backgroundColor: '#F3F4F6',
    color: '#374151',
    fontWeight: '600',
  },
  historyItemLine: {
    color: '#6B7280',
    fontSize: 12,
    marginBottom: 2,
  },
  historyItemTime: {
    color: '#9CA3AF',
    fontSize: 11,
    marginTop: 6,
  },
  notifyBtn: {
    marginTop: 8,
  },
  notifyBtnText: {
    color: '#4F46E5',
    fontSize: 12,
    fontWeight: '600',
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
    marginTop: 12,
  },
  modalContent: {
    padding: 16,
  },
  modalTitle: {
    color: '#111827',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  helpText: {
    color: '#6B7280',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  label: {
    color: '#6B7280',
    fontSize: 12,
    marginBottom: 4,
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
  multiline: {
    minHeight: 72,
    textAlignVertical: 'top',
  },
  paidDate: {
    color: '#065F46',
    fontSize: 12,
    marginTop: 2,
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
  summaryAmount: {
    color: '#EF4444',
    fontSize: 32,
    fontWeight: '800',
    marginVertical: 4,
  },
  summaryCard: {
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 12,
  },
  summaryLabel: {
    color: '#6B7280',
    fontSize: 14,
  },
  summaryMeta: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 4,
  },
});

export default FeeStatus_;
