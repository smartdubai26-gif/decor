import React, { useState } from 'react';
import { User, Lead, Customer, Project, Quotation, Payment, Expense, PortfolioProject, ServiceItem, CompanySettings, NewsArticle } from '../../types';
import { 
  LayoutDashboard, Users, FolderKanban, FileText, Wallet, 
  Image as ImageIcon, Settings as SettingsIcon, Shield, Bell, LogOut, ArrowRight, Menu, X, Plus, Newspaper 
} from 'lucide-react';

import { DashboardHome } from './DashboardHome';
import { CrmModule } from './CrmModule';
import { ProjectsModule } from './ProjectsModule';
import { QuotationsModule } from './QuotationsModule';
import { FinanceModule } from './FinanceModule';
import { MediaModule } from './MediaModule';
import { SettingsModule } from './SettingsModule';
import { UserManagementModule } from './UserManagementModule';
import { NewsModule } from './NewsModule';

interface AdminLayoutProps {
  currentUser: User;
  onSwitchBackToPublic: () => void;
  leads: Lead[];
  setLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  quotations: Quotation[];
  setQuotations: React.Dispatch<React.SetStateAction<Quotation[]>>;
  payments: Payment[];
  setPayments: React.Dispatch<React.SetStateAction<Payment[]>>;
  expenses: Expense[];
  setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
  portfolio: PortfolioProject[];
  setPortfolio: React.Dispatch<React.SetStateAction<PortfolioProject[]>>;
  services: ServiceItem[];
  setServices: React.Dispatch<React.SetStateAction<ServiceItem[]>>;
  settings: CompanySettings;
  setSettings: React.Dispatch<React.SetStateAction<CompanySettings>>;
  news: NewsArticle[];
  setNews: React.Dispatch<React.SetStateAction<NewsArticle[]>>;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  onUpdateCurrentUser?: (user: User) => void;
  onOpenAuthModal: () => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentUser,
  onSwitchBackToPublic,
  leads,
  setLeads,
  customers,
  setCustomers,
  projects,
  setProjects,
  quotations,
  setQuotations,
  payments,
  setPayments,
  expenses,
  setExpenses,
  portfolio,
  setPortfolio,
  services,
  setServices,
  settings,
  setSettings,
  news,
  setNews,
  users,
  setUsers,
  onUpdateCurrentUser,
  onOpenAuthModal,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<string>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // RBAC Permission checks with custom permissions override support
  const canAccessFinance = currentUser.permissions?.canAccessFinance !== undefined
    ? currentUser.permissions.canAccessFinance
    : ['super_admin', 'manager', 'accountant'].includes(currentUser.role);

  const canAccessUsers = currentUser.permissions?.canAccessUsers !== undefined
    ? currentUser.permissions.canAccessUsers
    : ['super_admin'].includes(currentUser.role);

  const canAccessSettings = currentUser.permissions?.canAccessSettings !== undefined
    ? currentUser.permissions.canAccessSettings
    : ['super_admin', 'manager'].includes(currentUser.role);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col lg:flex-row text-slate-900" dir="rtl">
      
