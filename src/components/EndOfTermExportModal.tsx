import React, { useState } from 'react';
import { useHifz } from '../context/HifzContext';
import {
  Download,
  FileSpreadsheet,
  FileCode,
  Mail,
  Calendar,
  Award,
  CheckCircle2,
  Copy,
  Settings,
  Sparkles,
  X,
  ExternalLink,
  ShieldCheck,
  Printer
} from 'lucide-react';
import {
  formatEmailReportText,
  buildMailtoUrl,
  generateEndOfTermCSV,
  downloadBlobFile
} from '../utils/exportHelpers';

interface EndOfTermExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EndOfTermExportModal: React.FC<EndOfTermExportModalProps> = ({
  isOpen,
  onClose
}) => {
  const {
    students,
    selectedStudent,
    weeklySummary,
    currentHifzRecords,
    currentHomeLearning,
    currentTarbiyah,
    currentEvaluation,
    teacherSettings,
    adminSettings,
    endOfTermSetup,
    updateEndOfTermSetup,
    exportEndOfTermData
  } = useHifz();

  const [activeTab, setActiveTab] = useState<'export' | 'email' | 'term-setup'>('export');

  // Term setup editing state
  const [termTitle, setTermTitle] = useState(endOfTermSetup.termTitle);
  const [academicYear, setAcademicYear] = useState(endOfTermSetup.academicYear);
  const [startDate, setStartDate] = useState(endOfTermSetup.startDate);
  const [endDate, setEndDate] = useState(endOfTermSetup.endDate);
  const [totalClassDays, setTotalClassDays] = useState(endOfTermSetup.totalClassDays);
  const [passingScoreThreshold, setPassingScoreThreshold] = useState(endOfTermSetup.passingScoreThreshold);
  const [headTeacherName, setHeadTeacherName] = useState(endOfTermSetup.headTeacherName);
  const [headTeacherSeal, setHeadTeacherSeal] = useState(endOfTermSetup.headTeacherSeal);
  const [termStatus, setTermStatus] = useState(endOfTermSetup.termStatus);
  const [termRemarks, setTermRemarks] = useState(endOfTermSetup.termRemarks);
  const [setupSaved, setSetupSaved] = useState(false);

  // Email state
  const [emailRecipientType, setEmailRecipientType] = useState<'parent' | 'madrasah' | 'custom'>('parent');
  const [customEmail, setCustomEmail] = useState('');
  const [copiedEmailText, setCopiedEmailText] = useState(false);

  if (!isOpen) return null;

  const handleSaveTermSetup = (e: React.FormEvent) => {
    e.preventDefault();
    updateEndOfTermSetup({
      termTitle,
      academicYear,
      startDate,
      endDate,
      totalClassDays: Number(totalClassDays),
      passingScoreThreshold: Number(passingScoreThreshold),
      headTeacherName,
      headTeacherSeal,
      termStatus,
      termRemarks
    });
    setSetupSaved(true);
    setTimeout(() => setSetupSaved(false), 2000);
  };

  // Compile formatted email text for current student
  const emailData = formatEmailReportText(
    selectedStudent,
    weeklySummary,
    currentEvaluation,
    `${endOfTermSetup.termTitle} - Evaluation Week`
  );

  const getTargetRecipientEmail = () => {
    if (emailRecipientType === 'parent') {
      const mapping = teacherSettings.madrasahGoogleSetup?.studentMappings?.find(
        m => m.studentId === selectedStudent.id
      );
      return mapping?.parentGmail || `${selectedStudent.parentName.toLowerCase().replace(/\s+/g, '.')}@gmail.com`;
    }
    if (emailRecipientType === 'madrasah') {
      return teacherSettings.madrasahGoogleSetup?.madrasahAdminGmail || 'madrasah.hifz.circle@gmail.com';
    }
    return customEmail || 'recipient@gmail.com';
  };

  const handleLaunchEmailClient = () => {
    const recipient = getTargetRecipientEmail();
    const mailtoUrl = buildMailtoUrl(recipient, emailData.subject, emailData.body);
    window.location.href = mailtoUrl;
  };

  const handleCopyEmailText = async () => {
    try {
      await navigator.clipboard.writeText(`Subject: ${emailData.subject}\n\n${emailData.body}`);
      setCopiedEmailText(true);
      setTimeout(() => setCopiedEmailText(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-200">
              <FileSpreadsheet className="w-5 h-5 text-emerald-700" />
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                End-of-Term Export & Email Reporting Center
              </h3>
              <p className="text-xs text-slate-500">
                Generate official Madrasah CSV / JSON term ledgers, email reports to parents, and configure term thresholds.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 px-5 pt-2 gap-4 bg-white text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('export')}
            className={`pb-2.5 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'export'
                ? 'border-emerald-600 text-emerald-800 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Export Reports (CSV / JSON)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('email')}
            className={`pb-2.5 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'email'
                ? 'border-emerald-600 text-emerald-800 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Email Report to Parent / Madrasah</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('term-setup')}
            className={`pb-2.5 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'term-setup'
                ? 'border-emerald-600 text-emerald-800 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>End-of-Term Setup & Rules</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          
          {/* TAB 1: EXPORT OPTIONS */}
          {activeTab === 'export' && (
            <div className="space-y-4 text-xs">
              
              {/* Term Summary Card */}
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold uppercase text-emerald-800 block">
                    Active Term Configuration
                  </span>
                  <h4 className="text-sm font-extrabold text-slate-900 mt-0.5">
                    {endOfTermSetup.termTitle} ({endOfTermSetup.academicYear})
                  </h4>
                  <p className="text-slate-600 mt-0.5">
                    Term Duration: {endOfTermSetup.startDate} to {endOfTermSetup.endDate} • {endOfTermSetup.totalClassDays} Teaching Days
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Class Roster</span>
                  <span className="text-xs font-bold text-emerald-800">
                    {students.length} Enrolled Students
                  </span>
                </div>
              </div>

              {/* Action Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* CSV Card */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white hover:border-emerald-500 transition-all space-y-3 shadow-2xs">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold">
                    <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                    <span className="text-sm">Comprehensive Term CSV Spreadsheet</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    Export RFC-4180 compliant CSV compatible with Google Sheets, Microsoft Excel, and Apple Numbers.
                    Includes all students' Sabaq completion rates, revision scores, attendance percentages, and Tarbiyah logs.
                  </p>
                  <button
                    type="button"
                    onClick={() => exportEndOfTermData('csv')}
                    className="w-full px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold flex items-center justify-center gap-2 shadow-xs transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Term CSV</span>
                  </button>
                </div>

                {/* JSON Archive Card */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-500 transition-all space-y-3 shadow-2xs">
                  <div className="flex items-center gap-2 text-blue-800 font-bold">
                    <FileCode className="w-5 h-5 text-blue-600" />
                    <span className="text-sm">Complete Term JSON Archive</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    Structured JSON snapshot designed for cloud backup, database migrations, and cryptographic verification of term evaluations and Ustadh signatures.
                  </p>
                  <button
                    type="button"
                    onClick={() => exportEndOfTermData('json')}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold flex items-center justify-center gap-2 shadow-xs transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download JSON Archive</span>
                  </button>
                </div>

              </div>

              {/* Current Student Single CSV */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between gap-3">
                <div>
                  <span className="font-bold text-slate-800 block text-xs">
                    Current Student Dossier ({selectedStudent.name})
                  </span>
                  <span className="text-slate-500 text-[11px]">
                    Print or save PDF evaluation dossier with official seal and signatures.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    window.print();
                  }}
                  className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Dossier</span>
                </button>
              </div>

            </div>
          )}

          {/* TAB 2: EMAIL REPORT TO PARENT */}
          {activeTab === 'email' && (
            <div className="space-y-4 text-xs">
              
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between gap-3">
                <div>
                  <span className="font-bold text-blue-950 block">Direct Email Reporting</span>
                  <span className="text-blue-800 text-[11px]">
                    Pre-fills subject and detailed Quranic performance summary in your preferred email client.
                  </span>
                </div>
                <Mail className="w-5 h-5 text-blue-700 shrink-0" />
              </div>

              {/* Recipient Selector */}
              <div className="space-y-2">
                <label className="font-bold text-slate-700 block">Select Email Recipient:</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setEmailRecipientType('parent')}
                    className={`p-2.5 rounded-xl text-left border transition-all ${
                      emailRecipientType === 'parent'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="block text-xs font-bold">Parent of {selectedStudent.name}</span>
                    <span className="text-[10px] text-slate-500 block truncate font-mono">
                      {selectedStudent.parentName}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEmailRecipientType('madrasah')}
                    className={`p-2.5 rounded-xl text-left border transition-all ${
                      emailRecipientType === 'madrasah'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="block text-xs font-bold">Madrasah Head Office</span>
                    <span className="text-[10px] text-slate-500 block truncate font-mono">
                      {teacherSettings.madrasahGoogleSetup?.madrasahAdminGmail}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEmailRecipientType('custom')}
                    className={`p-2.5 rounded-xl text-left border transition-all ${
                      emailRecipientType === 'custom'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="block text-xs font-bold">Custom Recipient</span>
                    <span className="text-[10px] text-slate-500 block truncate">Specify other email</span>
                  </button>
                </div>

                {emailRecipientType === 'custom' && (
                  <input
                    type="email"
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    placeholder="Enter custom email address..."
                    className="w-full mt-2 px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-600 font-mono"
                  />
                )}
              </div>

              {/* Preview of Email Content */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700">Preview Formatted Email Report:</label>
                  <button
                    type="button"
                    onClick={handleCopyEmailText}
                    className="text-emerald-700 hover:text-emerald-900 font-semibold flex items-center gap-1 text-[11px]"
                  >
                    {copiedEmailText ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedEmailText ? 'Copied to Clipboard!' : 'Copy Email Text'}</span>
                  </button>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 font-mono text-[11px] text-slate-700 max-h-56 overflow-y-auto whitespace-pre-line leading-relaxed">
                  <strong>Subject:</strong> {emailData.subject}
                  {'\n\n'}
                  {emailData.body}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={handleCopyEmailText}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copy Report to Clipboard</span>
                </button>

                <button
                  type="button"
                  onClick={handleLaunchEmailClient}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  <span>Launch Email Client (Mailto)</span>
                </button>
              </div>

            </div>
          )}

          {/* TAB 3: TERM SETUP & RULES */}
          {activeTab === 'term-setup' && (
            <form onSubmit={handleSaveTermSetup} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Term Title:</label>
                  <input
                    type="text"
                    value={termTitle}
                    onChange={(e) => setTermTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-600 font-semibold"
                    placeholder="e.g. Autumn Semester 2026 (Term 1)"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Academic Year:</label>
                  <input
                    type="text"
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-600 font-semibold"
                    placeholder="e.g. 2026 - 2027"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Term Start Date:</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-600"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Term End Date:</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-600"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Total Class Days:</label>
                  <input
                    type="number"
                    min={1}
                    max={200}
                    value={totalClassDays}
                    onChange={(e) => setTotalClassDays(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-600 font-bold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Passing Score Threshold (%):
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={50}
                      max={100}
                      value={passingScoreThreshold}
                      onChange={(e) => setPassingScoreThreshold(Number(e.target.value))}
                      className="w-24 px-3 py-2 border border-slate-300 rounded-xl text-center font-bold focus:outline-none focus:border-emerald-600"
                      required
                    />
                    <span className="text-slate-500">% score required for Term Promotion / Graduation</span>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Term Status:</label>
                  <select
                    value={termStatus}
                    onChange={(e) => setTermStatus(e.target.value as 'in-progress' | 'concluded' | 'archived')}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-600 bg-white font-semibold"
                  >
                    <option value="in-progress">In Progress (Active Term)</option>
                    <option value="concluded">Concluded (Grades Finalized)</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Official Board Seal & Remarks:</label>
                <input
                  type="text"
                  value={headTeacherSeal}
                  onChange={(e) => setHeadTeacherSeal(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-600 font-serif italic text-slate-800"
                  placeholder="Official Madrasah Seal text"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{setupSaved ? 'Term Rules Saved!' : 'Save Term Setup & Criteria'}</span>
                </button>

                {setupSaved && (
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    Updated across all student exports!
                  </span>
                )}
              </div>

            </form>
          )}

        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Official Reports: Verified by {adminSettings.academyName || 'Hifz al-Quran Academy'} Board.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 font-semibold"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
