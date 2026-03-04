// ─── Enums ────────────────────────────────────────────────────────────────────

export enum UserRole {
  TEACHER = 'teacher',
  STUDENT = 'student',
  PARENT = 'parent',
  ADMIN = 'admin',
}

export enum AttendanceStatus {
  PRESENT = 'present',
  ABSENT = 'absent',
  LATE = 'late',
}

export enum CheckInMethod {
  QR = 'qr',
  MANUAL = 'manual',
}

export enum FeeStatus {
  PENDING = 'pending',
  PAID = 'paid',
  OVERDUE = 'overdue',
}

export enum NotificationTargetType {
  STUDENT = 'student',
  PARENT = 'parent',
  BATCH = 'batch',
  TEACHER = 'teacher',
  ADMIN = 'admin',
}

export enum BatchMembershipStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  TRANSFERRED = 'transferred',
}

export enum BatchTransferStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum SessionStatus {
  SCHEDULED = 'scheduled',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface User {
  id: string;
  authId: string;
  email: string;
  role: UserRole;
  name: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TeacherProfile {
  id: string;
  userId: string;
  bio?: string;
  subjects?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface StudentProfile {
  id: string;
  userId: string;
  grade?: string;
  dateOfBirth?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ParentProfile {
  id: string;
  userId: string;
  occupation?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StudentParentLink {
  id: string;
  studentId: string;
  parentId: string;
  relation: string;
  createdAt: Date;
}

export interface Batch {
  id: string;
  name: string;
  teacherId: string;
  subject?: string;
  schedule?: string;
  maxStudents?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface BatchMembership {
  id: string;
  batchId: string;
  studentId: string;
  status: BatchMembershipStatus;
  joinedAt: Date;
  leftAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClassSession {
  id: string;
  batchId: string;
  teacherId: string;
  scheduledAt: Date;
  startedAt?: Date;
  endedAt?: Date;
  status: SessionStatus;
  qrCode?: string;
  qrExpiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AttendanceRecord {
  id: string;
  sessionId: string;
  studentId: string;
  batchId: string;
  status: AttendanceStatus;
  checkInMethod: CheckInMethod;
  checkedInAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClassLog {
  id: string;
  sessionId?: string;
  batchId: string;
  date: Date;
  topicTaught: string;
  subtopic?: string;
  homework?: string;
  remarks?: string;
  teacherId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Test {
  id: string;
  batchId: string;
  teacherId: string;
  title: string;
  date: Date;
  maxMarks: number;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TestResult {
  id: string;
  testId: string;
  studentId: string;
  marksObtained: number;
  remarks?: string;
  gradedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface FeeRecord {
  id: string;
  studentId: string;
  amount: number;
  dueDate: Date;
  status: FeeStatus;
  paidDate?: Date;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  targetType: NotificationTargetType;
  targetId: string;
  senderId: string;
  readBy: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface StudentBatchTransfer {
  id: string;
  studentId: string;
  fromBatchId: string;
  toBatchId: string;
  transferredBy: string;
  status: BatchTransferStatus;
  reason?: string;
  transferredAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Custom Errors ────────────────────────────────────────────────────────────

export class AppError extends Error {
  constructor(
    public readonly message: string,
    public readonly statusCode: number = 400,
  ) {
    super(message);
    this.name = 'AppError';
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
    this.name = 'UnauthorizedError';
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403);
    this.name = 'ForbiddenError';
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Not found') {
    super(message, 404);
    this.name = 'NotFoundError';
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409);
    this.name = 'ConflictError';
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}
