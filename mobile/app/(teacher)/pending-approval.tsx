import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import Button from '@/components/common/Button';
import { useAuth } from '@/hooks/useAuth';
import * as authApi from '@/services/authApi';

export default function PendingApprovalScreen(): React.ReactElement {
  const router = useRouter();
  const { logout, user } = useAuth();
  const [checking, setChecking] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const checkStatus = useCallback(async () => {
    setChecking(true);
    setStatusMessage(null);
    try {
      const me = await authApi.getMe();
      if (me.status === 'approved') {
        setStatusMessage('You have been approved! Restarting...');
        setTimeout(() => {
          // Force a reload by logging out and back in
          // The user object in context still has the old status,
          // so we redirect manually
          window?.location?.reload?.();
        }, 1000);
      } else if (me.status === 'rejected') {
        setStatusMessage('Your account has been rejected. Please contact the administrator.');
      } else {
        setStatusMessage('Still pending. Please check back later.');
      }
    } catch {
      setStatusMessage('Could not check status. Try again.');
    } finally {
      setChecking(false);
    }
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>&#x23F3;</Text>
      <Text style={styles.title}>Pending Approval</Text>
      <Text style={styles.message}>
        Hello {user?.name ?? 'Teacher'}, your account is waiting for admin approval.
        You will have full access once an administrator approves your account.
      </Text>

      {statusMessage ? <Text style={styles.statusMessage}>{statusMessage}</Text> : null}

      <Button
        title="Check Status"
        onPress={() => { void checkStatus(); }}
        loading={checking}
        style={styles.button}
      />
      <Button
        title="Logout"
        onPress={() => {
          void (async () => {
            await logout();
            router.replace('/(auth)/login');
          })();
        }}
        variant="secondary"
        style={styles.button}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    marginTop: 12,
    width: '100%',
  },
  container: {
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    flex: 1,
    justifyContent: 'center',
    padding: 32,
  },
  icon: {
    fontSize: 48,
    marginBottom: 16,
  },
  message: {
    color: '#6B7280',
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 24,
    textAlign: 'center',
  },
  statusMessage: {
    backgroundColor: '#EEF2FF',
    borderRadius: 8,
    color: '#4F46E5',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    overflow: 'hidden',
    padding: 12,
    textAlign: 'center',
    width: '100%',
  },
  title: {
    color: '#111827',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
  },
});
