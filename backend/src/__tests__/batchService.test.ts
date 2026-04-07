import { batchService } from '../services/batchService';
import { authService } from '../services/authService';
import { UserRole, BatchMembershipStatus, BatchTransferStatus } from '../types';
import * as models from '../models';

function clearModels() {
  models.users.clear();
  models.teacherProfiles.clear();
  models.studentProfiles.clear();
  models.parentProfiles.clear();
  models.batches.clear();
  models.batchMemberships.clear();
  models.studentBatchTransfers.clear();
}

describe('batchService', () => {
  let teacherId: string;
  let studentId: string;
  let batchAId: string;
  let batchBId: string;

  beforeEach(async () => {
    clearModels();
    const teacher = await authService.register(
      'teacher@batch.com',
      'pass123',
      UserRole.TEACHER,
      'Teacher',
    );
    teacherId = teacher.user.id;

    const student = await authService.register(
      'student@batch.com',
      'pass123',
      UserRole.STUDENT,
      'Student',
    );
    studentId = student.user.id;

    const batchA = batchService.createBatch(teacherId, { name: 'Batch A', maxStudents: 5 });
    batchAId = batchA.id;

    const batchB = batchService.createBatch(teacherId, { name: 'Batch B', maxStudents: 5 });
    batchBId = batchB.id;
  });

  describe('addStudentToBatch', () => {
    it('should add a student to a batch', () => {
      const membership = batchService.addStudentToBatch(batchAId, studentId, teacherId);
      expect(membership.studentId).toBe(studentId);
      expect(membership.batchId).toBe(batchAId);
      expect(membership.status).toBe(BatchMembershipStatus.ACTIVE);
    });

    it('should throw ConflictError when student already in batch', () => {
      batchService.addStudentToBatch(batchAId, studentId, teacherId);
      expect(() => batchService.addStudentToBatch(batchAId, studentId, teacherId)).toThrow(
        expect.objectContaining({ statusCode: 409 }),
      );
    });

    it('should throw ConflictError when batch is full', () => {
      const fullBatch = batchService.createBatch(teacherId, { name: 'Full Batch', maxStudents: 1 });
      batchService.addStudentToBatch(fullBatch.id, studentId, teacherId);

      // Register a second student
      return authService
        .register('student2@batch.com', 'pass123', UserRole.STUDENT, 'Student2')
        .then((s2) => {
          expect(() =>
            batchService.addStudentToBatch(fullBatch.id, s2.user.id, teacherId),
          ).toThrow(expect.objectContaining({ statusCode: 409 }));
        });
    });
  });

  describe('transferStudent', () => {
    beforeEach(() => {
      batchService.addStudentToBatch(batchAId, studentId, teacherId);
    });

    it('should transfer student from one batch to another', () => {
      const transfer = batchService.transferStudent(batchAId, batchBId, studentId, teacherId);
      expect(transfer.fromBatchId).toBe(batchAId);
      expect(transfer.toBatchId).toBe(batchBId);
      expect(transfer.status).toBe(BatchTransferStatus.COMPLETED);

      // Old membership should be transferred
      const oldMembers = models.batchMemberships;
      let foundTransferred = false;
      for (const m of oldMembers.values()) {
        if (m.batchId === batchAId && m.studentId === studentId) {
          expect(m.status).toBe(BatchMembershipStatus.TRANSFERRED);
          foundTransferred = true;
        }
      }
      expect(foundTransferred).toBe(true);

      // New membership should be active
      const newMembership = batchService.getActiveMemberships(batchBId);
      expect(newMembership.some((m) => m.studentId === studentId)).toBe(true);
    });

    it('should throw ValidationError when transferring to same batch', () => {
      expect(() =>
        batchService.transferStudent(batchAId, batchAId, studentId, teacherId),
      ).toThrow(expect.objectContaining({ statusCode: 400 }));
    });

    it('should throw NotFoundError when student not in source batch', async () => {
      const other = await authService.register(
        'other@test.com',
        'pass123',
        UserRole.STUDENT,
        'Other',
      );
      expect(() =>
        batchService.transferStudent(batchAId, batchBId, other.user.id, teacherId),
      ).toThrow(expect.objectContaining({ statusCode: 404 }));
    });

    it('should throw ConflictError when destination batch is full', () => {
      const tinybatch = batchService.createBatch(teacherId, {
        name: 'Tiny',
        maxStudents: 1,
      });
      // Fill the tiny batch with another student first
      return authService
        .register('filler@test.com', 'pass123', UserRole.STUDENT, 'Filler')
        .then((filler) => {
          batchService.addStudentToBatch(tinybatch.id, filler.user.id, teacherId);
          expect(() =>
            batchService.transferStudent(batchAId, tinybatch.id, studentId, teacherId),
          ).toThrow(expect.objectContaining({ statusCode: 409 }));
        });
    });

    it('should store transfer reason', () => {
      const transfer = batchService.transferStudent(
        batchAId,
        batchBId,
        studentId,
        teacherId,
        'Schedule conflict',
      );
      expect(transfer.reason).toBe('Schedule conflict');
    });
  });

  describe('removeStudentFromBatch', () => {
    beforeEach(() => {
      batchService.addStudentToBatch(batchAId, studentId, teacherId);
    });

    it('should remove student from batch', () => {
      const membership = batchService.removeStudentFromBatch(batchAId, studentId, teacherId);
      expect(membership.status).toBe(BatchMembershipStatus.INACTIVE);
    });

    it('should throw when student is not in batch', async () => {
      const other = await authService.register(
        'other2@test.com',
        'pass123',
        UserRole.STUDENT,
        'Other2',
      );
      expect(() =>
        batchService.removeStudentFromBatch(batchAId, other.user.id, teacherId),
      ).toThrow(expect.objectContaining({ statusCode: 404 }));
    });
  });
});
