import { v4 as uuidv4 } from 'uuid';
import { ClassLog } from '../types';
import { classLogs } from '../models';

export class ClassLogRepository {
  findById(id: string): ClassLog | undefined {
    return classLogs.get(id);
  }

  findByBatchId(batchId: string): ClassLog[] {
    return Array.from(classLogs.values()).filter((l) => l.batchId === batchId);
  }

  findBySessionId(sessionId: string): ClassLog[] {
    return Array.from(classLogs.values()).filter((l) => l.sessionId === sessionId);
  }

  findByTeacherId(teacherId: string): ClassLog[] {
    return Array.from(classLogs.values()).filter((l) => l.teacherId === teacherId);
  }

  create(data: Omit<ClassLog, 'id' | 'createdAt' | 'updatedAt'>): ClassLog {
    const now = new Date();
    const log: ClassLog = { ...data, id: uuidv4(), createdAt: now, updatedAt: now };
    classLogs.set(log.id, log);
    return log;
  }

  update(id: string, data: Partial<ClassLog>): ClassLog | undefined {
    const existing = classLogs.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...data, id, updatedAt: new Date() };
    classLogs.set(id, updated);
    return updated;
  }

  delete(id: string): boolean {
    return classLogs.delete(id);
  }

  findAll(): ClassLog[] {
    return Array.from(classLogs.values());
  }
}
