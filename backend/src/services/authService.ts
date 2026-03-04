import { v4 as uuidv4 } from 'uuid';
import { authProvider } from '../lib/auth';
import { UserRepository } from '../repositories/userRepository';
import {
  User,
  UserRole,
  TeacherProfile,
  StudentProfile,
  ParentProfile,
  AppError,
  ConflictError,
  UnauthorizedError,
  NotFoundError,
} from '../types';
import { teacherProfiles, studentProfiles, parentProfiles } from '../models';

const userRepo = new UserRepository();

function omitPassword(user: User & { passwordHash: string }): User {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash: _ph, ...rest } = user;
  return rest;
}

function createProfile(userId: string, role: UserRole): void {
  const now = new Date();
  const id = uuidv4();
  if (role === UserRole.TEACHER) {
    const profile: TeacherProfile = { id, userId, createdAt: now, updatedAt: now };
    teacherProfiles.set(id, profile);
  } else if (role === UserRole.STUDENT) {
    const profile: StudentProfile = { id, userId, createdAt: now, updatedAt: now };
    studentProfiles.set(id, profile);
  } else if (role === UserRole.PARENT) {
    const profile: ParentProfile = { id, userId, createdAt: now, updatedAt: now };
    parentProfiles.set(id, profile);
  }
}

export const authService = {
  async register(
    email: string,
    password: string,
    role: UserRole,
    name: string,
    phone?: string,
  ): Promise<{ user: User; token: string }> {
    const existing = userRepo.findByEmail(email);
    if (existing) throw new ConflictError('Email already registered');

    const passwordHash = await authProvider.hashPassword(password);
    const userId = uuidv4();
    const user = userRepo.create({
      authId: userId,
      email,
      role,
      name,
      phone,
      passwordHash,
    });

    createProfile(user.id, role);

    const token = authProvider.generateToken({
      userId: user.id,
      role: user.role,
      email: user.email,
    });

    return { user: omitPassword(user), token };
  },

  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const user = userRepo.findByEmail(email);
    if (!user) throw new UnauthorizedError('Invalid credentials');

    const valid = await authProvider.comparePassword(password, user.passwordHash);
    if (!valid) throw new UnauthorizedError('Invalid credentials');

    const token = authProvider.generateToken({
      userId: user.id,
      role: user.role,
      email: user.email,
    });

    return { user: omitPassword(user), token };
  },

  getCurrentUser(userId: string): User {
    const user = userRepo.findById(userId);
    if (!user) throw new NotFoundError('User not found');
    return omitPassword(user);
  },

  updateProfile(
    userId: string,
    data: Partial<Pick<User, 'name' | 'phone'>>,
  ): User {
    const existing = userRepo.findById(userId);
    if (!existing) throw new NotFoundError('User not found');
    const updated = userRepo.update(userId, data);
    if (!updated) throw new AppError('Update failed');
    return omitPassword(updated);
  },
};
