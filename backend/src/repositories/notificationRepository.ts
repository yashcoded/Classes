import { v4 as uuidv4 } from 'uuid';
import { Notification, NotificationTargetType } from '../types';
import { notifications } from '../models';

export class NotificationRepository {
  findById(id: string): Notification | undefined {
    return notifications.get(id);
  }

  findByTargetId(targetId: string, targetType?: NotificationTargetType): Notification[] {
    return Array.from(notifications.values()).filter(
      (n) => n.targetId === targetId && (targetType === undefined || n.targetType === targetType),
    );
  }

  findBySenderId(senderId: string): Notification[] {
    return Array.from(notifications.values()).filter((n) => n.senderId === senderId);
  }

  create(data: Omit<Notification, 'id' | 'createdAt' | 'updatedAt'>): Notification {
    const now = new Date();
    const notification: Notification = { ...data, id: uuidv4(), createdAt: now, updatedAt: now };
    notifications.set(notification.id, notification);
    return notification;
  }

  markAsRead(id: string, userId: string): Notification | undefined {
    const existing = notifications.get(id);
    if (!existing) return undefined;
    if (!existing.readBy.includes(userId)) {
      const updated = {
        ...existing,
        readBy: [...existing.readBy, userId],
        updatedAt: new Date(),
      };
      notifications.set(id, updated);
      return updated;
    }
    return existing;
  }

  findAll(): Notification[] {
    return Array.from(notifications.values());
  }
}
