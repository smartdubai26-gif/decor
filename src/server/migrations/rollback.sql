-- ============================================================================
-- ARTISAN & SPACE — DATABASE ROLLBACK SCRIPT (PostgreSQL)
-- Reverts initial schema migration 001 in reverse foreign-key dependency order
-- ============================================================================

BEGIN;

-- 1. Drop operational dependent tables
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS idempotency_keys CASCADE;
DROP TABLE IF EXISTS expenses CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS quotation_items CASCADE;
DROP TABLE IF EXISTS quotation_versions CASCADE;
DROP TABLE IF EXISTS quotations CASCADE;
DROP TABLE IF EXISTS project_tasks CASCADE;

-- 2. Drop core entity tables
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS leads CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 3. Drop extensions (optional)
-- DROP EXTENSION IF EXISTS "uuid-ossp";

COMMIT;
