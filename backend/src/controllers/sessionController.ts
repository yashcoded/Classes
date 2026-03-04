import { Request, Response, NextFunction } from 'express';
import { sessionService } from '../services/sessionService';
import { validateCreateSession } from '../validators/sessionValidator';

export const createSession = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const teacherId = req.user!.userId;
    const { batchId } = req.params;
    const { scheduledAt } = validateCreateSession(req.body);
    const session = sessionService.createSession(batchId, teacherId, scheduledAt);
    res.status(201).json(session);
  } catch (err) {
    next(err);
  }
};

export const getSession = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const session = sessionService.getSessionById(req.params.id);
    res.json(session);
  } catch (err) {
    next(err);
  }
};

export const getBatchSessions = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const sessions = sessionService.getBatchSessions(req.params.batchId);
    res.json(sessions);
  } catch (err) {
    next(err);
  }
};

export const getMySessions = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const sessions = sessionService.getTeacherSessions(req.user!.userId);
    res.json(sessions);
  } catch (err) {
    next(err);
  }
};

export const startSession = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const session = sessionService.startSession(req.params.id, req.user!.userId);
    res.json(session);
  } catch (err) {
    next(err);
  }
};

export const endSession = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const session = sessionService.endSession(req.params.id, req.user!.userId);
    res.json(session);
  } catch (err) {
    next(err);
  }
};

export const cancelSession = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const session = sessionService.cancelSession(req.params.id, req.user!.userId);
    res.json(session);
  } catch (err) {
    next(err);
  }
};

export const refreshQR = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const qrCode = sessionService.generateQRCode(req.params.id);
    res.json({ qrCode });
  } catch (err) {
    next(err);
  }
};
