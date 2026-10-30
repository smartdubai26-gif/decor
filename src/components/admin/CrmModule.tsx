import React, { useState } from 'react';
import { Lead, Customer, Project, Quotation } from '../../types';
import { Users, Phone, Mail, MapPin, Calendar, Plus, CheckCircle2, ArrowLeft, AlertTriangle, Kanban, List, MessageSquare } from 'lucide-react';

interface CrmModuleProps {
  leads: Lead[];
  setLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  quotations: Quotation[];
}

export const CrmModule: React.FC<CrmModuleProps> = ({
  leads,
  setLeads,
  customers,
  setCustomers,
  projects,
  setProjects,
  quotations,
}) => {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('kanban');
  const [showNewLeadModal, setShowNewLeadModal] = useState(false);
  const [lossModalLeadId, setLossModalLeadId] = useState<string | null>(null);
  const [lossReasonText, setLossReasonText] = useState('');
  const [newNoteText, setNewNoteText] = useState('');

  const [newLeadData, setNewLeadData] = useState({
    customerName: '',
    phone: '',
    email: '',
    projectType: 'residential_villa' as Lead['projectType'],
    location: 'التجمع الخامس',
    approxAreaSqm: 300,
    estimatedBudgetEgp: 900000,
    scope: 'تصميم داخلي وتشطيبات',
    expectedStartDate: '2026-06-01'
  });

  const statuses: { id: Lead['status']; label: string; color: string }[] = [
    { id: 'new', label: 'جديد (New)', color: 'border-blue-400 bg-blue-50/50' },
    { id: 'contacted', label: 'تم التواصل', color: 'border-sky-400 bg-sky-50/50' },
    { id: 'qualified', label: 'مؤهل', color: 'border-indigo-400 bg-indigo-50/50' },
    { id: 'site_visit', label: 'معاينة موقع', color: 'border-purple-400 bg-purple-50/50' },
    { id: 'quotation_prepared', label: 'مقايسة جاهزة', color: 'border-amber-400 bg-amber-50/50' },
    { id: 'negotiation', label: 'تفاوض', color: 'border-orange-400 bg-orange-50/50' },
    { id: 'won', label: 'تم التعاقد (Won)', color: 'border-emerald-500 bg-emerald-50/50' },
    { id: 'lost', label: 'مفقود (Lost)', color: 'border-rose-400 bg-rose-50/50' },
  ];

  const handleAddLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadData.customerName || !newLeadData.phone) return;

    // Duplicate check using normalized phone numbers
    const cleanPhone = newLeadData.phone.replace(/[^0-9]/g, '');
    const exists = leads.some(l => l.phone.replace(/[^0-9]/g, '') === cleanPhone);
    if (exists) {
      if (!confirm('تنبيه: يوجد مسبقاً عميل مسجل برقم الهاتف هذا. هل تريد الاستمرار في إضافة العميل المحتمل؟')) {
        return;
      }
    }

    const created: Lead = {
      id: `l-${Date.now()}`,
      ...newLeadData,
      preferredContact: 'whatsapp',
      status: 'new',
      priority: 'high',
      assignedToUserId: 'u2',
      nextFollowUpDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      notes: ['تم تسجيل العميل المحتمل عبر لوحة الإدارة'],
      createdAt: new Date().toISOString().split('T')[0]
    };

    setLeads([created, ...leads]);
    setShowNewLeadModal(false);
    setNewLeadData({
      customerName: '',
      phone: '',
      email: '',
      projectType: 'residential_villa',
      location: 'التجمع الخامس',
      approxAreaSqm: 300,
      estimatedBudgetEgp: 900000,
      scope: 'تصميم داخلي وتشطيبات',
      expectedStartDate: '2026-06-01'
    });
  };

  const handleStatusChange = (leadId: string, newStatus: Lead['status']) => {
    if (newStatus === 'lost') {
      setLossModalLeadId(leadId);
      return;
    }

    setLeads(leads.map(l => {
      if (l.id === leadId) {
        // Controlled conversion: when won, create customer + project
        if (newStatus === 'won') {
          const customerId = `c-${Date.now()}`;
          const newCustomer: Customer = {
            id: customerId,
            name: l.customerName,
            phone: l.phone,
            email: l.email,
            address: l.location,
            totalProjects: 1,
            createdAt: new Date().toISOString().split('T')[0]
          };
          setCustomers([newCustomer, ...customers]);

          const newProject: Project = {
            id: `pr-${Date.now()}`,
            projectNumber: `PRJ-2026-${Math.floor(100 + Math.random() * 900)}`,
            name: `مشروع ${l.customerName} - ${l.location}`,
            customerId: customerId,
            customerName: l.customerName,
            address: l.location,
            scope: l.scope,
            projectManagerId: 'u3',
            startDate: l.expectedStartDate,
            targetCompletionDate: new Date(Date.now() + 180 * 86400000).toISOString().split('T')[0],
            status: 'planned',
            contractValueEgp: l.estimatedBudgetEgp,
            actualExpensesEgp: 0,
            progressPercentage: 0,
            notes: `تم التعاقد والتحويل التلقائي من العميل المحتمل #${l.id}`,
            imageCover: '/src/assets/images/portfolio_villa_new_cairo_1792469679890.jpg'
          };
          setProjects([newProject, ...projects]);
        }
        return { ...l, status: newStatus };
      }
      return l;
    }));
  };

  const handleConfirmLost = () => {
    if (!lossModalLeadId) return;
    setLeads(leads.map(l => {
      if (l.id === lossModalLeadId) {
        return { 
          ...l, 
          status: 'lost', 
          lossReason: lossReasonText || 'ميزانية غير متوافقة أو اتجاه لمقاول آخر',
          notes: [...l.notes, `تم تصنيف العميل كـ Lost: ${lossReasonText || 'بدون سبب محدد'}`]
        };
      }
      return l;
    }));
    setLossModalLeadId(null);
    setLossReasonText('');
  };

  const handleAddNote = () => {
    if (!selectedLead || !newNoteText.trim()) return;
    const updatedNotes = [...selectedLead.notes, `${new Date().toLocaleDateString('ar-EG')}: ${newNoteText.trim()}`];
    const updatedLead = { ...selectedLead, notes: updatedNotes };
    setSelectedLead(updatedLead);
    setLeads(leads.map(l => l.id === selectedLead.id ? updatedLead : l));
    setNewNoteText('');
  };

  const filteredLeads = filterStatus === 'all'
    ? leads
    : leads.filter(l => l.status === filterStatus);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">إدارة العملاء المحتملين (CRM Pipeline)</h2>
          <p className="text-xs text-slate-500 mt-1">متابعة مسار المبيعات من الطلب الأولي حتى توقيع العقد وتسليم المشروع.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${viewMode === 'kanban' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'}`}
            >
              <Kanban className="w-3.5 h-3.5" /> كانبان
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${viewMode === 'table' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'}`}
            >
              <List className="w-3.5 h-3.5" /> جدول
            </button>
          </div>

          <button
            onClick={() => setShowNewLeadModal(true)}
            className="flex items-center gap-2 bg-[#28332F] hover:bg-[#1b2320] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#C6A780]" />
            إضافة عميل محتمل
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            filterStatus === 'all'
              ? 'bg-[#C6A780] text-[#28332F] shadow-2xs'
              : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          كافة الحالات ({leads.length})
        </button>
        {statuses.map(st => {
          const count = leads.filter(l => l.status === st.id).length;
          return (
            <button
              key={st.id}
              onClick={() => setFilterStatus(st.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                filterStatus === st.id
                  ? 'bg-[#28332F] text-white shadow-2xs'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              {st.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Kanban Board View */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto pb-4">
          {statuses.map(st => {
            const colLeads = leads.filter(l => l.status === st.id);
            return (
              <div key={st.id} className="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-3 min-w-[280px]">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="font-bold text-xs text-slate-800">{st.label}</span>
                  <span className="text-[11px] font-mono font-bold bg-white px-2 py-0.5 rounded-full border border-slate-200 text-slate-600">
                    {colLeads.length}
                  </span>
                </div>

                <div className="space-y-3 min-h-[150px]">
                  {colLeads.map(lead => (
                    <div
                      key={lead.id}
                      className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-[#C6A780] transition-all space-y-2 cursor-pointer"
                      onClick={() => setSelectedLead(lead)}
                    >
                      <div className="flex items-start justify-between">
                        <h4 className="font-bold text-sm text-slate-900">{lead.customerName}</h4>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm bg-slate-100 text-slate-600">
                          {lead.priority}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 font-mono flex items-center gap-1">
                        <Phone className="w-3 h-3 text-[#C6A780]" /> {lead.phone}
                      </div>
                      <div className="text-xs text-slate-600 line-clamp-1">{lead.location}</div>
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                        <span className="font-mono font-bold text-[#28332F]">{lead.estimatedBudgetEgp.toLocaleString()} ج.م</span>
                        <span className="text-[10px] text-slate-400 font-mono">{lead.createdAt}</span>
                      </div>
                    </div>
                  ))}
                  {colLeads.length === 0 && (
                    <div className="text-center py-8 text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
                      لا توجد طلبات في هذه المرحلة
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600">
                  <th className="py-3.5 px-6">اسم العميل</th>
                  <th className="py-3.5 px-6">الهاتف والموقع</th>
                  <th className="py-3.5 px-6">نوع المشروع والمساحة</th>
                  <th className="py-3.5 px-6">الميزانية التقديرية</th>
                  <th className="py-3.5 px-6">تغيير الحالة</th>
                  <th className="py-3.5 px-6 text-left">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-4 font-bold text-slate-900">
                      {lead.customerName}
                      <div className="text-xs text-slate-500 font-normal mt-0.5">{lead.email || 'بدون بريد'}</div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-mono text-xs">{lead.phone}</span>
                      <div className="text-xs text-slate-500 mt-0.5">{lead.location}</div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-xs font-semibold text-slate-700">{lead.projectType}</span>
                      <div className="text-xs text-slate-500 font-mono mt-0.5">{lead.approxAreaSqm} م٢</div>
                    </td>
                    <td className="py-4 px-4 font-mono font-bold text-[#28332F]">
                      {lead.estimatedBudgetEgp.toLocaleString()} ج.م
                    </td>
                    <td className="py-4 px-4">
                      <select
                        value={lead.status}
                        onChange={(e) => handleStatusChange(lead.id, e.target.value as Lead['status'])}
                        className="bg-slate-100 border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
                      >
                        {statuses.map(s => (
                          <option key={s.id} value={s.id}>{s.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-4 px-4 text-left">
                      <button
                        onClick={() => setSelectedLead(lead)}
                        className="text-xs font-bold text-[#28332F] bg-[#C6A780]/20 hover:bg-[#C6A780]/30 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                      >
                        الملف الكامل
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* New Lead Modal */}
      {showNewLeadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden p-6 space-y-6">
            <h3 className="text-lg font-bold text-slate-900">إضافة عميل محتمل جديد يدويًا</h3>
            <form onSubmit={handleAddLead} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700">اسم العميل *</label>
                <input
                  type="text"
                  required
                  value={newLeadData.customerName}
                  onChange={(e) => setNewLeadData({ ...newLeadData, customerName: e.target.value })}
                  placeholder="مثال: م. طارق المنشاوي"
                  className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm mt-1 focus:outline-none focus:border-[#C6A780]"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700">رقم الهاتف (الواتساب) *</label>
                <input
                  type="tel"
                  required
                  value={newLeadData.phone}
                  onChange={(e) => setNewLeadData({ ...newLeadData, phone: e.target.value })}
                  placeholder="+20 10xxxxxxxx"
                  className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-mono mt-1 focus:outline-none focus:border-[#C6A780]"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700">الموقع في مصر</label>
                <input
                  type="text"
                  value={newLeadData.location}
                  onChange={(e) => setNewLeadData({ ...newLeadData, location: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm mt-1 focus:outline-none focus:border-[#C6A780]"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700">الميزانية التقديرية (ج.م)</label>
                <input
                  type="number"
                  value={newLeadData.estimatedBudgetEgp}
                  onChange={(e) => setNewLeadData({ ...newLeadData, estimatedBudgetEgp: Number(e.target.value) })}
                  className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-mono mt-1 focus:outline-none focus:border-[#C6A780]"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowNewLeadModal(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="bg-[#28332F] text-white px-6 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
                >
                  حفظ العميل المحتمل
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lost Reason Modal */}
      {lossModalLeadId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden p-6 space-y-4">
            <div className="flex items-center gap-2 text-rose-600 font-bold">
              <AlertTriangle className="w-5 h-5" />
              <span>تسجيل سبب خسارة العميل (Lost Reason)</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              يرجى توضيح سبب عدم إتمام التعاقد لتوثيق التحليلات وتطوير استراتيجية المبيعات.
            </p>
            <textarea
              rows={3}
              value={lossReasonText}
              onChange={(e) => setLossReasonText(e.target.value)}
              placeholder="مثال: الميزانية أقل من الحد الأدنى للتشطيب، أو التعاقد مع شركة أخرى..."
              className="w-full border border-slate-300 rounded-xl p-3 text-xs focus:outline-none focus:border-rose-500"
            ></textarea>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setLossModalLeadId(null)}
                className="px-4 py-2 rounded-xl text-xs text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                إلغاء
              </button>
              <button
                onClick={handleConfirmLost}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white cursor-pointer shadow-sm"
              >
                تأكيد كـ Lost
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lead Detail & Activity Notes Modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden p-8 space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-bold text-[#C6A780] uppercase">ملف العميل المحتمل</span>
                <h3 className="text-xl font-bold text-slate-900 mt-1">{selectedLead.customerName}</h3>
              </div>
              <button onClick={() => setSelectedLead(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">✕</button>
            </div>

            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl text-xs">
              <div>
                <span className="text-slate-500 block">الهاتف:</span>
                <span className="font-mono font-bold text-slate-900">{selectedLead.phone}</span>
              </div>
              <div>
                <span className="text-slate-500 block">الموقع:</span>
                <span className="font-bold text-slate-900">{selectedLead.location}</span>
              </div>
              <div>
                <span className="text-slate-500 block">الميزانية:</span>
                <span className="font-mono font-bold text-slate-900">{selectedLead.estimatedBudgetEgp.toLocaleString()} ج.م</span>
              </div>
              <div>
                <span className="text-slate-500 block">المساحة:</span>
                <span className="font-mono font-bold text-slate-900">{selectedLead.approxAreaSqm} م٢</span>
              </div>
              {selectedLead.lossReason && (
                <div className="col-span-2 text-rose-700 bg-rose-50 p-2 rounded-lg">
                  <strong>سبب الإلغاء:</strong> {selectedLead.lossReason}
                </div>
              )}
            </div>

            {/* Notes history & add note */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-700">سجل الأنشطة والملاحظات الهندسية:</span>
              <ul className="bg-slate-50 p-4 rounded-xl space-y-2 text-xs text-slate-700 max-h-40 overflow-y-auto">
                {selectedLead.notes.map((note, i) => (
                  <li key={i} className="border-b border-slate-200 pb-1.5 last:border-0">{note}</li>
                ))}
              </ul>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  placeholder="أضف ملاحظة أو نتيجة اتصال..."
                  className="flex-1 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C6A780]"
                />
                <button
                  onClick={handleAddNote}
                  className="bg-[#28332F] text-white px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
                >
                  إضافة
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={() => setSelectedLead(null)}
                className="bg-[#28332F] text-white px-6 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
