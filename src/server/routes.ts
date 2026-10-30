import { Router, Response } from 'express';
import { z } from 'zod';
import { db, verifyPassword } from './db';
import { 
  requireAuth, requireRole, createSession, destroySession, 
  checkBruteForceLockout, recordFailedLogin, resetFailedLogins, 
  revokeAllUserSessions, AuthenticatedRequest 
} from './auth';
import { checkIdempotency, saveIdempotency, withLock, repository } from './repository';
import { Lead, Customer, Project, ProjectTask, Quotation, Payment, Expense, PortfolioProject, NewsArticle } from '../types';

export const apiRouter = Router();

// In-memory rate limiter for public endpoints
const ipRateLimits = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string, limit = 20, windowMs = 60000): boolean {
  const now = Date.now();
  const entry = ipRateLimits.get(ip);
  if (!entry || now > entry.resetAt) {
    ipRateLimits.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= limit) {
    return false;
  }
  entry.count++;
  return true;
}

// ----------------------------------------------------
// Health Check (Non-disclosing, distinguishes app and database readiness)
// ----------------------------------------------------
apiRouter.get('/health', async (_req, res) => {
  const health = await repository.getHealth();
  const statusCode = health.database.ready ? 200 : 503;
  res.status(statusCode).json(health);
});

// ----------------------------------------------------
// Authentication Endpoints (Hardened)
// ----------------------------------------------------
const loginSchema = z.object({
  email: z.string().email('صيغة البريد الإلكتروني غير صحيحة'),
  password: z.string().min(1, 'كلمة المرور مطلوبة')
});

apiRouter.post('/auth/login', (req, res) => {
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';

  // Rate-limiting brute-force lock check
  const lockout = checkBruteForceLockout(clientIp);
  if (lockout.locked) {
    res.status(429).json({ 
      error: `تم حظر محاولات الدخول مؤقتاً لتكرار المحاولات الخاطئة. يرجى الانتظار ${lockout.remainingSec} ثانية.` 
    });
    return;
  }

  const parseResult = loginSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ error: 'بيانات الدخول غير صحيحة' });
    return;
  }

  const { email, password } = parseResult.data;
  const users = db.get('users');
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

  // Prevent user enumeration: execute a dummy verification if user not found
  if (!user || !user.passwordHash || !user.salt) {
    verifyPassword('dummy_password_for_constant_time', '00'.repeat(64), '00'.repeat(32));
    const result = recordFailedLogin(clientIp);
    res.status(401).json({ 
      error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
      attemptsLeft: result.attemptsLeft 
    });
    return;
  }

  const isValid = verifyPassword(password, user.passwordHash, user.salt);
  if (!isValid) {
    const result = recordFailedLogin(clientIp);
    res.status(401).json({ 
      error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
      attemptsLeft: result.attemptsLeft 
    });
    return;
  }

  // Reset failed login counter on success
  resetFailedLogins(clientIp);

  const session = createSession(user);
  db.logAudit(user.id, user.name, 'تسجيل دخول', 'تم تسجيل الدخول وتوثيق الجلسة بنجاح');
  
  // Set HttpOnly cookie for session security
  res.cookie('artisan_session', session.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000
  });

  res.json({ 
    user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone, department: user.department },
    token: session.token, 
    expiresAt: session.expiresAt 
  });
});

apiRouter.post('/auth/logout', requireAuth, (req: AuthenticatedRequest, res) => {
  if (req.sessionToken) {
    destroySession(req.sessionToken);
  }
  if (req.user) {
    db.logAudit(req.user.id, req.user.name, 'تسجيل خروج', 'تم إنهاء الجلسة بنجاح');
  }
  res.clearCookie('artisan_session');
  res.json({ message: 'تم تسجيل الخروج بنجاح' });
});

apiRouter.get('/auth/me', requireAuth, (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    res.status(401).json({ error: 'غير مصرح' });
    return;
  }
  res.json({ 
    user: { 
      id: req.user.id, 
      name: req.user.name, 
      email: req.user.email, 
      role: req.user.role, 
      phone: req.user.phone, 
      department: req.user.department 
    } 
  });
});

// ----------------------------------------------------
// Public Lead Submission (Request a Quote) with Idempotency
// ----------------------------------------------------
const leadSubmissionSchema = z.object({
  customerName: z.string().min(2, 'الاسم يجب أن يحتوي على حرفين على الأقل').max(100),
  phone: z.string().min(8, 'رقم الهاتف غير صالح').max(20),
  email: z.string().email().optional().or(z.literal('')),
  preferredContact: z.enum(['phone', 'whatsapp', 'email']).default('whatsapp'),
  projectType: z.enum(['residential_villa', 'apartment', 'commercial_office', 'renovation', 'joinery']).default('residential_villa'),
  location: z.string().min(2, 'يرجى تحديد الموقع').max(150),
  approxAreaSqm: z.number().positive().max(10000),
  estimatedBudgetEgp: z.number().nonnegative().max(1000000000),
  scope: z.string().max(2000).optional().default(''),
  expectedStartDate: z.string().max(50).optional().default(''),
  notes: z.array(z.string().max(500)).optional().default([])
});

