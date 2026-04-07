import { apiGet, apiPost } from '@/services/api';
import type { AttendanceRecord, AttendanceSummaryData, AttendanceStatus } from '@/types';

export function getMyAttendance(): Promise<AttendanceRecord[]> {
  return apiGet<AttendanceRecord[]>('/attendance/me');
}

export function checkInWithQR(
  sessionId: string,
  qrCode: string,
): Promise<AttendanceRecord> {
  return apiPost<AttendanceRecord>(
    `/attendance/session/${sessionId}/check-in`,
    { qrCode },
  );
}

export function markManualAttendance(
  sessionId: string,
  studentId: string,
  status: AttendanceStatus,
): Promise<AttendanceRecord> {
  return apiPost<AttendanceRecord>(
    `/attendance/session/${sessionId}/manual`,
    { studentId, status },
  );
}

export function getSessionAttendance(
  sessionId: string,
): Promise<AttendanceRecord[]> {
  return apiGet<AttendanceRecord[]>(`/attendance/session/${sessionId}`);
}

export function getStudentAttendance(
  studentId: string,
): Promise<AttendanceRecord[]> {
  return apiGet<AttendanceRecord[]>(`/attendance/student/${studentId}`);
}

export function getAttendanceSummary(
  studentId: string,
  batchId: string,
): Promise<AttendanceSummaryData> {
  return apiGet<AttendanceSummaryData>(
    `/attendance/student/${studentId}/batch/${batchId}/summary`,
  );
}
