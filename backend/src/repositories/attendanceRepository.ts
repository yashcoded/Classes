import { v4 as uuidv4 } from 'uuid';
import { AttendanceRecord } from '../types';
import { attendanceRecords } from '../models';

export class AttendanceRepository {
  findById(id: string): AttendanceRecord | undefined {
    return attendanceRecords.get(id);
  }

  findBySessionId(sessionId: string): AttendanceRecord[] {
    return Array.from(attendanceRecords.values()).filter((a) => a.sessionId === sessionId);
  }

  findByStudentId(studentId: string): AttendanceRecord[] {
    return Array.from(attendanceRecords.values()).filter((a) => a.studentId === studentId);
  }

  findByStudentAndBatch(studentId: string, batchId: string): AttendanceRecord[] {
    return Array.from(attendanceRecords.values()).filter(
      (a) => a.studentId === studentId && a.batchId === batchId,
    );
  }

  findBySessionAndStudent(sessionId: string, studentId: string): AttendanceRecord | undefined {
    for (const record of attendanceRecords.values()) {
      if (record.sessionId === sessionId && record.studentId === studentId) return record;
    }
    return undefined;
  }

  create(data: Omit<AttendanceRecord, 'id' | 'createdAt' | 'updatedAt'>): AttendanceRecord {
    const now = new Date();
    const record: AttendanceRecord = { ...data, id: uuidv4(), createdAt: now, updatedAt: now };
    attendanceRecords.set(record.id, record);
    return record;
  }

  update(id: string, data: Partial<AttendanceRecord>): AttendanceRecord | undefined {
    const existing = attendanceRecords.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...data, id, updatedAt: new Date() };
    attendanceRecords.set(id, updated);
    return updated;
  }

  findAll(): AttendanceRecord[] {
    return Array.from(attendanceRecords.values());
  }
}
