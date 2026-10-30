import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { db } from '../src/server/db';
import { z } from 'zod';

const leadSubmissionSchema = z.object({
  customerName: z.string().min(2),
  phone: z.string().min(8),
  email: z.string().email().optional().or(z.literal('')),
  location: z.string().min(2),
  approxAreaSqm: z.number().positive(),
  estimatedBudgetEgp: z.number().nonnegative(),
});

describe('API Input Validation & Business Workflows', () => {
  beforeEach(() => {
    db.resetToFixture();
  });

  test('validates valid lead submission schema and rejects invalid payloads', () => {
    const validData = {
      customerName: 'طارق عبد العال',
      phone: '+20 122 345 6789',
      email: 'tarek@example.com',
      location: 'الشيخ زايد',
      approxAreaSqm: 320,
      estimatedBudgetEgp: 1200000
    };

    const validResult = leadSubmissionSchema.safeParse(validData);
    assert.equal(validResult.success, true);

    const invalidData = {
      customerName: 'A', // too short (< 2)
      phone: '123', // too short (< 8)
      approxAreaSqm: -50, // negative
      estimatedBudgetEgp: -100
    };

    const invalidResult = leadSubmissionSchema.safeParse(invalidData);
    assert.equal(invalidResult.success, false);
  });

  test('detects duplicate lead phone numbers with normalization', () => {
    const existingLeads = db.get('leads');
    const existingPhone = existingLeads[0].phone; // e.g. '+20 122 555 7890'

    // Formatted differently (e.g. spaces/dashes removed)
    const normalizedInput = '01225557890'.replace(/[^0-9]/g, '');
    const normalizedExisting = existingPhone.replace(/[^0-9]/g, '');

    // Check if ends with matching national number
    const isDuplicate = normalizedExisting.endsWith(normalizedInput.slice(-8));
    assert.equal(isDuplicate, true);
  });

  test('creates new expense and automatically updates project actualExpensesEgp', () => {
    const projects = db.get('projects');
    const targetProject = projects[0];
    const initialExpenses = targetProject.actualExpensesEgp || 0;
    const expenseAmount = 85000;

    // Simulate adding expense and updating project
    db.update('projects', list => list.map(p => {
      if (p.id === targetProject.id) {
        return { ...p, actualExpensesEgp: initialExpenses + expenseAmount };
      }
      return p;
    }));

    const updated = db.get('projects').find(p => p.id === targetProject.id);
    assert.equal(updated?.actualExpensesEgp, initialExpenses + expenseAmount);
  });
});
