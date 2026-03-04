import { apiGet } from '@/services/api';
import type { StudentReport, TeacherReport } from '@/types';

export function getMyStudentReport(): Promise<StudentReport> {
  return apiGet<StudentReport>('/reports/me/student');
}

export function getMyTeacherReport(): Promise<TeacherReport> {
  return apiGet<TeacherReport>('/reports/me/teacher');
}

export function getStudentReport(studentId: string): Promise<StudentReport> {
  return apiGet<StudentReport>(`/reports/student/${studentId}`);
}

export function getBatchReport(batchId: string): Promise<unknown> {
  return apiGet<unknown>(`/reports/batch/${batchId}`);
}
