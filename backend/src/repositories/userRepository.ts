import { v4 as uuidv4 } from 'uuid';
import { User, UserRole } from '../types';
import { users } from '../models';

export class UserRepository {
  findById(id: string): (User & { passwordHash: string }) | undefined {
    return users.get(id);
  }

  findByEmail(email: string): (User & { passwordHash: string }) | undefined {
    for (const user of users.values()) {
      if (user.email.toLowerCase() === email.toLowerCase()) return user;
    }
    return undefined;
  }

  findByAuthId(authId: string): (User & { passwordHash: string }) | undefined {
    for (const user of users.values()) {
      if (user.authId === authId) return user;
    }
    return undefined;
  }

  create(
    data: Omit<User, 'id' | 'createdAt' | 'updatedAt'> & { passwordHash: string },
  ): User & { passwordHash: string } {
    const now = new Date();
    const user: User & { passwordHash: string } = {
      ...data,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
    };
    users.set(user.id, user);
    return user;
  }

  update(id: string, data: Partial<User>): (User & { passwordHash: string }) | undefined {
    const existing = users.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...data, id, updatedAt: new Date() };
    users.set(id, updated);
    return updated;
  }

  findAll(): (User & { passwordHash: string })[] {
    return Array.from(users.values());
  }

  findByRole(role: UserRole): (User & { passwordHash: string })[] {
    return Array.from(users.values()).filter((u) => u.role === role);
  }
}
