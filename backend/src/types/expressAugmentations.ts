import 'express';
import { UserRole, ApprovalStatus } from './index';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        role: UserRole;
        email: string;
        status: ApprovalStatus;
      };
    }
  }
}

export {};

