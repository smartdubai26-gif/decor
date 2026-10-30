import { test } from 'node:test';
import assert from 'node:assert/strict';
import { db } from '../src/server/db';
import { User, UserRole } from '../src/types';
import { DEFAULT_ROLE_PERMISSIONS } from '../src/data/mockData';

test('RBAC User Management & Permissions Control', async (t) => {
  const adminAuthor = { id: 'u1', name: 'مهندس أحمد العوضي' };

  await t.test('seeds initial users with valid roles and permissions', () => {
    const users = db.get('users');
    assert.ok(Array.isArray(users), 'Users should be an array');
    assert.ok(users.length >= 5, 'Should have at least 5 default users');
    
    const superAdmin = users.find(u => u.role === 'super_admin');
    assert.ok(superAdmin, 'Should have a super_admin user');
    assert.strictEqual(superAdmin.email, 'ahmed@artisan-space.eg');
  });

  await t.test('can create a new employee with designated role and custom permissions', () => {
    const initialCount = db.get('users').length;
    const newUser = db.createUser({
      name: 'م. تامر الجندي',
      email: `tamer-${Date.now()}@artisan-space.eg`,
      role: 'pm',
      phone: '+20 102 333 4455',
      department: 'إشراف المواقع المعمارية',
      permissions: {
        ...DEFAULT_ROLE_PERMISSIONS.pm,
        canAccessMedia: true,
        canAccessNews: true
      }
    }, adminAuthor);

    const reloaded = db.get('users').find(u => u.id === newUser.id);
    assert.ok(reloaded, 'New user should exist in DB');
    assert.strictEqual(reloaded.role, 'pm');
    assert.strictEqual(reloaded.permissions?.canAccessNews, true);
    assert.strictEqual(db.get('users').length, initialCount + 1);
  });

  await t.test('can update user role and customize specific permissions', () => {
    const users = db.get('users');
    const target = users.find(u => u.role === 'sales') || users[1];

    const updated = db.updateUser(target.id, {
      role: 'manager',
      department: 'إدارة العمليات والمبيعات',
      permissions: {
        canAccessCRM: true,
        canAccessFinance: true,
        canApproveQuotations: true
      }
    }, adminAuthor);

    assert.strictEqual(updated.role, 'manager');
    assert.strictEqual(updated.permissions?.canApproveQuotations, true);

    const fromDb = db.get('users').find(u => u.id === target.id);
    assert.strictEqual(fromDb?.role, 'manager');
  });

  await t.test('prevents deleting the main or only super_admin', () => {
    const superAdmin = db.get('users').find(u => u.role === 'super_admin')!;
    // Ensure only 1 super_admin exists or remove others first
    db.update('users', list => list.map(u => u.id === superAdmin.id ? u : (u.role === 'super_admin' ? { ...u, role: 'manager' as UserRole } : u)));

    assert.throws(() => {
      db.deleteUser(superAdmin.id, adminAuthor);
    }, /لا يمكن حذف المدير العام الرئيسي للنظام/);
  });

  await t.test('can delete a non-super-admin user successfully', () => {
    const tempUser = db.createUser({
      name: 'مستخدم مؤقت للحذف',
      email: `temp-${Date.now()}@test.com`,
      role: 'client'
    }, adminAuthor);

    const countBefore = db.get('users').length;
    db.deleteUser(tempUser.id, adminAuthor);
    const countAfter = db.get('users').length;

    assert.strictEqual(countAfter, countBefore - 1);
    assert.ok(!db.get('users').some(u => u.id === tempUser.id));
  });

});
