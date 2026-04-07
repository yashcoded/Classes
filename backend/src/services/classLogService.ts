import { ClassLogRepository } from '../repositories/classLogRepository';
import { BatchRepository } from '../repositories/batchRepository';
import { SessionRepository } from '../repositories/sessionRepository';
import {
  ClassLog,
  NotFoundError,
  ForbiddenError,
  UserRole,
} from '../types';
import { UserRepository } from '../repositories/userRepository';

const classLogRepo = new ClassLogRepository();
const batchRepo = new BatchRepository();
const sessionRepo = new SessionRepository();
const userRepo = new UserRepository();

export const classLogService = {
  createLog(
    requesterId: string,
    data: Pick<ClassLog, 'batchId' | 'date' | 'topicTaught'> &
      Partial<Pick<ClassLog, 'sessionId' | 'subtopic' | 'homework' | 'remarks'>>,
  ): ClassLog {
    const batch = batchRepo.findById(data.batchId);
    if (!batch) throw new NotFoundError('Batch not found');

    const requester = userRepo.findById(requesterId);
    if (!requester) throw new NotFoundError('User not found');
    if (requester.role !== UserRole.TEACHER && requester.role !== UserRole.ADMIN) {
      throw new ForbiddenError('Only teachers or admins can create class logs');
    }
    if (requester.role === UserRole.TEACHER && batch.teacherId !== requesterId) {
      throw new ForbiddenError('Not your batch');
    }

    if (data.sessionId) {
      const session = sessionRepo.findById(data.sessionId);
      if (!session) throw new NotFoundError('Session not found');
    }

    return classLogRepo.create({ ...data, teacherId: requesterId });
  },

  getLogById(id: string): ClassLog {
    const log = classLogRepo.findById(id);
    if (!log) throw new NotFoundError('Class log not found');
    return log;
  },

  getBatchLogs(batchId: string): ClassLog[] {
    return classLogRepo.findByBatchId(batchId);
  },

  updateLog(
    id: string,
    requesterId: string,
    data: Partial<Pick<ClassLog, 'topicTaught' | 'subtopic' | 'homework' | 'remarks' | 'date'>>,
  ): ClassLog {
    const log = classLogRepo.findById(id);
    if (!log) throw new NotFoundError('Class log not found');

    const requester = userRepo.findById(requesterId);
    if (!requester) throw new NotFoundError('User not found');
    if (requester.role !== UserRole.ADMIN && log.teacherId !== requesterId) {
      throw new ForbiddenError('Not your log');
    }

    const updated = classLogRepo.update(id, data);
    if (!updated) throw new NotFoundError('Class log not found');
    return updated;
  },

  deleteLog(id: string, requesterId: string): void {
    const log = classLogRepo.findById(id);
    if (!log) throw new NotFoundError('Class log not found');

    const requester = userRepo.findById(requesterId);
    if (!requester) throw new NotFoundError('User not found');
    if (requester.role !== UserRole.ADMIN && log.teacherId !== requesterId) {
      throw new ForbiddenError('Not your log');
    }

    classLogRepo.delete(id);
  },
};
