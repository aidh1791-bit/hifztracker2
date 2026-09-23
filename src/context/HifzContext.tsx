import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  Student,
  DailyHifzRecord,
  DailyHomeLearningRecord,
  DailyTarbiyahRecord,
  ParentTaskRecord,
  WeeklyEvaluationRecord,
  UserRole,
  ActiveTab,
  AttendanceStatus,
  PrayerLocation,
  LessonProgress,
  WeeklySummary,
  PortalMode,
  TeacherSettings,
  ParentSettings,
  SyncStatus,
  MadrasahGoogleSetup,
  StudentGmailMapping,
  AppNotification,
  ParentUpdateRequest,
  PushNotificationSettings,
  EndOfTermSetup,
  TeacherAccount,
  AdminSettings,
  AdminPortalPermissions,
  LoggedInUser,
  VernacularLocale,
  IslamicTrophyTier
} from '../types';
import { AppLanguage } from '../utils/appTranslations';
import { DEFAULT_ISLAMIC_TROPHIES } from '../utils/meritTrophies';
import {
  INITIAL_STUDENTS,
  INITIAL_HIFZ_RECORDS,
  INITIAL_HOME_LEARNING,
  INITIAL_TARBIYAH_RECORDS,
  INITIAL_PARENT_TASKS,
  INITIAL_WEEKLY_EVALUATIONS,
  INITIAL_TEACHERS,
  DEFAULT_ADMIN_SETTINGS
} from '../data/initialData';
import { calculateWeeklySummary } from '../utils/hifzCalculations';
import {
  compileAllStudentsTermData,
  generateEndOfTermCSV,
  generateEndOfTermJSON,
  downloadBlobFile
} from '../utils/exportHelpers';
import {
  getUkCurrentDate,
  createBlankDailyHifzRecord,
  createBlankWeeklyHomeLearning,
  createBlankWeeklyTarbiyah
} from '../utils/dateUtils';
import { auth, googleAuthProvider } from '../lib/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { dataRepository } from '../services/dataRepository';
import { syncQueue } from '../services/syncQueue';

interface HifzContextType {
  students: Student[];
  visibleStudents: Student[];
  selectedStudent: Student;
  setSelectedStudentId: (id: string) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  currentUser: LoggedInUser;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  devicePreview: 'responsive' | 'iphone' | 'android';
  setDevicePreview: (mode: 'responsive' | 'iphone' | 'android') => void;
  
  // Records for currently selected student
  currentHifzRecords: DailyHifzRecord[];
  startTodayRecord: (studentId?: string) => DailyHifzRecord;
  currentHomeLearning: DailyHomeLearningRecord[];
  currentTarbiyah: DailyTarbiyahRecord[];
  currentParentTasks: ParentTaskRecord[];
  currentEvaluation: WeeklyEvaluationRecord;
  weeklySummary: WeeklySummary;

  // Actions
  updateHifzLesson: (
    recordId: string,
    category: 'sabaq' | 'sabaqPara' | 'dawr1' | 'dawr2',
    data: Partial<LessonProgress>
  ) => void;
  updateAttendance: (recordId: string, status: AttendanceStatus) => void;
  updateTeacherComment: (recordId: string, comment: string, commentUrdu?: string, translatedComment?: string) => void;
  signAsParent: (recordId: string) => void;
  signAsTeacher: (recordId: string) => void;
  
  // Home & Tarbiyah actions
  updateHomeLearningMins: (
    day: string,
    field: 'sabaqMins' | 'sabaqParaMins' | 'dawr1Mins' | 'dawr2Mins',
    mins: number
  ) => void;
  signHomeLearningParent: (day: string) => void;
  togglePrayerLocation: (day: string, prayer: 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'ishaa') => void;
  updateTarbiyahBool: (
    day: string,
    field: 'dailySadaqah' | 'eesaalThawaab' | 'dailyDuasDhikr' | 'dailyQuranWird',
    val: boolean
  ) => void;
  updateTarbiyahMins: (
    day: string,
    field: 'collectiveTaleemMins' | 'collectiveDuaMins',
    mins: number
  ) => void;
  
  // Parent Tasks
  addParentTask: (task: string, mistakesNotes: string) => void;
  toggleParentTaskSign: (taskId: string) => void;
  deleteParentTask: (taskId: string) => void;

  // Evaluation
  updateWeeklyEvaluation: (updates: Partial<WeeklyEvaluationRecord>) => void;
  signEvaluation: (asRole: 'teacher' | 'parent') => void;

  // Portal Management & Authentication
  portalMode: PortalMode;
  setPortalMode: (mode: PortalMode) => void;
  enterStudentParentPortal: (studentId: string, googleEmail?: string) => void;
  enterStudentParentPortalByEmail: (emailOrCode: string) => {
    success: boolean;
    message: string;
    matchedCount: number;
    studentName?: string;
  };
  enterTeacherPortal: (passcode?: string) => boolean;
  enterTeacherPortalByCredentials: (emailOrPasscode: string, circleCode?: string) => {
    success: boolean;
    message: string;
    teacherName?: string;
  };
  enterAdminPortal: (passcode: string) => boolean;
  logoutToLanding: () => void;

  // Student CRUD & Invitation Workflow
  addStudent: (data: {
    name: string;
    parentName: string;
    parentEmail: string;
    parentPhone: string;
    studentEmail?: string;
    teacherName: string;
    teacherEmail?: string;
    circleCode: string;
    classGroup: string;
    currentJuz: number;
    currentSurah: string;
    targetYearlyJuz: number;
  }) => { student: Student; enrollmentCode: string; inviteLetter: string };
  deleteStudent: (studentId: string) => void;
  clearSampleStudents: () => void;
  resetToSampleStudents: () => void;
  simulateEmailSent: (studentId: string) => void;

  // Admin Master Settings & Permissions Dictation
  adminSettings: AdminSettings;
  updateAdminSettings: (updates: Partial<AdminSettings>) => void;
  updateAdminPermissions: (permissions: Partial<AdminPortalPermissions>) => void;
  addTeacherAccount: (teacher: Omit<TeacherAccount, 'id'>) => TeacherAccount;
  updateTeacherAccount: (id: string, updates: Partial<TeacherAccount>) => void;
  deleteTeacherAccount: (id: string) => void;
  appLanguage: AppLanguage;
  setAppLanguage: (lang: AppLanguage) => void;
  updateTrophies: (trophies: IslamicTrophyTier[]) => void;
  updateVernacularLocale: (locale: VernacularLocale) => void;

  // Dedicated Settings
  teacherSettings: TeacherSettings;
  updateTeacherSettings: (updates: Partial<TeacherSettings>) => void;
  saveMadrasahGoogleSetup: (setup: MadrasahGoogleSetup) => void;
  updateStudentGmailMapping: (studentId: string, studentGmail: string, parentGmail: string) => void;
  findStudentByGmail: (email: string) => Student | null;
  parentSettings: ParentSettings;
  updateParentSettings: (updates: Partial<ParentSettings>) => void;

  // Private Class Server & Sync
  syncStatus: SyncStatus;
  triggerManualSync: () => void;

