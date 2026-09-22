import {
  DayOfWeek,
  DailyHifzRecord,
  AttendanceStatus,
  DailyHomeLearningRecord,
  DailyTarbiyahRecord,
  PrayerLocation
} from '../types';

/**
 * UK (Europe/London) Date & Calendar Utilities
 */

export interface UkDateInfo {
  dateString: string;       // YYYY-MM-DD in Europe/London
  dayOfWeek: DayOfWeek;     // Monday, Tuesday, etc.
  formattedDate: string;    // e.g. "19 Sep 2026"
  formattedLongDate: string;// e.g. "Saturday, 19 September 2026"
}

export function getUkCurrentDate(): UkDateInfo {
  const now = new Date();
  
  // Format parts in Europe/London timezone
  const dtf = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/London',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'long'
  });

  const parts = dtf.formatToParts(now);
  let day = '';
  let month = '';
  let year = '';
  let weekday = '';

  for (const part of parts) {
    if (part.type === 'day') day = part.value;
    if (part.type === 'month') month = part.value;
    if (part.type === 'year') year = part.value;
    if (part.type === 'weekday') weekday = part.value;
  }

  const dateString = `${year}-${month}-${day}`;
  const validDays: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const dayOfWeek: DayOfWeek = validDays.includes(weekday as DayOfWeek)
    ? (weekday as DayOfWeek)
    : 'Monday';

  const longFormatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/London',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const shortFormatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/London',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return {
    dateString,
    dayOfWeek,
    formattedDate: shortFormatter.format(now),
    formattedLongDate: longFormatter.format(now)
  };
}

/**
 * Creates an empty, unmarked DailyHifzRecord template for a given day/date.
 */
export function createBlankDailyHifzRecord(
  studentId: string,
  day: DayOfWeek,
  dateString: string
): DailyHifzRecord {
  return {
    id: `hifz-${studentId}-${dateString}`,
    day,
    date: dateString,
    attendance: 'unmarked' as AttendanceStatus,
    sabaq: {
      amount: '',
      mistakes: 0,
      taskPassed: null,
      notes: ''
    },
    sabaqPara: {
      amount: '',
      mistakes: 0,
      taskPassed: null,
      notes: ''
    },
    dawr1: {
      amount: '',
      mistakes: 0,
      taskPassed: null,
      notes: ''
    },
    dawr2: {
      amount: '',
      mistakes: 0,
      taskPassed: null,
      notes: ''
    },
    comments: '',
    parentSigned: false,
    teacherSigned: false,
    timestamp: new Date().toISOString()
  };
}

/**
 * Formats a YYYY-MM-DD date string to UK friendly display.
 */
export function formatUkDate(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const [y, m, d] = dateStr.split('-').map(Number);
    if (!y || !m || !d) return dateStr;
    const date = new Date(y, m - 1, d);
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date);
  } catch {
    return dateStr;
  }
}

const WEEK_DAYS: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

/**
 * Creates clean 7-day Home Learning schedule initialized to 0 minutes.
 */
export function createBlankWeeklyHomeLearning(baseDate?: string): DailyHomeLearningRecord[] {
  const ukNow = getUkCurrentDate();
  const dateStr = baseDate || ukNow.dateString;

  return WEEK_DAYS.map(day => ({
    day,
    date: dateStr,
    sabaqMins: 0,
    sabaqParaMins: 0,
    dawr1Mins: 0,
    dawr2Mins: 0,
    parentSigned: false,
    notes: ''
  }));
}

/**
 * Creates clean 7-day Tarbiyah (Salaah & Character) schedule initialized to clean slate.
 */
export function createBlankWeeklyTarbiyah(baseDate?: string): DailyTarbiyahRecord[] {
  const ukNow = getUkCurrentDate();
  const dateStr = baseDate || ukNow.dateString;

  return WEEK_DAYS.map(day => ({
    day,
    date: dateStr,
    prayers: {
      fajr: 'None' as PrayerLocation,
      dhuhr: 'None' as PrayerLocation,
      asr: 'None' as PrayerLocation,
      maghrib: 'None' as PrayerLocation,
      ishaa: 'None' as PrayerLocation
    },
    collectiveTaleemMins: 0,
    collectiveDuaMins: 0,
    dailySadaqah: false,
    eesaalThawaab: false,
    dailyDuasDhikr: false,
    dailyQuranWird: false
  }));
}
