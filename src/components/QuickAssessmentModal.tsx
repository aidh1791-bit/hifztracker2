import React, { useState, useEffect, useCallback } from 'react';
import { useHifz } from '../context/HifzContext';
import confetti from 'canvas-confetti';
import {
  X,
  BookOpen,
  Plus,
  Minus,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Users,
  Award,
  ArrowRight,
  Clock,
  RotateCcw,
  Check
} from 'lucide-react';
import { AttendanceStatus } from '../types';
import { getUkCurrentDate } from '../utils/dateUtils';

interface QuickAssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickAssessmentModal: React.FC<QuickAssessmentModalProps> = ({ isOpen, onClose }) => {
  const {
    students,
    visibleStudents,
    selectedStudent,
    setSelectedStudentId,
    currentHifzRecords,
    startTodayRecord,
    updateHifzLesson,
    updateTeacherComment,
    updateAttendance,
    adminSettings
  } = useHifz();

  const ukDate = getUkCurrentDate();

  // Find students in current teacher's circle or visible set
  const queueStudents = visibleStudents.length > 0 ? visibleStudents : students;
  const currentStudentIndex = queueStudents.findIndex(s => s.id === selectedStudent.id);
  const safeIndex = currentStudentIndex >= 0 ? currentStudentIndex : 0;

  // Track session-assessed student IDs
  const [assessedStudentIds, setAssessedStudentIds] = useState<Set<string>>(new Set());

  // Active student's today record from currentHifzRecords
  const todayRecord = currentHifzRecords.find(r => r.date === ukDate.dateString || r.day === ukDate.dayOfWeek);

  // Form states for active student
  const [sabaqAmount, setSabaqAmount] = useState('');
  const [sabaqMistakes, setSabaqMistakes] = useState(0);
  const [sabaqPassed, setSabaqPassed] = useState<boolean | null>(true);

  const [sabaqParaAmount, setSabaqParaAmount] = useState('');
  const [sabaqParaMistakes, setSabaqParaMistakes] = useState(0);
  const [sabaqParaPassed, setSabaqParaPassed] = useState<boolean | null>(true);

  const [dawrAmount, setDawrAmount] = useState('');
  const [dawrMistakes, setDawrMistakes] = useState(0);
  const [dawrPassed, setDawrPassed] = useState<boolean | null>(true);

  const [attendance, setAttendance] = useState<AttendanceStatus>('present');
  const [comments, setComments] = useState('');
  const [isHalqaCompleted, setIsHalqaCompleted] = useState(false);
  const [savedSuccessFlash, setSavedSuccessFlash] = useState<string | null>(null);

  // Sync form state when active student or today's record changes
  useEffect(() => {
    if (todayRecord) {
      setSabaqAmount(todayRecord.sabaq?.amount || '');
      setSabaqMistakes(todayRecord.sabaq?.mistakes || 0);
      setSabaqPassed(todayRecord.sabaq?.taskPassed !== undefined ? todayRecord.sabaq.taskPassed : true);

      setSabaqParaAmount(todayRecord.sabaqPara?.amount || '');
      setSabaqParaMistakes(todayRecord.sabaqPara?.mistakes || 0);
      setSabaqParaPassed(todayRecord.sabaqPara?.taskPassed !== undefined ? todayRecord.sabaqPara.taskPassed : true);

      if (todayRecord.dawr1) {
        setDawrAmount(todayRecord.dawr1.amount || '');
        setDawrMistakes(todayRecord.dawr1.mistakes || 0);
        setDawrPassed(todayRecord.dawr1.taskPassed !== undefined ? todayRecord.dawr1.taskPassed : true);
      } else {
        setDawrAmount('');
        setDawrMistakes(0);
        setDawrPassed(true);
      }

      setAttendance(todayRecord.attendance || 'present');
      setComments(todayRecord.comments || '');

      if (todayRecord.sabaq?.taskPassed !== undefined || todayRecord.sabaq?.amount) {
        setAssessedStudentIds(prev => new Set([...prev, selectedStudent.id]));
      }
    } else {
      // Auto pre-populate defaults for rapid marking
      setSabaqAmount(`Surah ${selectedStudent.currentSurah || 'Al-Baqarah'}`);
      setSabaqMistakes(0);
      setSabaqPassed(true);

      setSabaqParaAmount(`Juz ${selectedStudent.currentJuz || 1} (Quarter 1-2)`);
      setSabaqParaMistakes(0);
      setSabaqParaPassed(true);

      setDawrAmount(`Juz ${Math.max(1, (selectedStudent.currentJuz || 2) - 1)}`);
      setDawrMistakes(0);
      setDawrPassed(true);

      setAttendance('present');
      setComments('');
    }
  }, [selectedStudent.id, todayRecord?.id, ukDate.dateString]);