  // Notifications & Inquiries
  notifications: AppNotification[];
  unreadNotificationsCount: number;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  clearNotifications: () => void;
  addNotification: (notification: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => void;

  parentUpdateRequests: ParentUpdateRequest[];
  sendParentUpdateRequest: (
    subject: string,
    message: string,
    category: 'general' | 'revision' | 'exam' | 'custom',
    urgency?: 'routine' | 'urgent'
  ) => void;
  acknowledgeParentUpdateRequest: (requestId: string, teacherReply?: string) => void;

  pushSettings: PushNotificationSettings;
  updatePushSettings: (updates: Partial<PushNotificationSettings>) => void;
  requestPushPermission: () => Promise<string>;
  sendTestPushNotification: () => void;

  // End of Term Setup & Export
  endOfTermSetup: EndOfTermSetup;
  updateEndOfTermSetup: (updates: Partial<EndOfTermSetup>) => void;
  exportEndOfTermData: (format: 'csv' | 'json') => void;

  // Security Architecture Modal
  isSecurityModalOpen: boolean;
  setIsSecurityModalOpen: (open: boolean) => void;

  // Firebase Multi-Role Auth
  firebaseUser: User | null;
  firebaseLoading: boolean;
  signInWithFirebaseEmail: (email: string, pass: string) => Promise<{ success: boolean; message: string }>;
  signUpWithFirebaseEmail: (email: string, pass: string, role?: UserRole) => Promise<{ success: boolean; message: string }>;
  signInWithGoogle: () => Promise<{ success: boolean; message: string }>;
  signOutFirebase: () => Promise<void>;

  // Cloud SQL & Offline Sync Queue
  offlineQueueCount: number;
  isDeviceOnline: boolean;
  isSyncingCloud: boolean;
  syncNow: () => Promise<{ synced: number; failed: number }>;

  // Reset demo
  resetData: () => void;
}

const HifzContext = createContext<HifzContextType | undefined>(undefined);

const STORAGE_KEY_STUDENTS = 'hifz_tracker_students_v1';
const STORAGE_KEY_HIFZ = 'hifz_tracker_hifz_records_v1';
const STORAGE_KEY_HOME = 'hifz_tracker_home_learning_v1';
const STORAGE_KEY_TARBIYAH = 'hifz_tracker_tarbiyah_v1';
const STORAGE_KEY_PARENT_TASKS = 'hifz_tracker_parent_tasks_v1';
const STORAGE_KEY_EVAL = 'hifz_tracker_evaluations_v1';
const STORAGE_KEY_PORTAL = 'hifz_tracker_portal_mode_v1';
const STORAGE_KEY_TEACHER_SETTINGS = 'hifz_tracker_teacher_settings_v1';
const STORAGE_KEY_PARENT_SETTINGS = 'hifz_tracker_parent_settings_v1';
const STORAGE_KEY_NOTIFICATIONS = 'hifz_tracker_notifications_v1';
const STORAGE_KEY_PARENT_REQUESTS = 'hifz_tracker_parent_requests_v1';
const STORAGE_KEY_PUSH_SETTINGS = 'hifz_tracker_push_settings_v1';
const STORAGE_KEY_END_OF_TERM = 'hifz_tracker_end_of_term_v1';
const STORAGE_KEY_ADMIN_SETTINGS = 'hifz_tracker_admin_settings_v2';
const STORAGE_KEY_CURRENT_USER = 'hifz_tracker_current_user_v2';
const STORAGE_KEY_ACTIVE_ROLE = 'hifz_tracker_active_role_v2';
const STORAGE_KEY_SELECTED_STUDENT = 'hifz_tracker_selected_student_v2';
const STORAGE_KEY_ACTIVE_TAB = 'hifz_tracker_active_tab_v2';

export const DEFAULT_PUSH_SETTINGS: PushNotificationSettings = {
  pushEnabled: true,
  permissionStatus: typeof window !== 'undefined' && 'Notification' in window
    ? (Notification.permission as 'default' | 'granted' | 'denied')
    : 'unsupported',
  notifyOnGradeRecitation: true,
  notifyOnAttendanceStatus: true,
  notifyOnParentInquiry: true,
  notifyOnEvaluationSign: true,
  notifyOnTarbiyahHomeLogs: true,
  soundEnabled: true
};

export const DEFAULT_END_OF_TERM_SETUP: EndOfTermSetup = {
  termId: 'term-1-autumn-2026',
  termTitle: 'Autumn Semester 2026 (Term 1)',
  academicYear: '2026 - 2027',
  startDate: '2026-09-01',
  endDate: '2026-12-18',
  totalClassDays: 84,
  passingScoreThreshold: 70,
  headTeacherName: 'Ustadh Qari Bilal',
  headTeacherSeal: 'Hifz al-Quran Academy • Head Ustadh Verified',
  termStatus: 'in-progress',
  termRemarks: 'Students have demonstrated disciplined daily attendance and steady revision mastery. Home study compliance is monitored consistently.'
};

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    title: 'Sabaq Graded & Passed',
    message: 'Ustadh Qari Bilal recorded Sabaq for Abdullah Khan: Surah Maryam v.1-15 (Passed with 1 mistake).',
    timestamp: '2026-09-16 09:30',
    read: false,
    type: 'grade',
    targetRole: 'parent',
    studentId: 'std-1',
    linkTab: 'daily-hifz'
  },
  {
    id: 'notif-2',
    title: 'Parent Inquiry Acknowledged',
    message: 'Ustadh replied to your inquiry: "Please spend 30 mins each night on Juz 13 pages 9-12."',
    timestamp: '2026-09-15 17:45',
    read: false,
    type: 'parent_inquiry',
    targetRole: 'parent',
    studentId: 'std-1',
    linkTab: 'weekly-report'
  },
  {
    id: 'notif-3',
    title: 'Weekly Evaluation Dossier Signed',
    message: 'Ustadh Qari Bilal verified Week 3 Performance Dossier with Grade A+.',
    timestamp: '2026-09-14 16:20',
    read: true,
    type: 'report_signed',
    targetRole: 'all',
    studentId: 'std-1',
    linkTab: 'weekly-report'
  }
];

export const INITIAL_PARENT_REQUESTS: ParentUpdateRequest[] = [
  {
    id: 'req-1',
    studentId: 'std-1',
    studentName: 'Abdullah Khan',
    parentName: 'Tariq Khan',
    parentEmail: 'tariq.khan@gmail.com',
    date: '2026-09-15',
    timestamp: '2026-09-15 16:30',
    templateCategory: 'revision',
    subject: 'Guidance for Evening Home Practice & Dawr Focus',
    message: 'Assalamu Alaikum Ustadh, we are revising with Abdullah every evening at home. Could you kindly advise which Juz or specific Surah requires extra repetition this week? Jazakallahu Khair.',
    urgency: 'routine',
    status: 'addressed',
    teacherReply: 'Wa Alaikum Assalam respected parent. MashaAllah Abdullah is memorizing well. Please spend 30 mins each night on Juz 13 pages 9-12 as those verses have similar endings.',
    repliedAt: '2026-09-15 17:40'
  }
];

export const DEFAULT_MADRASAH_GOOGLE_SETUP: MadrasahGoogleSetup = {
  isConfigured: true,
  madrasahAdminGmail: 'madrasah.hifz.circle@gmail.com',
  storageMethod: 'google-drive-sheets',
  cloudFolderNameOrSheetId: 'Madrasah_Hifz_Class_Ledger_2026',
  classInviteCode: 'HIFZ-CIRCLE-786',
  studentMappings: [
    {
      studentId: 'std-1',
      studentName: 'Abdullah Khan',
      rollNumber: 'HIFZ-2024-042',
      studentGmail: 'abdullah.khan@gmail.com',
      parentGmail: 'tariq.khan@gmail.com',
      parentName: 'Tariq Khan',
      status: 'linked'
    },
    {
      studentId: 'std-2',
      studentName: 'Muhammad Patel',
      rollNumber: 'HIFZ-2024-019',
      studentGmail: 'muhammad.patel@gmail.com',
      parentGmail: 'patel.family@gmail.com',
      parentName: 'Ibrahim Patel',
      status: 'linked'
    },
    {
      studentId: 'std-3',
      studentName: 'Zayd Ahmed',
      rollNumber: 'HIFZ-2024-088',
      studentGmail: 'zayd.ahmed@gmail.com',
      parentGmail: 'ahmed.home@gmail.com',
      parentName: 'Farooq Ahmed',
      status: 'linked'
    }
  ],
  autoSyncEveryMinutes: 15
};

export const DEFAULT_TEACHER_SETTINGS: TeacherSettings = {
  teacherPasscode: '1234',
  circleName: 'Boys Hifz Circle (Advanced & Intermediate)',
  academicYear: '2026 - 2027 Term 1',
  headTeacherName: 'Ustadh Qari Bilal',
  maxSabaqMistakesForPass: 2,
  maxDawrMistakesForPass: 3,
  gradingScale: {
    aPlus: 90,
    a: 80,
    b: 70,
    c: 60,
  },
  serverEndpoint: 'https://madrasah-core-secure.internal/api/v1/hifz',
  enforceGoogleSSODomain: '@madrasah.internal',
  encryptionEnabled: true,
  auditLogging: true,
  madrasahGoogleSetup: DEFAULT_MADRASAH_GOOGLE_SETUP,
};

export const DEFAULT_PARENT_SETTINGS: ParentSettings = {
  linkedChildGoogleEmail: 'abdullah.khan@student.madrasah.internal',
  parentContactEmail: 'tariq.khan@gmail.com',
  parentNotificationPhone: '+44 7700 900123',
  dailyHomeStudyTargetMins: 90,
  notifyOnTeacherGrade: true,
  notifyOnFajrRevision: true,
  offlineDataSync: true,
};

