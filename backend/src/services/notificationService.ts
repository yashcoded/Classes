import { NotificationRepository } from '../repositories/notificationRepository';
import { BatchMembershipRepository } from '../repositories/membershipRepository';
import { UserRepository } from '../repositories/userRepository';
import { studentParentLinks, studentTeacherLinks } from '../models';
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

  sendPaymentUpdate(
    senderId: string,
    data: {
      studentId: string;
      amount: number;
      paidOn: string;
      reference?: string;
      note?: string;
    },
  ): Notification[] {
    const sender = userRepo.findById(senderId);
    if (!sender) throw new NotFoundError('Sender not found');
    if (sender.role !== UserRole.PARENT && sender.role !== UserRole.TEACHER) {
      throw new ForbiddenError('Only parents or teachers can send payment updates');
    }

    const student = userRepo.findById(data.studentId);
    if (!student || student.role !== UserRole.STUDENT) {
      throw new NotFoundError('Student not found');
    }

    const approvedTeacherLinks = Array.from(studentTeacherLinks.values()).filter(
      (link) => link.studentId === data.studentId && link.status === 'approved',
    );
    const approvedParentLinks = Array.from(studentParentLinks.values()).filter(
      (link) => link.studentId === data.studentId && link.status === 'approved',
    );

    const isLinkedParent =
      sender.role === UserRole.PARENT &&
      approvedParentLinks.some((link) => link.parentId === senderId);
    const isLinkedTeacher =
      sender.role === UserRole.TEACHER &&
      approvedTeacherLinks.some((link) => link.teacherId === senderId);

    if ((sender.role === UserRole.PARENT && !isLinkedParent) || (sender.role === UserRole.TEACHER && !isLinkedTeacher)) {
      throw new ForbiddenError('You are not linked to this student');
    }

    const recipientUserIds =
      sender.role === UserRole.PARENT
        ? approvedTeacherLinks.map((link) => link.teacherId)
        : approvedParentLinks.map((link) => link.parentId);

    if (recipientUserIds.length === 0) {
      throw new NotFoundError('No recipients found for this payment update');
    }

    const uniqueRecipients = Array.from(new Set(recipientUserIds));
    const targetType =
      sender.role === UserRole.PARENT
        ? NotificationTargetType.TEACHER
        : NotificationTargetType.PARENT;
    const title =
      sender.role === UserRole.PARENT
        ? `Payment reported by parent (${student.name})`
        : `Payment update from teacher (${student.name})`;
    const messageLines = [
      `PAYMENT_UPDATE|studentId=${student.id}`,
      `Student: ${student.name}`,
      `Amount: Rs ${data.amount}`,
      `Paid on: ${data.paidOn}`,
      `Reference: ${data.reference?.trim() || 'N/A'}`,
      `Note: ${data.note?.trim() || 'N/A'}`,
      `Submitted by: ${sender.name} (${sender.email})`,
      'Please verify and update fee status accordingly.',
    ];
    const message = messageLines.join('\n');

    return uniqueRecipients.map((targetId) =>
      notificationRepo.create({
        title,
        message,
        targetType,
        targetId,
        senderId,
        readBy: [],
      }),
    );
  },
};
