import { v4 as uuidv4 } from 'uuid';
import { authProvider } from './lib/auth';
import { UserRepository } from './repositories/userRepository';
import { ApprovalStatus, UserRole } from './types';
import { teacherProfiles, studentProfiles, parentProfiles } from './models';

const userRepo = new UserRepository();

function createProfile(userId: string, role: UserRole): void {
  const now = new Date();
  const id = uuidv4();
  if (role === UserRole.TEACHER) {
    teacherProfiles.set(id, { id, userId, createdAt: now, updatedAt: now });
  } else if (role === UserRole.STUDENT) {
    studentProfiles.set(id, { id, userId, createdAt: now, updatedAt: now });
  } else if (role === UserRole.PARENT) {
    parentProfiles.set(id, { id, userId, createdAt: now, updatedAt: now });
  }
}

type DemoAccount = {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  status: ApprovalStatus;
};

/**
 * When SEED_DEMO_USERS=true, creates password accounts for local exploration.
 * Skips any email that already exists. Does not send welcome email.
 */
export async function seedDemoUsers(): Promise<void> {
  if (process.env.SEED_DEMO_USERS !== 'true') {
    return;
  }

  const accounts: DemoAccount[] = [
    {
      email: (process.env.DEMO_TEACHER_EMAIL ?? 'demo.teacher@classtracker.local').toLowerCase(),
      password: process.env.DEMO_TEACHER_PASSWORD ?? 'demo1234',
      name: 'Demo Teacher',
      role: UserRole.TEACHER,
      status: ApprovalStatus.APPROVED,
    },
    {
      email: (process.env.DEMO_STUDENT_EMAIL ?? 'demo.student@classtracker.local').toLowerCase(),
      password: process.env.DEMO_STUDENT_PASSWORD ?? 'demo1234',
      name: 'Demo Student',
      role: UserRole.STUDENT,
      status: ApprovalStatus.APPROVED,
    },
    {
      email: (process.env.DEMO_PARENT_EMAIL ?? 'demo.parent@classtracker.local').toLowerCase(),
      password: process.env.DEMO_PARENT_PASSWORD ?? 'demo1234',
      name: 'Demo Parent',
      role: UserRole.PARENT,
      status: ApprovalStatus.APPROVED,
    },
  ];

  const includeAdmin = process.env.DEMO_ADMIN_EMAIL && process.env.DEMO_ADMIN_PASSWORD;
  if (includeAdmin) {
    accounts.push({
      email: process.env.DEMO_ADMIN_EMAIL!.toLowerCase(),
      password: process.env.DEMO_ADMIN_PASSWORD!,
      name: 'Demo Admin',
      role: UserRole.ADMIN,
      status: ApprovalStatus.APPROVED,
    });
  }

  for (const acc of accounts) {
    if (userRepo.findByEmail(acc.email)) continue;
    const passwordHash = await authProvider.hashPassword(acc.password);
    const user = userRepo.create({
      authId: uuidv4(),
      email: acc.email,
      role: acc.role,
      name: acc.name,
      status: acc.status,
      passwordHash,
      authProvider: 'password',
    });
    if (acc.role !== UserRole.ADMIN) {
      createProfile(user.id, acc.role);
    }
  }

  console.log('[seed] Demo users ready (SEED_DEMO_USERS=true). See backend/.env.example for emails/passwords.');
}
