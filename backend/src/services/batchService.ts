import { BatchRepository } from '../repositories/batchRepository';
import { BatchMembershipRepository, BatchTransferRepository } from '../repositories/membershipRepository';
import { UserRepository } from '../repositories/userRepository';
import {
  Batch,
  BatchMembership,
  BatchMembershipStatus,
  BatchTransferStatus,
  StudentBatchTransfer,
  UserRole,
  NotFoundError,
  ForbiddenError,
  ConflictError,
  ValidationError,
} from '../types';

const batchRepo = new BatchRepository();
const membershipRepo = new BatchMembershipRepository();
const transferRepo = new BatchTransferRepository();
const userRepo = new UserRepository();

export const batchService = {
  createBatch(
    teacherId: string,
    data: Pick<Batch, 'name'> & Partial<Pick<Batch, 'subject' | 'schedule' | 'maxStudents'>>,
  ): Batch {
    return batchRepo.create({
      ...data,
      teacherId,
      isActive: true,
    });
  },

  getBatchById(id: string): Batch {
    const batch = batchRepo.findById(id);
    if (!batch) throw new NotFoundError('Batch not found');
    return batch;
  },

  getTeacherBatches(teacherId: string): Batch[] {
    return batchRepo.findByTeacherId(teacherId);
  },

  getAllBatches(): Batch[] {
    return batchRepo.findAll();
  },

  updateBatch(
    id: string,
    teacherId: string,
    data: Partial<Pick<Batch, 'name' | 'subject' | 'schedule' | 'maxStudents' | 'isActive'>>,
  ): Batch {
    const batch = batchRepo.findById(id);
    if (!batch) throw new NotFoundError('Batch not found');
    if (batch.teacherId !== teacherId) throw new ForbiddenError('Not your batch');
    const updated = batchRepo.update(id, data);
    if (!updated) throw new NotFoundError('Batch not found');
    return updated;
  },

  addStudentToBatch(batchId: string, studentId: string, requesterId: string): BatchMembership {
    const batch = batchRepo.findById(batchId);
    if (!batch) throw new NotFoundError('Batch not found');

    const requester = userRepo.findById(requesterId);
    if (!requester) throw new NotFoundError('Requester not found');
    if (requester.role !== UserRole.TEACHER && requester.role !== UserRole.ADMIN) {
      throw new ForbiddenError('Only teachers or admins can add students');
    }
    if (requester.role === UserRole.TEACHER && batch.teacherId !== requesterId) {
      throw new ForbiddenError('Not your batch');
    }

    const student = userRepo.findById(studentId);
    if (!student || student.role !== UserRole.STUDENT) {
      throw new NotFoundError('Student not found');
    }

    // Check if already active in this batch
    const existing = membershipRepo.findByStudentAndBatch(studentId, batchId);
    if (existing && existing.status === BatchMembershipStatus.ACTIVE) {
      throw new ConflictError('Student already in this batch');
    }

    // Check maxStudents
    if (batch.maxStudents !== undefined) {
      const activeCount = membershipRepo.findActive(batchId).length;
      if (activeCount >= batch.maxStudents) {
        throw new ConflictError('Batch is full');
      }
    }

    if (existing) {
      // Reactivate
      const updated = membershipRepo.update(existing.id, {
        status: BatchMembershipStatus.ACTIVE,
        joinedAt: new Date(),
        leftAt: undefined,
      });
      if (!updated) throw new NotFoundError('Membership not found');
      return updated;
    }

    return membershipRepo.create({
      batchId,
      studentId,
      status: BatchMembershipStatus.ACTIVE,
      joinedAt: new Date(),
    });
  },

  removeStudentFromBatch(batchId: string, studentId: string, requesterId: string): BatchMembership {
    const batch = batchRepo.findById(batchId);
    if (!batch) throw new NotFoundError('Batch not found');

    const requester = userRepo.findById(requesterId);
    if (!requester) throw new NotFoundError('Requester not found');
    if (requester.role === UserRole.TEACHER && batch.teacherId !== requesterId) {
      throw new ForbiddenError('Not your batch');
    }

    const membership = membershipRepo.findByStudentAndBatch(studentId, batchId);
    if (!membership || membership.status !== BatchMembershipStatus.ACTIVE) {
      throw new NotFoundError('Active membership not found');
    }

    const updated = membershipRepo.update(membership.id, {
      status: BatchMembershipStatus.INACTIVE,
      leftAt: new Date(),
    });
    if (!updated) throw new NotFoundError('Membership not found');
    return updated;
  },

  transferStudent(
    fromBatchId: string,
    toBatchId: string,
    studentId: string,
    requesterId: string,
    reason?: string,
  ): StudentBatchTransfer {
    const fromBatch = batchRepo.findById(fromBatchId);
    if (!fromBatch) throw new NotFoundError('Source batch not found');

    const toBatch = batchRepo.findById(toBatchId);
    if (!toBatch) throw new NotFoundError('Destination batch not found');

    if (fromBatchId === toBatchId) throw new ValidationError('Cannot transfer to same batch');

    const requester = userRepo.findById(requesterId);
    if (!requester) throw new NotFoundError('Requester not found');
    if (requester.role === UserRole.TEACHER && fromBatch.teacherId !== requesterId) {
      throw new ForbiddenError('Not your batch');
    }

    const membership = membershipRepo.findByStudentAndBatch(studentId, fromBatchId);
    if (!membership || membership.status !== BatchMembershipStatus.ACTIVE) {
      throw new NotFoundError('Active membership in source batch not found');
    }

    // Check maxStudents on destination
    if (toBatch.maxStudents !== undefined) {
      const activeCount = membershipRepo.findActive(toBatchId).length;
      if (activeCount >= toBatch.maxStudents) throw new ConflictError('Destination batch is full');
    }

    // Mark old membership as transferred
    membershipRepo.update(membership.id, {
      status: BatchMembershipStatus.TRANSFERRED,
      leftAt: new Date(),
    });

    // Create new membership in destination batch
    membershipRepo.create({
      batchId: toBatchId,
      studentId,
      status: BatchMembershipStatus.ACTIVE,
      joinedAt: new Date(),
    });

    return transferRepo.create({
      studentId,
      fromBatchId,
      toBatchId,
      transferredBy: requesterId,
      status: BatchTransferStatus.COMPLETED,
      reason,
      transferredAt: new Date(),
    });
  },

  getActiveMemberships(batchId: string): BatchMembership[] {
    return membershipRepo.findActive(batchId);
  },

  getStudentBatches(studentId: string): Batch[] {
    const memberships = membershipRepo
      .findByStudentId(studentId)
      .filter((m) => m.status === BatchMembershipStatus.ACTIVE);
    return memberships.flatMap((m) => {
      const batch = batchRepo.findById(m.batchId);
      return batch ? [batch] : [];
    });
  },

  getTransferHistory(studentId: string): StudentBatchTransfer[] {
    return transferRepo.findByStudentId(studentId);
  },
};
