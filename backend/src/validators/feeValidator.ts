import { ValidationError } from '../types';

export function validateCreateFee(body: unknown): {
  studentId: string;
  amount: number;
  dueDate: Date;
  description?: string;
} {
  if (typeof body !== 'object' || body === null) throw new ValidationError('Invalid request body');
  const b = body as Record<string, unknown>;

  if (typeof b.studentId !== 'string' || b.studentId.trim().length === 0) {
    throw new ValidationError('studentId is required');
  }
  if (b.amount === undefined || b.amount === null) {
    throw new ValidationError('amount is required');
  }
  const amount = Number(b.amount);
  if (isNaN(amount) || amount <= 0) {
    throw new ValidationError('amount must be a positive number');
  }
  if (!b.dueDate) throw new ValidationError('dueDate is required');
  const dueDate = new Date(b.dueDate as string);
  if (isNaN(dueDate.getTime())) throw new ValidationError('dueDate must be a valid date');

  return {
    studentId: (b.studentId as string).trim(),
    amount,
    dueDate,
    description: typeof b.description === 'string' ? b.description.trim() : undefined,
  };
}

export function validateMarkPaid(body: unknown): { paidDate?: Date } {
  if (typeof body !== 'object' || body === null) return {};
  const b = body as Record<string, unknown>;

  let paidDate: Date | undefined;
  if (b.paidDate !== undefined) {
    paidDate = new Date(b.paidDate as string);
    if (isNaN(paidDate.getTime())) throw new ValidationError('paidDate must be a valid date');
  }

  return { paidDate };
}
