import { Student, DailyHifzRecord, DailyHomeLearningRecord, DailyTarbiyahRecord, WeeklyEvaluationRecord, EndOfTermSetup, WeeklySummary } from '../types';
import { calculateWeeklySummary } from './hifzCalculations';

export interface StudentTermAggregates {
  student: Student;
  summary: WeeklySummary;
  recordsCount: number;
  homeHours: string;
  attendancePercent: number;
}

export function compileAllStudentsTermData(
  students: Student[],
  hifzMap: Record<string, DailyHifzRecord[]>,
  homeMap: Record<string, DailyHomeLearningRecord[]>,
  tarbiyahMap: Record<string, DailyTarbiyahRecord[]>
): StudentTermAggregates[] {
  return students.map((student) => {
    const records = hifzMap[student.id] || [];
    const home = homeMap[student.id] || [];
    const tarbiyah = tarbiyahMap[student.id] || [];
    const summary = calculateWeeklySummary(records, home, tarbiyah);

    const totalDays = summary.totalDaysPresent + summary.totalDaysAbsent + summary.totalDaysLate;
    const attendancePercent = totalDays > 0 ? Math.round((summary.totalDaysPresent / totalDays) * 100) : 100;
    const homeHours = (summary.totalHomeStudyMins / 60).toFixed(1);

    return {
      student,
      summary,
      recordsCount: records.length,
      homeHours,
      attendancePercent
    };
  });
}

/**
 * Generates an RFC-4180 compliant CSV of the entire class end-of-term setup and student performance
 */
export function generateEndOfTermCSV(
  setup: EndOfTermSetup,
  aggregates: StudentTermAggregates[]
): string {
  const escapeCsv = (val: any): string => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const lines: string[] = [];

  // Metadata header
  lines.push(`${escapeCsv('MADRASAH HIFZ TRACK - OFFICIAL END OF TERM PERFORMANCE DOSSIER')}`);
  lines.push(`${escapeCsv('Term')},${escapeCsv(setup.termTitle)},${escapeCsv('Academic Year')},${escapeCsv(setup.academicYear)}`);
  lines.push(`${escapeCsv('Term Period')},${escapeCsv(`${setup.startDate} to ${setup.endDate}`)},${escapeCsv('Class Days')},${escapeCsv(setup.totalClassDays)}`);
  lines.push(`${escapeCsv('Head Ustadh')},${escapeCsv(setup.headTeacherName)},${escapeCsv('Verification Seal')},${escapeCsv(setup.headTeacherSeal)}`);
  lines.push(`${escapeCsv('Term General Remarks')},${escapeCsv(setup.termRemarks)}`);
  lines.push(''); // blank row

  // Table header
  const headers = [
    'Roll Number',
    'Student Name',
    'Class Group',
    'Parent Name',
    'Parent Contact',
    'Current Juz',
    'Current Surah',
    'Total Memorised (Juz)',
    'Sabaq Passed / Attempted',
    'Sabaq Pass %',
    'Sabaqee Passed / Attempted',
    'Sabaqee Stability %',
    'Dawr Revision Passed / Attempted',
    'Dawr Mastery %',
    'Attendance %',
    'Days Present',
    'Days Absent / Late',
    'Home Study (Hours)',
    'Masjid Prayers',
    'Performance Score',
    'Final Grade'
  ];
  lines.push(headers.map(escapeCsv).join(','));

  // Student rows
  for (const item of aggregates) {
    const { student, summary, homeHours, attendancePercent } = item;
    const sabaqPassPercent = summary.totalSabaqAttempted > 0
      ? Math.round((summary.totalSabaqPassed / summary.totalSabaqAttempted) * 100)
      : 100;
    const sabaqeePassPercent = summary.totalSabaqParaAttempted > 0
      ? Math.round((summary.totalSabaqParaPassed / summary.totalSabaqParaAttempted) * 100)
      : 100;
    const dawrPassPercent = summary.totalDawrAttempted > 0
      ? Math.round((summary.totalDawrPassed / summary.totalDawrAttempted) * 100)
      : 100;

    const row = [
      student.rollNumber,
      student.name,
      student.classGroup,
      student.parentName,
      student.parentPhone,
      student.currentJuz,
      student.currentSurah,
      student.totalJuzMemorised,
      `${summary.totalSabaqPassed}/${summary.totalSabaqAttempted}`,
      `${sabaqPassPercent}%`,
      `${summary.totalSabaqParaPassed}/${summary.totalSabaqParaAttempted}`,
      `${sabaqeePassPercent}%`,
      `${summary.totalDawrPassed}/${summary.totalDawrAttempted}`,
      `${dawrPassPercent}%`,
      `${attendancePercent}%`,
      summary.totalDaysPresent,
      `${summary.totalDaysAbsent} abs, ${summary.totalDaysLate} late`,
      homeHours,
      summary.masjidPrayerCount,
      `${summary.performanceScore}/100`,
      summary.overallGrade
    ];
    lines.push(row.map(escapeCsv).join(','));
  }

  return lines.join('\r\n');
}

