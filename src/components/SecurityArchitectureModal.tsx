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
  Download,
  Copy,
  FileText,
  Trash2,
  Check,
  Info,
  Scale,
  Sparkles
} from 'lucide-react';

export const SecurityArchitectureModal: React.FC = () => {
  const {
    isSecurityModalOpen,
    setIsSecurityModalOpen,
    students,
    adminSettings,
    selectedStudent,
    currentHifzRecords,
    currentHomeLearning,
    currentTarbiyah,
    currentEvaluation,
    logoutToLanding
  } = useHifz();

  const [activeTab, setActiveTab] = useState<'privacy_notice' | 'parent_letter' | 'scoping' | 'children_shared' | 'sar_export'>('privacy_notice');
  const [copiedLetter, setCopiedLetter] = useState(false);
  const [consentAcknowledged, setConsentAcknowledged] = useState<boolean>(() => {
    return localStorage.getItem('hifz_gdpr_parent_consent') === 'acknowledged';
  });
  const [wipeNotice, setWipeNotice] = useState<string | null>(null);

  if (!isSecurityModalOpen) return null;

  const handleToggleConsent = () => {
    const next = !consentAcknowledged;
    setConsentAcknowledged(next);
    if (next) {
      localStorage.setItem('hifz_gdpr_parent_consent', 'acknowledged');
    } else {
      localStorage.removeItem('hifz_gdpr_parent_consent');
    }
  };

  const handlePurgeDeviceStorage = () => {
    logoutToLanding();
    setWipeNotice('All local cached student records, authentication tokens, and prayer logs have been permanently erased from this device browser storage.');
  };

  // Article 15 GDPR Subject Access Request (SAR) Machine-Readable Export
  const handleExportSarPackage = () => {
    const studentId = selectedStudent.id !== 'no-student' ? selectedStudent.id : (students[0]?.id || 'unknown');
    const targetStudent = students.find(s => s.id === studentId) || selectedStudent;

    const sarPackage = {
      gdpr_article_15_subject_access_request: {
        madrasah_academy: adminSettings.academyName,
        dpo_contact: adminSettings.adminEmail || 'admin@hifztrack.org',
        export_timestamp_iso: new Date().toISOString(),
        data_subject: {
          student_id: targetStudent.id,
          student_name: targetStudent.name,
          roll_number: targetStudent.rollNumber,
          circle_code: targetStudent.circleCode,
          parent_name: targetStudent.parentName,
          parent_email: targetStudent.parentEmail,
          parent_phone: targetStudent.parentPhone,
          enrollment_status: targetStudent.status
        },
        quran_memorisation_records: currentHifzRecords,
        daily_home_learning_records: currentHomeLearning,
        daily_tarbiyah_salaah_records: currentTarbiyah,
        weekly_evaluations: currentEvaluation,
        data_retention_policy: 'Retained exclusively for the duration of the student enrollment in the Madrasah plus 1 academic term for reporting and graduation transcripts.'
      }
    };

    const blob = new Blob([JSON.stringify(sarPackage, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GDPR_SAR_Data_Export_${targetStudent.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const parentInformationLetterText = `Assalamu Alaikum wa Rahmatullahi wa Barakatuh,

Dear Parents & Guardians of ${adminSettings.academyName},

Re: Student Quran Memorisation Portal & Data Privacy (GDPR Compliance)

To enhance our students' Quranic journey and provide seamless communication between parents and teachers, ${adminSettings.academyName} utilizes a secure digital Hifz and Tarbiyah tracking platform.

We take the privacy of our students and their families with the utmost seriousness. In accordance with the UK General Data Protection Regulation (UK GDPR), the Data Protection Act 2018, and the UK Age-Appropriate Design Code (Children's Code), we want to reassure you of how your family's information is handled:

1. What Information We Record:
- Student's name, assigned Halqa/circle, and roll number.
- Daily Quranic recitation progress (Sabaq, Sabqi / Sabaq Para, and Dawr / Manzil).
- Daily home revision times and voluntary prayer (Salah) completion records confirmed by parents.
- Parent contact details (email and mobile number for progress notifications and authentication).

2. How We Protect Your Child's Privacy:
- ZERO Commercial Trackers: We run no advertising, behavioral profiling, or third-party marketing trackers.
- Strict Role-Partitioning: Each parent can ONLY view and sign records for their own enrolled children. No other parent can view your child's recitation or notes.
- Shared Device Protection: The portal automatically wipes all cached student data upon logout, safeguarding shared household or madrasah tablets.
- Central Encrypted Cloud Database: All logs are synced to our authenticated PostgreSQL database using fresh, cryptographically signed tokens.

3. Your Legal Rights as a Parent:
- Right to Access: You may request or directly export a complete digital copy (SAR) of your child's academic and Tarbiyah ledger at any time.
- Right to Rectification: Any mistake in recitation marks or attendance can be corrected by contacting your child's Ustadh.
- Right to Erasure: When your child graduates or leaves the academy, their identifying personal record can be permanently removed upon written request.

If you have any questions regarding data governance, please reach out to our administration at ${adminSettings.adminEmail || 'admin@hifztrack.org'}.

Jazakum Allahu Khairan,
Administration & Data Protection Lead
${adminSettings.academyName}`;

  const handleCopyLetter = () => {
    navigator.clipboard.writeText(parentInformationLetterText);
    setCopiedLetter(true);
    setTimeout(() => setCopiedLetter(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 text-slate-900">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/30 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg tracking-tight text-white">
                  Privacy Notice & GDPR Governance
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                  UK GDPR & ICO Compliant
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {adminSettings.academyName} • Data Protection Officer: {adminSettings.adminEmail || 'admin@hifztrack.org'}
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
            onClick={() => setActiveTab('privacy_notice')}
            className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'privacy_notice'
                ? 'border-emerald-600 text-emerald-800 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Scale className="w-4 h-4" />
            1. Privacy Notice (GDPR)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('parent_letter')}
            className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'parent_letter'
                ? 'border-emerald-600 text-emerald-800 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            2. Parent Information Letter
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('children_shared')}
            className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'children_shared'
                ? 'border-emerald-600 text-emerald-800 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            3. Children & Shared Tablets
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('scoping')}
            className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'scoping'
                ? 'border-emerald-600 text-emerald-800 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Lock className="w-4 h-4" />
            4. Access Control (RBAC)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('sar_export')}
            className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'sar_export'
                ? 'border-emerald-600 text-emerald-800 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Download className="w-4 h-4" />
            5. SAR Data Export
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs leading-relaxed text-slate-600">
          
          {/* TAB 1: FORMAL GDPR PRIVACY NOTICE */}
          {activeTab === 'privacy_notice' && (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-emerald-950">
                <div className="flex items-center gap-2 font-bold text-sm text-emerald-900 mb-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>Madrasah Privacy Notice & Data Protection Policy</span>
                </div>
                <p className="text-xs text-emerald-800 leading-normal">
                  This document explains how <strong>{adminSettings.academyName}</strong> processes personal and special category data relating to students, parents, and teachers under the UK General Data Protection Regulation (UK GDPR), the Data Protection Act 2018 (DPA 2018), and the Information Commissioner's Office (ICO) guidelines.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="border border-slate-200 bg-slate-50 rounded-xl p-3.5 space-y-2">
                  <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-blue-600" />
                    1. Data Controller & Governance
                  </div>
                  <p className="text-[11px] text-slate-600">
                    The Data Controller is <strong>{adminSettings.academyName}</strong>. The principal and administrative committee oversee adherence to data protection standards. Inquiries may be directed to <span className="font-mono text-emerald-800 font-semibold">{adminSettings.adminEmail || 'admin@hifztrack.org'}</span>.
                  </p>
                </div>

                <div className="border border-slate-200 bg-slate-50 rounded-xl p-3.5 space-y-2">
                  <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <Scale className="w-3.5 h-3.5 text-emerald-600" />
                    2. Lawful Bases for Processing
                  </div>
                  <ul className="text-[11px] text-slate-600 list-disc list-inside space-y-1">
                    <li><strong>Article 6(1)(b) - Contract:</strong> Fulfilling Madrasah enrollment and educational delivery.</li>
                    <li><strong>Article 6(1)(f) - Legitimate Interests:</strong> Accurately tracking Quranic memorisation and child safeguarding.</li>
                    <li><strong>Article 9(2)(d) - Religious Activity:</strong> Lawful processing by an Islamic non-profit educational body.</li>
                  </ul>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-2">
                <div className="font-bold text-slate-900 text-xs">
                  3. Categories of Data Processed (Data Minimisation)
                </div>
                <p className="text-[11px] text-slate-600">
                  In adherence to the Principle of Data Minimisation (Article 5(1)(c)), we record only information strictly essential to Quranic instruction:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <strong className="text-slate-900 block mb-0.5">Student Profile:</strong>
                    Name, roll number, circle / Halqa code, and current Surah / Juz.
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <strong className="text-slate-900 block mb-0.5">Recitation Ledger:</strong>
                    Sabaq (new lesson), Sabaq Para (quarter revision), and Dawr (cycle review).
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <strong className="text-slate-900 block mb-0.5">Parent Details:</strong>
                    Parent/guardian contact email and mobile phone number for verification and reports.
                  </div>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-2">
                <div className="font-bold text-slate-900 text-xs">
                  4. Your Statutory Rights Under UK GDPR
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div className="flex gap-2 items-start">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong>Right of Access (Article 15):</strong> Parents may export a machine-readable JSON archive of all records at any time.
                    </div>
                  </div>
                  <div className="flex gap-2 items-start">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong>Right to Rectification (Article 16):</strong> Inaccurate recitation scores or contact info can be updated via the Teacher portal.
                    </div>
                  </div>
                  <div className="flex gap-2 items-start">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong>Right to Erasure (Article 17):</strong> "Right to be Forgotten" upon student departure or graduation.
                    </div>
                  </div>
                  <div className="flex gap-2 items-start">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong>Right to Complain:</strong> Right to lodge a complaint with the UK Information Commissioner's Office (ico.org.uk).
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PARENT INFORMATION LETTER */}
          {activeTab === 'parent_letter' && (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-blue-50 border border-blue-200 rounded-xl p-3.5">
                <div>
                  <div className="font-bold text-blue-900 text-xs">
                    Official Madrasah Parent Notification Letter
                  </div>
                  <p className="text-[11px] text-blue-800">
                    Print or copy this text to inform parents via WhatsApp, email newsletter, or paper circular.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCopyLetter}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow shrink-0 transition-colors"
                >
                  {copiedLetter ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedLetter ? 'Copied to Clipboard!' : 'Copy Letter Text'}</span>
                </button>
              </div>

              <div className="border border-slate-300 rounded-xl p-4 bg-slate-50 font-mono text-[11px] whitespace-pre-wrap leading-relaxed max-h-[350px] overflow-y-auto text-slate-800">
                {parentInformationLetterText}
              </div>
            </div>
          )}

          {/* TAB 3: CHILDREN & SHARED TABLETS */}
          {activeTab === 'children_shared' && (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-sm mb-1">
                  <UserCheck className="w-4 h-4 text-amber-700" />
                  <span>UK Age-Appropriate Design Code & Shared Device Safety</span>
                </div>
                <p className="text-amber-800 text-xs">
                  Because students frequently log recitation or home practice on shared Madrasah iPads or household tablets, our application enforces strict safeguards against data leakage.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <div className="font-bold text-slate-900">Immediate Cache Purge on Sign-Out</div>
                  <p className="text-slate-600">
                    Signing out wipes all cached student names, progress records, and ID tokens from the device storage so the next user cannot inspect previous child data.
                  </p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <div className="font-bold text-slate-900">Zero Commercial Profiling</div>
                  <p className="text-slate-600">
                    No third-party analytics, behavioral profiling, or advertising tags are embedded. Data is processed exclusively for Quranic study.
                  </p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <div className="font-bold text-slate-900">Parental Oversight</div>
                  <p className="text-slate-600">
                    Home practice minutes and daily Salah reflections require parent electronic confirmation before being recorded into weekly reports.
                  </p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <div className="font-bold text-slate-900">Fresh Token Authorization</div>
                  <p className="text-slate-600">
                    Every API request carries a freshly verified cryptographic token issued by Google Firebase Auth. Stale or spoofed tokens are rejected immediately.
                  </p>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="font-bold text-slate-900 text-xs">Shared Device Manual Wipe</div>
                  <div className="text-[11px] text-slate-500">
                    If this device is shared amongst multiple families, click here to clear all local student state immediately.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handlePurgeDeviceStorage}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow transition-colors shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Purge Local Storage Now</span>
                </button>
              </div>

              {wipeNotice && (
                <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-900 text-xs border border-emerald-200 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{wipeNotice}</span>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: ACCESS CONTROL (RBAC) */}
          {activeTab === 'scoping' && (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm mb-1">
                  <Lock className="w-4 h-4 text-emerald-700" />
                  <span>Server-Authoritative Role Isolation</span>
                </div>
                <p className="text-emerald-800 text-xs">
                  Access permissions are enforced strictly server-side by cryptographically verified Firebase ID tokens and database roster derivation. Client headers like <span className="font-mono text-emerald-950 font-bold">x-user-role</span> are rejected by default.
                </p>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">User Portal</th>
                      <th className="p-2.5">Data Visibility Scope</th>
                      <th className="p-2.5">Permitted Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="p-2.5 font-bold text-blue-900 bg-blue-50/50">Parent / Student</td>
                      <td className="p-2.5 text-slate-700">Strictly enrolled children matching verified parent email</td>
                      <td className="p-2.5 text-slate-600">Review lessons, sign weekly evaluations, log home revision</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-emerald-900 bg-emerald-50/50">Ustadh / Teacher</td>
                      <td className="p-2.5 text-slate-700">Strictly students enrolled in assigned Halqa circle</td>
                      <td className="p-2.5 text-slate-600">Record Sabaq, Sabqi, and Dawr recitation; grade performance</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-amber-900 bg-amber-50/50">Administrator</td>
                      <td className="p-2.5 text-slate-700">All registered circles and Madrasah records</td>
                      <td className="p-2.5 text-slate-600">Student enrollment, teacher assignment, GDPR data governance</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: SAR DATA EXPORT */}
          {activeTab === 'sar_export' && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-center gap-2 text-blue-900 font-bold text-sm mb-1">
                  <Download className="w-4 h-4 text-blue-700" />
                  <span>Article 15 Subject Access Request (SAR) Automation</span>
                </div>
                <p className="text-blue-800 text-xs">
                  Under Article 15 of the UK GDPR, parents have the right to obtain confirmation and a full machine-readable copy of their child's educational records.
                </p>
              </div>

              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-3">
                <div className="font-bold text-slate-800 text-xs">
                  Export Student Educational & Tarbiyah Archive
                </div>
                <p className="text-[11px] text-slate-600 leading-normal">
                  Clicking the button below generates an official JSON data package containing student biographical details, daily recitation records, home revision times, and weekly evaluation grades.
                </p>
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={handleExportSarPackage}
                    className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download GDPR SAR Data Archive (JSON)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer with Consent Toggle */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={consentAcknowledged}
              onChange={handleToggleConsent}
              className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
            />
            <span>I acknowledge and accept the Madrasah GDPR Privacy Notice</span>
          </label>

          <button
            type="button"
            onClick={() => setIsSecurityModalOpen(false)}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow transition-colors shrink-0"
          >
            Close Notice
          </button>
        </div>

      </div>
    </div>
  );
};