  const completedCount = assessedStudentIds.size;
  const totalCount = queueStudents.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Save current student's recitation
  const saveCurrentStudent = useCallback((): boolean => {
    let rec = todayRecord;
    if (!rec) {
      rec = startTodayRecord(selectedStudent.id);
    }

    if (rec) {
      updateHifzLesson(rec.id, 'sabaq', {
        amount: sabaqAmount,
        mistakes: sabaqMistakes,
        taskPassed: sabaqPassed ?? true
      });

      updateHifzLesson(rec.id, 'sabaqPara', {
        amount: sabaqParaAmount,
        mistakes: sabaqParaMistakes,
        taskPassed: sabaqParaPassed ?? true
      });

      if (dawrAmount) {
        updateHifzLesson(rec.id, 'dawr1', {
          amount: dawrAmount,
          mistakes: dawrMistakes,
          taskPassed: dawrPassed ?? true
        });
      }

      updateAttendance(rec.id, attendance);

      if (comments) {
        updateTeacherComment(rec.id, comments);
      }

      setAssessedStudentIds(prev => new Set([...prev, selectedStudent.id]));

      if (sabaqPassed && sabaqParaPassed) {
        confetti({
          particleCount: 40,
          spread: 45,
          origin: { y: 0.7 }
        });
      }

      return true;
    }
    return false;
  }, [
    todayRecord,
    selectedStudent.id,
    startTodayRecord,
    updateHifzLesson,
    sabaqAmount,
    sabaqMistakes,
    sabaqPassed,
    sabaqParaAmount,
    sabaqParaMistakes,
    sabaqParaPassed,
    dawrAmount,
    dawrMistakes,
    dawrPassed,
    updateAttendance,
    attendance,
    comments,
    updateTeacherComment
  ]);

  // Navigate to Next Student or Complete
  const handleSaveAndNext = () => {
    saveCurrentStudent();
    setSavedSuccessFlash(`Saved ${selectedStudent.name}!`);
    setTimeout(() => setSavedSuccessFlash(null), 1800);

    // Look for next unassessed student or next index
    const nextUnassessed = queueStudents.findIndex((s, idx) => idx > safeIndex && !assessedStudentIds.has(s.id));
    if (nextUnassessed !== -1) {
      const nextStudent = queueStudents[nextUnassessed];
      setSelectedStudentId(nextStudent.id);
      startTodayRecord(nextStudent.id);
    } else if (safeIndex < queueStudents.length - 1) {
      const nextStudent = queueStudents[safeIndex + 1];
      setSelectedStudentId(nextStudent.id);
      startTodayRecord(nextStudent.id);
    } else {
      // Reached the end of the list
      if (completedCount + 1 >= totalCount) {
        setIsHalqaCompleted(true);
      } else {
        // Find any remaining unassessed student in the beginning
        const remaining = queueStudents.findIndex(s => !assessedStudentIds.has(s.id) && s.id !== selectedStudent.id);
        if (remaining !== -1) {
          const nextStudent = queueStudents[remaining];
          setSelectedStudentId(nextStudent.id);
          startTodayRecord(nextStudent.id);
        } else {
          setIsHalqaCompleted(true);
        }
      }
    }
  };

