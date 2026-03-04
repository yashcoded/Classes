import { Router } from 'express';
import {
  createTest,
  getTest,
  getBatchTests,
  updateTest,
  deleteTest,
  submitResult,
  getTestResults,
  getMyResults,
} from '../controllers/testController';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { UserRole } from '../types';

const router = Router();

router.use(authenticate);

router.get('/my-results', authorize(UserRole.STUDENT), getMyResults);
router.post('/', authorize(UserRole.TEACHER, UserRole.ADMIN), createTest);
router.get('/:id', getTest);
router.put('/:id', authorize(UserRole.TEACHER, UserRole.ADMIN), updateTest);
router.delete('/:id', authorize(UserRole.TEACHER, UserRole.ADMIN), deleteTest);
router.post('/:id/results', authorize(UserRole.TEACHER, UserRole.ADMIN), submitResult);
router.get('/:id/results', getTestResults);
router.get('/batch/:batchId', getBatchTests);

export default router;
