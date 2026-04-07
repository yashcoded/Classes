import { Request, Response, NextFunction } from 'express';
import { feeService } from '../services/feeService';
import { validateCreateFee, validateMarkPaid } from '../validators/feeValidator';

export const createFee = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const data = validateCreateFee(req.body);
    const fee = feeService.createFeeRecord(req.user!.userId, data);
    res.status(201).json(fee);
  } catch (err) {
    next(err);
  }
};

export const getFee = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const fee = feeService.getFeeById(req.params.id);
    res.json(fee);
  } catch (err) {
    next(err);
  }
};

export const getStudentFees = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const fees = feeService.getStudentFees(req.params.studentId);
    res.json(fees);
  } catch (err) {
    next(err);
  }
};

export const getMyFees = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const fees = feeService.getFeesForUser(req.user!.userId);
    res.json(fees);
  } catch (err) {
    next(err);
  }
};

export const getAllFees = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const fees = feeService.getAllFees(req.user!.userId);
    res.json(fees);
  } catch (err) {
    next(err);
  }
};

export const markPaid = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const { paidDate } = validateMarkPaid(req.body);
    const fee = feeService.markAsPaid(req.params.id, req.user!.userId, paidDate);
    res.json(fee);
  } catch (err) {
    next(err);
  }
};

export const getOverdueFees = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const fees = feeService.getOverdueFees();
    res.json(fees);
  } catch (err) {
    next(err);
  }
};
