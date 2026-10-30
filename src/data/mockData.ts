import { User, Lead, Customer, Project, Quotation, PortfolioProject, ServiceItem, Payment, Expense, AppNotification, AuditLog, CompanySettings, NewsArticle, UserRole, UserPermissions } from '../types';

export const DEFAULT_ROLE_PERMISSIONS: Record<UserRole, UserPermissions> = {
  super_admin: {
    canAccessCRM: true,
    canAccessProjects: true,
    canAccessQuotations: true,
    canAccessFinance: true,
    canAccessMedia: true,
    canAccessNews: true,
    canAccessUsers: true,
    canAccessSettings: true,
    canApproveQuotations: true,
  },
  manager: {
    canAccessCRM: true,
    canAccessProjects: true,
    canAccessQuotations: true,
    canAccessFinance: true,
    canAccessMedia: true,
    canAccessNews: true,
    canAccessUsers: false,
    canAccessSettings: true,
    canApproveQuotations: true,
  },
  sales: {
    canAccessCRM: true,
    canAccessProjects: false,
    canAccessQuotations: true,
    canAccessFinance: false,
    canAccessMedia: true,
    canAccessNews: true,
    canAccessUsers: false,
    canAccessSettings: false,
    canApproveQuotations: false,
  },
  pm: {
    canAccessCRM: false,
    canAccessProjects: true,
    canAccessQuotations: true,
    canAccessFinance: false,
    canAccessMedia: true,
    canAccessNews: false,
    canAccessUsers: false,
    canAccessSettings: false,
    canApproveQuotations: false,
  },
  accountant: {
    canAccessCRM: false,
    canAccessProjects: false,
    canAccessQuotations: true,
    canAccessFinance: true,
    canAccessMedia: false,
    canAccessNews: false,
    canAccessUsers: false,
    canAccessSettings: false,
    canApproveQuotations: false,
  },
  execution: {
    canAccessCRM: false,
    canAccessProjects: true,
    canAccessQuotations: false,
    canAccessFinance: false,
    canAccessMedia: true,
    canAccessNews: false,
    canAccessUsers: false,
    canAccessSettings: false,
    canApproveQuotations: false,
  },
  client: {
    canAccessCRM: false,
    canAccessProjects: false,
    canAccessQuotations: false,
    canAccessFinance: false,
    canAccessMedia: false,
    canAccessNews: false,
    canAccessUsers: false,
    canAccessSettings: false,
    canApproveQuotations: false,
  }
};

export const ROLE_DEFINITIONS: Record<UserRole, { labelAr: string; labelEn: string; descAr: string; badgeClass: string }> = {
  super_admin: {
    labelAr: 'مدير عام للنظام (Super Admin)',
    labelEn: 'Super Administrator',
    descAr: 'صلاحيات كاملة لكافة أقسام النظام، العمليات المالية، والتحكم في الموظفين.',
    badgeClass: 'bg-purple-100 text-purple-800 border-purple-200'
  },
  manager: {
    labelAr: 'مدير تنفيذي (General Manager)',
    labelEn: 'Executive Manager',
    descAr: 'إدارة المشاريع، عروض الأسعار، المحتوى المعماري، والموافقات المالية.',
    badgeClass: 'bg-indigo-100 text-indigo-800 border-indigo-200'
  },
  sales: {
    labelAr: 'مبيعات وتطوير أعمال (Sales & CRM)',
    labelEn: 'Sales Specialist',
    descAr: 'متابعة العملاء المحتملين وإعداد العروض الفنية والمالية المبدئية.',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-200'
  },
  pm: {
    labelAr: 'مدير مشروعات ومواقع (Project Manager)',
    labelEn: 'Project Manager',
    descAr: 'جدولة المهام، الإشراف على تقدم الفيلات والمقرات، والمواصفات.',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200'
  },
  accountant: {
    labelAr: 'إدارة مالية ومحاسبة (Accountant)',
    labelEn: 'Finance & Accountant',
    descAr: 'تسجيل المقبوضات والمصروفات ومطابقة فواتير الموردين والمقاولين.',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-200'
  },
  execution: {
    labelAr: 'فريق التنفيذ والتشطيبات (Site Engineer)',
    labelEn: 'Site Execution',
    descAr: 'تنفيذ أعمال الموقع وتحديث المهام الميدانية ورفع المصروفات.',
    badgeClass: 'bg-teal-100 text-teal-800 border-teal-200'
  },
  client: {
    labelAr: 'عميل المنصة (Client Account)',
    labelEn: 'Client Portal',
    descAr: 'بوابة المالك لمتابعة مراحل التشطيب والمقايسات المالية المعتمدة.',
    badgeClass: 'bg-slate-100 text-slate-800 border-slate-200'
  }
};

