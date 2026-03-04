import { Router } from 'express';
import {
  sendNotification,
  getMyNotifications,
  markRead,
  getNotification,
} from '../controllers/notificationController';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { UserRole } from '../types';

const router = Router();

router.use(authenticate);

router.post('/', authorize(UserRole.TEACHER, UserRole.ADMIN), sendNotification);
router.get('/me', getMyNotifications);
router.get('/:id', getNotification);
router.patch('/:id/read', markRead);

export default router;
