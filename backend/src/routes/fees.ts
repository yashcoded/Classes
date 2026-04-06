import { Router, type Router as ExpressRouter } from 'express';
import {
  createFee,
  getFee,
  getStudentFees,
  getMyFees,
  getAllFees,
  markPaid,
  getOverdueFees,
} from '../controllers/feeController';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { UserRole } from '../types';

const router: ExpressRouter = Router();

router.use(authenticate);

router.get('/me', authorize(UserRole.STUDENT, UserRole.PARENT), getMyFees);
router.get('/overdue', authorize(UserRole.TEACHER, UserRole.ADMIN), getOverdueFees);
router.get('/', authorize(UserRole.TEACHER, UserRole.ADMIN), getAllFees);
router.post('/', authorize(UserRole.TEACHER, UserRole.ADMIN), createFee);
router.get('/student/:studentId', authorize(UserRole.TEACHER, UserRole.ADMIN, UserRole.PARENT), getStudentFees);
router.get('/:id', getFee);
router.post('/:id/pay', authorize(UserRole.TEACHER, UserRole.ADMIN), markPaid);

export default router;
