import React, { useState } from 'react';
import { useHifz } from '../context/HifzContext';
import {
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Clock,
  Award,
  ChevronRight,
  Sparkles,
  Flame,
  ArrowUpRight,
  MessageSquareShare,
  MessageSquare,
  HeartHandshake,
  Trophy,
  Crown,
  Star,
  Shield
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ParentRequestUpdateModal } from './ParentRequestUpdateModal';
import { TeacherInquiriesModal } from './TeacherInquiriesModal';
import { IslamicTrophiesModal } from './IslamicTrophiesModal';
import { calculateStudentMerit, DEFAULT_ISLAMIC_TROPHIES } from '../utils/meritTrophies';
import { getUkCurrentDate, formatUkDate } from '../utils/dateUtils';
import { Plus, Calendar } from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    selectedStudent,
    userRole,
    setActiveTab,
    currentHifzRecords,
    startTodayRecord,
    currentHomeLearning,
    currentTarbiyah,
    weeklySummary,
    parentUpdateRequests,
    adminSettings
  } = useHifz();

  const [isParentRequestModalOpen, setIsParentRequestModalOpen] = useState(false);
  const [isTeacherInquiriesModalOpen, setIsTeacherInquiriesModalOpen] = useState(false);
  const [isTrophiesModalOpen, setIsTrophiesModalOpen] = useState(false);

  const pendingTeacherInquiries = parentUpdateRequests.filter(r => r.status === 'pending');
  const myStudentInquiries = parentUpdateRequests.filter(r => r.studentId === selectedStudent.id);

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

  const ukDate = getUkCurrentDate();
  const todayRecord = currentHifzRecords.find(r => r.date === ukDate.dateString || r.day === ukDate.dayOfWeek)
    || currentHifzRecords[0];

  const triggerCelebration = () => {
    confetti({
      particleCount: 75,
      spread: 60,
      origin: { y: 0.6 }
    });
  };

  const juzPercentage = Math.round((selectedStudent.totalJuzMemorised / 30) * 100);

  return (
    <div className="space-y-6">
      
      {/* Student Profile Hero Header */}
      <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 text-white rounded-2xl p-5 sm:p-6 shadow-md relative overflow-hidden">
        {/* Subtle decorative Islamic pattern circles */}
        <div className="absolute -right-8 -top-8 w-44 h-44 rounded-full bg-emerald-700/20 blur-xl pointer-events-none" />
        <div className="absolute right-20 -bottom-10 w-40 h-40 rounded-full bg-teal-600/20 blur-lg pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-emerald-950/70 border-2 border-emerald-400/40 flex flex-col items-center justify-center text-emerald-100 shadow-md shrink-0 select-none">
              <span className="text-xl sm:text-2xl font-black font-serif tracking-wider text-emerald-200">
                {selectedStudent.name.split(' ').map(n => n[0]).join('')}
              </span>
              <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-widest mt-0.5">
                Talib
              </span>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                  {selectedStudent.name}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/30 text-emerald-200 border border-emerald-400/30">
                  {selectedStudent.rollNumber}
                </span>
                <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-950/40 text-emerald-300">
                  {selectedStudent.classGroup}
                </span>
              </div>

              <div className="mt-1 flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-emerald-100/80">
                <span>Teacher: <strong className="text-white">{selectedStudent.teacherName}</strong></span>
                <span>Parent: <strong className="text-white">{selectedStudent.parentName}</strong></span>
                <span>Started: <strong className="text-white">{selectedStudent.hifzStartDate}</strong></span>
              </div>

              <div className="mt-2.5 flex items-center gap-2">
                <span className="text-xs bg-white/10 px-2.5 py-1 rounded-lg text-emerald-100 flex items-center gap-1.5 font-medium">
                  <BookOpen className="w-3.5 h-3.5 text-emerald-300" />
                  Currently Memorizing: <strong className="text-white">Juz {selectedStudent.currentJuz} ({selectedStudent.currentSurah})</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Overall Hifz Progress Gauge */}
          <div className="bg-emerald-950/40 border border-emerald-700/40 rounded-xl p-3 sm:p-4 w-full md:w-64 backdrop-blur-xs">
            <div className="flex items-center justify-between text-xs text-emerald-200 mb-1">
              <span>Overall Quran Hifz</span>
              <span className="font-bold text-white text-sm">{selectedStudent.totalJuzMemorised} / 30 Juz</span>
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-emerald-950/80 rounded-full h-3 p-0.5 border border-emerald-800">
              <div
                className="bg-gradient-to-r from-emerald-400 to-teal-300 h-2 rounded-full transition-all duration-700"
                style={{ width: `${juzPercentage}%` }}
              />
            </div>
            <div className="mt-1.5 flex items-center justify-between text-[11px] text-emerald-300">
              <span>{juzPercentage}% Complete</span>
              <span>Target: {selectedStudent.targetYearlyJuz} Juz/yr</span>
            </div>
          </div>
        </div>
      </div>

      {/* Role Context Notification Bar */}
      {userRole === 'teacher' && (
        <div className="space-y-2">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-center justify-between gap-3 text-xs text-emerald-900">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-700 text-white flex items-center justify-center shrink-0">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <strong className="font-semibold">Teacher Quick Action:</strong> Today's {ukDate.dayOfWeek} testing is active. You can record mistakes, mark Pass/Fail, and enter notes.
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('daily-hifz')}
              className="px-3 py-1.5 rounded-lg bg-emerald-700 text-white font-semibold hover:bg-emerald-800 transition-colors shrink-0 flex items-center gap-1"
            >
              Open Hifz Log <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Teacher Inquiries Alert Banner */}
          {pendingTeacherInquiries.length > 0 && (
            <div className="bg-amber-50 border border-amber-300 rounded-xl p-3.5 flex items-center justify-between gap-3 text-xs text-amber-950">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-amber-600 text-white flex items-center justify-center shrink-0">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <strong className="font-bold text-amber-900">
                    {pendingTeacherInquiries.length} Parent Inquir{pendingTeacherInquiries.length > 1 ? 'ies' : 'y'} Pending:
                  </strong>{' '}
                  Parents requested progress updates or home revision guidance.
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsTeacherInquiriesModalOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-amber-700 text-white font-bold hover:bg-amber-800 transition-colors shrink-0 flex items-center gap-1 shadow-2xs"
              >
                <span>Review Inquiries</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {userRole === 'parent' && (
        <div className="space-y-3">
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-indigo-900">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <strong className="font-semibold">Parent Action Required:</strong> Please sign {ukDate.dayOfWeek}'s Madrasah log and confirm home study & Salaah minutes.
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('home-tarbiyah')}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors shrink-0 flex items-center gap-1"
            >
              Sign & Log Tarbiyah <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Default Button for Parents to Politely Request Update from Teachers */}
          <div className="bg-linear-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-slate-900 text-sm">
                    Politely Request Update from Ustadh
                  </h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-900 border border-amber-300">
                    Email + App Notification
                  </span>
                </div>
                <p className="text-slate-600 text-[11px] mt-0.5">
                  Send a respectful Islamic inquiry to {selectedStudent.teacherName} regarding recitation focus, evening Dawr advice, or conduct.
                  {myStudentInquiries.length > 0 && (
                    <span className="text-amber-800 font-semibold ml-1.5">
                      ({myStudentInquiries.length} past inquir{myStudentInquiries.length > 1 ? 'ies' : 'y'})
                    </span>
                  )}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsParentRequestModalOpen(true)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all shrink-0"
            >
              <MessageSquareShare className="w-4 h-4" />
              <span>Request Ustadh Update</span>
            </button>
          </div>
        </div>
      )}

      {/* Child / Student View polite button */}
      {userRole === 'student' && (
        <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-3 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-700">
            <HeartHandshake className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Need advice or guidance from Ustadh on your Sabaq?</span>
          </div>
          <button
            type="button"
            onClick={() => setIsParentRequestModalOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors shrink-0"
          >
            <MessageSquareShare className="w-3.5 h-3.5" />
            <span>Send Question to Ustadh</span>
          </button>
        </div>
      )}

      {/* Islamic Merit Honor & Trophy Milestone Banner */}
      <div className="bg-gradient-to-r from-amber-50 via-emerald-50/40 to-teal-50 border border-amber-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-white flex items-center justify-center shadow-sm shrink-0">
              <Trophy className="w-6 h-6" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded-full border border-amber-300">
                  Madrasah Islamic Honor Tier
                </span>
                <span className="font-serif font-bold text-slate-900 text-base">
                  {meritData.currentTrophy.titleArabic}
                </span>
                <span className="text-xs font-bold text-slate-700">
                  • {meritData.currentTrophy.titleEnglish}
                </span>
                <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
                  ({meritData.currentTrophy.titleUrdu})
                </span>
              </div>

              <p className="text-xs text-slate-600 mt-1 line-clamp-1">
                {meritData.currentTrophy.description}
              </p>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-[11px] text-slate-500">
                <span>Total Merit: <strong className="text-slate-900">{meritData.totalPoints} pts</strong></span>
                <span>•</span>
                {meritData.nextTrophy ? (
                  <span className="text-emerald-800 font-medium">
                    Next: <strong>{meritData.nextTrophy.titleEnglish}</strong> ({meritData.pointsToNext} pts to unlock)
                  </span>
                ) : (
                  <span className="text-rose-700 font-bold">Highest Madrasah Tier Unlocked</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 self-end md:self-center w-full md:w-auto">
            {meritData.nextTrophy && (
              <div className="hidden lg:block w-36">
                <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                  <span>Tier Progress</span>
                  <span className="font-bold text-emerald-800">{meritData.progressPercent}%</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${meritData.progressPercent}%` }}
                  />
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => setIsTrophiesModalOpen(true)}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>View Trophy Cabinet</span>
            </button>
          </div>
        </div>
      </div>

      {/* The 4 Core Pillars of Hifz & Tarbiyah */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Pillar 1: Sabaq */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded">
              Sabaq (سبق)
            </span>
            <span className="text-[11px] text-slate-400 font-medium">New Lesson</span>
          </div>
          <div className="mt-1">
            <div className="text-2xl font-extrabold text-slate-900">
              {weeklySummary.totalSabaqPassed}
              <span className="text-sm font-normal text-slate-500"> / {weeklySummary.totalSabaqAttempted} passed</span>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              New portion to memorize daily. Current rate: <strong>1 page/day</strong>.
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Weekly Pass:</span>
            <span className="font-bold text-emerald-700">
              {weeklySummary.totalSabaqAttempted > 0
                ? `${Math.round((weeklySummary.totalSabaqPassed / weeklySummary.totalSabaqAttempted) * 100)}%`
                : '100%'}
            </span>
          </div>
        </div>

        {/* Pillar 2: Sabaq Para / Sabaqee */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-teal-800 uppercase tracking-wider bg-teal-50 px-2 py-0.5 rounded">
              Sabaq Para (سبقی)
            </span>
            <span className="text-[11px] text-slate-400 font-medium">Latest Juz Revision</span>
          </div>
          <div className="mt-1">
            <div className="text-2xl font-extrabold text-slate-900">
              {weeklySummary.totalSabaqParaPassed}
              <span className="text-sm font-normal text-slate-500"> / {weeklySummary.totalSabaqParaAttempted} passed</span>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Consolidating <strong>Juz 13</strong> before moving to next Juz.
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Retention:</span>
            <span className="font-bold text-teal-700">
              {weeklySummary.totalSabaqParaAttempted > 0
                ? `${Math.round((weeklySummary.totalSabaqParaPassed / weeklySummary.totalSabaqParaAttempted) * 100)}%`
                : '100%'}
            </span>
          </div>
        </div>

        {/* Pillar 3: Dawr / Manzil */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider bg-amber-50 px-2 py-0.5 rounded">
              Dawr / Manzil (دور)
            </span>
            <span className="text-[11px] text-slate-400 font-medium">Further Revision 1 & 2</span>
          </div>
          <div className="mt-1">
            <div className="text-2xl font-extrabold text-slate-900">
              {weeklySummary.totalDawrPassed}
              <span className="text-sm font-normal text-slate-500"> / {weeklySummary.totalDawrAttempted} passed</span>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Revising earlier Juz on cycle: <strong>Juz 5 through Juz 10</strong>.
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Consistency:</span>
            <span className="font-bold text-amber-700">
              {weeklySummary.totalDawrAttempted > 0
                ? `${Math.round((weeklySummary.totalDawrPassed / weeklySummary.totalDawrAttempted) * 100)}%`
                : '100%'}
            </span>
          </div>
        </div>

        {/* Pillar 4: Attendance & Tarbiyah */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-indigo-800 uppercase tracking-wider bg-indigo-50 px-2 py-0.5 rounded">
              Attendance & Tarbiyah
            </span>
            <span className="text-[11px] text-slate-400 font-medium">Class & Home</span>
          </div>
          <div className="mt-1">
            <div className="text-2xl font-extrabold text-slate-900">
              {weeklySummary.totalDaysPresent}
              <span className="text-sm font-normal text-slate-500"> / {weeklySummary.totalDaysPresent + weeklySummary.totalDaysAbsent} days</span>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              <strong>{weeklySummary.masjidPrayerCount}</strong> Salah in Masjid, <strong>{(weeklySummary.totalHomeStudyMins / 60).toFixed(1)}h</strong> home study.
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Spiritual Index:</span>
            <span className="font-bold text-indigo-700">{weeklySummary.tarbiyahScore}%</span>
          </div>
        </div>

      </div>

      {/* Middle Section: Today's Interactive Progress & Weekly Performance Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Today's Class Summary (Directly reflecting the daily log) */}
        {todayRecord ? (
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-xs uppercase">
                    {todayRecord.day}
                  </span>
                  <h3 className="font-bold text-slate-900 text-base">
                    Today's Memorization Progress
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Date: {formatUkDate(todayRecord.date)} • Attendance: <span className="font-semibold text-emerald-700 uppercase">{todayRecord.attendance}</span>
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('daily-hifz')}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 hover:underline"
              >
                Full 6-Day Log <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {/* Sabaq Row */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded">
                      Sabaq (New Lesson)
                    </span>
                    <span className="text-xs font-semibold text-slate-800">
                      {todayRecord.sabaq.amount || 'Not recorded yet'}
                    </span>
                  </div>
                  {todayRecord.sabaq.notes && (
                    <p className="text-xs text-slate-500 mt-1 italic">
                      "{todayRecord.sabaq.notes}"
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs text-slate-600">
                    Mistakes: <strong className="text-slate-900">{todayRecord.sabaq.mistakes}</strong>
                  </span>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1 ${
                    todayRecord.sabaq.taskPassed === true
                      ? 'bg-emerald-100 text-emerald-800'
                      : todayRecord.sabaq.taskPassed === false
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {todayRecord.sabaq.taskPassed === true ? <CheckCircle2 className="w-3.5 h-3.5" /> : todayRecord.sabaq.taskPassed === false ? <AlertCircle className="w-3.5 h-3.5" /> : null}
                    {todayRecord.sabaq.taskPassed === true ? 'Task Passed' : todayRecord.sabaq.taskPassed === false ? 'Needs Practice' : 'Pending Assessment'}
                  </span>
                </div>
              </div>

              {/* Sabaq Para Row */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-teal-800 bg-teal-100/70 px-2 py-0.5 rounded">
                      Sabaq Para (Sabaqee)
                    </span>
                    <span className="text-xs font-semibold text-slate-800">
                      {todayRecord.sabaqPara.amount || 'Not recorded yet'}
                    </span>
                  </div>
                  {todayRecord.sabaqPara.notes && (
                    <p className="text-xs text-slate-500 mt-1 italic">
                      "{todayRecord.sabaqPara.notes}"
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs text-slate-600">
                    Mistakes: <strong className="text-slate-900">{todayRecord.sabaqPara.mistakes}</strong>
                  </span>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1 ${
                    todayRecord.sabaqPara.taskPassed === true
                      ? 'bg-emerald-100 text-emerald-800'
                      : todayRecord.sabaqPara.taskPassed === false
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {todayRecord.sabaqPara.taskPassed === true ? <CheckCircle2 className="w-3.5 h-3.5" /> : todayRecord.sabaqPara.taskPassed === false ? <AlertCircle className="w-3.5 h-3.5" /> : null}
                    {todayRecord.sabaqPara.taskPassed === true ? 'Task Passed' : todayRecord.sabaqPara.taskPassed === false ? 'Needs Practice' : 'Pending Assessment'}
                  </span>
                </div>
              </div>

              {/* Dawr 1 & 2 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-amber-800">Further Revision 1 (Dawr 1)</span>
                    <span className={`px-2 py-0.5 rounded font-semibold text-[10px] ${
                      todayRecord.dawr1.taskPassed === true
                        ? 'bg-emerald-100 text-emerald-800'
                        : todayRecord.dawr1.taskPassed === false
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {todayRecord.dawr1.taskPassed === true ? 'Passed' : todayRecord.dawr1.taskPassed === false ? 'Needs Work' : 'Pending'}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-slate-700 font-medium">
                    {todayRecord.dawr1.amount || 'Not recorded yet'}
                  </div>
                  <div className="mt-1 text-[11px] text-slate-500">
                    Mistakes: <strong>{todayRecord.dawr1.mistakes}</strong> {todayRecord.dawr1.notes && `• ${todayRecord.dawr1.notes}`}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-amber-800">Further Revision 2 (Dawr 2)</span>
                    <span className={`px-2 py-0.5 rounded font-semibold text-[10px] ${
                      todayRecord.dawr2.taskPassed === true
                        ? 'bg-emerald-100 text-emerald-800'
                        : todayRecord.dawr2.taskPassed === false
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {todayRecord.dawr2.taskPassed === true ? 'Passed' : todayRecord.dawr2.taskPassed === false ? 'Needs Work' : 'Pending'}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-slate-700 font-medium">
                    {todayRecord.dawr2.amount || 'Not recorded yet'}
                  </div>
                  <div className="mt-1 text-[11px] text-slate-500">
                    Mistakes: <strong>{todayRecord.dawr2.mistakes}</strong> {todayRecord.dawr2.notes && `• ${todayRecord.dawr2.notes}`}
                  </div>
                </div>
              </div>

              {/* Teacher's Note & Parent Sign */}
              <div className="mt-3 p-3 bg-amber-50/70 border border-amber-200/70 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-bold text-amber-900">Ustadh Comments: </span>
                  <span className="text-amber-800">
                    {todayRecord.comments ? `"${todayRecord.comments}"` : 'No remarks recorded yet.'}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-slate-500 text-[11px]">Parent's Sign:</span>
                  {todayRecord.parentSigned ? (
                    <span className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 font-bold text-[11px] flex items-center gap-1 border border-emerald-300">
                      <CheckCircle2 className="w-3 h-3" /> Signed
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded bg-amber-100 text-amber-800 font-bold text-[11px] border border-amber-300">
                      Pending Sign
                    </span>
                  )}
                </div>
              </div>

            </div>
          </div>
        ) : (
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-8 shadow-2xs text-center flex flex-col items-center justify-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center">
              <BookOpen className="w-7 h-7" />
            </div>
            <div className="space-y-1 max-w-md">
              <h3 className="font-bold text-slate-900 text-base">
                No Recitation Logged Yet for {ukDate.formattedLongDate}
              </h3>
              <p className="text-xs text-slate-500">
                {userRole === 'teacher'
                  ? `Begin today's recitation session to log Sabaq, Sabaq Para, and Manzil for ${selectedStudent.name}.`
                  : `Recitation remarks for ${ukDate.formattedLongDate} have not been recorded yet by the Ustadh.`}
              </p>
            </div>
            {userRole === 'teacher' && (
              <button
                type="button"
                onClick={() => {
                  startTodayRecord();
                  setActiveTab('daily-hifz');
                }}
                className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs inline-flex items-center gap-2 shadow-sm transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Start Today's Record ({ukDate.dayOfWeek})</span>
              </button>
            )}
          </div>
        )}

        {/* Weekly Performance Evaluation Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Automated Evaluation
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                Live Analysis
              </span>
            </div>

            <div className="flex items-center gap-4 my-3">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex flex-col items-center justify-center font-extrabold shadow-sm shrink-0">
                <span className={weeklySummary.overallGrade === 'Not yet assessed' ? 'text-xl leading-none' : 'text-2xl leading-none'}>
                  {weeklySummary.overallGrade === 'Not yet assessed' ? '—' : weeklySummary.overallGrade}
                </span>
                <span className="text-[10px] font-medium opacity-80">
                  {weeklySummary.overallGrade === 'Not yet assessed' ? 'Pending' : 'Grade'}
                </span>
              </div>

              <div>
                <div className="text-lg font-bold text-slate-900">
                  {weeklySummary.overallGrade === 'Not yet assessed'
                    ? 'Pending Evaluation'
                    : `${weeklySummary.performanceScore} / 100`}
                </div>
                <p className="text-xs text-slate-500">
                  {weeklySummary.overallGrade === 'Not yet assessed' && 'No recitation records recorded yet this week.'}
                  {weeklySummary.overallGrade === 'A+' && 'Outstanding performance across Sabaq and Dawr.'}
                  {weeklySummary.overallGrade === 'A' && 'Strong progress with minor revision targets.'}
                  {weeklySummary.overallGrade === 'B' && 'Good effort; needs more home revision time.'}
                  {weeklySummary.overallGrade === 'C' && 'Needs reinforcement on tajweed and daily home revision.'}
                  {weeklySummary.overallGrade === 'Needs Attention' && 'Needs immediate focus on lesson retention.'}
                </p>
              </div>
            </div>

            {/* Breakdown Bars */}
            <div className="space-y-2.5 my-4 text-xs">
              {(() => {
                const sabaqPct = weeklySummary.totalSabaqAttempted > 0
                  ? Math.round((weeklySummary.totalSabaqPassed / weeklySummary.totalSabaqAttempted) * 100)
                  : null;
                const dawrPct = weeklySummary.totalDawrAttempted > 0
                  ? Math.round((weeklySummary.totalDawrPassed / weeklySummary.totalDawrAttempted) * 100)
                  : null;

                return (
                  <>
                    <div>
                      <div className="flex justify-between text-slate-600 mb-1">
                        <span>Sabaq Retention</span>
                        <span className="font-semibold text-slate-900">
                          {sabaqPct !== null ? `${sabaqPct}%` : 'Not assessed'}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-600 rounded-full transition-all"
                          style={{ width: `${sabaqPct ?? 0}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-600 mb-1">
                        <span>Dawr / Manzil Revision</span>
                        <span className="font-semibold text-slate-900">
                          {dawrPct !== null ? `${dawrPct}%` : 'Not assessed'}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-500 rounded-full transition-all"
                          style={{ width: `${dawrPct ?? 0}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-600 mb-1">
                        <span>Spiritual Tarbiyah Adherence</span>
                        <span className="font-semibold text-slate-900">{weeklySummary.tarbiyahScore}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-600 rounded-full transition-all"
                          style={{ width: `${weeklySummary.tarbiyahScore}%` }}
                        />
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Motivational Hadith Citation */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700">
              <div className="font-amiri text-sm text-emerald-800 text-right mb-1">
                خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ
              </div>
              <div className="italic text-slate-600">
                "The best of you is the one who learns the Qurʾān and teaches it."
              </div>
              <span className="block not-italic font-semibold text-slate-500 text-[10px] mt-1">
                — Ṣaḥīḥ al-Bukhārī, 5027
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('weekly-report')}
              className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
            >
              <Award className="w-3.5 h-3.5" />
              View Full Weekly Evaluation
            </button>
            <button
              type="button"
              onClick={triggerCelebration}
              className="p-2 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-800 transition-colors"
              title="Celebrate Good Work!"
            >
              <Flame className="w-4 h-4 text-emerald-700" />
            </button>
          </div>
        </div>

      </div>

      {/* Polite Parent Request Update Modal */}
      <ParentRequestUpdateModal
        isOpen={isParentRequestModalOpen}
        onClose={() => setIsParentRequestModalOpen(false)}
      />

      {/* Teacher Inquiries & Parent Question Review Modal */}
      <TeacherInquiriesModal
        isOpen={isTeacherInquiriesModalOpen}
        onClose={() => setIsTeacherInquiriesModalOpen(false)}
      />

      {/* Islamic Trophies & Merit Honor Cabinet Modal */}
      <IslamicTrophiesModal
        isOpen={isTrophiesModalOpen}
        onClose={() => setIsTrophiesModalOpen(false)}
        trophies={activeTrophies}
        meritData={meritData}
        studentName={selectedStudent.name}
      />

    </div>
  );
};
