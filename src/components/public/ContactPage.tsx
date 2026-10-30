import React, { useState } from 'react';
import { CompanySettings } from '../../types';
import { Language, translations } from '../../utils/translations';
import { Phone, Mail, MapPin, MessageSquare, Send, CheckCircle2, Clock } from 'lucide-react';

interface ContactPageProps {
  settings: CompanySettings;
  language: Language;
}

export const ContactPage: React.FC<ContactPageProps> = ({ settings, language }) => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: ''
  });

  const t = translations[language];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.message) {
      alert(language === 'ar' ? 'يرجى ملء الحقول الإجبارية (الاسم، الهاتف، الرسالة)' : 'Please fill all required fields');
      return;
    }
    setSubmitted(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <span className="text-xs font-bold tracking-widest text-[#C6A780] uppercase">{t.contact}</span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-[#28332F]">
          {language === 'ar' ? 'نحن هنا للإجابة على استفساراتك' : 'Connect With Our Design Studio'}
        </h1>
        <p className="text-slate-600 text-base leading-relaxed">
          {language === 'ar'
            ? 'تواصل مع فريقنا الهندسي أو قم بزيارة مقرنا الرئيسي بالقاهرة لمناقشة مشروعك القادم واستلام دراسة أولية.'
            : 'Schedule a consultation at our New Cairo headquarters or send us an inquiry directly.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* Contact Info Cards */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-[#C6A780]/30 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#28332F] text-[#C6A780] flex items-center justify-center font-bold">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg">
              {language === 'ar' ? 'المقر الرئيسي (القاهرة)' : 'Main Headquarters (Cairo)'}
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {settings.address[language] || settings.address.ar}
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#C6A780]/30 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#28332F] text-[#C6A780] flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg">
              {language === 'ar' ? 'ساعات العمل الرسمية' : 'Working Hours'}
            </h3>
            <p className="text-sm text-slate-600">
              {language === 'ar' ? 'السبت - الخميس: 9:00 ص - 6:00 م' : 'Saturday – Thursday: 9:00 AM – 6:00 PM'}
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#C6A780]/30 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#28332F] text-[#C6A780] flex items-center justify-center font-bold">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg">
              {language === 'ar' ? 'واتساب المبيعات المباشر' : 'Direct WhatsApp Sales'}
            </h3>
            <p className="text-sm font-mono text-slate-600">{settings.whatsapp}</p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2 bg-white p-8 sm:p-12 rounded-3xl border border-[#C6A780]/30 shadow-xs">
          {submitted ? (
            <div className="text-center py-16 space-y-6">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">
                {language === 'ar' ? 'تم إرسال رسالتك بنجاح!' : 'Your message has been sent successfully!'}
              </h3>
              <p className="text-slate-600 text-sm max-w-md mx-auto">
                {language === 'ar'
                  ? 'شكراً لتواصلك معنا. سيتواصل معك أحد مهندسي المبيعات خلال ساعتين عمل لمناقشة تفاصيل مشروعك.'
                  : 'Thank you for reaching out. A senior project consultant will contact you within two business hours.'}
              </p>
              <button
                onClick={() => { setSubmitted(false); setFormData({ name: '', phone: '', email: '', message: '' }); }}
                className="bg-[#28332F] text-white px-6 py-3 rounded-xl text-sm font-bold cursor-pointer"
              >
                {language === 'ar' ? 'إرسال رسالة أخرى' : 'Send Another Message'}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <h3 className="text-2xl font-bold text-[#28332F]">
                {language === 'ar' ? 'أرسل لنا استفسارك وسنعاود الاتصال بك' : 'Send An Inquiry'}
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">
                    {language === 'ar' ? 'الاسم الكريم *' : 'Full Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder={language === 'ar' ? 'مثال: أحمد عبد الله' : 'e.g. Tarek Mansour'}
                    className="w-full bg-[#F1E9DE]/30 border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#C6A780]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">
                    {language === 'ar' ? 'رقم الهاتف (واتساب) *' : 'Phone / WhatsApp *'}
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
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">
                  {language === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@example.com"
                  className="w-full bg-[#F1E9DE]/30 border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#C6A780]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">
                  {language === 'ar' ? 'تفاصيل الرسالة أو المشروع *' : 'Message or Project Scope *'}
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder={language === 'ar' ? 'اكتب استفسارك أو تفاصيل وحدتك هنا...' : 'Describe your project, property size, or question...'}
                  className="w-full bg-[#F1E9DE]/30 border border-slate-300 rounded-xl p-4 text-sm focus:outline-none focus:border-[#C6A780]"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#28332F] hover:bg-[#1b2320] text-white px-8 py-4 rounded-xl font-bold text-base transition-all shadow-md cursor-pointer"
              >
                <Send className="w-4 h-4 text-[#C6A780]" />
                {language === 'ar' ? 'إرسال الرسالة الآن' : 'Send Message Now'}
              </button>
            </form>
          )}
        </div>

      </div>

    </div>
  );
};
