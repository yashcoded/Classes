import { Request, Response, NextFunction } from 'express';
import { notificationService } from '../services/notificationService';
import { NotificationTargetType, ValidationError } from '../types';

export const sendNotification = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const { title, message, targetType, targetId } = req.body as {
      title: string;
      message: string;
      targetType: NotificationTargetType;
      targetId: string;
    };
    if (!title || !message || !targetType || !targetId) {
      throw new ValidationError('title, message, targetType, and targetId are required');
    }
    const notification = notificationService.send(req.user!.userId, {
      title,
      message,
      targetType,
      targetId,
    });
    res.status(201).json(notification);
  } catch (err) {
    next(err);
  }
};

export const getMyNotifications = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const notifications = notificationService.getNotificationsForUser(req.user!.userId);
    res.json(notifications);
  } catch (err) {
    next(err);
  }
};

export const markRead = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const notification = notificationService.markAsRead(req.params.id, req.user!.userId);
    res.json(notification);
  } catch (err) {
    next(err);
  }
};

export const getNotification = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const notification = notificationService.getNotificationById(req.params.id);
    res.json(notification);
  } catch (err) {
    next(err);
  }
};
