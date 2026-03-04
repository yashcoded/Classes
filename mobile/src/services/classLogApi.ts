import { apiGet, apiPost } from '@/services/api';
import type { ClassLog, CreateClassLogPayload } from '@/types';

export function createClassLog(data: CreateClassLogPayload): Promise<ClassLog> {
  return apiPost<ClassLog>('/class-logs', data);
}

export function getBatchClassLogs(batchId: string): Promise<ClassLog[]> {
  return apiGet<ClassLog[]>(`/class-logs/batch/${batchId}`);
}