      {/* Sidebar for Mobile & Desktop */}
      <aside className={`fixed inset-y-0 right-0 z-50 w-72 bg-[#28332F] text-white flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}>
        
        {/* Top brand & user */}
        <div className="p-6 border-b border-[#C6A780]/30 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#C6A780] text-[#28332F] flex items-center justify-center font-bold">
                A&S
              </div>
              <div>
                <h3 className="font-bold text-sm">لوحة الإدارة الشاملة</h3>
                <p className="text-[10px] text-[#C6A780]">{settings.companyName.ar}</p>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white/70 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div 
            onClick={onOpenAuthModal}
            className="bg-white/10 p-3 rounded-xl border border-white/10 flex items-center justify-between cursor-pointer hover:bg-white/15 transition-colors"
          >
            <div>
              <div className="text-xs font-bold text-white">{currentUser.name}</div>
              <div className="text-[10px] text-[#C6A780] capitalize">{currentUser.department} • <span className="font-mono">{currentUser.role}</span></div>
            </div>
            <Shield className="w-4 h-4 text-[#C6A780]" />
          </div>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {[
            { id: 'dashboard', label: 'الرئيسية والمؤشرات', icon: LayoutDashboard },
            { id: 'crm', label: 'إدارة العملاء المحتملين (CRM)', icon: Users, badge: leads.filter(l => l.status === 'new').length },
            { id: 'projects', label: 'إدارة المشاريع والتنفيذ', icon: FolderKanban, badge: projects.length },
            { id: 'quotations', label: 'العروض والمقايسات (الأسعار)', icon: FileText },
            ...(canAccessFinance ? [{ id: 'finance', label: 'الإدارة المالية والمصروفات', icon: Wallet }] : []),
            { id: 'news', label: 'إدارة الأخبار والمقالات (CMS)', icon: Newspaper, badge: news.filter(n => n.isPublished).length },
            { id: 'media', label: 'معرض الصور والملفات', icon: ImageIcon },
            ...(canAccessUsers ? [{ id: 'users', label: 'الموظفين والصلاحيات (RBAC)', icon: Users }] : []),
            ...(canAccessSettings ? [{ id: 'settings', label: 'إعدادات المنصة والصفحات', icon: SettingsIcon }] : []),
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeSubTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveSubTab(item.id); setSidebarOpen(false); }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#C6A780] text-[#28332F] font-bold shadow-md'
                    : 'text-[#F1E9DE]/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-[#28332F]' : 'text-[#C6A780]'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge ? (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isActive ? 'bg-[#28332F] text-white' : 'bg-[#C6A780] text-[#28332F]'}`}>
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>

        {/* Bottom switch back to public */}
        <div className="p-4 border-t border-[#C6A780]/30 space-y-2">
          <button
            onClick={onSwitchBackToPublic}
            className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl text-xs font-bold transition-all"
          >
            <ArrowRight className="w-4 h-4 text-[#C6A780]" />
            العودة للموقع العام
          </button>
        </div>

      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:mr-72 flex flex-col min-h-screen">
        
        {/* Top Navbar */}
        <header className="bg-white border-b border-slate-200 h-20 px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-slate-700 hover:text-slate-900 p-2"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-slate-900">لوحة التحكم التنفيذية</h1>
              <p className="text-xs text-slate-500">نظام إدارة شركة أرتيزان آند سبيد للديكور</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-full text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              النظام نشط ومؤمن
            </div>
          </div>
        </header>

        {/* Module Views */}
        <main className="flex-1 p-6 sm:p-8 overflow-y-auto">
          {activeSubTab === 'dashboard' && (
            <DashboardHome
              leads={leads}
              projects={projects}
              quotations={quotations}
              payments={payments}
              expenses={expenses}
              setActiveSubTab={setActiveSubTab}
            />
          )}

          {activeSubTab === 'crm' && (
            <CrmModule
              leads={leads}
              setLeads={setLeads}
              customers={customers}
              setCustomers={setCustomers}
              projects={projects}
              setProjects={setProjects}
              quotations={quotations}
            />
          )}

          {activeSubTab === 'projects' && (
            <ProjectsModule
              projects={projects}
              setProjects={setProjects}
              customers={customers}
            />
          )}

          {activeSubTab === 'quotations' && (
            <QuotationsModule
              quotations={quotations}
              setQuotations={setQuotations}
              customers={customers}
              settings={settings}
            />
          )}

          {activeSubTab === 'finance' && canAccessFinance && (
            <FinanceModule
              payments={payments}
              setPayments={setPayments}
              expenses={expenses}
              setExpenses={setExpenses}
              projects={projects}
            />
          )}

          {activeSubTab === 'media' && (
            <MediaModule
              portfolio={portfolio}
              setPortfolio={setPortfolio}
              services={services}
              setServices={setServices}
            />
          )}

          {activeSubTab === 'news' && (
            <NewsModule
              news={news}
              setNews={setNews}
            />
          )}

          {activeSubTab === 'users' && canAccessUsers && (
            <UserManagementModule 
              users={users}
              setUsers={setUsers}
              currentUser={currentUser}
              onUpdateCurrentUser={onUpdateCurrentUser}
            />
          )}

          {activeSubTab === 'settings' && canAccessSettings && (
            <SettingsModule 
              settings={settings} 
              setSettings={setSettings}
              portfolio={portfolio}
              setPortfolio={setPortfolio}
              news={news}
              setNews={setNews}
              onNavigateTab={(tab) => setActiveSubTab(tab)}
            />
          )}
        </main>

      </div>

    </div>
  );
};
