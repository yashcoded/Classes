import { ValidationError } from '../types';

export function validateCreateBatch(body: unknown): {
  name: string;
  subject?: string;
  schedule?: string;
  maxStudents?: number;
} {
  if (typeof body !== 'object' || body === null) throw new ValidationError('Invalid request body');
  const b = body as Record<string, unknown>;

  if (typeof b.name !== 'string' || b.name.trim().length === 0) {
    throw new ValidationError('Batch name is required');
  }
  if (b.subject !== undefined && typeof b.subject !== 'string') {
    throw new ValidationError('Subject must be a string');
  }
  if (b.schedule !== undefined && typeof b.schedule !== 'string') {
    throw new ValidationError('Schedule must be a string');
  }
  if (b.maxStudents !== undefined) {
    const n = Number(b.maxStudents);
    if (!Number.isInteger(n) || n < 1) {
      throw new ValidationError('maxStudents must be a positive integer');
    }
  }

  return {
    name: (b.name as string).trim(),
    subject: typeof b.subject === 'string' ? b.subject.trim() : undefined,
    schedule: typeof b.schedule === 'string' ? b.schedule.trim() : undefined,
    maxStudents: b.maxStudents !== undefined ? Number(b.maxStudents) : undefined,
  };
}

export function validateUpdateBatch(body: unknown): {
  name?: string;
  subject?: string;
  schedule?: string;
  maxStudents?: number;
  isActive?: boolean;
} {
  if (typeof body !== 'object' || body === null) throw new ValidationError('Invalid request body');
  const b = body as Record<string, unknown>;

  if (b.name !== undefined && (typeof b.name !== 'string' || b.name.trim().length === 0)) {
    throw new ValidationError('Batch name must be a non-empty string');
  }
  if (b.subject !== undefined && typeof b.subject !== 'string') {
    throw new ValidationError('Subject must be a string');
  }
  if (b.schedule !== undefined && typeof b.schedule !== 'string') {
    throw new ValidationError('Schedule must be a string');
  }
  if (b.maxStudents !== undefined) {
    const n = Number(b.maxStudents);
    if (!Number.isInteger(n) || n < 1) {
      throw new ValidationError('maxStudents must be a positive integer');
    }
  }
  if (b.isActive !== undefined && typeof b.isActive !== 'boolean') {
    throw new ValidationError('isActive must be a boolean');
  }

  return {
    name: typeof b.name === 'string' ? b.name.trim() : undefined,
    subject: typeof b.subject === 'string' ? b.subject.trim() : undefined,
    schedule: typeof b.schedule === 'string' ? b.schedule.trim() : undefined,
    maxStudents: b.maxStudents !== undefined ? Number(b.maxStudents) : undefined,
    isActive: b.isActive !== undefined ? Boolean(b.isActive) : undefined,
  };
}
