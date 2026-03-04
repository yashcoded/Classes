import { Request } from 'express';
import { UserRole } from './index';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        role: UserRole;
        email: string;
      };
    }
  }
}

export {};
