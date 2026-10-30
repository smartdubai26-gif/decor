-- ============================================================================
-- ARTISAN & SPACE — PRODUCTION RELATIONAL DATABASE SCHEMA (PostgreSQL)
-- ============================================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    salt VARCHAR(128) NOT NULL,
    role VARCHAR(32) NOT NULL CHECK (role IN ('super_admin', 'manager', 'sales', 'pm', 'accountant', 'execution', 'client')),
    phone VARCHAR(64) NOT NULL,
    department VARCHAR(128),
    avatar VARCHAR(512),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 2. Customers Table
CREATE TABLE IF NOT EXISTS customers (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(64) NOT NULL,
    email VARCHAR(255),
    address TEXT NOT NULL,
    company_name VARCHAR(255),
    total_projects INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);

-- 3. Leads Table
CREATE TABLE IF NOT EXISTS leads (
    id VARCHAR(64) PRIMARY KEY,
    customer_name VARCHAR(255) NOT NULL,
    phone VARCHAR(64) NOT NULL,
    email VARCHAR(255),
    preferred_contact VARCHAR(32) DEFAULT 'whatsapp' CHECK (preferred_contact IN ('phone', 'whatsapp', 'email')),
    project_type VARCHAR(64) NOT NULL,
    location VARCHAR(255) NOT NULL,
    approx_area_sqm NUMERIC(10, 2) NOT NULL CHECK (approx_area_sqm > 0),
    estimated_budget_egp NUMERIC(14, 2) NOT NULL CHECK (estimated_budget_egp >= 0),
    scope TEXT,
    expected_start_date DATE,
    status VARCHAR(32) DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'site_visit', 'quotation_prepared', 'negotiation', 'won', 'lost')),
    priority VARCHAR(16) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'vip')),
    assigned_to_user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    next_follow_up_date DATE,
    loss_reason TEXT,
    notes JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_leads_phone ON leads(phone);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_assigned ON leads(assigned_to_user_id);

