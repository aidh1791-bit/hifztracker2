import React, { useState } from 'react';
import { AlertTriangle, Trash2, X, ShieldAlert, Archive } from 'lucide-react';
import { Student } from '../types';

interface SafeDeleteStudentModalProps {
  isOpen: boolean;
  student: Student | null;
  onClose: () => void;
  onConfirmDelete: (studentId: string) => Promise<void> | void;
}

export const SafeDeleteStudentModal: React.FC<SafeDeleteStudentModalProps> = ({
  isOpen,
  student,
  onClose,
  onConfirmDelete
}) => {
  const [confirmationInput, setConfirmationInput] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !student) return null;

  const handleConfirm = async () => {
    if (confirmationInput.trim().toLowerCase() !== student.name.trim().toLowerCase()) {
      setErrorMsg(`Please type the student's exact name "${student.name}" to confirm.`);
      return;
    }

    setIsDeleting(true);
    setErrorMsg(null);
    try {
      await onConfirmDelete(student.id);
      setConfirmationInput('');
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to remove student record. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-red-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-rose-700 p-6 text-white flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/15 rounded-2xl backdrop-blur-md">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Safe Student Removal & Archive</h3>
              <p className="text-xs text-rose-100">Protecting Quranic Memorisation Records</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="p-1.5 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="flex items-start gap-3 p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 text-xs">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold mb-1">Irreversible Removal Warning</p>
              <p>
                Removing <span className="font-bold underline">{student.name}</span> (Roll: {student.rollNumber})
                will delete their active enrollment from Cloud SQL and offline sync queues.
                Their historical logs and weekly evaluations will be archived.
              </p>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-1.5 text-slate-700">
            <div className="flex justify-between">
              <span className="text-slate-500">Student Name:</span>
              <span className="font-bold text-slate-900">{student.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Roll Number:</span>
              <span className="font-mono text-slate-900">{student.rollNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Current Progress:</span>
              <span className="font-semibold text-emerald-700">Juz {student.currentJuz} • {student.currentSurah}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Circle / Teacher:</span>
              <span>{student.teacherName} ({student.circleCode})</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Type <span className="font-mono text-rose-600 select-all font-bold">"{student.name}"</span> to confirm removal:
            </label>
            <input
              type="text"
              value={confirmationInput}
              onChange={(e) => {
                setConfirmationInput(e.target.value);
                if (errorMsg) setErrorMsg(null);
              }}
              placeholder={student.name}
              disabled={isDeleting}
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
            />
          </div>

          {errorMsg && (
            <p className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 p-2.5 rounded-xl">
              {errorMsg}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isDeleting || confirmationInput.trim().toLowerCase() !== student.name.trim().toLowerCase()}
            className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2"
          >
            {isDeleting ? (
              <span>Removing...</span>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>Confirm & Archive Student</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
