import { Router, type Router as ExpressRouter } from 'express';
import {
  createSession,
  getSession,
  getBatchSessions,
  getMySessions,
  startSession,
  endSession,
  cancelSession,
  refreshQR,
} from '../controllers/sessionController';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { UserRole } from '../types';

const router: ExpressRouter = Router();

router.use(authenticate);

router.get('/my', authorize(UserRole.TEACHER, UserRole.STUDENT), getMySessions);
router.get('/:id', getSession);
router.post('/batch/:batchId', authorize(UserRole.TEACHER, UserRole.ADMIN), createSession);
router.get('/batch/:batchId', getBatchSessions);
router.post('/:id/start', authorize(UserRole.TEACHER, UserRole.ADMIN), startSession);
router.post('/:id/end', authorize(UserRole.TEACHER, UserRole.ADMIN), endSession);
router.post('/:id/cancel', authorize(UserRole.TEACHER, UserRole.ADMIN), cancelSession);
router.post('/:id/qr/refresh', authorize(UserRole.TEACHER, UserRole.ADMIN), refreshQR);

export default router;
