import { ValidationError } from '../types';

export function validateCreateSession(body: unknown): { scheduledAt: Date } {
  if (typeof body !== 'object' || body === null) throw new ValidationError('Invalid request body');
  const b = body as Record<string, unknown>;

  if (!b.scheduledAt) throw new ValidationError('scheduledAt is required');
  const date = new Date(b.scheduledAt as string);
  if (isNaN(date.getTime())) throw new ValidationError('scheduledAt must be a valid date');

  return { scheduledAt: date };
}
