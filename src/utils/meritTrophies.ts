import { DailyHifzRecord, AttendanceStatus, DailyHomeLearningRecord, DailyTarbiyahRecord, IslamicTrophyTier } from '../types';

export interface AttendanceRecord {
  status: AttendanceStatus;
  date?: string;
}

export type HomeLearningRecord = DailyHomeLearningRecord;
export type TarbiyahRecord = DailyTarbiyahRecord;

export type { IslamicTrophyTier };

export const DEFAULT_ISLAMIC_TROPHIES: IslamicTrophyTier[] = [
  {
    id: 'trophy-1',
    minPoints: 50,
    titleArabic: 'طالب العلم',
    titleEnglish: 'Talib al-Ilm (Seeker of Knowledge)',
    titleUrdu: 'طالبِ علم',
    description: 'Awarded for embarking on daily recitation and establishing initial attendance discipline.',
    badgeIcon: 'award',
    colorScheme: 'blue'
  },
  {
    id: 'trophy-2',
    minPoints: 150,
    titleArabic: 'حافظ الأمانة',
    titleEnglish: 'Hafiz al-Amanah (Guardian of Trust)',
    titleUrdu: 'حافظِ امانت',
    description: 'Consistently passing Sabaq and Sabaq Para daily lessons without accumulating unrevised portions.',
    badgeIcon: 'shield',
    colorScheme: 'emerald'
  },
  {
    id: 'trophy-3',
    minPoints: 300,
    titleArabic: 'نجم الحلقة',
    titleEnglish: 'Najm al-Halqa (Star of the Circle)',
    titleUrdu: 'نجمِ حلقہ',
    description: 'Mastery in Dawr revision, punctual attendance register, and disciplined home Tajweed repetition.',
    badgeIcon: 'star',
    colorScheme: 'amber'
  },
  {
    id: 'trophy-4',
    minPoints: 500,
    titleArabic: 'فارس القرآن',
    titleEnglish: 'Faris al-Quran (Champion of the Quran)',
    titleUrdu: 'فارسِ قرآن',
    description: 'Exemplary retention across multiple Juz, outstanding Tajweed fluency, and 5-daily Salaah logs.',
    badgeIcon: 'sparkles',
    colorScheme: 'purple'
  },
  {
    id: 'trophy-5',
    minPoints: 750,
    titleArabic: 'تاج الوقار',
    titleEnglish: 'Taj al-Waqar (Crown of Dignity)',
    titleUrdu: 'تاجِ وقار',
    description: 'The highest Madrasah honour: exemplary Quranic character, inspiring peers, and completing major milestones.',
    badgeIcon: 'crown',
    colorScheme: 'rose'
  }
];

export interface StudentMeritBreakdown {
  totalPoints: number;
  sabaqPoints: number;
  sabaqParaPoints: number;
  dawrPoints: number;
  attendancePoints: number;
  prayerPoints: number;
  homeStudyPoints: number;
  currentTrophy: IslamicTrophyTier;
  nextTrophy: IslamicTrophyTier | null;
  pointsToNext: number;
  progressPercent: number;
}

/**
 * Calculates automated merit points and resolves the active Islamic trophy tier
 */
export function calculateStudentMerit(
  hifzRecords: DailyHifzRecord[] = [],
  attendanceRecords: AttendanceRecord[] = [],
  homeLearningRecords: HomeLearningRecord[] = [],
  tarbiyahRecords: TarbiyahRecord[] = [],
  customTrophies: IslamicTrophyTier[] = DEFAULT_ISLAMIC_TROPHIES
): StudentMeritBreakdown {
  // Sort trophies by threshold ascending; fallback to default if empty
  const activeTrophies = (customTrophies && customTrophies.length > 0)
    ? customTrophies
    : DEFAULT_ISLAMIC_TROPHIES;
  const trophies = [...activeTrophies].sort((a, b) => a.minPoints - b.minPoints);

  let sabaqPoints = 0;
  let sabaqParaPoints = 0;
  let dawrPoints = 0;

  hifzRecords.forEach((rec) => {
    if (rec.sabaq?.taskPassed) sabaqPoints += 15;
    if (rec.sabaqPara?.taskPassed) sabaqParaPoints += 15;
    if (rec.dawr1?.taskPassed) dawrPoints += 10;
    if (rec.dawr2?.taskPassed) dawrPoints += 10;
  });

  let attendancePoints = 0;
  attendanceRecords.forEach((att) => {
    if (att.status === 'present') attendancePoints += 10;
    else if (att.status === 'late') attendancePoints += 5;
  });

  let prayerPoints = 0;
  tarbiyahRecords.forEach((tb) => {
    if (tb.prayers) {
      const prayers = [tb.prayers.fajr, tb.prayers.dhuhr, tb.prayers.asr, tb.prayers.maghrib, tb.prayers.ishaa];
      const totalPrayed = prayers.filter((p) => p === 'MSJ' || p === 'HM').length;
      prayerPoints += totalPrayed * 3;
    }
    if (tb.dailySadaqah || tb.dailyDuasDhikr) prayerPoints += 5;
  });

  let homeStudyPoints = 0;
  homeLearningRecords.forEach((hl) => {
    const totalMins = (hl.sabaqMins || 0) + (hl.sabaqParaMins || 0) + (hl.dawr1Mins || 0) + (hl.dawr2Mins || 0);
    homeStudyPoints += Math.floor(totalMins / 10) * 2;
    if (hl.parentSigned) homeStudyPoints += 5;
  });

  // Merit points strictly calculated from evaluated records (no unearned baseline)
  const totalPoints = sabaqPoints + sabaqParaPoints + dawrPoints + attendancePoints + prayerPoints + homeStudyPoints;

  // Determine unlocked trophy
  let currentTrophy = trophies[0];
  let nextTrophy: IslamicTrophyTier | null = null;

  for (let i = trophies.length - 1; i >= 0; i--) {
    if (totalPoints >= trophies[i].minPoints) {
      currentTrophy = trophies[i];
      nextTrophy = trophies[i + 1] || null;
      break;
    }
  }

  // If haven't reached even trophy 1
  if (totalPoints < trophies[0].minPoints) {
    currentTrophy = {
      id: 'trophy-init',
      minPoints: 0,
      titleArabic: 'مبتدئ الحفظ',
      titleEnglish: 'Mubtadi al-Hifz (Quran Beginner)',
      titleUrdu: 'مبتدی الحفظ',
      description: 'First steps towards Quranic memorisation and daily consistency.',
      badgeIcon: 'award',
      colorScheme: 'blue'
    };
    nextTrophy = trophies[0];
  }

  const prevThreshold = currentTrophy.minPoints;
  const nextThreshold = nextTrophy ? nextTrophy.minPoints : currentTrophy.minPoints;
  const range = nextThreshold - prevThreshold;
  const pointsIntoCurrent = totalPoints - prevThreshold;

  const progressPercent = nextTrophy
    ? Math.min(100, Math.max(5, Math.round((pointsIntoCurrent / Math.max(1, range)) * 100)))
    : 100;

  const pointsToNext = nextTrophy ? Math.max(0, nextTrophy.minPoints - totalPoints) : 0;

  return {
    totalPoints,
    sabaqPoints,
    sabaqParaPoints,
    dawrPoints,
    attendancePoints,
    prayerPoints,
    homeStudyPoints,
    currentTrophy,
    nextTrophy,
    pointsToNext,
    progressPercent
  };
}
