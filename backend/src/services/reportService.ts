import { UserRepository } from '../repositories/userRepository';
import { BatchRepository } from '../repositories/batchRepository';
import { BatchMembershipRepository } from '../repositories/membershipRepository';
import { AttendanceRepository } from '../repositories/attendanceRepository';
import { TestRepository, TestResultRepository } from '../repositories/testRepository';
import { FeeRepository } from '../repositories/feeRepository';
import { SessionRepository } from '../repositories/sessionRepository';
import {
  NotFoundError,
  ForbiddenError,
  UserRole,
  AttendanceStatus,
  FeeStatus,
  BatchMembershipStatus,
} from '../types';

const userRepo = new UserRepository();
const batchRepo = new BatchRepository();
const membershipRepo = new BatchMembershipRepository();
const attendanceRepo = new AttendanceRepository();
const testRepo = new TestRepository();
const testResultRepo = new TestResultRepository();
const feeRepo = new FeeRepository();
const sessionRepo = new SessionRepository();

export const reportService = {
  getStudentReport(studentId: string, requesterId: string) {
    const requester = userRepo.findById(requesterId);
    if (!requester) throw new NotFoundError('Requester not found');

    // Students can only view their own report; teachers, admins, and parents can view others
    if (
      requester.role === UserRole.STUDENT &&
      requesterId !== studentId
    ) {
      throw new ForbiddenError('Access denied');
    }

    const student = userRepo.findById(studentId);
    if (!student || student.role !== UserRole.STUDENT) {
      throw new NotFoundError('Student not found');
    }

    const memberships = membershipRepo
      .findByStudentId(studentId)
      .filter((m) => m.status === BatchMembershipStatus.ACTIVE);

    const batchReports = memberships.map((membership) => {
      const batch = batchRepo.findById(membership.batchId);
      const sessions = sessionRepo.findByBatchId(membership.batchId);
      const attendanceRecords = attendanceRepo.findByStudentAndBatch(studentId, membership.batchId);
      const present = attendanceRecords.filter((a) => a.status === AttendanceStatus.PRESENT).length;
      const absent = attendanceRecords.filter((a) => a.status === AttendanceStatus.ABSENT).length;
      const late = attendanceRecords.filter((a) => a.status === AttendanceStatus.LATE).length;
      const totalSessions = sessions.length;
      const attendancePercentage =
        totalSessions > 0 ? Math.round(((present + late) / totalSessions) * 100) : 0;

      const batchTests = testRepo.findByBatchId(membership.batchId);
      const testResults = testResultRepo.findByStudentId(studentId).filter((r) => {
        return batchTests.some((t) => t.id === r.testId);
      });
      const testSummary = testResults.map((r) => {
        const test = batchTests.find((t) => t.id === r.testId);
        return {
          testId: r.testId,
          title: test?.title ?? 'Unknown',
          marksObtained: r.marksObtained,
          maxMarks: test?.maxMarks ?? 0,
          percentage:
            test && test.maxMarks > 0
              ? Math.round((r.marksObtained / test.maxMarks) * 100)
              : 0,
        };
      });

      return {
        batch: batch ?? { id: membership.batchId, name: 'Unknown' },
        attendance: { total: totalSessions, present, absent, late, attendancePercentage },
        tests: testSummary,
      };
    });

    const fees = feeRepo.findByStudentId(studentId);
    const feeSummary = {
      total: fees.length,
      paid: fees.filter((f) => f.status === FeeStatus.PAID).length,
      pending: fees.filter((f) => f.status === FeeStatus.PENDING).length,
      overdue: fees.filter((f) => f.status === FeeStatus.OVERDUE).length,
      totalAmount: fees.reduce((sum, f) => sum + f.amount, 0),
      paidAmount: fees
        .filter((f) => f.status === FeeStatus.PAID)
        .reduce((sum, f) => sum + f.amount, 0),
    };

    return {
      student: { id: student.id, name: student.name, email: student.email, role: student.role },
      batches: batchReports,
      fees: feeSummary,
    };
  },

  getBatchReport(batchId: string, requesterId: string) {
    const requester = userRepo.findById(requesterId);
    if (!requester) throw new NotFoundError('Requester not found');
    if (requester.role !== UserRole.TEACHER && requester.role !== UserRole.ADMIN) {
      throw new ForbiddenError('Only teachers or admins can view batch reports');
    }

    const batch = batchRepo.findById(batchId);
    if (!batch) throw new NotFoundError('Batch not found');
    if (requester.role === UserRole.TEACHER && batch.teacherId !== requesterId) {
      throw new ForbiddenError('Not your batch');
    }

    const memberships = membershipRepo.findActive(batchId);
    const sessions = sessionRepo.findByBatchId(batchId);

    const studentReports = memberships.map((membership) => {
      const student = userRepo.findById(membership.studentId);
      const records = attendanceRepo.findByStudentAndBatch(membership.studentId, batchId);
      const present = records.filter((r) => r.status === AttendanceStatus.PRESENT).length;
      const absent = records.filter((r) => r.status === AttendanceStatus.ABSENT).length;
      const late = records.filter((r) => r.status === AttendanceStatus.LATE).length;
      const percentage =
        sessions.length > 0 ? Math.round(((present + late) / sessions.length) * 100) : 0;

      return {
        studentId: membership.studentId,
        studentName: student?.name ?? 'Unknown',
        attendance: { present, absent, late, percentage },
      };
    });

    return {
      batch,
      totalSessions: sessions.length,
      totalStudents: memberships.length,
      students: studentReports,
    };
  },

  getTeacherReport(teacherId: string, requesterId: string) {
    const requester = userRepo.findById(requesterId);
    if (!requester) throw new NotFoundError('Requester not found');
    if (
      requester.role !== UserRole.ADMIN &&
      (requester.role !== UserRole.TEACHER || requesterId !== teacherId)
    ) {
      throw new ForbiddenError('Access denied');
    }

    const teacher = userRepo.findById(teacherId);
    if (!teacher || teacher.role !== UserRole.TEACHER) {
      throw new NotFoundError('Teacher not found');
    }

    const batches = batchRepo.findByTeacherId(teacherId);
    const sessions = sessionRepo.findByTeacherId(teacherId);

    return {
      teacher: { id: teacher.id, name: teacher.name, email: teacher.email },
      totalBatches: batches.length,
      activeBatches: batches.filter((b) => b.isActive).length,
      totalSessions: sessions.length,
      batches: batches.map((b) => ({
        id: b.id,
        name: b.name,
        subject: b.subject,
        activeStudents: membershipRepo.findActive(b.id).length,
      })),
    };
  },
};
