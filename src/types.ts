export type UserRole = 'super_admin' | 'manager' | 'sales' | 'pm' | 'accountant' | 'execution' | 'client';

export interface UserPermissions {
  canAccessCRM: boolean;
  canAccessProjects: boolean;
  canAccessQuotations: boolean;
  canAccessFinance: boolean;
  canAccessMedia: boolean;
  canAccessNews: boolean;
  canAccessUsers: boolean;
  canAccessSettings: boolean;
  canApproveQuotations: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  avatar?: string;
  department?: string;
  permissions?: Partial<UserPermissions>;
  status?: 'active' | 'suspended';
}

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'site_visit' | 'quotation_prepared' | 'negotiation' | 'won' | 'lost';

export interface Lead {
  id: string;
  customerName: string;
  phone: string;
  email: string;
  preferredContact: 'phone' | 'whatsapp' | 'email';
  projectType: 'residential_villa' | 'apartment' | 'commercial_office' | 'renovation' | 'joinery';
  location: string; // e.g. New Cairo, Zamalek, Sheikh Zayed
  approxAreaSqm: number;
  estimatedBudgetEgp: number;
  scope: string;
  expectedStartDate: string;
  status: LeadStatus;
  priority: 'low' | 'medium' | 'high' | 'vip';
  assignedToUserId: string;
  nextFollowUpDate: string;
  notes: string[];
  lossReason?: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  companyName?: string;
  totalProjects: number;
  createdAt: string;
}

export type ProjectStatus = 'planned' | 'awaiting_start' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';

export interface ProjectTask {
  id: string;
  projectId: string;
  title: string;
  assignedTo: string;
  dueDate: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'normal' | 'high' | 'urgent';
}

export interface ProjectMilestone {
  id: string;
  projectId: string;
  title: string;
  dueDate: string;
  completed: boolean;
}

export interface Project {
  id: string;
  projectNumber: string;
  name: string;
  customerId: string;
  customerName: string;
  address: string;
  scope: string;
  projectManagerId: string;
  startDate: string;
  targetCompletionDate: string;
  status: ProjectStatus;
  contractValueEgp: number;
  actualExpensesEgp: number;
  progressPercentage: number;
  notes: string;
  imageCover: string;
}

export type QuotationStatus = 'draft' | 'pending_approval' | 'sent' | 'accepted' | 'rejected' | 'expired';

export interface QuotationItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unitPriceEgp: number;
  discountPercentage: number;
  totalEgp: number;
}

export interface QuotationVersion {
  versionNumber: number;
  createdAt: string;
  subtotalEgp: number;
  taxRate: number; // e.g. 14 for VAT
  taxAmountEgp: number;
  discountEgp: number;
  grandTotalEgp: number;
  items: QuotationItem[];
}

export interface Quotation {
  id: string;
  quotationNumber: string;
  leadId?: string;
  customerId: string;
  customerName: string;
  issueDate: string;
  expiryDate: string;
  currency: 'EGP' | 'USD' | 'EUR';
  status: QuotationStatus;
  versions: QuotationVersion[];
  currentVersionIndex: number;
  paymentTerms: string;
  notes: string;
  preparedBy: string;
}

export interface Payment {
  id: string;
  projectId: string;
  projectName: string;
  customerId: string;
  customerName: string;
  amountEgp: number;
  paymentDate: string;
  method: 'bank_transfer' | 'cash' | 'instapay' | 'cheque' | 'credit_card';
  referenceNumber: string;
  notes: string;
}

export interface Expense {
  id: string;
  projectId: string;
  projectName: string;
  category: 'materials' | 'labor' | 'subcontractor' | 'permits' | 'transport' | 'design';
  description: string;
  amountEgp: number;
  expenseDate: string;
  supplierName: string;
  receiptUrl?: string;
}

export interface PortfolioProject {
  id: string;
  slug: string;
  title: { ar: string; en: string };
  category: 'villas' | 'penthouses' | 'commercial' | 'renovation';
  location: string;
  propertyType: string;
  description: { ar: string; en: string };
  coverImage: string;
  galleryImages: string[];
  completionDate: string;
  isFeatured: boolean;
  status: 'published' | 'draft' | 'archived';
}

export interface ServiceItem {
  id: string;
  slug: string;
  title: { ar: string; en: string };
  shortDesc: { ar: string; en: string };
  fullDesc: { ar: string; en: string };
  iconName: string;
  image: string;
  startingPriceEgp: number;
  published: boolean;
}

export interface AppNotification {
  id: string;
  userId?: string;
  title: string;
  message: string;
  type: 'lead' | 'project' | 'quotation' | 'payment' | 'system';
  read: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface NewsArticle {
  id: string;
  slug: string;
  title: { ar: string; en: string };
  excerpt: { ar: string; en: string };
  content: { ar: string; en: string };
  image: string;
  category: 'design_trends' | 'projects' | 'materials' | 'awards';
  categoryLabel?: { ar: string; en: string };
  author: string;
  publishedAt: string;
  isPublished: boolean;
  views?: number;
}

export interface SitePageControls {
  showNews: boolean;
  showPortfolio: boolean;
  showServices: boolean;
  showFaq: boolean;
  announcementBarEnabled: boolean;
  announcementText: { ar: string; en: string };
}

export interface CompanySettings {
  companyName: { ar: string; en: string };
  tagline: { ar: string; en: string };
  phone: string;
  whatsapp: string;
  email: string;
  address: { ar: string; en: string };
  taxId: string;
  defaultVatRate: number;
  bankInfo: string;
  pageControls?: SitePageControls;
}
