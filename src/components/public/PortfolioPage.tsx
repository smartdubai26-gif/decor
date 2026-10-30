import React, { useState } from 'react';
import { PortfolioProject } from '../../types';
import { Language, translations } from '../../utils/translations';
import { ArrowLeft, ArrowRight, MapPin, Calendar, Building, X } from 'lucide-react';

interface PortfolioPageProps {
  portfolio: PortfolioProject[];
  onOpenQuoteModal: () => void;
  language: Language;
}

export const PortfolioPage: React.FC<PortfolioPageProps> = ({ portfolio, onOpenQuoteModal, language }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeProject, setActiveProject] = useState<PortfolioProject | null>(null);
  const t = translations[language];

  const ArrowIcon = language === 'ar' ? ArrowLeft : ArrowRight;

  const filteredProjects = selectedCategory === 'all' 
    ? portfolio 
    : portfolio.filter(p => p.category === selectedCategory);

  const categories = [
    { id: 'all', label: t.allCategories },
    { id: 'villas', label: t.catVillas },
    { id: 'penthouses', label: t.catPenthouses },
    { id: 'commercial', label: t.catCommercial },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <span className="text-xs font-bold tracking-widest text-[#C6A780] uppercase">{t.portfolioKicker}</span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-[#28332F]">{t.portfolioTitle}</h1>
        <p className="text-slate-600 text-base leading-relaxed">
          {language === 'ar' 
            ? 'نستعرض هنا نماذج مختارة من مشاريعنا السكنية والتجارية في التجمع الخامس، الشيخ زايد، الزمالك، ومختلف مناطق مصر.'
            : 'Explore our curated portfolio of residential villas, luxury penthouses, and corporate spaces in Cairo.'}
        </p>

        {/* Filter Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-6">
          {categories.map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id)}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                selectedCategory === tab.id
                  ? 'bg-[#28332F] text-white shadow-md'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredProjects.map((project) => (
          <div
            key={project.id}
            onClick={() => setActiveProject(project)}
            className="bg-white rounded-2xl overflow-hidden border border-[#C6A780]/30 shadow-xs hover:shadow-xl transition-all duration-300 group cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="h-72 overflow-hidden relative">
                <img
                  src={project.coverImage}
                  alt={project.title[language] || project.title.ar}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 start-4 bg-[#28332F]/90 backdrop-blur-xs text-white text-xs font-semibold px-3.5 py-1.5 rounded-full shadow-md flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#C6A780]" />
                  {project.location}
                </div>
              </div>
              <div className="p-6 space-y-3">
                <div className="text-xs text-[#C6A780] font-bold uppercase tracking-wider">{project.propertyType}</div>
                <h3 className="text-xl font-bold text-[#28332F]">{project.title[language] || project.title.ar}</h3>
                <p className="text-slate-600 text-sm line-clamp-2 leading-relaxed">
                  {project.description[language] || project.description.ar}
                </p>
              </div>
            </div>
            <div className="px-6 pb-6 pt-0 flex items-center justify-between border-t border-slate-100 pt-4">
              <span className="text-xs text-slate-500 flex items-center gap-1 font-mono">
                <Calendar className="w-3.5 h-3.5 text-[#C6A780]" />
                {project.completionDate}
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-[#28332F] group-hover:translate-x-[-4px] transition-transform">
                {t.viewDetails} <ArrowIcon className="w-3.5 h-3.5 text-[#C6A780]" />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Project Detail Modal */}
      {activeProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full overflow-hidden my-auto border border-[#C6A780]">
            <div className="relative h-80 sm:h-96">
              <img
                src={activeProject.coverImage}
                alt={activeProject.title[language] || activeProject.title.ar}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <button
                onClick={() => setActiveProject(null)}
                className="absolute top-4 start-4 bg-black/60 hover:bg-black text-white p-2.5 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute bottom-4 start-4 bg-[#28332F]/90 backdrop-blur-xs text-white px-4 py-2 rounded-xl text-xs font-bold">
                {activeProject.propertyType}
              </div>
            </div>

            <div className="p-8 space-y-6">
              <div>
                <span className="text-xs font-bold text-[#C6A780] uppercase tracking-wider">{activeProject.location}</span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#28332F] mt-1">
                  {activeProject.title[language] || activeProject.title.ar}
                </h2>
              </div>

              <p className="text-slate-700 text-base leading-relaxed">
                {activeProject.description[language] || activeProject.description.ar}
              </p>

              <div className="grid grid-cols-2 gap-4 bg-[#F1E9DE]/60 p-4 rounded-xl border border-[#C6A780]/30 text-xs">
                <div>
                  <span className="text-slate-500 block">{language === 'ar' ? 'تاريخ الإنجاز:' : 'Handover Date:'}</span>
                  <span className="font-bold text-slate-900 font-mono mt-0.5 block">{activeProject.completionDate}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">{language === 'ar' ? 'الحالة المعمارية:' : 'Status:'}</span>
                  <span className="font-bold text-emerald-700 mt-0.5 block">{language === 'ar' ? 'منجز ومعتمد للعامة' : 'Completed & Verified'}</span>
                </div>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => {
                    setActiveProject(null);
                    onOpenQuoteModal();
                  }}
                  className="flex-1 bg-[#C6A780] hover:bg-[#b0916b] text-[#28332F] py-3.5 rounded-xl font-bold text-sm transition-all text-center shadow-md cursor-pointer"
                >
                  {language === 'ar' ? 'اطلب مشروعاً مشابهاً واحصل على مقايسة' : 'Request Similar Project Quotation'}
                </button>
                <button
                  onClick={() => setActiveProject(null)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-3.5 rounded-xl font-bold text-sm transition-all cursor-pointer"
                >
                  {language === 'ar' ? 'إغلاق' : 'Close'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
