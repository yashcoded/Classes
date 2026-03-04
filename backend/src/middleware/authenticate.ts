import { Request, Response, NextFunction } from 'express';
import { authProvider } from '../lib/auth';
import { UnauthorizedError } from '../types';

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    next(new UnauthorizedError('No token provided'));
    return;
  }

  const token = authHeader.slice(7);
  const payload = authProvider.verifyToken(token);
  if (!payload) {
    next(new UnauthorizedError('Invalid or expired token'));
    return;
  }

  req.user = payload;
  next();
}
