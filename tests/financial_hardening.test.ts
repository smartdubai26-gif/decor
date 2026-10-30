import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { db } from '../src/server/db';
import { checkIdempotency, saveIdempotency } from '../src/server/repository';

describe('Financial Hardening & Precision Integrity Tests', () => {
  beforeEach(() => {
    db.resetToFixture();
  });

  test('roundCurrency prevents standard JavaScript floating-point drift', () => {
    // 0.1 + 0.2 = 0.30000000000000004 in raw JS
    const floatAddition = 0.1 + 0.2;
    assert.notEqual(floatAddition, 0.3);

    const safeAmount = db.constructor ? (db as any).constructor.roundCurrency(floatAddition) : Math.round(floatAddition * 100) / 100;
    assert.equal(safeAmount, 0.3);

    // Large monetary amount with fractional cents
    const rawVal = 1459820.5555;
    const rounded = Math.round(rawVal * 100) / 100;
    assert.equal(rounded, 1459820.56);
  });

  test('quotation version creation creates immutable snapshots without altering previous version data', () => {
    const quotations = db.get('quotations');
    const quote = quotations[0];
    assert.ok(quote);
    const initialVersionCount = quote.versions.length;
    const initialVersion1Subtotal = quote.versions[0].subtotalEgp;

    const newItems = [
      { description: 'أعمال تجاليد خشبية فاخرة إضافية', quantity: 85, unit: 'متر مسطح', unitPriceEgp: 1400, discountPercentage: 5 },
      { description: 'وحدات إضاءة سمارت تفاعلية', quantity: 24, unit: 'وحدة', unitPriceEgp: 3200, discountPercentage: 0 }
    ];

    const author = { id: 'u1', name: 'مهندس أحمد' };
    const updatedQuote = db.createQuotationVersion(quote.id, newItems, 14, author);

    assert.equal(updatedQuote.versions.length, initialVersionCount + 1);
    // Version 1 must remain completely intact (immutable)
    assert.equal(updatedQuote.versions[0].subtotalEgp, initialVersion1Subtotal);

    // Version 2 checks
    const v2 = updatedQuote.versions[updatedQuote.versions.length - 1];
    assert.equal(v2.versionNumber, initialVersionCount + 1);

    // 85 * 1400 * 0.95 = 113050
    // 24 * 3200 = 76800
    // Subtotal = 189850
    assert.equal(v2.subtotalEgp, 189850);
    // VAT 14% of 189850 = 26579
    assert.equal(v2.taxAmountEgp, 26579);
    // Grand Total = 189850 + 26579 = 216429
    assert.equal(v2.grandTotalEgp, 216429);

    // Audit log was recorded
    const audit = db.get('auditLogs')[0];
    assert.equal(audit.action, 'إصدار نسخة مقايسة جديدة');
    assert.ok(audit.details.includes('216429'));
  });

  test('quotation status updates transition safely and write audit entries', () => {
    const quotations = db.get('quotations');
    const quote = quotations[0];
    const author = { id: 'u1', name: 'مهندس أحمد' };

    const updated = db.updateQuotationStatus(quote.id, 'accepted', author);
    assert.equal(updated.status, 'accepted');

    const audit = db.get('auditLogs')[0];
    assert.equal(audit.action, 'تحديث حالة المقايسة');
    assert.ok(audit.details.includes('accepted'));
  });

  test('idempotent payment processing: duplicate submission key returns cached result without double crediting', () => {
    const idempotencyKey = `idemp-pay-${Date.now()}`;
    const principalId = 'u4';
    const endpoint = '/api/payments';
    const paymentPayload = {
      projectId: 'pr1',
      projectName: 'فيلا لوريف - التجمع الخامس',
      customerName: 'طارق عبد العال',
      amountEgp: 250000,
      paymentDate: '2026-10-20',
      method: 'bank_transfer',
      referenceNumber: 'TXN-998877'
    };

    const initialCache = checkIdempotency(principalId, endpoint, idempotencyKey, paymentPayload);
    assert.equal(initialCache.status, 'MISS');

    // First request saves cache
    saveIdempotency(principalId, endpoint, idempotencyKey, paymentPayload, 201, { id: 'pay-mock-id', ...paymentPayload });

    // Second request receives cached entry
    const cached = checkIdempotency(principalId, endpoint, idempotencyKey, paymentPayload);
    assert.equal(cached.status, 'HIT');
    if (cached.status === 'HIT') {
      assert.equal(cached.record.statusCode, 201);
      assert.equal(cached.record.body.amountEgp, 250000);
      assert.equal(cached.record.body.referenceNumber, 'TXN-998877');
    }

    // Third request with DIFFERENT payload causes 409 conflict
    const conflictCheck = checkIdempotency(principalId, endpoint, idempotencyKey, { ...paymentPayload, amountEgp: 500000 });
    assert.equal(conflictCheck.status, 'CONFLICT');

    // Different user with same key does not see cached entry (principal isolation)
    const otherUserCheck = checkIdempotency('u5', endpoint, idempotencyKey, paymentPayload);
    assert.equal(otherUserCheck.status, 'MISS');
  });

  test('expense recording atomically updates project actualExpensesEgp', () => {
    const projects = db.get('projects');
    const targetProject = projects[0];
    const initialProjectExpenses = targetProject.actualExpensesEgp || 0;
    const expenseAmount = 45000;

    const author = { id: 'u4', name: 'أستاذ شريف' };
    const recordedExpense = db.recordExpense({
      projectId: targetProject.id,
      projectName: targetProject.name,
      category: 'materials',
      description: 'توريد كابلات السويدي معتمدة للمشروع',
      amountEgp: expenseAmount,
      expenseDate: '2026-10-20',
      supplierName: 'شركة السويدي إلكتريك'
    }, author);

    assert.ok(recordedExpense.id);
    assert.equal(recordedExpense.amountEgp, expenseAmount);

    const updatedProject = db.get('projects').find(p => p.id === targetProject.id);
    assert.equal(updatedProject?.actualExpensesEgp, initialProjectExpenses + expenseAmount);
  });
});