/**
 * Generates an end-of-term JSON bundle
 */
export function generateEndOfTermJSON(
  setup: EndOfTermSetup,
  aggregates: StudentTermAggregates[],
  evaluationsMap: Record<string, WeeklyEvaluationRecord>
): string {
  const exportPayload = {
    exportType: 'MADRASAH_HIFZ_END_OF_TERM_ARCHIVE',
    exportedAt: new Date().toISOString(),
    termSetup: setup,
    studentsCount: aggregates.length,
    roster: aggregates.map((item) => ({
      profile: item.student,
      metrics: {
        score: item.summary.performanceScore,
        grade: item.summary.overallGrade,
        sabaqPassed: item.summary.totalSabaqPassed,
        sabaqAttempted: item.summary.totalSabaqAttempted,
        sabaqParaPassed: item.summary.totalSabaqParaPassed,
        sabaqParaAttempted: item.summary.totalSabaqParaAttempted,
        dawrPassed: item.summary.totalDawrPassed,
        dawrAttempted: item.summary.totalDawrAttempted,
        attendancePercent: item.attendancePercent,
        daysPresent: item.summary.totalDaysPresent,
        homeStudyHours: item.homeHours,
        masjidPrayers: item.summary.masjidPrayerCount
      },
      evaluation: evaluationsMap[item.student.id] || null
    }))
  };

  return JSON.stringify(exportPayload, null, 2);
}

/**
 * Triggers a client-side file download
 */
