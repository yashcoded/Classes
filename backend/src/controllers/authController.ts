import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/authService';
import { validateRegister, validateLogin, validateGoogleAuth } from '../validators/authValidator';

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = validateRegister(req.body);
    const result = await authService.register(
      data.email,
      data.password,
      data.role,
      data.name,
      data.phone,
    );
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = validateLogin(req.body);
    const result = await authService.login(data.email, data.password);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const me = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const user = authService.getCurrentUser(req.user!.userId);
    res.json(user);
  } catch (err) {
    next(err);
  }
};

export const googleAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = validateGoogleAuth(req.body);
    const result = await authService.loginWithGoogle({
      idToken: data.idToken,
      accessToken: data.accessToken,
      role: data.role,
      teacherId: data.teacherId,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
};
