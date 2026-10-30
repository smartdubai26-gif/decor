import React from 'react';
import { CompanySettings } from '../../types';
import { Language, translations } from '../../utils/translations';
import { ShieldCheck, Award, Users, Target, CheckCircle2 } from 'lucide-react';

interface AboutPageProps {
  settings: CompanySettings;
  language: Language;
}

export const AboutPage: React.FC<AboutPageProps> = ({ settings, language }) => {
  const t = translations[language];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-20">
      
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <span className="text-xs font-bold tracking-widest text-[#C6A780] uppercase">{t.about}</span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-[#28332F]">
          {settings.companyName[language] || settings.companyName.ar}
        </h1>
        <p className="text-slate-600 text-base leading-relaxed">
          {language === 'ar'
            ? 'شركة رائدة في مجال التصميم الداخلي، الديكور، وتنفيذ التشطيبات الفاخرة في جمهورية مصر العربية منذ عام 2016.'
            : 'A premier interior design, decoration, and turnkey finishing firm established in Egypt since 2016.'}
        </p>
      </div>

      {/* Story & Vision */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center bg-white p-8 sm:p-12 rounded-3xl border border-[#C6A780]/30 shadow-xs">
        <div className="space-y-6">
          <h2 className="text-3xl font-extrabold text-[#28332F]">
            {language === 'ar' ? 'قصتنا وشغفنا بالتصميم' : 'Our Story & Architectural Heritage'}
          </h2>
          <p className="text-slate-700 text-base leading-relaxed">
            {language === 'ar'
              ? `تأسست ${settings.companyName.ar} بهدف الارتقاء بمستوى التشطيبات والتصميم الداخلي في السوق المصري. نؤمن بأن المساحة التي تعيش أو تعمل فيها تؤثر بشكل مباشر على جودة حياتك وإنتاجيتك.`
              : `Artisan & Space was established to elevate the benchmark of interior execution and architectural finishing in Egypt. We believe your physical environment profoundly shapes well-being, luxury, and focus.`}
          </p>
          <p className="text-slate-700 text-base leading-relaxed">
            {language === 'ar'
              ? 'يضم فريقنا نخبة من أفضل المهندسين المعماريين، ومصممي الديكور، والحرفيين المحترفين الذين يعملون بتناغم لتسليم مشاريع متكاملة تتخطى توقعات عملائنا.'
              : 'Our multidisciplinary studio unites seasoned architects, certified structural engineers, interior designers, and master carpenters dedicated to flawless execution.'}
          </p>
          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="bg-[#F1E9DE]/60 p-4 rounded-2xl border border-[#C6A780]/30">
              <div className="text-2xl font-extrabold text-[#28332F] font-mono">{t.statProjects}</div>
              <div className="text-xs text-slate-600 mt-1">{t.statProjectsLabel}</div>
            </div>
            <div className="bg-[#F1E9DE]/60 p-4 rounded-2xl border border-[#C6A780]/30">
              <div className="text-2xl font-extrabold text-[#28332F] font-mono">{t.statCommitment}</div>
              <div className="text-xs text-slate-600 mt-1">{t.statCommitmentLabel}</div>
            </div>
          </div>
        </div>

        <div className="space-y-6 bg-[#28332F] text-white p-8 sm:p-10 rounded-2xl">
          <h3 className="text-2xl font-bold text-[#C6A780]">
            {language === 'ar' ? 'رؤيتنا وقيمنا المؤسسية' : 'Our Core Philosophy & Values'}
          </h3>
          <ul className="space-y-4 text-sm text-[#F1E9DE]/90">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#C6A780] shrink-0 mt-0.5" />
              <span>
                <strong>{language === 'ar' ? 'الابتكار الوظيفي: ' : 'Functional Innovation: '}</strong>
                {language === 'ar' ? 'تصميم مساحات تجمع بين الجمال الأخاذ والاستخدام العملي الأمثل.' : 'Designing bespoke spaces balancing architectural grandeur and everyday ergonomics.'}
              </span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#C6A780] shrink-0 mt-0.5" />
              <span>
                <strong>{language === 'ar' ? 'الأمانة والشفافية: ' : 'Absolute Transparency: '}</strong>
                {language === 'ar' ? 'التزام كامل بالمواصفات التقنية والمقايسات الصريحة دون بنود غامضة.' : 'Full accountability with itemized quantities, verified suppliers, and zero hidden costs.'}
              </span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#C6A780] shrink-0 mt-0.5" />
              <span>
                <strong>{language === 'ar' ? 'الالتزام الزمني الصارم: ' : 'Strict Timeline Integrity: '}</strong>
                {language === 'ar' ? 'احترام مواعيد التسليم كأحد أهم ركائز ثقة عملائنا في السوق المصري.' : 'Guaranteed delivery dates supported by structured milestone scheduling.'}
              </span>
            </li>
          </ul>
        </div>
      </div>

    </div>
  );
};
