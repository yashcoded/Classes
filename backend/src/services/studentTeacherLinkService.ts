import { v4 as uuidv4 } from 'uuid';
import { UserRepository } from '../repositories/userRepository';
import {
  StudentTeacherLink,
  UserRole,
  ApprovalStatus,
  NotFoundError,
  ConflictError,
  ValidationError,
} from '../types';
import { studentTeacherLinks } from '../models';

const userRepo = new UserRepository();

export const studentTeacherLinkService = {
  requestLink(studentId: string, teacherId: string): StudentTeacherLink {
    const student = userRepo.findById(studentId);
    if (!student || student.role !== UserRole.STUDENT) {
      throw new NotFoundError('Student not found');
    }
    const teacher = userRepo.findById(teacherId);
    if (!teacher || teacher.role !== UserRole.TEACHER) {
      throw new NotFoundError('Teacher not found');
    }
    if (teacher.status !== ApprovalStatus.APPROVED) {
      throw new ValidationError('Teacher is not yet approved');
    }

    for (const link of studentTeacherLinks.values()) {
      if (link.studentId === studentId && link.teacherId === teacherId && link.status !== ApprovalStatus.REJECTED) {
        throw new ConflictError('Link request already exists');
      }
    }

    const link: StudentTeacherLink = {
      id: uuidv4(),
      studentId,
      teacherId,
      status: ApprovalStatus.PENDING,
      createdAt: new Date(),
    };
    studentTeacherLinks.set(link.id, link);
    return link;
  },

  getPendingLinks(): (StudentTeacherLink & { studentName: string; teacherName: string })[] {
    return Array.from(studentTeacherLinks.values())
      .filter((l) => l.status === ApprovalStatus.PENDING)
      .map((link) => {
        const student = userRepo.findById(link.studentId);
        const teacher = userRepo.findById(link.teacherId);
        return {
          ...link,
          studentName: student?.name ?? 'Unknown',
          teacherName: teacher?.name ?? 'Unknown',
        };
      });
  },

  approveLink(linkId: string, approved: boolean): StudentTeacherLink {
    const link = studentTeacherLinks.get(linkId);
    if (!link) throw new NotFoundError('Link not found');
    if (link.status !== ApprovalStatus.PENDING) {
      throw new ValidationError('Link already processed');
    }

    const updated: StudentTeacherLink = {
      ...link,
      status: approved ? ApprovalStatus.APPROVED : ApprovalStatus.REJECTED,
      approvedAt: approved ? new Date() : undefined,
    };
    studentTeacherLinks.set(linkId, updated);
    return updated;
  },

  getLinksForStudent(studentId: string): (StudentTeacherLink & { teacherName: string })[] {
    return Array.from(studentTeacherLinks.values())
      .filter((l) => l.studentId === studentId)
      .map((link) => {
        const teacher = userRepo.findById(link.teacherId);
        return { ...link, teacherName: teacher?.name ?? 'Unknown' };
      });
  },

  getLinksForTeacher(teacherId: string): (StudentTeacherLink & { studentName: string })[] {
    return Array.from(studentTeacherLinks.values())
      .filter((l) => l.teacherId === teacherId)
      .map((link) => {
        const student = userRepo.findById(link.studentId);
        return { ...link, studentName: student?.name ?? 'Unknown' };
      });
  },
};