apiRouter.post('/leads', (req, res) => {
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
  if (!checkRateLimit(clientIp, 15, 60000)) {
    res.status(429).json({ error: 'تم تجاوز الحد المسموح من الطلبات. يرجى المحاولة بعد دقيقة.' });
    return;
  }

  // Scoped Idempotency check
  const idempotencyKey = req.headers['idempotency-key'] as string;
  const principalId = `public:${clientIp}`;
  const endpoint = '/api/leads';
  if (idempotencyKey) {
    const check = checkIdempotency(principalId, endpoint, idempotencyKey, req.body);
    if (check.status === 'HIT') {
      res.status(check.record.statusCode).json(check.record.body);
      return;
    }
    if (check.status === 'CONFLICT') {
      res.status(409).json({ error: check.error });
      return;
    }
  }

  const parseResult = leadSubmissionSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ error: 'البيانات المدخلة غير صحيحة', details: parseResult.error.format() });
    return;
  }

  const data = parseResult.data;
  const existingLeads = db.get('leads');
  const normalizedPhone = data.phone.replace(/[^0-9]/g, '');
  const isDuplicate = existingLeads.some(l => l.phone.replace(/[^0-9]/g, '') === normalizedPhone);

  const referenceCode = `QT-REQ-${Math.floor(100000 + Math.random() * 900000)}`;

  const newLead: Lead = {
    id: `l-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    customerName: data.customerName,
    phone: data.phone,
    email: data.email || '',
    preferredContact: data.preferredContact,
    projectType: data.projectType,
    location: data.location,
    approxAreaSqm: data.approxAreaSqm,
    estimatedBudgetEgp: data.estimatedBudgetEgp,
    scope: data.scope,
    expectedStartDate: data.expectedStartDate || new Date().toISOString().split('T')[0],
    status: 'new',
    priority: data.estimatedBudgetEgp > 1000000 ? 'vip' : 'high',
    assignedToUserId: 'u2',
    nextFollowUpDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    notes: [...data.notes, `كود الطلب: ${referenceCode}`, ...(isDuplicate ? ['تنبيه: يوجد طلب سابق بهذا الرقم'] : [])],
    createdAt: new Date().toISOString().split('T')[0]
  };

  db.update('leads', list => [newLead, ...list]);
  db.logAudit('system', 'بوابة الموقع', 'طلب مقايسة جديد', `تم تقديم طلب مقايسة #${referenceCode} للعميل ${data.customerName}`);

  const responsePayload = {
    success: true,
    referenceCode,
    isDuplicateWarning: isDuplicate,
    lead: newLead
  };

  if (idempotencyKey) {
    saveIdempotency(principalId, endpoint, idempotencyKey, req.body, 201, responsePayload);
  }

  res.status(201).json(responsePayload);
});

// ----------------------------------------------------
// CRM & Leads Operations (Protected with IDOR checking)
// ----------------------------------------------------
apiRouter.get('/leads', requireAuth, requireRole(['super_admin', 'manager', 'sales']), (req: AuthenticatedRequest, res) => {
  const allLeads = db.get('leads');
  // If sales role, they can view all leads for assignment or their own leads
  res.json(allLeads);
});

apiRouter.patch('/leads/:id', requireAuth, requireRole(['super_admin', 'manager', 'sales']), (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const updateData = req.body;
  const currentUser = req.user!;

  const existingLead = db.get('leads').find(l => l.id === id);
  if (!existingLead) {
    res.status(404).json({ error: 'العميل المحتمل غير موجود' });
    return;
  }

  // IDOR & Ownership restriction for Sales reps:
  // Sales reps can only update leads assigned to them or unassigned leads
  if (currentUser.role === 'sales' && existingLead.assignedToUserId && existingLead.assignedToUserId !== currentUser.id) {
    res.status(403).json({ error: 'لا تملك صلاحية تعديل هذا العميل المسند لموظف مبيعات آخر' });
    return;
  }

  let updatedLead: Lead | null = null;
  db.update('leads', list => {
    return list.map(l => {
      if (l.id === id) {
        const item: Lead = { ...l, ...updateData };
        updatedLead = item;
        return item;
      }
      return l;
    });
  });

  db.logAudit(currentUser.id, currentUser.name, 'تعديل عميل محتمل', `تم تعديل العميل #${id}`);
  res.json(updatedLead);
});

