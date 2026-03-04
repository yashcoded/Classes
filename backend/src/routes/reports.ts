import { Router } from 'express';
import {
  getStudentReport,
  getMyReport,
  getBatchReport,
  getTeacherReport,
  getMyTeacherReport,
} from '../controllers/reportController';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { UserRole } from '../types';

const router = Router();

router.use(authenticate);

router.get('/me/student', authorize(UserRole.STUDENT), getMyReport);
router.get('/me/teacher', authorize(UserRole.TEACHER), getMyTeacherReport);
router.get('/student/:studentId', getStudentReport);
router.get('/batch/:batchId', authorize(UserRole.TEACHER, UserRole.ADMIN), getBatchReport);
router.get('/teacher/:teacherId', authorize(UserRole.TEACHER, UserRole.ADMIN), getTeacherReport);

export default router;
