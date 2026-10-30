import React, { useState } from 'react';
import { Lead } from '../../types';
import { Language } from '../../utils/translations';
import { X, Calculator, CheckCircle2, ArrowLeft, ArrowRight, Upload, FileText } from 'lucide-react';

interface QuoteRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddLead: (lead: Omit<Lead, 'id' | 'createdAt' | 'status'>) => void;
  language?: Language;
}

export const QuoteRequestModal: React.FC<QuoteRequestModalProps> = ({ 
  isOpen, 
  onClose, 
  onAddLead,
  language = 'ar' 
}) => {
  const [step, setStep] = useState(1);
  const [success, setSuccess] = useState(false);
  const [referenceCode, setReferenceCode] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    email: '',
    preferredContact: 'whatsapp' as 'phone' | 'whatsapp' | 'email',
    projectType: 'residential_villa' as Lead['projectType'],
    location: 'التجمع الخامس، القاهرة الجديدة',
    approxAreaSqm: 250,
    estimatedBudgetEgp: 750000,
    scope: 'تصميم داخلي وتشطيبات كاملة',
    expectedStartDate: '2026-06-01',
    notes: '',
    priority: 'high' as Lead['priority'],
    assignedToUserId: 'u2',
    nextFollowUpDate: new Date(Date.now() + 86400000).toISOString().split('T')[0]
  });

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFileName(e.target.files[0].name);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerName || !formData.phone) {
      alert(language === 'ar' ? 'يرجى إدخال الاسم ورقم الهاتف على الأقل' : 'Please provide at least your name and phone number');
      return;
    }

    const leadNotes = [
      formData.notes ? formData.notes : (language === 'ar' ? 'طلب عرض سعر عبر الموقع الإلكتروني' : 'Online quotation request'),
      ...(uploadedFileName ? [`ملف مرفق: ${uploadedFileName}`] : [])
    ];

    onAddLead({
      ...formData,
      notes: leadNotes
    });
    
    const ref = `QT-REQ-${Math.floor(100000 + Math.random() * 900000)}`;
    setReferenceCode(ref);
    setSuccess(true);
  };

  const isAr = language === 'ar';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden my-auto border border-[#C6A780]">
        
        {/* Header */}
        <div className="bg-[#28332F] text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C6A780] text-[#28332F] flex items-center justify-center font-bold">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">
                {isAr ? 'طلب عرض سعر ومعاينة مشروع' : 'Request Quotation & Site Visit'}
              </h3>
              <p className="text-xs text-[#F1E9DE]/80">
                {isAr ? 'أدخل تفاصيل مشروعك لنقوم بإعداد مقايسة فنية دقيقة' : 'Submit your property details for an itemized estimate'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#F1E9DE]/70 hover:text-white transition-colors cursor-pointer">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8">
          {success ? (
            <div className="text-center py-12 space-y-6">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">
                {isAr ? 'تم استلام طلبك وتوثيقه بنجاح!' : 'Quotation Request Received!'}
              </h3>
              <p className="text-slate-600 text-sm max-w-md mx-auto">
                {isAr ? 'الرقم المرجعي الرسمي لطلبك:' : 'Official Reference Code:'}{' '}
                <span className="font-mono font-bold text-[#28332F] text-base">{referenceCode}</span>.
                <br />
                {isAr 
                  ? 'تم إرسال الطلب إلى نظام إدارة العملاء وسيقوم مهندس مخصص بالتواصل معك خلال ساعتين.'
                  : 'Your request is recorded in CRM. An assigned engineer will contact you shortly.'}
              </p>
              <button
                onClick={() => { setSuccess(false); setStep(1); onClose(); }}
                className="bg-[#28332F] text-white px-8 py-3.5 rounded-xl text-sm font-bold shadow-md cursor-pointer"
              >
                {isAr ? 'إغلاق النافذة' : 'Close Window'}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Step indicator */}
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 border-b border-slate-100 pb-4">
                <span className={step === 1 ? 'text-[#28332F] font-bold' : ''}>
                  {isAr ? '1. البيانات الشخصية' : '1. Contact Details'}
                </span>
                <span>{isAr ? '←' : '→'}</span>
                <span className={step === 2 ? 'text-[#28332F] font-bold' : ''}>
                  {isAr ? '2. تفاصيل العقار' : '2. Property Specs'}
                </span>
                <span>{isAr ? '←' : '→'}</span>
                <span className={step === 3 ? 'text-[#28332F] font-bold' : ''}>
                  {isAr ? '3. الميزانية والملفات' : '3. Budget & Review'}
                </span>
              </div>

              {step === 1 && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700">
                      {isAr ? 'الاسم الكريم *' : 'Full Name *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.customerName}
                      onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                      placeholder={isAr ? 'مثال: م. طارق المنشاوي' : 'e.g. Tarek Mansour'}
                      className="w-full bg-[#F1E9DE]/30 border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#C6A780]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700">
                      {isAr ? 'رقم الهاتف (واتساب) *' : 'Phone / WhatsApp *'}
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+20 10xxxxxxxx"
                      className="w-full bg-[#F1E9DE]/30 border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#C6A780]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700">
                      {isAr ? 'البريد الإلكتروني' : 'Email Address'}
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="name@example.com"
                      className="w-full bg-[#F1E9DE]/30 border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#C6A780]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700">
                      {isAr ? 'طريقة التواصل المفضلة' : 'Preferred Contact Channel'}
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: 'whatsapp', label: isAr ? 'واتساب' : 'WhatsApp' },
                        { id: 'phone', label: isAr ? 'اتصال هاتفي' : 'Phone Call' },
                        { id: 'email', label: isAr ? 'البريد' : 'Email' },
                      ].map(m => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, preferredContact: m.id as any })}
                          className={`py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            formData.preferredContact === m.id
                              ? 'bg-[#28332F] text-white border-[#28332F]'
                              : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700">
                      {isAr ? 'نوع المشروع أو العقار' : 'Property Type'}
                    </label>
                    <select
                      value={formData.projectType}
                      onChange={(e) => setFormData({ ...formData, projectType: e.target.value as any })}
                      className="w-full bg-[#F1E9DE]/30 border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#C6A780]"
                    >
                      <option value="residential_villa">{isAr ? 'فيلا سكنية مستقلة / قصر' : 'Residential Villa / Palace'}</option>
                      <option value="apartment">{isAr ? 'شقة سكنية / بنتهاوس' : 'Apartment / Penthouse'}</option>
                      <option value="commercial_office">{isAr ? 'مقر إداري أو شركة' : 'Corporate Office / Commercial'}</option>
                      <option value="renovation">{isAr ? 'تجديد وتشطيب عام' : 'Full Renovation'}</option>
                      <option value="joinery">{isAr ? 'أثاث مخصص وديكور خشبي' : 'Bespoke Joinery & Furniture'}</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700">
                      {isAr ? 'منطقة وموقع المشروع في مصر' : 'Location in Egypt'}
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder={isAr ? 'مثال: التجمع الخامس، الشيخ زايد، الزمالك' : 'e.g. New Cairo, Sheikh Zayed, Zamalek'}
                      className="w-full bg-[#F1E9DE]/30 border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#C6A780]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700">
                      {isAr ? 'المساحة التقريبية (متر مربع)' : 'Approximate Area (sqm)'}
                    </label>
                    <input
                      type="number"
                      value={formData.approxAreaSqm}
                      onChange={(e) => setFormData({ ...formData, approxAreaSqm: Number(e.target.value) })}
                      className="w-full bg-[#F1E9DE]/30 border border-slate-300 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-[#C6A780]"
                    />
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700">
                      {isAr ? 'الميزانية التقديرية (جنيه مصري EGP)' : 'Estimated Budget (EGP)'}
                    </label>
                    <input
                      type="number"
                      step={50000}
                      value={formData.estimatedBudgetEgp}
                      onChange={(e) => setFormData({ ...formData, estimatedBudgetEgp: Number(e.target.value) })}
                      className="w-full bg-[#F1E9DE]/30 border border-slate-300 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-[#C6A780]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700">
                      {isAr ? 'نطاق العمل المطلوب' : 'Scope of Work'}
                    </label>
                    <textarea
                      rows={2}
                      value={formData.scope}
                      onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
                      placeholder={isAr ? 'اكتب تفاصيل التشطيبات أو التصميم المطلوب...' : 'Describe finishing package or design concept...'}
                      className="w-full bg-[#F1E9DE]/30 border border-slate-300 rounded-xl p-3 text-sm focus:outline-none focus:border-[#C6A780]"
                    ></textarea>
                  </div>

                  {/* Document / Blueprint Upload Simulation */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700">
                      {isAr ? 'إرفاق مخطط أو صورة مرجعية (اختياري)' : 'Upload Blueprint / Reference Image (Optional)'}
                    </label>
                    <div className="border border-dashed border-slate-300 rounded-xl p-4 bg-slate-50 text-center hover:bg-slate-100 transition-colors relative cursor-pointer">
                      <input
                        type="file"
                        accept="image/*,.pdf,.dwg"
                        onChange={handleFileUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      <div className="flex flex-col items-center justify-center gap-1.5">
                        <Upload className="w-5 h-5 text-[#C6A780]" />
                        {uploadedFileName ? (
                          <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                            <FileText className="w-3.5 h-3.5" />
                            {uploadedFileName}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-500">
                            {isAr ? 'اضغط لاختيار ملف المخطط المعماري أو الصور' : 'Click to select architectural CAD/PDF file'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={() => setStep(step - 1)}
                    className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 rounded-xl text-sm font-bold cursor-pointer"
                  >
                    {isAr ? <><ArrowRight className="w-4 h-4" /> السابق</> : <><ArrowLeft className="w-4 h-4" /> Back</>}
                  </button>
                ) : <div></div>}

                {step < 3 ? (
                  <button
                    type="button"
                    onClick={() => setStep(step + 1)}
                    className="flex items-center gap-2 bg-[#28332F] hover:bg-[#1b2320] text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-md cursor-pointer"
                  >
                    {isAr ? <>التالي <ArrowLeft className="w-4 h-4 text-[#C6A780]" /></> : <>Next <ArrowRight className="w-4 h-4 text-[#C6A780]" /></>}
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="flex items-center gap-2 bg-[#C6A780] hover:bg-[#b0916b] text-[#28332F] px-8 py-3 rounded-xl text-sm font-bold shadow-lg cursor-pointer"
                  >
                    {isAr ? 'إرسال طلب المقايسة الآن' : 'Submit Quotation Request'}
                  </button>
                )}
              </div>

            </form>
          )}
        </div>

      </div>
    </div>
  );
};
