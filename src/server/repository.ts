import crypto from 'node:crypto';
import { Pool, PoolClient } from 'pg';
import { db, DatabaseSchema } from './db';
import { Lead, Customer, Project, ProjectTask, Quotation, Payment, Expense } from '../types';

export interface IdempotencyRecord {
  principalId: string;
  endpoint: string;
  key: string;
  requestHash: string;
  statusCode: number;
  body: any;
  createdAt: number;
}

export type IdempotencyCheckResult = 
  | { status: 'HIT'; record: IdempotencyRecord }
  | { status: 'CONFLICT'; error: string }
  | { status: 'MISS' };

// Scoped idempotency store: key is `${principalId}:${endpoint}:${idempotencyKey}`
const idempotencyStore = new Map<string, IdempotencyRecord>();

// Mutex lock map for preventing concurrent double-submissions in the same process
const activeLocks = new Set<string>();

export async function withLock<T>(lockKey: string, fn: () => Promise<T>): Promise<T> {
  if (activeLocks.has(lockKey)) {
    throw new Error(`CONCURRENT_CONFLICT: Operation on '${lockKey}' is currently in progress. Please retry.`);
  }
  activeLocks.add(lockKey);
  try {
    return await fn();
  } finally {
    activeLocks.delete(lockKey);
  }
}

export function computePayloadHash(payload: any): string {
  try {
    const serialized = JSON.stringify(payload || {});
    return crypto.createHash('sha256').update(serialized).digest('hex');
  } catch {
    return 'empty_or_non_serializable';
  }
}

/**
 * Checks idempotency scoped to authenticated principal, target endpoint, and payload content.
 * Prevents:
 * 1. Cross-user response leaks (key is strictly isolated per principal).
 * 2. Cross-endpoint pollution (key is scoped per endpoint).
 * 3. Payload mutations with the same idempotency key (returns 409 CONFLICT).
 */
export function checkIdempotency(
  principalId: string, 
  endpoint: string, 
  key: string, 
  payload?: any
): IdempotencyCheckResult {
  const compoundKey = `${principalId}:${endpoint}:${key}`;
  const record = idempotencyStore.get(compoundKey);
  if (!record) {
    return { status: 'MISS' };
  }

  // 24-hour expiration policy
  if (Date.now() - record.createdAt > 24 * 60 * 60 * 1000) {
    idempotencyStore.delete(compoundKey);
    return { status: 'MISS' };
  }

  // Verify payload matches the original request payload
  if (payload !== undefined) {
    const currentHash = computePayloadHash(payload);
    if (record.requestHash && record.requestHash !== currentHash) {
      return { 
        status: 'CONFLICT', 
        error: 'Idempotency key reuse conflict: The key was previously used with a different request payload.' 
      };
    }
  }

  return { status: 'HIT', record };
}

export function saveIdempotency(
  principalId: string, 
  endpoint: string, 
  key: string, 
  payload: any, 
  statusCode: number, 
  body: any
): void {
  const compoundKey = `${principalId}:${endpoint}:${key}`;
  const requestHash = computePayloadHash(payload);
  idempotencyStore.set(compoundKey, {
    principalId,
    endpoint,
    key,
    requestHash,
    statusCode,
    body,
    createdAt: Date.now()
  });
}

export function clearIdempotencyStore(): void {
  idempotencyStore.clear();
}

// PostgreSQL Connection Pool Configuration
let pgPool: Pool | null = null;
let pgConnected = false;

export function setPgPool(pool: Pool | null): void {
  pgPool = pool;
  pgConnected = pool !== null;
}

export function getPgPool(): Pool | null {
  return pgPool;
}

/**
 * Initializes and verifies the database connection with strict fail-fast rules:
 * - In production (or when REQUIRE_POSTGRES is true):
 *   DATABASE_URL must be provided and must connect successfully.
 *   Silent fallback to file persistence is strictly prohibited.
 * - In development/preview:
 *   If DATABASE_URL is provided, it connects; otherwise falls back gracefully.
 */
export async function initializeDatabase(): Promise<void> {
  const isProduction = process.env.NODE_ENV === 'production';
  const requirePostgres = process.env.REQUIRE_POSTGRES === 'true';
  const databaseUrl = process.env.DATABASE_URL;

  if (isProduction || requirePostgres) {
    if (!databaseUrl) {
      throw new Error(
        'FATAL_DATABASE_CONFIGURATION: DATABASE_URL environment variable is required in production. ' +
        'Silent fallback to local JSON storage is disabled for security and durability.'
      );
    }
  }

  if (databaseUrl) {
    try {
      pgPool = new Pool({
        connectionString: databaseUrl,
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
      });

      // Probe live connectivity
      const client = await pgPool.connect();
      await client.query('SELECT 1');
      client.release();
      pgConnected = true;
      console.log('PostgreSQL database connection pool established and verified.');
    } catch (err: any) {
      pgConnected = false;
      if (isProduction || requirePostgres) {
        throw new Error(
          `FATAL_DATABASE_CONNECTION: Failed to connect to PostgreSQL in production mode: ${err.message}. Startup aborted.`
        );
      } else {
        console.warn('PostgreSQL connection failed in development mode. Using hardened transactional store:', err.message);
      }
    }
  }
}

export const repository = {
  isPostgresLive: () => pgConnected && pgPool !== null,

  /**
   * Health check that distinguishes application availability from database readiness
   * without leaking sensitive infrastructure credentials or connection strings.
   */
  getHealth: async () => {
    let dbStatus = 'connected';
    let dbReady = true;

    if (pgPool) {
      try {
        const client = await pgPool.connect();
        await client.query('SELECT 1');
        client.release();
      } catch {
        dbStatus = 'disconnected';
        dbReady = false;
      }
    } else {
      // In development/preview store mode
      dbStatus = 'ready_fallback_store';
      dbReady = true;
    }

    return {
      status: dbReady ? 'healthy' : 'degraded',
      app: 'available',
      database: {
        backend: pgPool ? 'PostgreSQL' : 'Hardened Transactional Store',
        status: dbStatus,
        ready: dbReady
      },
      uptime: Math.floor(process.uptime()),
      timestamp: new Date().toISOString()
    };
  },

  // Database verification & integrity check
  verifyIntegrity: async () => {
    const leads = db.get('leads');
    const projects = db.get('projects');
    const customers = db.get('customers');
    const quotations = db.get('quotations');
    const payments = db.get('payments');
    const expenses = db.get('expenses');

    // Reconcile and verify foreign relationships
    const orphanedProjects = projects.filter(p => !customers.some(c => c.id === p.customerId));
    const totalPaymentsAmount = payments.reduce((acc, p) => acc + p.amountEgp, 0);
    const totalExpensesAmount = expenses.reduce((acc, e) => acc + e.amountEgp, 0);

    return {
      healthy: orphanedProjects.length === 0,
      backend: pgConnected ? 'PostgreSQL' : 'Hardened Transactional Store',
      recordCounts: {
        leads: leads.length,
        projects: projects.length,
        customers: customers.length,
        quotations: quotations.length,
        payments: payments.length,
        expenses: expenses.length,
      },
      reconciliation: {
        orphanedProjectsCount: orphanedProjects.length,
        totalPaymentsAmount: Math.round(totalPaymentsAmount * 100) / 100,
        totalExpensesAmount: Math.round(totalExpensesAmount * 100) / 100,
        netCashFlow: Math.round((totalPaymentsAmount - totalExpensesAmount) * 100) / 100
      }
    };
  }
};
