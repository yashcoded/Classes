import { v4 as uuidv4 } from 'uuid';
import { Batch } from '../types';
import { batches } from '../models';

export class BatchRepository {
  findById(id: string): Batch | undefined {
    return batches.get(id);
  }

  findByTeacherId(teacherId: string): Batch[] {
    return Array.from(batches.values()).filter((b) => b.teacherId === teacherId);
  }

  findAll(): Batch[] {
    return Array.from(batches.values());
  }

  create(data: Omit<Batch, 'id' | 'createdAt' | 'updatedAt'>): Batch {
    const now = new Date();
    const batch: Batch = { ...data, id: uuidv4(), createdAt: now, updatedAt: now };
    batches.set(batch.id, batch);
    return batch;
  }

  update(id: string, data: Partial<Batch>): Batch | undefined {
    const existing = batches.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...data, id, updatedAt: new Date() };
    batches.set(id, updated);
    return updated;
  }

  delete(id: string): boolean {
    return batches.delete(id);
  }
}
