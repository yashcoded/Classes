import { UserRepository } from '../repositories/userRepository';
import { User, UserRole, ApprovalStatus, NotFoundError, ForbiddenError, ValidationError, ConflictError } from '../types';
import { teacherProfiles, studentProfiles, parentProfiles, studentParentLinks } from '../models';
import { TeacherProfile, StudentProfile, ParentProfile, StudentParentLink } from '../types';
import { v4 as uuidv4 } from 'uuid';

const userRepo = new UserRepository();

function omitPassword(user: User & { passwordHash: string }): User {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash: _ph, ...rest } = user;
  return rest;
}

export const userService = {
  getUserById(id: string): User {
    const user = userRepo.findById(id);
    if (!user) throw new NotFoundError('User not found');
    return omitPassword(user);
  },

  getAllUsers(): User[] {
    return userRepo.findAll().map(omitPassword);
  },

  getUsersByRole(role: UserRole): User[] {
    return userRepo.findByRole(role).map(omitPassword);
  },

  getTeacherProfile(userId: string): TeacherProfile | undefined {
    for (const p of teacherProfiles.values()) {
      if (p.userId === userId) return p;
    }
    return undefined;
  },

  getStudentProfile(userId: string): StudentProfile | undefined {
    for (const p of studentProfiles.values()) {
      if (p.userId === userId) return p;
    }
    return undefined;
  },

  getParentProfile(userId: string): ParentProfile | undefined {
    for (const p of parentProfiles.values()) {
      if (p.userId === userId) return p;
    }
    return undefined;
  },

  updateTeacherProfile(
    userId: string,
    data: Partial<Pick<TeacherProfile, 'bio' | 'subjects'>>,
  ): TeacherProfile {
    for (const [id, profile] of teacherProfiles.entries()) {
      if (profile.userId === userId) {
        const updated = { ...profile, ...data, updatedAt: new Date() };
        teacherProfiles.set(id, updated);
        return updated;
      }
    }
    throw new NotFoundError('Teacher profile not found');
  },

  updateStudentProfile(
    userId: string,
    data: Partial<Pick<StudentProfile, 'grade' | 'dateOfBirth'>>,
  ): StudentProfile {
    for (const [id, profile] of studentProfiles.entries()) {
      if (profile.userId === userId) {
        const updated = { ...profile, ...data, updatedAt: new Date() };
        studentProfiles.set(id, updated);
        return updated;
      }
    }
    throw new NotFoundError('Student profile not found');
  },

  linkParentToStudent(studentId: string, parentId: string, relation: string): StudentParentLink {
    const student = userRepo.findById(studentId);
    const parent = userRepo.findById(parentId);
    if (!student || student.role !== UserRole.STUDENT) throw new NotFoundError('Student not found');
    if (!parent || parent.role !== UserRole.PARENT) throw new NotFoundError('Parent not found');

    const link: StudentParentLink = {
      id: uuidv4(),
      studentId,
      parentId,
      relation,
      status: ApprovalStatus.APPROVED,
      requestedBy: parentId,
      createdAt: new Date(),
    };
    studentParentLinks.set(link.id, link);
    return link;
  },

  requestParentStudentLink(requestedBy: string, studentId: string, parentId: string, relation: string): StudentParentLink {
    const student = userRepo.findById(studentId);
    const parent = userRepo.findById(parentId);
    if (!student || student.role !== UserRole.STUDENT) throw new NotFoundError('Student not found');
    if (!parent || parent.role !== UserRole.PARENT) throw new NotFoundError('Parent not found');

    for (const link of studentParentLinks.values()) {
      if (link.studentId === studentId && link.parentId === parentId && link.status !== ApprovalStatus.REJECTED) {
        throw new ConflictError('Link request already exists');
      }
    }

    const link: StudentParentLink = {
      id: uuidv4(),
      studentId,
      parentId,
      relation,
      status: ApprovalStatus.PENDING,
      requestedBy,
      createdAt: new Date(),
    };
    studentParentLinks.set(link.id, link);
    return link;
  },

  getPendingParentStudentLinks(): (StudentParentLink & { studentName: string; parentName: string })[] {
    return Array.from(studentParentLinks.values())
      .filter((l) => l.status === ApprovalStatus.PENDING)
      .map((link) => {
        const student = userRepo.findById(link.studentId);
        const parent = userRepo.findById(link.parentId);
        return {
          ...link,
          studentName: student?.name ?? 'Unknown',
          parentName: parent?.name ?? 'Unknown',
        };
      });
  },

  approveParentStudentLink(linkId: string, approvedByUserId: string, approved: boolean): StudentParentLink {
    const link = studentParentLinks.get(linkId);
    if (!link) throw new NotFoundError('Link not found');
    if (link.status !== ApprovalStatus.PENDING) {
      throw new ValidationError('Link already processed');
    }
    const updated: StudentParentLink = {
      ...link,
      status: approved ? ApprovalStatus.APPROVED : ApprovalStatus.REJECTED,
      approvedBy: approved ? approvedByUserId : undefined,
      approvedAt: approved ? new Date() : undefined,
    };
    studentParentLinks.set(linkId, updated);
    return updated;
  },

  getStudentParents(studentId: string): (User & { relation: string })[] {
    const links = Array.from(studentParentLinks.values()).filter(
      (l) => l.studentId === studentId && l.status === ApprovalStatus.APPROVED,
    );
    return links.flatMap((link) => {
      const parent = userRepo.findById(link.parentId);
      if (!parent) return [];
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { passwordHash: _ph, ...rest } = parent;
      return [{ ...rest, relation: link.relation }];
    });
  },

  getParentStudents(parentId: string): (User & { relation: string })[] {
    const links = Array.from(studentParentLinks.values()).filter(
      (l) => l.parentId === parentId && l.status === ApprovalStatus.APPROVED,
    );
    return links.flatMap((link) => {
      const student = userRepo.findById(link.studentId);
      if (!student) return [];
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { passwordHash: _ph, ...rest } = student;
      return [{ ...rest, relation: link.relation }];
    });
  },

  getParentStudentLinksForUser(userId: string): StudentParentLink[] {
    return Array.from(studentParentLinks.values()).filter(
      (l) => l.parentId === userId || l.studentId === userId,
    );
  },

  searchStudents(query: string): User[] {
    if (!query || query.trim().length < 2) return [];
    const q = query.toLowerCase();
    return userRepo
      .findByRole(UserRole.STUDENT)
      .filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
      .map(omitPassword);
  },

  getPendingTeachers(): User[] {
    return userRepo
      .findByRole(UserRole.TEACHER)
      .filter((u) => u.status === ApprovalStatus.PENDING)
      .map(omitPassword);
  },

  approveUser(userId: string, approved: boolean): User {
    const user = userRepo.findById(userId);
    if (!user) throw new NotFoundError('User not found');
    const newStatus = approved ? ApprovalStatus.APPROVED : ApprovalStatus.REJECTED;
    const updated = userRepo.update(userId, { status: newStatus } as Partial<User>);
    if (!updated) throw new NotFoundError('User not found');
    return omitPassword(updated);
  },

  getApprovedTeachers(): User[] {
    return userRepo
      .findByRole(UserRole.TEACHER)
      .filter((u) => u.status === ApprovalStatus.APPROVED)
      .map(omitPassword);
  },
};
