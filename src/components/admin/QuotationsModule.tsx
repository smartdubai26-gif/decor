import React, { useState } from 'react';
import { Quotation, QuotationItem, QuotationVersion, Customer, CompanySettings } from '../../types';
import { FileText, Plus, Printer, CheckCircle2, Trash2, Edit3, X } from 'lucide-react';
import { QuotePdfView } from '../common/QuotePdfView';

interface QuotationsModuleProps {
  quotations: Quotation[];
  setQuotations: React.Dispatch<React.SetStateAction<Quotation[]>>;
  customers: Customer[];
  settings: CompanySettings;
}

export const QuotationsModule: React.FC<QuotationsModuleProps> = ({
  quotations,
  setQuotations,
  customers,
  settings,
}) => {
  const [activePdfQuote, setActivePdfQuote] = useState<Quotation | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form state for creating a new quotation
  const [newQuoteCustomer, setNewQuoteCustomer] = useState(customers[0]?.name || 'عميل جديد');
  const [paymentTerms, setPaymentTerms] = useState('30% دفعة مقدمة، 40% أثناء التنفيذ، 30% عند التسليم النهائي');
  const [quoteNotes, setQuoteNotes] = useState('تشمل المقايسة كافة الخامات والعمالة والإشراف الهندسي الميداني مع ضمان معتمد.');
  
  const [items, setItems] = useState<QuotationItem[]>([
    { id: '1', description: 'أعمال التأسيس والكهرباء والسباكة المعتمدة', quantity: 200, unit: 'م٢', unitPriceEgp: 750, discountPercentage: 0, totalEgp: 150000 },
    { id: '2', description: 'أعمال الأسقف المعلقة وديكورات الجبس بورد الحديثة', quantity: 200, unit: 'م٢', unitPriceEgp: 600, discountPercentage: 5, totalEgp: 114000 },
  ]);

  const [newItem, setNewItem] = useState({
    description: '',
    quantity: 100,
    unit: 'م٢',
    unitPriceEgp: 500,
    discountPercentage: 0
  });

  const addItem = () => {
    if (!newItem.description.trim()) return;
    const baseTotal = newItem.quantity * newItem.unitPriceEgp;
    const itemTotal = baseTotal * (1 - newItem.discountPercentage / 100);

    const created: QuotationItem = {
      id: `qi-${Date.now()}`,
      description: newItem.description.trim(),
      quantity: newItem.quantity,
      unit: newItem.unit,
      unitPriceEgp: newItem.unitPriceEgp,
      discountPercentage: newItem.discountPercentage,
      totalEgp: Math.round(itemTotal)
    };

    setItems([...items, created]);
    setNewItem({
      description: '',
      quantity: 100,
      unit: 'م٢',
      unitPriceEgp: 500,
      discountPercentage: 0
    });
  };

  const removeItem = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  // Calculations
  const subtotal = items.reduce((acc, item) => acc + item.totalEgp, 0);
  const taxRate = settings.defaultVatRate || 14;
  const taxAmount = Math.round(subtotal * (taxRate / 100));
  const grandTotal = subtotal + taxAmount;

  const handleSaveQuotation = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      alert('يرجى إضافة بند واحد على الأقل للمقايسة');
      return;
    }

    const version: QuotationVersion = {
      versionNumber: 1,
      createdAt: new Date().toISOString().split('T')[0],
      subtotalEgp: subtotal,
      taxRate: taxRate,
      taxAmountEgp: taxAmount,
      discountEgp: 0,
      grandTotalEgp: grandTotal,
      items: items
    };

    const newQuotation: Quotation = {
      id: `q-${Date.now()}`,
      quotationNumber: `QT-2026-${Math.floor(100 + Math.random() * 900)}`,
      customerId: `c-${Date.now()}`,
      customerName: newQuoteCustomer,
      issueDate: new Date().toISOString().split('T')[0],
      expiryDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      currency: 'EGP',
      status: 'sent',
      paymentTerms: paymentTerms,
      notes: quoteNotes,
      preparedBy: 'فريق التسعير الهندسي',
      currentVersionIndex: 0,
      versions: [version]
    };

    setQuotations([newQuotation, ...quotations]);
    setShowCreateModal(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">إدارة عروض الأسعار والمقايسات (Quotations & Estimates)</h2>
          <p className="text-xs text-slate-500 mt-1">حسابات دقيقة للكميات والأسعار، حفظ الإصدارات، وطباعة مستندات PDF معتمدة.</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-[#28332F] hover:bg-[#1b2320] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md cursor-pointer"
        >
          <Plus className="w-4 h-4 text-[#C6A780]" />
          إنشاء مقايسة جديدة
        </button>
      </div>

      {/* Quotations Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600">
                <th className="py-3.5 px-6">رقم المقايسة</th>
                <th className="py-3.5 px-6">اسم العميل</th>
                <th className="py-3.5 px-6">تاريخ الإصدار والصلاحية</th>
                <th className="py-3.5 px-6">الإجمالي (ج.م)</th>
                <th className="py-3.5 px-6">الحالة</th>
                <th className="py-3.5 px-6 text-left">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {quotations.map((q) => {
                const activeVersion = q.versions[q.currentVersionIndex] || q.versions[0];
                return (
                  <tr key={q.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-[#28332F]">{q.quotationNumber}</td>
                    <td className="py-4 px-6 font-bold text-slate-900">{q.customerName}</td>
                    <td className="py-4 px-6 text-xs text-slate-500 font-mono">
                      {q.issueDate} → {q.expiryDate}
                    </td>
                    <td className="py-4 px-6 font-mono font-bold text-slate-900">
                      {activeVersion.grandTotalEgp.toLocaleString()} ج.م
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">
                        {q.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-left">
                      <button
                        onClick={() => setActivePdfQuote(q)}
                        className="flex items-center gap-1.5 bg-[#C6A780]/20 hover:bg-[#C6A780]/30 text-[#28332F] px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        معاينة وطباعة PDF
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create New Quotation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full overflow-hidden my-auto border border-[#C6A780] p-6 sm:p-8 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-200 pb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-6 h-6 text-[#C6A780]" />
                <h3 className="text-xl font-bold text-slate-900">إنشاء مقايسة وعرض سعر تفصيلي جديد</h3>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuotation} className="space-y-6">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700">اسم العميل</label>
                  <input
                    type="text"
                    required
                    value={newQuoteCustomer}
                    onChange={(e) => setNewQuoteCustomer(e.target.value)}
                    placeholder="اسم العميل أو الجهة"
                    className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm mt-1 focus:outline-none focus:border-[#C6A780]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">شروط الدفع</label>
                  <input
                    type="text"
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm mt-1 focus:outline-none focus:border-[#C6A780]"
                  />
                </div>
              </div>

              {/* Items Table */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-700 block">بنود المقايسة والكميات:</span>
                
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700">
                      <tr>
                        <th className="py-2.5 px-3">البيان الفني</th>
                        <th className="py-2.5 px-3">الكمية</th>
                        <th className="py-2.5 px-3">الوحدة</th>
                        <th className="py-2.5 px-3">سعر الوحدة</th>
                        <th className="py-2.5 px-3">خصم %</th>
                        <th className="py-2.5 px-3">الإجمالي (ج.م)</th>
                        <th className="py-2.5 px-3"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {items.map((item) => (
                        <tr key={item.id}>
                          <td className="py-2.5 px-3 font-semibold text-slate-900">{item.description}</td>
                          <td className="py-2.5 px-3 font-mono">{item.quantity}</td>
                          <td className="py-2.5 px-3 text-slate-600">{item.unit}</td>
                          <td className="py-2.5 px-3 font-mono">{item.unitPriceEgp.toLocaleString()}</td>
                          <td className="py-2.5 px-3 font-mono text-emerald-600">{item.discountPercentage}%</td>
                          <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{item.totalEgp.toLocaleString()}</td>
                          <td className="py-2.5 px-3 text-left">
                            <button
                              type="button"
                              onClick={() => removeItem(item.id)}
                              className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Add Item Row */}
                <div className="grid grid-cols-1 sm:grid-cols-6 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200 items-end">
                  <div className="sm:col-span-2">
                    <label className="text-[10px] text-slate-500 block">وصف البند</label>
                    <input
                      type="text"
                      value={newItem.description}
                      onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                      placeholder="مثال: دهانات جوتن سوبر..."
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block">الكمية</label>
                    <input
                      type="number"
                      value={newItem.quantity}
                      onChange={(e) => setNewItem({ ...newItem, quantity: Number(e.target.value) })}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block">الوحدة</label>
                    <input
                      type="text"
                      value={newItem.unit}
                      onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block">سعر الوحدة</label>
                    <input
                      type="number"
                      value={newItem.unitPriceEgp}
                      onChange={(e) => setNewItem({ ...newItem, unitPriceEgp: Number(e.target.value) })}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={addItem}
                      className="w-full bg-[#28332F] text-white py-1.5 rounded-lg text-xs font-bold hover:bg-[#1b2320] cursor-pointer"
                    >
                      + إضافة بند
                    </button>
                  </div>
                </div>
              </div>

              {/* Totals Summary */}
              <div className="bg-[#F1E9DE]/60 p-4 rounded-xl border border-[#C6A780]/30 space-y-1.5 text-xs text-slate-700">
                <div className="flex justify-between">
                  <span>المجموع الجزئي للبنوك:</span>
                  <span className="font-mono font-bold">{subtotal.toLocaleString()} ج.م</span>
                </div>
                <div className="flex justify-between">
                  <span>ضريبة القيمة المضافة ({taxRate}%):</span>
                  <span className="font-mono font-bold">{taxAmount.toLocaleString()} ج.م</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-[#28332F] border-t border-[#C6A780]/40 pt-1.5">
                  <span>المجموع النهائي للمقايسة:</span>
                  <span className="font-mono text-base">{grandTotal.toLocaleString()} ج.م</span>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="bg-[#28332F] hover:bg-[#1b2320] text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-md cursor-pointer"
                >
                  حفظ وإصدار المقايسة
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* PDF View Modal */}
      {activePdfQuote && (
        <QuotePdfView
          quotation={activePdfQuote}
          settings={settings}
          onClose={() => setActivePdfQuote(null)}
        />
      )}

    </div>
  );
};
