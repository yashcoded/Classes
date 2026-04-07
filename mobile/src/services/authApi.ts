import { apiGet, apiPost } from '@/services/api';
import type { AuthUser, User, UserRole } from '@/types';

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterResponse {
  token: string;
  user: User;
}

export function login(email: string, password: string): Promise<LoginResponse> {
  return apiPost<LoginResponse>('/auth/login', { email, password });
}

export function register(
  email: string,
  password: string,
  name: string,
  role: UserRole,
  phone?: string,
): Promise<RegisterResponse> {
  return apiPost<RegisterResponse>('/auth/register', {
    email,
    password,
    name,
    role,
    ...(phone ? { phone } : {}),
  });
}

export function getMe(): Promise<User> {
  return apiGet<User>('/auth/me');
}

export function loginWithGoogle(body: {
  idToken?: string;
  accessToken?: string;
  role?: UserRole;
  teacherId?: string;
}): Promise<LoginResponse> {
  return apiPost<LoginResponse>('/auth/google', body);
}

export type { AuthUser };
