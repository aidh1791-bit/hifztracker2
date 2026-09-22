import React from 'react';
import { useHifz } from '../context/HifzContext';
import {
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  UserCheck,
  AlertCircle
} from 'lucide-react';
import { AttendanceStatus } from '../types';

export const AttendanceView: React.FC = () => {
  const {
    selectedStudent,
    currentHifzRecords,
    userRole,
    weeklySummary,
    updateAttendance
  } = useHifz();

  const isTeacher = userRole === 'teacher';

  const attendanceOptions: { status: AttendanceStatus; label: string; color: string; activeColor: string }[] = [
    { status: 'present', label: 'Present', color: 'text-emerald-700 bg-emerald-50 border-emerald-200', activeColor: 'bg-emerald-600 text-white' },
    { status: 'late', label: 'Late', color: 'text-amber-700 bg-amber-50 border-amber-200', activeColor: 'bg-amber-600 text-white' },
    { status: 'absent', label: 'Absent', color: 'text-rose-700 bg-rose-50 border-rose-200', activeColor: 'bg-rose-600 text-white' },
    { status: 'excused', label: 'Excused', color: 'text-blue-700 bg-blue-50 border-blue-200', activeColor: 'bg-blue-600 text-white' }
  ];

  const totalRecordedDays = currentHifzRecords.length;
  const attendanceRate = totalRecordedDays > 0
    ? Math.round(((weeklySummary.totalDaysPresent + weeklySummary.totalDaysLate * 0.5) / totalRecordedDays) * 100)
    : 100;

  return (
    <div className="space-y-6">
      
      {/* Attendance Metrics Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <CalendarCheck className="w-5 h-5" />
              </span>
              <h2 className="text-lg font-bold text-slate-900">
                Weekly Attendance & Punctuality Log
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Class attendance for {selectedStudent.name} ({selectedStudent.classGroup})
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Weekly Rate:</span>
            <span className="px-3 py-1 rounded-full text-sm font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
              {attendanceRate}% Punctual
            </span>
          </div>
        </div>

        {/* 4 Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 text-center">
            <span className="text-[11px] font-semibold text-emerald-800 uppercase block">Present</span>
            <div className="text-2xl font-black text-emerald-900 mt-0.5">
              {weeklySummary.totalDaysPresent}
            </div>
            <span className="text-[10px] text-emerald-600">On time</span>
          </div>

          <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-100 text-center">
            <span className="text-[11px] font-semibold text-amber-800 uppercase block">Late</span>
            <div className="text-2xl font-black text-amber-900 mt-0.5">
              {weeklySummary.totalDaysLate}
            </div>
            <span className="text-[10px] text-amber-600">Delayed arrival</span>
          </div>

          <div className="p-3 rounded-xl bg-rose-50/60 border border-rose-100 text-center">
            <span className="text-[11px] font-semibold text-rose-800 uppercase block">Absent</span>
            <div className="text-2xl font-black text-rose-900 mt-0.5">
              {weeklySummary.totalDaysAbsent}
            </div>
            <span className="text-[10px] text-rose-600">Missed classes</span>
          </div>

          <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-100 text-center">
            <span className="text-[11px] font-semibold text-indigo-800 uppercase block">Streak</span>
            <div className="text-2xl font-black text-indigo-900 mt-0.5">
              18 Days
            </div>
            <span className="text-[10px] text-indigo-600">Consistent Hifz</span>
          </div>
        </div>
      </div>

      {/* Daily Attendance Selector Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-900 text-base">
            Day-by-Day Roster Record
          </h3>
          {isTeacher && (
            <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Teacher Mode: Click any status to change
            </span>
          )}
        </div>

        <div className="space-y-3">
          {currentHifzRecords.map((record) => {
            const isToday = record.day === 'Wednesday';

            return (
              <div
                key={record.id}
                className={`p-3.5 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-colors ${
                  isToday ? 'bg-emerald-50/40 border-emerald-300' : 'bg-slate-50/50 border-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ${
                    isToday ? 'bg-emerald-700 text-white' : 'bg-slate-800 text-white'
                  }`}>
                    {record.day.substring(0, 3)}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{record.day}</span>
                      {isToday && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold">
                          Today
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-500">{record.date} • Class starts 08:30 AM</span>
                  </div>
                </div>

                {/* Status Toggle Buttons */}
                <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
                  {attendanceOptions.map((opt) => {
                    const isSelected = record.attendance === opt.status;

                    if (!isTeacher) {
                      if (!isSelected) return null;
                      return (
                        <span
                          key={opt.status}
                          className={`px-3 py-1 rounded-lg text-xs font-bold capitalize border ${opt.color}`}
                        >
                          {opt.label}
                        </span>
                      );
                    }

                    return (
                      <button
                        key={opt.status}
                        type="button"
                        onClick={() => updateAttendance(record.id, opt.status)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                          isSelected
                            ? `${opt.activeColor} shadow-2xs`
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Attendance Policy Notice */}
        <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
          <div>
            <strong>Madrasah Punctuality Guidelines:</strong> Consistent daily attendance directly reinforces Sabaq retention. If absent, parents must provide a reason and schedule make-up Sabaq testing with the Ustadh.
          </div>
        </div>
      </div>

    </div>
  );
};
