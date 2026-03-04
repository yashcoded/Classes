import { v4 as uuidv4 } from 'uuid';
import { BatchMembership, BatchMembershipStatus, StudentBatchTransfer } from '../types';
import { batchMemberships, studentBatchTransfers } from '../models';

export class BatchMembershipRepository {
  findById(id: string): BatchMembership | undefined {
    return batchMemberships.get(id);
  }

  findByBatchId(batchId: string): BatchMembership[] {
    return Array.from(batchMemberships.values()).filter((m) => m.batchId === batchId);
  }

  findByStudentId(studentId: string): BatchMembership[] {
    return Array.from(batchMemberships.values()).filter((m) => m.studentId === studentId);
  }

  findActive(batchId: string): BatchMembership[] {
    return Array.from(batchMemberships.values()).filter(
      (m) => m.batchId === batchId && m.status === BatchMembershipStatus.ACTIVE,
    );
  }

  findByStudentAndBatch(studentId: string, batchId: string): BatchMembership | undefined {
    for (const m of batchMemberships.values()) {
      if (m.studentId === studentId && m.batchId === batchId) return m;
    }
    return undefined;
  }

  create(data: Omit<BatchMembership, 'id' | 'createdAt' | 'updatedAt'>): BatchMembership {
    const now = new Date();
    const membership: BatchMembership = { ...data, id: uuidv4(), createdAt: now, updatedAt: now };
    batchMemberships.set(membership.id, membership);
    return membership;
  }

  update(id: string, data: Partial<BatchMembership>): BatchMembership | undefined {
    const existing = batchMemberships.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...data, id, updatedAt: new Date() };
    batchMemberships.set(id, updated);
    return updated;
  }

  findAll(): BatchMembership[] {
    return Array.from(batchMemberships.values());
  }
}

export class BatchTransferRepository {
  findById(id: string): StudentBatchTransfer | undefined {
    return studentBatchTransfers.get(id);
  }

  findByStudentId(studentId: string): StudentBatchTransfer[] {
    return Array.from(studentBatchTransfers.values()).filter((t) => t.studentId === studentId);
  }

  create(
    data: Omit<StudentBatchTransfer, 'id' | 'createdAt' | 'updatedAt'>,
  ): StudentBatchTransfer {
    const now = new Date();
    const transfer: StudentBatchTransfer = {
      ...data,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
    };
    studentBatchTransfers.set(transfer.id, transfer);
    return transfer;
  }

  update(id: string, data: Partial<StudentBatchTransfer>): StudentBatchTransfer | undefined {
    const existing = studentBatchTransfers.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...data, id, updatedAt: new Date() };
    studentBatchTransfers.set(id, updated);
    return updated;
  }

  findAll(): StudentBatchTransfer[] {
    return Array.from(studentBatchTransfers.values());
  }
}
