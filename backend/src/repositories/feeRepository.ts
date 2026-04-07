import { v4 as uuidv4 } from 'uuid';
import { FeeRecord, FeeStatus } from '../types';
import { feeRecords } from '../models';

export class FeeRepository {
  findById(id: string): FeeRecord | undefined {
    return feeRecords.get(id);
  }

  findByStudentId(studentId: string): FeeRecord[] {
    return Array.from(feeRecords.values()).filter((f) => f.studentId === studentId);
  }

  findByStatus(status: FeeStatus): FeeRecord[] {
    return Array.from(feeRecords.values()).filter((f) => f.status === status);
  }

  findOverdue(): FeeRecord[] {
    const now = new Date();
    return Array.from(feeRecords.values()).filter(
      (f) => f.status === FeeStatus.PENDING && f.dueDate < now,
    );
  }

  create(data: Omit<FeeRecord, 'id' | 'createdAt' | 'updatedAt'>): FeeRecord {
    const now = new Date();
    const fee: FeeRecord = { ...data, id: uuidv4(), createdAt: now, updatedAt: now };
    feeRecords.set(fee.id, fee);
    return fee;
  }

  update(id: string, data: Partial<FeeRecord>): FeeRecord | undefined {
    const existing = feeRecords.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...data, id, updatedAt: new Date() };
    feeRecords.set(id, updated);
    return updated;
  }

  findAll(): FeeRecord[] {
    return Array.from(feeRecords.values());
  }
}
