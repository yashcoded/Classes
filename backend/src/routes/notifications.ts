import { Router, type Router as ExpressRouter } from 'express';
import {
  sendNotification,
  getMyNotifications,
  markRead,
  getNotification,
  sendPaymentUpdate,
} from '../controllers/notificationController';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { UserRole } from '../types';

const router: ExpressRouter = Router();

router.use(authenticate);

router.post('/', authorize(UserRole.TEACHER, UserRole.ADMIN), sendNotification);
router.post('/payment-update', authorize(UserRole.TEACHER, UserRole.PARENT), sendPaymentUpdate);
router.get('/me', getMyNotifications);
router.get('/:id', getNotification);
router.patch('/:id/read', markRead);

export default router;
