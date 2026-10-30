import React, { useState } from 'react';
import { NewsArticle } from '../../types';
import { api } from '../../services/api';
import { 
  Newspaper, Plus, Trash2, Eye, EyeOff, Edit3, CheckCircle2, 
  Search, Filter, Calendar, User, Tag, Image as ImageIcon, AlertCircle, X, ExternalLink
} from 'lucide-react';

interface NewsModuleProps {
  news: NewsArticle[];
  setNews: React.Dispatch<React.SetStateAction<NewsArticle[]>>;
}

const PRESET_IMAGES = [
  { label: 'فيلا فاخرة بالتجمع الخامس (إضاءة ورخام)', url: '/images/portfolio_villa_new_cairo_1792469679890.jpg' },
  { label: 'صالون مودرن واستقبال رئيسي (أرتيزان)', url: '/images/hero_interior_design_1792469679331.jpg' },
  { label: 'مقر إداري ومكاتب ذكية بالقرية الذكية', url: '/images/portfolio_commercial_hq_1792469679674.jpg' },
  { label: 'بنتهاوس الزمالك بإطلالة نيلية', url: '/images/portfolio_penthouse_zamalek_1792469679860.jpg' },
  { label: 'أعمال الجبس والدهانات الفاخرة', url: '/images/service_finishing_renovation_1792469681130.jpg' },
];