export const mockUsers: User[] = [
  { 
    id: 'u1', 
    name: 'مهندس أحمد العوضي', 
    email: 'ahmed@artisan-space.eg', 
    role: 'super_admin', 
    phone: '+20 100 123 4567', 
    department: 'الإدارة العليا',
    status: 'active',
    permissions: DEFAULT_ROLE_PERMISSIONS.super_admin
  },
  { 
    id: 'u2', 
    name: 'سارة محمود', 
    email: 'sara@artisan-space.eg', 
    role: 'sales', 
    phone: '+20 109 987 6543', 
    department: 'المبيعات وتطوير الأعمال',
    status: 'active',
    permissions: DEFAULT_ROLE_PERMISSIONS.sales
  },
  { 
    id: 'u3', 
    name: 'م. كريم الشريف', 
    email: 'kareem@artisan-space.eg', 
    role: 'pm', 
    phone: '+20 111 222 3344', 
    department: 'إدارة المشاريع',
    status: 'active',
    permissions: DEFAULT_ROLE_PERMISSIONS.pm
  },
  { 
    id: 'u4', 
    name: 'محمود عبد الله', 
    email: 'accountant@artisan-space.eg', 
    role: 'accountant', 
    phone: '+20 122 333 4455', 
    department: 'الإدارة المالية',
    status: 'active',
    permissions: DEFAULT_ROLE_PERMISSIONS.accountant
  },
  { 
    id: 'u5', 
    name: 'وليد حسن', 
    email: 'site@artisan-space.eg', 
    role: 'execution', 
    phone: '+20 155 666 7788', 
    department: 'فريق التنفيذ والتشطيبات',
    status: 'active',
    permissions: DEFAULT_ROLE_PERMISSIONS.execution
  },
];

export const mockCompanySettings: CompanySettings = {
  companyName: { ar: 'أرتيزان آند سبيد للديكور والتصميم الداخلي', en: 'Artisan & Space Interior Design' },
  tagline: { ar: 'نصنع مساحات تنبض بالفخامة والتميز في مصر', en: 'Crafting Luxury Interiors & Finishes in Egypt' },
  phone: '+20 2 3760 9988',
  whatsapp: '+20 100 123 4567',
  email: 'contact@artisan-space.eg',
  address: { ar: '24 شارع التضامن، التجمع الخامس، القاهرة، مصر', en: '24 El-Tadamon St, New Cairo, Egypt' },
  taxId: '392-881-004',
  defaultVatRate: 14,
  bankInfo: 'البنك التجاري الدولي (CIB) - فرع التجمع - حساب رقم: 10005839201',
  pageControls: {
    showNews: true,
    showPortfolio: true,
    showServices: true,
    showFaq: true,
    announcementBarEnabled: true,
    announcementText: {
      ar: '✨ استمتع باستشارة معمارية وتصميم ثلاثي الأبعاد مجاناً عند التعاقد على تشطيبات الفيلات',
      en: '✨ Complimentary 3D architectural consultation for luxury villa contracts'
    }
  }
};

