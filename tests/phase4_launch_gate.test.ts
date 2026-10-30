import { test, describe, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { apiRouter } from '../src/server/routes';
import { db } from '../src/server/db';
import { createSession } from '../src/server/auth';
import { initializeDatabase, repository } from '../src/server/repository';

describe('Phase 4 — End-to-End Security Verification & Production Launch Gate', () => {
  let server: any;
  let baseUrl: string;
  let superAdminToken: string;
  let salesToken1: string;
  let salesToken2: string;
  let pmToken: string;
  let accountantToken: string;
  let clientToken1: string;
  let clientToken2: string;

  before(async () => {
    const app = express();
    app.use(express.json());
    app.use('/api', apiRouter);

    await new Promise<void>(resolve => {
      server = app.listen(0, '127.0.0.1', () => {
        const port = (server.address() as any).port;
        baseUrl = `http://127.0.0.1:${port}`;
        resolve();
      });
    });
  });

  after(async () => {
    if (server) {
      await new Promise(resolve => server.close(resolve));
    }
  });

  async function request(
    method: string,
    url: string,
    options: { headers?: Record<string, string>; body?: any } = {}
  ): Promise<{ status: number; body: any; headers: Headers }> {
    const fetchOptions: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Connection': 'close',
        ...(options.headers || {})
      }
    };
    if (options.body) {
      fetchOptions.body = JSON.stringify(options.body);
    }
    const res = await fetch(`${baseUrl}${url}`, fetchOptions);
    let body: any = null;
    try {
      body = await res.json();
    } catch {
      body = null;
    }
    return { status: res.status, body, headers: res.headers };
  }

  beforeEach(() => {
    db.resetToFixture();

    // Ensure extra test users exist in database user store
    db.update('users', users => [
      ...users,
      {
        id: 'u_sales2', name: 'كريم مجدي', email: 'karim@artisan-space.com',
        role: 'sales' as const, phone: '+20 105 888 9999', isActive: true, passwordHash: '', salt: ''
      },
      {
        id: 'u_client1', name: 'أ. هالة فؤاد', email: 'hala.f@example.com',
        role: 'client' as const, phone: '+20 100 888 9911', isActive: true, passwordHash: '', salt: ''
      },
      {
        id: 'u_client2', name: 'منير صادق', email: 'mounir@example.com',
        role: 'client' as const, phone: '+20 111 888 9999', isActive: true, passwordHash: '', salt: ''
      }
    ]);

    // Setup authenticated sessions
    // u1: super_admin
    superAdminToken = createSession({
      id: 'u1', name: 'أحمد محمود', email: 'admin@artisan-space.com',
      role: 'super_admin', phone: '+20 100 123 4567'
    }).token;

    // u2: sales 1
    salesToken1 = createSession({
      id: 'u2', name: 'سارة إبراهيم', email: 'sara@artisan-space.com',
      role: 'sales', phone: '+20 101 234 5678'
    }).token;

    // u_sales2: sales 2
    salesToken2 = createSession({
      id: 'u_sales2', name: 'كريم مجدي', email: 'karim@artisan-space.com',
      role: 'sales', phone: '+20 105 888 9999'
    }).token;

    // u3: pm
    pmToken = createSession({
      id: 'u3', name: 'م. عمر الشريف', email: 'omar@artisan-space.com',
      role: 'pm', phone: '+20 102 345 6789'
    }).token;

    // u4: accountant
    accountantToken = createSession({
      id: 'u4', name: 'شريف عبد المنعم', email: 'sherif@artisan-space.com',
      role: 'accountant', phone: '+20 103 456 7890'
    }).token;

    // u_client1: client 1 (linked to customer c2 who owns project pr1, phone '+20 100 888 9911')
    clientToken1 = createSession({
      id: 'u_client1', name: 'أ. هالة فؤاد', email: 'hala.f@example.com',
      role: 'client', phone: '+20 100 888 9911'
    }).token;

    // u_client2: client 2 (different client, phone '+20 111 888 9999')
    clientToken2 = createSession({
      id: 'u_client2', name: 'منير صادق', email: 'mounir@example.com',
      role: 'client', phone: '+20 111 888 9999'
    }).token;
  });

  test('unauthenticated requests to private routes return 401', async () => {
    const endpoints = [
      '/api/projects',
      '/api/leads',
      '/api/quotations',
      '/api/payments',
      '/api/expenses',
      '/api/users',
      '/api/audit-logs'
    ];

    for (const ep of endpoints) {
      const res = await request('GET', ep);
      assert.equal(res.status, 401, `Endpoint ${ep} must require authentication`);
    }
  });

  test('client IDOR isolation: client cannot read another client projects or quotations', async () => {
    // Client 2 attempts to fetch Project 1 (belonging to customer c1 / Client 1)
    const projectRes = await request('GET', '/api/projects/pr1', {
      headers: { Authorization: `Bearer ${clientToken2}` }
    });
    assert.equal(projectRes.status, 403, 'Client 2 must be forbidden from accessing Project 1');

    // Client 1 fetching their own project succeeds
    const ownProjectRes = await request('GET', '/api/projects/pr1', {
      headers: { Authorization: `Bearer ${clientToken1}` }
    });
    assert.equal(ownProjectRes.status, 200);
    assert.equal(ownProjectRes.body.id, 'pr1');

    // Client 2 attempts to fetch Quotation 1 (belonging to customer c1)
    const quoteRes = await request('GET', '/api/quotations/q1', {
      headers: { Authorization: `Bearer ${clientToken2}` }
    });
    assert.equal(quoteRes.status, 403, 'Client 2 must be forbidden from accessing Quotation 1');

    // Client 2 attempts to fetch Customer 1 profile
    const custRes = await request('GET', '/api/customers/c1', {
      headers: { Authorization: `Bearer ${clientToken2}` }
    });
    assert.equal(custRes.status, 403, 'Client 2 must be forbidden from accessing Customer 1 profile');
  });

  test('sales rep cannot modify or convert another sales rep deals', async () => {
    // Lead l1 is assigned to u2 (Sara)
    // Sales rep 2 (Karim) attempts to modify lead l1
    const patchRes = await request('PATCH', '/api/leads/l1', {
      headers: { Authorization: `Bearer ${salesToken2}` },
      body: { location: 'New Location' }
    });
    assert.equal(patchRes.status, 403, 'Sales rep cannot modify another rep lead');

    // Sales rep 2 attempts to convert lead l1 to a project
    const convertRes = await request('POST', '/api/leads/l1/convert', {
      headers: { Authorization: `Bearer ${salesToken2}` }
    });
    assert.equal(convertRes.status, 403, 'Sales rep cannot convert another rep lead');

    // Assigned sales rep (Sara) can update their own lead
    const ownLeadRes = await request('PATCH', '/api/leads/l1', {
      headers: { Authorization: `Bearer ${salesToken1}` },
      body: { location: 'القطامية ديونز - القاهرة الجديدة' }
    });
    assert.equal(ownLeadRes.status, 200);
  });

  test('sales rep cannot access financial ledgers or approve payments', async () => {
    // GET /payments
    const payRes = await request('GET', '/api/payments', {
      headers: { Authorization: `Bearer ${salesToken1}` }
    });
    assert.equal(payRes.status, 403, 'Sales rep cannot access payments');

    // POST /payments
    const postPayRes = await request('POST', '/api/payments', {
      headers: { Authorization: `Bearer ${salesToken1}` },
      body: {
        projectId: 'pr1',
        projectName: 'فيلا لوريف',
        customerName: 'طارق عبد العال',
        amountEgp: 50000,
        method: 'bank_transfer',
        referenceNumber: 'TX-FORBIDDEN'
      }
    });
    assert.equal(postPayRes.status, 403, 'Sales rep cannot record payments');

    // GET /expenses
    const expRes = await request('GET', '/api/expenses', {
      headers: { Authorization: `Bearer ${salesToken1}` }
    });
    assert.equal(expRes.status, 403, 'Sales rep cannot access expenses');
  });

  test('project manager cannot approve quotations or perform administrative actions', async () => {
    // PM attempts to accept/approve quotation status
    const approveRes = await request('PATCH', '/api/quotations/q1/status', {
      headers: { Authorization: `Bearer ${pmToken}` },
      body: { status: 'accepted' }
    });
    assert.equal(approveRes.status, 403, 'PM cannot approve quotations');

    // PM attempts to view users list
    const usersRes = await request('GET', '/api/users', {
      headers: { Authorization: `Bearer ${pmToken}` }
    });
    assert.equal(usersRes.status, 403, 'PM cannot access user administration');

    // PM attempts to change user role
    const roleRes = await request('PATCH', '/api/users/u2/role', {
      headers: { Authorization: `Bearer ${pmToken}` },
      body: { role: 'super_admin' }
    });
    assert.equal(roleRes.status, 403, 'PM cannot alter user roles');

    // PM attempts to trigger database backup
    const backupRes = await request('POST', '/api/system/backup', {
      headers: { Authorization: `Bearer ${pmToken}` }
    });
    assert.equal(backupRes.status, 403, 'PM cannot access system backup');
  });

  test('accountant can record payments but cannot alter design files or user roles', async () => {
    // Accountant records payment successfully
    const payRes = await request('POST', '/api/payments', {
      headers: { Authorization: `Bearer ${accountantToken}` },
      body: {
        projectId: 'pr1',
        projectName: 'فيلا لوريف',
        customerName: 'طارق عبد العال',
        amountEgp: 65000,
        method: 'bank_transfer',
        referenceNumber: 'TX-ACC-65000'
      }
    });
    assert.equal(payRes.status, 201, 'Accountant can record payments');

    // Accountant attempts to add/alter portfolio project
    const portRes = await request('POST', '/api/portfolio', {
      headers: { Authorization: `Bearer ${accountantToken}` },
      body: { title: 'New Interior', category: 'residential', coverImage: 'img.jpg' }
    });
    assert.equal(portRes.status, 403, 'Accountant cannot alter design files/portfolio');

    // Accountant attempts to alter user roles
    const roleRes = await request('PATCH', '/api/users/u2/role', {
      headers: { Authorization: `Bearer ${accountantToken}` },
      body: { role: 'manager' }
    });
    assert.equal(roleRes.status, 403, 'Accountant cannot alter user roles');
  });

  test('audit logs are strictly append-only and cannot be altered or deleted by any role', async () => {
    // Super admin attempts DELETE on /api/audit-logs
    const delRes = await request('DELETE', '/api/audit-logs', {
      headers: { Authorization: `Bearer ${superAdminToken}` }
    });
    assert.equal(delRes.status, 405, 'Audit logs DELETE must return 405 Method Not Allowed');

    // Super admin attempts DELETE on specific log item
    const delItemRes = await request('DELETE', '/api/audit-logs/aud-1', {
      headers: { Authorization: `Bearer ${superAdminToken}` }
    });
    assert.equal(delItemRes.status, 405);

    // Super admin attempts PUT or PATCH on audit logs
    const patchRes = await request('PATCH', '/api/audit-logs/aud-1', {
      headers: { Authorization: `Bearer ${superAdminToken}` },
      body: { action: 'Tampered' }
    });
    assert.equal(patchRes.status, 405);
  });

  test('production fail-fast: fails startup clearly when PostgreSQL is required but DATABASE_URL is missing', async () => {
    const origEnv = process.env.NODE_ENV;
    const origReq = process.env.REQUIRE_POSTGRES;
    const origDb = process.env.DATABASE_URL;

    try {
      process.env.NODE_ENV = 'production';
      delete process.env.DATABASE_URL;

      await assert.rejects(
        async () => {
          await initializeDatabase();
        },
        /FATAL_DATABASE_CONFIGURATION/
      );
    } finally {
      process.env.NODE_ENV = origEnv;
      if (origReq !== undefined) process.env.REQUIRE_POSTGRES = origReq;
      if (origDb !== undefined) process.env.DATABASE_URL = origDb;
    }
  });

  test('health check distinguishes app availability from database readiness without leaking secrets', async () => {
    const health = await repository.getHealth();

    assert.ok(health.status);
    assert.equal(health.app, 'available');
    assert.ok(health.database);
    assert.ok(typeof health.database.ready === 'boolean');
    assert.ok(typeof health.uptime === 'number');

    // Must not leak connection strings or internal credentials
    const serialized = JSON.stringify(health);
    assert.equal(serialized.includes('password'), false);
    assert.equal(serialized.includes('postgres://'), false);
    assert.equal(serialized.includes('secret'), false);
  });
});
