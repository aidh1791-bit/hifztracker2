import { Student, DailyHifzRecord, DailyHomeLearningRecord, DailyTarbiyahRecord, ParentTaskRecord, WeeklyEvaluationRecord, TeacherAccount, AdminSettings } from '../types';
import { DEFAULT_ISLAMIC_TROPHIES } from '../utils/meritTrophies';

export const INITIAL_TEACHERS: TeacherAccount[] = [
  {
    id: 'tch-1',
    name: 'Ustadh Qari Bilal',
    email: 'bilal.ustadh@madrasah.internal',
    circleName: 'Boys Hifz Circle (Advanced & Intermediate)',
    circleCode: 'CIRCLE-HIFZ-1',
    passcode: '1234',
    phone: '+44 7700 900333',
    status: 'active'
  },
  {
    id: 'tch-2',
    name: 'Ustadh Haroon',
    email: 'haroon.ustadh@madrasah.internal',
    circleName: 'Boys Hifz Circle (Junior & Foundation)',
    circleCode: 'CIRCLE-HIFZ-2',
    passcode: '5678',
    phone: '+44 7700 900444',
    status: 'active'
  }
];

export const DEFAULT_ADMIN_SETTINGS: AdminSettings = {
  adminEmail: 'admin@madrasah.org',
  adminPasscode: '9999',
  academyName: 'Hifz al-Quran Academy',
  academicYear: '2026-2027 Academic Year',
  vernacularLocale: 'UK',
  trophies: DEFAULT_ISLAMIC_TROPHIES,
  appLanguage: 'en',
  permissions: {
    studentParent: {
      canViewSabaqScores: true,
      canViewTeacherComments: true,
      canViewAttendance: true,
      canViewTarbiyahHome: true,
      canViewWeeklyEvaluation: true,
      canSignEvaluation: true,
      canSubmitInquiries: true,
      showOverallClassComparison: false,
      showTeacherNotes: true,
      showMistakeBreakdown: true,
      showTarbiyahTab: true,
      showAttendanceTab: true,
      showWeeklyGrades: true,
      allowParentInquiries: true,
      allowParentHomeTasks: true,
      showEndOfTermLedger: true
    },
    teacher: {
      canEditAttendance: true,
      canGradeDailyHifz: true,
      canEditWeeklyEvaluation: true,
      canDeleteStudents: false,
      canExportTermArchive: true,
      canViewParentContactInfo: true,
      canManageClassRoster: true,
      allowEditGradingScale: true,
      allowExportSchoolLedger: true,
      allowDeleteStudents: false,
      allowAddStudents: true,
      allowEditAcademicCalendar: false
    }
  },
  teachers: INITIAL_TEACHERS
};

export const INITIAL_STUDENTS: Student[] = [
  {
    id: 'std-1',
    name: 'Abdullah Khan',
    rollNumber: 'HIFZ-2024-042',
    currentJuz: 14,
    currentSurah: 'Surah Maryam (v.1-40)',
    totalJuzMemorised: 13,
    targetYearlyJuz: 6,
    hifzStartDate: '2023-09-01',
    parentName: 'Tariq Khan',
    parentEmail: 'tariq.khan@gmail.com',
    parentPhone: '+44 7700 900123',
    studentEmail: 'abdullah.khan@gmail.com',
    teacherName: 'Ustadh Qari Bilal',
    teacherEmail: 'bilal.ustadh@madrasah.internal',
    circleCode: 'CIRCLE-HIFZ-1',
    classGroup: 'Boys Hifz Circle (Intermediate)',
    enrollmentCode: 'HIFZ-AK-4291',
    status: 'active',
    invitationSentDate: '2026-09-01'
  },
  {
    id: 'std-2',
    name: 'Muhammad Patel',
    rollNumber: 'HIFZ-2024-019',
    currentJuz: 28,
    currentSurah: 'Surah Al-Hashr',
    totalJuzMemorised: 27,
    targetYearlyJuz: 8,
    hifzStartDate: '2022-10-15',
    parentName: 'Ibrahim Patel',
    parentEmail: 'patel.family@gmail.com',
    parentPhone: '+44 7700 900543',
    studentEmail: 'muhammad.patel@gmail.com',
    teacherName: 'Ustadh Qari Bilal',
    teacherEmail: 'bilal.ustadh@madrasah.internal',
    circleCode: 'CIRCLE-HIFZ-1',
    classGroup: 'Boys Hifz Circle (Advanced)',
    enrollmentCode: 'HIFZ-MP-8102',
    status: 'active',
    invitationSentDate: '2026-09-01'
  },
  {
    id: 'std-3',
    name: 'Zayd Ahmed',
    rollNumber: 'HIFZ-2024-088',
    currentJuz: 4,
    currentSurah: 'Surah Ali Imran (v.92-120)',
    totalJuzMemorised: 3,
    targetYearlyJuz: 5,
    hifzStartDate: '2024-01-10',
    parentName: 'Zubair Ahmed',
    parentEmail: 'ahmed.home@gmail.com',
    parentPhone: '+44 7700 900889',
    studentEmail: 'zayd.ahmed@gmail.com',
    teacherName: 'Ustadh Haroon',
    teacherEmail: 'haroon.ustadh@madrasah.internal',
    circleCode: 'CIRCLE-HIFZ-2',
    classGroup: 'Boys Hifz Circle (Junior)',
    enrollmentCode: 'HIFZ-ZA-5519',
    status: 'active',
    invitationSentDate: '2026-09-01'
  }
];

