export type AppLanguage = 'en' | 'ur' | 'ar';

export interface AppDictionary {
  dir: 'ltr' | 'rtl';
  langName: string;
  nativeName: string;
  // Landing texts
  bismillah: string;
  subTitle: string;
  skipToPortals: string;
  chooseYourRole: string;
  selectRoleSubtitle: string;
  familyStudent: string;
  familyStudentSubtitle: string;
  familyBullets: string[];
  enterFamilyPortal: string;
  facultyUstadh: string;
  facultyUstadhSubtitle: string;
  facultyBullets: string[];
  enterUstadhPortal: string;
  adminGovernance: string;
  adminGovernanceSubtitle: string;
  adminBullets: string[];
  enterAdminPortal: string;
  // Common terms
  meritPoints: string;
  trophies: string;
  weeklyDossier: string;
  dailyHifz: string;
  attendance: string;
  tarbiyah: string;
  settings: string;
  autoTranslateNotice: string;
}

export const APP_TRANSLATIONS: Record<AppLanguage, AppDictionary> = {
  en: {
    dir: 'ltr',
    langName: 'English',
    nativeName: 'English',
    bismillah: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
    subTitle: 'Role-Based Quran Memorization, Sabaq/Dawr Evaluation & Tarbiyah Management System',
    skipToPortals: 'Skip straight to login portals',
    chooseYourRole: 'Select your role to get started',
    selectRoleSubtitle: 'Experience tailored workflows for parents, Quran teachers, and Madrasah administrators.',
    familyStudent: 'Parent or Student',
    familyStudentSubtitle: 'Home Tarbiyah & Progress Access',
    familyBullets: [
      'Zero-leak private portal access using your registered parent email',
      'Track daily Sabaq, Sabaq Para & Dawr grades in real time',
      'Log evening prayers (Salaah) and daily good deeds at home',
      'Download and digitally sign verified weekly progress dossiers'
    ],
    enterFamilyPortal: 'Enter Student & Parent Portal',
    facultyUstadh: 'Ustadh / Quran Teacher',
    facultyUstadhSubtitle: 'Class Recitation & Attendance',
    facultyBullets: [
      'Circle-scoped access protecting other classes from visibility',
      '30-second rapid grading for Sabaq, Sabaq Para & Dawr',
      'Instant Urdu voice/text notes with auto-translation for families',
      'Weekly evaluation sign-off with automated Islamic merit badges'
    ],
    enterUstadhPortal: 'Enter Ustadh Faculty Portal',
    adminGovernance: 'Madrasah Administrator',
    adminGovernanceSubtitle: 'Principal Setup & System Governance',
    adminBullets: [
      'Master password security and full institute rebranding',
      'Automated Islamic Trophy thresholds and title customization',
      'Vernacular and spelling localization (UK vs US vs Other)',
      'Dictate screen visibility and generate official enrollment keys'
    ],
    enterAdminPortal: 'Enter Madrasah Admin Portal',
    meritPoints: 'Merit Points',
    trophies: 'Islamic Trophies',
    weeklyDossier: 'Weekly Dossier',
    dailyHifz: 'Daily Recitations',
    attendance: 'Attendance Register',
    tarbiyah: 'Home Study & Salaah',
    settings: 'Settings',
    autoTranslateNotice: 'Urdu comments are automatically translated for parents.'
  },
  ur: {
    dir: 'rtl',
    langName: 'Urdu',
    nativeName: 'اردو',
    bismillah: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
    subTitle: 'قرآن کریم حفظ، سبق و دور، حاضری اور تربیت کا جامع ڈیجیٹل نظام',
    skipToPortals: 'براہِ راست لاگ ان پورٹل پر جائیں',
    chooseYourRole: 'شروع کرنے کے لیے اپنے شعبے کا انتخاب کریں',
    selectRoleSubtitle: 'والدین، اساتذہ کرام اور مدرسہ انتظامیہ کے لیے مخصوص اور آسان پورٹلز۔',
    familyStudent: 'طالبِ علم یا والدین',
    familyStudentSubtitle: 'گھریلو تربیت اور روزانہ حفظ ریکارڈ',
    familyBullets: [
      'رجسٹرڈ ای میل کے ذریعے مکمل محفوظ اور پرائیویٹ رسائی',
      'روزانہ کا سبق، سبق پارہ اور دور کے درجات براہِ راست دیکھیں',
      'گھر پر نمازوں اور اچھے اعمال کا ریکارڈ درج کریں',
      'ہفتہ وار کارکردگی رپورٹ اور تہنیتی سرٹیفکیٹ ڈاؤنلوڈ کریں'
    ],
    enterFamilyPortal: 'والدین اور طلبہ پورٹل میں داخل ہوں',
    facultyUstadh: 'استادِ محترم / معلّم',
    facultyUstadhSubtitle: 'حلقہ حفظ، روزانہ سبق اور حاضری',
    facultyBullets: [
      'صرف اپنے تفویض کردہ حلقے کے طلبہ تک محدود رسائی',
      'سبق، سبق پارہ اور دور کی فوری ۳۰ سیکنڈ میں جانچ',
      'اردو میں تفصیلی ریمارکس جو والدین کے لیے خودکار انگریزی میں ترجمہ ہوتے ہیں',
      'ہفتہ وار دستخط شدہ رپورٹس اور اسلامی میرٹ پوائنٹس کی تصدیق'
    ],
    enterUstadhPortal: 'اساتذہ پورٹل میں داخل ہوں',
    adminGovernance: 'مہتمم / مدرسہ انتظامیہ',
    adminGovernanceSubtitle: 'مکمل نظم و نسق اور تصدیق شدہ اسناد',
    adminBullets: [
      'ماسٹر پاس ورڈ اور مدرسہ کا نام و سالانہ سیشن تبدیل کریں',
      'اسلامی تمغوں (Trophies) اور میرٹ پوائنٹس کی مکمل ترامیم',
      'علاقائی ہجے اور اصطلاحات (برطانوی، امریکی یا روایتی) کا انتخاب',
      'سکرینز کے اختیارات اور داخلہ کوڈز جاری کریں'
    ],
    enterAdminPortal: 'انتظامیہ پورٹل میں داخل ہوں',
    meritPoints: 'میرٹ پوائنٹس',
    trophies: 'اسلامی اعزازات',
    weeklyDossier: 'ہفتہ وار رپورٹ',
    dailyHifz: 'روزانہ کا سبق',
    attendance: 'حاضری رجسٹر',
    tarbiyah: 'تربیت و نماز',
    settings: 'ترتیبات',
    autoTranslateNotice: 'استاد کے اردو تبصرے کا انگریزی ترجمہ خودکار تیار ہوتا ہے۔'
  },
  ar: {
    dir: 'rtl',
    langName: 'Arabic',
    nativeName: 'العربية',
    bismillah: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
    subTitle: 'النظام الشامل لإدارة حلقات تحفيظ القرآن الكريم والمتابعة التربوية',
    skipToPortals: 'الانتقال المباشر إلى بوابات الدخول',
    chooseYourRole: 'اختر صفتك للمتابعة في النظام',
    selectRoleSubtitle: 'بوابات مخصصة لأولياء الأمور والمعلمين وإدارة المدرسة القرآنية.',
    familyStudent: 'ولي الأمر أو الطالب',
    familyStudentSubtitle: 'متابعة الحفظ المنزلي والتقدم القرآني',
    familyBullets: [
      'دخول آمن وخاص باستخدام البريد الإلكتروني المسجل لولي الأمر',
      'متابعة درجات السَّبق وسَبَق البارة والدَّور في الوقت الحقيقي',
      'تسجيل صلوات الفريضة والأعمال الصالحة اليومية في المنزل',
      'تحميل وتوقيع التقارير الأسبوعية المعتمدة رقمياً'
    ],
    enterFamilyPortal: 'الدخول إلى بوابة الطالب وولي الأمر',
    facultyUstadh: 'المعلّم / الشيخ المحفّظ',
    facultyUstadhSubtitle: 'تسميع الحلقة ورصد الحضور اليومي',
    facultyBullets: [
      'صلاحيات محصورة بطلاب الحلقة المعينة فقط لحفظ الخصوصية',
      'تقييم فوري خلال ٣٠ ثانية للسبق والبارة والدور',
      'إدخال الملاحظات والترجمة الفورية لأولياء الأمور',
      'اعتماد التقرير الأسبوعي ورصد نقاط التميز الإسلامية'
    ],
    enterUstadhPortal: 'الدخول إلى بوابة المعلمين',
    adminGovernance: 'إدارة المدرسة القرآنية',
    adminGovernanceSubtitle: 'الإشراف العام وتحديد الصلاحيات',
    adminBullets: [
      'حماية كلمة المرور الرئيسية وتخصيص هوية المدرسة',
      'تخصيص ألقاب التميز والدرجات التقديرية الإسلامية',
      'تحديد لغة المصطلحات المدرسية ونظام الدرجات',
      'إدارة حلقات الأساتذة وتوليد مفاتيح تسجيل الطلاب'
    ],
    enterAdminPortal: 'الدخول إلى بوابة إدارة المدرسة',
    meritPoints: 'نقاط التميز',
    trophies: 'الأوسمة الإسلامية',
    weeklyDossier: 'الملف الأسبوعي',
    dailyHifz: 'التسميع اليومي',
    attendance: 'سجل الحضور',
    tarbiyah: 'المتابعة والصلوات',
    settings: 'الإعدادات',
    autoTranslateNotice: 'تتم ترجمة ملاحظات المعلم آلياً لتسهيل المتابعة.'
  }
};
