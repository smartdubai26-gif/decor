import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

describe('Quotation & Financial Precision Calculations', () => {
  test('accurately calculates item line totals with percentage discounts without float drift', () => {
    const quantity = 250;
    const unitPrice = 850.50;
    const discountPercentage = 10;

    const baseAmount = quantity * unitPrice; // 212625
    const discountAmount = baseAmount * (discountPercentage / 100); // 21262.5
    const lineTotal = Math.round((baseAmount - discountAmount) * 100) / 100; // 191362.5

    assert.equal(lineTotal, 191362.5);
  });

  test('calculates subtotal, 14% Egyptian VAT, and grand total correctly', () => {
    const items = [
      { quantity: 200, unitPrice: 750, discount: 0 },
      { quantity: 150, unitPrice: 1200, discount: 5 },
      { quantity: 80, unitPrice: 450, discount: 0 }
    ];

    let subtotal = 0;
    for (const item of items) {
      const raw = item.quantity * item.unitPrice;
      const disc = raw * (item.discount / 100);
      subtotal += Math.round((raw - disc) * 100) / 100;
    }

    // 200 * 750 = 150000
    // 150 * 1200 * 0.95 = 171000
    // 80 * 450 = 36000
    // subtotal = 357000
    assert.equal(subtotal, 357000);

    const taxRate = 14;
    const taxAmount = Math.round(subtotal * (taxRate / 100) * 100) / 100;
    // 357000 * 0.14 = 49980
    assert.equal(taxAmount, 49980);

    const grandTotal = Math.round((subtotal + taxAmount) * 100) / 100;
    assert.equal(grandTotal, 406980);
  });

  test('reconciles project budget, actual expenses, and outstanding customer balance', () => {
    const contractValue = 1800000;
    const recordedPayments = [600000, 400000];
    const recordedExpenses = [350000, 180000, 95000];

    const totalPaid = recordedPayments.reduce((a, b) => a + b, 0);
    const totalSpent = recordedExpenses.reduce((a, b) => a + b, 0);

    const outstandingCustomerBalance = contractValue - totalPaid;
    const projectOperatingProfit = totalPaid - totalSpent;
    const budgetRemaining = contractValue - totalSpent;

    assert.equal(totalPaid, 1000000);
    assert.equal(outstandingCustomerBalance, 800000);
    assert.equal(totalSpent, 625000);
    assert.equal(projectOperatingProfit, 375000);
    assert.equal(budgetRemaining, 1175000);
  });
});
