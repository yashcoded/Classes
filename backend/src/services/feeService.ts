import { FeeRepository } from '../repositories/feeRepository';
import { UserRepository } from '../repositories/userRepository';
import {
  FeeRecord,
  FeeStatus,
  NotFoundError,
  ForbiddenError,
  ValidationError,
  UserRole,
} from '../types';

const feeRepo = new FeeRepository();
const userRepo = new UserRepository();

export const feeService = {
  createFeeRecord(
    requesterId: string,
    data: Pick<FeeRecord, 'studentId' | 'amount' | 'dueDate'> &
      Partial<Pick<FeeRecord, 'description'>>,
  ): FeeRecord {
    const requester = userRepo.findById(requesterId);
    if (!requester) throw new NotFoundError('Requester not found');
    if (requester.role !== UserRole.TEACHER && requester.role !== UserRole.ADMIN) {
      throw new ForbiddenError('Only teachers or admins can create fee records');
    }

    const student = userRepo.findById(data.studentId);
    if (!student || student.role !== UserRole.STUDENT) {
      throw new NotFoundError('Student not found');
    }

    if (data.amount <= 0) throw new ValidationError('Amount must be positive');

    return feeRepo.create({ ...data, status: FeeStatus.PENDING });
  },

  getFeeById(id: string): FeeRecord {
    const fee = feeRepo.findById(id);
    if (!fee) throw new NotFoundError('Fee record not found');
    return fee;
  },

  getStudentFees(studentId: string): FeeRecord[] {
    return feeRepo.findByStudentId(studentId);
  },

  getAllFees(requesterId: string): FeeRecord[] {
    const requester = userRepo.findById(requesterId);
    if (!requester) throw new NotFoundError('User not found');
    if (requester.role !== UserRole.TEACHER && requester.role !== UserRole.ADMIN) {
      throw new ForbiddenError('Access denied');
    }
    return feeRepo.findAll();
  },

  markAsPaid(id: string, requesterId: string, paidDate?: Date): FeeRecord {
    const requester = userRepo.findById(requesterId);
    if (!requester) throw new NotFoundError('Requester not found');
    if (requester.role !== UserRole.TEACHER && requester.role !== UserRole.ADMIN) {
      throw new ForbiddenError('Only teachers or admins can mark fees as paid');
    }

    const fee = feeRepo.findById(id);
    if (!fee) throw new NotFoundError('Fee record not found');
    if (fee.status === FeeStatus.PAID) {
      throw new ValidationError('Fee is already marked as paid');
    }

    const updated = feeRepo.update(id, {
      status: FeeStatus.PAID,
      paidDate: paidDate ?? new Date(),
    });
    if (!updated) throw new NotFoundError('Fee record not found');
    return updated;
  },

  syncOverdueStatuses(): number {
    const now = new Date();
    let count = 0;
    for (const fee of feeRepo.findAll()) {
      if (fee.status === FeeStatus.PENDING && fee.dueDate < now) {
        feeRepo.update(fee.id, { status: FeeStatus.OVERDUE });
        count++;
      }
    }
    return count;
  },

  updateFee(
    id: string,
    requesterId: string,
    data: Partial<Pick<FeeRecord, 'amount' | 'dueDate' | 'description' | 'status'>>,
  ): FeeRecord {
    const requester = userRepo.findById(requesterId);
    if (!requester) throw new NotFoundError('Requester not found');
    if (requester.role !== UserRole.TEACHER && requester.role !== UserRole.ADMIN) {
      throw new ForbiddenError('Access denied');
    }

    const fee = feeRepo.findById(id);
    if (!fee) throw new NotFoundError('Fee record not found');

    const updated = feeRepo.update(id, data);
    if (!updated) throw new NotFoundError('Fee record not found');
    return updated;
  },

  getOverdueFees(): FeeRecord[] {
    this.syncOverdueStatuses();
    return feeRepo.findByStatus(FeeStatus.OVERDUE);
  },
};
