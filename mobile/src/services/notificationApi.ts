import { apiGet, apiPatch, apiPost } from '@/services/api';
import type { Notification, SendNotificationPayload } from '@/types';

export function sendNotification(
  data: SendNotificationPayload,
): Promise<Notification> {
  return apiPost<Notification>('/notifications', data);
}

export function getMyNotifications(): Promise<Notification[]> {
  return apiGet<Notification[]>('/notifications/me');
}

export function markNotificationRead(id: string): Promise<Notification> {
  return apiPatch<Notification>(`/notifications/${id}/read`, {});
}
