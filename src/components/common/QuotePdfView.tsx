import React from 'react';
import { Quotation, CompanySettings } from '../../types';
import { Printer, Download, CheckCircle2, Building, Phone, Mail, MapPin } from 'lucide-react';

interface QuotePdfViewProps {
  quotation: Quotation;
  settings: CompanySettings;
  onClose: () => void;
}

export const QuotePdfView: React.FC<QuotePdfViewProps> = ({ quotation, settings, onClose }) => {
  const activeVersion = quotation.versions[quotation.currentVersionIndex] || quotation.versions[0];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-2 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden my-auto border border-[#C6A780]">
        
        {/* Action bar (hidden in print) */}
        <div className="print:hidden bg-[#28332F] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building className="w-5 h-5 text-[#C6A780]" />
            <span className="font-bold">معاينة وطباعة عرض السعر الرسمي</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-[#C6A780] hover:bg-[#b0916b] text-[#28332F] px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm"
            >
              <Printer className="w-4 h-4" />
              طباعة أو حفظ PDF
            </button>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white px-3 py-2 text-sm font-medium transition-colors"
            >
              إغلاق
            </button>
          </div>
        </div>

        {/* Printable PDF Sheet */}
        <div className="p-8 sm:p-12 bg-white text-[#28332F] space-y-8 print:p-0">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 pb-8 gap-6">
            <div>
              <h1 className="text-2xl font-extrabold text-[#28332F] tracking-tight">
                {settings.companyName.ar}
              </h1>
              <p className="text-sm text-slate-600 mt-1">{settings.tagline.ar}</p>
              <div className="flex flex-wrap gap-4 mt-3 text-xs text-slate-500">
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-[#C6A780]" /> {settings.address.ar}</span>
                <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-[#C6A780]" /> {settings.phone}</span>
                <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-[#C6A780]" /> {settings.email}</span>
              </div>
            </div>

            <div className="text-left sm:text-right bg-[#F1E9DE]/60 p-4 rounded-xl border border-[#C6A780]/30 min-w-[240px]">
              <div className="text-xs text-slate-500">رقم المستند الرسمي</div>
              <div className="text-lg font-mono font-bold text-[#28332F]">{quotation.quotationNumber}</div>
              <div className="text-xs text-slate-500 mt-2">تاريخ الإصدار: <span className="font-semibold">{quotation.issueDate}</span></div>
              <div className="text-xs text-slate-500">صالح حتى: <span className="font-semibold">{quotation.expiryDate}</span></div>
            </div>
          </div>

          {/* Client Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-xl border border-slate-200">
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">العميل الكريم</div>
              <div className="text-lg font-bold text-slate-900">{quotation.customerName}</div>
              <div className="text-sm text-slate-600 mt-1">رقم المعرف: <span className="font-mono">{quotation.customerId}</span></div>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">شروط الدفع والإعداد</div>
              <div className="text-sm text-slate-700 font-medium">{quotation.paymentTerms}</div>
              <div className="text-xs text-slate-500 mt-1">أعده: <span className="font-semibold">{quotation.preparedBy}</span></div>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-[#28332F] text-white text-xs uppercase tracking-wider">
                  <th className="py-3 px-4 rounded-r-lg">البيان والوصف الفني</th>
                  <th className="py-3 px-4">الكمية</th>
                  <th className="py-3 px-4">الوحدة</th>
                  <th className="py-3 px-4">سعر الوحدة (ج.م)</th>
                  <th className="py-3 px-4">الخصم</th>
                  <th className="py-3 px-4 rounded-l-lg">الإجمالي (ج.م)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {activeVersion.items.map((item, index) => (
                  <tr key={item.id || index} className="hover:bg-slate-50/80">
                    <td className="py-4 px-4 font-medium text-slate-900">{item.description}</td>
                    <td className="py-4 px-4 font-mono">{item.quantity}</td>
                    <td className="py-4 px-4 text-slate-600">{item.unit}</td>
                    <td className="py-4 px-4 font-mono">{item.unitPriceEgp.toLocaleString()}</td>
                    <td className="py-4 px-4 font-mono text-emerald-600">{item.discountPercentage > 0 ? `${item.discountPercentage}%` : '-'}</td>
                    <td className="py-4 px-4 font-mono font-bold text-slate-900">{item.totalEgp.toLocaleString()} ج.م</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Summary */}
          <div className="flex justify-end pt-4">
            <div className="w-full sm:w-80 space-y-2 bg-[#F1E9DE]/50 p-6 rounded-2xl border border-[#C6A780]/30">
              <div className="flex justify-between text-sm text-slate-600">
                <span>المجموع الجزئي:</span>
                <span className="font-mono font-semibold">{activeVersion.subtotalEgp.toLocaleString()} ج.م</span>
              </div>
              {activeVersion.discountEgp > 0 && (
                <div className="flex justify-between text-sm text-emerald-700">
                  <span>إجمالي الخصم:</span>
                  <span className="font-mono font-semibold">-{activeVersion.discountEgp.toLocaleString()} ج.م</span>
                </div>
              )}
              <div className="flex justify-between text-sm text-slate-600">
                <span>ضريبة القيمة المضافة ({activeVersion.taxRate}%):</span>
                <span className="font-mono font-semibold">{activeVersion.taxAmountEgp.toLocaleString()} ج.م</span>
              </div>
              <div className="border-t border-[#C6A780]/40 pt-3 flex justify-between text-lg font-bold text-[#28332F]">
                <span>المبلغ الإجمالي النهائي:</span>
                <span className="font-mono text-xl text-[#28332F]">{activeVersion.grandTotalEgp.toLocaleString()} ج.م</span>
              </div>
            </div>
          </div>

          {/* Notes & Terms */}
          <div className="border-t border-slate-200 pt-6 space-y-4 text-xs text-slate-600">
            <div>
              <span className="font-bold text-slate-900">ملاحظات وشروط المشروع:</span>
              <p className="mt-1">{quotation.notes}</p>
            </div>
            <div>
              <span className="font-bold text-slate-900">معلومات الحساب البنكي للتحويل:</span>
              <p className="mt-1 font-mono">{settings.bankInfo}</p>
            </div>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-12 pt-12 border-t border-slate-200 text-center">
            <div>
              <div className="text-xs text-slate-500 mb-12">توقيع وختم الشركة</div>
              <div className="font-bold text-slate-900 border-t border-dashed border-slate-300 pt-2 w-48 mx-auto">{settings.companyName.ar}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500 mb-12">توقيع العميل أو الموافقة المعتمدة</div>
              <div className="font-bold text-slate-900 border-t border-dashed border-slate-300 pt-2 w-48 mx-auto">{quotation.customerName}</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