export const mockServices: ServiceItem[] = [
  {
    id: 's1',
    slug: 'interior-design',
    title: { ar: 'التصميم الداخلي وتخطيط المساحات', en: 'Interior Design & Space Planning' },
    shortDesc: { ar: 'تصاميم ثلاثية الأبعاد مخصصة تعكس ذوقك الفريد وتحقق الاستفادة القصوى من كل متر.', en: 'Custom 3D spatial designs reflecting your unique taste and maximizing every square meter.' },
    fullDesc: { ar: 'نقدم حلول تصميم داخلي متكاملة تشمل المخططات المعمارية، وتوزيع الإضاءة، وتنسيق الأثاث، واختيار المواد الفاخرة لتناسب الفيلات والقصور والشقق الراقية.', en: 'Comprehensive interior design solutions including architectural plans, lighting, and luxury material selection.' },
    iconName: 'Compass',
    image: '/images/hero_interior_design_1792469679331.jpg',
    startingPriceEgp: 45000,
    published: true,
  },
  {
    id: 's2',
    slug: 'turnkey-finishing',
    title: { ar: 'التشطيبات الفاخرة وتسليم مفتاح', en: 'Turnkey Finishing & Renovation' },
    shortDesc: { ar: 'تنفيذ كافة أعمال الأرضيات، والأسقف المعلقة، والدهانات، والسباكة بأعلى معايير الجودة المصرية.', en: 'Complete execution of flooring, suspended ceilings, painting, and plumbing with highest quality standards.' },
    fullDesc: { ar: 'إشراف هندسي كامل وتنفيذ دقيق لكافة أعمال التشطيبات الداخلية والخارجية مع الالتزام التام بالجداول الزمنية والمواصفات الفنية المعتمدة.', en: 'Full engineering supervision and precise execution of all finishing works.' },
    iconName: 'Hammer',
    image: '/images/service_finishing_renovation_1792469681130.jpg',
    startingPriceEgp: 120000,
    published: true,
  },
  {
    id: 's3',
    slug: 'commercial-offices',
    title: { ar: 'تصميم وتشطيب المقرات الإدارية والتجارية', en: 'Commercial & Office Design' },
    shortDesc: { ar: 'بيئات عمل عصرية ومحفزة للإنتاجية في سمارت فيليج والعاصمة الإدارية.', en: 'Modern work environments designed for productivity in Smart Village and New Capital.' },
    fullDesc: { ar: 'نصمم وننفذ المكاتب الفاخرة، ومقرات الشركات، والمعارض التجارية مع دمج الهوية البصرية، وقواطع الزجاج الصوتية، وأنظمة الإضاءة الذكية.', en: 'Design and execution of luxury corporate headquarters and commercial showrooms.' },
    iconName: 'Building2',
    image: '/images/portfolio_commercial_hq_1792469679674.jpg',
    startingPriceEgp: 200000,
    published: true,
  },
  {
    id: 's4',
    slug: 'custom-joinery',
    title: { ar: 'الأثاث المخصص والأعمال الخشبية', en: 'Custom Joinery & Furniture' },
    shortDesc: { ar: 'أثاث مصمم خصيصاً لمشروعك بأيدي أمهر الحرفيين واستخدام أجود الأخشاب الطبيعية.', en: 'Bespoke furniture crafted for your project by master artisans using premium natural woods.' },
    fullDesc: { ar: 'ورش متكاملة لتصنيع غرف النوم، والدريسنج روم، والمطابخ، والديكورات الخشبية والبانوهات الحائطية بأعلى دقة تشطيب.', en: 'Integrated workshops for custom furniture and woodwork manufacturing.' },
    iconName: 'Armchair',
    image: '/images/portfolio_villa_new_cairo_1792469679890.jpg',
    startingPriceEgp: 75000,
    published: true,
  }
];

