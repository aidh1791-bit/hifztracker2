import React, { useState } from 'react';
import {
  Student,
  DailyHifzRecord,
  DailyHomeLearningRecord,
  DailyTarbiyahRecord,
  WeeklyEvaluationRecord
} from '../types';
import {
  AlertTriangle,
  Download,
  Trash2,
  X,
  BookOpen,
  CheckCircle2,
  Calendar,
  ShieldAlert,
  FileSpreadsheet
} from 'lucide-react';
import { downloadBlobFile } from '../utils/exportHelpers';

interface SafeDeleteStudentModalProps {
  isOpen: boolean;
  student: Student | null;
  onClose: () => void;
  onConfirmDelete: (studentId: string) => Promise<void> | void;
  hifzRecords?: DailyHifzRecord[];
  homeLearning?: DailyHomeLearningRecord[];
  tarbiyah?: DailyTarbiyahRecord[];
  evaluation?: WeeklyEvaluationRecord;
}

export const SafeDeleteStudentModal: React.FC<SafeDeleteStudentModalProps> = ({
  isOpen,
  student,
  onClose,
  onConfirmDelete,
  hifzRecords = [],
  homeLearning = [],
  tarbiyah = [],
  evaluation
}) => {
  const [confirmInput, setConfirmInput] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [archiveDownloaded, setArchiveDownloaded] = useState(false);

  if (!isOpen || !student) return null;

  const totalSabaqPassed = hifzRecords.filter(r => r.sabaq?.taskPassed).length;
  const totalDaysLogged = hifzRecords.length;
  const presentDays = hifzRecords.filter(r => r.attendance === 'present').length;
  const attendanceRate = totalDaysLogged > 0 ? Math.round((presentDays / totalDaysLogged) * 100) : 100;

  const isConfirmed = confirmInput.trim().toUpperCase() === 'DELETE' || 
                      confirmInput.trim().toLowerCase() === student.name.trim().toLowerCase();

  const handleDownloadArchive = () => {
    const archivePayload = {
      archiveGeneratedAt: new Date().toISOString(),
      studentProfile: student,
      hifzRecitationRecords: hifzRecords,
      homePracticeRecords: homeLearning,
      tarbiyahRecords: tarbiyah,
      weeklyEvaluation: evaluation || null,
      summaryStats: {
        totalDaysLogged,
        totalSabaqPassed,
        attendanceRate: `${attendanceRate}%`,
        currentJuz: student.currentJuz,
        currentSurah: student.currentSurah
      }
    };

    const safeName = student.name.replace(/[^a-zA-Z0-9_-]/g, '_');
    const safeRoll = student.rollNumber.replace(/[^a-zA-Z0-9_-]/g, '_');
    const jsonStr = JSON.stringify(archivePayload, null, 2);
    downloadBlobFile(
      `Madrasah_Quran_Dossier_${safeRoll}_${safeName}.json`,
      jsonStr,
      'application/json'
    );
    setArchiveDownloaded(true);
  };

  const handleExecuteDelete = async () => {
    if (!isConfirmed) return;
    setIsDeleting(true);
    try {
      await onConfirmDelete(student.id);
      onClose();
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-rose-100 bg-rose-50/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center border border-rose-200">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Protected Student Deletion & Archive
              </h3>
              <p className="text-xs text-slate-500">
                Audit confirmation to prevent accidental loss of Quranic records
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700">
          {/* Student Profile Snapshot */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-sm font-bold text-slate-900 block">{student.name}</span>
                <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                  Roll: {student.rollNumber} • Circle: {student.circleCode} ({student.teacherName})
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                Juz {student.currentJuz} • {student.currentSurah}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-200/60 text-center">
              <div className="p-2 rounded-xl bg-white border border-slate-200/60">
                <span className="text-[10px] text-slate-500 block uppercase font-semibold">Total Days</span>
                <span className="text-xs font-bold text-slate-800">{totalDaysLogged}</span>
              </div>
              <div className="p-2 rounded-xl bg-white border border-slate-200/60">
                <span className="text-[10px] text-slate-500 block uppercase font-semibold">Sabaq Passed</span>
                <span className="text-xs font-bold text-emerald-700">{totalSabaqPassed}</span>
              </div>
              <div className="p-2 rounded-xl bg-white border border-slate-200/60">
                <span className="text-[10px] text-slate-500 block uppercase font-semibold">Attendance</span>
                <span className="text-xs font-bold text-blue-700">{attendanceRate}%</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 pt-1">
              Parent Contact: <strong className="text-slate-800">{student.parentName}</strong> ({student.parentEmail})
            </div>
          </div>

          {/* Export Step Recommendation */}
          <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-900 font-bold">
                <Download className="w-4 h-4 text-emerald-700" />
                <span>Download Quranic Record Dossier (Recommended)</span>
              </div>
              {archiveDownloaded && (
                <span className="text-[10px] font-bold text-emerald-700 bg-white px-2 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Archived
                </span>
              )}
            </div>
            <p className="text-xs text-emerald-800 leading-relaxed">
              Before permanently removing {student.name}, export their complete memorisation, home practice, and tarbiyah records for parental handover or academy records.
            </p>
            <button
              type="button"
              onClick={handleDownloadArchive}
              className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>{archiveDownloaded ? 'Download Again (JSON Dossier)' : 'Export Complete Quranic Records'}</span>
            </button>
          </div>

          {/* Warning Message */}
          <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 text-xs">
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold block">Permanent Cloud Database Deletion:</span>
              <p className="text-[11px] text-amber-800">
                Removing this student cascades to Google Cloud SQL PostgreSQL, unlinking all daily recitation logs and weekly evaluations.
              </p>
            </div>
          </div>

          {/* Confirmation Input */}
          <div className="space-y-1.5 pt-1">
            <label className="text-xs font-bold text-slate-800 block">
              Type <span className="font-mono text-rose-700 font-black">DELETE</span> or <span className="font-mono text-slate-900 font-black">{student.name}</span> to confirm:
            </label>
            <input
              type="text"
              value={confirmInput}
              onChange={(e) => setConfirmInput(e.target.value)}
              placeholder="Type DELETE or student name"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 font-mono"
            />
          </div>
        </div>

        {/* Actions Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-800 hover:bg-slate-200 font-semibold text-xs transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!isConfirmed || isDeleting}
            onClick={handleExecuteDelete}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all ${
              isConfirmed && !isDeleting
                ? 'bg-rose-600 hover:bg-rose-700 text-white cursor-pointer'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isDeleting ? 'Deleting from Cloud SQL...' : 'Confirm Permanent Deletion'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
