import React, { useState } from 'react';
import { CompanySettings, PortfolioProject, NewsArticle } from '../../types';
import { api } from '../../services/api';
import { 
  Settings, CheckCircle2, Sliders, Layout, Eye, EyeOff, 
  Trash2, Plus, Newspaper, FolderKanban, Sparkles, AlertCircle 
} from 'lucide-react';

interface SettingsModuleProps {
  settings: CompanySettings;
  setSettings: React.Dispatch<React.SetStateAction<CompanySettings>>;
  portfolio?: PortfolioProject[];
  setPortfolio?: React.Dispatch<React.SetStateAction<PortfolioProject[]>>;
  news?: NewsArticle[];
  setNews?: React.Dispatch<React.SetStateAction<NewsArticle[]>>;
  onNavigateTab?: (tab: string) => void;
}

export const SettingsModule: React.FC<SettingsModuleProps> = ({ 
  settings, 
  setSettings,
  portfolio = [],
  setPortfolio,
  news = [],
  setNews,
  onNavigateTab
}) => {
  const [formData, setFormData] = useState<CompanySettings>({
    ...settings,
    pageControls: {
      showNews: settings.pageControls?.showNews ?? true,
      showPortfolio: settings.pageControls?.showPortfolio ?? true,
      showServices: settings.pageControls?.showServices ?? true,
      showFaq: settings.pageControls?.showFaq ?? true,
      announcementBarEnabled: settings.pageControls?.announcementBarEnabled ?? true,
      announcementText: settings.pageControls?.announcementText ?? {
        ar: '✨ استمتع باستشارة معمارية وتصميم ثلاثي الأبعاد مجاناً عند التعاقد على تشطيبات الفيلات',
        en: '✨ Complimentary 3D architectural consultation for luxury villa contracts'
      }
    }
  });

  const [saved, setSaved] = useState(false);
  const [activeSubSection, setActiveSubSection] = useState<'pages' | 'projects' | 'company'>('pages');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettings(formData);
    try {
      await api.updateSettings(formData);
    } catch (err) {
      console.warn('API sync warning:', err);
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 3500);
  };

  const handleTogglePage = (key: keyof NonNullable<CompanySettings['pageControls']>) => {
    if (!formData.pageControls) return;
    const currentVal = formData.pageControls[key];
    if (typeof currentVal === 'boolean') {
      const updated = {
        ...formData,
        pageControls: {
          ...formData.pageControls,
          [key]: !currentVal
        }
      };
      setFormData(updated);
      setSettings(updated);
      api.updateSettings(updated).catch(() => {});
    }
  };

  const handleDeleteProject = async (id: string, name: string) => {
    if (!window.confirm(`هل أنت متأكد من حذف المشروع "${name}" من الموقع العام وقاعدة البيانات؟`)) {
      return;
    }
    if (setPortfolio) {
      setPortfolio(prev => prev.filter(p => p.id !== id));
    }
    try {
      await api.deletePortfolio(id);
    } catch (err) {
      console.warn('API error deleting project:', err);
    }
  };

  const handleDeleteNews = async (id: string, title: string) => {
    if (!window.confirm(`هل أنت متأكد من حذف الخبر "${title}"؟`)) {
      return;
    }
    if (setNews) {
      setNews(prev => prev.filter(n => n.id !== id));
    }
    try {
      await api.deleteNews(id);
    } catch (err) {
      console.warn('API error deleting news:', err);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 text-[#C6A780]">
            <Sliders className="w-5 h-5" />
            <span className="text-xs font-bold tracking-wider uppercase">لوحة التحكم في الموقع والمنصة</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 mt-1">إعدادات الموقع والتحكم في الصفحات والمحتوى</h2>
          <p className="text-xs text-slate-500 mt-1">
            التحكم الشامل في ظهور أقسام الموقع (الأخبار، معرض الأعمال، الخدمات)، وحذف المشاريع والمقالات.
          </p>
        </div>
      </div>

      {saved && (
        <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 p-4 rounded-xl flex items-center gap-2 text-xs font-bold shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          تم حفظ كافة التغييرات وإعدادات عرض الصفحات بنجاح، وتم تحديث الموقع العام فوراً!
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveSubSection('pages')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubSection === 'pages' 
              ? 'bg-[#28332F] text-white shadow-xs' 
              : 'text-slate-600 hover:bg-slate-200/60'
          }`}
        >
          <Layout className="w-4 h-4 text-[#C6A780]" />
          التحكم في صفحات وأقسام الموقع
        </button>
        <button
          onClick={() => setActiveSubSection('projects')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubSection === 'projects' 
              ? 'bg-[#28332F] text-white shadow-xs' 
              : 'text-slate-600 hover:bg-slate-200/60'
          }`}
        >
          <FolderKanban className="w-4 h-4 text-[#C6A780]" />
          عرض وحذف المشاريع والأخبار
          <span className="bg-[#C6A780] text-[#28332F] px-1.5 py-0.5 rounded-full text-[10px]">
            {portfolio.length + news.length}
          </span>
        </button>
        <button
          onClick={() => setActiveSubSection('company')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubSection === 'company' 
              ? 'bg-[#28332F] text-white shadow-xs' 
              : 'text-slate-600 hover:bg-slate-200/60'
          }`}
        >
          <Settings className="w-4 h-4 text-[#C6A780]" />
          بيانات الشركة والاتصال
        </button>
      </div>

      {/* SECTION 1: Page & Section Visibility Controls */}
      {activeSubSection === 'pages' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">التحكم في الأقسام والصفحات المعروضة للجمهور</h3>
                <p className="text-xs text-slate-500">يمكنك تعطيل أو تفعيل أي قسم ليختفي أو يظهر مباشرة على الموقع العام.</p>
              </div>

              <div className="space-y-3">
                
                {/* News Section Toggle */}
                <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                      <Newspaper className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">قسم أحدث الأخبار والمقالات المعمارية</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        يعرض المقالات، التكريمات، وأخبار المشاريع بالصور على الصفحة الرئيسية.
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleTogglePage('showNews')}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      formData.pageControls?.showNews 
                        ? 'bg-emerald-600 text-white shadow-xs' 
                        : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    }`}
                  >
                    {formData.pageControls?.showNews ? (
                      <><Eye className="w-4 h-4" /> معروض</>
                    ) : (
                      <><EyeOff className="w-4 h-4" /> مخفي</>
                    )}
                  </button>
                </div>

                {/* Portfolio Section Toggle */}
                <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#28332F] text-[#C6A780] flex items-center justify-center shrink-0">
                      <FolderKanban className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">قسم معرض وسابقة الأعمال (Portfolio)</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        يعرض مشاريع الفيلات، القصور، والمقرات الإدارية الفاخرة للعملاء.
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleTogglePage('showPortfolio')}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      formData.pageControls?.showPortfolio 
                        ? 'bg-emerald-600 text-white shadow-xs' 
                        : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    }`}
                  >
                    {formData.pageControls?.showPortfolio ? (
                      <><Eye className="w-4 h-4" /> معروض</>
                    ) : (
                      <><EyeOff className="w-4 h-4" /> مخفي</>
                    )}
                  </button>
                </div>

                {/* Services Section Toggle */}
                <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center shrink-0">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">قسم خدماتنا وباقات التشطيب</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        يعرض خدمات التصميم 3D، التشطيبات الفاخرة، والأسعار المبدئية.
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleTogglePage('showServices')}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      formData.pageControls?.showServices 
                        ? 'bg-emerald-600 text-white shadow-xs' 
                        : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    }`}
                  >
                    {formData.pageControls?.showServices ? (
                      <><Eye className="w-4 h-4" /> معروض</>
                    ) : (
                      <><EyeOff className="w-4 h-4" /> مخفي</>
                    )}
                  </button>
                </div>

                {/* Announcement Bar Toggle */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-900">شريط الإعلانات الترويجي أعلى الموقع</div>
                      <div className="text-[11px] text-slate-500">شريط تنبيهي أنيق أعلى الموقع لعرض العروض الحصرية.</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleTogglePage('announcementBarEnabled')}
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        formData.pageControls?.announcementBarEnabled 
                          ? 'bg-emerald-600 text-white' 
                          : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                      }`}
                    >
                      {formData.pageControls?.announcementBarEnabled ? 'مفعل' : 'معطل'}
                    </button>
                  </div>

                  {formData.pageControls?.announcementBarEnabled && (
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">نص الإعلان الترويجي</label>
                      <input
                        type="text"
                        value={formData.pageControls.announcementText.ar}
                        onChange={(e) => {
                          const updated = {
                            ...formData,
                            pageControls: {
                              ...formData.pageControls!,
                              announcementText: {
                                ...formData.pageControls!.announcementText,
                                ar: e.target.value
                              }
                            }
                          };
                          setFormData(updated);
                          setSettings(updated);
                        }}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs"
                      />
                    </div>
                  )}
                </div>

              </div>
            </div>

          </div>

          {/* Quick CMS Jump Card */}
          <div className="space-y-4">
            <div className="bg-[#28332F] text-white rounded-2xl p-6 shadow-md space-y-4">
              <div className="w-10 h-10 rounded-xl bg-[#C6A780] text-[#28332F] flex items-center justify-center font-bold">
                CMS
              </div>
              <h4 className="text-base font-bold text-white">التحكم المركزي في محتوى الموقع</h4>
              <p className="text-xs text-[#F1E9DE]/80 leading-relaxed">
                يمكنك من خلال لوحة الأدمن إدارة المقالات المعمارية بالصور، حذف المشاريع، ونشر العروض الترويجية بنقرة واحدة.
              </p>
              
              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  onClick={() => onNavigateTab ? onNavigateTab('news') : setActiveSubSection('projects')}
                  className="w-full bg-[#C6A780] hover:bg-[#b0916b] text-[#28332F] py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <Newspaper className="w-4 h-4" />
                  الانتقال لإدارة الأخبار بالصور
                </button>

                <button
                  type="button"
                  onClick={() => onNavigateTab ? onNavigateTab('media') : setActiveSubSection('projects')}
                  className="w-full bg-white/10 hover:bg-white/20 text-white py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border border-white/20"
                >
                  <FolderKanban className="w-4 h-4 text-[#C6A780]" />
                  الانتقال لمعرض المشاريع الكامل
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: Direct Projects & News Deletion and Overview */}
      {activeSubSection === 'projects' && (
        <div className="space-y-6">
          
          {/* Projects Control Table */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <FolderKanban className="w-5 h-5 text-[#C6A780]" />
                  مشاريع المعرض الحالية وإمكانية الحذف المباشر
                </h3>
                <p className="text-xs text-slate-500">حذف أي مشروع من الموقع العام أو متابعة تفاصيله.</p>
              </div>
              <button
                onClick={() => onNavigateTab ? onNavigateTab('media') : null}
                className="text-xs font-bold text-[#28332F] bg-slate-100 hover:bg-slate-200 px-3.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-[#C6A780]" /> إضافة مشروع جديد
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {portfolio.map((proj) => (
                <div key={proj.id} className="py-3 flex items-center justify-between gap-4 hover:bg-slate-50/60 p-2 rounded-xl transition-colors">
                  <div className="flex items-center gap-3">
                    <img 
                      src={proj.coverImage} 
                      alt={proj.title.ar} 
                      className="w-14 h-11 rounded-lg object-cover border border-slate-200 bg-slate-100" 
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{proj.title.ar}</h4>
                      <p className="text-[11px] text-slate-500">{proj.location} • {proj.propertyType}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700">
                      منشور
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteProject(proj.id, proj.title.ar)}
                      className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="حذف المشروع نهائياً"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* News Articles Control Table */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Newspaper className="w-5 h-5 text-[#C6A780]" />
                  المقالات الإخبارية الحالية وإمكانية الحذف
                </h3>
                <p className="text-xs text-slate-500">إدارة الأخبار المعروضة أو حذف الأخبار القديمة.</p>
              </div>
              <button
                onClick={() => onNavigateTab ? onNavigateTab('news') : null}
                className="text-xs font-bold text-white bg-[#28332F] hover:bg-[#1a2320] px-3.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-[#C6A780]" /> فتح إدارة الأخبار
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {news.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between gap-4 hover:bg-slate-50/60 p-2 rounded-xl transition-colors">
                  <div className="flex items-center gap-3">
                    <img 
                      src={item.image} 
                      alt={item.title.ar} 
                      className="w-14 h-11 rounded-lg object-cover border border-slate-200 bg-slate-100" 
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{item.title.ar}</h4>
                      <p className="text-[11px] text-slate-500">{item.publishedAt} • {item.author}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      item.isPublished ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {item.isPublished ? 'منشور' : 'مسودة'}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteNews(item.id, item.title.ar)}
                      className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="حذف الخبر نهائياً"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* SECTION 3: Standard Corporate Contact Settings */}
      {activeSubSection === 'company' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-8 max-w-2xl">
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700">اسم الشركة (عربي)</label>
              <input
                type="text"
                value={formData.companyName.ar}
                onChange={(e) => setFormData({ ...formData, companyName: { ...formData.companyName, ar: e.target.value } })}
                className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700">شعار الشركة (Tagline)</label>
              <input
                type="text"
                value={formData.tagline.ar}
                onChange={(e) => setFormData({ ...formData, tagline: { ...formData.tagline, ar: e.target.value } })}
                className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700">رقم الهاتف الرسمي</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-mono mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700">رقم الواتساب للمبيعات</label>
              <input
                type="text"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-mono mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700">العنوان الرسمي</label>
              <input
                type="text"
                value={formData.address.ar}
                onChange={(e) => setFormData({ ...formData, address: { ...formData.address, ar: e.target.value } })}
                className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm mt-1"
              />
            </div>

            <button
              type="submit"
              className="bg-[#28332F] hover:bg-[#1b2320] text-white px-8 py-3 rounded-xl text-sm font-bold shadow-md mt-4 cursor-pointer"
            >
              حفظ بيانات الشركة
            </button>
          </form>
        </div>
      )}

    </div>
  );
};
