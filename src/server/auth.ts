import crypto from 'node:crypto';
import { Request, Response, NextFunction } from 'express';
import { db } from './db';
import { User, UserRole } from '../types';

export interface AuthSession {
  token: string;
  userId: string;
  role: UserRole;
  name: string;
  createdAt: number;
  expiresAt: number;
}

// In-memory active sessions store with TTL
const sessions = new Map<string, AuthSession>();

// Failed login attempt tracking (rate-limiting & account lockout)
interface FailedAttempt {
  count: number;
  lockedUntil: number;
}
const failedLogins = new Map<string, FailedAttempt>();

export function checkBruteForceLockout(identifier: string): { locked: boolean; remainingSec: number } {
  const record = failedLogins.get(identifier.toLowerCase());
  if (!record) return { locked: false, remainingSec: 0 };
  const now = Date.now();
  if (now < record.lockedUntil) {
    return { locked: true, remainingSec: Math.ceil((record.lockedUntil - now) / 1000) };
  }
  // Lock expired
  if (now > record.lockedUntil && record.lockedUntil > 0) {
    failedLogins.delete(identifier.toLowerCase());
  }
  return { locked: false, remainingSec: 0 };
}

export function recordFailedLogin(identifier: string): { locked: boolean; attemptsLeft: number } {
  const key = identifier.toLowerCase();
  const now = Date.now();
  const record = failedLogins.get(key) || { count: 0, lockedUntil: 0 };

  record.count++;
  if (record.count >= 5) {
    record.lockedUntil = now + 15 * 60 * 1000; // 15 minutes lockout
    failedLogins.set(key, record);
    return { locked: true, attemptsLeft: 0 };
  }

  failedLogins.set(key, record);
  return { locked: false, attemptsLeft: 5 - record.count };
}

export function resetFailedLogins(identifier: string): void {
  failedLogins.delete(identifier.toLowerCase());
}

export function createSession(user: User): AuthSession {
  const token = crypto.randomBytes(32).toString('hex');
  const now = Date.now();
  const session: AuthSession = {
    token,
    userId: user.id,
    role: user.role,
    name: user.name,
    createdAt: now,
    expiresAt: now + 24 * 60 * 60 * 1000 // 24 hours
  };
  sessions.set(token, session);
  return session;
}

export function getSession(token: string): AuthSession | null {
  const session = sessions.get(token);
  if (!session) return null;
  if (Date.now() > session.expiresAt) {
    sessions.delete(token);
    return null;
  }
  return session;
}

export function destroySession(token: string): void {
  sessions.delete(token);
}

export function revokeAllUserSessions(userId: string): void {
  for (const [token, session] of sessions.entries()) {
    if (session.userId === userId) {
      sessions.delete(token);
    }
  }
}

export function cleanExpiredSessions(): number {
  const now = Date.now();
  let count = 0;
  for (const [token, session] of sessions.entries()) {
    if (now > session.expiresAt) {
      sessions.delete(token);
      count++;
    }
  }
  return count;
}

export function getActiveSessionCount(): number {
  return sessions.size;
}

// Periodic cleanup every 15 minutes (unref so process can exit cleanly)
const sessionCleanupInterval = setInterval(() => {
  cleanExpiredSessions();
}, 15 * 60 * 1000);
if (sessionCleanupInterval.unref) {
  sessionCleanupInterval.unref();
}

// Extend Express Request type
export interface AuthenticatedRequest extends Request {
  user?: User;
  sessionToken?: string;
}

// Middleware: Require valid session or bearer token
export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

  if (!token) {
    res.status(401).json({ error: 'غير مصرح: يرجى تسجيل الدخول أولاً' });
    return;
  }

  const session = getSession(token);
  if (!session) {
    res.status(401).json({ error: 'الجلسة منتهية أو غير صالحة' });
    return;
  }

  const user = db.get('users').find(u => u.id === session.userId);
  if (!user) {
    res.status(401).json({ error: 'المستخدم غير موجود' });
    return;
  }

  req.user = user;
  req.sessionToken = token;
  next();
}

// Middleware: Server-enforced role checking
export function requireRole(allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'غير مصرح' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ 
        error: 'صلاحيات غير كافية', 
        message: `الدور الحالي (${req.user.role}) لا يملك صلاحية الوصول لهذا المورد.` 
      });
      return;
    }

    next();
  };
}
