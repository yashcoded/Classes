import crypto from 'crypto';
import { SessionRepository } from '../repositories/sessionRepository';
import { BatchRepository } from '../repositories/batchRepository';
import {
  ClassSession,
  BatchMembershipStatus,
  SessionStatus,
  NotFoundError,
  ForbiddenError,
  ConflictError,
  AppError,
  UserRole,
} from '../types';
import { UserRepository } from '../repositories/userRepository';
import { BatchMembershipRepository } from '../repositories/membershipRepository';

const sessionRepo = new SessionRepository();
const batchRepo = new BatchRepository();
const userRepo = new UserRepository();
const membershipRepo = new BatchMembershipRepository();

const QR_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
const QR_SECRET = process.env.QR_SECRET ?? 'qr-secret-dev';

function buildQRToken(sessionId: string, expiresAt: number): string {
  const payload = Buffer.from(JSON.stringify({ sessionId, expiresAt })).toString('base64');
  const sig = crypto
    .createHmac('sha256', QR_SECRET)
    .update(payload)
    .digest('hex');
  return `${payload}.${sig}`;
}

export function decodeQRToken(token: string): { sessionId: string; expiresAt: number } | null {
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [payload, sig] = parts;
  const expectedSig = crypto
    .createHmac('sha256', QR_SECRET)
    .update(payload)
    .digest('hex');
  if (sig !== expectedSig) return null;
  try {
    return JSON.parse(Buffer.from(payload, 'base64').toString('utf8'));
  } catch {
    return null;
  }
}

export const sessionService = {
  createSession(batchId: string, teacherId: string, scheduledAt: Date): ClassSession {
    const batch = batchRepo.findById(batchId);
    if (!batch) throw new NotFoundError('Batch not found');
    if (batch.teacherId !== teacherId) throw new ForbiddenError('Not your batch');

    return sessionRepo.create({
      batchId,
      teacherId,
      scheduledAt,
      status: SessionStatus.SCHEDULED,
    });
  },

  getSessionById(id: string): ClassSession {
    const session = sessionRepo.findById(id);
    if (!session) throw new NotFoundError('Session not found');
    return session;
  },

  getBatchSessions(batchId: string): ClassSession[] {
    return sessionRepo.findByBatchId(batchId);
  },

  getTeacherSessions(teacherId: string): ClassSession[] {
    return sessionRepo.findByTeacherId(teacherId);
  },

  getStudentSessions(studentId: string): ClassSession[] {
    const memberships = membershipRepo
      .findByStudentId(studentId)
      .filter((m) => m.status === BatchMembershipStatus.ACTIVE);
    const sessions = memberships.flatMap((membership) =>
      sessionRepo.findByBatchId(membership.batchId),
    );
    // De-duplicate sessions when historical membership rows overlap.
    return Array.from(new Map(sessions.map((session) => [session.id, session])).values());
  },

  startSession(sessionId: string, teacherId: string): ClassSession {
    const session = sessionRepo.findById(sessionId);
    if (!session) throw new NotFoundError('Session not found');
    if (session.teacherId !== teacherId) throw new ForbiddenError('Not your session');
    if (session.status !== SessionStatus.SCHEDULED) {
      throw new ConflictError(`Session is already ${session.status}`);
    }

    const expiresAt = Date.now() + QR_EXPIRY_MS;
    const qrCode = buildQRToken(sessionId, expiresAt);

    const updated = sessionRepo.update(sessionId, {
      status: SessionStatus.ACTIVE,
      startedAt: new Date(),
      qrCode,
      qrExpiresAt: new Date(expiresAt),
    });
    if (!updated) throw new AppError('Failed to start session');
    return updated;
  },

  endSession(sessionId: string, teacherId: string): ClassSession {
    const session = sessionRepo.findById(sessionId);
    if (!session) throw new NotFoundError('Session not found');
    if (session.teacherId !== teacherId) throw new ForbiddenError('Not your session');
    if (session.status !== SessionStatus.ACTIVE) {
      throw new ConflictError('Session is not active');
    }

    const updated = sessionRepo.update(sessionId, {
      status: SessionStatus.COMPLETED,
      endedAt: new Date(),
      qrCode: undefined,
      qrExpiresAt: undefined,
    });
    if (!updated) throw new AppError('Failed to end session');
    return updated;
  },

  cancelSession(sessionId: string, teacherId: string): ClassSession {
    const session = sessionRepo.findById(sessionId);
    if (!session) throw new NotFoundError('Session not found');

    const requester = userRepo.findById(teacherId);
    if (!requester) throw new NotFoundError('User not found');
    if (requester.role !== UserRole.ADMIN && session.teacherId !== teacherId) {
      throw new ForbiddenError('Not your session');
    }
    if (session.status === SessionStatus.COMPLETED || session.status === SessionStatus.CANCELLED) {
      throw new ConflictError(`Session is already ${session.status}`);
    }

    const updated = sessionRepo.update(sessionId, { status: SessionStatus.CANCELLED });
    if (!updated) throw new AppError('Failed to cancel session');
    return updated;
  },

  generateQRCode(sessionId: string): string {
    const session = sessionRepo.findById(sessionId);
    if (!session) throw new NotFoundError('Session not found');
    if (session.status !== SessionStatus.ACTIVE) {
      throw new ConflictError('Session is not active');
    }

    const expiresAt = Date.now() + QR_EXPIRY_MS;
    const qrCode = buildQRToken(sessionId, expiresAt);

    sessionRepo.update(sessionId, {
      qrCode,
      qrExpiresAt: new Date(expiresAt),
    });

    return qrCode;
  },

  validateQRCode(sessionId: string, qrToken: string): boolean {
    const decoded = decodeQRToken(qrToken);
    if (!decoded) return false;
    if (decoded.sessionId !== sessionId) return false;
    if (Date.now() > decoded.expiresAt) return false;

    const session = sessionRepo.findById(sessionId);
    if (!session) return false;
    if (session.qrCode !== qrToken) return false;
    if (session.status !== SessionStatus.ACTIVE) return false;
    return true;
  },
};
