export type UserRole = 'admin' | 'teacher' | 'parent' | 'student';

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused' | 'unmarked';

export type PrayerLocation = 'MSJ' | 'HM' | 'none'; // MSJ = Masjid, HM = Home

export interface LessonProgress {
  amount: string;          // e.g. "Juz 28, Surah Al-Mulk v.1-15" or "1/2 Page"
  mistakes: number;        // Number of mistakes recorded
  taskPassed: boolean | null; // true = Yes, false = No, null = Not assessed yet
  notes?: string;
}

export interface DailyHifzRecord {
  id: string;
  day: DayOfWeek;
  date: string;            // YYYY-MM-DD
  attendance: AttendanceStatus;
  
  // Key Hifz pillars according to Madrasah terminology:
  sabaq: LessonProgress;       // New Lesson / Portion to Memorise
  sabaqPara: LessonProgress;   // Sabaqee / Latest Juz Revision
  dawr1: LessonProgress;       // Further Revision 1 (Manzil)
  dawr2: LessonProgress;       // Further Revision 2 (Manzil)
  
  comments: string;            // Teacher daily comments
  commentsUrdu?: string;       // Original Urdu text if entered by Ustadh
  commentsEnglishTranslation?: string; // Auto-translated English text for parents/students
  parentSigned: boolean;       // Parent sign-off
  parentSignDate?: string;
  teacherSigned: boolean;
  timestamp: string;
}

export interface DailyHomeLearningRecord {
  day: DayOfWeek;
  date: string;
  sabaqMins: number;           // Minutes spent at home on Sabaq
  sabaqParaMins: number;       // Minutes spent on Sabaqee
  dawr1Mins: number;           // Minutes spent on Dawr 1
  dawr2Mins: number;           // Minutes spent on Dawr 2
  parentSigned: boolean;
  notes?: string;
}

export interface DailyTarbiyahRecord {
  day: DayOfWeek;
  date: string;
  prayers: {
    fajr: PrayerLocation;
    dhuhr: PrayerLocation;
    asr: PrayerLocation;
    maghrib: PrayerLocation;
    ishaa: PrayerLocation;
  };
  collectiveTaleemMins: number; // Mins of family taleem
  collectiveDuaMins: number;    // Mins of collective family dua
  dailySadaqah: boolean;        // Yes/No
  eesaalThawaab: boolean;       // Yes/No
  dailyDuasDhikr: boolean;      // Yes/No
  dailyQuranWird: boolean;      // Yes/No
}

export interface ParentTaskRecord {
  id: string;
  date: string;
  day: string;
  task: string;
  mistakesNotes: string;
  parentSigned: boolean;
}

export interface WeeklySummary {
  totalSabaqAmount: string;
  totalSabaqPassed: number;
  totalSabaqAttempted: number;
  
  totalSabaqParaAmount: string;
  totalSabaqParaPassed: number;
  totalSabaqParaAttempted: number;
  
  totalDawrAmount: string;
  totalDawrPassed: number;
  totalDawrAttempted: number;
  
  totalDaysAbsent: number;
  totalDaysLate: number;
  totalDaysPresent: number;
  
  totalHomeStudyMins: number;
  masjidPrayerCount: number;
  homePrayerCount: number;
  tarbiyahScore: number; // Percentage
  
  overallGrade: 'A+' | 'A' | 'B' | 'C' | 'Needs Attention' | 'Not yet assessed';
  performanceScore: number; // 0 - 100
}

export interface WeeklyEvaluationRecord {
  id: string;
  weekCommencing: string; // e.g. "2026-09-14"
  currentJuz: number;
  currentSurah: string;
  
  // Additional trackable aspects from page 2:
  islamicStudies: {
    passed: boolean;
    teacherComments: string;
  };
  duasMemorisation: {
    passed: boolean;
    currentDua: string;
  };
  surahMemorisation: {
    passed: boolean;
    parentComments: string;
  };
  
  teacherOverallFeedback: string;
  teacherFeedbackUrdu?: string;
  teacherFeedbackTranslation?: string;
  parentOverallFeedback: string;
  teacherSigned: boolean;
  parentSigned: boolean;
  automatedReportGenerated: boolean;
}

export interface Student {
  id: string;
  name: string;
  rollNumber: string;
  avatar?: string;
  currentJuz: number;
  currentSurah: string;
  totalJuzMemorised: number;
  targetYearlyJuz: number;
  hifzStartDate: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  studentEmail?: string;
  teacherName: string;
  teacherEmail?: string;
  circleCode: string;
  classGroup: string;
  enrollmentCode: string;
  status: 'active' | 'pending-invite' | 'inactive';
  invitationSentDate?: string;
}

export type ActiveTab = 'dashboard' | 'daily-hifz' | 'attendance' | 'home-tarbiyah' | 'weekly-report' | 'settings' | 'admin-control';

export type PortalMode = 'landing' | 'student-parent' | 'teacher' | 'admin';

export interface TeacherAccount {
  id: string;
  name: string;
  email: string;
  circleName: string;
  circleCode: string;
  passcode: string;
  phone?: string;
  juzFocusRange?: string;
  active?: boolean;
  status: 'active' | 'inactive';
}

