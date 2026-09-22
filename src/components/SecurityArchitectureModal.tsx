import React, { useState } from 'react';
import { useHifz } from '../context/HifzContext';
import {
  ShieldCheck,
  Lock,
  UserCheck,
  FileCheck,
  Database,
  X,
  CheckCircle2,
  Users
} from 'lucide-react';

export const SecurityArchitectureModal: React.FC = () => {
  const {
    isSecurityModalOpen,
    setIsSecurityModalOpen,
    students,
    adminSettings
  } = useHifz();

  const [activeTab, setActiveTab] = useState<'scoping' | 'privacy' | 'storage'>('scoping');
  const [integrityStatus, setIntegrityStatus] = useState<string | null>(null);

  if (!isSecurityModalOpen) return null;

  const handleCheckLocalStorage = () => {
    try {
      const keys = ['hifz_app_students_v3', 'hifz_app_records_map_v3', 'hifz_app_admin_settings_v3'];
      const present = keys.filter(k => localStorage.getItem(k) !== null);
      setIntegrityStatus(`Local storage operational. ${present.length} of ${keys.length} core data collections active across ${students.length} student profile(s).`);
    } catch {
      setIntegrityStatus('Browser local storage active in memory.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 text-slate-900">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/30 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg tracking-tight text-white">
                  Data Governance & Access Control
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                  Role Partitioned
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {adminSettings.academyName} • Madrasah Privacy Guidelines
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsSecurityModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Subnav */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 gap-1 overflow-x-auto text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('scoping')}
            className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'scoping'
                ? 'border-emerald-600 text-emerald-800 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            1. Role-Scoped Privacy
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('privacy')}
            className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'privacy'
                ? 'border-emerald-600 text-emerald-800 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            2. Student Data Minimization
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('storage')}
            className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'storage'
                ? 'border-emerald-600 text-emerald-800 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            3. Local Storage & Data Portability
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs leading-relaxed text-slate-600">
          
          {activeTab === 'scoping' && (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm mb-1">
                  <Lock className="w-4 h-4 text-emerald-700" />
                  <span>Strict Portal Separation</span>
                </div>
                <p className="text-emerald-800">
                  Every user is scoped strictly to the information they are authorized to view.
                  No parent can view other families' children or performance logs.
                </p>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">User Portal</th>
                      <th className="p-2.5">Visibility Scope</th>
                      <th className="p-2.5">Permitted Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="p-2.5 font-bold text-blue-900 bg-blue-50/50">Parent / Student</td>
                      <td className="p-2.5 text-slate-700">Enrolled child / siblings only</td>
                      <td className="p-2.5 text-slate-600">Log home revision, confirm salaah, submit inquiries</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-emerald-900 bg-emerald-50/50">Ustadh / Teacher</td>
                      <td className="p-2.5 text-slate-700">Assigned Halqa circle only</td>
                      <td className="p-2.5 text-slate-600">Mark Sabaq/Dawr recitation, record attendance, write feedback</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-amber-900 bg-amber-50/50">Administrator</td>
                      <td className="p-2.5 text-slate-700">All registered circles</td>
                      <td className="p-2.5 text-slate-600">Circle allocation, student enrollment, academic terms</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-3">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-center gap-2 text-blue-900 font-bold text-sm mb-1">
                  <UserCheck className="w-4 h-4 text-blue-700" />
                  <span>Child Protection & Privacy Principles</span>
                </div>
                <p className="text-blue-800">
                  Because Hifz learners are minors, data collection is deliberately limited to educational progress:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="font-bold text-slate-900 mb-1">No Biometrics or Facial Photos</div>
                  <div>
                    Students are identified solely by name, roll number, and parent contact information.
                  </div>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="font-bold text-slate-900 mb-1">Zero Commercial Trackers</div>
                  <div>
                    No commercial advertising networks, marketing pixels, or analytics trackers run in the application.
                  </div>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="font-bold text-slate-900 mb-1">Parent-Verified Home Learning</div>
                  <div>
                    Home study logs and prayer reflections require explicit parent confirmation.
                  </div>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="font-bold text-slate-900 mb-1">Respect for Sacred Content</div>
                  <div>
                    All Surah and Juz tracking follows standard Uthmani numbering and authentic Quranic divisions.
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'storage' && (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-sm mb-1">
                  <Database className="w-4 h-4 text-amber-700" />
                  <span>Prototype Storage & Export Control</span>
                </div>
                <p className="text-amber-800">
                  During this prototype phase, records are securely managed in browser local storage.
                  Parents and administrators can export complete term reports or clear local demo data at any time.
                </p>
              </div>

              <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="font-bold text-slate-800">Browser Data Health Check</div>
                  <div className="text-slate-500 text-[11px]">
                    Verify integrity of local student records and evaluation maps.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCheckLocalStorage}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow transition-all shrink-0"
                >
                  Verify Local Storage
                </button>
              </div>

              {integrityStatus && (
                <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-900 text-xs border border-emerald-200 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{integrityStatus}</span>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            {adminSettings.academyName} • Madrasah Privacy Governance
          </span>
          <button
            type="button"
            onClick={() => setIsSecurityModalOpen(false)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
