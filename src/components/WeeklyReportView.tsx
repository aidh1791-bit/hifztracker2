import React, { useState } from 'react';
import { useHifz } from '../context/HifzContext';
import {
  Award,
  Printer,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileText,
  Calendar,
  User,
  GraduationCap,
  Heart,
  Share2,
  Download,
  Mail,
  FileSpreadsheet,
  Trophy
} from 'lucide-react';
import { generateAutomatedWeeklyInsights } from '../utils/hifzCalculations';
import confetti from 'canvas-confetti';
import { EndOfTermExportModal } from './EndOfTermExportModal';
import { calculateStudentMerit, DEFAULT_ISLAMIC_TROPHIES } from '../utils/meritTrophies';

export const WeeklyReportView: React.FC = () => {
  const {
    selectedStudent,
    weeklySummary,
    currentHifzRecords,
    currentHomeLearning,
    currentTarbiyah,
    currentEvaluation,
    userRole,
    signEvaluation,
    endOfTermSetup,
    adminSettings
  } = useHifz();

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Compute Monday of the current week dynamically
  const now = new Date();
  const dayOfWeekIndex = now.getDay();
  const mondayOffset = dayOfWeekIndex === 0 ? -6 : 1 - dayOfWeekIndex;
  const mondayDate = new Date(now);
  mondayDate.setDate(now.getDate() + mondayOffset);
  const weekCommencingStr = mondayDate.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const activeTrophies = adminSettings.trophies && adminSettings.trophies.length > 0
    ? adminSettings.trophies
    : DEFAULT_ISLAMIC_TROPHIES;

  const meritData = calculateStudentMerit(
    currentHifzRecords,
    currentHifzRecords.map(r => ({ status: r.attendance, date: r.date })),
    currentHomeLearning,
    currentTarbiyah,
    activeTrophies
  );

  const insights = generateAutomatedWeeklyInsights(
    selectedStudent.name,
    weeklySummary,
    currentHifzRecords
  );

  const handlePrint = () => {
    window.print();
  };

  const handleCelebrate = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Action Bar (Hidden in Print) */}
      <div className="no-print bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
              <Award className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-slate-900">
              Automated Weekly Performance Evaluation
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 hidden sm:inline">
              {endOfTermSetup.termTitle}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Algorithmic evaluation compiled from Sabaq, Sabaqee, Dawr, Attendance & Home Tarbiyah.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          {/* Email Report Button */}
          <button
            type="button"
            onClick={() => setIsExportModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-900 text-xs font-bold flex items-center gap-1.5 border border-blue-200 transition-colors shadow-2xs"
            title="Generate email report for parent or administration"
          >
            <Mail className="w-4 h-4 text-blue-700" />
            <span>Email Report</span>
          </button>

          {/* Export Feature Button */}
          <button
            type="button"
            onClick={() => setIsExportModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-bold flex items-center gap-1.5 border border-emerald-300 transition-colors shadow-2xs"
            title="Export end of term CSV and JSON bundles"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
            <span>Export Term Report</span>
          </button>

          <button
            type="button"
            onClick={handleCelebrate}
            className="px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold flex items-center gap-1.5 border border-amber-200 transition-colors"
          >
            <Sparkles className="w-4 h-4 text-amber-600" />
            Praise Student
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print / PDF
          </button>
        </div>
      </div>

      {/* The Printable Official Evaluation Document */}
      <div className="print-page bg-white rounded-2xl border-2 border-slate-300 p-6 sm:p-8 shadow-sm space-y-6">
        
        {/* Madrasah Header Banner */}
        <div className="text-center border-b-2 border-slate-900 pb-5">
          <span className="font-amiri text-2xl text-emerald-800 block">
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </span>
          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight mt-1">
            {adminSettings.academyName}
          </h1>
          <p className="text-xs text-slate-600 font-medium mt-0.5">
            Weekly Student Progress & Tarbiyah Evaluation Dossier
          </p>
          <div className="mt-3 flex flex-wrap justify-center items-center gap-x-6 gap-y-1 text-xs text-slate-700">
            <span><strong>Week Commencing:</strong> {weekCommencingStr}</span>
            <span>•</span>
            <span><strong>Madrasah Term:</strong> {endOfTermSetup.termTitle || adminSettings.academicYear}</span>
            <span>•</span>
            <span><strong>Group:</strong> {selectedStudent.classGroup}</span>
          </div>
        </div>

        {/* Student Profile & Grade Block */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
          
          <div className="space-y-1 text-xs">
            <span className="text-slate-400 uppercase font-bold text-[10px]">Student Details</span>
            <div className="text-base font-extrabold text-slate-900">{selectedStudent.name}</div>
            <div className="text-slate-600">Roll No: <strong>{selectedStudent.rollNumber}</strong></div>
            <div className="text-slate-600">Parent: <strong>{selectedStudent.parentName}</strong></div>
          </div>

          <div className="space-y-1 text-xs border-y md:border-y-0 md:border-x border-slate-200 py-2 md:py-0 md:px-4">
            <span className="text-slate-400 uppercase font-bold text-[10px]">Quran Hifz Status</span>
            <div className="text-sm font-bold text-emerald-800">
              Juz {selectedStudent.currentJuz} • {selectedStudent.currentSurah}
            </div>
            <div className="text-slate-600">Total Memorised: <strong>{selectedStudent.totalJuzMemorised} / 30 Juz</strong></div>
            <div className="text-slate-600">Ustadh / Instructor: <strong>{selectedStudent.teacherName}</strong></div>
          </div>

          <div className="flex items-center justify-between md:justify-end gap-3 text-right">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Weekly Grade</span>
              <div className="text-xs text-slate-600">
                {weeklySummary.overallGrade === 'Not yet assessed' ? (
                  <span className="text-slate-500 italic">Pending Assessment</span>
                ) : (
                  <>Score: <strong>{weeklySummary.performanceScore}/100</strong></>
                )}
              </div>
            </div>
            <div className="w-16 h-16 rounded-2xl bg-emerald-800 text-white flex flex-col items-center justify-center shadow-xs">
              <span className={weeklySummary.overallGrade === 'Not yet assessed' ? 'text-xl font-black leading-none' : 'text-2xl font-black leading-none'}>
                {weeklySummary.overallGrade === 'Not yet assessed' ? '—' : weeklySummary.overallGrade}
              </span>
              <span className="text-[9px] uppercase font-bold opacity-80 mt-0.5">
                {weeklySummary.overallGrade === 'Not yet assessed' ? 'Pending' : 'Rating'}
              </span>
            </div>
          </div>

        </div>

        {/* Islamic Merit Honor Tier Block */}
        <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-xs shrink-0">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded-full border border-amber-300">
                  Madrasah Islamic Honor Tier
                </span>
                <span className="font-serif font-bold text-slate-900 text-sm">
                  {meritData.currentTrophy.titleArabic}
                </span>
                <span className="font-semibold text-slate-700 text-xs">
                  • {meritData.currentTrophy.titleEnglish}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 mt-0.5">
                {meritData.currentTrophy.description}
              </p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Total Merit</span>
            <span className="text-sm font-black text-amber-950">{meritData.totalPoints} pts</span>
          </div>
        </div>

        {/* Key Performance Indicators Grid */}
        <div>
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
            I. Quantitative Performance Metrics
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            
            <div className="p-3 rounded-lg border border-slate-200 bg-white">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Sabaq (New Lesson)</span>
              <div className="text-base font-extrabold text-slate-900 mt-1">
                {weeklySummary.totalSabaqPassed} / {weeklySummary.totalSabaqAttempted} Passed
              </div>
              <span className="text-[10px] text-emerald-700 font-bold block mt-0.5">
                {weeklySummary.totalSabaqAttempted > 0
                  ? `${Math.round((weeklySummary.totalSabaqPassed / weeklySummary.totalSabaqAttempted) * 100)}% Success`
                  : '100%'}
              </span>
            </div>

            <div className="p-3 rounded-lg border border-slate-200 bg-white">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Sabaq Para (Sabaqee)</span>
              <div className="text-base font-extrabold text-slate-900 mt-1">
                {weeklySummary.totalSabaqParaPassed} / {weeklySummary.totalSabaqParaAttempted} Passed
              </div>
              <span className="text-[10px] text-teal-700 font-bold block mt-0.5">
                {weeklySummary.totalSabaqParaAttempted > 0
                  ? `${Math.round((weeklySummary.totalSabaqParaPassed / weeklySummary.totalSabaqParaAttempted) * 100)}% Stability`
                  : '100%'}
              </span>
            </div>

            <div className="p-3 rounded-lg border border-slate-200 bg-white">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Dawr / Manzil (Revision)</span>
              <div className="text-base font-extrabold text-slate-900 mt-1">
                {weeklySummary.totalDawrPassed} / {weeklySummary.totalDawrAttempted} Passed
              </div>
              <span className="text-[10px] text-amber-700 font-bold block mt-0.5">
                {weeklySummary.totalDawrAttempted > 0
                  ? `${Math.round((weeklySummary.totalDawrPassed / weeklySummary.totalDawrAttempted) * 100)}% Mastery`
                  : 'Not assessed'}
              </span>
            </div>

            <div className="p-3 rounded-lg border border-slate-200 bg-white">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Attendance & Tarbiyah</span>
              <div className="text-base font-extrabold text-slate-900 mt-1">
                {weeklySummary.totalDaysPresent} Days Present
              </div>
              <span className="text-[10px] text-indigo-700 font-bold block mt-0.5">
                {weeklySummary.masjidPrayerCount} Masjid Prayers
              </span>
            </div>

          </div>
        </div>

        {/* Automated Algorithmic Analysis (Strengths & Focus Areas) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Strengths */}
          <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 uppercase mb-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              Automated Evaluation: Key Strengths
            </div>
            <ul className="space-y-1.5 text-xs text-slate-700">
              {insights.strengths.map((str, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-emerald-700 font-bold">•</span>
                  <span>{str}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Areas of Focus */}
          <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 uppercase mb-2">
              <AlertCircle className="w-4 h-4 text-amber-700" />
              Targeted Focus Recommendations
            </div>
            <ul className="space-y-1.5 text-xs text-slate-700">
              {insights.focusAreas.map((foc, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-amber-700 font-bold">•</span>
                  <span>{foc}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Non-Hifz Curriculum Status (Bottom of Image 2) */}
        <div>
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
            II. Supplemental Tarbiyah & Curriculum Evaluation
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div>
              <span className="font-bold text-slate-700 block">Islamic Studies:</span>
              <span className="text-slate-600">
                {currentEvaluation.islamicStudies.passed ? 'Passed ✓' : 'Incomplete'} — {currentEvaluation.islamicStudies.teacherComments}
              </span>
            </div>
            <div>
              <span className="font-bold text-slate-700 block">Daily Duas:</span>
              <span className="text-slate-600">
                {currentEvaluation.duasMemorisation.passed ? 'Memorised ✓' : 'Incomplete'} ({currentEvaluation.duasMemorisation.currentDua})
              </span>
            </div>
            <div>
              <span className="font-bold text-slate-700 block">Home Time Logged:</span>
              <span className="text-slate-600">
                {(weeklySummary.totalHomeStudyMins / 60).toFixed(1)} Hours (Parent-Confirmed)
              </span>
            </div>
          </div>
        </div>

        {/* Inspiring Quran / Hadith Quote */}
        <div className="text-center p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-950 space-y-1">
          <div className="font-amiri text-base text-emerald-900">
            {insights.approvedHadith.arabic}
          </div>
          <div className="italic text-slate-700">
            "{insights.approvedHadith.translation}"
          </div>
          <div className="not-italic font-semibold text-[10px] text-slate-500">
            — {insights.approvedHadith.source}, {insights.approvedHadith.hadithNumber}
          </div>
        </div>

        {/* Official Signatures & Seal Section */}
        <div className="pt-6 border-t-2 border-slate-300 grid grid-cols-2 gap-8">
          
          <div className="border border-slate-300 rounded-xl p-4 text-xs">
            <span className="font-bold text-slate-500 uppercase text-[10px] block">
              Head Teacher / Ustadh Verification
            </span>
            <div className="h-12 flex items-center">
              {currentEvaluation.teacherSigned ? (
                <div className="font-bold text-emerald-800 text-sm italic font-serif">
                  Qari Bilal (Head of Hifz) — Verified
                </div>
              ) : (
                <div className="text-slate-400 italic">Pending teacher signature</div>
              )}
            </div>
            <div className="border-t border-slate-200 pt-1 text-[10px] text-slate-500 flex justify-between">
              <span>Date: 19 / 09 / 2026</span>
              <span>Status: {currentEvaluation.teacherSigned ? 'Approved' : 'Pending'}</span>
            </div>
          </div>

          <div className="border border-slate-300 rounded-xl p-4 text-xs">
            <span className="font-bold text-slate-500 uppercase text-[10px] block">
              Parent / Guardian Confirmation
            </span>
            <div className="h-12 flex items-center">
              {currentEvaluation.parentSigned ? (
                <div className="font-bold text-indigo-800 text-sm italic font-serif">
                  {selectedStudent.parentName} — Confirmed
                </div>
              ) : (
                <div className="text-slate-400 italic">Pending parent signature</div>
              )}
            </div>
            <div className="border-t border-slate-200 pt-1 text-[10px] text-slate-500 flex justify-between">
              <span>Date: 19 / 09 / 2026</span>
              <span>Status: {currentEvaluation.parentSigned ? 'Confirmed' : 'Pending'}</span>
            </div>
          </div>

        </div>

      </div>

      {/* End-of-Term Export & Email Reporting Modal */}
      <EndOfTermExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />

    </div>
  );
};
