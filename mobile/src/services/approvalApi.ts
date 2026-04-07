import { apiGet, apiPost, apiPatch } from '@/services/api';
import type { User, StudentTeacherLink, StudentParentLink } from '@/types';

export function getApprovedTeachers(): Promise<User[]> {
  return apiGet<User[]>('/users/approved-teachers');
}

export function getPendingTeachers(): Promise<User[]> {
  return apiGet<User[]>('/users/pending-teachers');
}

export function approveTeacher(userId: string, approved: boolean): Promise<User> {
  return apiPatch<User>(`/users/${userId}/approve`, { approved });
}

export function requestStudentTeacherLink(teacherId: string): Promise<StudentTeacherLink> {
  return apiPost<StudentTeacherLink>('/student-teacher-links', { teacherId });
}

export function getPendingStudentTeacherLinks(): Promise<(StudentTeacherLink & { studentName: string; teacherName: string })[]> {
  return apiGet('/student-teacher-links/pending');
}

export function approveStudentTeacherLink(linkId: string, approved: boolean): Promise<StudentTeacherLink> {
  return apiPatch<StudentTeacherLink>(`/student-teacher-links/${linkId}/approve`, { approved });
}

export function getMyStudentTeacherLinks(): Promise<StudentTeacherLink[]> {
  return apiGet<StudentTeacherLink[]>('/student-teacher-links/mine');
}

export function requestParentStudentLink(
  studentId: string,
  parentId: string,
  relation: string,
): Promise<StudentParentLink> {
  return apiPost<StudentParentLink>('/users/parent-student-link/request', {
    studentId,
    parentId,
    relation,
  });
}

export function getPendingParentStudentLinks(): Promise<(StudentParentLink & { studentName: string; parentName: string })[]> {
  return apiGet('/users/parent-student-link/pending');
}

export function approveParentStudentLink(linkId: string, approved: boolean): Promise<StudentParentLink> {
  return apiPatch<StudentParentLink>(`/users/parent-student-link/${linkId}/approve`, { approved });
}

export function getMyParentStudentLinks(): Promise<StudentParentLink[]> {
  return apiGet<StudentParentLink[]>('/users/parent-student-link/mine');
}

export function searchStudents(query: string): Promise<User[]> {
  return apiGet<User[]>(`/users/students/search?q=${encodeURIComponent(query)}`);
}
