import { v4 as uuidv4 } from 'uuid';
import { authProvider } from '../lib/auth';
import { UserRepository } from '../repositories/userRepository';
import {
  User,
  UserRole,
  ApprovalStatus,
  TeacherProfile,
  StudentProfile,
  ParentProfile,
  AppError,
  ConflictError,
  UnauthorizedError,
  NotFoundError,
  ValidationError,
} from '../types';
import { teacherProfiles, studentProfiles, parentProfiles } from '../models';
import { verifyGoogleCredentials } from './googleAuthService';
import { sendWelcomeEmail } from './emailService';
import { studentTeacherLinkService } from './studentTeacherLinkService';

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
    const status = role === UserRole.TEACHER ? ApprovalStatus.PENDING : ApprovalStatus.APPROVED;
    const user = userRepo.create({
      authId: userId,
      email,
      role,
      name,
      phone,
      status,
      passwordHash,
    });

    createProfile(user.id, role);

    void sendWelcomeEmail(user.email, user.name).catch((err: unknown) => {
      console.warn('[email] welcome failed', err);
    });

    const token = authProvider.generateToken({
      userId: user.id,
      role: user.role,
      email: user.email,
      status: user.status,
    });

    return { user: omitPassword(user), token };
  },

  async loginWithGoogle(input: {
    idToken?: string;
    accessToken?: string;
    role?: UserRole;
    teacherId?: string;
  }): Promise<{ user: User; token: string }> {
    const profile = await verifyGoogleCredentials({
      idToken: input.idToken,
      accessToken: input.accessToken,
    });
    if (!profile.emailVerified) {
      throw new UnauthorizedError('Please verify your Google email first');
    }

    const emailNorm = profile.email.toLowerCase();
    let stored = userRepo.findByEmail(emailNorm);

    if (!stored) {
      if (!input.role) {
        throw new ValidationError(
          'No Google account yet. Go to Register, choose Teacher / Student / Parent, then tap Continue with Google.',
        );
      }
      if (input.role === UserRole.ADMIN) {
        throw new ValidationError('Admin accounts cannot be created with Google sign-in');
      }

      const passwordHash = await authProvider.hashPassword(
        `google:${profile.sub}:${uuidv4()}:${uuidv4()}`,
      );
      const status =
        input.role === UserRole.TEACHER ? ApprovalStatus.PENDING : ApprovalStatus.APPROVED;

      stored = userRepo.create({
        authId: profile.sub,
        email: emailNorm,
        role: input.role,
        name: profile.name,
        status,
        passwordHash,
        googleSub: profile.sub,
        authProvider: 'google',
      });

      createProfile(stored.id, input.role);

      void sendWelcomeEmail(stored.email, stored.name).catch((err: unknown) => {
        console.warn('[email] welcome failed', err);
      });

      if (input.role === UserRole.STUDENT && input.teacherId) {
        try {
          studentTeacherLinkService.requestLink(stored.id, input.teacherId);
        } catch {
          /* optional: student can request link later */
        }
      }
    } else {
      const patch: Partial<User> = {};
      if (stored.googleSub !== profile.sub) patch.googleSub = profile.sub;
      if (Object.keys(patch).length > 0) {
        const updated = userRepo.update(stored.id, patch);
        if (updated) stored = updated;
      }
    }

    const token = authProvider.generateToken({
      userId: stored.id,
      role: stored.role,
      email: stored.email,
      status: stored.status,
    });

    return { user: omitPassword(stored), token };
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
      status: user.status,
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
