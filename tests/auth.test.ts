import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { hashPassword, verifyPassword } from '../src/server/db';
import { createSession, getSession, destroySession } from '../src/server/auth';
import { User } from '../src/types';

describe('Security & Authentication Tests', () => {
  test('correctly hashes password with PBKDF2 and verifies valid matching password', () => {
    const rawPassword = 'SecureSecretPassword!2026';
    const { hash, salt } = hashPassword(rawPassword);

    assert.ok(hash);
    assert.ok(salt);
    assert.notEqual(hash, rawPassword);

    const isMatch = verifyPassword(rawPassword, hash, salt);
    assert.equal(isMatch, true);

    const isWrongMatch = verifyPassword('WrongPassword123', hash, salt);
    assert.equal(isWrongMatch, false);
  });

  test('creates session token and verifies session expiry and destruction', () => {
    const testUser: User = {
      id: 'u-test',
      name: 'مستخدم تجريبي',
      email: 'test@artisan-space.eg',
      role: 'pm',
      phone: '+20 100 000 0000'
    };

    const session = createSession(testUser);
    assert.ok(session.token);
    assert.equal(session.userId, testUser.id);
    assert.equal(session.role, 'pm');

    const retrieved = getSession(session.token);
    assert.ok(retrieved);
    assert.equal(retrieved?.userId, testUser.id);

    destroySession(session.token);
    const afterDestroy = getSession(session.token);
    assert.equal(afterDestroy, null);
  });
});