export interface AdminPortalPermissions {
  studentParent: {
    canViewSabaqScores: boolean;
    canViewTeacherComments: boolean;
    canViewAttendance: boolean;
    canViewTarbiyahHome: boolean;
    canViewWeeklyEvaluation: boolean;
    canSignEvaluation: boolean;
    canSubmitInquiries: boolean;
    showOverallClassComparison: boolean;
    showTeacherNotes?: boolean;
    showMistakeBreakdown?: boolean;
    showTarbiyahTab?: boolean;
    showAttendanceTab?: boolean;
    showWeeklyGrades?: boolean;
    allowParentInquiries?: boolean;
    allowParentHomeTasks?: boolean;
    showEndOfTermLedger?: boolean;
  };
  teacher: {
    canEditAttendance: boolean;
    canGradeDailyHifz: boolean;
    canEditWeeklyEvaluation: boolean;
    canDeleteStudents: boolean;
    canExportTermArchive: boolean;
    canViewParentContactInfo: boolean;
    canManageClassRoster: boolean;
    allowEditGradingScale?: boolean;
    allowExportSchoolLedger?: boolean;
    allowDeleteStudents?: boolean;
    allowAddStudents?: boolean;
    allowEditAcademicCalendar?: boolean;
  };
}

export type VernacularLocale = 'UK' | 'US' | 'OTHER';

export interface IslamicTrophyTier {
  id: string;
  minPoints: number;
  titleArabic: string;
  titleEnglish: string;
  titleUrdu: string;
  description: string;
  badgeIcon: 'award' | 'star' | 'crown' | 'sparkles' | 'shield';
  colorScheme: 'amber' | 'emerald' | 'blue' | 'purple' | 'rose';
}

export interface AdminSettings {
  adminEmail: string;
  adminPasscode: string;
  academyName: string;
  academicYear: string;
  permissions: AdminPortalPermissions;
  teachers: TeacherAccount[];
  vernacularLocale?: VernacularLocale;
  trophies?: IslamicTrophyTier[];
  appLanguage?: 'en' | 'ur' | 'ar';
}

export interface LoggedInUser {
  role: UserRole;
  email?: string;
  displayName?: string;
  photoURL?: string;
  uid?: string;
  teacherId?: string;
  circleCode?: string;
  studentId?: string;
  allowedStudentIds: string[];
}

export type SimpleStorageMethod = 'google-drive-sheets' | 'google-cloud-firestore' | 'google-apps-script';

export interface StudentGmailMapping {
  studentId: string;
  studentName: string;
  rollNumber: string;
  studentGmail: string;
  parentGmail: string;
  parentName: string;
  status: 'linked' | 'pending';
}

export interface MadrasahGoogleSetup {
  isConfigured: boolean;
  madrasahAdminGmail: string;
  storageMethod: SimpleStorageMethod;
  cloudFolderNameOrSheetId: string;
  classInviteCode: string;
  studentMappings: StudentGmailMapping[];
  autoSyncEveryMinutes: number;
}

export interface TeacherSettings {
  teacherPasscode: string;
  circleName: string;
  academicYear: string;
  headTeacherName: string;
  maxSabaqMistakesForPass: number;
  maxDawrMistakesForPass: number;
  gradingScale: {
    aPlus: number;
    a: number;
    b: number;
    c: number;
  };
  serverEndpoint: string;
  enforceGoogleSSODomain: string;
  encryptionEnabled: boolean;
  auditLogging: boolean;
  madrasahGoogleSetup: MadrasahGoogleSetup;
}

export interface ParentSettings {
  linkedChildGoogleEmail: string;
  parentContactEmail: string;
  parentNotificationPhone: string;
  dailyHomeStudyTargetMins: number;
  notifyOnTeacherGrade: boolean;
  notifyOnFajrRevision: boolean;
  offlineDataSync: boolean;
}

export interface SyncStatus {
  status: 'synced' | 'syncing' | 'offline';
  lastSyncTime: string;
  serverUrl: string;
  encryption: string;
  pendingChangesCount: number;
}

export type NotificationType = 'grade' | 'attendance' | 'parent_inquiry' | 'report_signed' | 'system' | 'reminder';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: NotificationType;
  targetRole?: 'teacher' | 'parent' | 'admin' | 'all';
  studentId?: string;
  linkTab?: ActiveTab;
}

export interface ParentUpdateRequest {
  id: string;
  studentId: string;
  studentName: string;
  parentName: string;
  parentEmail: string;
  date: string;
  timestamp: string;
  templateCategory: 'general' | 'revision' | 'exam' | 'custom';
  subject: string;
  message: string;
  urgency: 'routine' | 'urgent';
  status: 'pending' | 'addressed';
  teacherReply?: string;
  repliedAt?: string;
}

export interface PushNotificationSettings {
  pushEnabled: boolean;
  permissionStatus: 'default' | 'granted' | 'denied' | 'unsupported';
  notifyOnGradeRecitation: boolean;
  notifyOnAttendanceStatus: boolean;
  notifyOnParentInquiry: boolean;
  notifyOnEvaluationSign: boolean;
  notifyOnTarbiyahHomeLogs: boolean;
  soundEnabled: boolean;
}

export interface EndOfTermSetup {
  termId: string;
  termTitle: string;
  academicYear: string;
  startDate: string;
  endDate: string;
  totalClassDays: number;
  passingScoreThreshold: number;
  headTeacherName: string;
  headTeacherSeal: string;
  termStatus: 'in-progress' | 'concluded' | 'archived';
  termRemarks: string;
}
