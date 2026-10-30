import React from 'react';
import { CompanySettings } from '../../types';
import { Language, translations } from '../../utils/translations';
import { Phone, Mail, MapPin, MessageSquare, ShieldCheck } from 'lucide-react';

interface FooterProps {
  settings: CompanySettings;
  setCurrentTab: (tab: string) => void;
  onOpenPrivacyModal: () => void;
  language: Language;
}

export const Footer: React.FC<FooterProps> = ({ settings, setCurrentTab, onOpenPrivacyModal, language }) => {
  const t = translations[language];

  return (
    <footer className="bg-[#28332F] text-white pt-16 pb-12 border-t border-[#C6A780]/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
        
        {/* Col 1: About */}
        <div className="space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#C6A780] text-[#28332F] flex items-center justify-center font-bold text-lg shadow-sm">
              A&S
            </div>
            <span className="text-lg font-bold tracking-tight text-white">
              {settings.companyName[language] || settings.companyName.ar}
            </span>
          </div>
          <p className="text-sm text-[#F1E9DE]/80 leading-relaxed">
            {settings.tagline[language] || settings.tagline.ar}. {language === 'ar' ? 'نقدم أعلى معايير الجودة الهندسية، التصميم الداخلي الفاخر، والتشطيبات المتكاملة في مصر.' : 'Delivering high-end architectural and interior finishing excellence across Egypt.'}
          </p>
          <div className="flex items-center gap-2 text-xs text-[#C6A780]">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>{language === 'ar' ? 'ضمان هندسي معتمد وإشراف كامل' : 'Certified Engineering Supervision & Warranty'}</span>
          </div>
        </div>

        {/* Col 2: Quick Links */}
        <div className="space-y-4">
          <h4 className="text-base font-bold text-[#C6A780]">{t.quickLinks}</h4>
          <ul className="space-y-2.5 text-sm text-[#F1E9DE]/80">
            <li>
              <button onClick={() => setCurrentTab('home')} className="hover:text-white transition-colors cursor-pointer">{t.home}</button>
            </li>
            <li>
              <button onClick={() => setCurrentTab('services')} className="hover:text-white transition-colors cursor-pointer">{t.services}</button>
            </li>
            <li>
              <button onClick={() => setCurrentTab('portfolio')} className="hover:text-white transition-colors cursor-pointer">{t.portfolio}</button>
            </li>
            <li>
              <button onClick={() => setCurrentTab('about')} className="hover:text-white transition-colors cursor-pointer">{t.about}</button>
            </li>
            <li>
              <button onClick={() => setCurrentTab('contact')} className="hover:text-white transition-colors cursor-pointer">{t.contact}</button>
            </li>
          </ul>
        </div>

        {/* Col 3: Services */}
        <div className="space-y-4">
          <h4 className="text-base font-bold text-[#C6A780]">{t.mainServices}</h4>
          <ul className="space-y-2.5 text-sm text-[#F1E9DE]/80">
            <li>{language === 'ar' ? 'التصميم الداخلي وتخطيط المساحات' : 'Interior Design & Space Planning'}</li>
            <li>{language === 'ar' ? 'التشطيبات الفاخرة وتسليم مفتاح' : 'Turnkey Finishing & Renovation'}</li>
            <li>{language === 'ar' ? 'المقرات الإدارية والشركات' : 'Commercial & Corporate Offices'}</li>
            <li>{language === 'ar' ? 'الأثاث المخصص والأعمال الخشبية' : 'Custom Joinery & Furniture'}</li>
          </ul>
        </div>

        {/* Col 4: Contact & Location */}
        <div className="space-y-4">
          <h4 className="text-base font-bold text-[#C6A780]">{t.contactUs}</h4>
          <ul className="space-y-3 text-sm text-[#F1E9DE]/80">
            <li className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-[#C6A780] shrink-0 mt-0.5" />
              <span>{settings.address[language] || settings.address.ar}</span>
            </li>
            <li className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-[#C6A780] shrink-0" />
              <span className="font-mono">{settings.phone}</span>
            </li>
            <li className="flex items-center gap-3">
              <MessageSquare className="w-5 h-5 text-[#C6A780] shrink-0" />
              <span className="font-mono">{settings.whatsapp}</span>
            </li>
            <li className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-[#C6A780] shrink-0" />
              <span>{settings.email}</span>
            </li>
          </ul>
        </div>

      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-[#C6A780]/20 flex flex-col sm:flex-row items-center justify-between text-xs text-[#F1E9DE]/60 gap-4">
        <p>© {new Date().getFullYear()} {settings.companyName[language] || settings.companyName.ar}. {t.allRightsReserved}.</p>
        <div className="flex items-center gap-6">
          <button onClick={onOpenPrivacyModal} className="hover:text-white transition-colors cursor-pointer">{t.privacyPolicy}</button>
          <span>•</span>
          <span>{t.egyptLocation}</span>
        </div>
      </div>
    </footer>
  );
};
