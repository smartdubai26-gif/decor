import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { db } from '../src/server/db';
import { repository, withLock } from '../src/server/repository';

describe('Database Durability, Concurrency & Migration Integrity Tests', () => {
  beforeEach(() => {
    db.resetToFixture();
  });

  test('verified timestamped backup creates readable JSON with intact record counts', () => {
    const backup = db.createBackup();

    assert.ok(backup.backupPath);
    assert.ok(fs.existsSync(backup.backupPath));
    assert.ok(backup.recordCounts.users > 0);
    assert.ok(backup.recordCounts.leads > 0);
    assert.ok(backup.recordCounts.projects > 0);
    assert.ok(backup.recordCounts.quotations > 0);

    const content = JSON.parse(fs.readFileSync(backup.backupPath, 'utf-8'));
    assert.equal(content.users.length, backup.recordCounts.users);
    assert.equal(content.projects.length, backup.recordCounts.projects);

    // Clean up test backup file
    try { fs.unlinkSync(backup.backupPath); } catch {}
  });

  test('mutex locking (withLock) prevents concurrent double-conversion race conditions', async () => {
    const lockKey = 'lead_race_condition_test';
    let executed = false;

    // First execution acquires lock
    const promise1 = withLock(lockKey, async () => {
      await new Promise(res => setTimeout(res, 50));
      executed = true;
      return 'SUCCESS_1';
    });

    // Concurrent second execution should immediately reject with CONCURRENT_CONFLICT
    await assert.rejects(
      async () => {
        await withLock(lockKey, async () => {
          return 'SUCCESS_2';
        });
      },
      /CONCURRENT_CONFLICT/
    );

    const res1 = await promise1;
    assert.equal(res1, 'SUCCESS_1');
    assert.equal(executed, true);

    // After release, lock can be re-acquired
    const promise3 = await withLock(lockKey, async () => 'SUCCESS_3');
    assert.equal(promise3, 'SUCCESS_3');
  });

  test('reconciliation diagnostic verifies zero orphaned projects and non-negative balances', async () => {
    const report = await repository.verifyIntegrity();

    assert.equal(report.healthy, true);
    assert.ok(report.recordCounts.projects > 0);
    assert.ok(report.recordCounts.customers > 0);
    // Every project must link to an existing customer record
    assert.equal(report.reconciliation.orphanedProjectsCount, 0);
    // Payments and expenses must have valid non-negative sums
    assert.ok(report.reconciliation.totalPaymentsAmount >= 0);
    assert.ok(report.reconciliation.totalExpensesAmount >= 0);
  });
});