// Idempotent lead conversion with concurrency locking & sales rep ownership enforcement
apiRouter.post('/leads/:id/convert', requireAuth, requireRole(['super_admin', 'manager', 'sales']), async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const currentUser = req.user!;
  const targetLead = db.get('leads').find(l => l.id === id);

  if (!targetLead) {
    res.status(404).json({ error: 'العميل المحتمل غير موجود' });
    return;
  }

  // Sales representatives cannot modify or convert deals assigned to another representative
  if (currentUser.role === 'sales' && targetLead.assignedToUserId && targetLead.assignedToUserId !== currentUser.id) {
    res.status(403).json({ error: 'لا تملك صلاحية تحويل عميل مسند لمندوب مبيعات آخر' });
    return;
  }

  const idempotencyKey = req.headers['idempotency-key'] as string;
  const principalId = currentUser.id;
  const endpoint = `/api/leads/${id}/convert`;
  if (idempotencyKey) {
    const check = checkIdempotency(principalId, endpoint, idempotencyKey, req.body);
    if (check.status === 'HIT') {
      res.status(check.record.statusCode).json(check.record.body);
      return;
    }
    if (check.status === 'CONFLICT') {
      res.status(409).json({ error: check.error });
      return;
    }
  }

  try {
    const author = { id: currentUser.id, name: currentUser.name };
    
    // Acquire mutex lock to prevent concurrent double-conversion race conditions
    const result = await withLock(`convert_lead_${id}`, async () => {
      return db.convertLeadToProject(id, author);
    });

    const payload = { success: true, ...result };
    if (idempotencyKey) {
      saveIdempotency(principalId, endpoint, idempotencyKey, req.body, 200, payload);
    }
    res.json(payload);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'فشل تحويل العميل لمشروع' });
  }
});

// ----------------------------------------------------
// Project Management Endpoints (IDOR Protected)
// ----------------------------------------------------
apiRouter.get('/projects', requireAuth, (req: AuthenticatedRequest, res) => {
  const projects = db.get('projects');
  const currentUser = req.user!;
  if (currentUser.role === 'client') {
    const clientPhone = currentUser.phone.replace(/[^0-9]/g, '');
    const clientEmail = (currentUser.email || '').toLowerCase();
    const customer = db.get('customers').find(c => 
      c.phone.replace(/[^0-9]/g, '') === clientPhone || 
      (c.email && c.email.toLowerCase() === clientEmail)
    );
    if (!customer) {
      res.json([]);
      return;
    }
    const filtered = projects.filter(p => p.customerId === customer.id);
    res.json(filtered);
    return;
  }
  res.json(projects);
});

apiRouter.get('/projects/:id', requireAuth, (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const project = db.get('projects').find(p => p.id === id);
  if (!project) {
    res.status(404).json({ error: 'المشروع غير موجود' });
    return;
  }

  const currentUser = req.user!;
  if (currentUser.role === 'client') {
    const clientPhone = currentUser.phone.replace(/[^0-9]/g, '');
    const clientEmail = (currentUser.email || '').toLowerCase();
    const customer = db.get('customers').find(c => 
      c.phone.replace(/[^0-9]/g, '') === clientPhone || 
      (c.email && c.email.toLowerCase() === clientEmail)
    );
    if (!customer || project.customerId !== customer.id) {
      res.status(403).json({ error: 'لا تملك صلاحية الوصول إلى بيانات هذا المشروع' });
      return;
    }
  }
  res.json(project);
});

apiRouter.get('/customers/:id', requireAuth, (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const customer = db.get('customers').find(c => c.id === id);
  if (!customer) {
    res.status(404).json({ error: 'العميل غير موجود' });
    return;
  }

  const currentUser = req.user!;
  if (currentUser.role === 'client') {
    const clientPhone = currentUser.phone.replace(/[^0-9]/g, '');
    const clientEmail = (currentUser.email || '').toLowerCase();
    const isOwner = customer.phone.replace(/[^0-9]/g, '') === clientPhone || 
                    (customer.email && customer.email.toLowerCase() === clientEmail);
    if (!isOwner) {
      res.status(403).json({ error: 'لا تملك صلاحية الوصول إلى بيانات عميل آخر' });
      return;
    }
  }
  res.json(customer);
});

apiRouter.post('/projects', requireAuth, requireRole(['super_admin', 'manager', 'pm']), (req: AuthenticatedRequest, res) => {
  const projectData = req.body;
  const newProject: Project = {
    id: `pr-${Date.now()}`,
    projectNumber: `PRJ-2026-${Math.floor(100 + Math.random() * 900)}`,
    progressPercentage: 0,
    actualExpensesEgp: 0,
    status: 'planned',
    ...projectData,
  };

  db.update('projects', list => [newProject, ...list]);
  if (req.user) {
    db.logAudit(req.user.id, req.user.name, 'إنشاء مشروع', `تم إنشاء مشروع #${newProject.projectNumber}`);
  }
  res.status(201).json(newProject);
});

apiRouter.patch('/projects/:id', requireAuth, requireRole(['super_admin', 'manager', 'pm']), (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const currentUser = req.user!;
  const targetProject = db.get('projects').find(p => p.id === id);

  if (!targetProject) {
    res.status(404).json({ error: 'المشروع غير موجود' });
    return;
  }

  // IDOR & PM assignment check: PMs can only edit projects assigned to them
  if (currentUser.role === 'pm' && targetProject.projectManagerId && targetProject.projectManagerId !== currentUser.id) {
    res.status(403).json({ error: 'لا تملك صلاحية تعديل هذا المشروع المسند لمهندس مشروع آخر' });
    return;
  }

  let updated: Project | null = null;
  db.update('projects', list => list.map(p => {
    if (p.id === id) {
      const item: Project = { ...p, ...req.body };
      updated = item;
      return item;
    }
    return p;
  }));

  res.json(updated);
});

