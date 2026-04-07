import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/userService';
import { UserRole } from '../types';

export const getAllUsers = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const role = req.query.role as UserRole | undefined;
    const users = role ? userService.getUsersByRole(role) : userService.getAllUsers();
    res.json(users);
  } catch (err) {
    next(err);
  }
};

export const getUserById = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const user = userService.getUserById(req.params.id);
    res.json(user);
  } catch (err) {
    next(err);
  }
};

export const getMyProfile = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const userId = req.user!.userId;
    const role = req.user!.role;
    const user = userService.getUserById(userId);
    let profile = null;
    if (role === UserRole.TEACHER) profile = userService.getTeacherProfile(userId);
    else if (role === UserRole.STUDENT) profile = userService.getStudentProfile(userId);
    else if (role === UserRole.PARENT) profile = userService.getParentProfile(userId);
    res.json({ ...user, profile });
  } catch (err) {
    next(err);
  }
};

export const updateTeacherProfile = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const userId = req.params.userId ?? req.user!.userId;
    const profile = userService.updateTeacherProfile(userId, req.body);
    res.json(profile);
  } catch (err) {
    next(err);
  }
};

export const updateStudentProfile = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const userId = req.params.userId ?? req.user!.userId;
    const profile = userService.updateStudentProfile(userId, req.body);
    res.json(profile);
  } catch (err) {
    next(err);
  }
};

export const linkParentToStudent = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const { studentId, parentId, relation } = req.body as {
      studentId: string;
      parentId: string;
      relation: string;
    };
    const link = userService.linkParentToStudent(studentId, parentId, relation);
    res.status(201).json(link);
  } catch (err) {
    next(err);
  }
};

export const getStudentParents = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const parents = userService.getStudentParents(req.params.studentId);
    res.json(parents);
  } catch (err) {
    next(err);
  }
};

export const getParentStudents = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const students = userService.getParentStudents(req.params.parentId);
    res.json(students);
  } catch (err) {
    next(err);
  }
};

export const getPendingTeachers = (_req: Request, res: Response, next: NextFunction): void => {
  try {
    const teachers = userService.getPendingTeachers();
    res.json(teachers);
  } catch (err) {
    next(err);
  }
};

export const approveUser = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const { approved } = req.body as { approved: boolean };
    const user = userService.approveUser(req.params.id, approved);
    res.json(user);
  } catch (err) {
    next(err);
  }
};

export const getApprovedTeachers = (_req: Request, res: Response, next: NextFunction): void => {
  try {
    const teachers = userService.getApprovedTeachers();
    res.json(teachers);
  } catch (err) {
    next(err);
  }
};

export const requestParentStudentLink = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const requestedBy = req.user!.userId;
    const { studentId, parentId, relation } = req.body as {
      studentId: string;
      parentId: string;
      relation: string;
    };
    const link = userService.requestParentStudentLink(requestedBy, studentId, parentId, relation);
    res.status(201).json(link);
  } catch (err) {
    next(err);
  }
};

export const getPendingParentStudentLinks = (_req: Request, res: Response, next: NextFunction): void => {
  try {
    const links = userService.getPendingParentStudentLinks();
    res.json(links);
  } catch (err) {
    next(err);
  }
};

export const approveParentStudentLink = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const { approved } = req.body as { approved: boolean };
    const link = userService.approveParentStudentLink(req.params.id, req.user!.userId, approved);
    res.json(link);
  } catch (err) {
    next(err);
  }
};

export const getMyParentStudentLinks = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const links = userService.getParentStudentLinksForUser(req.user!.userId);
    res.json(links);
  } catch (err) {
    next(err);
  }
};

export const searchStudents = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const query = req.query.q as string;
    const students = userService.searchStudents(query);
    res.json(students);
  } catch (err) {
    next(err);
  }
};
