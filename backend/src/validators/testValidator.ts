import { ValidationError } from '../types';

export function validateCreateTest(body: unknown): {
  batchId: string;
  title: string;
  date: Date;
  maxMarks: number;
  description?: string;
} {
  if (typeof body !== 'object' || body === null) throw new ValidationError('Invalid request body');
  const b = body as Record<string, unknown>;

  if (typeof b.batchId !== 'string' || b.batchId.trim().length === 0) {
    throw new ValidationError('batchId is required');
  }
  if (typeof b.title !== 'string' || b.title.trim().length === 0) {
    throw new ValidationError('title is required');
  }
  if (!b.date) throw new ValidationError('date is required');
  const date = new Date(b.date as string);
  if (isNaN(date.getTime())) throw new ValidationError('date must be a valid date');
  if (b.maxMarks === undefined || b.maxMarks === null) {
    throw new ValidationError('maxMarks is required');
  }
  const maxMarks = Number(b.maxMarks);
  if (isNaN(maxMarks) || maxMarks <= 0) {
    throw new ValidationError('maxMarks must be a positive number');
  }

  return {
    batchId: b.batchId.trim(),
    title: (b.title as string).trim(),
    date,
    maxMarks,
    description: typeof b.description === 'string' ? b.description.trim() : undefined,
  };
}

export function validateSubmitResult(body: unknown): {
  studentId: string;
  marksObtained: number;
  remarks?: string;
} {
  if (typeof body !== 'object' || body === null) throw new ValidationError('Invalid request body');
  const b = body as Record<string, unknown>;

  if (typeof b.studentId !== 'string' || b.studentId.trim().length === 0) {
    throw new ValidationError('studentId is required');
  }
  if (b.marksObtained === undefined || b.marksObtained === null) {
    throw new ValidationError('marksObtained is required');
  }
  const marks = Number(b.marksObtained);
  if (isNaN(marks) || marks < 0) {
    throw new ValidationError('marksObtained must be a non-negative number');
  }

  return {
    studentId: (b.studentId as string).trim(),
    marksObtained: marks,
    remarks: typeof b.remarks === 'string' ? b.remarks.trim() : undefined,
  };
}
