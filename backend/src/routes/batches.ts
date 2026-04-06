import { Router, type Router as ExpressRouter } from 'express';
import {
  createBatch,
  getBatch,
  getMyBatches,
  getAllBatches,
  updateBatch,
  addStudent,
  removeStudent,
  transferStudent,
  getMembers,
  getStudentBatches,
} from '../controllers/batchController';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { UserRole } from '../types';

const router: ExpressRouter = Router();

router.use(authenticate);

router.get('/', authorize(UserRole.ADMIN, UserRole.TEACHER), getAllBatches);
router.get('/my', authorize(UserRole.TEACHER), getMyBatches);
router.post('/', authorize(UserRole.TEACHER, UserRole.ADMIN), createBatch);
router.get('/:id', getBatch);
router.put('/:id', authorize(UserRole.TEACHER, UserRole.ADMIN), updateBatch);

router.get('/:id/members', getMembers);
router.post('/:id/students', authorize(UserRole.TEACHER, UserRole.ADMIN), addStudent);
router.delete('/:id/students/:studentId', authorize(UserRole.TEACHER, UserRole.ADMIN), removeStudent);
router.post('/:id/students/:studentId/transfer', authorize(UserRole.TEACHER, UserRole.ADMIN), transferStudent);

router.get('/students/:studentId/batches', getStudentBatches);

export default router;
