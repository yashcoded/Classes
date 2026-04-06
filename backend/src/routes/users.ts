import { Router, type Router as ExpressRouter } from 'express';
import {
  getAllUsers,
  getUserById,
  getMyProfile,
  updateTeacherProfile,
  updateStudentProfile,
  linkParentToStudent,
  getStudentParents,
  getParentStudents,
  getPendingTeachers,
  approveUser,
  getApprovedTeachers,
  requestParentStudentLink,
  getPendingParentStudentLinks,
  approveParentStudentLink,
  getMyParentStudentLinks,
  searchStudents,
} from '../controllers/userController';
import { authenticate } from '../middleware/authenticate';
import { authorize, requireApproved } from '../middleware/authorize';
import { UserRole } from '../types';

const router: ExpressRouter = Router();

router.use(authenticate);

router.get('/pending-teachers', authorize(UserRole.ADMIN), getPendingTeachers);
router.patch('/:id/approve', authorize(UserRole.ADMIN), approveUser);
router.get('/approved-teachers', getApprovedTeachers);

router.get('/', authorize(UserRole.ADMIN, UserRole.TEACHER), requireApproved, getAllUsers);
router.get('/me', getMyProfile);
router.get('/:id', getUserById);

router.put('/teacher/:userId/profile', authorize(UserRole.TEACHER, UserRole.ADMIN), requireApproved, updateTeacherProfile);
router.put('/student/:userId/profile', authorize(UserRole.STUDENT, UserRole.ADMIN), updateStudentProfile);

router.post('/parent-student-link', authorize(UserRole.ADMIN, UserRole.TEACHER), requireApproved, linkParentToStudent);
router.post('/parent-student-link/request', authorize(UserRole.PARENT, UserRole.STUDENT), requestParentStudentLink);
router.get('/parent-student-link/pending', authorize(UserRole.TEACHER, UserRole.ADMIN), requireApproved, getPendingParentStudentLinks);
router.patch('/parent-student-link/:id/approve', authorize(UserRole.TEACHER, UserRole.ADMIN), requireApproved, approveParentStudentLink);
router.get('/parent-student-link/mine', getMyParentStudentLinks);
router.get('/students/search', searchStudents);
router.get('/students/:studentId/parents', getStudentParents);
router.get('/parents/:parentId/students', getParentStudents);

export default router;
