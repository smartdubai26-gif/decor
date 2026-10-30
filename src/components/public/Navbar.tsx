import React from 'react';
import { User, CompanySettings } from '../../types';
import { Language, translations } from '../../utils/translations';
import { Shield, MessageSquare, Menu, X, Calculator, Globe } from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  currentUser: User;
  onOpenAuthModal: () => void;
  onOpenQuoteModal: () => void;
  settings: CompanySettings;
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  currentUser,
  onOpenAuthModal,
  onOpenQuoteModal,
  settings,
  language,
  setLanguage,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const t = translations[language];

  const toggleLanguage = () => {
    const nextLang = language === 'ar' ? 'en' : 'ar';
    setLanguage(nextLang);
    document.documentElement.dir = nextLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = nextLang;
  };

  // Close menu on Escape key and prevent background body scrolling when menu is open
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };

    if (mobileMenuOpen) {
      window.addEventListener('keydown', handleKeyDown);
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [mobileMenuOpen]);

  return (
    <header className="sticky top-0 z-40 bg-[#F1E9DE]/95 backdrop-blur-md border-b border-[#C6A780]/30 transition-all">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-6">
        
        {/* Zone 1: Brand Wordmark */}
        <button
          onClick={() => { setCurrentTab('home'); setMobileMenuOpen(false); }}
          className="text-start flex items-center gap-2 group min-w-0 shrink cursor-pointer"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#28332F] text-[#C6A780] flex items-center justify-center font-bold text-sm sm:text-lg shadow-sm group-hover:scale-105 transition-transform shrink-0">
            A&S
          </div>
          <div className="min-w-0">
            <span className="text-sm sm:text-base lg:text-lg font-bold tracking-tight text-[#28332F] block truncate">
              {t.brandName}
            </span>
            <span className="hidden sm:block text-[9px] sm:text-[10px] text-slate-600 tracking-wider truncate">
              {t.brandTagline}
            </span>
          </div>
        </button>

        {/* Zone 2: Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-700">
          <button
            onClick={() => setCurrentTab('home')}
            className={`hover:text-[#28332F] transition-colors whitespace-nowrap shrink-0 cursor-pointer ${currentTab === 'home' ? 'text-[#28332F] font-bold border-b-2 border-[#C6A780] pb-1' : ''}`}
          >
            {t.home}
          </button>
          <button
            onClick={() => setCurrentTab('services')}
            className={`hover:text-[#28332F] transition-colors whitespace-nowrap shrink-0 cursor-pointer ${currentTab === 'services' ? 'text-[#28332F] font-bold border-b-2 border-[#C6A780] pb-1' : ''}`}
          >
            {t.services}
          </button>
          <button
            onClick={() => setCurrentTab('portfolio')}
            className={`hover:text-[#28332F] transition-colors whitespace-nowrap shrink-0 cursor-pointer ${currentTab === 'portfolio' ? 'text-[#28332F] font-bold border-b-2 border-[#C6A780] pb-1' : ''}`}
          >
            {t.portfolio}
          </button>
          <button
            onClick={() => setCurrentTab('about')}
            className={`hover:text-[#28332F] transition-colors whitespace-nowrap shrink-0 cursor-pointer ${currentTab === 'about' ? 'text-[#28332F] font-bold border-b-2 border-[#C6A780] pb-1' : ''}`}
          >
            {t.about}
          </button>
          <button
            onClick={() => setCurrentTab('contact')}
            className={`hover:text-[#28332F] transition-colors whitespace-nowrap shrink-0 cursor-pointer ${currentTab === 'contact' ? 'text-[#28332F] font-bold border-b-2 border-[#C6A780] pb-1' : ''}`}
          >
            {t.contact}
          </button>
        </nav>

        {/* Zone 3: Primary Action & Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          
          {/* Language Toggle (Desktop & Mobile when menu closed) */}
          <button
            onClick={toggleLanguage}
            title={language === 'ar' ? 'Switch to English' : 'التحويل للغة العربية'}
            aria-label={language === 'ar' ? 'Switch to English' : 'التحويل للغة العربية'}
            className="flex items-center justify-center gap-1 bg-white/90 hover:bg-white text-slate-700 hover:text-slate-900 border border-slate-300 h-9 px-2.5 rounded-xl text-xs font-bold transition-all shadow-2xs whitespace-nowrap cursor-pointer shrink-0"
          >
            <Globe className="w-3.5 h-3.5 text-[#C6A780] shrink-0" />
            <span className="hidden min-[420px]:inline text-xs">{t.langSwitch}</span>
            <span className="min-[420px]:hidden text-[11px] font-bold">{language === 'ar' ? 'EN' : 'عربي'}</span>
          </button>

          {/* WhatsApp Direct Action (Desktop) */}
          <a
            href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden lg:flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-2 rounded-xl transition-colors whitespace-nowrap"
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
            {t.whatsappDirect}
          </a>

          {/* Primary CTA: Request Quote (Visible on desktop; on mobile only when menu is closed to prevent duplicates) */}
          <button
            onClick={onOpenQuoteModal}
            aria-label={t.requestQuote}
            className={`${mobileMenuOpen ? 'hidden md:flex' : 'hidden min-[380px]:flex'} items-center gap-1 bg-[#28332F] hover:bg-[#1b2320] text-white h-9 px-2.5 sm:px-4 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm whitespace-nowrap shrink-0 cursor-pointer`}
          >
            <Calculator className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#C6A780] shrink-0" />
            <span className="hidden sm:inline">{t.requestQuote}</span>
            <span className="sm:hidden">{language === 'ar' ? 'طلب عرض' : 'Quote'}</span>
          </button>

          {/* Admin Role Selector / Switcher (Desktop) */}
          <button
            onClick={onOpenAuthModal}
            title="تبديل صلاحيات المستخدم / الإدارة"
            className="hidden md:flex items-center gap-1.5 bg-[#C6A780]/20 hover:bg-[#C6A780]/30 text-[#28332F] px-3 py-2 rounded-xl text-xs font-bold transition-colors border border-[#C6A780]/50 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Shield className="w-4 h-4 text-[#28332F]" />
            <span className="hidden lg:inline">{t.adminDashboard} ({currentUser.role})</span>
          </button>

          {/* Mobile menu toggle button (Guaranteed 44x44px minimum touch target) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? (language === 'ar' ? 'إغلاق القائمة' : 'Close menu') : (language === 'ar' ? 'فتح القائمة' : 'Open menu')}
            aria-expanded={mobileMenuOpen}
            className="md:hidden w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-700 hover:text-slate-900 rounded-xl hover:bg-slate-200/60 active:bg-slate-300 transition-colors shrink-0 cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

      </div>

      {/* Mobile Menu Dropdown & Backdrop */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop overlay: closes menu on tap */}
          <div 
            className="fixed inset-0 top-16 bg-black/40 z-30 md:hidden animate-in fade-in duration-200"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Navigation Panel */}
          <div className="relative z-40 md:hidden bg-[#F1E9DE] border-b border-[#C6A780]/30 px-4 py-4 space-y-3 shadow-xl max-h-[calc(100vh-4rem)] overflow-y-auto animate-in slide-in-from-top duration-200">
            
            {/* Primary Action Button (Only in menu on mobile to avoid duplication in visible layout) */}
            <button
              onClick={() => { onOpenQuoteModal(); setMobileMenuOpen(false); }}
              className="w-full flex items-center justify-center gap-2 bg-[#28332F] hover:bg-[#1b2320] text-white py-3 px-4 rounded-xl font-bold text-sm shadow-sm transition-all cursor-pointer"
            >
              <Calculator className="w-4 h-4 text-[#C6A780]" />
              <span>{t.requestQuote}</span>
            </button>

            {/* Navigation links: Home, Services, Portfolio, About, Contact */}
            <nav className="space-y-1">
              <button
                onClick={() => { setCurrentTab('home'); setMobileMenuOpen(false); }}
                className={`block w-full text-start font-medium py-2 px-3 rounded-lg hover:bg-[#C6A780]/15 transition-colors cursor-pointer ${currentTab === 'home' ? 'text-[#28332F] font-bold bg-[#C6A780]/20' : 'text-slate-800'}`}
              >
                {t.home}
              </button>
              <button
                onClick={() => { setCurrentTab('services'); setMobileMenuOpen(false); }}
                className={`block w-full text-start font-medium py-2 px-3 rounded-lg hover:bg-[#C6A780]/15 transition-colors cursor-pointer ${currentTab === 'services' ? 'text-[#28332F] font-bold bg-[#C6A780]/20' : 'text-slate-800'}`}
              >
                {t.services}
              </button>
              <button
                onClick={() => { setCurrentTab('portfolio'); setMobileMenuOpen(false); }}
                className={`block w-full text-start font-medium py-2 px-3 rounded-lg hover:bg-[#C6A780]/15 transition-colors cursor-pointer ${currentTab === 'portfolio' ? 'text-[#28332F] font-bold bg-[#C6A780]/20' : 'text-slate-800'}`}
              >
                {t.portfolio}
              </button>
              <button
                onClick={() => { setCurrentTab('about'); setMobileMenuOpen(false); }}
                className={`block w-full text-start font-medium py-2 px-3 rounded-lg hover:bg-[#C6A780]/15 transition-colors cursor-pointer ${currentTab === 'about' ? 'text-[#28332F] font-bold bg-[#C6A780]/20' : 'text-slate-800'}`}
              >
                {t.about}
              </button>
              <button
                onClick={() => { setCurrentTab('contact'); setMobileMenuOpen(false); }}
                className={`block w-full text-start font-medium py-2 px-3 rounded-lg hover:bg-[#C6A780]/15 transition-colors cursor-pointer ${currentTab === 'contact' ? 'text-[#28332F] font-bold bg-[#C6A780]/20' : 'text-slate-800'}`}
              >
                {t.contact}
              </button>
            </nav>
            
            {/* Consolidated Actions: Language switching and WhatsApp in a compact, unified grid */}
            <div className="pt-2 border-t border-[#C6A780]/30 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => { toggleLanguage(); setMobileMenuOpen(false); }}
                  className="flex items-center justify-center gap-1.5 bg-white text-slate-800 hover:text-slate-950 border border-slate-300 py-2.5 px-3 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                >
                  <Globe className="w-3.5 h-3.5 text-[#C6A780] shrink-0" />
                  <span className="truncate">{language === 'ar' ? 'English' : 'العربية'}</span>
                </button>
                <a
                  href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 px-3 rounded-xl text-xs font-bold transition-colors shadow-2xs"
                >
                  <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{t.whatsappDirect}</span>
                </a>
              </div>

              {/* Admin Portal Authentication Check Entry */}
              <button
                onClick={() => { onOpenAuthModal(); setMobileMenuOpen(false); }}
                className="w-full flex items-center justify-center gap-2 bg-[#C6A780]/15 hover:bg-[#C6A780]/25 text-[#28332F] border border-[#C6A780]/40 py-2.5 px-3 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                <Shield className="w-3.5 h-3.5 text-[#28332F] shrink-0" />
                <span className="truncate">{t.adminDashboard} ({currentUser.role})</span>
              </button>
            </div>

          </div>
        </>
      )}
    </header>
  );
};
