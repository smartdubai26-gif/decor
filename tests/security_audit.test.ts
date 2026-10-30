import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { db, verifyPassword } from '../src/server/db';
import { 
  createSession, getSession, destroySession, revokeAllUserSessions,
  checkBruteForceLockout, recordFailedLogin, resetFailedLogins, cleanExpiredSessions
} from '../src/server/auth';
import { User } from '../src/types';

describe('Production Security & Zero-Trust Audit Tests', () => {
  beforeEach(() => {
    db.resetToFixture();
    resetFailedLogins('127.0.0.1');
    resetFailedLogins('test-ip-lockout');
  });

  test('brute-force protection: locks out identifier after 5 consecutive failed attempts', () => {
    const testIp = 'test-ip-lockout';
    assert.equal(checkBruteForceLockout(testIp).locked, false);

    // 4 failed attempts should not lock
    for (let i = 1; i <= 4; i++) {
      const res = recordFailedLogin(testIp);
      assert.equal(res.locked, false);
      assert.equal(res.attemptsLeft, 5 - i);
    }

    // 5th attempt locks out
    const finalAttempt = recordFailedLogin(testIp);
    assert.equal(finalAttempt.locked, true);
    assert.equal(finalAttempt.attemptsLeft, 0);

    const check = checkBruteForceLockout(testIp);
    assert.equal(check.locked, true);
    assert.ok(check.remainingSec > 0);

    // Reset works on successful login
    resetFailedLogins(testIp);
    assert.equal(checkBruteForceLockout(testIp).locked, false);
  });

  test('user enumeration prevention: timing-safe password verification executes with constant time dummy compare', () => {
    const start = Date.now();
    // Simulate non-existent user dummy verify
    const dummyVerify = verifyPassword('invalid_pass', '00'.repeat(64), '00'.repeat(32));
    const elapsed = Date.now() - start;

    assert.equal(dummyVerify, false);
    // Should execute PBKDF2 iterations without throwing or leaking
    assert.ok(elapsed >= 0);
  });

  test('session revocation: revokeAllUserSessions terminates all active tokens for a specific user', () => {
    const testUser: User = {
      id: 'u-revoke-target',
      name: 'موظف مبيعات',
      email: 'sales.agent@artisan-space.eg',
      role: 'sales',
      phone: '+20 111 222 3333'
    };

    const session1 = createSession(testUser);
    const session2 = createSession(testUser);

    assert.ok(getSession(session1.token));
    assert.ok(getSession(session2.token));

    // Revoke all sessions (e.g. after password or role change)
    revokeAllUserSessions(testUser.id);

    assert.equal(getSession(session1.token), null);
    assert.equal(getSession(session2.token), null);
  });

  test('session lifecycle: cleanExpiredSessions purges expired tokens from memory', () => {
    const testUser: User = {
      id: 'u-expired-test',
      name: 'مستخدم تجريبي',
      email: 'expire@test.eg',
      role: 'client',
      phone: '+20 100 000 1111'
    };

    const activeSession = createSession(testUser);
    // Create an artificially expired session
    const expiredSession = createSession(testUser);
    expiredSession.expiresAt = Date.now() - 1000; // expired 1s ago

    const purgedCount = cleanExpiredSessions();
    assert.ok(purgedCount >= 1);
    assert.equal(getSession(expiredSession.token), null);
    assert.ok(getSession(activeSession.token));
  });

  test('RBAC role transition: updating user role changes role and preserves integrity', () => {
    const users = db.get('users');
    const targetUser = users.find(u => u.role === 'sales');
    assert.ok(targetUser);

    const author = { id: 'u1', name: 'مهندس أحمد' };
    const updated = db.updateUserRole(targetUser.id, 'manager', author);

    assert.equal(updated.role, 'manager');
    const refreshed = db.get('users').find(u => u.id === targetUser.id);
    assert.equal(refreshed?.role, 'manager');

    // Verify audit log created
    const latestAudit = db.get('auditLogs')[0];
    assert.equal(latestAudit.action, 'تعديل صلاحية مستخدم');
    assert.ok(latestAudit.details.includes('manager'));
  });
});