// Project Tasks (Restricted to internal team roles)
apiRouter.get('/tasks', requireAuth, requireRole(['super_admin', 'manager', 'pm', 'sales', 'execution', 'accountant']), (req: AuthenticatedRequest, res) => {
  const tasks = db.get('tasks');
  const currentUser = req.user!;
  if (currentUser.role === 'execution') {
    const scoped = tasks.filter(t => t.assignedTo.includes(currentUser.name) || t.assignedTo.includes('تنفيذ') || t.assignedTo.includes('فريق'));
    res.json(scoped.length ? scoped : tasks);
    return;
  }
  res.json(tasks);
});

apiRouter.post('/tasks', requireAuth, requireRole(['super_admin', 'manager', 'pm', 'execution']), (req: AuthenticatedRequest, res) => {
  const taskData = req.body;
  const newTask: ProjectTask = {
    id: `t-${Date.now()}`,
    status: 'pending',
    priority: 'normal',
    ...taskData
  };
  db.update('tasks', list => [...list, newTask]);
  res.status(201).json(newTask);
});

apiRouter.patch('/tasks/:id', requireAuth, requireRole(['super_admin', 'manager', 'pm', 'execution']), (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  let updated: ProjectTask | null = null;
  db.update('tasks', list => list.map(t => {
    if (t.id === id) {
      const item: ProjectTask = { ...t, ...req.body };
      updated = item;
      return item;
    }
    return t;
  }));

  if (!updated) {
    res.status(404).json({ error: 'المهمة غير موجودة' });
    return;
  }
  res.json(updated);
});

// ----------------------------------------------------
// Quotations & Estimates (Decimal-Safe Calculations & Immutable Snapshots)
// ----------------------------------------------------
apiRouter.get('/quotations', requireAuth, (req: AuthenticatedRequest, res) => {
  const quotations = db.get('quotations');
  const currentUser = req.user!;
  if (currentUser.role === 'client') {
    const clientPhone = currentUser.phone.replace(/[^0-9]/g, '');
    const clientEmail = (currentUser.email || '').toLowerCase();
    const customer = db.get('customers').find(c => 
      c.phone.replace(/[^0-9]/g, '') === clientPhone || 
      (c.email && c.email.toLowerCase() === clientEmail)
    );
    if (!customer) {
      res.json([]);
      return;
    }
    const filtered = quotations.filter(q => q.customerId === customer.id);
    res.json(filtered);
    return;
  }
  res.json(quotations);
});

apiRouter.get('/quotations/:id', requireAuth, (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const quotation = db.get('quotations').find(q => q.id === id);
  if (!quotation) {
    res.status(404).json({ error: 'المقايسة غير موجودة' });
    return;
  }

  const currentUser = req.user!;
  if (currentUser.role === 'client') {
    const clientPhone = currentUser.phone.replace(/[^0-9]/g, '');
    const clientEmail = (currentUser.email || '').toLowerCase();
    const customer = db.get('customers').find(c => 
      c.phone.replace(/[^0-9]/g, '') === clientPhone || 
      (c.email && c.email.toLowerCase() === clientEmail)
    );
    if (!customer || quotation.customerId !== customer.id) {
      res.status(403).json({ error: 'لا تملك صلاحية الوصول إلى هذه المقايسة' });
      return;
    }
  }
  res.json(quotation);
});

const quotationSchema = z.object({
  customerName: z.string().min(2),
  customerId: z.string().optional(),
  paymentTerms: z.string(),
  notes: z.string().optional(),
  taxRate: z.number().min(0).max(100).optional(),
  items: z.array(z.object({
    description: z.string().min(1),
    quantity: z.number().positive(),
    unit: z.string(),
    unitPriceEgp: z.number().nonnegative(),
    discountPercentage: z.number().min(0).max(100).default(0)
  })).min(1, 'يجب إضافة بند واحد على الأقل')
});

