import { Request, Response, NextFunction } from 'express';
import { testService } from '../services/testService';
import { validateCreateTest, validateSubmitResult } from '../validators/testValidator';

export const createTest = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const data = validateCreateTest(req.body);
    const test = testService.createTest(req.user!.userId, data);
    res.status(201).json(test);
  } catch (err) {
    next(err);
  }
};

export const getTest = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const test = testService.getTestById(req.params.id);
    res.json(test);
  } catch (err) {
    next(err);
  }
};

export const getBatchTests = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const tests = testService.getBatchTests(req.params.batchId);
    res.json(tests);
  } catch (err) {
    next(err);
  }
};

export const updateTest = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const test = testService.updateTest(req.params.id, req.user!.userId, req.body);
    res.json(test);
  } catch (err) {
    next(err);
  }
};

export const deleteTest = (req: Request, res: Response, next: NextFunction): void => {
  try {
    testService.deleteTest(req.params.id, req.user!.userId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

export const submitResult = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const { studentId, marksObtained, remarks } = validateSubmitResult(req.body);
    const result = testService.submitResult(
      req.params.id,
      studentId,
      marksObtained,
      req.user!.userId,
      remarks,
    );
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

export const getTestResults = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const results = testService.getTestResults(req.params.id);
    res.json(results);
  } catch (err) {
    next(err);
  }
};

export const getMyResults = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const results = testService.getStudentResults(req.user!.userId);
    res.json(results);
  } catch (err) {
    next(err);
  }
};
