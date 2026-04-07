import { apiDelete, apiGet, apiPost } from '@/services/api';
import type { Batch, BatchMembership, CreateBatchPayload } from '@/types';

export function getMyBatches(): Promise<Batch[]> {
  return apiGet<Batch[]>('/batches/my');
}

export function getBatch(id: string): Promise<Batch> {
  return apiGet<Batch>(`/batches/${id}`);
}

export function createBatch(data: CreateBatchPayload): Promise<Batch> {
  return apiPost<Batch>('/batches', data);
}

export function getBatchMembers(batchId: string): Promise<BatchMembership[]> {
  return apiGet<BatchMembership[]>(`/batches/${batchId}/members`);
}

export function addStudentToBatch(
  batchId: string,
  studentId: string,
): Promise<BatchMembership> {
  return apiPost<BatchMembership>(`/batches/${batchId}/students`, {
    studentId,
  });
}

export function removeStudentFromBatch(
  batchId: string,
  studentId: string,
): Promise<void> {
  return apiDelete<void>(`/batches/${batchId}/students/${studentId}`);
}

export function transferStudent(
  batchId: string,
  studentId: string,
  toBatchId: string,
  reason?: string,
): Promise<void> {
  return apiPost<void>(
    `/batches/${batchId}/students/${studentId}/transfer`,
    { toBatchId, ...(reason ? { reason } : {}) },
  );
}

export function getStudentBatches(studentId: string): Promise<Batch[]> {
  return apiGet<Batch[]>(`/batches/students/${studentId}/batches`);
}
