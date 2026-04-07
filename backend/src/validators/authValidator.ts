import { UserRole, ValidationError } from '../types';

export function validateRegister(body: unknown): {
  email: string;
  password: string;
  role: UserRole;
  name: string;
  phone?: string;
} {
  if (typeof body !== 'object' || body === null) throw new ValidationError('Invalid request body');
  const b = body as Record<string, unknown>;

  if (typeof b.email !== 'string' || !b.email.includes('@')) {
    throw new ValidationError('Valid email is required');
  }
  if (typeof b.password !== 'string' || b.password.length < 6) {
    throw new ValidationError('Password must be at least 6 characters');
  }
  if (typeof b.name !== 'string' || b.name.trim().length === 0) {
    throw new ValidationError('Name is required');
  }
  const validRoles = Object.values(UserRole) as string[];
  if (typeof b.role !== 'string' || !validRoles.includes(b.role)) {
    throw new ValidationError(`Role must be one of: ${validRoles.join(', ')}`);
  }
  if (b.phone !== undefined && typeof b.phone !== 'string') {
    throw new ValidationError('Phone must be a string');
  }

  return {
    email: b.email.trim().toLowerCase(),
    password: b.password,
    role: b.role as UserRole,
    name: b.name.trim(),
    phone: typeof b.phone === 'string' ? b.phone.trim() : undefined,
  };
}

export function validateLogin(body: unknown): { email: string; password: string } {
  if (typeof body !== 'object' || body === null) throw new ValidationError('Invalid request body');
  const b = body as Record<string, unknown>;

  if (typeof b.email !== 'string' || !b.email.includes('@')) {
    throw new ValidationError('Valid email is required');
  }
  if (typeof b.password !== 'string' || b.password.length === 0) {
    throw new ValidationError('Password is required');
  }

  return { email: b.email.trim().toLowerCase(), password: b.password };
}

export function validateGoogleAuth(body: unknown): {
  idToken?: string;
  accessToken?: string;
  role?: UserRole;
  teacherId?: string;
} {
  if (typeof body !== 'object' || body === null) throw new ValidationError('Invalid request body');
  const b = body as Record<string, unknown>;

  const idToken = typeof b.idToken === 'string' && b.idToken.length > 0 ? b.idToken : undefined;
  const accessToken =
    typeof b.accessToken === 'string' && b.accessToken.length > 0 ? b.accessToken : undefined;

  if (!idToken && !accessToken) {
    throw new ValidationError('idToken or accessToken is required');
  }

  let role: UserRole | undefined;
  if (b.role !== undefined) {
    const validRoles = Object.values(UserRole) as string[];
    if (typeof b.role !== 'string' || !validRoles.includes(b.role)) {
      throw new ValidationError(`Role must be one of: ${validRoles.join(', ')}`);
    }
    role = b.role as UserRole;
  }

  const teacherId =
    typeof b.teacherId === 'string' && b.teacherId.length > 0 ? b.teacherId : undefined;

  return { idToken, accessToken, role, teacherId };
}
