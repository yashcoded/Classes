import { UserRole } from '../../types';

export interface AuthPayload {
  userId: string;
  role: UserRole;
  email: string;
}

export interface IAuthProvider {
  generateToken(payload: AuthPayload): string;
  verifyToken(token: string): AuthPayload | null;
  hashPassword(password: string): Promise<string>;
  comparePassword(plain: string, hash: string): Promise<boolean>;
}
