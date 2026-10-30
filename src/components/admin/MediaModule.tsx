import React, { useState } from 'react';
import { PortfolioProject, ServiceItem } from '../../types';
import { Image as ImageIcon, Plus, Trash2, CheckCircle2, Star, X } from 'lucide-react';

interface MediaModuleProps {
  portfolio: PortfolioProject[];
  setPortfolio: React.Dispatch<React.SetStateAction<PortfolioProject[]>>;
  services: ServiceItem[];
  setServices: React.Dispatch<React.SetStateAction<ServiceItem[]>>;
}

export const MediaModule: React.FC<MediaModuleProps> = ({
  portfolio,
  setPortfolio,
  services,
  setServices,
}) => {
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [newProject, setNewProject] = useState({
    titleAr: '',
    titleEn: '',
    category: 'villas' as PortfolioProject['category'],
    location: 'التجمع الخامس، القاهرة',
    propertyType: 'فيلا سكنية فاخرة',
    descriptionAr: '',
    descriptionEn: '',
    coverImage: '/src/assets/images/portfolio_villa_new_cairo_1792469679890.jpg',
  });

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.titleAr.trim()) return;

    const created: PortfolioProject = {
      id: `p-${Date.now()}`,
      slug: `proj-${Date.now()}`,
      title: { ar: newProject.titleAr, en: newProject.titleEn || newProject.titleAr },
      category: newProject.category,
      location: newProject.location,
      propertyType: newProject.propertyType,
      description: { ar: newProject.descriptionAr, en: newProject.descriptionEn || newProject.descriptionAr },
      coverImage: newProject.coverImage,
      galleryImages: [newProject.coverImage],
      completionDate: new Date().toISOString().split('T')[0],
      isFeatured: true,
      status: 'published'
    };

    setPortfolio([created, ...portfolio]);
    setShowAddProjectModal(false);
    setNewProject({
      titleAr: '',
      titleEn: '',
      category: 'villas',
      location: 'التجمع الخامس، القاهرة',
      propertyType: 'فيلا سكنية فاخرة',
      descriptionAr: '',
      descriptionEn: '',
      coverImage: '/src/assets/images/portfolio_villa_new_cairo_1792469679890.jpg',
    });
  };

  const toggleFeatured = (id: string) => {
    setPortfolio(portfolio.map(p => p.id === id ? { ...p, isFeatured: !p.isFeatured } : p));
  };

  const handleDelete = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا المشروع من المعرض العام؟')) {
      setPortfolio(portfolio.filter(p => p.id !== id));
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">إدارة معرض الصور والمحتوى المعماري</h2>
          <p className="text-xs text-slate-500 mt-1">التحكم في المشاريع المنشورة، الصور عالية الدقة، والخدمات المعروضة على الموقع.</p>
        </div>
        <button
          onClick={() => setShowAddProjectModal(true)}
          className="flex items-center gap-2 bg-[#28332F] hover:bg-[#1b2320] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md cursor-pointer"
        >
          <Plus className="w-4 h-4 text-[#C6A780]" />
          إضافة مشروع جديد للمعرض
        </button>
      </div>

      {/* Grid of Portfolio items */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {portfolio.map((item) => (
          <div key={item.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs space-y-3 pb-4 hover:border-[#C6A780] transition-all">
            <div className="h-48 overflow-hidden relative">
              <img src={item.coverImage} alt={item.title.ar} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              {item.isFeatured && (
                <span className="absolute top-3 start-3 bg-[#C6A780] text-[#28332F] text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1">
                  <Star className="w-3 h-3 fill-current" /> مميز
                </span>
              )}
            </div>
            <div className="px-4 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#C6A780] uppercase">{item.propertyType}</span>
                <span className="text-[10px] text-slate-400 font-mono">{item.completionDate}</span>
              </div>
              <h3 className="font-bold text-slate-900 text-sm">{item.title.ar}</h3>
              <p className="text-xs text-slate-500 line-clamp-2">{item.description.ar}</p>
            </div>
            <div className="px-4 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <button
                onClick={() => toggleFeatured(item.id)}
                className={`font-semibold text-[11px] ${item.isFeatured ? 'text-amber-700' : 'text-slate-500 hover:text-slate-800'} cursor-pointer`}
              >
                {item.isFeatured ? 'إلغاء التمييز' : 'تعيين كمميز'}
              </button>
              <button
                onClick={() => handleDelete(item.id)}
                className="text-rose-600 hover:text-rose-800 text-[11px] font-bold cursor-pointer flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" /> حذف
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Project Modal */}
      {showAddProjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden p-6 space-y-4 my-auto">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-slate-900 text-base">إضافة مشروع جديد إلى معرض الأعمال</h3>
              <button onClick={() => setShowAddProjectModal(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddProject} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700">عنوان المشروع (بالعربية) *</label>
                <input
                  type="text"
                  required
                  value={newProject.titleAr}
                  onChange={(e) => setNewProject({ ...newProject, titleAr: e.target.value })}
                  placeholder="مثال: فيلا النرجس - التجمع الخامس"
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">عنوان المشروع (English)</label>
                <input
                  type="text"
                  value={newProject.titleEn}
                  onChange={(e) => setNewProject({ ...newProject, titleEn: e.target.value })}
                  placeholder="e.g. Al-Narges Villa - New Cairo"
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700">التصنيف</label>
                  <select
                    value={newProject.category}
                    onChange={(e) => setNewProject({ ...newProject, category: e.target.value as any })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs mt-1"
                  >
                    <option value="villas">فيلات وقصور</option>
                    <option value="penthouses">بنتهاوس وشقق فاخرة</option>
                    <option value="commercial">مقرات إدارية وتجارية</option>
                    <option value="renovation">تشطيبات وتجديد</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">الموقع في مصر</label>
                  <input
                    type="text"
                    value={newProject.location}
                    onChange={(e) => setNewProject({ ...newProject, location: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs mt-1"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">نوع العقار والمساحة</label>
                <input
                  type="text"
                  value={newProject.propertyType}
                  onChange={(e) => setNewProject({ ...newProject, propertyType: e.target.value })}
                  placeholder="مثال: فيلا مستقلة (500 م٢)"
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">وصف التصميم الداخلي ومميزاته</label>
                <textarea
                  rows={3}
                  value={newProject.descriptionAr}
                  onChange={(e) => setNewProject({ ...newProject, descriptionAr: e.target.value })}
                  placeholder="اكتب وصفاً معمارياً للمشروع والمواد المستخدمة..."
                  className="w-full border border-slate-300 rounded-xl p-3 text-xs mt-1"
                ></textarea>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">مسار الصورة الأساسية</label>
                <select
                  value={newProject.coverImage}
                  onChange={(e) => setNewProject({ ...newProject, coverImage: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs mt-1 font-mono"
                >
                  <option value="/src/assets/images/portfolio_villa_new_cairo_1792469679890.jpg">Villa New Cairo (Generated Luxury)</option>
                  <option value="/src/assets/images/hero_interior_design_1792469679331.jpg">Cairo Living Room Hero</option>
                  <option value="/src/assets/images/portfolio_commercial_hq_1792469679674.jpg">Smart Village HQ</option>
                  <option value="/src/assets/images/portfolio_penthouse_zamalek_1792469679860.jpg">Zamalek Penthouse</option>
                  <option value="/src/assets/images/service_finishing_renovation_1792469681130.jpg">Gypsum & Finishing Service</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddProjectModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-[#28332F] text-white cursor-pointer"
                >
                  نشر المشروع
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