apiRouter.post('/quotations', requireAuth, requireRole(['super_admin', 'manager', 'sales', 'pm']), (req: AuthenticatedRequest, res) => {
  const idempotencyKey = req.headers['idempotency-key'] as string;
  const principalId = req.user!.id;
  const endpoint = '/api/quotations';
  if (idempotencyKey) {
    const check = checkIdempotency(principalId, endpoint, idempotencyKey, req.body);
    if (check.status === 'HIT') {
      res.status(check.record.statusCode).json(check.record.body);
      return;
    }
    if (check.status === 'CONFLICT') {
      res.status(409).json({ error: check.error });
      return;
    }
  }

  const parseResult = quotationSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ error: 'بيانات المقايسة غير صالحة', details: parseResult.error.format() });
    return;
  }

  const data = parseResult.data;
  const settings = db.get('settings');
  // Configurable tax rate (default to company setting or custom transaction rate)
  const taxRate = typeof data.taxRate === 'number' ? data.taxRate : (settings.defaultVatRate || 14);

  // Decimal-safe line item calculation
  let subtotalEgp = 0;
  const computedItems = data.items.map((item, idx) => {
    const rawTotal = item.quantity * item.unitPriceEgp;
    const discountAmount = rawTotal * (item.discountPercentage / 100);
    const itemTotal = Math.round((rawTotal - discountAmount) * 100) / 100;
    subtotalEgp += itemTotal;
    return {
      id: `qi-${Date.now()}-${idx}`,
      description: item.description,
      quantity: item.quantity,
      unit: item.unit,
      unitPriceEgp: item.unitPriceEgp,
      discountPercentage: item.discountPercentage,
      totalEgp: itemTotal
    };
  });

  subtotalEgp = Math.round(subtotalEgp * 100) / 100;
  const taxAmountEgp = Math.round(subtotalEgp * (taxRate / 100) * 100) / 100;
  const grandTotalEgp = Math.round((subtotalEgp + taxAmountEgp) * 100) / 100;

  // Immutable version snapshot
  const version = {
    versionNumber: 1,
    createdAt: new Date().toISOString().split('T')[0],
    subtotalEgp,
    taxRate,
    taxAmountEgp,
    discountEgp: 0,
    grandTotalEgp,
    items: computedItems
  };

  const quotation: Quotation = {
    id: `q-${Date.now()}`,
    quotationNumber: `QT-2026-${Math.floor(100 + Math.random() * 900)}`,
    customerId: data.customerId || `c-${Date.now()}`,
    customerName: data.customerName,
    issueDate: new Date().toISOString().split('T')[0],
    expiryDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    currency: 'EGP',
    status: 'sent',
    paymentTerms: data.paymentTerms,
    notes: data.notes || '',
    preparedBy: req.user ? req.user.name : 'فريق التسعير',
    currentVersionIndex: 0,
    versions: [version]
  };

  db.update('quotations', list => [quotation, ...list]);
  if (req.user) {
    db.logAudit(req.user.id, req.user.name, 'إنشاء مقايسة', `تم إنشاء مقايسة رسمية #${quotation.quotationNumber} للعميل ${data.customerName}`);
  }

  if (idempotencyKey) {
    saveIdempotency(principalId, endpoint, idempotencyKey, req.body, 201, quotation);
  }

  res.status(201).json(quotation);
});

// Add new immutable version to quotation
const quotationVersionSchema = z.object({
  items: z.array(z.object({
    description: z.string().min(1),
    quantity: z.number().positive(),
    unit: z.string(),
    unitPriceEgp: z.number().nonnegative(),
    discountPercentage: z.number().min(0).max(100).default(0)
  })).min(1, 'يجب إضافة بند واحد على الأقل'),
  taxRate: z.number().min(0).max(100).optional()
});

apiRouter.post('/quotations/:id/versions', requireAuth, requireRole(['super_admin', 'manager', 'sales', 'pm']), (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const idempotencyKey = req.headers['idempotency-key'] as string;
  const principalId = req.user!.id;
  const endpoint = `/api/quotations/${id}/versions`;
  if (idempotencyKey) {
    const check = checkIdempotency(principalId, endpoint, idempotencyKey, req.body);
    if (check.status === 'HIT') {
      res.status(check.record.statusCode).json(check.record.body);
      return;
    }
    if (check.status === 'CONFLICT') {
      res.status(409).json({ error: check.error });
      return;
    }
  }

  const parseResult = quotationVersionSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ error: 'بيانات إصدار المقايسة غير صالحة', details: parseResult.error.format() });
    return;
  }

  try {
    const settings = db.get('settings');
    const taxRate = typeof parseResult.data.taxRate === 'number' ? parseResult.data.taxRate : (settings.defaultVatRate || 14);
    const author = { id: req.user!.id, name: req.user!.name };
    const updated = db.createQuotationVersion(id, parseResult.data.items, taxRate, author);

    if (idempotencyKey) {
      saveIdempotency(principalId, endpoint, idempotencyKey, req.body, 201, updated);
    }

    res.status(201).json(updated);
  } catch (err: any) {
    res.status(404).json({ error: err.message || 'المقايسة غير موجودة' });
  }
});

// Update quotation status with audit logging (Restricted: PM cannot approve quotations; only super_admin & manager can accept)
apiRouter.patch('/quotations/:id/status', requireAuth, requireRole(['super_admin', 'manager', 'sales']), (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const currentUser = req.user!;
  const statusSchema = z.object({
    status: z.enum(['draft', 'pending_approval', 'sent', 'accepted', 'rejected', 'expired'])
  });

  const parseResult = statusSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ error: 'حالة المقايسة غير صحيحة' });
    return;
  }

  // Acceptance / Approval of financial quotation requires super_admin or manager
  if (parseResult.data.status === 'accepted' && !['super_admin', 'manager'].includes(currentUser.role)) {
    res.status(403).json({ error: 'لا تملك صلاحية اعتماد وقبول المقايسة المالية' });
    return;
  }

  try {
    const author = { id: currentUser.id, name: currentUser.name };
    const updated = db.updateQuotationStatus(id, parseResult.data.status, author);
    res.json(updated);
  } catch (err: any) {
    res.status(404).json({ error: err.message || 'المقايسة غير موجودة' });
  }
});

