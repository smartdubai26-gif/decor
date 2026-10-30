import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { db } from '../src/server/db';
import { Lead } from '../src/types';

describe('Durable Database & Transactional Workflows', () => {
  beforeEach(() => {
    db.resetToFixture();
  });

  test('persists new leads and verifies record presence', () => {
    const testLead: Lead = {
      id: `test-lead-${Date.now()}`,
      customerName: 'أحمد محمود التجريبي',
      phone: '+20 100 999 8888',
      email: 'ahmed.test@example.com',
      preferredContact: 'whatsapp',
      projectType: 'residential_villa',
      location: 'التجمع الخامس',
      approxAreaSqm: 400,
      estimatedBudgetEgp: 1500000,
      scope: 'تشطيب فيلا متكامل',
      expectedStartDate: '2026-08-01',
      status: 'new',
      priority: 'vip',
      assignedToUserId: 'u2',
      nextFollowUpDate: '2026-10-25',
      notes: ['طلب تجريبي للتحقق من قاعدة البيانات'],
      createdAt: '2026-10-20'
    };

    db.update('leads', list => [testLead, ...list]);

    const retrievedLeads = db.get('leads');
    const found = retrievedLeads.find(l => l.id === testLead.id);

    assert.ok(found);
    assert.equal(found?.customerName, 'أحمد محمود التجريبي');
    assert.equal(found?.estimatedBudgetEgp, 1500000);
  });

  test('converts won lead into customer and project idempotently', () => {
    const leads = db.get('leads');
    const firstLead = leads[0];
    assert.ok(firstLead);

    const author = { id: 'u1', name: 'مهندس أحمد' };
    const { customer, project } = db.convertLeadToProject(firstLead.id, author);

    assert.ok(customer);
    assert.ok(project);
    assert.equal(customer.name, firstLead.customerName);
    assert.equal(project.customerId, customer.id);
    assert.equal(project.contractValueEgp, firstLead.estimatedBudgetEgp);

    // Verify lead status updated to won
    const updatedLead = db.get('leads').find(l => l.id === firstLead.id);
    assert.equal(updatedLead?.status, 'won');

    // Run conversion again to verify idempotency (no duplicate project created)
    const secondCall = db.convertLeadToProject(firstLead.id, author);
    assert.equal(secondCall.project.id, project.id);
  });

  test('records audit logs with timestamp and user information', () => {
    db.logAudit('u1', 'مهندس أحمد', 'اختبار تدقيق', 'تم إجراء فحص أمني للنظام');

    const logs = db.get('auditLogs');
    const testLog = logs.find(l => l.action === 'اختبار تدقيق');

    assert.ok(testLog);
    assert.equal(testLog?.userId, 'u1');
    assert.ok(testLog?.timestamp);
  });
});
