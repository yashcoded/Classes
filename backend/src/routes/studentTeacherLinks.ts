import { Router, type Router as ExpressRouter } from 'express';
import {
  requestStudentTeacherLink,
  getPendingStudentTeacherLinks,
  approveStudentTeacherLink,
  getMyStudentTeacherLinks,
} from '../controllers/studentTeacherLinkController';
import { authenticate } from '../middleware/authenticate';
import { authorize, requireApproved } from '../middleware/authorize';
import { UserRole } from '../types';

const router: ExpressRouter = Router();

router.use(authenticate);

router.post('/', authorize(UserRole.STUDENT), requestStudentTeacherLink);
router.get('/pending', authorize(UserRole.TEACHER, UserRole.ADMIN), requireApproved, getPendingStudentTeacherLinks);
router.patch('/:id/approve', authorize(UserRole.TEACHER, UserRole.ADMIN), requireApproved, approveStudentTeacherLink);
router.get('/mine', getMyStudentTeacherLinks);

export default router;
