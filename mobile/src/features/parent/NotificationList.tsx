import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Card from '@/components/common/Card';
import EmptyState from '@/components/common/EmptyState';
import ErrorMessage from '@/components/common/ErrorMessage';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import * as notificationApi from '@/services/notificationApi';
import { useAuth } from '@/hooks/useAuth';
import type { Notification } from '@/types';

const NotificationList: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await notificationApi.getMyNotifications();
      setNotifications(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load notifications',
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const handleMarkRead = async (id: string) => {
    try {
      await notificationApi.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id
            ? { ...n, readBy: [...n.readBy, user?.id ?? ''] }
            : n,
        ),
      );
    } catch {
      // silent fail for read marking
    }
  };

  if (isLoading) return <LoadingSpinner message="Loading notifications..." />;
  if (error) return <ErrorMessage message={error} onRetry={() => { void load(); }} />;

  const unreadCount = notifications.filter(
    (n) => !n.readBy.includes(user?.id ?? ''),
  ).length;

  return (
    <View style={styles.container}>
      {unreadCount > 0 ? (
        <View style={styles.unreadBanner}>
          <Text style={styles.unreadText}>
            {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
          </Text>
        </View>
      ) : null}

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        onRefresh={() => { void load(); }}
        refreshing={isLoading}
        ListEmptyComponent={
          <EmptyState icon="🔔" title="No notifications" />
        }
        renderItem={({ item }: { item: Notification }) => {
          const isRead = item.readBy.includes(user?.id ?? '');
          return (
            <TouchableOpacity
              onPress={() => {
                if (!isRead) void handleMarkRead(item.id);
              }}
            >
              <Card style={isRead ? styles.readCard : styles.unreadCard}>
                <View style={styles.row}>
                  <Text style={[styles.title, !isRead && styles.unreadTitle]}>
                    {item.title}
                  </Text>
                  {!isRead ? (
                    <View style={styles.unreadDot} />
                  ) : null}
                </View>
                <Text style={styles.message}>{item.message}</Text>
                <Text style={styles.time}>
                  {new Date(item.createdAt).toLocaleDateString()} ·{' '}
                  {new Date(item.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </Card>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F9FAFB',
    flex: 1,
  },
  list: {
    padding: 16,
  },
  message: {
    color: '#374151',
    fontSize: 14,
    marginBottom: 6,
    marginTop: 4,
  },
  readCard: {
    opacity: 0.7,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  time: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  title: {
    color: '#374151',
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  unreadBanner: {
    backgroundColor: '#EEF2FF',
    padding: 10,
  },
  unreadCard: {
    borderLeftColor: '#4F46E5',
    borderLeftWidth: 3,
  },
  unreadDot: {
    backgroundColor: '#4F46E5',
    borderRadius: 5,
    height: 10,
    width: 10,
  },
  unreadText: {
    color: '#4F46E5',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  unreadTitle: {
    color: '#111827',
    fontWeight: '700',
  },
});

export default NotificationList;
