import { DailyHifzRecord, DailyHomeLearningRecord, DailyTarbiyahRecord, WeeklySummary } from '../types';
import { getApprovedHadith, ApprovedHadith } from '../data/approvedHadith';

export function calculateWeeklySummary(
  hifzRecords: DailyHifzRecord[],
  homeLearning: DailyHomeLearningRecord[],
  tarbiyahRecords: DailyTarbiyahRecord[]
): WeeklySummary {
  let sabaqPassed = 0;
  let sabaqAttempted = 0;
  let sabaqParaPassed = 0;
  let sabaqParaAttempted = 0;
  let dawrPassed = 0;
  let dawrAttempted = 0;
  
  let daysPresent = 0;
  let daysAbsent = 0;
  let daysLate = 0;
  let daysExcused = 0;

  for (const record of hifzRecords) {
    if (record.attendance === 'present') daysPresent++;
    else if (record.attendance === 'absent') daysAbsent++;
    else if (record.attendance === 'late') daysLate++;
    else if (record.attendance === 'excused') daysExcused++;

    // Sabaq
    if (record.sabaq.taskPassed !== null) {
      sabaqAttempted++;
      if (record.sabaq.taskPassed) sabaqPassed++;
    }

    // Sabaq Para
    if (record.sabaqPara.taskPassed !== null) {
      sabaqParaAttempted++;
      if (record.sabaqPara.taskPassed) sabaqParaPassed++;
    }

    // Dawr 1 & 2
    if (record.dawr1.taskPassed !== null) {
      dawrAttempted++;
      if (record.dawr1.taskPassed) dawrPassed++;
    }
    if (record.dawr2.taskPassed !== null) {
      dawrAttempted++;
      if (record.dawr2.taskPassed) dawrPassed++;
    }
  }

  // Home study minutes
  let totalHomeMins = 0;
  for (const home of homeLearning) {
    totalHomeMins += (home.sabaqMins || 0) + (home.sabaqParaMins || 0) + (home.dawr1Mins || 0) + (home.dawr2Mins || 0);
  }

  // Tarbiyah & Salah (Equally rewarding home prayer and masjid prayer)
  let msjCount = 0;
  let hmCount = 0;
  let totalSpiritualTasks = 0;
  let completedSpiritualTasks = 0;

  for (const t of tarbiyahRecords) {
    const prayers = [t.prayers.fajr, t.prayers.dhuhr, t.prayers.asr, t.prayers.maghrib, t.prayers.ishaa];
    for (const p of prayers) {
      if (p === 'MSJ') {
        msjCount++;
        completedSpiritualTasks += 1;
      } else if (p === 'HM') {
        hmCount++;
        completedSpiritualTasks += 1;
      }
      totalSpiritualTasks += 1;
    }

    if (t.dailySadaqah) completedSpiritualTasks++;
    if (t.eesaalThawaab) completedSpiritualTasks++;
    if (t.dailyDuasDhikr) completedSpiritualTasks++;
    if (t.dailyQuranWird) completedSpiritualTasks++;
    totalSpiritualTasks += 4;
  }

  const tarbiyahScore = totalSpiritualTasks > 0
    ? Math.round((completedSpiritualTasks / totalSpiritualTasks) * 100)
    : 0;

  const totalEvaluatedLessons = sabaqAttempted + sabaqParaAttempted + dawrAttempted;
  const daysEvaluated = daysPresent + daysAbsent + daysLate;
  const hasAnyData = totalEvaluatedLessons > 0 || daysEvaluated > 0 || daysExcused > 0;

  if (!hasAnyData) {
    return {
      totalSabaqAmount: 'Not yet assessed',
      totalSabaqPassed: 0,
      totalSabaqAttempted: 0,
      totalSabaqParaAmount: 'Not yet assessed',
      totalSabaqParaPassed: 0,
      totalSabaqParaAttempted: 0,
      totalDawrAmount: 'Not yet assessed',
      totalDawrPassed: 0,
      totalDawrAttempted: 0,
      totalDaysAbsent: 0,
      totalDaysLate: 0,
      totalDaysPresent: 0,
      totalHomeStudyMins: totalHomeMins,
      masjidPrayerCount: msjCount,
      homePrayerCount: hmCount,
      tarbiyahScore,
      overallGrade: 'Not yet assessed',
      performanceScore: 0
    };
  }

  // Composite Performance Score (0 - 100)
  // Sabaq 25, Sabaq Para 20, Dawr 25, Attendance 15, Home Study 8, Tarbiyah 7
  const sabaqRate = sabaqAttempted > 0 ? (sabaqPassed / sabaqAttempted) : 0;
  const sabaqParaRate = sabaqParaAttempted > 0 ? (sabaqParaPassed / sabaqParaAttempted) : 0;
  const dawrRate = dawrAttempted > 0 ? (dawrPassed / dawrAttempted) : 0;
  
  // Excused absences do not penalize attendance
  const attendanceRate = daysEvaluated > 0 ? (daysPresent + daysLate * 0.7) / daysEvaluated : 1.0;
  const homeTargetMins = 300; // ~5 hrs per week target
  const homeRatio = Math.min(1, totalHomeMins / homeTargetMins);

  const rawScore = (
    sabaqRate * 25 +
    sabaqParaRate * 20 +
    dawrRate * 25 +
    attendanceRate * 15 +
    homeRatio * 8 +
    (tarbiyahScore / 100) * 7
  );

  const performanceScore = Math.min(100, Math.round(rawScore));

  // Standardized Grade Boundaries: 90, 80, 70, 60
  let overallGrade: 'A+' | 'A' | 'B' | 'C' | 'Needs Attention' | 'Not yet assessed';
  if (totalEvaluatedLessons === 0) overallGrade = 'Not yet assessed';
  else if (performanceScore >= 90) overallGrade = 'A+';
  else if (performanceScore >= 80) overallGrade = 'A';
  else if (performanceScore >= 70) overallGrade = 'B';
  else if (performanceScore >= 60) overallGrade = 'C';
  else overallGrade = 'Needs Attention';

  return {
    totalSabaqAmount: `${sabaqPassed} portions memorised`,
    totalSabaqPassed: sabaqPassed,
    totalSabaqAttempted: sabaqAttempted,
    totalSabaqParaAmount: `${sabaqParaPassed} revisions passed`,
    totalSabaqParaPassed: sabaqParaPassed,
    totalSabaqParaAttempted: sabaqParaAttempted,
    totalDawrAmount: `${dawrPassed} sections revised`,
    totalDawrPassed: dawrPassed,
    totalDawrAttempted: dawrAttempted,
    totalDaysAbsent: daysAbsent,
    totalDaysLate: daysLate,
    totalDaysPresent: daysPresent,
    totalHomeStudyMins: totalHomeMins,
    masjidPrayerCount: msjCount,
    homePrayerCount: hmCount,
    tarbiyahScore,
    overallGrade,
    performanceScore
  };
}

