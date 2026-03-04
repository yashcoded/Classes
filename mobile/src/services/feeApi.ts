import { apiGet, apiPost } from '@/services/api';
import type { CreateFeePayload, FeeRecord } from '@/types';

export function getMyFees(): Promise<FeeRecord[]> {
  return apiGet<FeeRecord[]>('/fees/me');
}

export function getStudentFees(studentId: string): Promise<FeeRecord[]> {
  return apiGet<FeeRecord[]>(`/fees/student/${studentId}`);
}

export function getAllFees(): Promise<FeeRecord[]> {
  return apiGet<FeeRecord[]>('/fees');
}

export function createFeeRecord(data: CreateFeePayload): Promise<FeeRecord> {
  return apiPost<FeeRecord>('/fees', data);
}

export function markFeePaid(id: string): Promise<FeeRecord> {
  return apiPost<FeeRecord>(`/fees/${id}/pay`, {});
}
