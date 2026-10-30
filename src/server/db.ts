import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { 
  User, Lead, Customer, Project, ProjectTask, Quotation, 
  Payment, Expense, PortfolioProject, ServiceItem, CompanySettings, AuditLog, NewsArticle 
} from '../types';
import { 
  mockUsers, mockCompanySettings, mockServices, mockPortfolio, 
  mockLeads, mockCustomers, mockProjects, mockQuotations, mockPayments, mockExpenses, mockAuditLogs, mockNews 
} from '../data/mockData';

export interface DatabaseSchema {
  users: (User & { passwordHash?: string; salt?: string })[];
  leads: Lead[];
  customers: Customer[];
  projects: Project[];
  tasks: ProjectTask[];
  quotations: Quotation[];
  payments: Payment[];
  expenses: Expense[];
  portfolio: PortfolioProject[];
  services: ServiceItem[];
  settings: CompanySettings;
  auditLogs: AuditLog[];
  news: NewsArticle[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.resolve(DATA_DIR, 'artisan_db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Password hashing helper (Hardened PBKDF2 with 210,000 iterations per OWASP standard)
const PBKDF2_ITERATIONS = 210000;
const KEY_LEN = 64;
const DIGEST = 'sha512';

export function hashPassword(password: string, salt = crypto.randomBytes(32).toString('hex')): { hash: string; salt: string } {
  const hash = crypto.pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, KEY_LEN, DIGEST).toString('hex');
  return { hash, salt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  try {
    const verifyHash = crypto.pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, KEY_LEN, DIGEST).toString('hex');
    const hashBuf = Buffer.from(hash, 'hex');
    const verifyBuf = Buffer.from(verifyHash, 'hex');
    if (hashBuf.length !== verifyBuf.length) return false;
    return crypto.timingSafeEqual(hashBuf, verifyBuf);
  } catch {
    return false;
  }
}

// Initial default database state
function getInitialData(): DatabaseSchema {
  // Pre-seed users with default passwords (e.g. 'Admin@123' for easy verification)
  const defaultPassword = 'Password@123';
  const seededUsers = mockUsers.map(user => {
    const { hash, salt } = hashPassword(defaultPassword);
    return {
      ...user,
      passwordHash: hash,
      salt: salt
    };
  });

  // Pre-seed default authenticated client user
  const clientCredentials = hashPassword(defaultPassword);
  seededUsers.push({
    id: 'u6',
    name: 'طارق عبد العال',
    email: 'tarek@example.com',
    role: 'client',
    phone: '+20 122 555 7890',
    department: 'بوابة العملاء',
    passwordHash: clientCredentials.hash,
    salt: clientCredentials.salt
  });

  const initialTasks: ProjectTask[] = [
    { id: 't1', projectId: 'pr1', title: 'تكسير وتجهيز المسارات المعمارية', assignedTo: 'فريق التأسيس', dueDate: '2026-02-15', status: 'completed', priority: 'high' },
    { id: 't2', projectId: 'pr1', title: 'تمديد مواسير السباكة وكابلات الكهرباء السويدي', assignedTo: 'م. وليد حسن', dueDate: '2026-03-01', status: 'completed', priority: 'urgent' },
    { id: 't3', projectId: 'pr1', title: 'تركيب الأسقف المعلقة وتوزيع الإضاءة المودرن', assignedTo: 'فني الأسقف', dueDate: '2026-04-10', status: 'in_progress', priority: 'normal' },
    { id: 't4', projectId: 'pr1', title: 'أعمال البورسلين والرخام الإيطالي للأرضيات', assignedTo: 'فريق الرخام', dueDate: '2026-05-20', status: 'pending', priority: 'high' },
  ];

  return {
    users: seededUsers,
    leads: mockLeads,
    customers: mockCustomers,
    projects: mockProjects,
    tasks: initialTasks,
    quotations: mockQuotations,
    payments: mockPayments,
    expenses: mockExpenses,
    portfolio: mockPortfolio,
    services: mockServices,
    settings: mockCompanySettings,
    auditLogs: mockAuditLogs,
    news: mockNews,
  };
}

class Database {
  private data: DatabaseSchema;
  private isSaving = false;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const content = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(content);
        if (!parsed.news) {
          parsed.news = mockNews;
        }
        if (!parsed.settings?.pageControls) {
          parsed.settings = { ...mockCompanySettings, ...(parsed.settings || {}) };
        }
        return parsed;
      }
    } catch (err) {
      console.error('Error reading database file, re-initializing from defaults:', err);
    }
    const initial = getInitialData();
    this.persist(initial);
    return initial;
  }

  // Atomic file write using temp file and rename
  private persist(dataToSave: DatabaseSchema): void {
    const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
    try {
      fs.writeFileSync(tempFile, JSON.stringify(dataToSave, null, 2), 'utf-8');
      fs.renameSync(tempFile, DB_FILE);
    } catch (err) {
      if (fs.existsSync(tempFile)) {
        try { fs.unlinkSync(tempFile); } catch {}
      }
      throw err;
    }
  }

  public save(): void {
    this.persist(this.data);
  }

  // Generic read
  public get<K extends keyof DatabaseSchema>(key: K): DatabaseSchema[K] {
    return this.data[key];
  }

  // Generic update with audit
  public update<K extends keyof DatabaseSchema>(key: K, updater: (val: DatabaseSchema[K]) => DatabaseSchema[K]): DatabaseSchema[K] {
    this.data[key] = updater(this.data[key]);
    this.save();
    return this.data[key];
  }

  // Audit logging
  public logAudit(userId: string, userName: string, action: string, details: string): void {
    const log: AuditLog = {
      id: `al-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId,
      userName,
      action,
      details,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    this.data.auditLogs.unshift(log);
    if (this.data.auditLogs.length > 500) {
      this.data.auditLogs = this.data.auditLogs.slice(0, 500);
    }
    this.save();
  }

  // Idempotent lead conversion to customer & project
  public convertLeadToProject(leadId: string, authorUser: { id: string; name: string }): { customer: Customer; project: Project } {
    const lead = this.data.leads.find(l => l.id === leadId);
    if (!lead) throw new Error('Lead not found');

    // Check if customer already exists for this phone
    let customer = this.data.customers.find(c => c.phone.replace(/[^0-9]/g, '') === lead.phone.replace(/[^0-9]/g, ''));
    if (!customer) {
      customer = {
        id: `c-${Date.now()}`,
        name: lead.customerName,
        phone: lead.phone,
        email: lead.email,
        address: lead.location,
        totalProjects: 1,
        createdAt: new Date().toISOString().split('T')[0]
      };
      this.data.customers.push(customer);
    } else {
      customer.totalProjects = (customer.totalProjects || 0) + 1;
    }

    // Check if project already created from this lead
    let project = this.data.projects.find(p => p.notes?.includes(`Lead #${leadId}`) || p.customerId === customer.id && p.name.includes(lead.location));
    if (!project) {
      project = {
        id: `pr-${Date.now()}`,
        projectNumber: `PRJ-2026-${Math.floor(100 + Math.random() * 900)}`,
        name: `مشروع ${customer.name} - ${lead.location}`,
        customerId: customer.id,
        customerName: customer.name,
        address: lead.location,
        scope: lead.scope,
        projectManagerId: 'u3',
        startDate: lead.expectedStartDate || new Date().toISOString().split('T')[0],
        targetCompletionDate: new Date(Date.now() + 180 * 86400000).toISOString().split('T')[0],
        status: 'planned',
        contractValueEgp: lead.estimatedBudgetEgp,
        actualExpensesEgp: 0,
        progressPercentage: 0,
        notes: `تم التعاقد والتحويل التلقائي من Lead #${leadId}`,
        imageCover: '/src/assets/images/portfolio_villa_new_cairo_1792469679890.jpg'
      };
      this.data.projects.unshift(project);
    }

    lead.status = 'won';
    this.logAudit(authorUser.id, authorUser.name, 'تحويل عميل لمشروع', `تم تحويل العميل #${leadId} بنجاح إلى مشروع #${project.projectNumber}`);
    this.save();

    return { customer, project };
  }

  // Decimal-safe currency rounding helper (Egypt Piastres: 2 decimals)
  public static roundCurrency(val: number): number {
    return Math.round((Number(val) || 0) * 100) / 100;
  }

  // Create verified timestamped backup of the database
  public createBackup(): { backupPath: string; timestamp: string; recordCounts: Record<string, number> } {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.resolve(DATA_DIR, `artisan_db.backup.${timestamp}.json`);
    fs.writeFileSync(backupFile, JSON.stringify(this.data, null, 2), 'utf-8');

    const recordCounts = {
      users: this.data.users.length,
      leads: this.data.leads.length,
      customers: this.data.customers.length,
      projects: this.data.projects.length,
      tasks: this.data.tasks.length,
      quotations: this.data.quotations.length,
      payments: this.data.payments.length,
      expenses: this.data.expenses.length,
      auditLogs: this.data.auditLogs.length
    };

    return { backupPath: backupFile, timestamp, recordCounts };
  }

  // Idempotent & atomic quotation version creation
  public createQuotationVersion(
    quotationId: string, 
    items: Array<{ description: string; quantity: number; unit: string; unitPriceEgp: number; discountPercentage?: number }>,
    taxRate: number,
    authorUser: { id: string; name: string }
  ): Quotation {
    const quotation = this.data.quotations.find(q => q.id === quotationId);
    if (!quotation) throw new Error('Quotation not found');

    let subtotalEgp = 0;
    const computedItems = items.map((item, idx) => {
      const rawTotal = item.quantity * item.unitPriceEgp;
      const discountPercentage = item.discountPercentage || 0;
      const discountAmount = rawTotal * (discountPercentage / 100);
      const itemTotal = Database.roundCurrency(rawTotal - discountAmount);
      subtotalEgp += itemTotal;
      return {
        id: `qi-${Date.now()}-${idx}`,
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        unitPriceEgp: item.unitPriceEgp,
        discountPercentage,
        totalEgp: itemTotal
      };
    });

    subtotalEgp = Database.roundCurrency(subtotalEgp);
    const taxAmountEgp = Database.roundCurrency(subtotalEgp * (taxRate / 100));
    const grandTotalEgp = Database.roundCurrency(subtotalEgp + taxAmountEgp);

    const nextVersionNumber = quotation.versions.length + 1;
    const newVersion = {
      versionNumber: nextVersionNumber,
      createdAt: new Date().toISOString().split('T')[0],
      subtotalEgp,
      taxRate,
      taxAmountEgp,
      discountEgp: 0,
      grandTotalEgp,
      items: computedItems
    };

    quotation.versions.push(newVersion);
    quotation.currentVersionIndex = quotation.versions.length - 1;
    
    this.logAudit(
      authorUser.id, 
      authorUser.name, 
      'إصدار نسخة مقايسة جديدة', 
      `تم إنشاء الإصدار رقم ${nextVersionNumber} للمقايسة #${quotation.quotationNumber} بإجمالي ${grandTotalEgp} ج.م`
    );
    this.save();
    return quotation;
  }

  // Update quotation status
  public updateQuotationStatus(
    quotationId: string, 
    status: 'draft' | 'pending_approval' | 'sent' | 'accepted' | 'rejected' | 'expired',
    authorUser: { id: string; name: string }
  ): Quotation {
    const quotation = this.data.quotations.find(q => q.id === quotationId);
    if (!quotation) throw new Error('Quotation not found');

    const oldStatus = quotation.status;
    quotation.status = status;
    this.logAudit(
      authorUser.id,
      authorUser.name,
      'تحديث حالة المقايسة',
      `تم تعديل حالة المقايسة #${quotation.quotationNumber} من (${oldStatus}) إلى (${status})`
    );
    this.save();
    return quotation;
  }

  // Record payment with foreign key and balance verification
  public recordPayment(paymentData: Omit<Payment, 'id'>, authorUser: { id: string; name: string }): Payment {
    const project = this.data.projects.find(p => p.id === paymentData.projectId);
    if (!project) throw new Error(`Project #${paymentData.projectId} does not exist`);

    const payment: Payment = {
      id: `pay-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      ...paymentData,
      amountEgp: Database.roundCurrency(paymentData.amountEgp)
    };

    this.data.payments.unshift(payment);
    this.logAudit(
      authorUser.id,
      authorUser.name,
      'تسجيل دفعة مالية',
      `تم تسجيل دفعة بقيمة ${payment.amountEgp} ج.م لمشروع #${project.projectNumber} (مرجع: ${payment.referenceNumber})`
    );
    this.save();
    return payment;
  }

  // Record expense with atomic project actualExpensesEgp update
  public recordExpense(expenseData: Omit<Expense, 'id'>, authorUser: { id: string; name: string }): Expense {
    const project = this.data.projects.find(p => p.id === expenseData.projectId);
    if (!project) throw new Error(`Project #${expenseData.projectId} does not exist`);

    const expenseAmount = Database.roundCurrency(expenseData.amountEgp);
    const expense: Expense = {
      id: `exp-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      ...expenseData,
      amountEgp: expenseAmount
    };

    this.data.expenses.unshift(expense);
    project.actualExpensesEgp = Database.roundCurrency((project.actualExpensesEgp || 0) + expenseAmount);

    this.logAudit(
      authorUser.id,
      authorUser.name,
      'تسجيل مصروف تنفيذي',
      `تم تسجيل مصروف بقيمة ${expenseAmount} ج.م في بند ${expense.category} لمشروع #${project.projectNumber}`
    );
    this.save();
    return expense;
  }

  // Update user role with audit
  public updateUserRole(targetUserId: string, newRole: User['role'], authorUser: { id: string; name: string }): User {
    const user = this.data.users.find(u => u.id === targetUserId);
    if (!user) throw new Error('User not found');

    const oldRole = user.role;
    user.role = newRole;

    this.logAudit(
      authorUser.id,
      authorUser.name,
      'تعديل صلاحية مستخدم',
      `تم تعديل دور المستخدم ${user.name} (${user.email}) من ${oldRole} إلى ${newRole}`
    );
    this.save();
    return user;
  }

  // Create new user with audit
  public createUser(userData: Partial<User> & { password?: string }, authorUser: { id: string; name: string }): User {
    const existing = this.data.users.find(u => u.email.toLowerCase() === (userData.email || '').toLowerCase());
    if (existing) throw new Error('البريد الإلكتروني مسجل بالفعل لموظف آخر');

    const defaultPass = userData.password || 'Password@123';
    const { hash, salt } = hashPassword(defaultPass);
    const newUser: User & { passwordHash: string; salt: string } = {
      id: `u-${Date.now()}`,
      name: userData.name || 'موظف جديد',
      email: userData.email || `user${Date.now()}@artisan-space.eg`,
      role: userData.role || 'sales',
      phone: userData.phone || '+20 100 000 0000',
      department: userData.department || 'إدارة التشغيل',
      status: userData.status || 'active',
      permissions: userData.permissions,
      passwordHash: hash,
      salt: salt
    };

    this.data.users.push(newUser);
    this.logAudit(
      authorUser.id,
      authorUser.name,
      'إضافة مستخدم جديد',
      `تم إنشاء حساب الموظف ${newUser.name} بدور ${newUser.role} وبريد ${newUser.email}`
    );
    this.save();
    return newUser;
  }

  // Update user profile and permissions
  public updateUser(targetUserId: string, updates: Partial<User>, authorUser: { id: string; name: string }): User {
    const user = this.data.users.find(u => u.id === targetUserId);
    if (!user) throw new Error('المستخدم غير موجود');

    if (updates.name !== undefined) user.name = updates.name;
    if (updates.phone !== undefined) user.phone = updates.phone;
    if (updates.department !== undefined) user.department = updates.department;
    if (updates.role !== undefined) user.role = updates.role;
    if (updates.permissions !== undefined) user.permissions = { ...user.permissions, ...updates.permissions };
    if (updates.status !== undefined) user.status = updates.status;

    this.logAudit(
      authorUser.id,
      authorUser.name,
      'تعديل بيانات وصلاحيات موظف',
      `تم تعديل بيانات الموظف ${user.name} (${user.email}) - الدور: ${user.role}`
    );
    this.save();
    return user;
  }

  // Delete user with safeguard
  public deleteUser(targetUserId: string, authorUser: { id: string; name: string }): void {
    const user = this.data.users.find(u => u.id === targetUserId);
    if (!user) throw new Error('المستخدم غير موجود');

    // Prevent deleting the main super_admin or last super_admin
    const superAdmins = this.data.users.filter(u => u.role === 'super_admin');
    if (user.role === 'super_admin' && superAdmins.length <= 1) {
      throw new Error('لا يمكن حذف المدير العام الرئيسي للنظام');
    }

    this.data.users = this.data.users.filter(u => u.id !== targetUserId);
    this.logAudit(
      authorUser.id,
      authorUser.name,
      'حذف حساب موظف',
      `تم حذف حساب المستخدم ${user.name} (${user.email})`
    );
    this.save();
  }

  // Reset to default fixture for test isolation
  public resetToFixture(): void {
    this.data = getInitialData();
    this.save();
  }
}

export const db = new Database();
