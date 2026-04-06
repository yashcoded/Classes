import { Router, type Router as ExpressRouter } from 'express';
import {
  createLog,
  getLog,
  getBatchLogs,
  updateLog,
  deleteLog,
} from '../controllers/classLogController';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { UserRole } from '../types';

const router: ExpressRouter = Router();

router.use(authenticate);

router.post('/', authorize(UserRole.TEACHER, UserRole.ADMIN), createLog);
router.get('/:id', getLog);
router.put('/:id', authorize(UserRole.TEACHER, UserRole.ADMIN), updateLog);
router.delete('/:id', authorize(UserRole.TEACHER, UserRole.ADMIN), deleteLog);
router.get('/batch/:batchId', getBatchLogs);

export default router;