export function downloadBlobFile(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Formats report for email dispatch
 */
export function formatEmailReportText(
  student: Student,
  summary: WeeklySummary,
  evaluation: WeeklyEvaluationRecord,
  weekTitle: string = 'Week Commencing 14 September 2026'
): { subject: string; body: string; htmlBody: string } {
  const subject = `[Madrasah Hifz Report] ${student.name} (${student.rollNumber}) - ${weekTitle}`;

  const body = `Assalamu Alaikum wa Rahmatullahi wa Barakatuh ${student.parentName},

Here is the official Quran Hifz progress evaluation report for ${student.name} for ${weekTitle}.

--- STUDENT PROFILE ---
Student: ${student.name}
Roll Number: ${student.rollNumber}
Class Circle: ${student.classGroup}
Instructor: ${student.teacherName}
Current Juz: Juz ${student.currentJuz} (${student.currentSurah})
Total Memorised: ${student.totalJuzMemorised} / 30 Juz

--- PERFORMANCE EVALUATION ---
Overall Weekly Grade: ${summary.overallGrade} (Score: ${summary.performanceScore}/100)
Sabaq (New Lesson): ${summary.totalSabaqPassed} of ${summary.totalSabaqAttempted} portions passed
Sabaq Para (Sabaqee Revision): ${summary.totalSabaqParaPassed} of ${summary.totalSabaqParaAttempted} portions passed
Dawr / Manzil (Quarter/Juz Revision): ${summary.totalDawrPassed} of ${summary.totalDawrAttempted} portions passed

--- ATTENDANCE & TARBIYAH ---
Madrasah Attendance: ${summary.totalDaysPresent} Days Present (${summary.totalDaysAbsent} absent, ${summary.totalDaysLate} late)
Masjid Congregation Prayers: ${summary.masjidPrayerCount} prayers logged
Home Revision (Parent-Confirmed): ${(summary.totalHomeStudyMins / 60).toFixed(1)} hours

--- USTADH REMARKS ---
"${evaluation.teacherOverallFeedback || 'MashaAllah, consistent effort and focused Tajweed during class recitations.'}"

Status: ${evaluation.teacherSigned ? 'Signed & Verified by Head Ustadh' : 'Pending Ustadh Final Seal'}

To view the student portal or sign the parent confirmation, please log in to the Madrasah Hifz Portal with your registered email: ${student.parentEmail || 'your registered parent email'}

Jazakumullahu Khairan,
Hifz al-Quran Academy
Admin Contact: madrasah.hifz.circle@gmail.com`;

  const htmlBody = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
  <div style="background-color: #065f46; color: white; padding: 20px; text-align: center;">
    <div style="font-size: 20px; font-weight: bold;">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>
    <h2 style="margin: 8px 0 4px; font-size: 18px;">Hifz al-Quran Academy</h2>
    <p style="margin: 0; font-size: 13px; opacity: 0.9;">Student Progress & Evaluation Report</p>
  </div>
  <div style="padding: 24px;">
    <p style="margin-top: 0;">Assalamu Alaikum wa Rahmatullahi wa Barakatuh <strong>${student.parentName}</strong>,</p>
    <p style="font-size: 14px; color: #475569;">Here is the official progress summary for <strong>${student.name}</strong> (${student.rollNumber}) for <em>${weekTitle}</em>.</p>
    
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
      <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
        <span style="font-size: 13px; color: #64748b;">Current Hifz Station:</span>
        <strong style="font-size: 13px; color: #0f172a;">Juz ${student.currentJuz} (${student.currentSurah})</strong>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
        <span style="font-size: 13px; color: #64748b;">Total Memorised:</span>
        <strong style="font-size: 13px; color: #065f46;">${student.totalJuzMemorised} / 30 Juz</strong>
      </div>
      <div style="display: flex; justify-content: space-between;">
        <span style="font-size: 13px; color: #64748b;">Overall Performance Grade:</span>
        <strong style="font-size: 14px; color: #065f46; background: #ecfdf5; padding: 2px 8px; border-radius: 4px;">Grade ${summary.overallGrade} (${summary.performanceScore}/100)</strong>
      </div>
    </div>

    <h3 style="font-size: 14px; color: #0f172a; margin-bottom: 8px; text-transform: uppercase;">Recitation Summary</h3>
    <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 20px;">
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 8px 0; color: #64748b;">Sabaq (New Lesson):</td>
        <td style="padding: 8px 0; font-weight: bold; text-align: right;">${summary.totalSabaqPassed} / ${summary.totalSabaqAttempted} Passed</td>
      </tr>
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 8px 0; color: #64748b;">Sabaqee (Recent Revision):</td>
        <td style="padding: 8px 0; font-weight: bold; text-align: right;">${summary.totalSabaqParaPassed} / ${summary.totalSabaqParaAttempted} Passed</td>
      </tr>
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 8px 0; color: #64748b;">Dawr (Manzil Mastery):</td>
        <td style="padding: 8px 0; font-weight: bold; text-align: right;">${summary.totalDawrPassed} / ${summary.totalDawrAttempted} Passed</td>
      </tr>
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 8px 0; color: #64748b;">Madrasah Attendance:</td>
        <td style="padding: 8px 0; font-weight: bold; text-align: right;">${summary.totalDaysPresent} Days Present</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #64748b;">Home Study Verified:</td>
        <td style="padding: 8px 0; font-weight: bold; text-align: right;">${(summary.totalHomeStudyMins / 60).toFixed(1)} Hours</td>
      </tr>
    </table>

    <div style="background-color: #ecfdf5; border-left: 4px solid #059669; padding: 12px; margin-bottom: 20px; font-size: 13px; color: #064e3b; font-style: italic;">
      <strong>Ustadh Feedback:</strong> "${evaluation.teacherOverallFeedback || 'MashaAllah, consistent effort and focused Tajweed during class recitations.'}"
    </div>

    <p style="font-size: 12px; color: #94a3b8; text-align: center; margin-top: 24px;">
      Sent automatically by Hifz al-Quran Academy Management System.
    </p>
  </div>
</div>
  `;

  return { subject, body, htmlBody };
}

/**
 * Creates mailto url
 */
export function buildMailtoUrl(recipientEmail: string, subject: string, body: string): string {
  const cleanRecipient = recipientEmail.trim();
  const encodedSubject = encodeURIComponent(subject);
  const encodedBody = encodeURIComponent(body);
  return `mailto:${cleanRecipient}?subject=${encodedSubject}&body=${encodedBody}`;
}
