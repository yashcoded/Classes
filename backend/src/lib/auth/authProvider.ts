import { UserRole, ApprovalStatus } from '../../types';

export interface AuthPayload {
  userId: string;
  role: UserRole;
  email: string;
  status: ApprovalStatus;
}

export interface IAuthProvider {
  generateToken(payload: AuthPayload): string;
  verifyToken(token: string): AuthPayload | null;
  hashPassword(password: string): Promise<string>;
  comparePassword(plain: string, hash: string): Promise<boolean>;
}
