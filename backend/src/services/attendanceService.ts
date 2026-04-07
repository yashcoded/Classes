import { AttendanceRepository } from '../repositories/attendanceRepository';
import { SessionRepository } from '../repositories/sessionRepository';
import { BatchMembershipRepository } from '../repositories/membershipRepository';
import { sessionService } from './sessionService';
import {
  AttendanceRecord,
  AttendanceStatus,
  CheckInMethod,
  SessionStatus,
  BatchMembershipStatus,
  NotFoundError,
  ForbiddenError,
  ConflictError,
  ValidationError,
  UserRole,
} from '../types';
import { UserRepository } from '../repositories/userRepository';

const attendanceRepo = new AttendanceRepository();
const sessionRepo = new SessionRepository();
const membershipRepo = new BatchMembershipRepository();
const userRepo = new UserRepository();

export const attendanceService = {
  checkIn(
    sessionId: string,
    studentId: string,
    method: CheckInMethod,
    qrToken?: string,
  ): AttendanceRecord {
    const session = sessionRepo.findById(sessionId);
    if (!session) throw new NotFoundError('Session not found');
    if (session.status !== SessionStatus.ACTIVE) {
      throw new ConflictError('Session is not active');
    }

    if (method === CheckInMethod.QR) {
      if (!qrToken) throw new ValidationError('QR token required for QR check-in');
      const valid = sessionService.validateQRCode(sessionId, qrToken);
      if (!valid) throw new ValidationError('Invalid or expired QR code');
    }

    // Verify student is a member of the batch
    const membership = membershipRepo.findByStudentAndBatch(studentId, session.batchId);
    if (!membership || membership.status !== BatchMembershipStatus.ACTIVE) {
      throw new ForbiddenError('Student is not an active member of this batch');
    }

    // Block duplicates
    const existing = attendanceRepo.findBySessionAndStudent(sessionId, studentId);
    if (existing) throw new ConflictError('Attendance already recorded for this session');

    return attendanceRepo.create({
      sessionId,
      studentId,
      batchId: session.batchId,
      status: AttendanceStatus.PRESENT,
      checkInMethod: method,
      checkedInAt: new Date(),
    });
  },

  markManualAttendance(
    sessionId: string,
    studentId: string,
    requesterId: string,
    status: AttendanceStatus = AttendanceStatus.PRESENT,
  ): AttendanceRecord {
    const session = sessionRepo.findById(sessionId);
    if (!session) throw new NotFoundError('Session not found');

    const requester = userRepo.findById(requesterId);
    if (!requester) throw new NotFoundError('Requester not found');
    if (requester.role !== UserRole.TEACHER && requester.role !== UserRole.ADMIN) {
      throw new ForbiddenError('Only teachers or admins can mark attendance manually');
    }
    if (requester.role === UserRole.TEACHER && session.teacherId !== requesterId) {
      throw new ForbiddenError('Not your session');
    }

    // Verify student is a member of the batch
    const membership = membershipRepo.findByStudentAndBatch(studentId, session.batchId);
    if (!membership || membership.status !== BatchMembershipStatus.ACTIVE) {
      throw new ForbiddenError('Student is not an active member of this batch');
    }

    // Check duplicate
    const existing = attendanceRepo.findBySessionAndStudent(sessionId, studentId);
    if (existing) {
      // Update existing record
      const updated = attendanceRepo.update(existing.id, {
        status,
        checkInMethod: CheckInMethod.MANUAL,
        checkedInAt: new Date(),
      });
      if (!updated) throw new NotFoundError('Attendance record not found');
      return updated;
    }

    return attendanceRepo.create({
      sessionId,
      studentId,
      batchId: session.batchId,
      status,
      checkInMethod: CheckInMethod.MANUAL,
      checkedInAt: new Date(),
    });
  },

  markAbsent(sessionId: string, studentId: string, requesterId: string): AttendanceRecord {
    return this.markManualAttendance(sessionId, studentId, requesterId, AttendanceStatus.ABSENT);
  },

  markLate(sessionId: string, studentId: string, requesterId: string): AttendanceRecord {
    return this.markManualAttendance(sessionId, studentId, requesterId, AttendanceStatus.LATE);
  },

  getSessionAttendance(sessionId: string): AttendanceRecord[] {
    return attendanceRepo.findBySessionId(sessionId);
  },

  getStudentAttendance(studentId: string, batchId?: string): AttendanceRecord[] {
    if (batchId) {
      return attendanceRepo.findByStudentAndBatch(studentId, batchId);
    }
    return attendanceRepo.findByStudentId(studentId);
  },

  getAttendanceSummary(
    studentId: string,
    batchId: string,
  ): { total: number; present: number; absent: number; late: number; percentage: number } {
    const records = attendanceRepo.findByStudentAndBatch(studentId, batchId);
    const total = records.length;
    const present = records.filter((r) => r.status === AttendanceStatus.PRESENT).length;
    const absent = records.filter((r) => r.status === AttendanceStatus.ABSENT).length;
    const late = records.filter((r) => r.status === AttendanceStatus.LATE).length;
    const percentage = total > 0 ? Math.round(((present + late) / total) * 100) : 0;
    return { total, present, absent, late, percentage };
  },

  validateQRCode(sessionId: string, qrToken: string): boolean {
    return sessionService.validateQRCode(sessionId, qrToken);
  },
};
