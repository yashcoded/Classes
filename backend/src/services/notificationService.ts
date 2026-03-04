import { NotificationRepository } from '../repositories/notificationRepository';
import { BatchMembershipRepository } from '../repositories/membershipRepository';
import { UserRepository } from '../repositories/userRepository';
import {
  Notification,
  NotificationTargetType,
  BatchMembershipStatus,
  NotFoundError,
  ForbiddenError,
  UserRole,
} from '../types';

const notificationRepo = new NotificationRepository();
const membershipRepo = new BatchMembershipRepository();
const userRepo = new UserRepository();

export const notificationService = {
  send(
    senderId: string,
    data: Pick<Notification, 'title' | 'message' | 'targetType' | 'targetId'>,
  ): Notification {
    const sender = userRepo.findById(senderId);
    if (!sender) throw new NotFoundError('Sender not found');
    if (sender.role !== UserRole.TEACHER && sender.role !== UserRole.ADMIN) {
      throw new ForbiddenError('Only teachers or admins can send notifications');
    }

    return notificationRepo.create({
      ...data,
      senderId,
      readBy: [],
    });
  },

  getNotificationsForUser(userId: string): Notification[] {
    const user = userRepo.findById(userId);
    if (!user) throw new NotFoundError('User not found');

    const results: Notification[] = [];
    const seen = new Set<string>();

    // Direct notifications (student/parent/teacher/admin by userId)
    const directTargetTypes: NotificationTargetType[] = [
      NotificationTargetType.STUDENT,
      NotificationTargetType.PARENT,
      NotificationTargetType.TEACHER,
      NotificationTargetType.ADMIN,
    ];
    for (const tt of directTargetTypes) {
      for (const n of notificationRepo.findByTargetId(userId, tt)) {
        if (!seen.has(n.id)) {
          results.push(n);
          seen.add(n.id);
        }
      }
    }

    // Batch notifications (if student, get batch-level notifications)
    if (user.role === UserRole.STUDENT) {
      const memberships = membershipRepo
        .findByStudentId(userId)
        .filter((m) => m.status === BatchMembershipStatus.ACTIVE);
      for (const membership of memberships) {
        for (const n of notificationRepo.findByTargetId(
          membership.batchId,
          NotificationTargetType.BATCH,
        )) {
          if (!seen.has(n.id)) {
            results.push(n);
            seen.add(n.id);
          }
        }
      }
    }

    return results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  },

  markAsRead(notificationId: string, userId: string): Notification {
    const notification = notificationRepo.findById(notificationId);
    if (!notification) throw new NotFoundError('Notification not found');
    const updated = notificationRepo.markAsRead(notificationId, userId);
    if (!updated) throw new NotFoundError('Notification not found');
    return updated;
  },

  getNotificationById(id: string): Notification {
    const n = notificationRepo.findById(id);
    if (!n) throw new NotFoundError('Notification not found');
    return n;
  },

  getAllNotifications(requesterId: string): Notification[] {
    const requester = userRepo.findById(requesterId);
    if (!requester) throw new NotFoundError('User not found');
    if (requester.role !== UserRole.ADMIN) throw new ForbiddenError('Admin access required');
    return notificationRepo.findAll();
  },
};
