import { Request, Response, NextFunction } from 'express';
import { batchService } from '../services/batchService';
import { validateCreateBatch, validateUpdateBatch } from '../validators/batchValidator';

export const createBatch = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const teacherId = req.user!.userId;
    const data = validateCreateBatch(req.body);
    const result = batchService.createBatch(teacherId, data);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

export const getBatch = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const batch = batchService.getBatchById(req.params.id);
    res.json(batch);
  } catch (err) {
    next(err);
  }
};

export const getMyBatches = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const batches = batchService.getTeacherBatches(req.user!.userId);
    res.json(batches);
  } catch (err) {
    next(err);
  }
};

export const getAllBatches = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const batches = batchService.getAllBatches();
    res.json(batches);
  } catch (err) {
    next(err);
  }
};

export const updateBatch = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const data = validateUpdateBatch(req.body);
    const batch = batchService.updateBatch(req.params.id, req.user!.userId, data);
    res.json(batch);
  } catch (err) {
    next(err);
  }
};

export const addStudent = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const { studentId } = req.body as { studentId: string };
    const membership = batchService.addStudentToBatch(
      req.params.id,
      studentId,
      req.user!.userId,
    );
    res.status(201).json(membership);
  } catch (err) {
    next(err);
  }
};

export const removeStudent = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const membership = batchService.removeStudentFromBatch(
      req.params.id,
      req.params.studentId,
      req.user!.userId,
    );
    res.json(membership);
  } catch (err) {
    next(err);
  }
};

export const transferStudent = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const { toBatchId, reason } = req.body as { toBatchId: string; reason?: string };
    const transfer = batchService.transferStudent(
      req.params.id,
      toBatchId,
      req.params.studentId,
      req.user!.userId,
      reason,
    );
    res.status(201).json(transfer);
  } catch (err) {
    next(err);
  }
};

export const getMembers = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const members = batchService.getActiveMemberships(req.params.id);
    res.json(members);
  } catch (err) {
    next(err);
  }
};

export const getStudentBatches = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const batches = batchService.getStudentBatches(req.params.studentId);
    res.json(batches);
  } catch (err) {
    next(err);
  }
};
