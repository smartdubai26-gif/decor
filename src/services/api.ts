import { 
  User, Lead, Customer, Project, ProjectTask, Quotation, 
  Payment, Expense, PortfolioProject, ServiceItem, CompanySettings, AuditLog, NewsArticle 
} from '../types';

let authToken: string | null = typeof window !== 'undefined' ? localStorage.getItem('artisan_auth_token') : null;

export function setAuthToken(token: string | null) {
  authToken = token;
  if (typeof window !== 'undefined') {
    if (token) localStorage.setItem('artisan_auth_token', token);
    else localStorage.removeItem('artisan_auth_token');
  }
}

export function getAuthToken(): string | null {
  return authToken;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(`/api${endpoint}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    let errorMsg = `Request failed (${response.status})`;
    try {
      const errorJson = await response.json();
      errorMsg = errorJson.error || errorJson.message || errorMsg;
    } catch {}
    throw new Error(errorMsg);
  }

  return response.json();
}

export const api = {
  // Auth
  login: (email: string, password: string) => request<{ user: User; token: string }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  }),
  logout: () => request<{ message: string }>('/auth/logout', { method: 'POST' }),
  getMe: () => request<{ user: User }>('/auth/me'),

  // Leads & Public Quote Request
  submitLead: (leadData: Omit<Lead, 'id' | 'createdAt' | 'status'>) => 
    request<{ success: boolean; referenceCode: string; isDuplicateWarning: boolean; lead: Lead }>('/leads', {
      method: 'POST',
      body: JSON.stringify(leadData)
    }),
  getLeads: () => request<Lead[]>('/leads'),
  updateLead: (id: string, data: Partial<Lead>) => request<Lead>(`/leads/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  }),
  convertLead: (id: string) => request<{ success: boolean; customer: Customer; project: Project }>(`/leads/${id}/convert`, {
    method: 'POST'
  }),

  // Projects & Tasks
  getProjects: () => request<Project[]>('/projects'),
  createProject: (data: Partial<Project>) => request<Project>('/projects', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateProject: (id: string, data: Partial<Project>) => request<Project>(`/projects/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  }),
  getTasks: () => request<ProjectTask[]>('/tasks'),
  createTask: (data: Partial<ProjectTask>) => request<ProjectTask>('/tasks', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateTask: (id: string, data: Partial<ProjectTask>) => request<ProjectTask>(`/tasks/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  }),

  // Quotations
  getQuotations: () => request<Quotation[]>('/quotations'),
  createQuotation: (data: { customerName: string; paymentTerms: string; notes?: string; items: any[] }) =>
    request<Quotation>('/quotations', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  createQuotationVersion: (id: string, data: { items: any[]; taxRate?: number }) =>
    request<Quotation>(`/quotations/${id}/versions`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  updateQuotationStatus: (id: string, status: string) =>
    request<Quotation>(`/quotations/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    }),

  // Finance
  getPayments: () => request<Payment[]>('/payments'),
  recordPayment: (data: Partial<Payment>) => request<Payment>('/payments', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  getExpenses: () => request<Expense[]>('/expenses'),
  recordExpense: (data: Partial<Expense>) => request<Expense>('/expenses', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // Portfolio & Media
  getPortfolio: () => request<PortfolioProject[]>('/portfolio'),
  createPortfolio: (data: Partial<PortfolioProject>) => request<PortfolioProject>('/portfolio', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updatePortfolio: (id: string, data: Partial<PortfolioProject>) => request<PortfolioProject>(`/portfolio/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  }),
  deletePortfolio: (id: string) => request<{ message: string }>(`/portfolio/${id}`, {
    method: 'DELETE'
  }),

  // News & Articles (CMS)
  getNews: () => request<NewsArticle[]>('/news'),
  createNews: (data: Partial<NewsArticle>) => request<NewsArticle>('/news', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateNews: (id: string, data: Partial<NewsArticle>) => request<NewsArticle>(`/news/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  }),
  deleteNews: (id: string) => request<{ message: string }>(`/news/${id}`, {
    method: 'DELETE'
  }),

  // Settings & Services
  getServices: () => request<ServiceItem[]>('/services'),
  getSettings: () => request<CompanySettings>('/settings'),
  updateSettings: (data: Partial<CompanySettings>) => request<CompanySettings>('/settings', {
    method: 'PATCH',
    body: JSON.stringify(data)
  }),

  // Users & Administration
  getUsers: () => request<User[]>('/users'),
  createUser: (data: Partial<User> & { password?: string }) => request<User>('/users', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateUser: (id: string, data: Partial<User>) => request<User>(`/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  }),
  updateUserRole: (id: string, role: string) => request<User>(`/users/${id}/role`, {
    method: 'PATCH',
    body: JSON.stringify({ role })
  }),
  deleteUser: (id: string) => request<{ message: string }>(`/users/${id}`, {
    method: 'DELETE'
  }),

  // System Diagnostics & Backup
  getSystemIntegrity: () => request<any>('/system/integrity'),
  triggerBackup: () => request<any>('/system/backup', { method: 'POST' }),

  // Audit Logs
  getAuditLogs: () => request<AuditLog[]>('/audit-logs')
};
