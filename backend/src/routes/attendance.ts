import { Router, type Router as ExpressRouter } from 'express';
import {
  checkIn,
  markManual,
  getSessionAttendance,
  getStudentAttendance,
  getMyAttendance,
  getAttendanceSummary,
} from '../controllers/attendanceController';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { UserRole } from '../types';

const router: ExpressRouter = Router();

router.use(authenticate);

router.get('/me', authorize(UserRole.STUDENT), getMyAttendance);
router.post('/session/:sessionId/check-in', authorize(UserRole.STUDENT), checkIn);
router.post('/session/:sessionId/manual', authorize(UserRole.TEACHER, UserRole.ADMIN), markManual);
router.get('/session/:sessionId', getSessionAttendance);
router.get('/student/:studentId', getStudentAttendance);
router.get('/student/:studentId/batch/:batchId/summary', getAttendanceSummary);

export default router;