// ----------------------------------------------------
// Financial Tracking (Payments & Expenses)
// ----------------------------------------------------
apiRouter.get('/payments', requireAuth, requireRole(['super_admin', 'manager', 'accountant']), (_req, res) => {
  res.json(db.get('payments'));
});

const paymentSchema = z.object({
  projectId: z.string().min(1),
  projectName: z.string().min(1),
  customerName: z.string().min(1),
  amountEgp: z.number().positive(),
  paymentDate: z.string().optional(),
  method: z.enum(['bank_transfer', 'cash', 'instapay', 'cheque', 'credit_card']),
  referenceNumber: z.string().min(1),
  notes: z.string().optional()
});

apiRouter.post('/payments', requireAuth, requireRole(['super_admin', 'manager', 'accountant']), async (req: AuthenticatedRequest, res) => {
  const idempotencyKey = req.headers['idempotency-key'] as string;
  const principalId = req.user!.id;
  const endpoint = '/api/payments';
  if (idempotencyKey) {
    const check = checkIdempotency(principalId, endpoint, idempotencyKey, req.body);
    if (check.status === 'HIT') {
      res.status(check.record.statusCode).json(check.record.body);
      return;
    }
    if (check.status === 'CONFLICT') {
      res.status(409).json({ error: check.error });
      return;
    }
  }

  const parseResult = paymentSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ error: 'بيانات الدفعة غير صحيحة', details: parseResult.error.format() });
    return;
  }

  try {
    const author = { id: req.user!.id, name: req.user!.name };
    const paymentData = parseResult.data;

    // Mutex locking per project to ensure concurrent payments don't conflict
    const newPayment = await withLock(`payment_${paymentData.projectId}`, async () => {
      return db.recordPayment({
        projectId: paymentData.projectId,
        projectName: paymentData.projectName,
        customerId: req.body.customerId || 'c1',
        customerName: paymentData.customerName,
        amountEgp: paymentData.amountEgp,
        paymentDate: paymentData.paymentDate || new Date().toISOString().split('T')[0],
        method: paymentData.method,
        referenceNumber: paymentData.referenceNumber,
        notes: paymentData.notes || ''
      }, author);
    });

    if (idempotencyKey) {
      saveIdempotency(principalId, endpoint, idempotencyKey, req.body, 201, newPayment);
    }
    res.status(201).json(newPayment);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'فشل تسجيل الدفعة' });
  }
});

apiRouter.get('/expenses', requireAuth, requireRole(['super_admin', 'manager', 'accountant']), (_req, res) => {
  res.json(db.get('expenses'));
});

const expenseSchema = z.object({
  projectId: z.string().min(1),
  projectName: z.string().min(1),
  category: z.enum(['materials', 'labor', 'subcontractor', 'permits', 'transport', 'design']),
  description: z.string().min(1),
  amountEgp: z.number().positive(),
  expenseDate: z.string().optional(),
  supplierName: z.string().min(1),
  receiptUrl: z.string().optional()
});

apiRouter.post('/expenses', requireAuth, requireRole(['super_admin', 'manager', 'accountant']), async (req: AuthenticatedRequest, res) => {
  const idempotencyKey = req.headers['idempotency-key'] as string;
  const principalId = req.user!.id;
  const endpoint = '/api/expenses';
  if (idempotencyKey) {
    const check = checkIdempotency(principalId, endpoint, idempotencyKey, req.body);
    if (check.status === 'HIT') {
      res.status(check.record.statusCode).json(check.record.body);
      return;
    }
    if (check.status === 'CONFLICT') {
      res.status(409).json({ error: check.error });
      return;
    }
  }

  const parseResult = expenseSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ error: 'بيانات المصروف غير صحيحة', details: parseResult.error.format() });
    return;
  }

  try {
    const author = { id: req.user!.id, name: req.user!.name };
    const expenseData = parseResult.data;

    // Mutex locking per project to ensure actualExpensesEgp is updated atomically
    const newExpense = await withLock(`expense_${expenseData.projectId}`, async () => {
      return db.recordExpense({
        projectId: expenseData.projectId,
        projectName: expenseData.projectName,
        category: expenseData.category,
        description: expenseData.description,
        amountEgp: expenseData.amountEgp,
        expenseDate: expenseData.expenseDate || new Date().toISOString().split('T')[0],
        supplierName: expenseData.supplierName,
        receiptUrl: expenseData.receiptUrl
      }, author);
    });

    if (idempotencyKey) {
      saveIdempotency(principalId, endpoint, idempotencyKey, req.body, 201, newExpense);
    }
    res.status(201).json(newExpense);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'فشل تسجيل المصروف' });
  }
});

