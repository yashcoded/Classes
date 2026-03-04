import { apiGet, apiPost } from '@/services/api';
import type { ClassSession, CreateSessionPayload } from '@/types';

export function getMySessions(): Promise<ClassSession[]> {
  return apiGet<ClassSession[]>('/sessions/my');
}

export function getSession(id: string): Promise<ClassSession> {
  return apiGet<ClassSession>(`/sessions/${id}`);
}

export function createSession(
  batchId: string,
  scheduledAt: string,
): Promise<ClassSession> {
  const payload: CreateSessionPayload = { scheduledAt };
  return apiPost<ClassSession>(`/sessions/batch/${batchId}`, payload);
}

export function getBatchSessions(batchId: string): Promise<ClassSession[]> {
  return apiGet<ClassSession[]>(`/sessions/batch/${batchId}`);
}

export function startSession(id: string): Promise<ClassSession> {
  return apiPost<ClassSession>(`/sessions/${id}/start`, {});
}

export function endSession(id: string): Promise<ClassSession> {
  return apiPost<ClassSession>(`/sessions/${id}/end`, {});
}

export function refreshQR(id: string): Promise<ClassSession> {
  return apiPost<ClassSession>(`/sessions/${id}/qr/refresh`, {});
}
