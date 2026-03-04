import { Request, Response, NextFunction } from 'express';
import { attendanceService } from '../services/attendanceService';
import { validateCheckIn, validateManualAttendance } from '../validators/attendanceValidator';

export const checkIn = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const studentId = req.user!.userId;
    const { method, qrToken } = validateCheckIn(req.body);
    const record = attendanceService.checkIn(req.params.sessionId, studentId, method, qrToken);
    res.status(201).json(record);
  } catch (err) {
    next(err);
  }
};

export const markManual = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const { studentId, status } = validateManualAttendance(req.body);
    const record = attendanceService.markManualAttendance(
      req.params.sessionId,
      studentId,
      req.user!.userId,
      status,
    );
    res.status(201).json(record);
  } catch (err) {
    next(err);
  }
};

export const getSessionAttendance = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const records = attendanceService.getSessionAttendance(req.params.sessionId);
    res.json(records);
  } catch (err) {
    next(err);
  }
};

export const getStudentAttendance = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const { studentId } = req.params;
    const batchId = req.query.batchId as string | undefined;
    const records = attendanceService.getStudentAttendance(studentId, batchId);
    res.json(records);
  } catch (err) {
    next(err);
  }
};

export const getMyAttendance = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const studentId = req.user!.userId;
    const batchId = req.query.batchId as string | undefined;
    const records = attendanceService.getStudentAttendance(studentId, batchId);
    res.json(records);
  } catch (err) {
    next(err);
  }
};

export const getAttendanceSummary = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const { studentId, batchId } = req.params;
    const summary = attendanceService.getAttendanceSummary(studentId, batchId);
    res.json(summary);
  } catch (err) {
    next(err);
  }
};
