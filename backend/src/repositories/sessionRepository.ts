import { v4 as uuidv4 } from 'uuid';
import { ClassSession, SessionStatus } from '../types';
import { classSessions } from '../models';

export class SessionRepository {
  findById(id: string): ClassSession | undefined {
    return classSessions.get(id);
  }

  findByBatchId(batchId: string): ClassSession[] {
    return Array.from(classSessions.values()).filter((s) => s.batchId === batchId);
  }

  findByTeacherId(teacherId: string): ClassSession[] {
    return Array.from(classSessions.values()).filter((s) => s.teacherId === teacherId);
  }

  findByStatus(status: SessionStatus): ClassSession[] {
    return Array.from(classSessions.values()).filter((s) => s.status === status);
  }

  create(data: Omit<ClassSession, 'id' | 'createdAt' | 'updatedAt'>): ClassSession {
    const now = new Date();
    const session: ClassSession = { ...data, id: uuidv4(), createdAt: now, updatedAt: now };
    classSessions.set(session.id, session);
    return session;
  }

  update(id: string, data: Partial<ClassSession>): ClassSession | undefined {
    const existing = classSessions.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...data, id, updatedAt: new Date() };
    classSessions.set(id, updated);
    return updated;
  }

  findAll(): ClassSession[] {
    return Array.from(classSessions.values());
  }
}