export const mockPortfolio: PortfolioProject[] = [
  {
    id: 'p1',
    slug: 'modern-villa-new-cairo',
    title: { ar: 'فيلا بيل ويو - التجمع الخامس', en: 'Bell Vue Villa - New Cairo' },
    category: 'villas',
    location: 'التجمع الخامس، القاهرة الجديدة',
    propertyType: 'فيلا سكنية مستقلة (450 م٢)',
    description: { ar: 'تصميم وتنفيد داخلي بأسلوب المعاصرة الحديثة مع استخدام الرخام الإيطالي وألواح الخشب الطبيعي وإضاءات ليد مخفية.', en: 'Contemporary interior design and execution featuring Italian marble, natural wood slats, and ambient cove lighting.' },
    coverImage: '/images/portfolio_villa_new_cairo_1792469679890.jpg',
    galleryImages: ['/images/portfolio_villa_new_cairo_1792469679890.jpg', '/images/hero_interior_design_1792469679331.jpg'],
    completionDate: '2026-02-15',
    isFeatured: true,
    status: 'published'
  },
  {
    id: 'p2',
    slug: 'smart-village-hq',
    title: { ar: 'مقر شركة التقنية الذكية - سمارت فيليج', en: 'Smart Tech HQ - Smart Village' },
    category: 'commercial',
    location: 'سمارت فيليج، الجيزة',
    propertyType: 'مقر إداري (800 م٢)',
    description: { ar: 'تصميم بيئة عمل مفتوحة مع غرف اجتماعات زجاجية وعازلة للصوت، ومناطق استراحة عصرية للموظفين.', en: 'Open-plan workspace design featuring acoustic glass meeting rooms and modern collaborative employee lounges.' },
    coverImage: '/images/portfolio_commercial_hq_1792469679674.jpg',
    galleryImages: ['/images/portfolio_commercial_hq_1792469679674.jpg'],
    completionDate: '2026-01-10',
    isFeatured: true,
    status: 'published'
  },
  {
    id: 'p3',
    slug: 'nile-view-penthouse-zamalek',
    title: { ar: 'بنتهاوس كورنيش النيل - الزمالك', en: 'Nile Corniche Penthouse - Zamalek' },
    category: 'penthouses',
    location: 'الزمالك، القاهرة',
    propertyType: 'شقة بنتهاوس فاخرة (320 م٢)',
    description: { ar: 'إطلالة مباشرة على نهر النيل مع تصميم داخلي يجمع بين الفخامة الكلاسيكية ولمسات الأثاث المودرن.', en: 'Direct Nile views with an interior design blending classic luxury and modern furniture accents.' },
    coverImage: '/images/portfolio_penthouse_zamalek_1792469679860.jpg',
    galleryImages: ['/images/portfolio_penthouse_zamalek_1792469679860.jpg'],
    completionDate: '2025-11-20',
    isFeatured: true,
    status: 'published'
  }
];

