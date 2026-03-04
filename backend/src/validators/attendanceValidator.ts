import { CheckInMethod, AttendanceStatus, ValidationError } from '../types';

export function validateCheckIn(body: unknown): {
  method: CheckInMethod;
  qrToken?: string;
} {
  if (typeof body !== 'object' || body === null) throw new ValidationError('Invalid request body');
  const b = body as Record<string, unknown>;

  const validMethods = Object.values(CheckInMethod) as string[];
  if (typeof b.method !== 'string' || !validMethods.includes(b.method)) {
    throw new ValidationError(`method must be one of: ${validMethods.join(', ')}`);
  }
  if (b.method === CheckInMethod.QR && typeof b.qrToken !== 'string') {
    throw new ValidationError('qrToken is required for QR check-in');
  }

  return {
    method: b.method as CheckInMethod,
    qrToken: typeof b.qrToken === 'string' ? b.qrToken : undefined,
  };
}

export function validateManualAttendance(body: unknown): {
  studentId: string;
  status?: AttendanceStatus;
} {
  if (typeof body !== 'object' || body === null) throw new ValidationError('Invalid request body');
  const b = body as Record<string, unknown>;

  if (typeof b.studentId !== 'string' || b.studentId.trim().length === 0) {
    throw new ValidationError('studentId is required');
  }

  const validStatuses = Object.values(AttendanceStatus) as string[];
  if (b.status !== undefined && (typeof b.status !== 'string' || !validStatuses.includes(b.status))) {
    throw new ValidationError(`status must be one of: ${validStatuses.join(', ')}`);
  }

  return {
    studentId: b.studentId.trim(),
    status: b.status as AttendanceStatus | undefined,
  };
}
