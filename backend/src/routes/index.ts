import { Router } from 'express';
import authRouter from './auth';
import usersRouter from './users';
import batchesRouter from './batches';
import sessionsRouter from './sessions';
import attendanceRouter from './attendance';
import classLogsRouter from './classLogs';
import testsRouter from './tests';
import feesRouter from './fees';
import notificationsRouter from './notifications';
import reportsRouter from './reports';

const router = Router();

router.use('/auth', authRouter);
router.use('/users', usersRouter);
router.use('/batches', batchesRouter);
router.use('/sessions', sessionsRouter);
router.use('/attendance', attendanceRouter);
router.use('/class-logs', classLogsRouter);
router.use('/tests', testsRouter);
router.use('/fees', feesRouter);
router.use('/notifications', notificationsRouter);
router.use('/reports', reportsRouter);

export default router;