// ----------------------------------------------------
// Portfolio & Media
// ----------------------------------------------------
apiRouter.get('/portfolio', (_req, res) => {
  res.json(db.get('portfolio'));
});

apiRouter.post('/portfolio', requireAuth, requireRole(['super_admin', 'manager']), (req: AuthenticatedRequest, res) => {
  const itemData = req.body;
  const newProject: PortfolioProject = {
    id: `p-${Date.now()}`,
    slug: `proj-${Date.now()}`,
    status: 'published',
    isFeatured: true,
    galleryImages: [itemData.coverImage],
    completionDate: new Date().toISOString().split('T')[0],
    ...itemData
  };

  db.update('portfolio', list => [newProject, ...list]);
  res.status(201).json(newProject);
});

apiRouter.delete('/portfolio/:id', requireAuth, requireRole(['super_admin', 'manager']), (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  db.update('portfolio', list => list.filter(p => p.id !== id));
  if (req.user) {
    db.logAudit(req.user.id, req.user.name, 'حذف مشروع من المعرض', `تم حذف المشروع كود: ${id}`);
  }
  res.json({ message: 'تم حذف المشروع بنجاح' });
});

apiRouter.patch('/portfolio/:id', requireAuth, requireRole(['super_admin', 'manager']), (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const updatedList = db.update('portfolio', list => 
    list.map(p => p.id === id ? { ...p, ...req.body } : p)
  );
  const found = updatedList.find(p => p.id === id);
  if (!found) {
    res.status(404).json({ error: 'المشروع غير موجود' });
    return;
  }
  res.json(found);
});

// ----------------------------------------------------
// News & Articles Management (CMS)
// ----------------------------------------------------
apiRouter.get('/news', (_req, res) => {
  const allNews = db.get('news') || [];
  res.json(allNews);
});

apiRouter.post('/news', requireAuth, requireRole(['super_admin', 'manager']), (req: AuthenticatedRequest, res) => {
  const newsData = req.body;
  if (!newsData.title?.ar) {
    res.status(400).json({ error: 'عنوان الخبر بالعربية مطلوب' });
    return;
  }

  const categoryLabels: Record<string, { ar: string; en: string }> = {
    design_trends: { ar: 'اتجاهات التصميم', en: 'Design Trends' },
    projects: { ar: 'أخبار المشاريع', en: 'Projects News' },
    materials: { ar: 'المواد والتشطيبات', en: 'Materials & Finishes' },
    awards: { ar: 'جوائز وفعاليات', en: 'Awards & Events' }
  };

  const newArticle: NewsArticle = {
    id: `news-${Date.now()}`,
    slug: newsData.slug || `article-${Date.now()}`,
    title: { ar: newsData.title.ar, en: newsData.title.en || newsData.title.ar },
    excerpt: { ar: newsData.excerpt?.ar || '', en: newsData.excerpt?.en || newsData.excerpt?.ar || '' },
    content: { ar: newsData.content?.ar || '', en: newsData.content?.en || newsData.content?.ar || '' },
    image: newsData.image || '/images/hero_interior_design_1792469679331.jpg',
    category: newsData.category || 'design_trends',
    categoryLabel: categoryLabels[newsData.category] || { ar: 'أخبار المنصة', en: 'News' },
    author: req.user?.name || 'م. أحمد العوضي',
    publishedAt: new Date().toISOString().split('T')[0],
    isPublished: newsData.isPublished !== undefined ? newsData.isPublished : true,
    views: 0
  };

  db.update('news', list => [newArticle, ...(list || [])]);
  if (req.user) {
    db.logAudit(req.user.id, req.user.name, 'نشر خبر جديد', `تم نشر المقال: ${newArticle.title.ar}`);
  }
  res.status(201).json(newArticle);
});

apiRouter.patch('/news/:id', requireAuth, requireRole(['super_admin', 'manager']), (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const updatedList = db.update('news', list => 
    (list || []).map(article => article.id === id ? { ...article, ...req.body } : article)
  );
  const found = updatedList.find(a => a.id === id);
  if (!found) {
    res.status(404).json({ error: 'الخبر غير موجود' });
    return;
  }
  if (req.user) {
    db.logAudit(req.user.id, req.user.name, 'تعديل خبر', `تم تحديث بيانات المقال: ${found.title.ar}`);
  }
  res.json(found);
});

apiRouter.delete('/news/:id', requireAuth, requireRole(['super_admin', 'manager']), (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  db.update('news', list => (list || []).filter(a => a.id !== id));
  if (req.user) {
    db.logAudit(req.user.id, req.user.name, 'حذف خبر', `تم حذف المقال كود: ${id}`);
  }
  res.json({ message: 'تم حذف الخبر بنجاح' });
});

// ----------------------------------------------------
// Services & Company Settings
// ----------------------------------------------------
apiRouter.get('/services', (_req, res) => {
  res.json(db.get('services'));
});

