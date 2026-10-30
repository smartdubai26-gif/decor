import React, { useState } from 'react';
import { CompanySettings, PortfolioProject, ServiceItem, NewsArticle } from '../../types';
import { Language, translations } from '../../utils/translations';
import { 
  ArrowLeft, ArrowRight, Calculator, ShieldCheck, Award, Sparkles, 
  Building2, CheckCircle2, PhoneCall, ChevronDown, ChevronUp, 
  Newspaper, Calendar, User, X, ExternalLink 
} from 'lucide-react';
import heroBgImage from '../../assets/images/hero_interior_design_1792469679331.jpg';

interface HomeProps {
  settings: CompanySettings;
  services: ServiceItem[];
  portfolio: PortfolioProject[];
  news?: NewsArticle[];
  setCurrentTab: (tab: string) => void;
  onOpenQuoteModal: () => void;
  onSelectProject: (project: PortfolioProject) => void;
  language: Language;
}

export const Home: React.FC<HomeProps> = ({
  settings,
  services,
  portfolio,
  news = [],
  setCurrentTab,
  onOpenQuoteModal,
  onSelectProject,
  language,
}) => {
  const t = translations[language];
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);

  const ArrowIcon = language === 'ar' ? ArrowLeft : ArrowRight;

  const faqs = [
    { q: t.faq1Q, a: t.faq1A },
    { q: t.faq2Q, a: t.faq2A },
    { q: t.faq3Q, a: t.faq3A },
  ];

  return (
    <div className="space-y-24 pb-20">
      
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center bg-[#28332F] text-white overflow-hidden w-full">
        {/* Background Image */}
        <div className="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden bg-[#28332F]">
          <img
            src={heroBgImage}
            alt="Artisan & Space Luxury Architectural Interior Design"
            className="absolute inset-0 w-full h-full object-cover object-center"
            loading="eager"
            decoding="async"
          />
          {/* Dark Overlay */}
          <div 
            className="absolute inset-0 bg-gradient-to-b from-[#28332F]/85 via-[#28332F]/65 to-[#28332F]/90 pointer-events-none" 
            aria-hidden="true"
          />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-5 sm:space-y-8 py-12 sm:py-20 w-full">
          <div className="inline-flex items-center gap-2 bg-[#C6A780]/20 border border-[#C6A780]/40 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium text-[#F1E9DE] max-w-full text-center">
            <Sparkles className="w-4 h-4 text-[#C6A780] shrink-0" />
            <span className="truncate">{t.heroBadge}</span>
          </div>

          <h1 className="text-2xl min-[360px]:text-3xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight leading-[1.2] sm:leading-[1.15] text-white max-w-4xl mx-auto px-1">
            {t.heroTitle1} <span className="text-[#C6A780]">{t.heroTitleAccent}</span> {t.heroTitle2}
          </h1>

          <p className="max-w-2xl mx-auto text-xs sm:text-base lg:text-lg text-[#F1E9DE]/90 font-light leading-relaxed px-2">
            {t.heroSubtitle}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-2 sm:pt-4">
            <button
              onClick={onOpenQuoteModal}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#C6A780] hover:bg-[#b0916b] text-[#28332F] px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base transition-all shadow-lg hover:scale-105 cursor-pointer"
            >
              <Calculator className="w-5 h-5" />
              {t.calculateCostCTA}
            </button>
            <button
              onClick={() => setCurrentTab('portfolio')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/30 px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base transition-all cursor-pointer"
            >
              {t.explorePortfolioCTA}
              <ArrowIcon className="w-5 h-5 text-[#C6A780]" />
            </button>
          </div>

          {/* Trust stats strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6 pt-10 sm:pt-16 border-t border-white/15 text-center">
            <div className="p-1 sm:p-2">
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-[#C6A780]">{t.statProjects}</div>
              <div className="text-xs text-[#F1E9DE]/70 mt-1">{t.statProjectsLabel}</div>
            </div>
            <div className="p-1 sm:p-2">
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-[#C6A780]">{t.statExperience}</div>
              <div className="text-xs text-[#F1E9DE]/70 mt-1">{t.statExperienceLabel}</div>
            </div>
            <div className="p-1 sm:p-2">
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-[#C6A780]">{t.statCommitment}</div>
              <div className="text-xs text-[#F1E9DE]/70 mt-1">{t.statCommitmentLabel}</div>
            </div>
            <div className="p-1 sm:p-2">
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-[#C6A780]">{t.statCoverage}</div>
              <div className="text-xs text-[#F1E9DE]/70 mt-1">{t.statCoverageLabel}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-16">
          <span className="text-xs font-bold tracking-widest text-[#C6A780] uppercase">{t.servicesKicker}</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#28332F]">{t.servicesTitle}</h2>
          <p className="text-slate-600 max-w-xl mx-auto text-sm">{t.servicesSubtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service) => (
            <div
              key={service.id}
              onClick={() => setCurrentTab('services')}
              className="bg-white rounded-2xl overflow-hidden border border-[#C6A780]/30 shadow-xs hover:shadow-xl transition-all duration-300 group cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="h-48 overflow-hidden relative">
                  <img
                    src={service.image}
                    alt={service.title[language] || service.title.ar}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                  <span className="absolute bottom-3 start-3 text-xs font-bold text-white bg-[#28332F]/80 backdrop-blur-xs px-3 py-1 rounded-full">
                    {t.startingFrom} {service.startingPriceEgp.toLocaleString()} {t.egp}
                  </span>
                </div>
                <div className="p-6 space-y-3">
                  <h3 className="text-xl font-bold text-[#28332F] group-hover:text-[#C6A780] transition-colors">
                    {service.title[language] || service.title.ar}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {service.shortDesc[language] || service.shortDesc.ar}
                  </p>
                </div>
              </div>
              <div className="px-6 pb-6 pt-0">
                <span className="inline-flex items-center gap-1 text-xs font-bold text-[#28332F] group-hover:translate-x-[-4px] transition-transform">
                  {t.viewDetails} <ArrowIcon className="w-3.5 h-3.5 text-[#C6A780]" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Portfolio Section */}
      <section className="bg-[#EADFCF]/40 py-20 border-y border-[#C6A780]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-4">
            <div className="space-y-3">
              <span className="text-xs font-bold tracking-widest text-[#C6A780] uppercase">{t.portfolioKicker}</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#28332F]">{t.portfolioTitle}</h2>
            </div>
            <button
              onClick={() => setCurrentTab('portfolio')}
              className="flex items-center gap-2 text-sm font-bold text-[#28332F] bg-white border border-[#C6A780] px-5 py-3 rounded-xl hover:bg-[#28332F] hover:text-white transition-all shadow-xs cursor-pointer"
            >
              {t.viewAllProjects}
              <ArrowIcon className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {portfolio.map((project) => (
              <div
                key={project.id}
                onClick={() => onSelectProject(project)}
                className="bg-white rounded-2xl overflow-hidden border border-[#C6A780]/30 shadow-xs hover:shadow-xl transition-all group cursor-pointer"
              >
                <div className="h-64 overflow-hidden relative">
                  <img
                    src={project.coverImage}
                    alt={project.title[language] || project.title.ar}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 start-4 bg-[#28332F] text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md">
                    {project.location}
                  </div>
                </div>
                <div className="p-6 space-y-3">
                  <div className="text-xs text-[#C6A780] font-bold uppercase tracking-wider">{project.propertyType}</div>
                  <h3 className="text-xl font-bold text-[#28332F]">{project.title[language] || project.title.ar}</h3>
                  <p className="text-slate-600 text-sm line-clamp-2">{project.description[language] || project.description.ar}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest News & Articles Section (CMS Driven) */}
      {(settings.pageControls?.showNews !== false) && news.filter(n => n.isPublished).length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
            <div className="space-y-3">
              <span className="text-xs font-bold tracking-widest text-[#C6A780] uppercase flex items-center gap-1.5">
                <Newspaper className="w-4 h-4 text-[#C6A780]" />
                {language === 'ar' ? 'أخبار المنصة والتصميم' : 'NEWS & INSIGHTS'}
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#28332F]">
                {language === 'ar' ? 'أحدث الأخبار والمقالات المعمارية' : 'Latest Architectural News & Insights'}
              </h2>
              <p className="text-slate-600 max-w-xl text-sm">
                {language === 'ar'
                  ? 'رؤى متخصصة في الديكور الفاخر، تكريمات وجوائز معمارية، وتغطية حصرية لأحدث مشروعاتنا في مصر.'
                  : 'Expert perspectives in luxury finishes, architectural excellence awards, and project achievements across Egypt.'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {news.filter(n => n.isPublished).map((article) => (
              <article
                key={article.id}
                onClick={() => setSelectedArticle(article)}
                className="bg-white rounded-2xl overflow-hidden border border-[#C6A780]/30 shadow-2xs hover:shadow-xl transition-all duration-300 group cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="h-56 overflow-hidden relative bg-slate-100">
                    <img
                      src={article.image}
                      alt={article.title[language] || article.title.ar}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/hero_interior_design_1792469679331.jpg';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>
                    <span className="absolute top-4 start-4 bg-[#28332F]/85 backdrop-blur-xs text-[#C6A780] text-xs font-bold px-3 py-1 rounded-full shadow-md">
                      {article.categoryLabel?.[language] || article.categoryLabel?.ar || article.category}
                    </span>
                  </div>

                  <div className="p-6 space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-[#C6A780]" />
                        {article.publishedAt}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5" />
                        {article.author}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-[#28332F] group-hover:text-[#C6A780] transition-colors leading-snug line-clamp-2">
                      {article.title[language] || article.title.ar}
                    </h3>

                    <p className="text-slate-600 text-xs sm:text-sm leading-relaxed line-clamp-3">
                      {article.excerpt[language] || article.excerpt.ar}
                    </p>
                  </div>
                </div>

                <div className="px-6 pb-6 pt-0">
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-[#28332F] group-hover:text-[#C6A780] group-hover:translate-x-[-3px] transition-all">
                    {language === 'ar' ? 'قراءة المقال بالكامل' : 'Read Full Article'}
                    <ArrowIcon className="w-3.5 h-3.5 text-[#C6A780]" />
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Why Choose Us */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <span className="text-xs font-bold tracking-widest text-[#C6A780] uppercase">{t.whyKicker}</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#28332F]">{t.whyTitle}</h2>
          <p className="text-slate-600 leading-relaxed text-sm">
            {t.whyText}
          </p>

          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#28332F] text-[#C6A780] flex items-center justify-center shrink-0 font-bold">01</div>
              <div>
                <h4 className="font-bold text-slate-900 text-base">{t.reason1Title}</h4>
                <p className="text-xs text-slate-600 mt-1">{t.reason1Text}</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#28332F] text-[#C6A780] flex items-center justify-center shrink-0 font-bold">02</div>
              <div>
                <h4 className="font-bold text-slate-900 text-base">{t.reason2Title}</h4>
                <p className="text-xs text-slate-600 mt-1">{t.reason2Text}</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#28332F] text-[#C6A780] flex items-center justify-center shrink-0 font-bold">03</div>
              <div>
                <h4 className="font-bold text-slate-900 text-base">{t.reason3Title}</h4>
                <p className="text-xs text-slate-600 mt-1">{t.reason3Text}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#28332F] text-white p-8 sm:p-12 rounded-3xl shadow-xl space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#C6A780]/10 rounded-full blur-3xl pointer-events-none"></div>
          <h3 className="text-2xl font-bold text-white">{t.ctaBoxTitle}</h3>
          <p className="text-[#F1E9DE]/80 text-sm leading-relaxed">
            {t.ctaBoxText}
          </p>
          <div className="pt-4 flex flex-col sm:flex-row gap-4">
            <button
              onClick={onOpenQuoteModal}
              className="flex items-center justify-center gap-2 bg-[#C6A780] hover:bg-[#b0916b] text-[#28332F] px-6 py-3.5 rounded-xl font-bold text-sm transition-all cursor-pointer shadow-md"
            >
              <Calculator className="w-4 h-4" /> {t.instantQuoteBtn}
            </button>
            <a
              href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3.5 rounded-xl font-bold text-sm transition-all"
            >
              <PhoneCall className="w-4 h-4 text-[#C6A780]" /> {t.whatsappChatBtn}
            </a>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold tracking-widest text-[#C6A780] uppercase">FAQ</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#28332F]">{t.faqTitle}</h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden transition-all shadow-2xs"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full text-start p-5 sm:p-6 flex items-center justify-between gap-4 font-bold text-[#28332F] text-sm sm:text-base cursor-pointer hover:bg-slate-50/80 transition-colors"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-[#C6A780] shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 sm:px-6 sm:pb-6 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-4 animate-in fade-in duration-150">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Article Detail Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full overflow-hidden space-y-6 my-auto max-h-[92vh] overflow-y-auto animate-in fade-in duration-200">
            
            {/* Modal Image Header */}
            <div className="h-64 sm:h-80 relative overflow-hidden bg-slate-900">
              <img
                src={selectedArticle.image}
                alt={selectedArticle.title[language] || selectedArticle.title.ar}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#28332F] via-[#28332F]/40 to-transparent"></div>
              
              <button
                onClick={() => setSelectedArticle(null)}
                className="absolute top-4 end-4 bg-[#28332F]/80 hover:bg-[#28332F] text-white p-2 rounded-full cursor-pointer transition-colors shadow-lg z-10"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="absolute bottom-6 start-6 end-6 text-white space-y-2">
                <span className="inline-block bg-[#C6A780] text-[#28332F] text-xs font-bold px-3 py-1 rounded-md">
                  {selectedArticle.categoryLabel?.[language] || selectedArticle.categoryLabel?.ar || selectedArticle.category}
                </span>
                <h2 className="text-xl sm:text-2xl font-bold leading-tight">
                  {selectedArticle.title[language] || selectedArticle.title.ar}
                </h2>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Calendar className="w-4 h-4 text-[#C6A780]" />
                    {selectedArticle.publishedAt}
                  </span>
                  <span className="flex items-center gap-1.5 font-medium">
                    <User className="w-4 h-4 text-slate-400" />
                    {selectedArticle.author}
                  </span>
                </div>

                <div className="text-[11px] text-slate-400">
                  {language === 'ar' ? 'فريق التحرير الهندسي بأرتيزان آند سبيد' : 'Artisan & Space Editorial Team'}
                </div>
              </div>

              {/* Excerpt Lead */}
              <p className="text-sm sm:text-base font-semibold text-[#28332F] leading-relaxed bg-[#F1E9DE]/50 p-4 rounded-2xl border-s-4 border-[#C6A780]">
                {selectedArticle.excerpt[language] || selectedArticle.excerpt.ar}
              </p>

              {/* Full Article Content */}
              <div className="text-sm sm:text-base text-slate-700 leading-relaxed whitespace-pre-line space-y-4">
                {selectedArticle.content[language] || selectedArticle.content.ar}
              </div>

              {/* CTA footer in modal */}
              <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/70 p-4 rounded-2xl">
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    {language === 'ar' ? 'هل تخطط لتشطيب أو تصميم مشروعك الخاص؟' : 'Planning your next interior design project?'}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {language === 'ar' ? 'تواصل مع مستشارينا المعماريين لحساب التكلفة التقديرية.' : 'Consult our interior architects for an instant estimate.'}
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedArticle(null);
                    onOpenQuoteModal();
                  }}
                  className="w-full sm:w-auto bg-[#28332F] hover:bg-[#1b2320] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  <Calculator className="w-4 h-4 text-[#C6A780]" />
                  {language === 'ar' ? 'احسب تكلفة مشروعك' : 'Calculate Estimate'}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