export const mockLeads: Lead[] = [
  {
    id: 'l1',
    customerName: 'م. طارق المنشاوي',
    phone: '+20 122 555 7890',
    email: 'tarek.m@example.com',
    preferredContact: 'whatsapp',
    projectType: 'residential_villa',
    location: 'الشيخ زايد، الجيزة',
    approxAreaSqm: 500,
    estimatedBudgetEgp: 1800000,
    scope: 'تصميم داخلي وتشطيب كامل لفيلا دوبلكس',
    expectedStartDate: '2026-05-01',
    status: 'site_visit',
    priority: 'vip',
    assignedToUserId: 'u2',
    nextFollowUpDate: '2026-10-22',
    notes: ['تم الاتصال الأولي', 'طلب معاينة للموقع يوم الخميس القادم'],
    createdAt: '2026-10-15'
  },
  {
    id: 'l2',
    customerName: 'د. رانيا السعيد',
    phone: '+20 101 444 3322',
    email: 'rania.s@example.com',
    preferredContact: 'phone',
    projectType: 'apartment',
    location: 'مصر الجديدة، القاهرة',
    approxAreaSqm: 220,
    estimatedBudgetEgp: 650000,
    scope: 'تجديد وتصميم ريسبشن ومطبخ',
    expectedStartDate: '2026-06-15',
    status: 'quotation_prepared',
    priority: 'high',
    assignedToUserId: 'u2',
    nextFollowUpDate: '2026-10-23',
    notes: ['تم إرسال المقايسة المبدئية عبر الواتساب'],
    createdAt: '2026-10-17'
  },
  {
    id: 'l3',
    customerName: 'أستاذ سامح ممدوح',
    phone: '+20 115 999 8877',
    email: 'sameh.m@example.com',
    preferredContact: 'email',
    projectType: 'commercial_office',
    location: 'التجمع الخامس، القاهرة الجديدة',
    approxAreaSqm: 350,
    estimatedBudgetEgp: 950000,
    scope: 'تشطيب مقر شركة برمجيات',
    expectedStartDate: '2026-07-01',
    status: 'new',
    priority: 'medium',
    assignedToUserId: 'u2',
    nextFollowUpDate: '2026-10-20',
    notes: ['طلب تقديم عرض سعر تفصيلي للشركات'],
    createdAt: '2026-10-19'
  }
];

export const mockCustomers: Customer[] = [
  { id: 'c1', name: 'م. طارق المنشاوي', phone: '+20 122 555 7890', email: 'tarek.m@example.com', address: 'الشيخ زايد، فيلا 42', totalProjects: 1, createdAt: '2026-01-10' },
  { id: 'c2', name: 'أ. هالة فؤاد', phone: '+20 100 888 9911', email: 'hala.f@example.com', address: 'المقطم، قصر النخيل', totalProjects: 1, createdAt: '2025-08-15' },
];

export const mockProjects: Project[] = [
  {
    id: 'pr1',
    projectNumber: 'PRJ-2026-001',
    name: 'تشطيب قصر فؤاد - المقطم',
    customerId: 'c2',
    customerName: 'أ. هالة فؤاد',
    address: 'المقطم، قصر النخيل، عمارة 12',
    scope: 'تشطيب داخلي بالكامل وديكورات كلاسيكية فاخرة',
    projectManagerId: 'u3',
    startDate: '2026-02-01',
    targetCompletionDate: '2026-12-01',
    status: 'in_progress',
    contractValueEgp: 3500000,
    actualExpensesEgp: 1450000,
    progressPercentage: 45,
    notes: 'تم الانتهاء من أعمال التأسيس والكهرباء والبدء في الدهانات.',
    imageCover: '/images/portfolio_villa_new_cairo_1792469679890.jpg'
  }
];

export const mockQuotations: Quotation[] = [
  {
    id: 'q1',
    quotationNumber: 'QT-2026-042',
    leadId: 'l2',
    customerId: 'c1',
    customerName: 'د. رانيا السعيد',
    issueDate: '2026-10-18',
    expiryDate: '2026-11-18',
    currency: 'EGP',
    status: 'sent',
    paymentTerms: '30% مقدم، 40% خلال التنفيذ، 30% عند الاستلام',
    notes: 'تشمل المقايسة كافة المواد والعمالة والإشراف الهندسي.',
    preparedBy: 'سارة محمود',
    currentVersionIndex: 0,
    versions: [
      {
        versionNumber: 1,
        createdAt: '2026-10-18',
        subtotalEgp: 580000,
        taxRate: 14,
        taxAmountEgp: 81200,
        discountEgp: 11200,
        grandTotalEgp: 650000,
        items: [
          { id: 'qi1', description: 'أعمال التأسيس والكهرباء والسباكة', quantity: 220, unit: 'م٢', unitPriceEgp: 800, discountPercentage: 0, totalEgp: 176000 },
          { id: 'qi2', description: 'تصميم وتنفيذ الأسقف المعلقة والجبس بورد', quantity: 220, unit: 'م٢', unitPriceEgp: 650, discountPercentage: 5, totalEgp: 135850 },
          { id: 'qi3', description: 'أرضيات بورسلين إيطالي فاخر', quantity: 180, unit: 'م٢', unitPriceEgp: 1200, discountPercentage: 0, totalEgp: 216000 },
          { id: 'qi4', description: 'دهانات وتشطيبات نهائية', quantity: 220, unit: 'م٢', unitPriceEgp: 250, discountPercentage: 0, totalEgp: 55000 }
        ]
      }
    ]
  }
];

