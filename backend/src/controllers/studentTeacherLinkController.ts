import { Request, Response, NextFunction } from 'express';
import { studentTeacherLinkService } from '../services/studentTeacherLinkService';

export const requestStudentTeacherLink = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const studentId = req.user!.userId;
    const { teacherId } = req.body as { teacherId: string };
    const link = studentTeacherLinkService.requestLink(studentId, teacherId);
    res.status(201).json(link);
  } catch (err) {
    next(err);
  }
};

export const getPendingStudentTeacherLinks = (_req: Request, res: Response, next: NextFunction): void => {
  try {
    const links = studentTeacherLinkService.getPendingLinks();
    res.json(links);
  } catch (err) {
    next(err);
  }
};

export const approveStudentTeacherLink = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const { approved } = req.body as { approved: boolean };
    const link = studentTeacherLinkService.approveLink(req.params.id, approved);
    res.json(link);
  } catch (err) {
    next(err);
  }
};

export const getMyStudentTeacherLinks = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const userId = req.user!.userId;
    const role = req.user!.role;
    if (role === 'student') {
      res.json(studentTeacherLinkService.getLinksForStudent(userId));
    } else if (role === 'teacher' || role === 'admin') {
      res.json(studentTeacherLinkService.getLinksForTeacher(userId));
    } else {
      res.json([]);
    }
  } catch (err) {
    next(err);
  }
};
