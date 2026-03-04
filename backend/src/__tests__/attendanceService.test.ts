import { attendanceService } from '../services/attendanceService';
import { sessionService } from '../services/sessionService';
import { batchService } from '../services/batchService';
import { authService } from '../services/authService';
import { CheckInMethod, UserRole, SessionStatus } from '../types';
import * as models from '../models';

function clearModels() {
  models.users.clear();
  models.teacherProfiles.clear();
  models.studentProfiles.clear();
  models.parentProfiles.clear();
  models.batches.clear();
  models.batchMemberships.clear();
  models.classSessions.clear();
  models.attendanceRecords.clear();
}

describe('attendanceService', () => {
  let teacherId: string;
  let studentId: string;
  let batchId: string;
  let sessionId: string;
  let qrToken: string;

  beforeEach(async () => {
    clearModels();

    const teacher = await authService.register(
      'teacher@att.com',
      'pass123',
      UserRole.TEACHER,
      'Teacher',
    );
    teacherId = teacher.user.id;

    const student = await authService.register(
      'student@att.com',
      'pass123',
      UserRole.STUDENT,
      'Student',
    );
    studentId = student.user.id;

    const batch = batchService.createBatch(teacherId, { name: 'Test Batch' });
    batchId = batch.id;

    batchService.addStudentToBatch(batchId, studentId, teacherId);

    const session = sessionService.createSession(batchId, teacherId, new Date());
    sessionId = session.id;

    const started = sessionService.startSession(sessionId, teacherId);
    qrToken = started.qrCode!;
  });

  describe('QR check-in', () => {
    it('should allow a valid QR check-in', () => {
      const record = attendanceService.checkIn(sessionId, studentId, CheckInMethod.QR, qrToken);
      expect(record.studentId).toBe(studentId);
      expect(record.checkInMethod).toBe(CheckInMethod.QR);
    });

    it('should block duplicate QR check-in', () => {
      attendanceService.checkIn(sessionId, studentId, CheckInMethod.QR, qrToken);
      expect(() =>
        attendanceService.checkIn(sessionId, studentId, CheckInMethod.QR, qrToken),
      ).toThrow(expect.objectContaining({ statusCode: 409 }));
    });

    it('should reject invalid QR token', () => {
      expect(() =>
        attendanceService.checkIn(sessionId, studentId, CheckInMethod.QR, 'bad-token'),
      ).toThrow(expect.objectContaining({ statusCode: 400 }));
    });

    it('should reject QR token for wrong session', () => {
      const session2 = sessionService.createSession(batchId, teacherId, new Date());
      sessionService.startSession(session2.id, teacherId);
      // qrToken is for sessionId, not session2.id
      expect(() =>
        attendanceService.checkIn(session2.id, studentId, CheckInMethod.QR, qrToken),
      ).toThrow(expect.objectContaining({ statusCode: 400 }));
    });
  });

  describe('validateQRCode', () => {
    it('should return true for a valid QR code', () => {
      expect(attendanceService.validateQRCode(sessionId, qrToken)).toBe(true);
    });

    it('should return false for an invalid token', () => {
      expect(attendanceService.validateQRCode(sessionId, 'garbage')).toBe(false);
    });

    it('should return false when QR is used for wrong session', () => {
      expect(
        attendanceService.validateQRCode('different-session-id', qrToken),
      ).toBe(false);
    });
  });

  describe('manual attendance', () => {
    it('should allow teacher to mark attendance manually', () => {
      const record = attendanceService.markManualAttendance(sessionId, studentId, teacherId);
      expect(record.checkInMethod).toBe(CheckInMethod.MANUAL);
    });

    it('should block non-teacher from marking manual attendance', async () => {
      expect(() =>
        attendanceService.markManualAttendance(sessionId, studentId, studentId),
      ).toThrow(expect.objectContaining({ statusCode: 403 }));
    });

    it('should update existing record when marking manual again', () => {
      attendanceService.checkIn(sessionId, studentId, CheckInMethod.QR, qrToken);
      const updated = attendanceService.markManualAttendance(sessionId, studentId, teacherId);
      expect(updated.checkInMethod).toBe(CheckInMethod.MANUAL);
    });
  });

  describe('duplicate prevention', () => {
    it('should prevent duplicate check-in via QR', () => {
      attendanceService.checkIn(sessionId, studentId, CheckInMethod.QR, qrToken);
      expect(() =>
        attendanceService.checkIn(sessionId, studentId, CheckInMethod.QR, qrToken),
      ).toThrow();
    });
  });

  describe('getAttendanceSummary', () => {
    it('should calculate attendance percentage', () => {
      attendanceService.checkIn(sessionId, studentId, CheckInMethod.QR, qrToken);
      const summary = attendanceService.getAttendanceSummary(studentId, batchId);
      expect(summary.total).toBe(1);
      expect(summary.present).toBe(1);
      expect(summary.percentage).toBe(100);
    });
  });
});
