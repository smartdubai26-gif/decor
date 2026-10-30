import React from 'react';
import { X, ShieldCheck } from 'lucide-react';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden my-auto border border-[#C6A780]">
        
        <div className="bg-[#28332F] text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-[#C6A780]" />
            <h3 className="text-lg font-bold">سياسة الخصوصية وشروط الاستخدام</h3>
          </div>
          <button onClick={onClose} className="text-[#F1E9DE]/70 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8 space-y-6 text-sm text-slate-700 leading-relaxed max-h-[70vh] overflow-y-auto">
          <div>
            <h4 className="font-bold text-slate-900 text-base mb-2">1. جمع واستخدام البيانات</h4>
            <p>نقوم بجمع البيانات الشخصية (مثل الاسم، رقم الهاتف، والبريد الإلكتروني) حصرياً بهدف تقديم استشارات التصميم الداخلي وإعداد مقايسات الأسعار الدقيقة لمشاريعكم.</p>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 text-base mb-2">2. حماية وتأمين البيانات</h4>
            <p>نلتزم في Artisan & Space بحماية كافة بيانات العملاء والمستندات الهندسية وعدم مشاركتها مع أي أطراف ثالثة إلا وفقاً لما تقتضيه متطلبات التنفيذ الهندسي الرسمية وبموافقة العميل.</p>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 text-base mb-2">3. حقوق الملكية الفكرية</h4>
            <p>كافة التصاميم ثلاثية الأبعاد، المخططات الهندسية، والمحتوى المنشور على المنصة هي ملكية خاضعة لحقوق النشر الخاصة بشركة أرتيزان آند سبيد.</p>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 text-base mb-2">4. الشروط العامة</h4>
            <p>جميع عروض الأسعار والأسعار المقدرة تخضع للشروط والأحكام المكتوبة في العقود الرسمية الموقعة بين الطرفين.</p>
          </div>
        </div>

        <div className="bg-slate-50 px-8 py-4 border-t border-slate-100 text-center">
          <button
            onClick={onClose}
            className="bg-[#28332F] text-white px-6 py-2.5 rounded-xl text-xs font-bold"
          >
            فهمت وموافق
          </button>
        </div>

      </div>
    </div>
  );
};
