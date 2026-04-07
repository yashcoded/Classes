import {
  User,
  TeacherProfile,
  StudentProfile,
  ParentProfile,
  StudentTeacherLink,
  StudentParentLink,
  Batch,
  BatchMembership,
  ClassSession,
  AttendanceRecord,
  ClassLog,
  Test,
  TestResult,
  FeeRecord,
  Notification,
  StudentBatchTransfer,
} from '../types';

export const users = new Map<string, User & { passwordHash: string }>();
export const teacherProfiles = new Map<string, TeacherProfile>();
export const studentProfiles = new Map<string, StudentProfile>();
export const parentProfiles = new Map<string, ParentProfile>();
export const studentTeacherLinks = new Map<string, StudentTeacherLink>();
export const studentParentLinks = new Map<string, StudentParentLink>();
export const batches = new Map<string, Batch>();
export const batchMemberships = new Map<string, BatchMembership>();
export const classSessions = new Map<string, ClassSession>();
export const attendanceRecords = new Map<string, AttendanceRecord>();
export const classLogs = new Map<string, ClassLog>();
export const tests = new Map<string, Test>();
export const testResults = new Map<string, TestResult>();
export const feeRecords = new Map<string, FeeRecord>();
export const notifications = new Map<string, Notification>();
export const studentBatchTransfers = new Map<string, StudentBatchTransfer>();
