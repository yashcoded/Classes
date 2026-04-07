// ─── Enums ────────────────────────────────────────────────────────────────────

export type UserRole = 'teacher' | 'student' | 'parent' | 'admin';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export type BatchMembershipStatus = 'active' | 'inactive' | 'transferred';

export type BatchTransferStatus = 'pending' | 'completed' | 'cancelled';

export type SessionStatus = 'scheduled' | 'active' | 'completed' | 'cancelled';

export type AttendanceStatus = 'present' | 'absent' | 'late';

export type CheckInMethod = 'qr' | 'manual';

export type FeeStatus = 'pending' | 'paid' | 'overdue';

export type NotificationTargetType =
  | 'student'
  | 'parent'
  | 'batch'
  | 'teacher'
  | 'admin';

// ─── Core Models ──────────────────────────────────────────────────────────────

export interface User {
  id: string;
  authId: string;
  email: string;
  role: UserRole;
  name: string;
  phone?: string;
  status: ApprovalStatus;
  googleSub?: string;
  authProvider?: 'password' | 'google';
  createdAt: string;
  updatedAt: string;
}

export interface StudentTeacherLink {
  id: string;
  studentId: string;
  teacherId: string;
  status: ApprovalStatus;
  createdAt: string;
  approvedAt?: string;
}

export interface StudentParentLink {
  id: string;
  studentId: string;
  parentId: string;
  relation: string;
  status: ApprovalStatus;
  requestedBy: string;
  approvedBy?: string;
  createdAt: string;
  approvedAt?: string;
}

export interface TeacherProfile extends User {
  role: 'teacher';
}

export interface StudentProfile extends User {
  role: 'student';
}

export interface ParentProfile extends User {
  role: 'parent';
  linkedStudentIds?: string[];
}

export interface Batch {
  id: string;
  name: string;
  teacherId: string;
  subject?: string;
  schedule?: string;
  maxStudents?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BatchMembership {
  id: string;
  batchId: string;
  studentId: string;
  status: BatchMembershipStatus;
  joinedAt: string;
  leftAt?: string;
  createdAt: string;
  updatedAt: string;
  student?: User;
  batch?: Batch;
}

export interface ClassSession {
  id: string;
  batchId: string;
  teacherId: string;
  scheduledAt: string;
  startedAt?: string;
  endedAt?: string;
  status: SessionStatus;
  qrCode?: string;
  qrExpiresAt?: string;
  createdAt: string;
  updatedAt: string;
  batch?: Batch;
}

export interface AttendanceRecord {
  id: string;
  sessionId: string;
  studentId: string;
  batchId: string;
  status: AttendanceStatus;
  checkInMethod: CheckInMethod;
  checkedInAt: string;
  createdAt: string;
  updatedAt: string;
  student?: User;
  session?: ClassSession;
}

export interface ClassLog {
  id: string;
  sessionId?: string;
  batchId: string;
  date: string;
  topicTaught: string;
  subtopic?: string;
  homework?: string;
  remarks?: string;
  teacherId: string;
  createdAt: string;
  updatedAt: string;
  batch?: Batch;
}

export interface Test {
  id: string;
  batchId: string;
  teacherId: string;
  title: string;
  date: string;
  maxMarks: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
  batch?: Batch;
}

export interface TestResult {
  id: string;
  testId: string;
  studentId: string;
  marksObtained: number;
  remarks?: string;
  gradedAt: string;
  createdAt: string;
  updatedAt: string;
  test?: Test;
  student?: User;
}

export interface FeeRecord {
  id: string;
  studentId: string;
  amount: number;
  dueDate: string;
  status: FeeStatus;
  paidDate?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  student?: User;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  targetType: NotificationTargetType;
  targetId: string;
  senderId: string;
  readBy: string[];
  createdAt: string;
  updatedAt: string;
  sender?: User;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface AuthUser {
  user: User;
  token: string;
}

// ─── Reports ──────────────────────────────────────────────────────────────────

export interface AttendanceSummaryData {
  total: number;
  present: number;
  absent: number;
  late: number;
  percentage: number;
}

export interface StudentReport {
  student: User;
  batches: Batch[];
  attendanceSummary: AttendanceSummaryData;
  testResults: TestResult[];
  fees: FeeRecord[];
  recentClassLogs: ClassLog[];
}

export interface TeacherReport {
  teacher: User;
  batches: Batch[];
  totalStudents: number;
  sessionsThisMonth: number;
  recentSessions: ClassSession[];
  recentClassLogs: ClassLog[];
}

// ─── API Request / Response helpers ───────────────────────────────────────────

export interface CreateBatchPayload {
  name: string;
  subject?: string;
  schedule?: string;
  maxStudents?: number;
}

export interface CreateSessionPayload {
  scheduledAt: string;
}

export interface CreateClassLogPayload {
  batchId: string;
  sessionId?: string;
  date: string;
  topicTaught: string;
  subtopic?: string;
  homework?: string;
  remarks?: string;
}

export interface CreateTestPayload {
  batchId: string;
  title: string;
  date: string;
  maxMarks: number;
  description?: string;
}

export interface CreateFeePayload {
  studentId: string;
  amount: number;
  dueDate: string;
  description?: string;
}

export interface SendNotificationPayload {
  title: string;
  message: string;
  targetType: NotificationTargetType;
  targetId: string;
}