export const NewsModule: React.FC<NewsModuleProps> = ({ news, setNews }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingArticle, setEditingArticle] = useState<NewsArticle | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Form state
  const [titleAr, setTitleAr] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [excerptAr, setExcerptAr] = useState('');
  const [excerptEn, setExcerptEn] = useState('');
  const [contentAr, setContentAr] = useState('');
  const [contentEn, setContentEn] = useState('');
  const [image, setImage] = useState(PRESET_IMAGES[0].url);
  const [customImage, setCustomImage] = useState('');
  const [category, setCategory] = useState<'design_trends' | 'projects' | 'materials' | 'awards'>('design_trends');
  const [author, setAuthor] = useState('م. أحمد العوضي');
  const [isPublished, setIsPublished] = useState(true);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const openAddModal = () => {
    setEditingArticle(null);
    setTitleAr('');
    setTitleEn('');
    setExcerptAr('');
    setExcerptEn('');
    setContentAr('');
    setContentEn('');
    setImage(PRESET_IMAGES[0].url);
    setCustomImage('');
    setCategory('design_trends');
    setAuthor('م. أحمد العوضي');
    setIsPublished(true);
    setShowModal(true);
  };

  const openEditModal = (article: NewsArticle) => {
    setEditingArticle(article);
    setTitleAr(article.title.ar);
    setTitleEn(article.title.en || '');
    setExcerptAr(article.excerpt.ar);
    setExcerptEn(article.excerpt.en || '');
    setContentAr(article.content.ar);
    setContentEn(article.content.en || '');
    setImage(article.image);
    setCategory(article.category);
    setAuthor(article.author || 'م. أحمد العوضي');
    setIsPublished(article.isPublished);
    setShowModal(true);
  };

  const handleSaveArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleAr.trim()) {
      showToast('يرجى إدخال عنوان المقال بالعربية', 'error');
      return;
    }

    const finalImage = customImage.trim() || image;

    const categoryLabels: Record<string, { ar: string; en: string }> = {
      design_trends: { ar: 'اتجاهات التصميم', en: 'Design Trends' },
      projects: { ar: 'أخبار المشاريع', en: 'Projects News' },
      materials: { ar: 'المواد والتشطيبات', en: 'Materials & Finishes' },
      awards: { ar: 'جوائز وفعاليات', en: 'Awards & Events' }
    };

    if (editingArticle) {
      // Update existing
      const updatedArticle: NewsArticle = {
        ...editingArticle,
        title: { ar: titleAr, en: titleEn || titleAr },
        excerpt: { ar: excerptAr, en: excerptEn || excerptAr },
        content: { ar: contentAr, en: contentEn || contentAr },
        image: finalImage,
        category,
        categoryLabel: categoryLabels[category],
        author,
        isPublished,
      };

      try {
        await api.updateNews(editingArticle.id, updatedArticle);
      } catch (err) {
        console.warn('API update failed, updating local state:', err);
      }

      setNews(prev => prev.map(a => a.id === editingArticle.id ? updatedArticle : a));
      showToast('تم تحديث الخبر بنجاح');
    } else {
      // Create new
      const newArticle: NewsArticle = {
        id: `news-${Date.now()}`,
        slug: `news-${Date.now()}`,
        title: { ar: titleAr, en: titleEn || titleAr },
        excerpt: { ar: excerptAr, en: excerptEn || excerptAr },
        content: { ar: contentAr, en: contentEn || contentAr },
        image: finalImage,
        category,
        categoryLabel: categoryLabels[category],
        author,
        publishedAt: new Date().toISOString().split('T')[0],
        isPublished,
        views: 0
      };

      try {
        const res = await api.createNews(newArticle);
        if (res && res.id) {
          setNews(prev => [res, ...prev]);
        } else {
          setNews(prev => [newArticle, ...prev]);
        }
      } catch (err) {
        console.warn('API create failed, adding to local state:', err);
        setNews(prev => [newArticle, ...prev]);
      }

      showToast('تمت إضافة الخبر بالصورة بنجاح ونشره على الموقع');
    }

    setShowModal(false);
  };

  const handleTogglePublish = async (article: NewsArticle) => {
    const updatedStatus = !article.isPublished;
    const updated = { ...article, isPublished: updatedStatus };

    setNews(prev => prev.map(a => a.id === article.id ? updated : a));
    try {
      await api.updateNews(article.id, { isPublished: updatedStatus });
      showToast(updatedStatus ? 'تم تفعيل ظهور الخبر على الموقع العام' : 'تم إخفاء الخبر عن الموقع العام');
    } catch (err) {
      console.warn('API error toggling status:', err);
    }
  };

  const handleDeleteArticle = async (id: string, title: string) => {
    if (!window.confirm(`هل أنت متأكد من حذف هذا الخبر نهائياً من الموقع ولوحة التحكم؟\n\n"${title}"`)) {
      return;
    }

    setNews(prev => prev.filter(a => a.id !== id));
    try {
      await api.deleteNews(id);
      showToast('تم حذف الخبر بنجاح من الموقع');
    } catch (err) {
      console.warn('API error deleting news:', err);
      showToast('تم حذف الخبر محلياً');
    }
  };

  // Filtered news
  const filteredNews = news.filter(item => {
    const matchesSearch = 
      item.title.ar.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.title.en && item.title.en.toLowerCase().includes(searchTerm.toLowerCase())) ||
      item.excerpt.ar.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesStatus = 
      selectedStatus === 'all' || 
      (selectedStatus === 'published' && item.isPublished) ||
      (selectedStatus === 'draft' && !item.isPublished);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const publishedCount = news.filter(n => n.isPublished).length;
  const draftsCount = news.filter(n => !n.isPublished).length;
  const totalViews = news.reduce((acc, curr) => acc + (curr.views || 0), 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Toast Notification */}
      {notification && (
        <div className={`fixed bottom-6 start-6 z-50 flex items-center gap-2 px-5 py-3 rounded-2xl shadow-xl text-xs font-bold text-white transition-all ${
          notification.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
        }`}>
          <CheckCircle2 className="w-4 h-4" />
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 text-[#C6A780]">
            <Newspaper className="w-5 h-5" />
            <span className="text-xs font-bold tracking-wider uppercase">نظام إدارة المحتوى الإخباري (CMS)</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 mt-1">إدارة الأخبار والمقالات المعمارية</h2>
          <p className="text-xs text-slate-500 mt-1">التحكم الكامل في نشر الأخبار المصورة وتحديثها أو حذفها لتظهر مباشرة على واجهة الموقع.</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-[#28332F] hover:bg-[#1b2320] text-white px-5 py-3 rounded-xl text-xs font-bold shadow-md cursor-pointer transition-transform hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4 text-[#C6A780]" />
          إضافة خبر / مقال جديد بالصور
        </button>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="text-xs text-slate-500 font-medium">إجمالي المقالات</div>
          <div className="text-2xl font-black text-slate-900 font-mono">{news.length}</div>
          <div className="text-[10px] text-slate-400">مقالات مسجلة بالنظام</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-2xs space-y-1">
          <div className="text-xs text-emerald-700 font-medium flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" /> منشور على الموقع
          </div>
          <div className="text-2xl font-black text-emerald-600 font-mono">{publishedCount}</div>
          <div className="text-[10px] text-emerald-600/80">ظاهر لزوار الموقع العام</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-amber-100 shadow-2xs space-y-1">
          <div className="text-xs text-amber-700 font-medium flex items-center gap-1">
            <EyeOff className="w-3.5 h-3.5" /> مسودة أو مخفي
          </div>
          <div className="text-2xl font-black text-amber-600 font-mono">{draftsCount}</div>
          <div className="text-[10px] text-amber-600/80">غير معروض للجمهور</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="text-xs text-slate-500 font-medium">إجمالي القراءات</div>
          <div className="text-2xl font-black text-[#C6A780] font-mono">{totalViews.toLocaleString()}</div>
          <div className="text-[10px] text-slate-400">تفاعل القراء والزوار</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute start-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="البحث في عناوين الأخبار والمقالات..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl ps-9 pe-4 py-2 text-xs focus:bg-white focus:outline-none focus:border-[#C6A780]"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 cursor-pointer focus:outline-none"
          >
            <option value="all">جميع التصنيفات</option>
            <option value="design_trends">اتجاهات التصميم</option>
            <option value="projects">أخبار المشاريع</option>
            <option value="materials">المواد والتشطيبات</option>
            <option value="awards">جوائز وفعاليات</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 cursor-pointer focus:outline-none"
          >
            <option value="all">جميع الحالات</option>
            <option value="published">منشور فقط</option>
            <option value="draft">مخفي / مسودة</option>
          </select>
        </div>
      </div>

      {/* News Cards Grid */}
      {filteredNews.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Newspaper className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 text-sm">لا توجد مقالات أو أخبار مطابقة</h3>
          <p className="text-xs text-slate-500">جرب تعديل خيارات البحث أو قم بإضافة خبر جديد بالصور للموقع.</p>
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 bg-[#28332F] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#C6A780]" /> إضافة أول مقال
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNews.map((article) => (
            <div
              key={article.id}
              className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col justify-between shadow-2xs hover:shadow-md ${
                article.isPublished ? 'border-slate-200' : 'border-dashed border-amber-300 bg-amber-50/20'
              }`}
            >
              <div>
                {/* Image Cover */}
                <div className="h-48 relative overflow-hidden bg-slate-100">
                  <img
                    src={article.image}
                    alt={article.title.ar}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      // Fallback image in case of broken custom url
                      (e.target as HTMLImageElement).src = '/images/hero_interior_design_1792469679331.jpg';
                    }}
                  />
                  {/* Category Badge */}
                  <span className="absolute top-3 start-3 bg-[#28332F]/80 backdrop-blur-xs text-[#C6A780] text-[10px] font-bold px-2.5 py-1 rounded-lg">
                    {article.categoryLabel?.ar || article.category}
                  </span>

                  {/* Status Badge */}
                  <span className={`absolute top-3 end-3 text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-xs ${
                    article.isPublished 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-amber-500 text-white'
                  }`}>
                    {article.isPublished ? (
                      <><Eye className="w-3 h-3" /> منشور</>
                    ) : (
                      <><EyeOff className="w-3 h-3" /> مسودة (مخفي)</>
                    )}
                  </span>
                </div>

                {/* Article Info */}
                <div className="p-5 space-y-2.5">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[#C6A780]" />
                      {article.publishedAt}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      {article.author}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2">
                    {article.title.ar}
                  </h3>

                  {article.title.en && (
                    <p className="text-[11px] text-slate-400 font-mono line-clamp-1" dir="ltr">
                      {article.title.en}
                    </p>
                  )}

                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                    {article.excerpt.ar}
                  </p>
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => handleTogglePublish(article)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
                    article.isPublished 
                      ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' 
                      : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                  }`}
                  title={article.isPublished ? 'إخفاء عن الموقع العام' : 'عرض على الموقع العام'}
                >
                  {article.isPublished ? (
                    <><EyeOff className="w-3.5 h-3.5" /> إخفاء</>
                  ) : (
                    <><Eye className="w-3.5 h-3.5" /> تفعيل النشر</>
                  )}
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(article)}
                    className="p-2 text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all cursor-pointer"
                    title="تعديل المقال"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDeleteArticle(article.id, article.title.ar)}
                    className="p-2 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                    title="حذف نهائياً"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Article Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden p-6 sm:p-8 space-y-5 my-auto max-h-[90vh] overflow-y-auto">
            
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#28332F] text-[#C6A780] flex items-center justify-center">
                  <Newspaper className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    {editingArticle ? 'تعديل الخبر والمحتوى المعماري' : 'إضافة خبر / مقال جديد بالصور'}
                  </h3>
                  <p className="text-[11px] text-slate-500">سيتم حفظ الخبر وعرضه مباشرة على واجهة الموقع العام.</p>
                </div>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveArticle} className="space-y-4">
              
              {/* Titles */}
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    عنوان الخبر (بالعربية) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={titleAr}
                    onChange={(e) => setTitleAr(e.target.value)}
                    placeholder="مثال: فوز أرتيزان آند سبيد بجائزة أفضل تشطيب فيلات بالتجمع الخامس"
                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-[#C6A780]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    عنوان الخبر (English - اختياري)
                  </label>
                  <input
                    type="text"
                    value={titleEn}
                    onChange={(e) => setTitleEn(e.target.value)}
                    placeholder="e.g. Artisan & Space Wins Luxury Villa Finishing Award"
                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-mono focus:outline-none focus:border-[#C6A780]"
                    dir="ltr"
                  />
                </div>
              </div>

              {/* Category & Author */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">تصنيف المقال</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C6A780]"
                  >
                    <option value="design_trends">اتجاهات التصميم والديكور</option>
                    <option value="projects">أخبار وإنجازات المشاريع</option>
                    <option value="materials">المواد والتشطيبات الفاخرة</option>
                    <option value="awards">جوائز وتكريمات</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">اسم الكاتب / المحرر</label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="م. أحمد العوضي"
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C6A780]"
                  />
                </div>
              </div>

              {/* Image Selection with live preview */}
              <div className="space-y-2 border border-slate-200 rounded-xl p-3.5 bg-slate-50/50">
                <label className="text-xs font-bold text-slate-700 block">
                  اختيار صورة الخبر الرئيسية (عالية الدقة)
                </label>

                <div className="space-y-2">
                  <select
                    value={image}
                    onChange={(e) => {
                      setImage(e.target.value);
                      setCustomImage('');
                    }}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs bg-white focus:outline-none focus:border-[#C6A780]"
                  >
                    {PRESET_IMAGES.map((preset, idx) => (
                      <option key={idx} value={preset.url}>
                        {preset.label}
                      </option>
                    ))}
                  </select>

                  <div className="text-[11px] text-slate-500">أو أدخل رابط صورة مخصصة (URL):</div>
                  <input
                    type="text"
                    value={customImage}
                    onChange={(e) => setCustomImage(e.target.value)}
                    placeholder="https://... أو /images/..."
                    className="w-full border border-slate-300 rounded-xl px-3 py-1.5 text-xs bg-white font-mono"
                    dir="ltr"
                  />
                </div>

                {/* Thumbnail Preview */}
                <div className="pt-2 flex items-center gap-3">
                  <div className="w-20 h-14 rounded-lg overflow-hidden border border-slate-300 shrink-0 bg-slate-200">
                    <img
                      src={customImage || image}
                      alt="معاينة صورة المقال"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="text-[11px] text-slate-500">
                    معاينة فورية: سيتم عرض هذه الصورة كغلاف للخبر على الصفحة الرئيسية للموقع.
                  </div>
                </div>
              </div>

              {/* Excerpt */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  الموجز والنبذة المختصرة (بالعربية)
                </label>
                <textarea
                  rows={2}
                  required
                  value={excerptAr}
                  onChange={(e) => setExcerptAr(e.target.value)}
                  placeholder="نبذة سريعة تظهر على بطاقة الخبر في الصفحة الرئيسية..."
                  className="w-full border border-slate-300 rounded-xl p-3 text-xs focus:outline-none focus:border-[#C6A780]"
                ></textarea>
              </div>

              {/* Full Content */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  المحتوى الكامل للمقال
                </label>
                <textarea
                  rows={4}
                  value={contentAr}
                  onChange={(e) => setContentAr(e.target.value)}
                  placeholder="اكتب تفاصيل الخبر الكاملة، المواصفات، والحلول المعمارية المنفذة..."
                  className="w-full border border-slate-300 rounded-xl p-3 text-xs focus:outline-none focus:border-[#C6A780]"
                ></textarea>
              </div>

              {/* Published Toggle */}
              <div className="bg-slate-100 p-3 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-800">حالة النشر الفوري</div>
                  <div className="text-[11px] text-slate-500">عند التفعيل، سيظهر الخبر فوراً لجميع زوار الموقع.</div>
                </div>
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="w-5 h-5 accent-[#28332F] cursor-pointer"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-xl text-xs text-slate-600 hover:bg-slate-100 cursor-pointer font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-[#28332F] hover:bg-[#1a2320] text-white shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#C6A780]" />
                  {editingArticle ? 'حفظ التعديلات' : 'نشر الخبر بالصورة'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
