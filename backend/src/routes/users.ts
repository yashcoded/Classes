import { Router } from 'express';
import {
  getAllUsers,
  getUserById,
  getMyProfile,
  updateTeacherProfile,
  updateStudentProfile,
  linkParentToStudent,
  getStudentParents,
  getParentStudents,
} from '../controllers/userController';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { UserRole } from '../types';

const router = Router();

router.use(authenticate);

router.get('/', authorize(UserRole.ADMIN, UserRole.TEACHER), getAllUsers);
router.get('/me', getMyProfile);
router.get('/:id', getUserById);

router.put('/teacher/:userId/profile', authorize(UserRole.TEACHER, UserRole.ADMIN), updateTeacherProfile);
router.put('/student/:userId/profile', authorize(UserRole.STUDENT, UserRole.ADMIN), updateStudentProfile);

router.post('/parent-student-link', authorize(UserRole.ADMIN, UserRole.TEACHER), linkParentToStudent);
router.get('/students/:studentId/parents', getStudentParents);
router.get('/parents/:parentId/students', getParentStudents);

export default router;