-- 4. Projects Table
CREATE TABLE IF NOT EXISTS projects (
    id VARCHAR(64) PRIMARY KEY,
    project_number VARCHAR(64) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    customer_id VARCHAR(64) NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    customer_name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    scope TEXT,
    project_manager_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    start_date DATE NOT NULL,
    target_completion_date DATE NOT NULL,
    status VARCHAR(32) DEFAULT 'planned' CHECK (status IN ('planned', 'awaiting_start', 'in_progress', 'on_hold', 'completed', 'cancelled')),
    contract_value_egp NUMERIC(14, 2) NOT NULL DEFAULT 0,
    actual_expenses_egp NUMERIC(14, 2) NOT NULL DEFAULT 0,
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100),
    notes TEXT,
    image_cover VARCHAR(512),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_projects_customer ON projects(customer_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_pm ON projects(project_manager_id);

-- 5. Tasks Table
CREATE TABLE IF NOT EXISTS project_tasks (
    id VARCHAR(64) PRIMARY KEY,
    project_id VARCHAR(64) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    assigned_to VARCHAR(128) NOT NULL,
    due_date DATE NOT NULL,
    status VARCHAR(32) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
    priority VARCHAR(16) DEFAULT 'normal' CHECK (priority IN ('normal', 'high', 'urgent')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tasks_project ON project_tasks(project_id);

-- 6. Quotations Table
CREATE TABLE IF NOT EXISTS quotations (
    id VARCHAR(64) PRIMARY KEY,
    quotation_number VARCHAR(64) UNIQUE NOT NULL,
    lead_id VARCHAR(64) REFERENCES leads(id) ON DELETE SET NULL,
    customer_id VARCHAR(64) NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    issue_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    currency VARCHAR(8) DEFAULT 'EGP' CHECK (currency IN ('EGP', 'USD', 'EUR')),
    status VARCHAR(32) DEFAULT 'draft' CHECK (status IN ('draft', 'pending_approval', 'sent', 'accepted', 'rejected', 'expired')),
    current_version_index INTEGER DEFAULT 0,
    payment_terms TEXT NOT NULL,
    notes TEXT,
    prepared_by VARCHAR(128) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_quotations_customer ON quotations(customer_id);
CREATE INDEX IF NOT EXISTS idx_quotations_status ON quotations(status);

-- 7. Quotation Versions Table (Immutable Snapshots)
CREATE TABLE IF NOT EXISTS quotation_versions (
    id VARCHAR(64) PRIMARY KEY,
    quotation_id VARCHAR(64) NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    subtotal_egp NUMERIC(14, 2) NOT NULL,
    tax_rate NUMERIC(5, 2) NOT NULL DEFAULT 14.00,
    tax_amount_egp NUMERIC(14, 2) NOT NULL,
    discount_egp NUMERIC(14, 2) NOT NULL DEFAULT 0,
    grand_total_egp NUMERIC(14, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(quotation_id, version_number)
);

-- 8. Quotation Items Table
CREATE TABLE IF NOT EXISTS quotation_items (
    id VARCHAR(64) PRIMARY KEY,
    version_id VARCHAR(64) NOT NULL REFERENCES quotation_versions(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity NUMERIC(10, 2) NOT NULL CHECK (quantity > 0),
    unit VARCHAR(32) NOT NULL,
    unit_price_egp NUMERIC(14, 2) NOT NULL CHECK (unit_price_egp >= 0),
    discount_percentage NUMERIC(5, 2) NOT NULL DEFAULT 0 CHECK (discount_percentage BETWEEN 0 AND 100),
    total_egp NUMERIC(14, 2) NOT NULL
);

-- 9. Payments Table
CREATE TABLE IF NOT EXISTS payments (
    id VARCHAR(64) PRIMARY KEY,
    project_id VARCHAR(64) NOT NULL REFERENCES projects(id) ON DELETE RESTRICT,
    project_name VARCHAR(255) NOT NULL,
    customer_id VARCHAR(64) NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    customer_name VARCHAR(255) NOT NULL,
    amount_egp NUMERIC(14, 2) NOT NULL CHECK (amount_egp > 0),
    payment_date DATE NOT NULL,
    method VARCHAR(32) NOT NULL CHECK (method IN ('bank_transfer', 'cash', 'instapay', 'cheque', 'credit_card')),
    reference_number VARCHAR(128) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_payments_project ON payments(project_id);

-- 10. Expenses Table
CREATE TABLE IF NOT EXISTS expenses (
    id VARCHAR(64) PRIMARY KEY,
    project_id VARCHAR(64) NOT NULL REFERENCES projects(id) ON DELETE RESTRICT,
    project_name VARCHAR(255) NOT NULL,
    category VARCHAR(32) NOT NULL CHECK (category IN ('materials', 'labor', 'subcontractor', 'permits', 'transport', 'design')),
    description TEXT NOT NULL,
    amount_egp NUMERIC(14, 2) NOT NULL CHECK (amount_egp > 0),
    expense_date DATE NOT NULL,
    supplier_name VARCHAR(255) NOT NULL,
    receipt_url VARCHAR(512),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_expenses_project ON expenses(project_id);

-- 11. Idempotency Keys Table (Scoped by principal, endpoint, and request hash)
CREATE TABLE IF NOT EXISTS idempotency_keys (
    principal_id VARCHAR(64) NOT NULL,
    endpoint VARCHAR(255) NOT NULL,
    key VARCHAR(255) NOT NULL,
    request_hash VARCHAR(64) NOT NULL,
    response_code INTEGER NOT NULL,
    response_body JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (principal_id, endpoint, key)
);

-- 12. Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    user_name VARCHAR(128) NOT NULL,
    action VARCHAR(128) NOT NULL,
    details TEXT NOT NULL,
    ip_address VARCHAR(64),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_logs(timestamp);
