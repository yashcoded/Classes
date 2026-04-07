import { authService } from '../services/authService';
import { UserRole } from '../types';
import * as models from '../models';

function clearModels() {
  models.users.clear();
  models.teacherProfiles.clear();
  models.studentProfiles.clear();
  models.parentProfiles.clear();
}

describe('authService', () => {
  beforeEach(() => {
    clearModels();
  });

  describe('register', () => {
    it('should register a new teacher and return a token', async () => {
      const result = await authService.register(
        'teacher@test.com',
        'password123',
        UserRole.TEACHER,
        'Alice',
      );
      expect(result.user.email).toBe('teacher@test.com');
      expect(result.user.role).toBe(UserRole.TEACHER);
      expect(result.token).toBeTruthy();
      expect((result.user as unknown as Record<string, unknown>).passwordHash).toBeUndefined();
    });

    it('should register a student and create student profile', async () => {
      const result = await authService.register(
        'student@test.com',
        'password123',
        UserRole.STUDENT,
        'Bob',
      );
      expect(result.user.role).toBe(UserRole.STUDENT);
      const profiles = Array.from(models.studentProfiles.values());
      expect(profiles.some((p) => p.userId === result.user.id)).toBe(true);
    });

    it('should throw ConflictError when email already registered', async () => {
      await authService.register('dup@test.com', 'pass123', UserRole.STUDENT, 'Dup');
      await expect(
        authService.register('dup@test.com', 'pass123', UserRole.STUDENT, 'Dup2'),
      ).rejects.toMatchObject({ statusCode: 409 });
    });
  });

  describe('login', () => {
    beforeEach(async () => {
      await authService.register('login@test.com', 'mypassword', UserRole.TEACHER, 'Login User');
    });

    it('should login with valid credentials', async () => {
      const result = await authService.login('login@test.com', 'mypassword');
      expect(result.token).toBeTruthy();
      expect(result.user.email).toBe('login@test.com');
    });

    it('should throw UnauthorizedError with wrong password', async () => {
      await expect(authService.login('login@test.com', 'wrongpass')).rejects.toMatchObject({
        statusCode: 401,
      });
    });

    it('should throw UnauthorizedError with non-existent email', async () => {
      await expect(authService.login('noone@test.com', 'pass')).rejects.toMatchObject({
        statusCode: 401,
      });
    });
  });

  describe('getCurrentUser', () => {
    it('should return user without passwordHash', async () => {
      const { user } = await authService.register(
        'getme@test.com',
        'pass123',
        UserRole.PARENT,
        'Parent User',
      );
      const fetched = authService.getCurrentUser(user.id);
      expect(fetched.id).toBe(user.id);
      expect((fetched as unknown as Record<string, unknown>).passwordHash).toBeUndefined();
    });

    it('should throw NotFoundError for unknown id', () => {
      expect(() => authService.getCurrentUser('non-existent-id')).toThrow();
    });
  });
});
