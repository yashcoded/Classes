import { Request, Response, NextFunction } from 'express';
import { reportService } from '../services/reportService';

export const getStudentReport = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const report = reportService.getStudentReport(req.params.studentId, req.user!.userId);
    res.json(report);
  } catch (err) {
    next(err);
  }
};

export const getMyReport = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const report = reportService.getStudentReport(req.user!.userId, req.user!.userId);
    res.json(report);
  } catch (err) {
    next(err);
  }
};

export const getBatchReport = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const report = reportService.getBatchReport(req.params.batchId, req.user!.userId);
    res.json(report);
  } catch (err) {
    next(err);
  }
};

export const getTeacherReport = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const report = reportService.getTeacherReport(req.params.teacherId, req.user!.userId);
    res.json(report);
  } catch (err) {
    next(err);
  }
};

export const getMyTeacherReport = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const report = reportService.getTeacherReport(req.user!.userId, req.user!.userId);
    res.json(report);
  } catch (err) {
    next(err);
  }
};