export const INITIAL_HIFZ_RECORDS: Record<string, DailyHifzRecord[]> = {
  'std-1': [
    {
      id: 'hifz-mon',
      day: 'Monday',
      date: '2026-09-14',
      attendance: 'present',
      sabaq: {
        amount: 'Surah Maryam v.1-15 (1 Page)',
        mistakes: 1,
        taskPassed: true,
        notes: 'Good fluency, watch elongation on Madd Munfasil'
      },
      sabaqPara: {
        amount: 'Juz 13 (Pages 1 - 4)',
        mistakes: 2,
        taskPassed: true,
        notes: 'Solid revision'
      },
      dawr1: {
        amount: 'Juz 5 (Full Juz)',
        mistakes: 1,
        taskPassed: true,
        notes: 'Excellent memory'
      },
      dawr2: {
        amount: 'Juz 6 (1/2 Juz)',
        mistakes: 4,
        taskPassed: false,
        notes: 'Repeated stops on Ayat 70-85, repeat tomorrow'
      },
      comments: 'Very strong start to the week MashaAllah. Focus on Juz 6 Mutashabihat.',
      parentSigned: true,
      parentSignDate: '2026-09-14 20:30',
      teacherSigned: true,
      timestamp: '2026-09-14T11:45:00Z'
    },
    {
      id: 'hifz-tue',
      day: 'Tuesday',
      date: '2026-09-15',
      attendance: 'present',
      sabaq: {
        amount: 'Surah Maryam v.16-33 (1 Page)',
        mistakes: 0,
        taskPassed: true,
        notes: 'Flawless recitation, excellent Tajweed'
      },
      sabaqPara: {
        amount: 'Juz 13 (Pages 5 - 8)',
        mistakes: 1,
        taskPassed: true,
        notes: 'Clear pronunciation'
      },
      dawr1: {
        amount: 'Juz 6 (Repeat 1/2 Juz)',
        mistakes: 2,
        taskPassed: true,
        notes: 'Much improved from yesterday'
      },
      dawr2: {
        amount: 'Juz 7 (1/2 Juz)',
        mistakes: 1,
        taskPassed: true,
        notes: 'Good pace and melody'
      },
      comments: 'Outstanding Sabaq recitation today! Keep up this level of preparation at home.',
      parentSigned: true,
      parentSignDate: '2026-09-15 21:05',
      teacherSigned: true,
      timestamp: '2026-09-15T11:50:00Z'
    },
    {
      id: 'hifz-wed',
      day: 'Wednesday',
      date: '2026-09-16',
      attendance: 'present',
      sabaq: {
        amount: 'Surah Maryam v.34-50 (1 Page)',
        mistakes: 2,
        taskPassed: true,
        notes: 'Small hesitation on verse 41'
      },
      sabaqPara: {
        amount: 'Juz 13 (Pages 9 - 12)',
        mistakes: 2,
        taskPassed: true,
        notes: 'Passed'
      },
      dawr1: {
        amount: 'Juz 7 (2nd Half)',
        mistakes: 1,
        taskPassed: true,
        notes: 'Strong'
      },
      dawr2: {
        amount: 'Juz 8 (1st Half)',
        mistakes: 2,
        taskPassed: true,
        notes: 'Good'
      },
      comments: 'Listened with good concentration during peer testing.',
      parentSigned: false,
      teacherSigned: true,
      timestamp: '2026-09-16T11:40:00Z'
    },
    {
      id: 'hifz-thu',
      day: 'Thursday',
      date: '2026-09-17',
      attendance: 'present',
      sabaq: {
        amount: 'Surah Maryam v.51-65 (1 Page)',
        mistakes: 0,
        taskPassed: null,
        notes: 'Prepared for testing'
      },
      sabaqPara: {
        amount: 'Juz 13 (Pages 13 - 16)',
        mistakes: 0,
        taskPassed: null,
        notes: ''
      },
      dawr1: {
        amount: 'Juz 8 (2nd Half)',
        mistakes: 0,
        taskPassed: null,
        notes: ''
      },
      dawr2: {
        amount: 'Juz 9 (1st Half)',
        mistakes: 0,
        taskPassed: null,
        notes: ''
      },
      comments: 'Today scheduled for review test.',
      parentSigned: false,
      teacherSigned: false,
      timestamp: '2026-09-17T09:00:00Z'
    },
    {
      id: 'hifz-fri',
      day: 'Friday',
      date: '2026-09-18',
      attendance: 'present',
      sabaq: {
        amount: 'Surah Maryam v.66-80 (1 Page)',
        mistakes: 0,
        taskPassed: null,
        notes: ''
      },
      sabaqPara: {
        amount: 'Juz 13 (Pages 17 - 20)',
        mistakes: 0,
        taskPassed: null,
        notes: ''
      },
      dawr1: {
        amount: 'Juz 9 (2nd Half)',
        mistakes: 0,
        taskPassed: null,
        notes: ''
      },
      dawr2: {
        amount: 'Juz 10 (1st Half)',
        mistakes: 0,
        taskPassed: null,
        notes: ''
      },
      comments: 'Friday Surah Al-Kahf recitation scheduled with class.',
      parentSigned: false,
      teacherSigned: false,
      timestamp: '2026-09-18T09:00:00Z'
    },
    {
      id: 'hifz-sat',
      day: 'Saturday',
      date: '2026-09-19',
      attendance: 'present',
      sabaq: {
        amount: 'Weekly Sabaq Consolidation & Review',
        mistakes: 0,
        taskPassed: null,
        notes: ''
      },
      sabaqPara: {
        amount: 'Juz 13 (Complete Para Test)',
        mistakes: 0,
        taskPassed: null,
        notes: ''
      },
      dawr1: {
        amount: 'Juz 10 (2nd Half)',
        mistakes: 0,
        taskPassed: null,
        notes: ''
      },
      dawr2: {
        amount: 'Weekly Manzil Exam',
        mistakes: 0,
        taskPassed: null,
        notes: ''
      },
      comments: 'Weekly parent-teacher sign off day.',
      parentSigned: false,
      teacherSigned: false,
      timestamp: '2026-09-19T09:00:00Z'
    }
  ]
};

