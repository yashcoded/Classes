import { Request, Response, NextFunction } from 'express';
import { UserRole, ApprovalStatus, ForbiddenError, UnauthorizedError } from '../types';

export function authorize(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new UnauthorizedError());
      return;
    }
    if (!roles.includes(req.user.role)) {
      next(new ForbiddenError('Insufficient permissions'));
      return;
    }
    next();
  };
}

export function requireApproved(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    next(new UnauthorizedError());
    return;
  }
  if (req.user.status !== ApprovalStatus.APPROVED) {
    next(new ForbiddenError('Account pending approval'));
    return;
  }
  next();
}
