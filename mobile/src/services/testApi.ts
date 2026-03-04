import { apiGet, apiPost } from '@/services/api';
import type { CreateTestPayload, Test, TestResult } from '@/types';

export function getMyTestResults(): Promise<TestResult[]> {
  return apiGet<TestResult[]>('/tests/my-results');
}

export function createTest(data: CreateTestPayload): Promise<Test> {
  return apiPost<Test>('/tests', data);
}

export function getBatchTests(batchId: string): Promise<Test[]> {
  return apiGet<Test[]>(`/tests/batch/${batchId}`);
}

export function getTest(id: string): Promise<Test> {
  return apiGet<Test>(`/tests/${id}`);
}

export function submitTestResult(
  testId: string,
  studentId: string,
  marksObtained: number,
  remarks?: string,
): Promise<TestResult> {
  return apiPost<TestResult>(`/tests/${testId}/results`, {
    studentId,
    marksObtained,
    ...(remarks ? { remarks } : {}),
  });
}

export function getTestResults(testId: string): Promise<TestResult[]> {
  return apiGet<TestResult[]>(`/tests/${testId}/results`);
}