  const handleSkipNext = () => {
    if (safeIndex < queueStudents.length - 1) {
      const nextStudent = queueStudents[safeIndex + 1];
      setSelectedStudentId(nextStudent.id);
      startTodayRecord(nextStudent.id);
    }
  };

  const handlePrevious = () => {
    if (safeIndex > 0) {
      const prevStudent = queueStudents[safeIndex - 1];
      setSelectedStudentId(prevStudent.id);
      startTodayRecord(prevStudent.id);
    }
  };

  // Keyboard shortcut: Cmd/Ctrl + Enter to Save & Next
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSaveAndNext();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleSaveAndNext]);

  if (!isOpen) return null;

  // Completion screen when all students in Halqa have been graded
  if (isHalqaCompleted) {
    return (
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
        <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 text-center space-y-5">
          <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto shadow-md">
            <Award className="w-9 h-9" />
          </div>
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
              Halqa Recitation Completed
            </span>
            <h3 className="text-2xl font-black text-slate-900 mt-2">
              Masha'Allah! Circle Assessment Complete
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-md mx-auto">
              All <strong>{totalCount} students</strong> in this circle have been assessed for <strong>{ukDate.formattedDate}</strong>. Results are automatically recorded and queued for Cloud SQL sync.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 py-2">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-xs text-slate-500 font-medium block">Total Assessed</span>
              <span className="text-xl font-black text-slate-900">{totalCount} / {totalCount}</span>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
              <span className="text-xs text-emerald-700 font-medium block">Circle Attendance</span>
              <span className="text-xl font-black text-emerald-900">100%</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsHalqaCompleted(false)}
              className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Review Students</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 active:scale-95 text-white text-xs font-black shadow-md transition-all flex items-center gap-1.5"
            >
              <span>Done & Close</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  const quickFeedbackChips = [
    '✨ Mumtaz Recitation (Clear Makharij)',
    '🔔 Mind Ghunnah & Ikhfa Rules',
    '⏱️ Fluent Pace & Flow',
    '📖 Extra Parent Practice Needed',
    '⚠️ Repeat Sabaq Tomorrow'
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-4 sm:p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[92vh] flex flex-col">
        
        {/* Header with Circle Progress Bar */}
        <div className="border-b border-slate-100 pb-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                "Today" Fast Classroom Flow
              </span>
              <span className="text-xs text-slate-500 font-semibold">
                {ukDate.formattedDate} ({ukDate.dayOfWeek})
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center justify-between text-xs font-bold text-slate-800">
            <span>
              Student {safeIndex + 1} of {totalCount}: <span className="text-emerald-800">{selectedStudent.name}</span>
            </span>
            <span className="text-[11px] text-slate-500 font-mono">
              {completedCount} of {totalCount} Assessed ({progressPercent}%)
            </span>
          </div>

          {/* Linear Progress Bar */}
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Student Carousel Queue */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
            {queueStudents.map((s, idx) => {
              const isCurrent = s.id === selectedStudent.id;
              const isAssessed = assessedStudentIds.has(s.id);

              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    setSelectedStudentId(s.id);
                    startTodayRecord(s.id);
                  }}
                  className={`px-2.5 py-1 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all shrink-0 ${
                    isCurrent
                      ? 'bg-emerald-800 text-white shadow-xs ring-2 ring-emerald-400'
                      : isAssessed
                      ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {isAssessed ? (
                    <CheckCircle2 className={`w-3.5 h-3.5 ${isCurrent ? 'text-white' : 'text-emerald-600'}`} />
                  ) : (
                    <span className="w-3.5 h-3.5 rounded-full border border-slate-300 flex items-center justify-center text-[9px] font-bold">
                      {idx + 1}
                    </span>
                  )}
                  <span>{s.name.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
          
          {/* Active Student Info & Attendance Selector */}
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 text-emerald-800 flex items-center justify-center font-black text-sm shadow-xs">
                {selectedStudent.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-slate-900">{selectedStudent.name}</h4>
                  <span className="text-[10px] font-mono bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-bold">
                    {selectedStudent.rollNumber}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Current: Juz {selectedStudent.currentJuz} • Surah {selectedStudent.currentSurah || 'Al-Baqarah'} • Circle {selectedStudent.circleCode}
                </p>
              </div>
            </div>

            {/* Attendance Toggle */}
            <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 shrink-0">
              {(['present', 'late', 'absent'] as AttendanceStatus[]).map((att) => (
                <button
                  key={att}
                  type="button"
                  onClick={() => setAttendance(att)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold capitalize transition-all ${
                    attendance === att
                      ? att === 'present'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : att === 'late'
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'bg-rose-600 text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {att}
                </button>
              ))}
            </div>
          </div>

          {savedSuccessFlash && (
            <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-900 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>{savedSuccessFlash}</span>
            </div>
          )}

          {/* SECTION 1: SABAQ (NEW LESSON) */}
          <div className="p-3.5 rounded-2xl bg-white border-2 border-emerald-200/80 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-emerald-950 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px]">
                  1
                </span>
                <span>Sabaq (New Lesson)</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  setSabaqMistakes(0);
                  setSabaqPassed(true);
                }}
                className="text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded-lg transition-colors"
              >
                0 Mistakes (Mumtaz)
              </button>
            </div>

            <input
              type="text"
              aria-label="Sabaq Lesson Portion"
              value={sabaqAmount}
              onChange={(e) => setSabaqAmount(e.target.value)}
              placeholder="e.g. Surah Maryam v.1 - 25"
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl p-2 font-medium focus:bg-white focus:outline-none focus:border-emerald-600"
            />

            <div className="flex items-center justify-between pt-1 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-600 font-medium">Mistakes:</span>
                <button
                  type="button"
                  onClick={() => setSabaqMistakes(Math.max(0, sabaqMistakes - 1))}
                  className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center justify-center font-bold"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className={`w-7 text-center font-black ${sabaqMistakes > 2 ? 'text-rose-600' : 'text-slate-900'}`}>
                  {sabaqMistakes}
                </span>
                <button
                  type="button"
                  onClick={() => setSabaqMistakes(sabaqMistakes + 1)}
                  className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center justify-center font-bold"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setSabaqPassed(true)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    sabaqPassed === true ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  Passed ✓
                </button>
                <button
                  type="button"
                  onClick={() => setSabaqPassed(false)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    sabaqPassed === false ? 'bg-rose-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  Needs Repeat ✕
                </button>
              </div>
            </div>
          </div>

          {/* SECTION 2: SABAQ PARA (LATEST JUZ REVISION) */}
          <div className="p-3.5 rounded-2xl bg-white border border-teal-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-teal-950 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center text-[10px]">
                  2
                </span>
                <span>Sabaq Para (Latest Juz Revision)</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  setSabaqParaMistakes(0);
                  setSabaqParaPassed(true);
                }}
                className="text-[11px] font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 px-2 py-0.5 rounded-lg transition-colors"
              >
                0 Mistakes (Mumtaz)
              </button>
            </div>

            <input
              type="text"
              aria-label="Sabaq Para Portion"
              value={sabaqParaAmount}
              onChange={(e) => setSabaqParaAmount(e.target.value)}
              placeholder="e.g. Juz 13 (Pages 1 - 5)"
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl p-2 font-medium focus:bg-white focus:outline-none focus:border-teal-600"
            />

            <div className="flex items-center justify-between pt-1 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-600 font-medium">Mistakes:</span>
                <button
                  type="button"
                  onClick={() => setSabaqParaMistakes(Math.max(0, sabaqParaMistakes - 1))}
                  className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center justify-center font-bold"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className={`w-7 text-center font-black ${sabaqParaMistakes > 2 ? 'text-rose-600' : 'text-slate-900'}`}>
                  {sabaqParaMistakes}
                </span>
                <button
                  type="button"
                  onClick={() => setSabaqParaMistakes(sabaqParaMistakes + 1)}
                  className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center justify-center font-bold"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setSabaqParaPassed(true)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    sabaqParaPassed === true ? 'bg-teal-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  Passed ✓
                </button>
                <button
                  type="button"
                  onClick={() => setSabaqParaPassed(false)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    sabaqParaPassed === false ? 'bg-rose-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  Needs Repeat ✕
                </button>
              </div>
            </div>
          </div>

          {/* SECTION 3: DAWR / MANZIL (OLDER REVISION) */}
          <div className="p-3.5 rounded-2xl bg-white border border-blue-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-blue-950 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center text-[10px]">
                  3
                </span>
                <span>Dawr / Manzil (Old Memorization)</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  setDawrMistakes(0);
                  setDawrPassed(true);
                }}
                className="text-[11px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded-lg transition-colors"
              >
                0 Mistakes (Mumtaz)
              </button>
            </div>

            <input
              type="text"
              aria-label="Dawr Portion"
              value={dawrAmount}
              onChange={(e) => setDawrAmount(e.target.value)}
              placeholder="e.g. Juz 2 (Quarter 1-4)"
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl p-2 font-medium focus:bg-white focus:outline-none focus:border-blue-600"
            />

            <div className="flex items-center justify-between pt-1 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-600 font-medium">Mistakes:</span>
                <button
                  type="button"
                  onClick={() => setDawrMistakes(Math.max(0, dawrMistakes - 1))}
                  className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center justify-center font-bold"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className={`w-7 text-center font-black ${dawrMistakes > 2 ? 'text-rose-600' : 'text-slate-900'}`}>
                  {dawrMistakes}
                </span>
                <button
                  type="button"
                  onClick={() => setDawrMistakes(dawrMistakes + 1)}
                  className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center justify-center font-bold"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setDawrPassed(true)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    dawrPassed === true ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  Passed ✓
                </button>
                <button
                  type="button"
                  onClick={() => setDawrPassed(false)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    dawrPassed === false ? 'bg-rose-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  Needs Repeat ✕
                </button>
              </div>
            </div>
          </div>

          {/* Quick Feedback Chips */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-700 block">
              Quick Ustadh Tajweed Feedback:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {quickFeedbackChips.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => {
                    setComments((prev) => (prev ? `${prev}. ${chip}` : chip));
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-950 text-[11px] font-medium border border-slate-200 transition-colors"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

          {/* Ustadh Comment Input */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Ustadh Feedback for Student & Parents:
            </label>
            <input
              type="text"
              aria-label="Ustadh comments"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="e.g. Beautiful recitation today, revise Madd Asli tonight..."
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl p-2.5 focus:bg-white focus:outline-none focus:border-emerald-600"
            />
          </div>

        </div>

        {/* Footer with "Save & Next" Flow */}
        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
            <button
              type="button"
              disabled={safeIndex <= 0}
              onClick={handlePrevious}
              className="px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl disabled:opacity-30 transition-colors flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>
            <button
              type="button"
              onClick={handleSkipNext}
              className="px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors flex items-center gap-1"
            >
              <span>Skip</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => {
                saveCurrentStudent();
                onClose();
              }}
              className="flex-1 sm:flex-none px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 border border-slate-300 rounded-xl transition-colors"
            >
              Save & Close
            </button>

            {/* The Main "Save & Next" Button */}
            <button
              type="button"
              onClick={handleSaveAndNext}
              className="flex-1 sm:flex-none px-6 py-2.5 text-xs font-black bg-emerald-800 hover:bg-emerald-900 active:scale-95 text-white rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
              title="Save current recitation and immediately jump to next student in Halqa (Cmd+Enter)"
            >
              <Sparkles className="w-4 h-4 text-emerald-300" />
              <span>Save & Next Student</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