export const mockPayments: Payment[] = [
  {
    id: 'pay1',
    projectId: 'pr1',
    projectName: 'تشطيب قصر فؤاد - المقطم',
    customerId: 'c2',
    customerName: 'أ. هالة فؤاد',
    amountEgp: 1050000,
    paymentDate: '2026-02-05',
    method: 'bank_transfer',
    referenceNumber: 'CIB-TRX-998231',
    notes: 'دفعة المقدم (30%)'
  }
];

export const mockExpenses: Expense[] = [
  {
    id: 'exp1',
    projectId: 'pr1',
    projectName: 'تشطيب قصر فؤاد - المقطم',
    category: 'materials',
    description: 'شراء حديد وأسمنت ومواد تأسيس',
    amountEgp: 450000,
    expenseDate: '2026-02-10',
    supplierName: 'شركة النيل لمواد البناء'
  },
  {
    id: 'exp2',
    projectId: 'pr1',
    projectName: 'تشطيب قصر فؤاد - المقطم',
    category: 'labor',
    description: 'أجور عمال البناء والسباكة لشهر فبراير',
    amountEgp: 120000,
    expenseDate: '2026-02-28',
    supplierName: 'مقاول الباطن - سيد عمار'
  }
];

export const mockNotifications: AppNotification[] = [
  {
    id: 'n1',
    title: 'طلب معاينة جديد',
    message: 'تم حجز معاينة جديدة للعميل م. طارق المنشاوي في الشيخ زايد.',
    type: 'lead',
    read: false,
    createdAt: 'منذ ساعتين'
  },
  {
    id: 'n2',
    title: 'دفعة مالية جديدة',
    message: 'تم تسجيل دفعة بقيمة 1,050,000 ج.م لمشروع قصر فؤاد.',
    type: 'payment',
    read: true,
    createdAt: 'منذ يومين'
  }
];

export const mockAuditLogs: AuditLog[] = [
  {
    id: 'al1',
    userId: 'u1',
    userName: 'مهندس أحمد العوضي',
    action: 'تسجيل دخول النظام',
    details: 'تم تسجيل الدخول بنجاح من جهاز الآدمن الرئيسي',
    timestamp: '2026-10-19 09:30:00'
  },
  {
    id: 'al2',
    userId: 'u2',
    userName: 'سارة محمود',
    action: 'إنشاء عرض سعر',
    details: 'تم إصدار المقايسة رقم QT-2026-042 للعميل د. رانيا السعيد',
    timestamp: '2026-10-18 14:20:00'
  }
];

