import { v4 as uuidv4 } from 'uuid';
import { Test, TestResult } from '../types';
import { tests, testResults } from '../models';

export class TestRepository {
  findById(id: string): Test | undefined {
    return tests.get(id);
  }

  findByBatchId(batchId: string): Test[] {
    return Array.from(tests.values()).filter((t) => t.batchId === batchId);
  }

  findByTeacherId(teacherId: string): Test[] {
    return Array.from(tests.values()).filter((t) => t.teacherId === teacherId);
  }

  create(data: Omit<Test, 'id' | 'createdAt' | 'updatedAt'>): Test {
    const now = new Date();
    const test: Test = { ...data, id: uuidv4(), createdAt: now, updatedAt: now };
    tests.set(test.id, test);
    return test;
  }

  update(id: string, data: Partial<Test>): Test | undefined {
    const existing = tests.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...data, id, updatedAt: new Date() };
    tests.set(id, updated);
    return updated;
  }

  delete(id: string): boolean {
    return tests.delete(id);
  }

  findAll(): Test[] {
    return Array.from(tests.values());
  }
}

export class TestResultRepository {
  findById(id: string): TestResult | undefined {
    return testResults.get(id);
  }

  findByTestId(testId: string): TestResult[] {
    return Array.from(testResults.values()).filter((r) => r.testId === testId);
  }

  findByStudentId(studentId: string): TestResult[] {
    return Array.from(testResults.values()).filter((r) => r.studentId === studentId);
  }

  findByTestAndStudent(testId: string, studentId: string): TestResult | undefined {
    for (const result of testResults.values()) {
      if (result.testId === testId && result.studentId === studentId) return result;
    }
    return undefined;
  }

  create(data: Omit<TestResult, 'id' | 'createdAt' | 'updatedAt'>): TestResult {
    const now = new Date();
    const result: TestResult = { ...data, id: uuidv4(), createdAt: now, updatedAt: now };
    testResults.set(result.id, result);
    return result;
  }

  update(id: string, data: Partial<TestResult>): TestResult | undefined {
    const existing = testResults.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...data, id, updatedAt: new Date() };
    testResults.set(id, updated);
    return updated;
  }

  findAll(): TestResult[] {
    return Array.from(testResults.values());
  }
}
