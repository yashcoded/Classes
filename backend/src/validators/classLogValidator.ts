import { ValidationError } from '../types';

export function validateCreateClassLog(body: unknown): {
  batchId: string;
  date: Date;
  topicTaught: string;
  sessionId?: string;
  subtopic?: string;
  homework?: string;
  remarks?: string;
} {
  if (typeof body !== 'object' || body === null) throw new ValidationError('Invalid request body');
  const b = body as Record<string, unknown>;

  if (typeof b.batchId !== 'string' || b.batchId.trim().length === 0) {
    throw new ValidationError('batchId is required');
  }
  if (!b.date) throw new ValidationError('date is required');
  const date = new Date(b.date as string);
  if (isNaN(date.getTime())) throw new ValidationError('date must be a valid date');
  if (typeof b.topicTaught !== 'string' || b.topicTaught.trim().length === 0) {
    throw new ValidationError('topicTaught is required');
  }

  return {
    batchId: b.batchId.trim(),
    date,
    topicTaught: (b.topicTaught as string).trim(),
    sessionId: typeof b.sessionId === 'string' ? b.sessionId.trim() : undefined,
    subtopic: typeof b.subtopic === 'string' ? b.subtopic.trim() : undefined,
    homework: typeof b.homework === 'string' ? b.homework.trim() : undefined,
    remarks: typeof b.remarks === 'string' ? b.remarks.trim() : undefined,
  };
}

export function validateUpdateClassLog(body: unknown): {
  topicTaught?: string;
  subtopic?: string;
  homework?: string;
  remarks?: string;
  date?: Date;
} {
  if (typeof body !== 'object' || body === null) throw new ValidationError('Invalid request body');
  const b = body as Record<string, unknown>;

  let date: Date | undefined;
  if (b.date !== undefined) {
    date = new Date(b.date as string);
    if (isNaN(date.getTime())) throw new ValidationError('date must be a valid date');
  }

  return {
    topicTaught: typeof b.topicTaught === 'string' ? b.topicTaught.trim() : undefined,
    subtopic: typeof b.subtopic === 'string' ? b.subtopic.trim() : undefined,
    homework: typeof b.homework === 'string' ? b.homework.trim() : undefined,
    remarks: typeof b.remarks === 'string' ? b.remarks.trim() : undefined,
    date,
  };
}