export const mockNews: NewsArticle[] = [
  {
    id: 'news-1',
    slug: 'new-cairo-luxury-villa-award-2026',
    title: {
      ar: 'أرتيزان آند سبيد تحصد جائزة التميز المعماري لتصميم قصر النرجس بالتجمع الخامس',
      en: 'Artisan & Space Wins Architectural Excellence Award for Al-Narges Palace in New Cairo'
    },
    excerpt: {
      ar: 'تكريم فريق العمل لنيله التقدير الذهبي في توظيف الرخام الإيطالي الطبيعي والإضاءة المعمارية المخفية.',
      en: 'Honoring our design engineering team with the Gold Award for natural Italian marble integration and ambient lighting.'
    },
    content: {
      ar: 'في إنجاز يعكس التزام شركة أرتيزان آند سبيد بأعلى معايير الإتقان والفخامة في السوق المصري، حصد مشروع "قصر النرجس" جائزة التميز المعماري لعام 2026. تميز التصميم بالتناغم الفريد بين الخطوط الكلاسيكية الفاخرة والروح العصرية، مع توظيف العزل الصوتي والحراري المبتكر وشبكات المنازل الذكية المتكاملة.',
      en: 'In an achievement reflecting Artisan & Space commitment to the highest standards of luxury and precision in Egypt, the Al-Narges Palace project received the 2026 Architectural Excellence Award.'
    },
    image: '/images/portfolio_villa_new_cairo_1792469679890.jpg',
    category: 'awards',
    categoryLabel: { ar: 'جوائز وفعاليات', en: 'Awards & Events' },
    author: 'م. أحمد العوضي',
    publishedAt: '2026-10-25',
    isPublished: true,
    views: 1240
  },
  {
    id: 'news-2',
    slug: 'interior-design-trends-egypt-2026',
    title: {
      ar: 'أبرز اتجاهات الديكور والتصميم الداخلي للفلل السكنية في مصر لعام 2026',
      en: 'Top Luxury Interior Design Trends for Residential Villas in Egypt for 2026'
    },
    excerpt: {
      ar: 'دليلك الشامل لدمج الأخشاب الطبيعية، والأقمشة الترابية الدافئة، والتصميم الموفر للطاقة.',
      en: 'Your definitive guide to integrating warm natural woods, organic earth palettes, and energy-efficient lighting.'
    },
    content: {
      ar: 'يشهد عام 2026 تحولاً نوعياً في اختيارات عملاء الديكور في مصر، حيث يبرز التوجه نحو المساحات المفتوحة المدروسة صوتياً وهندسياً، واستخدام درجات البيج الرملي والرمادي الدافئ بدلاً من الأبيض الصريح. كما تزداد شعبية المطابخ المفتوحة المزودة بأحدث الأسطح البورسلانية المقاومة للحرارة والخدش.',
      en: '2026 marks a transformative era in luxury interior design across Egypt, embracing warm sand tones, acoustic wooden paneling, and seamless smart lighting ecosystems.'
    },
    image: '/images/hero_interior_design_1792469679331.jpg',
    category: 'design_trends',
    categoryLabel: { ar: 'اتجاهات التصميم', en: 'Design Trends' },
    author: 'سارة محمود',
    publishedAt: '2026-10-18',
    isPublished: true,
    views: 890
  },
  {
    id: 'news-3',
    slug: 'smart-corporate-headquarters-finishing',
    title: {
      ar: 'تسليم المرحلة الأولى من المقر الإداري لشركة استثمارية بالقرية الذكية',
      en: 'Delivery of Phase 1 Smart Corporate Headquarters in Smart Village'
    },
    excerpt: {
      ar: 'إنهاء أعمال العزل الصوتي المزدوج والتشطيبات الذكية قبل الموعد التعاقدي بأسبوعين.',
      en: 'Completion of acoustic glass partitioning and smart office infrastructure two weeks ahead of schedule.'
    },
    content: {
      ar: 'أعلن قسم المشروعات التجارية بشركة أرتيزان آند سبيد عن إتمام تسليم المرحلة الأولى لمشروع المقر الإداري بالقرية الذكية بمساحة 1,200 متر مربع. شمل المشروع قاعات اجتماعات معزولة صوتياً بالكامل، وقواطع زجاجية ذكية، وأنظمة تحكم مركزية في الطاقة والتكييف.',
      en: 'Artisan & Space commercial projects division successfully delivered Phase 1 of the corporate headquarters project in Smart Village covering 1,200 sqm.'
    },
    image: '/images/portfolio_commercial_hq_1792469679674.jpg',
    category: 'projects',
    categoryLabel: { ar: 'أخبار المشاريع', en: 'Projects News' },
    author: 'م. كريم الشريف',
    publishedAt: '2026-10-10',
    isPublished: true,
    views: 650
  }
];