export const INITIAL_HOME_LEARNING: Record<string, DailyHomeLearningRecord[]> = {
  'std-1': [
    { day: 'Monday', date: '2026-09-14', sabaqMins: 45, sabaqParaMins: 30, dawr1Mins: 25, dawr2Mins: 20, parentSigned: true, notes: 'Completed after Maghrib prayer' },
    { day: 'Tuesday', date: '2026-09-15', sabaqMins: 50, sabaqParaMins: 35, dawr1Mins: 30, dawr2Mins: 15, parentSigned: true, notes: 'Recited Sabaq to mother twice' },
    { day: 'Wednesday', date: '2026-09-16', sabaqMins: 40, sabaqParaMins: 30, dawr1Mins: 20, dawr2Mins: 20, parentSigned: false, notes: 'Practiced before Fajr' },
    { day: 'Thursday', date: '2026-09-17', sabaqMins: 45, sabaqParaMins: 25, dawr1Mins: 20, dawr2Mins: 20, parentSigned: false },
    { day: 'Friday', date: '2026-09-18', sabaqMins: 60, sabaqParaMins: 30, dawr1Mins: 30, dawr2Mins: 30, parentSigned: false },
    { day: 'Saturday', date: '2026-09-19', sabaqMins: 45, sabaqParaMins: 45, dawr1Mins: 30, dawr2Mins: 30, parentSigned: false },
    { day: 'Sunday', date: '2026-09-20', sabaqMins: 60, sabaqParaMins: 40, dawr1Mins: 35, dawr2Mins: 35, parentSigned: false }
  ]
};

