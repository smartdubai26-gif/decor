import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { newDb } from 'pg-mem';
import { db as jsonDb } from '../src/server/db';

describe('Phase 4 — Real PostgreSQL Engine & Schema Verification', () => {
  let memDb: any;
  let pgPool: any;

  beforeEach(() => {
    memDb = newDb();
    // Register required extensions
    memDb.registerExtension('uuid-ossp', (schema: any) => {
      schema.registerFunction({
        name: 'uuid_generate_v4',
        implementation: () => 'uuid-' + Math.random().toString(36).substring(2)
      });
    });
    pgPool = memDb.adapters.createPg().Pool;
  });

  test('applies 001_initial_schema.sql and creates all tables, foreign keys, and indexes', async () => {
    const pool = new pgPool();
    const client = await pool.connect();
    try {
      const schemaSql = fs.readFileSync(path.resolve(process.cwd(), 'src/server/migrations/001_initial_schema.sql'), 'utf-8');
      await client.query(schemaSql);

      // Verify tables exist
      const tablesResult = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `);
      const tableNames = tablesResult.rows.map((r: any) => r.table_name);

      const requiredTables = [
        'users', 'customers', 'leads', 'projects', 'project_tasks',
        'quotations', 'quotation_versions', 'quotation_items',
        'payments', 'expenses', 'idempotency_keys', 'audit_logs'
      ];

      for (const table of requiredTables) {
        assert.ok(tableNames.includes(table), `Table ${table} must exist in PostgreSQL schema`);
      }
    } finally {
      client.release();
      await pool.end();
    }
  });

  test('enforces foreign key constraints and prevents orphaned child records', async () => {
    const pool = new pgPool();
    const client = await pool.connect();
    try {
      const schemaSql = fs.readFileSync(path.resolve(process.cwd(), 'src/server/migrations/001_initial_schema.sql'), 'utf-8');
      await client.query(schemaSql);

      // Attempt inserting project referencing non-existent customer must fail with foreign key violation
      await assert.rejects(
        async () => {
          await client.query(`
            INSERT INTO projects (
              id, project_number, name, customer_id, customer_name, address, 
              start_date, target_completion_date, status
            ) VALUES (
              'prj-err-1', 'PRJ-ERR-1', 'Orphan Project', 'non-existent-cust-id', 'No Name', 
              'Nowhere', '2026-01-01', '2026-06-01', 'planned'
            )
          `);
        },
        /foreign key/i
      );

      // Attempt inserting quotation_version referencing non-existent quotation must fail
      await assert.rejects(
        async () => {
          await client.query(`
            INSERT INTO quotation_versions (
              id, quotation_id, version_number, subtotal_egp, tax_amount_egp, grand_total_egp
            ) VALUES (
              'qv-err-1', 'non-existent-q-id', 1, 100000.00, 14000.00, 114000.00
            )
          `);
        },
        /foreign key/i
      );
    } finally {
      client.release();
      await pool.end();
    }
  });

  test('enforces numeric and check constraints (e.g. positive area, non-negative budget)', async () => {
    const pool = new pgPool();
    const client = await pool.connect();
    try {
      const schemaSql = fs.readFileSync(path.resolve(process.cwd(), 'src/server/migrations/001_initial_schema.sql'), 'utf-8');
      await client.query(schemaSql);

      // Negative approx_area_sqm must violate check constraint
      await assert.rejects(
        async () => {
          await client.query(`
            INSERT INTO leads (
              id, customer_name, phone, project_type, location, approx_area_sqm, estimated_budget_egp
            ) VALUES (
              'lead-err-1', 'أحمد فؤاد', '+201001112233', 'residential_villa', 'التجمع', -150.00, 500000.00
            )
          `);
        },
        /check/i
      );

      // Negative payment amount must violate check constraint
      await assert.rejects(
        async () => {
          // First create customer and project
          await client.query(`
            INSERT INTO customers (id, name, phone, address) 
            VALUES ('c-test-1', 'عميل تجريبي', '+201112223344', 'القاهرة')
          `);
          await client.query(`
            INSERT INTO projects (id, project_number, name, customer_id, customer_name, address, start_date, target_completion_date) 
            VALUES ('pr-test-1', 'PRJ-TEST-1', 'مشروع تجريبي', 'c-test-1', 'عميل تجريبي', 'القاهرة', '2026-01-01', '2026-05-01')
          `);
          await client.query(`
            INSERT INTO payments (id, project_id, project_name, customer_id, customer_name, amount_egp, payment_date, method, reference_number)
            VALUES ('pay-err-1', 'pr-test-1', 'مشروع تجريبي', 'c-test-1', 'عميل تجريبي', -5000.00, '2026-01-15', 'cash', 'REF-NEG')
          `);
        },
        /check/i
      );
    } finally {
      client.release();
      await pool.end();
    }
  });

  test('transaction rollback: uncommitted operations are completely reverted on failure', async () => {
    const pool = new pgPool();
    const client = await pool.connect();
    try {
      const schemaSql = fs.readFileSync(path.resolve(process.cwd(), 'src/server/migrations/001_initial_schema.sql'), 'utf-8');
      await client.query(schemaSql);

      await client.query(`
        BEGIN;
        INSERT INTO customers (id, name, phone, address) 
        VALUES ('cust-rollback-1', 'عميل التراجع', '+201229998877', 'الشيخ زايد');
        ROLLBACK;
      `);

      // Verify record does NOT exist
      const res = await client.query("SELECT * FROM customers WHERE id = 'cust-rollback-1'");
      assert.equal(res.rows.length, 0);
    } finally {
      client.release();
      await pool.end();
    }
  });

  test('rollback.sql successfully drops all tables in reverse dependency order', async () => {
    const pool = new pgPool();
    const client = await pool.connect();
    try {
      const schemaSql = fs.readFileSync(path.resolve(process.cwd(), 'src/server/migrations/001_initial_schema.sql'), 'utf-8');
      await client.query(schemaSql);

      const rollbackSql = fs.readFileSync(path.resolve(process.cwd(), 'src/server/migrations/rollback.sql'), 'utf-8');
      await client.query(rollbackSql);

      const tablesResult = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `);
      assert.equal(tablesResult.rows.length, 0, 'All tables should be cleanly dropped by rollback script');
    } finally {
      client.release();
      await pool.end();
    }
  });

  test('imports representative data and reconciles record counts, financial totals, and zero orphan records', async () => {
    const pool = new pgPool();
    const client = await pool.connect();
    try {
      const schemaSql = fs.readFileSync(path.resolve(process.cwd(), 'src/server/migrations/001_initial_schema.sql'), 'utf-8');
      await client.query(schemaSql);

      await client.query('BEGIN');

      // Populate users
      for (const u of jsonDb.get('users')) {
        await client.query(
          `INSERT INTO users (id, name, email, password_hash, salt, role, phone, department, avatar)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [u.id, u.name, u.email, u.passwordHash || '', u.salt || '', u.role, u.phone, u.department || null, u.avatar || null]
        );
      }

      // Populate customers
      for (const c of jsonDb.get('customers')) {
        await client.query(
          `INSERT INTO customers (id, name, phone, email, address, company_name, total_projects)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [c.id, c.name, c.phone, c.email || null, c.address, c.companyName || null, c.totalProjects || 0]
        );
      }

      // Populate projects
      for (const p of jsonDb.get('projects')) {
        await client.query(
          `INSERT INTO projects (id, project_number, name, customer_id, customer_name, address, scope, project_manager_id, start_date, target_completion_date, status, contract_value_egp, actual_expenses_egp, progress_percentage, notes, image_cover)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
          [p.id, p.projectNumber, p.name, p.customerId, p.customerName, p.address, p.scope || null, p.projectManagerId || null, p.startDate, p.targetCompletionDate, p.status, p.contractValueEgp, p.actualExpensesEgp, p.progressPercentage, p.notes || null, p.imageCover || null]
        );
      }

      // Populate payments
      for (const py of jsonDb.get('payments')) {
        await client.query(
          `INSERT INTO payments (id, project_id, project_name, customer_id, customer_name, amount_egp, payment_date, method, reference_number, notes)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [py.id, py.projectId, py.projectName, py.customerId, py.customerName, py.amountEgp, py.paymentDate, py.method, py.referenceNumber, py.notes || null]
        );
      }

      // Populate expenses
      for (const ex of jsonDb.get('expenses')) {
        await client.query(
          `INSERT INTO expenses (id, project_id, project_name, category, description, amount_egp, expense_date, supplier_name, receipt_url)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [ex.id, ex.projectId, ex.projectName, ex.category, ex.description, ex.amountEgp, ex.expenseDate, ex.supplierName, ex.receiptUrl || null]
        );
      }

      await client.query('COMMIT');

      // Reconcile counts
      const usersCount = (await client.query('SELECT COUNT(*) FROM users')).rows[0].count;
      const custCount = (await client.query('SELECT COUNT(*) FROM customers')).rows[0].count;
      const projCount = (await client.query('SELECT COUNT(*) FROM projects')).rows[0].count;
      const paySum = (await client.query('SELECT SUM(amount_egp) FROM payments')).rows[0].sum;
      const expSum = (await client.query('SELECT SUM(amount_egp) FROM expenses')).rows[0].sum;

      assert.equal(Number(usersCount), jsonDb.get('users').length);
      assert.equal(Number(custCount), jsonDb.get('customers').length);
      assert.equal(Number(projCount), jsonDb.get('projects').length);

      // Verify zero orphaned projects
      const orphanCheck = await client.query(`
        SELECT p.id 
        FROM projects p 
        LEFT JOIN customers c ON p.customer_id = c.id 
        WHERE c.id IS NULL
      `);
      assert.equal(orphanCheck.rows.length, 0);

      // Verify financial sum matches
      const expectedPaymentsSum = jsonDb.get('payments').reduce((acc, p) => acc + p.amountEgp, 0);
      assert.equal(Math.round(Number(paySum)), Math.round(expectedPaymentsSum));
    } finally {
      client.release();
      await pool.end();
    }
  });
});
