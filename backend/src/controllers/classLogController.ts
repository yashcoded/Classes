import { Request, Response, NextFunction } from 'express';
import { classLogService } from '../services/classLogService';
import { validateCreateClassLog, validateUpdateClassLog } from '../validators/classLogValidator';

export const createLog = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const data = validateCreateClassLog(req.body);
    const log = classLogService.createLog(req.user!.userId, data);
    res.status(201).json(log);
  } catch (err) {
    next(err);
  }
};

export const getLog = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const log = classLogService.getLogById(req.params.id);
    res.json(log);
  } catch (err) {
    next(err);
  }
};

export const getBatchLogs = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const logs = classLogService.getBatchLogs(req.params.batchId);
    res.json(logs);
  } catch (err) {
    next(err);
  }
};

export const updateLog = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const data = validateUpdateClassLog(req.body);
    const log = classLogService.updateLog(req.params.id, req.user!.userId, data);
    res.json(log);
  } catch (err) {
    next(err);
  }
};

export const deleteLog = (req: Request, res: Response, next: NextFunction): void => {
  try {
    classLogService.deleteLog(req.params.id, req.user!.userId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
