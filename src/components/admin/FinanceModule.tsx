import React, { useState } from 'react';
import { Payment, Expense, Project } from '../../types';
import { Wallet, TrendingUp, TrendingDown, Plus, X, CheckCircle2 } from 'lucide-react';

interface FinanceModuleProps {
  payments: Payment[];
  setPayments: React.Dispatch<React.SetStateAction<Payment[]>>;
  expenses: Expense[];
  setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
  projects: Project[];
}

export const FinanceModule: React.FC<FinanceModuleProps> = ({
  payments,
  setPayments,
  expenses,
  setExpenses,
  projects,
}) => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);

  // New Payment Form State
  const [newPayment, setNewPayment] = useState({
    projectId: projects[0]?.id || 'pr1',
    customerName: 'أ. هالة فؤاد',
    amountEgp: 250000,
    paymentDate: new Date().toISOString().split('T')[0],
    method: 'instapay' as Payment['method'],
    referenceNumber: 'INSTA-884920',
    notes: 'دفعة مرحلية من أعمال التشطيب'
  });

  // New Expense Form State
  const [newExpense, setNewExpense] = useState({
    projectId: projects[0]?.id || 'pr1',
    category: 'materials' as Expense['category'],
    description: 'شراء رخام كرارة وبورسلين إسباني',
    amountEgp: 180000,
    expenseDate: new Date().toISOString().split('T')[0],
    supplierName: 'معارض رخام شق التعبان'
  });

  const totalIncome = payments.reduce((acc, p) => acc + p.amountEgp, 0);
  const totalExpense = expenses.reduce((acc, e) => acc + e.amountEgp, 0);
  const netBalance = totalIncome - totalExpense;

  const handleAddPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const proj = projects.find(p => p.id === newPayment.projectId);
    const created: Payment = {
      id: `pay-${Date.now()}`,
      projectId: newPayment.projectId,
      projectName: proj ? proj.name : 'مشروع تشطيب',
      customerId: proj ? proj.customerId : 'c1',
      customerName: newPayment.customerName,
      amountEgp: Number(newPayment.amountEgp),
      paymentDate: newPayment.paymentDate,
      method: newPayment.method,
      referenceNumber: newPayment.referenceNumber,
      notes: newPayment.notes
    };
    setPayments([created, ...payments]);
    setShowPaymentModal(false);
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const proj = projects.find(p => p.id === newExpense.projectId);
    const created: Expense = {
      id: `exp-${Date.now()}`,
      projectId: newExpense.projectId,
      projectName: proj ? proj.name : 'مشروع تشطيب',
      category: newExpense.category,
      description: newExpense.description,
      amountEgp: Number(newExpense.amountEgp),
      expenseDate: newExpense.expenseDate,
      supplierName: newExpense.supplierName
    };
    setExpenses([created, ...expenses]);
    setShowExpenseModal(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Header and Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">الإدارة المالية وتدفقات المشاريع (Financial Tracking)</h2>
          <p className="text-xs text-slate-500 mt-1">تسجيل تحصيلات العملاء، مصروفات الموردين، وإجمالي الأرباح التشغيلية.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowPaymentModal(true)}
            className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            تسجيل دفعة واردة
          </button>
          <button
            onClick={() => setShowExpenseModal(true)}
            className="flex items-center gap-1.5 bg-rose-700 hover:bg-rose-800 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            تسجيل مصروف جديد
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <span className="text-xs font-bold text-slate-500">إجمالي الدفعات الواردة المحصلة</span>
          <div className="text-3xl font-extrabold font-mono text-emerald-700">{totalIncome.toLocaleString()} ج.م</div>
          <p className="text-[10px] text-slate-400">من إجمالي {payments.length} معاملة تحصيل</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <span className="text-xs font-bold text-slate-500">إجمالي المصروفات المنفذة</span>
          <div className="text-3xl font-extrabold font-mono text-rose-700">{totalExpense.toLocaleString()} ج.م</div>
          <p className="text-[10px] text-slate-400">خامات، مقاولي باطن، وعمالة</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <span className="text-xs font-bold text-slate-500">صافي السيولة النقدية التشغيلية</span>
          <div className="text-3xl font-extrabold font-mono text-[#28332F]">{netBalance.toLocaleString()} ج.م</div>
          <p className="text-[10px] text-slate-400">فائض السيولة المحقق للمشاريع</p>
        </div>
      </div>

      {/* Payments & Expenses Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Payments Table */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base">دفعات العملاء المستلمة</h3>
            <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-full">
              {payments.length} عمليات تحصيل
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600">
                  <th className="py-2.5 px-3">العميل والمشروع</th>
                  <th className="py-2.5 px-3">الطريقة والمرجع</th>
                  <th className="py-2.5 px-3">التاريخ</th>
                  <th className="py-2.5 px-3">المبلغ (ج.م)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map(p => (
                  <tr key={p.id}>
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{p.customerName}</div>
                      <div className="text-slate-500 text-[10px]">{p.projectName}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-slate-700 uppercase">{p.method}</span>
                      <div className="text-slate-400 font-mono text-[10px]">{p.referenceNumber}</div>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-600">{p.paymentDate}</td>
                    <td className="py-3 px-3 font-mono font-bold text-emerald-700">+{p.amountEgp.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Expenses Table */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base">سجل المصروفات ومستخلصات التنفيذ</h3>
            <span className="text-xs text-rose-700 font-bold bg-rose-50 px-2.5 py-1 rounded-full">
              {expenses.length} فواتير مسجلة
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600">
                  <th className="py-2.5 px-3">البند والتصنيف</th>
                  <th className="py-2.5 px-3">المورد / المقاول</th>
                  <th className="py-2.5 px-3">التاريخ</th>
                  <th className="py-2.5 px-3">المبلغ (ج.م)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {expenses.map(e => (
                  <tr key={e.id}>
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{e.description}</div>
                      <div className="text-slate-500 text-[10px] capitalize">{e.category}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-700 font-medium">{e.supplierName}</td>
                    <td className="py-3 px-3 font-mono text-slate-600">{e.expenseDate}</td>
                    <td className="py-3 px-3 font-mono font-bold text-rose-700">-{e.amountEgp.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Record Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-slate-900 text-base">تسجيل دفعة عميل جديدة</h3>
              <button onClick={() => setShowPaymentModal(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddPayment} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700">المشروع</label>
                <select
                  value={newPayment.projectId}
                  onChange={(e) => setNewPayment({ ...newPayment, projectId: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs mt-1"
                >
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700">اسم العميل</label>
                <input
                  type="text"
                  required
                  value={newPayment.customerName}
                  onChange={(e) => setNewPayment({ ...newPayment, customerName: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700">المبلغ المحصل (ج.م)</label>
                <input
                  type="number"
                  required
                  value={newPayment.amountEgp}
                  onChange={(e) => setNewPayment({ ...newPayment, amountEgp: Number(e.target.value) })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700">طريقة التحصيل</label>
                <select
                  value={newPayment.method}
                  onChange={(e) => setNewPayment({ ...newPayment, method: e.target.value as any })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs mt-1"
                >
                  <option value="instapay">انستاباي (InstaPay)</option>
                  <option value="bank_transfer">تحويل بنكي رسمي</option>
                  <option value="cash">نقداً بالمقر</option>
                  <option value="cheque">شيك مصرفي</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700">رقم المرجع / الإيصال</label>
                <input
                  type="text"
                  value={newPayment.referenceNumber}
                  onChange={(e) => setNewPayment({ ...newPayment, referenceNumber: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono mt-1"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white cursor-pointer"
                >
                  حفظ الدفعة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Expense Modal */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-slate-900 text-base">تسجيل مصروف أو مستخلص جديد</h3>
              <button onClick={() => setShowExpenseModal(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddExpense} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700">المشروع</label>
                <select
                  value={newExpense.projectId}
                  onChange={(e) => setNewExpense({ ...newExpense, projectId: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs mt-1"
                >
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700">التصنيف</label>
                <select
                  value={newExpense.category}
                  onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value as any })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs mt-1"
                >
                  <option value="materials">مواد وخامات إنشائية</option>
                  <option value="labor">أجور عمالة يومية</option>
                  <option value="subcontractor">مقاول باطن</option>
                  <option value="transport">نقل وتوريدات</option>
                  <option value="permits">تراخيص ورسوم رسمية</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700">البيان والوصف</label>
                <input
                  type="text"
                  required
                  value={newExpense.description}
                  onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                  placeholder="مثال: شراء كابلات كهربائية ومواسير..."
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700">المورد أو المقاول</label>
                <input
                  type="text"
                  required
                  value={newExpense.supplierName}
                  onChange={(e) => setNewExpense({ ...newExpense, supplierName: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700">المبلغ المدفوع (ج.م)</label>
                <input
                  type="number"
                  required
                  value={newExpense.amountEgp}
                  onChange={(e) => setNewExpense({ ...newExpense, amountEgp: Number(e.target.value) })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono mt-1"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-700 hover:bg-rose-800 text-white cursor-pointer"
                >
                  حفظ المصروف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