export function generateAutomatedWeeklyInsights(
  studentName: string,
  summary: WeeklySummary,
  hifzRecords: DailyHifzRecord[],
  hadithId?: number
) {
  const strengths: string[] = [];
  const focusAreas: string[] = [];

  // Evaluate Sabaq (New Lesson)
  if (summary.totalSabaqAttempted > 0) {
    const sabaqSuccess = summary.totalSabaqPassed / summary.totalSabaqAttempted;
    if (sabaqSuccess >= 0.85) {
      strengths.push(`High Sabaq (New Lesson) retention rate of ${Math.round(sabaqSuccess * 100)}% with excellent first-round mastery.`);
    } else {
      focusAreas.push(`Sabaq memorisation needs repetition at home (target 5-7 repetitions prior to Madrasah).`);
    }
  }

  // Evaluate Sabaq Para (Latest Juz)
  if (summary.totalSabaqParaAttempted > 0) {
    const sabaqParaSuccess = summary.totalSabaqParaPassed / summary.totalSabaqParaAttempted;
    if (sabaqParaSuccess >= 0.8) {
      strengths.push(`Strong Sabaq Para (Sabaqee / Latest Juz) stability. Recent verses are firmly locked in.`);
    } else {
      focusAreas.push(`Sabaq Para requires consolidation; schedule 30 mins daily revision with parent before bedtime.`);
    }
  }

  // Evaluate Dawr (Further Revision)
  if (summary.totalDawrAttempted > 0) {
    const dawrSuccess = summary.totalDawrPassed / summary.totalDawrAttempted;
    if (dawrSuccess >= 0.8) {
      strengths.push(`Exemplary Dawr (Manzil / Long-term Revision) cycle completed with confidence.`);
    } else {
      focusAreas.push(`Pay close attention to Mutashabihat (resembling verses) during Dawr / Manzil revision.`);
    }
  }

  // Attendance
  if (summary.totalDaysAbsent === 0) {
    strengths.push(`Punctual and consistent attendance all week without any unexcused absences.`);
  } else {
    focusAreas.push(`${summary.totalDaysAbsent} day(s) absent this week; make-up revision scheduled.`);
  }

  // Home study (Parent-Confirmed)
  const hours = (summary.totalHomeStudyMins / 60).toFixed(1);
  if (summary.totalHomeStudyMins >= 240) {
    strengths.push(`Parent-confirmed home study of ${hours} hours of dedicated Quran practice outside Madrasah.`);
  } else {
    focusAreas.push(`Increase home practice time (currently ${hours} hrs) towards the recommended 4.5+ hours weekly.`);
  }

  // Spiritual / Tarbiyah
  if (summary.masjidPrayerCount + summary.homePrayerCount >= 20) {
    strengths.push(`Commendable dedication to daily prayers (${summary.masjidPrayerCount} in congregation, ${summary.homePrayerCount} at home).`);
  }

  // Deterministic, approved Hadith quote
  const approvedHadith = getApprovedHadith(hadithId || 1);
  const formattedQuote = `"${approvedHadith.translation}" (${approvedHadith.source} ${approvedHadith.hadithNumber})`;

  return {
    strengths,
    focusAreas,
    quote: formattedQuote,
    approvedHadith
  };
}
