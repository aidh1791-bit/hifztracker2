import React, { useState } from 'react';
import { useHifz } from '../context/HifzContext';
import {
  CheckCircle,
  XCircle,
  PenTool,
  Calendar,
  AlertTriangle,
  HelpCircle,
  Check,
  Plus,
  Minus,
  MessageSquare,
  ShieldAlert,
  BookOpen
} from 'lucide-react';
import { LessonProgress, DayOfWeek } from '../types';
import { getUkCurrentDate, formatUkDate } from '../utils/dateUtils';

export const DailyHifzLogView: React.FC = () => {
  const {
    selectedStudent,
    currentHifzRecords,
    startTodayRecord,
    userRole,
    weeklySummary,
    updateHifzLesson,
    updateTeacherComment,
    signAsParent,
    signAsTeacher
  } = useHifz();

  const [activeEditingDay, setActiveEditingDay] = useState<string | null>(null);
  const [showHelperModal, setShowHelperModal] = useState(false);

  const ukDate = getUkCurrentDate();
  const hasTodayRecord = currentHifzRecords.some(r => r.date === ukDate.dateString || r.day === ukDate.dayOfWeek);

  // Helper to render interactive lesson column cell
  const renderLessonCell = (
    recordId: string,
    category: 'sabaq' | 'sabaqPara' | 'dawr1' | 'dawr2',
    data: LessonProgress,
    title: string
  ) => {
    const isTeacher = userRole === 'teacher';

    return (
      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 flex flex-col justify-between h-full">
        <div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>{title}</span>
            {data.taskPassed !== null && (
              <span
                className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                  data.taskPassed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}
              >
                {data.taskPassed ? 'Passed' : 'Not Passed'}
              </span>
            )}
          </div>

          {/* Amount field */}
          {isTeacher ? (
            <input
              type="text"
              aria-label={`${title} portion`}
              value={data.amount}
              onChange={(e) => updateHifzLesson(recordId, category, { amount: e.target.value })}
              placeholder="e.g. Surah Maryam v.1-15"
              className="w-full text-xs font-semibold text-slate-900 bg-white border border-slate-300 rounded px-2 py-1 focus:ring-1 focus:ring-emerald-500 focus:outline-none mb-2"
            />
          ) : (
            <div className="text-xs font-semibold text-slate-900 mb-2 truncate">
              {data.amount || <span className="text-slate-400 font-normal italic">Not recorded</span>}
            </div>
          )}
        </div>

        {/* Mistakes counter and Pass/Fail buttons */}
        <div className="space-y-1.5 pt-1.5 border-t border-slate-200/60">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[11px] text-slate-500 font-medium">No. Mistakes:</span>
            {isTeacher ? (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  aria-label="Decrease mistakes"
                  onClick={() => updateHifzLesson(recordId, category, { mistakes: Math.max(0, data.mistakes - 1) })}
                  className="w-5 h-5 rounded bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-slate-700 font-bold"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="w-6 text-center font-bold text-slate-800 text-xs">
                  {data.mistakes}
                </span>
                <button
                  type="button"
                  aria-label="Increase mistakes"
                  onClick={() => updateHifzLesson(recordId, category, { mistakes: data.mistakes + 1 })}
                  className="w-5 h-5 rounded bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-slate-700 font-bold"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <span className="font-bold text-slate-800 text-xs px-1.5 py-0.5 rounded bg-slate-200/80">
                {data.mistakes}
              </span>
            )}
          </div>

          {/* Task Passed: Yes / No buttons (Matches Image 1: "Task Passed: Yes / No") */}
          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-[10px] text-slate-500">Passed:</span>
            {isTeacher ? (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => updateHifzLesson(recordId, category, { taskPassed: true })}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                    data.taskPassed === true
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'bg-slate-200 text-slate-700 hover:bg-emerald-100 hover:text-emerald-800'
                  }`}
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => updateHifzLesson(recordId, category, { taskPassed: false })}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                    data.taskPassed === false
                      ? 'bg-rose-600 text-white shadow-2xs'
                      : 'bg-slate-200 text-slate-700 hover:bg-rose-100 hover:text-rose-800'
                  }`}
                >
                  No
                </button>
              </div>
            ) : (
              <span className={`text-[11px] font-bold ${
                data.taskPassed === true ? 'text-emerald-700' : data.taskPassed === false ? 'text-rose-600' : 'text-slate-400'
              }`}>
                {data.taskPassed === true ? 'Yes' : data.taskPassed === false ? 'No' : '—'}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Header Info Sheet Bar (Replicating header of Image 1) */}
      <div className="bg-white rounded-2xl border border-slate-300 p-4 sm:p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4 mb-4">
          
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider bg-emerald-800 text-white px-2.5 py-0.5 rounded">
                Logbook Sheet 1
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                Daily Hifz & Revision Record
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              Direct digital counterpart of the official physical Madrasah syllabus logbook.
            </p>
          </div>

          {/* Week Commencing & Current Juz/Surah boxes */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="bg-slate-100 border border-slate-300 rounded-lg px-3 py-2">
              <span className="text-slate-500 block text-[10px] font-semibold uppercase">Week Commencing</span>
              <span className="font-bold text-slate-800 text-sm">
                {currentHifzRecords.length > 0 ? formatUkDate(currentHifzRecords[0].date) : ukDate.formattedDate}
              </span>
            </div>

            <div className="bg-emerald-50 border border-emerald-300 rounded-lg px-3 py-2">
              <span className="text-emerald-700 block text-[10px] font-semibold uppercase">Current Juz / Surah</span>
              <span className="font-bold text-emerald-900 text-sm">
                Juz {selectedStudent.currentJuz} • {selectedStudent.currentSurah}
              </span>
            </div>

            {userRole === 'teacher' && !hasTodayRecord && (
              <button
                type="button"
                onClick={() => startTodayRecord()}
                className="px-3 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Start Today ({ukDate.dayOfWeek})</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowHelperModal(true)}
              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
              title="Terminology Guide (Sabaq, Sabaq Para, Dawr)"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Terminology Banner Guide */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0" />
            <span><strong className="text-slate-900">Sabaq:</strong> New lesson portion</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-600 shrink-0" />
            <span><strong className="text-slate-900">Sabaq Para / Sabaqee:</strong> Latest Juz</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
            <span><strong className="text-slate-900">Further Revision 1:</strong> Dawr / Manzil</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shrink-0" />
            <span><strong className="text-slate-900">Further Revision 2:</strong> Dawr / Manzil</span>
          </div>
        </div>
      </div>

      {/* Main Table / Card Grid of the Days */}
      {currentHifzRecords.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center flex flex-col items-center justify-center space-y-4 shadow-2xs">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center">
            <BookOpen className="w-8 h-8" />
          </div>
          <div className="space-y-1 max-w-md">
            <h3 className="font-bold text-slate-900 text-lg">
              No Recitation Records Yet
            </h3>
            <p className="text-xs text-slate-500">
              {userRole === 'teacher'
                ? `Start a fresh record for ${selectedStudent.name} for today (${ukDate.dayOfWeek}, ${ukDate.formattedDate}) to begin tracking Sabaq, Sabaq Para, and Dawr.`
                : `No recitation records have been logged yet for ${selectedStudent.name}. Records will appear here as the Ustadh logs class sessions.`}
            </p>
          </div>
          {userRole === 'teacher' && (
            <button
              type="button"
              onClick={() => startTodayRecord()}
              className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs inline-flex items-center gap-2 shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Start Today's Record ({ukDate.dayOfWeek})</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {currentHifzRecords.map((record) => {
            const isToday = record.date === ukDate.dateString || record.day === ukDate.dayOfWeek;

          return (
            <div
              key={record.id}
              className={`bg-white rounded-2xl border transition-all duration-200 shadow-2xs overflow-hidden ${
                isToday
                  ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                  : 'border-slate-300 hover:border-slate-400'
              }`}
            >
              {/* Day Header Bar */}
              <div className="bg-slate-100/80 px-4 py-2.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-0.5 rounded-md font-bold text-xs ${
                    isToday ? 'bg-emerald-700 text-white' : 'bg-slate-800 text-white'
                  }`}>
                    {record.day}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    {record.date}
                  </span>
                  {isToday && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold animate-pulse">
                      Today's Class
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <span className="text-slate-500">Attendance:</span>
                  <span className={`px-2 py-0.5 rounded font-bold uppercase text-[11px] ${
                    record.attendance === 'present'
                      ? 'bg-emerald-100 text-emerald-800'
                      : record.attendance === 'late'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}>
                    {record.attendance}
                  </span>
                </div>
              </div>

              {/* The 4 Columns from the Image */}
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Column 1: Sabaq */}
                {renderLessonCell(
                  record.id,
                  'sabaq',
                  record.sabaq,
                  'New Lesson / Portion to Memorise (Sabaq)'
                )}

                {/* Column 2: Sabaq Para / Sabaqee */}
                {renderLessonCell(
                  record.id,
                  'sabaqPara',
                  record.sabaqPara,
                  'Latest Juz Revision (Sabaq Para)'
                )}

                {/* Column 3: Further Revision 1 */}
                {renderLessonCell(
                  record.id,
                  'dawr1',
                  record.dawr1,
                  'Further Revision 1 (Dawr / Manzil)'
                )}

                {/* Column 4: Further Revision 2 */}
                {renderLessonCell(
                  record.id,
                  'dawr2',
                  record.dawr2,
                  'Further Revision 2 (Dawr / Manzil)'
                )}
              </div>

              {/* Comments & Parent Signature Row (Exact to Image 1) */}
              <div className="bg-slate-50/70 border-t border-slate-200 px-4 py-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                
                {/* Comments box */}
                <div className="w-full md:w-2/3 flex items-start gap-2">
                  <MessageSquare className="w-4 h-4 text-slate-400 mt-1 shrink-0" />
                  <div className="w-full">
                    <span className="text-[11px] font-bold text-slate-600 block">Comments:</span>
                    {userRole === 'teacher' ? (
                      <input
                        type="text"
                        aria-label="Teacher comments"
                        value={record.comments}
                        onChange={(e) => updateTeacherComment(record.id, e.target.value)}
                        placeholder="Teacher's evaluation, Tajweed advice, or Mutashabihat warnings..."
                        className="w-full text-xs text-slate-800 bg-white border border-slate-300 rounded px-2.5 py-1 focus:ring-1 focus:ring-emerald-500 focus:outline-none mt-0.5"
                      />
                    ) : (
                      <p className="text-xs text-slate-700 italic mt-0.5">
                        {record.comments || <span className="text-slate-400 font-normal">No teacher comments recorded yet.</span>}
                      </p>
                    )}
                  </div>
                </div>

                {/* Parent's Sign box */}
                <div className="w-full md:w-auto flex items-center justify-between md:justify-end gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-slate-200">
                  <div className="text-left md:text-right">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Parent's Sign</span>
                    {record.parentSigned ? (
                      <span className="text-[11px] text-slate-500">
                        {record.parentSignDate || 'Verified'}
                      </span>
                    ) : (
                      <span className="text-[11px] text-amber-700 font-medium">
                        Awaiting signature
                      </span>
                    )}
                  </div>

                  {userRole === 'parent' ? (
                    <button
                      type="button"
                      onClick={() => signAsParent(record.id)}
                      disabled={record.parentSigned}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                        record.parentSigned
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 cursor-default'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                      }`}
                    >
                      <PenTool className="w-3.5 h-3.5" />
                      {record.parentSigned ? 'Signed & Approved' : 'Sign as Parent'}
                    </button>
                  ) : (
                    <div className="shrink-0">
                      {record.parentSigned ? (
                        <span className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-1 border border-emerald-300">
                          <Check className="w-3.5 h-3.5" /> Signed
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded bg-slate-200 text-slate-600 font-medium text-xs">
                          Unsigned
                        </span>
                      )}
                    </div>
                  )}
                </div>

              </div>

            </div>
          );
        })}
      </div>
      )}

      {/* Official Weekly Summary Box (Bottom of Image 1) */}
      <div className="bg-white rounded-2xl border-2 border-slate-300 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-3 h-3 rounded bg-slate-900" />
          <h3 className="font-bold text-slate-900 text-base uppercase tracking-tight">
            Weekly Summary (Weekly Evaluation Matrix)
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Box 1: Total New Amount Memorised */}
          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200">
            <span className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
              Total New Amount Memorised
            </span>
            <div className="text-lg font-extrabold text-slate-900">
              {weeklySummary.totalSabaqPassed} Pages
            </div>
            <div className="mt-2 text-xs text-slate-600 flex justify-between">
              <span>Total Tasks Passed:</span>
              <strong className="text-emerald-700">{weeklySummary.totalSabaqPassed} / {weeklySummary.totalSabaqAttempted}</strong>
            </div>
          </div>

          {/* Box 2: Total Amount of Latest Juz Revision */}
          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200">
            <span className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
              Total Latest Juz Revision (Sabaqee)
            </span>
            <div className="text-lg font-extrabold text-slate-900">
              Juz 13 Complete
            </div>
            <div className="mt-2 text-xs text-slate-600 flex justify-between">
              <span>Total Tasks Passed:</span>
              <strong className="text-teal-700">{weeklySummary.totalSabaqParaPassed} / {weeklySummary.totalSabaqParaAttempted}</strong>
            </div>
          </div>

          {/* Box 3: Total Amount of Further Revision */}
          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200">
            <span className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
              Total Further Revision (Dawr)
            </span>
            <div className="text-lg font-extrabold text-slate-900">
              {weeklySummary.totalDawrPassed} Half-Juz Cycles
            </div>
            <div className="mt-2 text-xs text-slate-600 flex justify-between">
              <span>Total Tasks Passed:</span>
              <strong className="text-amber-700">{weeklySummary.totalDawrPassed} / {weeklySummary.totalDawrAttempted}</strong>
            </div>
          </div>

          {/* Box 4: Total Days Absent & Parent's Sign */}
          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                Total Days Absent
              </span>
              <div className="text-lg font-extrabold text-slate-900">
                {weeklySummary.totalDaysAbsent} Days
              </div>
            </div>

            <div className="mt-2 pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Parent's Sign:</span>
              <span className="font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                Verified (T. Khan)
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* Terminology Modal */}
      {showHelperModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-emerald-600" />
              Madrasah Hifz Terminology Guide
            </h3>
            <div className="space-y-3 text-xs text-slate-700 my-4">
              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200">
                <strong className="text-emerald-900 block text-sm">1. Sabaq (سبق) — New Lesson</strong>
                The fresh portion assigned by the teacher to be newly memorized and recited with flawless Tajweed each day.
              </div>
              <div className="p-2.5 rounded-lg bg-teal-50 border border-teal-200">
                <strong className="text-teal-900 block text-sm">2. Sabaq Para / Sabaqee (سبقی) — Latest Juz Revision</strong>
                Revision of recently memorized lessons from the current or most recent Juz, preventing new pages from slipping.
              </div>
              <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200">
                <strong className="text-amber-900 block text-sm">3. Dawr / Manzil (دور / منزل) — Further Revision</strong>
                Long-term cyclical revision of all previous completed Juz to retain permanent memorization and master Mutashabihat.
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowHelperModal(false)}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold text-xs"
            >
              Got it
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