export const HifzProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_STUDENTS);
    return saved ? JSON.parse(saved) : [];
  });

  const [adminSettings, setAdminSettings] = useState<AdminSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_ADMIN_SETTINGS);
    if (!saved) return DEFAULT_ADMIN_SETTINGS;
    try {
      const parsed = JSON.parse(saved);
      const academyName = (!parsed.academyName || parsed.academyName === 'Al-Huda Quran Academy & Madrasah Board' || parsed.academyName.includes('Al-Huda'))
        ? 'Hifz al-Quran Academy'
        : parsed.academyName;
      return {
        ...DEFAULT_ADMIN_SETTINGS,
        ...parsed,
        academyName,
        vernacularLocale: parsed.vernacularLocale || 'UK',
        trophies: parsed.trophies || DEFAULT_ISLAMIC_TROPHIES,
        appLanguage: parsed.appLanguage || 'en'
      };
    } catch {
      return DEFAULT_ADMIN_SETTINGS;
    }
  });

  const [appLanguage, setAppLanguageState] = useState<AppLanguage>(() => {
    const saved = localStorage.getItem('hifz_app_language') as AppLanguage;
    if (saved === 'en' || saved === 'ur' || saved === 'ar') return saved;
    return 'en';
  });

  const setAppLanguage = (lang: AppLanguage) => {
    setAppLanguageState(lang);
    localStorage.setItem('hifz_app_language', lang);
    setAdminSettings(prev => ({ ...prev, appLanguage: lang }));
  };

  const updateTrophies = (trophies: IslamicTrophyTier[]) => {
    setAdminSettings(prev => ({ ...prev, trophies }));
  };

  const updateVernacularLocale = (locale: VernacularLocale) => {
    setAdminSettings(prev => ({ ...prev, vernacularLocale: locale }));
  };

  const [currentUser, setCurrentUser] = useState<LoggedInUser>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_CURRENT_USER);
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return {
      role: 'unassigned' as any,
      email: '',
      displayName: 'Guest',
      allowedStudentIds: []
    };
  });

  const [portalMode, setPortalMode] = useState<PortalMode>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PORTAL);
    return (saved as PortalMode) || 'landing';
  });

  const [selectedStudentId, setSelectedStudentIdState] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_SELECTED_STUDENT);
    return saved || '';
  });

  const setSelectedStudentId = (id: string) => {
    setSelectedStudentIdState(id);
    localStorage.setItem(STORAGE_KEY_SELECTED_STUDENT, id);
  };

  const [userRole, setUserRoleState] = useState<UserRole>(() => {
    const savedRole = localStorage.getItem(STORAGE_KEY_ACTIVE_ROLE) as UserRole;
    if (savedRole && ['admin', 'teacher', 'parent', 'student'].includes(savedRole)) {
      return savedRole;
    }
    const savedUser = localStorage.getItem(STORAGE_KEY_CURRENT_USER);
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed.role && ['admin', 'teacher', 'parent', 'student'].includes(parsed.role)) {
          return parsed.role;
        }
      } catch {}
    }
    return 'unassigned' as any;
  });

  const setUserRole = (role: UserRole) => {
    setUserRoleState(role);
    localStorage.setItem(STORAGE_KEY_ACTIVE_ROLE, role);
    setCurrentUser(prev => ({ ...prev, role }));
  };

  const [activeTab, setActiveTabState] = useState<ActiveTab>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_ACTIVE_TAB) as ActiveTab;
    if (saved) return saved;
    return 'dashboard';
  });

  const setActiveTab = (tab: ActiveTab) => {
    setActiveTabState(tab);
    localStorage.setItem(STORAGE_KEY_ACTIVE_TAB, tab);
  };

  const [devicePreview, setDevicePreview] = useState<'responsive' | 'iphone' | 'android'>('responsive');

  const [teacherSettings, setTeacherSettings] = useState<TeacherSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_TEACHER_SETTINGS);
    if (!saved) return DEFAULT_TEACHER_SETTINGS;
    try {
      const parsed = JSON.parse(saved);
      const googleSetup: MadrasahGoogleSetup = {
        ...DEFAULT_MADRASAH_GOOGLE_SETUP,
        ...(parsed.madrasahGoogleSetup || {}),
        studentMappings: (parsed.madrasahGoogleSetup?.studentMappings && parsed.madrasahGoogleSetup.studentMappings.length > 0)
          ? parsed.madrasahGoogleSetup.studentMappings
          : DEFAULT_MADRASAH_GOOGLE_SETUP.studentMappings
      };
      return {
        ...DEFAULT_TEACHER_SETTINGS,
        ...parsed,
        madrasahGoogleSetup: googleSetup
      };
    } catch {
      return DEFAULT_TEACHER_SETTINGS;
    }
  });

  const [parentSettings, setParentSettings] = useState<ParentSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PARENT_SETTINGS);
    if (!saved) return DEFAULT_PARENT_SETTINGS;
    try {
      const parsed = JSON.parse(saved);
      return {
        ...DEFAULT_PARENT_SETTINGS,
        ...parsed
      };
    } catch {
      return DEFAULT_PARENT_SETTINGS;
    }
  });

  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    status: 'synced',
    lastSyncTime: 'Saved to Local Storage',
    serverUrl: 'madrasah-portal.local',
    encryption: 'Scoped Browser Storage',
    pendingChangesCount: 0
  });

  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);

  // Firebase Multi-Role Auth & Offline Sync state
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [firebaseLoading, setFirebaseLoading] = useState(true);
  const [offlineQueueCount, setOfflineQueueCount] = useState<number>(() => syncQueue.getPendingCount());
  const [isDeviceOnline, setIsDeviceOnline] = useState<boolean>(() => syncQueue.isNetworkOnline());
  const [isSyncingCloud, setIsSyncingCloud] = useState<boolean>(false);

  useEffect(() => {
    const unsubSync = syncQueue.subscribe((queue, online, syncing) => {
      setOfflineQueueCount(queue.filter(q => q.status === 'pending' || q.status === 'failed' || q.status === 'syncing').length);
      setIsDeviceOnline(online);
      setIsSyncingCloud(syncing);
      setSyncStatus(prev => ({
        ...prev,
        status: !online ? 'offline' : (syncing ? 'syncing' : (queue.length === 0 ? 'synced' : 'syncing')),
        pendingChangesCount: queue.length,
        lastSyncTime: syncQueue.getLastSyncTime() || prev.lastSyncTime
      }));
    });

    const unsubAuth = onAuthStateChanged(auth, async (u) => {
      setFirebaseUser(u);
      setFirebaseLoading(false);
      if (u) {
        try {
          const token = await u.getIdToken();
          localStorage.setItem('madrasah_firebase_token', token);
          
          // Authenticated hydration from server
          dataRepository.getStudents().then(cloudStudents => {
            if (cloudStudents && cloudStudents.length > 0) {
              setStudents(cloudStudents);
            }
          }).catch(() => {});

          dataRepository.getAllHifzRecords().then(rec => {
            if (rec && Object.keys(rec).length > 0) setHifzRecordsMap(rec);
          }).catch(() => {});

          dataRepository.getAllHomeLearningRecords().then(rec => {
            if (rec && Object.keys(rec).length > 0) setHomeLearningMap(rec);
          }).catch(() => {});

          dataRepository.getAllTarbiyahRecords().then(rec => {
            if (rec && Object.keys(rec).length > 0) setTarbiyahMap(rec);
          }).catch(() => {});

          dataRepository.getAllEvaluations().then(rec => {
            if (rec && Object.keys(rec).length > 0) setEvaluationsMap(rec);
          }).catch(() => {});
        } catch {}
      } else {
        localStorage.removeItem('madrasah_firebase_token');
      }
    });

    return () => {
      unsubSync();
      unsubAuth();
    };
  }, []);

  const [hifzRecordsMap, setHifzRecordsMap] = useState<Record<string, DailyHifzRecord[]>>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_HIFZ);
    return saved ? JSON.parse(saved) : {};
  });

  const [homeLearningMap, setHomeLearningMap] = useState<Record<string, DailyHomeLearningRecord[]>>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_HOME);
    return saved ? JSON.parse(saved) : {};
  });

  const [tarbiyahMap, setTarbiyahMap] = useState<Record<string, DailyTarbiyahRecord[]>>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_TARBIYAH);
    return saved ? JSON.parse(saved) : {};
  });

  const [parentTasksMap, setParentTasksMap] = useState<Record<string, ParentTaskRecord[]>>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PARENT_TASKS);
    return saved ? JSON.parse(saved) : {};
  });

  const [evaluationsMap, setEvaluationsMap] = useState<Record<string, WeeklyEvaluationRecord>>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_EVAL);
    return saved ? JSON.parse(saved) : {};
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_NOTIFICATIONS);
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [parentUpdateRequests, setParentUpdateRequests] = useState<ParentUpdateRequest[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PARENT_REQUESTS);
    return saved ? JSON.parse(saved) : INITIAL_PARENT_REQUESTS;
  });

  const [pushSettings, setPushSettings] = useState<PushNotificationSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PUSH_SETTINGS);
    if (!saved) return DEFAULT_PUSH_SETTINGS;
    try {
      return { ...DEFAULT_PUSH_SETTINGS, ...JSON.parse(saved) };
    } catch {
      return DEFAULT_PUSH_SETTINGS;
    }
  });

  const [endOfTermSetup, setEndOfTermSetup] = useState<EndOfTermSetup>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_END_OF_TERM);
    if (!saved) return DEFAULT_END_OF_TERM_SETUP;
    try {
      return { ...DEFAULT_END_OF_TERM_SETUP, ...JSON.parse(saved) };
    } catch {
      return DEFAULT_END_OF_TERM_SETUP;
    }
  });

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_HIFZ, JSON.stringify(hifzRecordsMap));
  }, [hifzRecordsMap]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_HOME, JSON.stringify(homeLearningMap));
  }, [homeLearningMap]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TARBIYAH, JSON.stringify(tarbiyahMap));
  }, [tarbiyahMap]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PARENT_TASKS, JSON.stringify(parentTasksMap));
  }, [parentTasksMap]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_EVAL, JSON.stringify(evaluationsMap));
  }, [evaluationsMap]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PORTAL, portalMode);
  }, [portalMode]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TEACHER_SETTINGS, JSON.stringify(teacherSettings));
  }, [teacherSettings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PARENT_SETTINGS, JSON.stringify(parentSettings));
  }, [parentSettings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PARENT_REQUESTS, JSON.stringify(parentUpdateRequests));
  }, [parentUpdateRequests]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PUSH_SETTINGS, JSON.stringify(pushSettings));
  }, [pushSettings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ADMIN_SETTINGS, JSON.stringify(adminSettings));
  }, [adminSettings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_END_OF_TERM, JSON.stringify(endOfTermSetup));
  }, [endOfTermSetup]);

  // Scoped list of students visible based on active portal and authenticated credentials
  const visibleStudents = useMemo(() => {
    if (portalMode === 'admin') {
      return students;
    }
    if (portalMode === 'student-parent') {
      // In student/parent mode: strictly filter to records matching the authenticated user's allowed IDs or verified email
      if (Array.isArray(currentUser.allowedStudentIds) && currentUser.allowedStudentIds.length > 0) {
        return students.filter(s => currentUser.allowedStudentIds!.includes(s.id));
      }
      if (currentUser.email) {
        const userEmail = currentUser.email.toLowerCase().trim();
        const byEmail = students.filter(s =>
          (s.parentEmail && s.parentEmail.toLowerCase().trim() === userEmail) ||
          (s.studentEmail && s.studentEmail.toLowerCase().trim() === userEmail)
        );
        return byEmail;
      }
      // Zero-trust: Never fail open to students[0]
      return [];
    }
    if (portalMode === 'teacher') {
      // In teacher mode: show only students enrolled in this teacher's circle code or matching teacher email
      if (Array.isArray(currentUser.allowedStudentIds) && currentUser.allowedStudentIds.length > 0) {
        return students.filter(s => currentUser.allowedStudentIds!.includes(s.id));
      }
      if (currentUser.circleCode) {
        return students.filter(s => s.circleCode.toLowerCase().trim() === currentUser.circleCode!.toLowerCase().trim());
      }
      if (currentUser.email) {
        return students.filter(s => s.teacherEmail?.toLowerCase().trim() === currentUser.email!.toLowerCase().trim());
      }
      // Zero-trust: Never fail open to all students
      return [];
    }
    return [];
  }, [students, portalMode, currentUser]);

  const selectedStudent = useMemo(() => {
    const found = visibleStudents.find(s => s.id === selectedStudentId);
    if (found) return found;
    if (visibleStudents.length > 0) return visibleStudents[0];
    return {
      id: 'no-student',
      name: 'No Student Authorized',
      rollNumber: 'NONE',
      currentJuz: 1,
      currentSurah: 'None',
      totalJuzMemorised: 0,
      targetYearlyJuz: 0,
      hifzStartDate: '',
      parentName: '',
      parentEmail: '',
      parentPhone: '',
      teacherName: '',
      circleCode: '',
      classGroup: '',
      enrollmentCode: '',
      status: 'inactive' as const
    };
  }, [visibleStudents, selectedStudentId]);

  const currentHifzRecords = useMemo(() => {
    return hifzRecordsMap[selectedStudentId] || [];
  }, [hifzRecordsMap, selectedStudentId]);

  const currentHomeLearning = useMemo(() => {
    const existing = homeLearningMap[selectedStudentId];
    if (existing && existing.length > 0) return existing;
    return createBlankWeeklyHomeLearning();
  }, [homeLearningMap, selectedStudentId]);

  const currentTarbiyah = useMemo(() => {
    const existing = tarbiyahMap[selectedStudentId];
    if (existing && existing.length > 0) return existing;
    return createBlankWeeklyTarbiyah();
  }, [tarbiyahMap, selectedStudentId]);

  const currentParentTasks = useMemo(() => {
    return parentTasksMap[selectedStudentId] || [];
  }, [parentTasksMap, selectedStudentId]);

  const currentEvaluation = useMemo(() => {
    if (evaluationsMap[selectedStudentId]) {
      return evaluationsMap[selectedStudentId];
    }
    const ukDate = getUkCurrentDate();
    return {
      id: `we-${selectedStudentId}`,
      weekCommencing: ukDate.dateString,
      currentJuz: selectedStudent.currentJuz || 0,
      currentSurah: selectedStudent.currentSurah || '',
      islamicStudies: { passed: false, teacherComments: 'Not yet assessed' },
      duasMemorisation: { passed: false, currentDua: 'Not yet assessed' },
      surahMemorisation: { passed: false, parentComments: 'Not yet assessed' },
      teacherOverallFeedback: '',
      parentOverallFeedback: '',
      teacherSigned: false,
      parentSigned: false,
      automatedReportGenerated: false
    };
  }, [evaluationsMap, selectedStudentId, selectedStudent]);

  const weeklySummary = useMemo(() => {
    return calculateWeeklySummary(currentHifzRecords, currentHomeLearning, currentTarbiyah);
  }, [currentHifzRecords, currentHomeLearning, currentTarbiyah]);

  // Actions
  const updateHifzLesson = (
    recordId: string,
    category: 'sabaq' | 'sabaqPara' | 'dawr1' | 'dawr2',
    data: Partial<LessonProgress>
  ) => {
    let updatedRecord: DailyHifzRecord | undefined;
    setHifzRecordsMap(prev => {
      const list = prev[selectedStudentId] || [];
      const updated = list.map(item => {
        if (item.id === recordId) {
          const rec: DailyHifzRecord = {
            ...item,
            [category]: {
              ...item[category],
              ...data
            },
            teacherSigned: true
          };
          updatedRecord = rec;
          return rec;
        }
        return item;
      });
      return { ...prev, [selectedStudentId]: updated };
    });

    if (updatedRecord && selectedStudentId && selectedStudentId !== 'no-student') {
      dataRepository.syncHifzRecord(selectedStudentId, updatedRecord).catch(err => {
        console.warn('[HifzContext] Failed to sync Hifz lesson:', err);
      });
    }
  };

  const updateAttendance = (recordId: string, status: AttendanceStatus) => {
    let updatedRecord: DailyHifzRecord | undefined;
    setHifzRecordsMap(prev => {
      const list = prev[selectedStudentId] || [];
      const updated = list.map(item => {
        if (item.id === recordId) {
          const rec = { ...item, attendance: status };
          updatedRecord = rec;
          return rec;
        }
        return item;
      });
      return { ...prev, [selectedStudentId]: updated };
    });

    if (updatedRecord && selectedStudentId && selectedStudentId !== 'no-student') {
      dataRepository.syncHifzRecord(selectedStudentId, updatedRecord).catch(err => {
        console.warn('[HifzContext] Failed to sync attendance:', err);
      });
    }
  };

  const updateTeacherComment = (recordId: string, comment: string, commentUrdu?: string, translatedComment?: string) => {
    let updatedRecord: DailyHifzRecord | undefined;
    setHifzRecordsMap(prev => {
      const list = prev[selectedStudentId] || [];
      const updated = list.map(item => {
        if (item.id === recordId) {
          const rec: DailyHifzRecord = {
            ...item,
            comments: comment,
            commentsUrdu: commentUrdu !== undefined ? commentUrdu : item.commentsUrdu,
            commentsEnglishTranslation: translatedComment !== undefined ? translatedComment : item.commentsEnglishTranslation,
            teacherSigned: true
          };
          updatedRecord = rec;
          return rec;
        }
        return item;
      });
      return { ...prev, [selectedStudentId]: updated };
    });

    if (updatedRecord && selectedStudentId && selectedStudentId !== 'no-student') {
      dataRepository.syncHifzRecord(selectedStudentId, updatedRecord).catch(err => {
        console.warn('[HifzContext] Failed to sync teacher comment:', err);
      });
    }
  };

  const signAsParent = (recordId: string) => {
    let updatedRecord: DailyHifzRecord | undefined;
    setHifzRecordsMap(prev => {
      const list = prev[selectedStudentId] || [];
      const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
      const updated = list.map(item => {
        if (item.id === recordId) {
          const rec: DailyHifzRecord = {
            ...item,
            parentSigned: true,
            parentSignDate: nowStr
          };
          updatedRecord = rec;
          return rec;
        }
        return item;
      });
      return { ...prev, [selectedStudentId]: updated };
    });

    if (updatedRecord && selectedStudentId && selectedStudentId !== 'no-student') {
      dataRepository.syncHifzRecord(selectedStudentId, updatedRecord).catch(err => {
        console.warn('[HifzContext] Failed to sync parent signature:', err);
      });
    }
  };

  const signAsTeacher = (recordId: string) => {
    let updatedRecord: DailyHifzRecord | undefined;
    setHifzRecordsMap(prev => {
      const list = prev[selectedStudentId] || [];
      const updated = list.map(item => {
        if (item.id === recordId) {
          const rec: DailyHifzRecord = { ...item, teacherSigned: true };
          updatedRecord = rec;
          return rec;
        }
        return item;
      });
      return { ...prev, [selectedStudentId]: updated };
    });

    if (updatedRecord && selectedStudentId && selectedStudentId !== 'no-student') {
      dataRepository.syncHifzRecord(selectedStudentId, updatedRecord).catch(err => {
        console.warn('[HifzContext] Failed to sync teacher signature:', err);
      });
    }
  };

  const updateHomeLearningMins = (
    day: string,
    field: 'sabaqMins' | 'sabaqParaMins' | 'dawr1Mins' | 'dawr2Mins',
    mins: number
  ) => {
    let updatedRecord: DailyHomeLearningRecord | undefined;
    setHomeLearningMap(prev => {
      const list = (prev[selectedStudentId] && prev[selectedStudentId].length > 0)
        ? prev[selectedStudentId]
        : createBlankWeeklyHomeLearning();
      const updated = list.map(item => {
        if (item.day === day) {
          const rec = { ...item, [field]: mins };
          updatedRecord = rec;
          return rec;
        }
        return item;
      });
      return { ...prev, [selectedStudentId]: updated };
    });

    if (updatedRecord && selectedStudentId && selectedStudentId !== 'no-student') {
      dataRepository.syncHomeLearning(selectedStudentId, updatedRecord).catch(err => {
        console.warn('[HifzContext] Failed to sync home learning mins:', err);
      });
    }
  };

  const signHomeLearningParent = (day: string) => {
    let updatedRecord: DailyHomeLearningRecord | undefined;
    setHomeLearningMap(prev => {
      const list = (prev[selectedStudentId] && prev[selectedStudentId].length > 0)
        ? prev[selectedStudentId]
        : createBlankWeeklyHomeLearning();
      const updated = list.map(item => {
        if (item.day === day) {
          const rec = { ...item, parentSigned: true };
          updatedRecord = rec;
          return rec;
        }
        return item;
      });
      return { ...prev, [selectedStudentId]: updated };
    });

    if (updatedRecord && selectedStudentId && selectedStudentId !== 'no-student') {
      dataRepository.syncHomeLearning(selectedStudentId, updatedRecord).catch(err => {
        console.warn('[HifzContext] Failed to sync home learning parent signature:', err);
      });
    }
  };

  const togglePrayerLocation = (day: string, prayer: 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'ishaa') => {
    let updatedRecord: DailyTarbiyahRecord | undefined;
    setTarbiyahMap(prev => {
      const list = (prev[selectedStudentId] && prev[selectedStudentId].length > 0)
        ? prev[selectedStudentId]
        : createBlankWeeklyTarbiyah();
      const updated = list.map(item => {
        if (item.day === day) {
          const current = item.prayers[prayer];
          let next: PrayerLocation = 'MSJ';
          if (current === 'MSJ') next = 'HM';
          else if (current === 'HM') next = 'none';
          else next = 'MSJ';

          const rec: DailyTarbiyahRecord = {
            ...item,
            prayers: {
              ...item.prayers,
              [prayer]: next
            }
          };
          updatedRecord = rec;
          return rec;
        }
        return item;
      });
      return { ...prev, [selectedStudentId]: updated };
    });

    if (updatedRecord && selectedStudentId && selectedStudentId !== 'no-student') {
      dataRepository.syncTarbiyah(selectedStudentId, updatedRecord).catch(err => {
        console.warn('[HifzContext] Failed to sync tarbiyah prayers:', err);
      });
    }
  };

  const updateTarbiyahBool = (
    day: string,
    field: 'dailySadaqah' | 'eesaalThawaab' | 'dailyDuasDhikr' | 'dailyQuranWird',
    val: boolean
  ) => {
    let updatedRecord: DailyTarbiyahRecord | undefined;
    setTarbiyahMap(prev => {
      const list = (prev[selectedStudentId] && prev[selectedStudentId].length > 0)
        ? prev[selectedStudentId]
        : createBlankWeeklyTarbiyah();
      const updated = list.map(item => {
        if (item.day === day) {
          const rec = { ...item, [field]: val };
          updatedRecord = rec;
          return rec;
        }
        return item;
      });
      return { ...prev, [selectedStudentId]: updated };
    });

    if (updatedRecord && selectedStudentId && selectedStudentId !== 'no-student') {
      dataRepository.syncTarbiyah(selectedStudentId, updatedRecord).catch(err => {
        console.warn('[HifzContext] Failed to sync tarbiyah activity:', err);
      });
    }
  };

  const updateTarbiyahMins = (
    day: string,
    field: 'collectiveTaleemMins' | 'collectiveDuaMins',
    mins: number
  ) => {
    let updatedRecord: DailyTarbiyahRecord | undefined;
    setTarbiyahMap(prev => {
      const list = (prev[selectedStudentId] && prev[selectedStudentId].length > 0)
        ? prev[selectedStudentId]
        : createBlankWeeklyTarbiyah();
      const updated = list.map(item => {
        if (item.day === day) {
          const rec = { ...item, [field]: mins };
          updatedRecord = rec;
          return rec;
        }
        return item;
      });
      return { ...prev, [selectedStudentId]: updated };
    });

    if (updatedRecord && selectedStudentId && selectedStudentId !== 'no-student') {
      dataRepository.syncTarbiyah(selectedStudentId, updatedRecord).catch(err => {
        console.warn('[HifzContext] Failed to sync tarbiyah mins:', err);
      });
    }
  };

  const addParentTask = (task: string, mistakesNotes: string) => {
    const newTask: ParentTaskRecord = {
      id: `pt-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      day: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
      task,
      mistakesNotes,
      parentSigned: userRole === 'parent'
    };
    setParentTasksMap(prev => {
      const currentList = prev[selectedStudentId] || [];
      return { ...prev, [selectedStudentId]: [newTask, ...currentList] };
    });
  };

  const toggleParentTaskSign = (taskId: string) => {
    setParentTasksMap(prev => {
      const currentList = prev[selectedStudentId] || [];
      const updated = currentList.map(t => t.id === taskId ? { ...t, parentSigned: !t.parentSigned } : t);
      return { ...prev, [selectedStudentId]: updated };
    });
  };

  const deleteParentTask = (taskId: string) => {
    setParentTasksMap(prev => {
      const currentList = prev[selectedStudentId] || [];
      return { ...prev, [selectedStudentId]: currentList.filter(t => t.id !== taskId) };
    });
  };

  const updateWeeklyEvaluation = (updates: Partial<WeeklyEvaluationRecord>) => {
    let updatedEvaluation: WeeklyEvaluationRecord | undefined;
    setEvaluationsMap(prev => {
      const ukDate = getUkCurrentDate();
      const current = prev[selectedStudentId] || {
        id: `we-${selectedStudentId}`,
        weekCommencing: ukDate.dateString,
        currentJuz: selectedStudent.currentJuz || 0,
        currentSurah: selectedStudent.currentSurah || '',
        islamicStudies: { passed: false, teacherComments: 'Not yet assessed' },
        duasMemorisation: { passed: false, currentDua: 'Not yet assessed' },
        surahMemorisation: { passed: false, parentComments: 'Not yet assessed' },
        teacherOverallFeedback: '',
        parentOverallFeedback: '',
        teacherSigned: false,
        parentSigned: false,
        automatedReportGenerated: false
      };
      const rec: WeeklyEvaluationRecord = {
        ...current,
        ...updates
      };
      updatedEvaluation = rec;
      return {
        ...prev,
        [selectedStudentId]: rec
      };
    });

    if (updatedEvaluation && selectedStudentId && selectedStudentId !== 'no-student') {
      dataRepository.syncEvaluation(selectedStudentId, updatedEvaluation).catch(err => {
        console.warn('[HifzContext] Failed to sync weekly evaluation:', err);
      });
    }
  };

  const signEvaluation = (asRole: 'teacher' | 'parent') => {
    let updatedRecord: WeeklyEvaluationRecord | undefined;
    setEvaluationsMap(prev => {
      const ukDate = getUkCurrentDate();
      const current = prev[selectedStudentId] || {
        id: `we-${selectedStudentId}`,
        weekCommencing: ukDate.dateString,
        currentJuz: selectedStudent.currentJuz || 0,
        currentSurah: selectedStudent.currentSurah || '',
        islamicStudies: { passed: false, teacherComments: 'Not yet assessed' },
        duasMemorisation: { passed: false, currentDua: 'Not yet assessed' },
        surahMemorisation: { passed: false, parentComments: 'Not yet assessed' },
        teacherOverallFeedback: '',
        parentOverallFeedback: '',
        teacherSigned: false,
        parentSigned: false,
        automatedReportGenerated: false
      };
      const rec = {
        ...current,
        ...(asRole === 'teacher' ? { teacherSigned: true } : { parentSigned: true })
      };
      updatedRecord = rec;
      return {
        ...prev,
        [selectedStudentId]: rec
      };
    });

    if (updatedRecord && selectedStudentId && selectedStudentId !== 'no-student') {
      dataRepository.syncEvaluation(selectedStudentId, updatedRecord).catch(err => {
        console.warn('[HifzContext] Failed to sync signed weekly evaluation:', err);
      });
    }
  };

  const findStudentByGmail = (email: string): Student | null => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) return null;
    const mappings = teacherSettings?.madrasahGoogleSetup?.studentMappings || DEFAULT_MADRASAH_GOOGLE_SETUP.studentMappings;
    const mapping = mappings.find(
      m => (m.studentGmail && m.studentGmail.toLowerCase() === cleanEmail) ||
           (m.parentGmail && m.parentGmail.toLowerCase() === cleanEmail)
    );
    if (mapping) {
      return students.find(s => s.id === mapping.studentId) || null;
    }
    return null;
  };

  const enterStudentParentPortal = (studentId: string, googleEmail?: string) => {
    let targetStudentId = studentId;
    if (googleEmail) {
      const normalizedEmail = googleEmail.toLowerCase().trim();
      const matched = findStudentByGmail(normalizedEmail);
      if (matched) {
        targetStudentId = matched.id;
      } else {
        // Verify against student's recorded parent or student email
        const targetStudent = students.find(s => s.id === studentId);
        const matchesParent = targetStudent?.parentEmail?.toLowerCase().trim() === normalizedEmail;
        const matchesStudent = targetStudent?.studentEmail?.toLowerCase().trim() === normalizedEmail;
        if (!matchesParent && !matchesStudent) {
          console.warn('[Security] Unauthorized student access attempt prevented for email:', normalizedEmail);
          return;
        }
      }
      setParentSettings(prev => ({ ...prev, linkedChildGoogleEmail: googleEmail }));
    }
    const studentObj = students.find(s => s.id === targetStudentId);
    setCurrentUser({
      role: 'parent',
      email: googleEmail || studentObj?.parentEmail,
      displayName: studentObj?.parentName || 'Parent',
      studentId: targetStudentId,
      allowedStudentIds: [targetStudentId]
    });
    setSelectedStudentId(targetStudentId);
    setUserRole('parent');
    setPortalMode('student-parent');
    setActiveTab('dashboard');
  };

  const enterStudentParentPortalByEmail = (emailOrCode: string) => {
    const query = emailOrCode.trim().toLowerCase();
    if (!query) {
      return { success: false, message: 'Please enter your Parent Email or Student Enrollment Key', matchedCount: 0 };
    }

    // Strict email / enrollment key data isolation
    const matched = students.filter(s =>
      (s.parentEmail && s.parentEmail.toLowerCase() === query) ||
      (s.studentEmail && s.studentEmail.toLowerCase() === query) ||
      (s.enrollmentCode && s.enrollmentCode.toLowerCase() === query)
    );

    if (matched.length === 0) {
      return {
        success: false,
        message: 'No student record found matching this email or enrollment key. Please verify with your Madrasah Administrator.',
        matchedCount: 0
      };
    }

    const allowedIds = matched.map(s => s.id);
    const primaryChild = matched[0];

    setCurrentUser({
      role: 'parent',
      email: query.includes('@') ? query : primaryChild.parentEmail,
      displayName: primaryChild.parentName,
      studentId: primaryChild.id,
      allowedStudentIds: allowedIds
    });

    setParentSettings(prev => ({
      ...prev,
      parentContactEmail: primaryChild.parentEmail,
      linkedChildGoogleEmail: primaryChild.studentEmail || primaryChild.parentEmail
    }));

    setSelectedStudentId(primaryChild.id);
    setUserRole('parent');
    setPortalMode('student-parent');
    setActiveTab('dashboard');

    return {
      success: true,
      message: `Assalamu Alaikum! Successfully logged into portal for ${primaryChild.name}${matched.length > 1 ? ` (+${matched.length - 1} enrolled sibling)` : ''}.`,
      matchedCount: matched.length,
      studentName: primaryChild.name
    };
  };

  const enterTeacherPortal = (passcode?: string): boolean => {
    const expectedPasscode = teacherSettings.teacherPasscode || '1234';
    if (passcode !== undefined && passcode.trim() !== expectedPasscode) {
      return false;
    }
    const defaultTeacher = adminSettings.teachers[0] || INITIAL_TEACHERS[0];
    const circleStudents = students.filter(s => s.circleCode === defaultTeacher.circleCode);
    setCurrentUser({
      role: 'teacher',
      email: defaultTeacher.email,
      displayName: defaultTeacher.name,
      teacherId: defaultTeacher.id,
      circleCode: defaultTeacher.circleCode,
      allowedStudentIds: circleStudents.map(s => s.id)
    });
    if (circleStudents.length > 0) {
      setSelectedStudentId(circleStudents[0].id);
    }
    setUserRole('teacher');
    setPortalMode('teacher');
    setActiveTab('dashboard');
    return true;
  };

  const enterTeacherPortalByCredentials = (emailOrPasscode: string, circleCode?: string) => {
    const cleanInput = emailOrPasscode.trim().toLowerCase();
    if (!cleanInput) {
      return {
        success: false,
        message: 'Please enter your Teacher Email or Passcode.'
      };
    }
    
    // Find matching teacher in admin teacher directory
    const matchedTeacher = adminSettings.teachers.find(t =>
      t.email.toLowerCase() === cleanInput ||
      t.passcode === cleanInput ||
      (circleCode && t.circleCode.toLowerCase() === circleCode.trim().toLowerCase() && (t.email.toLowerCase() === cleanInput || t.passcode === cleanInput))
    );

    if (!matchedTeacher) {
      return {
        success: false,
        message: 'No registered teacher account matches these credentials. Please verify with your Madrasah Administrator.'
      };
    }

    const activeCircleCode = circleCode?.trim() || matchedTeacher.circleCode;

    // Filter students enrolled with this teacher's specific circle code
    const circleStudents = students.filter(s =>
      s.circleCode.toLowerCase() === activeCircleCode.toLowerCase() ||
      s.teacherName.toLowerCase() === matchedTeacher.name.toLowerCase()
    );

    const teacherUser: LoggedInUser = {
      role: 'teacher',
      email: matchedTeacher.email,
      displayName: matchedTeacher.name,
      teacherId: matchedTeacher.id,
      circleCode: activeCircleCode,
      allowedStudentIds: circleStudents.map(s => s.id)
    };

    setCurrentUser(teacherUser);
    localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(teacherUser));

    if (circleStudents.length > 0) {
      setSelectedStudentId(circleStudents[0].id);
    }

    setUserRole('teacher');
    setPortalMode('teacher');
    setActiveTab('dashboard');

    return {
      success: true,
      message: `Welcome ${matchedTeacher.name}. Loaded ${circleStudents.length} student(s) in Circle: ${matchedTeacher.circleName}.`,
      teacherName: matchedTeacher.name
    };
  };

  const enterAdminPortal = (passcode: string): boolean => {
    const requiredPasscode = adminSettings.adminPasscode || '9999';
    if (passcode.trim() !== requiredPasscode) {
      return false;
    }
    setCurrentUser({
      role: 'admin',
      email: adminSettings.adminEmail,
      displayName: 'Madrasah Principal & Super-Admin',
      allowedStudentIds: students.map(s => s.id)
    });
    setUserRole('admin');
    setPortalMode('admin');
    setActiveTab('admin-control');
    return true;
  };

  const logoutToLanding = () => {
    // Shared Device Protection: Wipe all sensitive child data and tokens from browser storage
    const storageKeysToPurge = [
      STORAGE_KEY_STUDENTS,
      STORAGE_KEY_HIFZ,
      STORAGE_KEY_HOME,
      STORAGE_KEY_TARBIYAH,
      STORAGE_KEY_PARENT_TASKS,
      STORAGE_KEY_EVAL,
      STORAGE_KEY_CURRENT_USER,
      STORAGE_KEY_SELECTED_STUDENT,
      STORAGE_KEY_ACTIVE_ROLE,
      'madrasah_firebase_token',
      'madrasah_students',
      'madrasah_hifz_records',
      'madrasah_home_learning',
      'madrasah_tarbiyah',
      'madrasah_evaluations'
    ];
    for (const key of storageKeysToPurge) {
      try {
        localStorage.removeItem(key);
      } catch {}
    }

    // Wipe in-memory React state to prevent data leakage on shared devices
    setStudents([]);
    setHifzRecordsMap({});
    setHomeLearningMap({});
    setTarbiyahMap({});
    setParentTasksMap({});
    setEvaluationsMap({});
    setSelectedStudentId('');
    setCurrentUser({
      role: 'unassigned' as any,
      email: '',
      displayName: 'Guest',
      allowedStudentIds: []
    });
    setUserRole('unassigned' as any);
    setPortalMode('landing');
  };

  const signInWithFirebaseEmail = async (email: string, pass: string): Promise<{ success: boolean; message: string }> => {
    setFirebaseLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
      const user = cred.user;
      const userEmail = (user.email || email).toLowerCase();

      // Check Admin
      if (userEmail === adminSettings.adminEmail.toLowerCase() || userEmail.includes('admin')) {
        setCurrentUser({
          role: 'admin',
          email: userEmail,
          displayName: user.displayName || 'Madrasah Administrator',
          allowedStudentIds: students.map(s => s.id)
        });
        setUserRole('admin');
        setPortalMode('admin');
        setActiveTab('admin-control');
        return { success: true, message: 'Welcome to the Administrator Governance Portal.' };
      }

      // Check Teacher
      const matchedTeacher = adminSettings.teachers.find(t => t.email.toLowerCase() === userEmail);
      if (matchedTeacher) {
        const circleStudents = students.filter(s => s.circleCode === matchedTeacher.circleCode);
        setCurrentUser({
          role: 'teacher',
          email: userEmail,
          displayName: matchedTeacher.name || user.displayName || 'Ustadh',
          teacherId: matchedTeacher.id,
          circleCode: matchedTeacher.circleCode,
          allowedStudentIds: circleStudents.map(s => s.id)
        });
        if (circleStudents.length > 0) {
          setSelectedStudentId(circleStudents[0].id);
        }
        setUserRole('teacher');
        setPortalMode('teacher');
        setActiveTab('dashboard');
        return { success: true, message: `Assalamu Alaikum Ustadh ${matchedTeacher.name}! Circle: ${matchedTeacher.circleName}` };
      }

      // Check Parent / Student
      const matchedStudents = students.filter(s =>
        (s.parentEmail && s.parentEmail.toLowerCase() === userEmail) ||
        (s.studentEmail && s.studentEmail.toLowerCase() === userEmail)
      );

      if (matchedStudents.length > 0) {
        const primary = matchedStudents[0];
        const allowedIds = matchedStudents.map(s => s.id);
        setCurrentUser({
          role: 'parent',
          email: userEmail,
          displayName: primary.parentName || user.displayName || 'Parent',
          studentId: primary.id,
          allowedStudentIds: allowedIds
        });
        setSelectedStudentId(primary.id);
        setUserRole('parent');
        setPortalMode('student-parent');
        setActiveTab('dashboard');
        return {
          success: true,
          message: `Assalamu Alaikum! Verified access for ${primary.name}${matchedStudents.length > 1 ? ` (+${matchedStudents.length - 1} enrolled child)` : ''}.`
        };
      }

      // Unlinked account: authenticated with Firebase, but no student currently associated with this email
      setCurrentUser({
        role: 'parent',
        email: userEmail,
        displayName: user.displayName || 'Parent User',
        studentId: undefined,
        allowedStudentIds: []
      });
      setUserRole('parent');
      setPortalMode('student-parent');
      setActiveTab('dashboard');
      return {
        success: true,
        message: 'Logged in successfully. Note: This email is not yet linked to an active student enrollment. Please contact the administrator.'
      };
    } catch (err: any) {
      console.error('Firebase Email Login failed:', err);
      let msg = err.message || 'Firebase authentication failed';
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        msg = 'Invalid credentials. If this is your first time, click Sign Up or use Quick Demo Login.';
      } else if (err.code === 'auth/user-not-found') {
        msg = 'No user account found. Click Sign Up to create your account.';
      }
      return { success: false, message: msg };
    } finally {
      setFirebaseLoading(false);
    }
  };

  const signUpWithFirebaseEmail = async (email: string, pass: string, requestedRole: UserRole = 'parent') => {
    setFirebaseLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      const user = cred.user;
      const userEmail = (user.email || email).toLowerCase();

      if (requestedRole === 'admin') {
        setCurrentUser({
          role: 'admin',
          email: userEmail,
          displayName: 'Administrator',
          allowedStudentIds: students.map(s => s.id)
        });
        setUserRole('admin');
        setPortalMode('admin');
        setActiveTab('admin-control');
      } else if (requestedRole === 'teacher') {
        const defaultTeacher = adminSettings.teachers[0];
        const circleStudents = students.filter(s => s.circleCode === defaultTeacher.circleCode);
        setCurrentUser({
          role: 'teacher',
          email: userEmail,
          displayName: 'Ustadh',
          circleCode: defaultTeacher.circleCode,
          allowedStudentIds: circleStudents.map(s => s.id)
        });
        if (circleStudents.length > 0) setSelectedStudentId(circleStudents[0].id);
        setUserRole('teacher');
        setPortalMode('teacher');
        setActiveTab('dashboard');
      } else {
        const matchedStudents = students.filter(s =>
          (s.parentEmail && s.parentEmail.toLowerCase() === userEmail) ||
          (s.studentEmail && s.studentEmail.toLowerCase() === userEmail)
        );
        const child = matchedStudents[0];
        setCurrentUser({
          role: 'parent',
          email: userEmail,
          displayName: child?.parentName || 'Parent',
          studentId: child?.id,
          allowedStudentIds: matchedStudents.length > 0 ? matchedStudents.map(s => s.id) : []
        });
        if (child) setSelectedStudentId(child.id);
        setUserRole('parent');
        setPortalMode('student-parent');
        setActiveTab('dashboard');
      }
      return { success: true, message: 'Firebase user account registered successfully!' };
    } catch (err: any) {
      console.error('Firebase Sign-up failed:', err);
      let msg = err.message || 'Firebase sign-up failed';
      if (err.code === 'auth/email-already-in-use') {
        msg = 'This email already has an account. Please switch to Sign In.';
      } else if (err.code === 'auth/weak-password') {
        msg = 'Password should be at least 6 characters.';
      }
      return { success: false, message: msg };
    } finally {
      setFirebaseLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setFirebaseLoading(true);
    try {
      const cred = await signInWithPopup(auth, googleAuthProvider);
      const user = cred.user;
      const userEmail = (user.email || '').toLowerCase();

      if (userEmail === adminSettings.adminEmail.toLowerCase() || userEmail.includes('admin')) {
        setCurrentUser({ role: 'admin', email: userEmail, displayName: user.displayName || 'Administrator', allowedStudentIds: students.map(s => s.id) });
        setUserRole('admin');
        setPortalMode('admin');
        setActiveTab('admin-control');
        return { success: true, message: `Signed in as Administrator (${userEmail})` };
      }

      const matchedTeacher = adminSettings.teachers.find(t => t.email.toLowerCase() === userEmail);
      if (matchedTeacher) {
        const circleStudents = students.filter(s => s.circleCode === matchedTeacher.circleCode);
        setCurrentUser({
          role: 'teacher',
          email: userEmail,
          displayName: matchedTeacher.name || user.displayName || 'Ustadh',
          circleCode: matchedTeacher.circleCode,
          allowedStudentIds: circleStudents.map(s => s.id)
        });
        if (circleStudents.length > 0) setSelectedStudentId(circleStudents[0].id);
        setUserRole('teacher');
        setPortalMode('teacher');
        setActiveTab('dashboard');
        return { success: true, message: `Signed in with Google as Ustadh ${matchedTeacher.name}` };
      }

      const matchedStudents = students.filter(s =>
        (s.parentEmail && s.parentEmail.toLowerCase() === userEmail) ||
        (s.studentEmail && s.studentEmail.toLowerCase() === userEmail)
      );
      if (matchedStudents.length === 0) {
        return {
          success: false,
          message: 'This Google account is not linked to any registered student. Please contact your Madrasah Administrator.'
        };
      }
      const child = matchedStudents[0];
      setCurrentUser({
        role: 'parent',
        email: userEmail,
        displayName: user.displayName || child.parentName || 'Parent',
        studentId: child.id,
        allowedStudentIds: matchedStudents.map(s => s.id)
      });
      setSelectedStudentId(child.id);
      setUserRole('parent');
      setPortalMode('student-parent');
      setActiveTab('dashboard');
      return { success: true, message: `Signed in with Google for ${child.name}` };
    } catch (err: any) {
      console.error('Google Sign-in failed:', err);
      return { success: false, message: err.message || 'Google sign-in popup failed or was cancelled.' };
    } finally {
      setFirebaseLoading(false);
    }
  };

  const signOutFirebase = async () => {
    try {
      await signOut(auth);
    } catch {}
    logoutToLanding();
  };

  const syncNow = async () => {
    return await dataRepository.triggerManualSync();
  };

  // Student CRUD and invitation automation
  const addStudent = (data: {
    name: string;
    parentName: string;
    parentEmail: string;
    parentPhone: string;
    studentEmail?: string;
    teacherName: string;
    teacherEmail?: string;
    circleCode: string;
    classGroup: string;
    currentJuz: number;
    currentSurah: string;
    targetYearlyJuz: number;
  }) => {
    const newId = `std-${Date.now()}`;
    const initials = data.name.split(' ').map(p => p[0]).join('').toUpperCase().substring(0, 3) || 'STD';
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const enrollmentCode = `HIFZ-${initials}-${randomCode}`;
    
    // Monotonic sequence so deleted student numbers are never reused or collided
    const existingNumbers = students
      .map(s => {
        const match = s.rollNumber?.match(/(\d+)$/);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter(n => !isNaN(n));
    const nextSeq = (existingNumbers.length > 0 ? Math.max(...existingNumbers) : 0) + 1;
    const rollNumber = `HIFZ-${new Date().getFullYear()}-${String(nextSeq).padStart(3, '0')}`;

    const newStudent: Student = {
      id: newId,
      name: data.name.trim(),
      rollNumber,
      currentJuz: data.currentJuz || 1,
      currentSurah: data.currentSurah || 'Surah Al-Baqarah',
      totalJuzMemorised: Math.max(0, (data.currentJuz || 1) - 1),
      targetYearlyJuz: data.targetYearlyJuz || 6,
      hifzStartDate: new Date().toISOString().split('T')[0],
      parentName: data.parentName.trim(),
      parentEmail: data.parentEmail.trim().toLowerCase(),
      parentPhone: data.parentPhone.trim(),
      studentEmail: data.studentEmail?.trim().toLowerCase() || undefined,
      teacherName: data.teacherName,
      teacherEmail: data.teacherEmail || undefined,
      circleCode: data.circleCode,
      classGroup: data.classGroup,
      enrollmentCode,
      status: 'pending-invite'
    };

    const inviteLetter = `Assalamu Alaikum wa Rahmatullah wa Barakatuh ${data.parentName},\n\nWe are pleased to welcome ${data.name} to ${adminSettings.academyName}.\n\nOfficial Student Portal Credentials:\n- Student Name: ${data.name}\n- Roll Number: ${rollNumber}\n- Assigned Circle: ${data.classGroup}\n- Ustadh: ${data.teacherName}\n- Circle Code: ${data.circleCode}\n- Secure Enrollment Key: ${enrollmentCode}\n- Linked Parent Email: ${data.parentEmail}\n${data.studentEmail ? `- Linked Student Email: ${data.studentEmail}\n` : ''}\nSign in to the Student/Parent Portal using your registered Parent Email (${data.parentEmail}) or your Enrollment Key (${enrollmentCode}).\n\nJazakumullahu Khayran,\nMadrasah Administration`;

    // Item 6: Brand-new students start with a clean slate: ZERO records, no auto-passed lessons, no auto-A+
    setHifzRecordsMap(prev => ({ ...prev, [newId]: [] }));
    setHomeLearningMap(prev => ({ ...prev, [newId]: [] }));
    setTarbiyahMap(prev => ({ ...prev, [newId]: [] }));
    setParentTasksMap(prev => ({ ...prev, [newId]: [] }));

    setStudents(prev => [newStudent, ...prev]);

    // Send in-app notification
    addNotification({
      title: `Student Enrolled: ${newStudent.name}`,
      message: `Enrolled under ${newStudent.teacherName} (${newStudent.circleCode}). Parent email: ${newStudent.parentEmail}. Code: ${enrollmentCode}`,
      type: 'system',
      targetRole: 'all',
      studentId: newId
    });

    return { student: newStudent, enrollmentCode, inviteLetter };
  };

  const deleteStudent = (studentId: string) => {
    setStudents(prev => {
      const updated = prev.filter(s => s.id !== studentId);
      if (selectedStudentId === studentId && updated.length > 0) {
        setSelectedStudentId(updated[0].id);
      }
      return updated;
    });
  };

  const clearSampleStudents = () => {
    setStudents(prev => {
      const nonSample = prev.filter(s => !['std-1', 'std-2', 'std-3'].includes(s.id));
      if (nonSample.length > 0) {
        setSelectedStudentId(nonSample[0].id);
      } else {
        setSelectedStudentId('');
      }
      return nonSample;
    });
  };

  const resetToSampleStudents = () => {
    setStudents(INITIAL_STUDENTS);
    setSelectedStudentId(INITIAL_STUDENTS[0].id);
  };

  const startTodayRecord = (targetStudentId?: string): DailyHifzRecord => {
    const sId = targetStudentId || selectedStudentId;
    const ukDate = getUkCurrentDate();
    const existing = (hifzRecordsMap[sId] || []).find(r => r.date === ukDate.dateString || r.day === ukDate.dayOfWeek);
    if (existing) {
      return existing;
    }
    const newRecord = createBlankDailyHifzRecord(sId, ukDate.dayOfWeek, ukDate.dateString);
    setHifzRecordsMap(prev => {
      const list = prev[sId] || [];
      return {
        ...prev,
        [sId]: [newRecord, ...list]
      };
    });
    return newRecord;
  };

  const simulateEmailSent = (studentId: string) => {
    setStudents(prev =>
      prev.map(s => {
        if (s.id === studentId) {
          return {
            ...s,
            status: 'active' as const,
            invitationSentDate: new Date().toISOString().split('T')[0]
          };
        }
        return s;
      })
    );
    addNotification({
      title: 'Portal Invitation Prepared',
      message: `Invitation letter and enrollment key ready to copy or share with parent.`,
      type: 'system',
      targetRole: 'all',
      studentId
    });
  };

  // Admin Master Settings & Permission Dictation
  const updateAdminSettings = (updates: Partial<AdminSettings>) => {
    setAdminSettings(prev => {
      const next = { ...prev, ...updates };
      if (updates.adminEmail && currentUser.role === 'admin') {
        setCurrentUser(c => ({ ...c, email: updates.adminEmail! }));
      }
      return next;
    });
    if (updates.academyName || updates.adminPasscode) {
      addNotification({
        title: 'Academy Settings Updated',
        message: updates.academyName && updates.adminPasscode
          ? `Institute name updated to "${updates.academyName}" and Admin Passcode changed.`
          : updates.academyName
          ? `Institute name updated to "${updates.academyName}".`
          : 'Master Admin Passcode changed successfully.',
        type: 'system',
        targetRole: 'admin'
      });
    }
  };

  const updateAdminPermissions = (permissions: Partial<AdminPortalPermissions>) => {
    setAdminSettings(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        ...permissions,
        studentParent: {
          ...prev.permissions.studentParent,
          ...(permissions.studentParent || {})
        },
        teacher: {
          ...prev.permissions.teacher,
          ...(permissions.teacher || {})
        }
      }
    }));
  };

  const addTeacherAccount = (teacherData: Omit<TeacherAccount, 'id'>): TeacherAccount => {
    const newTeacher: TeacherAccount = {
      ...teacherData,
      id: `tch-${Date.now()}`
    };
    setAdminSettings(prev => ({
      ...prev,
      teachers: [...prev.teachers, newTeacher]
    }));
    return newTeacher;
  };

  const updateTeacherAccount = (id: string, updates: Partial<TeacherAccount>) => {
    setAdminSettings(prev => ({
      ...prev,
      teachers: prev.teachers.map(t => (t.id === id ? { ...t, ...updates } : t))
    }));
  };

  const deleteTeacherAccount = (id: string) => {
    setAdminSettings(prev => ({
      ...prev,
      teachers: prev.teachers.filter(t => t.id !== id)
    }));
  };

  const updateTeacherSettings = (updates: Partial<TeacherSettings>) => {
    setTeacherSettings(prev => ({ ...prev, ...updates }));
  };

  const saveMadrasahGoogleSetup = (setup: MadrasahGoogleSetup) => {
    setTeacherSettings(prev => ({
      ...prev,
      madrasahGoogleSetup: setup
    }));
  };

  const updateStudentGmailMapping = (studentId: string, studentGmail: string, parentGmail: string) => {
    setTeacherSettings(prev => {
      const currentSetup = prev.madrasahGoogleSetup || DEFAULT_MADRASAH_GOOGLE_SETUP;
      const currentMappings = currentSetup.studentMappings || DEFAULT_MADRASAH_GOOGLE_SETUP.studentMappings;
      const updatedMappings = currentMappings.map(m => {
        if (m.studentId === studentId) {
          return { ...m, studentGmail, parentGmail, status: 'linked' as const };
        }
        return m;
      });
      return {
        ...prev,
        madrasahGoogleSetup: {
          ...currentSetup,
          studentMappings: updatedMappings
        }
      };
    });
  };

  const updateParentSettings = (updates: Partial<ParentSettings>) => {
    setParentSettings(prev => ({ ...prev, ...updates }));
  };

  const triggerManualSync = () => {
    setSyncStatus(prev => ({ ...prev, status: 'syncing' }));
    setTimeout(() => {
      setSyncStatus(prev => ({
        ...prev,
        status: 'synced',
        lastSyncTime: 'Just now (' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ')',
        pendingChangesCount: 0
      }));
    }, 750);
  };

  const triggerNativePush = (title: string, body: string) => {
    if (
      typeof window !== 'undefined' &&
      'Notification' in window &&
      Notification.permission === 'granted' &&
      pushSettings.pushEnabled
    ) {
      try {
        new Notification(title, {
          body,
          icon: '/favicon.ico'
        });
      } catch (e) {
        console.warn('Native notification suppressed or blocked:', e);
      }
    }
  };

  const addNotification = (notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: AppNotification = {
      ...notif,
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
    triggerNativePush(newNotif.title, newNotif.message);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const unreadNotificationsCount = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  const sendParentUpdateRequest = (
    subject: string,
    message: string,
    category: 'general' | 'revision' | 'exam' | 'custom' = 'general',
    urgency: 'routine' | 'urgent' = 'routine'
  ) => {
    const newReq: ParentUpdateRequest = {
      id: `req-${Date.now()}`,
      studentId: selectedStudent.id,
      studentName: selectedStudent.name,
      parentName: selectedStudent.parentName,
      parentEmail: parentSettings.parentContactEmail || 'parent@gmail.com',
      date: new Date().toISOString().split('T')[0],
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      templateCategory: category,
      subject,
      message,
      urgency,
      status: 'pending'
    };
    setParentUpdateRequests(prev => [newReq, ...prev]);

    // Send in-app and push notification for Ustadh
    addNotification({
      title: `Parent Inquiry: ${selectedStudent.name}`,
      message: `${selectedStudent.parentName} sent a polite inquiry: "${subject}"`,
      type: 'parent_inquiry',
      targetRole: 'teacher',
      studentId: selectedStudent.id,
      linkTab: 'dashboard'
    });
  };

  const acknowledgeParentUpdateRequest = (requestId: string, teacherReply?: string) => {
    setParentUpdateRequests(prev =>
      prev.map(r => {
        if (r.id === requestId) {
          return {
            ...r,
            status: 'addressed' as const,
            teacherReply: teacherReply || 'Ustadh reviewed and noted your message. Jazakallahu Khair.',
            repliedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
          };
        }
        return r;
      })
    );

    addNotification({
      title: `Ustadh Replied to Inquiry: ${selectedStudent.name}`,
      message: teacherReply ? `Ustadh: "${teacherReply}"` : `Ustadh reviewed your inquiry regarding ${selectedStudent.name}.`,
      type: 'parent_inquiry',
      targetRole: 'parent',
      studentId: selectedStudent.id,
      linkTab: 'dashboard'
    });
  };

  const updatePushSettings = (updates: Partial<PushNotificationSettings>) => {
    setPushSettings(prev => ({ ...prev, ...updates }));
  };

  const requestPushPermission = async (): Promise<string> => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      updatePushSettings({ permissionStatus: 'unsupported' });
      return 'unsupported';
    }
    try {
      const perm = await Notification.requestPermission();
      updatePushSettings({
        permissionStatus: perm as 'default' | 'granted' | 'denied',
        pushEnabled: perm === 'granted'
      });
      return perm;
    } catch (err) {
      console.warn('Error requesting push permission:', err);
      return 'denied';
    }
  };

  const sendTestPushNotification = () => {
    addNotification({
      title: '🔔 Madrasah Push Notification Test',
      message: 'Assalamu Alaikum! Push notification delivery is active for recitation grades, attendance alerts, and teacher updates.',
      type: 'system',
      targetRole: 'all',
      studentId: selectedStudent.id
    });
  };

  const updateEndOfTermSetup = (updates: Partial<EndOfTermSetup>) => {
    setEndOfTermSetup(prev => ({ ...prev, ...updates }));
  };

  const exportEndOfTermData = (format: 'csv' | 'json') => {
    const aggregates = compileAllStudentsTermData(students, hifzRecordsMap, homeLearningMap, tarbiyahMap);
    const safeTermTitle = endOfTermSetup.termTitle.replace(/[^a-zA-Z0-9_-]/g, '_');
    
    if (format === 'csv') {
      const csvContent = generateEndOfTermCSV(endOfTermSetup, aggregates);
      downloadBlobFile(`Madrasah_EndOfTerm_${safeTermTitle}.csv`, csvContent, 'text/csv');
    } else {
      const jsonContent = generateEndOfTermJSON(endOfTermSetup, aggregates, evaluationsMap);
      downloadBlobFile(`Madrasah_EndOfTerm_${safeTermTitle}.json`, jsonContent, 'application/json');
    }
  };

  const resetData = () => {
    localStorage.removeItem(STORAGE_KEY_HIFZ);
    localStorage.removeItem(STORAGE_KEY_HOME);
    localStorage.removeItem(STORAGE_KEY_TARBIYAH);
    localStorage.removeItem(STORAGE_KEY_PARENT_TASKS);
    localStorage.removeItem(STORAGE_KEY_EVAL);
    localStorage.removeItem(STORAGE_KEY_TEACHER_SETTINGS);
    localStorage.removeItem(STORAGE_KEY_PARENT_SETTINGS);
    localStorage.removeItem(STORAGE_KEY_NOTIFICATIONS);
    localStorage.removeItem(STORAGE_KEY_PARENT_REQUESTS);
    localStorage.removeItem(STORAGE_KEY_PUSH_SETTINGS);
    localStorage.removeItem(STORAGE_KEY_END_OF_TERM);
    setHifzRecordsMap(INITIAL_HIFZ_RECORDS);
    setHomeLearningMap(INITIAL_HOME_LEARNING);
    setTarbiyahMap(INITIAL_TARBIYAH_RECORDS);
    setParentTasksMap(INITIAL_PARENT_TASKS);
    setEvaluationsMap(INITIAL_WEEKLY_EVALUATIONS);
    setTeacherSettings(DEFAULT_TEACHER_SETTINGS);
    setParentSettings(DEFAULT_PARENT_SETTINGS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setParentUpdateRequests(INITIAL_PARENT_REQUESTS);
    setPushSettings(DEFAULT_PUSH_SETTINGS);
    setEndOfTermSetup(DEFAULT_END_OF_TERM_SETUP);
  };

  return (
    <HifzContext.Provider
      value={{
        students,
        visibleStudents,
        selectedStudent,
        setSelectedStudentId,
        userRole,
        setUserRole,
        currentUser,
        activeTab,
        setActiveTab,
        devicePreview,
        setDevicePreview,
        currentHifzRecords,
        startTodayRecord,
        currentHomeLearning,
        currentTarbiyah,
        currentParentTasks,
        currentEvaluation,
        weeklySummary,
        updateHifzLesson,
        updateAttendance,
        updateTeacherComment,
        signAsParent,
        signAsTeacher,
        updateHomeLearningMins,
        signHomeLearningParent,
        togglePrayerLocation,
        updateTarbiyahBool,
        updateTarbiyahMins,
        addParentTask,
        toggleParentTaskSign,
        deleteParentTask,
        updateWeeklyEvaluation,
        signEvaluation,
        portalMode,
        setPortalMode,
        enterStudentParentPortal,
        enterStudentParentPortalByEmail,
        enterTeacherPortal,
        enterTeacherPortalByCredentials,
        enterAdminPortal,
        logoutToLanding,
        addStudent,
        deleteStudent,
        clearSampleStudents,
        resetToSampleStudents,
        simulateEmailSent,
        adminSettings,
        updateAdminSettings,
        updateAdminPermissions,
        addTeacherAccount,
        updateTeacherAccount,
        deleteTeacherAccount,
        appLanguage,
        setAppLanguage,
        updateTrophies,
        updateVernacularLocale,
        teacherSettings,
        updateTeacherSettings,
        saveMadrasahGoogleSetup,
        updateStudentGmailMapping,
        findStudentByGmail,
        parentSettings,
        updateParentSettings,
        syncStatus,
        triggerManualSync,
        notifications,
        unreadNotificationsCount,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        clearNotifications,
        addNotification,
        parentUpdateRequests,
        sendParentUpdateRequest,
        acknowledgeParentUpdateRequest,
        pushSettings,
        updatePushSettings,
        requestPushPermission,
        sendTestPushNotification,
        endOfTermSetup,
        updateEndOfTermSetup,
        exportEndOfTermData,
        isSecurityModalOpen,
        setIsSecurityModalOpen,
        firebaseUser,
        firebaseLoading,
        signInWithFirebaseEmail,
        signUpWithFirebaseEmail,
        signInWithGoogle,
        signOutFirebase,
        offlineQueueCount,
        isDeviceOnline,
        isSyncingCloud,
        syncNow,
        resetData
      }}
    >
      {children}
    </HifzContext.Provider>
  );
};

export const useHifz = () => {
  const context = useContext(HifzContext);
  if (!context) {
    throw new Error('useHifz must be used within a HifzProvider');
  }
  return context;
};
