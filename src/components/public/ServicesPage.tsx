import React from 'react';
import { ServiceItem } from '../../types';
import { Language, translations } from '../../utils/translations';
import { CheckCircle2, Calculator } from 'lucide-react';

interface ServicesPageProps {
  services: ServiceItem[];
  onOpenQuoteModal: () => void;
  language: Language;
}

export const ServicesPage: React.FC<ServicesPageProps> = ({ services, onOpenQuoteModal, language }) => {
  const t = translations[language];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <span className="text-xs font-bold tracking-widest text-[#C6A780] uppercase">{t.servicesKicker}</span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-[#28332F]">{t.servicesTitle}</h1>
        <p className="text-slate-600 text-base leading-relaxed">
          {language === 'ar'
            ? 'نقدم باقات متكاملة تشمل التصميم الداخلي، التنفيذ والهندسة المعمارية، التشطيبات الفاخرة، والأثاث المخصص بأعلى معايير الإتقان.'
            : 'We offer full-scope services encompassing architectural space planning, luxury turnkey finishing, and bespoke woodwork across Egypt.'}
        </p>
      </div>

      {/* Services List */}
      <div className="space-y-16">
        {services.map((service, index) => {
          const isEven = index % 2 === 0;
          return (
            <div
              key={service.id}
              className={`flex flex-col lg:flex-row items-center gap-12 bg-white rounded-3xl p-8 sm:p-12 border border-[#C6A780]/30 shadow-xs ${
                isEven ? '' : 'lg:flex-row-reverse'
              }`}
            >
              <div className="w-full lg:w-1/2 h-80 rounded-2xl overflow-hidden shadow-md">
                <img
                  src={service.image}
                  alt={service.title[language] || service.title.ar}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="w-full lg:w-1/2 space-y-6">
                <div className="inline-flex items-center gap-2 bg-[#C6A780]/20 text-[#28332F] px-3.5 py-1.5 rounded-full text-xs font-bold font-mono">
                  {t.startingFrom} {service.startingPriceEgp.toLocaleString()} {t.egp}
                </div>

                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#28332F]">
                  {service.title[language] || service.title.ar}
                </h2>
                <p className="text-slate-700 text-base leading-relaxed">
                  {service.fullDesc[language] || service.fullDesc.ar}
                </p>

                <div className="space-y-2.5 pt-2">
                  <div className="flex items-center gap-3 text-sm text-slate-700">
                    <CheckCircle2 className="w-5 h-5 text-[#C6A780] shrink-0" />
                    <span>{language === 'ar' ? 'رسومات ثلاثية الأبعاد ومخططات تنفيذية دقيقة (CAD & 3D Max)' : 'Detailed 3D visualizations & architectural CAD shop drawings'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-700">
                    <CheckCircle2 className="w-5 h-5 text-[#C6A780] shrink-0" />
                    <span>{language === 'ar' ? 'إشراف هندسي يومي وتقارير دورية موثقة للعميل' : 'Daily engineering site supervision & milestone progress reports'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-700">
                    <CheckCircle2 className="w-5 h-5 text-[#C6A780] shrink-0" />
                    <span>{language === 'ar' ? 'ضمان هندسي معتمد وموثق على كافة أعمال التنفيذ' : 'Certified comprehensive engineering warranty on all installations'}</span>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    onClick={onOpenQuoteModal}
                    className="flex items-center gap-2 bg-[#28332F] hover:bg-[#1b2320] text-white px-6 py-3.5 rounded-xl text-sm font-bold transition-all shadow-sm cursor-pointer"
                  >
                    <Calculator className="w-4 h-4 text-[#C6A780]" />
                    {language === 'ar' ? 'اطلب عرض سعر لهذه الخدمة' : 'Request a Quotation for this Service'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
