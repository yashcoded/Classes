import { TestRepository, TestResultRepository } from '../repositories/testRepository';
import { BatchRepository } from '../repositories/batchRepository';
import { BatchMembershipRepository } from '../repositories/membershipRepository';
import {
  Test,
  TestResult,
  NotFoundError,
  ForbiddenError,
  ConflictError,
  ValidationError,
  UserRole,
  BatchMembershipStatus,
} from '../types';
import { UserRepository } from '../repositories/userRepository';
import { studentParentLinks } from '../models';

const testRepo = new TestRepository();
const testResultRepo = new TestResultRepository();
const batchRepo = new BatchRepository();
const membershipRepo = new BatchMembershipRepository();
const userRepo = new UserRepository();

export const testService = {
  createTest(
    requesterId: string,
    data: Pick<Test, 'batchId' | 'title' | 'date' | 'maxMarks'> &
      Partial<Pick<Test, 'description'>>,
  ): Test {
    const batch = batchRepo.findById(data.batchId);
    if (!batch) throw new NotFoundError('Batch not found');

    const requester = userRepo.findById(requesterId);
    if (!requester) throw new NotFoundError('User not found');
    if (requester.role !== UserRole.TEACHER && requester.role !== UserRole.ADMIN) {
      throw new ForbiddenError('Only teachers or admins can create tests');
    }
    if (requester.role === UserRole.TEACHER && batch.teacherId !== requesterId) {
      throw new ForbiddenError('Not your batch');
    }

    return testRepo.create({ ...data, teacherId: requesterId });
  },

  getTestById(id: string): Test {
    const test = testRepo.findById(id);
    if (!test) throw new NotFoundError('Test not found');
    return test;
  },

  getBatchTests(batchId: string): Test[] {
    return testRepo.findByBatchId(batchId);
  },

  updateTest(
    id: string,
    requesterId: string,
    data: Partial<Pick<Test, 'title' | 'date' | 'maxMarks' | 'description'>>,
  ): Test {
    const test = testRepo.findById(id);
    if (!test) throw new NotFoundError('Test not found');

    const requester = userRepo.findById(requesterId);
    if (!requester) throw new NotFoundError('User not found');
    if (requester.role !== UserRole.ADMIN && test.teacherId !== requesterId) {
      throw new ForbiddenError('Not your test');
    }

    const updated = testRepo.update(id, data);
    if (!updated) throw new NotFoundError('Test not found');
    return updated;
  },

  deleteTest(id: string, requesterId: string): void {
    const test = testRepo.findById(id);
    if (!test) throw new NotFoundError('Test not found');

    const requester = userRepo.findById(requesterId);
    if (!requester) throw new NotFoundError('User not found');
    if (requester.role !== UserRole.ADMIN && test.teacherId !== requesterId) {
      throw new ForbiddenError('Not your test');
    }

    testRepo.delete(id);
  },

  submitResult(
    testId: string,
    studentId: string,
    marksObtained: number,
    requesterId: string,
    remarks?: string,
  ): TestResult {
    const test = testRepo.findById(testId);
    if (!test) throw new NotFoundError('Test not found');

    const requester = userRepo.findById(requesterId);
    if (!requester) throw new NotFoundError('User not found');
    if (requester.role !== UserRole.TEACHER && requester.role !== UserRole.ADMIN) {
      throw new ForbiddenError('Only teachers or admins can submit results');
    }
    if (requester.role === UserRole.TEACHER && test.teacherId !== requesterId) {
      throw new ForbiddenError('Not your test');
    }

    if (marksObtained < 0 || marksObtained > test.maxMarks) {
      throw new ValidationError(
        `Marks must be between 0 and ${test.maxMarks}`,
      );
    }

    const student = userRepo.findById(studentId);
    if (!student || student.role !== UserRole.STUDENT) {
      throw new NotFoundError('Student not found');
    }

    // Verify student is in the batch
    const membership = membershipRepo.findByStudentAndBatch(studentId, test.batchId);
    if (!membership || membership.status !== BatchMembershipStatus.ACTIVE) {
      throw new ForbiddenError('Student is not an active member of this batch');
    }

    const existing = testResultRepo.findByTestAndStudent(testId, studentId);
    if (existing) {
      const updated = testResultRepo.update(existing.id, {
        marksObtained,
        remarks,
        gradedAt: new Date(),
      });
      if (!updated) throw new NotFoundError('Test result not found');
      return updated;
    }

    return testResultRepo.create({
      testId,
      studentId,
      marksObtained,
      remarks,
      gradedAt: new Date(),
    });
  },

  getTestResults(testId: string): TestResult[] {
    return testResultRepo.findByTestId(testId);
  },

  getStudentResults(studentId: string): TestResult[] {
    return testResultRepo.findByStudentId(studentId);
  },

  getResultsForUser(userId: string): TestResult[] {
    const user = userRepo.findById(userId);
    if (!user) throw new NotFoundError('User not found');

    if (user.role === UserRole.STUDENT) {
      return testResultRepo.findByStudentId(userId);
    }

    if (user.role === UserRole.PARENT) {
      const approvedLink = Array.from(studentParentLinks.values()).find(
        (link) => link.parentId === userId && link.status === 'approved',
      );
      if (!approvedLink) {
        throw new ForbiddenError('No approved student link found for this parent');
      }
      return testResultRepo.findByStudentId(approvedLink.studentId);
    }

    throw new ForbiddenError('Access denied');
  },

  getStudentResultForTest(testId: string, studentId: string): TestResult {
    const result = testResultRepo.findByTestAndStudent(testId, studentId);
    if (!result) throw new NotFoundError('Result not found');
    return result;
  },
};