export const INITIAL_TARBIYAH_RECORDS: Record<string, DailyTarbiyahRecord[]> = {
  'std-1': [
    {
      day: 'Monday',
      date: '2026-09-14',
      prayers: { fajr: 'MSJ', dhuhr: 'MSJ', asr: 'MSJ', maghrib: 'HM', ishaa: 'MSJ' },
      collectiveTaleemMins: 15,
      collectiveDuaMins: 10,
      dailySadaqah: true,
      eesaalThawaab: true,
      dailyDuasDhikr: true,
      dailyQuranWird: true
    },
    {
      day: 'Tuesday',
      date: '2026-09-15',
      prayers: { fajr: 'MSJ', dhuhr: 'HM', asr: 'MSJ', maghrib: 'MSJ', ishaa: 'MSJ' },
      collectiveTaleemMins: 20,
      collectiveDuaMins: 15,
      dailySadaqah: true,
      eesaalThawaab: true,
      dailyDuasDhikr: true,
      dailyQuranWird: true
    },
    {
      day: 'Wednesday',
      date: '2026-09-16',
      prayers: { fajr: 'MSJ', dhuhr: 'HM', asr: 'MSJ', maghrib: 'HM', ishaa: 'MSJ' },
      collectiveTaleemMins: 15,
      collectiveDuaMins: 10,
      dailySadaqah: true,
      eesaalThawaab: false,
      dailyDuasDhikr: true,
      dailyQuranWird: true
    },
    {
      day: 'Thursday',
      date: '2026-09-17',
      prayers: { fajr: 'MSJ', dhuhr: 'HM', asr: 'HM', maghrib: 'MSJ', ishaa: 'MSJ' },
      collectiveTaleemMins: 10,
      collectiveDuaMins: 10,
      dailySadaqah: false,
      eesaalThawaab: true,
      dailyDuasDhikr: true,
      dailyQuranWird: true
    },
    {
      day: 'Friday',
      date: '2026-09-18',
      prayers: { fajr: 'MSJ', dhuhr: 'MSJ', asr: 'MSJ', maghrib: 'MSJ', ishaa: 'MSJ' },
      collectiveTaleemMins: 25,
      collectiveDuaMins: 15,
      dailySadaqah: true,
      eesaalThawaab: true,
      dailyDuasDhikr: true,
      dailyQuranWird: true
    },
    {
      day: 'Saturday',
      date: '2026-09-19',
      prayers: { fajr: 'MSJ', dhuhr: 'HM', asr: 'MSJ', maghrib: 'MSJ', ishaa: 'MSJ' },
      collectiveTaleemMins: 20,
      collectiveDuaMins: 10,
      dailySadaqah: true,
      eesaalThawaab: true,
      dailyDuasDhikr: true,
      dailyQuranWird: true
    },
    {
      day: 'Sunday',
      date: '2026-09-20',
      prayers: { fajr: 'MSJ', dhuhr: 'HM', asr: 'HM', maghrib: 'MSJ', ishaa: 'MSJ' },
      collectiveTaleemMins: 15,
      collectiveDuaMins: 10,
      dailySadaqah: false,
      eesaalThawaab: true,
      dailyDuasDhikr: true,
      dailyQuranWird: true
    }
  ]
};

export const INITIAL_PARENT_TASKS: Record<string, ParentTaskRecord[]> = {
  'std-1': [
    {
      id: 'pt-1',
      date: '2026-09-14',
      day: 'Monday',
      task: 'Listen to Sabaq Surah Maryam v.1-15 three times before sleep',
      mistakesNotes: '1 mistake on v.8 (kibr), corrected with father',
      parentSigned: true
    },
    {
      id: 'pt-2',
      date: '2026-09-15',
      day: 'Tuesday',
      task: 'Hear Juz 6 difficult passages (Ruku 4-6) and check Tajweed rules',
      mistakesNotes: '2 minor stops on Waqf signs. Improved quickly.',
      parentSigned: true
    },
    {
      id: 'pt-3',
      date: '2026-09-16',
      day: 'Wednesday',
      task: 'Listen to upcoming Sabaq (v.34-50) audio from Sheikh Minshawi',
      mistakesNotes: 'Listened twice together after Maghrib',
      parentSigned: false
    },
    {
      id: 'pt-4',
      date: '2026-09-18',
      day: 'Friday',
      task: 'Review Friday Surah Al-Kahf first and last 10 verses',
      mistakesNotes: 'Recited smoothly with proper Ghunnah',
      parentSigned: false
    }
  ]
};

export const INITIAL_WEEKLY_EVALUATIONS: Record<string, WeeklyEvaluationRecord> = {
  'std-1': {
    id: 'we-std-1-w1',
    weekCommencing: '2026-09-14',
    currentJuz: 14,
    currentSurah: 'Surah Maryam',
    islamicStudies: {
      passed: true,
      teacherComments: 'Excellent understanding of Fiqh of Taharah and Salah conditions.'
    },
    duasMemorisation: {
      passed: true,
      currentDua: 'Dua after leaving the home & Dua upon entering Masjid'
    },
    surahMemorisation: {
      passed: true,
      parentComments: 'Abdullah practiced diligently every evening with his older brother.'
    },
    teacherOverallFeedback: 'MashaAllah, Abdullah has shown exemplary dedication this week. His Sabaq retention is top-tier with minimal mistakes. Needs continued focus on Juz 6 Mutashabihat during Dawr.',
    parentOverallFeedback: 'We are very proud of his consistency this week. He regularly attended Fajr at the Masjid and kept up with his daily Dhikr.',
    teacherSigned: true,
    parentSigned: true,
    automatedReportGenerated: true
  }
};
