import React from 'react';
import { Lead, Project, Quotation, Payment, Expense } from '../../types';
import { Users, FolderKanban, FileText, Wallet, ArrowLeft, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';

interface DashboardHomeProps {
  leads: Lead[];
  projects: Project[];
  quotations: Quotation[];
  payments: Payment[];
  expenses: Expense[];
  setActiveSubTab: (tab: string) => void;
}

export const DashboardHome: React.FC<DashboardHomeProps> = ({
  leads,
  projects,
  quotations,
  payments,
  expenses,
  setActiveSubTab,
}) => {
  const newLeadsCount = leads.filter(l => l.status === 'new' || l.status === 'contacted').length;
  const activeProjectsCount = projects.filter(p => p.status === 'in_progress').length;
  const pendingQuotesCount = quotations.filter(q => q.status === 'sent' || q.status === 'pending_approval').length;

  const totalRevenue = payments.reduce((acc, p) => acc + p.amountEgp, 0);
  const totalExpenses = expenses.reduce((acc, e) => acc + e.amountEgp, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Welcome Banner */}
      <div className="bg-[#28332F] text-white p-8 rounded-3xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#C6A780]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="space-y-2 relative z-10">
          <span className="text-xs font-semibold text-[#C6A780] uppercase tracking-wider">مرحباً بك في لوحة الإدارة</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">نظرة عامة على أداء الشركة والمشاريع</h2>
          <p className="text-xs text-[#F1E9DE]/80">متابعة دقيقة للعملاء المحتملين، المشاريع الإنشائية، الإيرادات والمصروفات بالجنيه المصري.</p>
        </div>
        <div className="flex gap-3 relative z-10">
          <button
            onClick={() => setActiveSubTab('crm')}
            className="bg-[#C6A780] hover:bg-[#b0916b] text-[#28332F] px-5 py-3 rounded-xl font-bold text-xs transition-all shadow-md"
          >
            إدارة العملاء (CRM)
          </button>
          <button
            onClick={() => setActiveSubTab('projects')}
            className="bg-white/10 hover:bg-white/20 text-white px-5 py-3 rounded-xl font-bold text-xs transition-all border border-white/20"
          >
            متابعة المشاريع
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div 
          onClick={() => setActiveSubTab('crm')}
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-[#C6A780] transition-all cursor-pointer space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">العملاء المحتملين الجدد</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold font-mono text-slate-900">{newLeadsCount}</div>
          <div className="text-xs text-blue-700 font-medium flex items-center gap-1">
            <span>تتطلب متابعة وسرعة تواصل</span>
          </div>
        </div>

        <div 
          onClick={() => setActiveSubTab('projects')}
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-[#C6A780] transition-all cursor-pointer space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">المشاريع قيد التنفيذ</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <FolderKanban className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold font-mono text-slate-900">{activeProjectsCount}</div>
          <div className="text-xs text-emerald-700 font-medium">مشاريع سكنية وتجارية نشطة</div>
        </div>

        <div 
          onClick={() => setActiveSubTab('quotations')}
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-[#C6A780] transition-all cursor-pointer space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">عروض الأسعار المعلقة</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold font-mono text-slate-900">{pendingQuotesCount}</div>
          <div className="text-xs text-amber-700 font-medium">قيد التفاوض والانتظار</div>
        </div>

        <div 
          onClick={() => setActiveSubTab('finance')}
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-[#C6A780] transition-all cursor-pointer space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">إجمالي الإيرادات المسجلة</span>
            <div className="w-10 h-10 rounded-xl bg-[#C6A780]/20 text-[#28332F] flex items-center justify-center font-bold">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold font-mono text-slate-900">{totalRevenue.toLocaleString()} ج.م</div>
          <div className="text-xs text-slate-500 font-medium">المصروفات: <span className="font-mono">{totalExpenses.toLocaleString()} ج.م</span></div>
        </div>

      </div>

      {/* Quick Action Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Recent Leads */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base">أحدث العملاء المحتملين</h3>
            <button onClick={() => setActiveSubTab('crm')} className="text-xs font-bold text-[#C6A780] hover:underline">
              عرض الكل ←
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {leads.slice(0, 4).map((lead) => (
              <div key={lead.id} className="py-3 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">{lead.customerName}</h4>
                  <p className="text-xs text-slate-500">{lead.location} • <span className="font-mono">{lead.phone}</span></p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">
                  {lead.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Active Projects */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base">المشاريع والمتابعة الهندسية</h3>
            <button onClick={() => setActiveSubTab('projects')} className="text-xs font-bold text-[#C6A780] hover:underline">
              عرض الكل ←
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {projects.map((project) => (
              <div key={project.id} className="py-3 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-slate-900">{project.name}</h4>
                  <span className="font-mono text-xs font-bold text-[#28332F]">{project.progressPercentage}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-[#C6A780] h-full rounded-full" style={{ width: `${project.progressPercentage}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