apiRouter.get('/settings', (_req, res) => {
  res.json(db.get('settings'));
});

apiRouter.patch('/settings', requireAuth, requireRole(['super_admin', 'manager']), (req: AuthenticatedRequest, res) => {
  const updated = db.update('settings', s => ({ ...s, ...req.body }));
  if (req.user) {
    db.logAudit(req.user.id, req.user.name, 'تعديل الإعدادات', 'تم تحديث بيانات الشركة وإعدادات الضرائب');
  }
  res.json(updated);
});

// ----------------------------------------------------
// User Administration & RBAC Management
// ----------------------------------------------------
apiRouter.get('/users', requireAuth, requireRole(['super_admin', 'manager']), (_req, res) => {
  const users = db.get('users').map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    phone: u.phone,
    department: u.department,
    avatar: u.avatar,
    permissions: u.permissions,
    status: u.status || 'active'
  }));
  res.json(users);
});

apiRouter.post('/users', requireAuth, requireRole(['super_admin']), (req: AuthenticatedRequest, res) => {
  const { name, email, role, phone, department, permissions, password } = req.body;
  if (!name || !email) {
    res.status(400).json({ error: 'اسم الموظف والبريد الإلكتروني مطلوبان' });
    return;
  }

  try {
    const author = req.user ? { id: req.user.id, name: req.user.name } : { id: 'u1', name: 'الآدمن الرئيسي' };
    const created = db.createUser({
      name,
      email,
      role: role || 'sales',
      phone: phone || '+20 100 000 0000',
      department: department || 'إدارة التشغيل',
      permissions,
      password: password || 'Password@123'
    }, author);

    res.status(201).json({
      id: created.id,
      name: created.name,
      email: created.email,
      role: created.role,
      phone: created.phone,
      department: created.department,
      permissions: created.permissions,
      status: created.status
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'فشل إنشاء المستخدم' });
  }
});

apiRouter.patch('/users/:id', requireAuth, requireRole(['super_admin']), (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  try {
    const author = req.user ? { id: req.user.id, name: req.user.name } : { id: 'u1', name: 'الآدمن الرئيسي' };
    const updated = db.updateUser(id, req.body, author);
    if (req.body.role) {
      revokeAllUserSessions(id);
    }
    res.json({
      id: updated.id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
      phone: updated.phone,
      department: updated.department,
      permissions: updated.permissions,
      status: updated.status
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'فشل تحديث بيانات المستخدم' });
  }
});

apiRouter.patch('/users/:id/role', requireAuth, requireRole(['super_admin']), (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const roleSchema = z.object({
    role: z.enum(['super_admin', 'manager', 'sales', 'pm', 'accountant', 'execution', 'client'])
  });

  const parseResult = roleSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ error: 'الدور المحدد غير صالح' });
    return;
  }

  try {
    const author = req.user ? { id: req.user.id, name: req.user.name } : { id: 'u1', name: 'الآدمن الرئيسي' };
    const updatedUser = db.updateUserRole(id, parseResult.data.role, author);
    // Revoke all existing sessions for this user so permissions update immediately
    revokeAllUserSessions(id);

    res.json({
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      permissions: updatedUser.permissions
    });
  } catch (err: any) {
    res.status(404).json({ error: err.message || 'المستخدم غير موجود' });
  }
});

apiRouter.delete('/users/:id', requireAuth, requireRole(['super_admin']), (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  try {
    const author = req.user ? { id: req.user.id, name: req.user.name } : { id: 'u1', name: 'الآدمن الرئيسي' };
    db.deleteUser(id, author);
    revokeAllUserSessions(id);
    res.json({ message: 'تم حذف المستخدم بنجاح' });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'فشل حذف المستخدم' });
  }
});

// ----------------------------------------------------
// System Integrity Diagnostics & Backup
// ----------------------------------------------------
apiRouter.get('/system/integrity', requireAuth, requireRole(['super_admin']), async (_req, res) => {
  const result = await repository.verifyIntegrity();
  res.json(result);
});

apiRouter.post('/system/backup', requireAuth, requireRole(['super_admin']), (_req: AuthenticatedRequest, res) => {
  const backupResult = db.createBackup();
  res.json({
    success: true,
    message: 'تم إنشاء نسخة احتياطية موثقة بنجاح',
    ...backupResult
  });
});

// ----------------------------------------------------
// Audit Logs (Protected & Strictly Append-Only)
// ----------------------------------------------------
apiRouter.all('/audit-logs/:id?', (req, res, next) => {
  if (['DELETE', 'PUT', 'PATCH'].includes(req.method)) {
    res.status(405).json({ error: 'سجلات التدقيق غير قابلة للتعديل أو الحذف نهائياً (Append-only immutable audit trail)' });
    return;
  }
  next();
});

apiRouter.get('/audit-logs', requireAuth, requireRole(['super_admin', 'manager']), (_req, res) => {
  res.json(db.get('auditLogs'));
});
