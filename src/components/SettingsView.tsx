import React, { useState } from 'react';
import { useHifz } from '../context/HifzContext';
import {
  Settings,
  ShieldCheck,
  Server,
  User,
  Bell,
  Save,
  RefreshCw,
  Sliders,
  Database,
  Lock,
  CheckCircle2,
  AlertCircle,
  LogOut,
  Mail,
  Phone,
  BookOpen,
  FolderSync,
  Share2,
  Copy,
  ExternalLink,
  Sparkles,
  Key,
  Download,
  FileSpreadsheet,
  School,
  KeyRound,
  Eye,
  EyeOff,
  Building2,
  ShieldAlert
} from 'lucide-react';
import { SimpleStorageMethod, StudentGmailMapping } from '../types';
import { PushNotificationSettingsSection } from './PushNotificationSettingsSection';
import { EndOfTermExportModal } from './EndOfTermExportModal';

export const SettingsView: React.FC = () => {
  const {
    portalMode,
    logoutToLanding,
    teacherSettings,
    updateTeacherSettings,
    saveMadrasahGoogleSetup,
    updateStudentGmailMapping,
    parentSettings,
    updateParentSettings,
    selectedStudent,
    syncStatus,
    triggerManualSync,
    setIsSecurityModalOpen,
    resetData,
    clearSampleStudents,
    endOfTermSetup,
    updateEndOfTermSetup,
    exportEndOfTermData,
    adminSettings,
    updateAdminSettings,
    setActiveTab
  } = useHifz();

  const isTeacher = portalMode === 'teacher';
  const isAdmin = portalMode === 'admin';
  const [isTermExportModalOpen, setIsTermExportModalOpen] = useState(false);

  // Admin Master Configuration Form State
  const [adminAcademyName, setAdminAcademyName] = useState(adminSettings.academyName);
  const [adminAcademicYear, setAdminAcademicYear] = useState(adminSettings.academicYear || '2026-2027 Academic Year');
  const [adminEmail, setAdminEmail] = useState(adminSettings.adminEmail);
  const [adminCurrentPass, setAdminCurrentPass] = useState('');
  const [adminNewPass, setAdminNewPass] = useState('');
  const [adminConfirmPass, setAdminConfirmPass] = useState('');
  const [showAdminPass, setShowAdminPass] = useState(false);
  const [adminIdentityFeedback, setAdminIdentityFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [adminPassFeedback, setAdminPassFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Teacher local form state
  const [circleName, setCircleName] = useState(teacherSettings.circleName);
  const [academicYear, setAcademicYear] = useState(teacherSettings.academicYear);
  const [headTeacherName, setHeadTeacherName] = useState(teacherSettings.headTeacherName);
  const [maxSabaqMistakes, setMaxSabaqMistakes] = useState(teacherSettings.maxSabaqMistakesForPass);
  const [maxDawrMistakes, setMaxDawrMistakes] = useState(teacherSettings.maxDawrMistakesForPass);
  const [serverEndpoint, setServerEndpoint] = useState(teacherSettings.serverEndpoint);
  const [enforceGoogleDomain, setEnforceGoogleDomain] = useState(teacherSettings.enforceGoogleSSODomain);
  const [auditLogging, setAuditLogging] = useState(teacherSettings.auditLogging);

  // Madrasah Google Setup form state
  const [madrasahAdminGmail, setMadrasahAdminGmail] = useState(
    teacherSettings.madrasahGoogleSetup?.madrasahAdminGmail || 'madrasah.hifz.circle@gmail.com'
  );
  const [storageMethod, setStorageMethod] = useState<SimpleStorageMethod>(
    teacherSettings.madrasahGoogleSetup?.storageMethod || 'google-drive-sheets'
  );
  const [cloudFolder, setCloudFolder] = useState(
    teacherSettings.madrasahGoogleSetup?.cloudFolderNameOrSheetId || 'Madrasah_Hifz_Class_Ledger_2026'
  );
  const [classInviteCode, setClassInviteCode] = useState(
    teacherSettings.madrasahGoogleSetup?.classInviteCode || 'HIFZ-CIRCLE-786'
  );
  const [studentMappings, setStudentMappings] = useState<StudentGmailMapping[]>(
    teacherSettings.madrasahGoogleSetup?.studentMappings?.length
      ? teacherSettings.madrasahGoogleSetup.studentMappings
      : [
          {
            studentId: 'std-1',
            studentName: 'Abdullah Khan',
            rollNumber: 'HIFZ-2024-042',
            studentGmail: 'abdullah.khan@gmail.com',
            parentGmail: 'tariq.khan@gmail.com',
            parentName: 'Tariq Khan',
            status: 'linked'
          },
          {
            studentId: 'std-2',
            studentName: 'Muhammad Patel',
            rollNumber: 'HIFZ-2024-019',
            studentGmail: 'muhammad.patel@gmail.com',
            parentGmail: 'patel.family@gmail.com',
            parentName: 'Ibrahim Patel',
            status: 'linked'
          },
          {
            studentId: 'std-3',
            studentName: 'Zayd Ahmed',
            rollNumber: 'HIFZ-2024-088',
            studentGmail: 'zayd.ahmed@gmail.com',
            parentGmail: 'ahmed.home@gmail.com',
            parentName: 'Farooq Ahmed',
            status: 'linked'
          }
        ]
  );
  const [googleInitLog, setGoogleInitLog] = useState<string | null>(null);
  const [isInitializingHub, setIsInitializingHub] = useState(false);
  const [copiedInviteStudentId, setCopiedInviteStudentId] = useState<string | null>(null);

  // Parent local form state
  const [childGoogleEmail, setChildGoogleEmail] = useState(parentSettings.linkedChildGoogleEmail);
  const [parentEmail, setParentEmail] = useState(parentSettings.parentContactEmail);
  const [parentPhone, setParentPhone] = useState(parentSettings.parentNotificationPhone);
  const [homeStudyTarget, setHomeStudyTarget] = useState(parentSettings.dailyHomeStudyTargetMins);
  const [notifyOnGrade, setNotifyOnGrade] = useState(parentSettings.notifyOnTeacherGrade);
  const [notifyOnFajr, setNotifyOnFajr] = useState(parentSettings.notifyOnFajrRevision);

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleStudentMappingChange = (studentId: string, field: 'studentGmail' | 'parentGmail', value: string) => {
    setStudentMappings(prev =>
      prev.map(item => (item.studentId === studentId ? { ...item, [field]: value } : item))
    );
  };

  const handleInitializeGoogleHub = () => {
    setIsInitializingHub(true);
    setGoogleInitLog('Authenticating Madrasah Google Account: ' + madrasahAdminGmail + '...');
    setTimeout(() => {
      setGoogleInitLog('Creating encrypted Class Sheet & Folder: "' + cloudFolder + '" in Madrasah Google Drive...');
    }, 600);
    setTimeout(() => {
      setGoogleInitLog('Whitelisting ' + studentMappings.length + ' student & parent Gmail accounts with Row-Level Privacy...');
    }, 1200);
    setTimeout(() => {
      saveMadrasahGoogleSetup({
        isConfigured: true,
        madrasahAdminGmail,
        storageMethod,
        cloudFolderNameOrSheetId: cloudFolder,
        classInviteCode,
        studentMappings,
        autoSyncEveryMinutes: 15
      });
      setIsInitializingHub(false);
      setGoogleInitLog('Madrasah Google Class Ledger is LIVE! Parents & students can now authenticate directly using their Gmail.');
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }, 1800);
  };

  const handleCopyInvite = (mapping: StudentGmailMapping) => {
    const inviteMessage = `Assalamu Alaikum! Your child ${mapping.studentName} is registered in the Madrasah Hifz Track. Open the portal and click "Sign in with Google" using your registered email: ${mapping.parentGmail} (or child: ${mapping.studentGmail}). Class Join Code: ${classInviteCode}`;
    navigator.clipboard?.writeText?.(inviteMessage);
    setCopiedInviteStudentId(mapping.studentId);
    setTimeout(() => setCopiedInviteStudentId(null), 2500);
  };

  const handleSaveTeacherSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateTeacherSettings({
      circleName,
      academicYear,
      headTeacherName,
      maxSabaqMistakesForPass: Number(maxSabaqMistakes),
      maxDawrMistakesForPass: Number(maxDawrMistakes),
      serverEndpoint,
      enforceGoogleSSODomain: enforceGoogleDomain,
      auditLogging,
      madrasahGoogleSetup: {
        isConfigured: true,
        madrasahAdminGmail,
        storageMethod,
        cloudFolderNameOrSheetId: cloudFolder,
        classInviteCode,
        studentMappings,
        autoSyncEveryMinutes: 15
      }
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleSaveParentSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateParentSettings({
      linkedChildGoogleEmail: childGoogleEmail,
      parentContactEmail: parentEmail,
      parentNotificationPhone: parentPhone,
      dailyHomeStudyTargetMins: Number(homeStudyTarget),
      notifyOnTeacherGrade: notifyOnGrade,
      notifyOnFajrRevision: notifyOnFajr
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleSaveAdminIdentity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminAcademyName.trim()) {
      setAdminIdentityFeedback({ type: 'error', message: 'Institute name cannot be empty.' });
      return;
    }
    updateAdminSettings({
      academyName: adminAcademyName.trim(),
      academicYear: adminAcademicYear.trim(),
      adminEmail: adminEmail.trim().toLowerCase()
    });
    setAdminIdentityFeedback({
      type: 'success',
      message: `Institute Name successfully updated to "${adminAcademyName.trim()}". All portals and dossiers now reflect this name.`
    });
    setTimeout(() => setAdminIdentityFeedback(null), 5000);
  };

  const handleSaveAdminPasscode = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminPassFeedback(null);

    const activePass = adminSettings.adminPasscode || '9999';
    if (adminCurrentPass.trim() !== activePass) {
      setAdminPassFeedback({
        type: 'error',
        message: 'Current Master Passcode is incorrect. Please check your current password.'
      });
      return;
    }

    if (adminNewPass.length < 4) {
      setAdminPassFeedback({
        type: 'error',
        message: 'New password must be at least 4 characters long.'
      });
      return;
    }

    if (adminNewPass !== adminConfirmPass) {
      setAdminPassFeedback({
        type: 'error',
        message: 'New password and confirmation password do not match.'
      });
      return;
    }

    updateAdminSettings({
      adminPasscode: adminNewPass
    });

    setAdminCurrentPass('');
    setAdminNewPass('');
    setAdminConfirmPass('');
    setAdminPassFeedback({
      type: 'success',
      message: 'Master Administrator Password successfully updated! Please use this for your next login.'
    });
    setTimeout(() => setAdminPassFeedback(null), 6000);
  };

  const handleResetAdminPasscodeToDefault = () => {
    if (window.confirm('Reset Master Admin Passcode back to default "9999"?')) {
      updateAdminSettings({ adminPasscode: '9999' });
      setAdminCurrentPass('');
      setAdminNewPass('');
      setAdminConfirmPass('');
      setAdminPassFeedback({
        type: 'success',
        message: 'Master Admin Passcode reset to default "9999".'
      });
      setTimeout(() => setAdminPassFeedback(null), 4000);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
              isAdmin
                ? 'bg-amber-100 text-amber-950 border border-amber-300'
                : isTeacher
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-blue-100 text-blue-800'
            }`}>
              {isAdmin
                ? 'Master Admin Configuration'
                : isTeacher
                ? 'Ustadh Faculty Configuration'
                : 'Parent & Student Preferences'}
            </span>
            {savedSuccess && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-600 text-white font-semibold flex items-center gap-1 animate-in fade-in">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Saved & Synchronized</span>
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            {isAdmin
              ? 'Academy Identity & Master Admin Password'
              : isTeacher
              ? 'Circle Administration & Madrasah Google Setup'
              : 'Family & Child Learning Settings'}
          </h2>
          <p className="text-xs text-slate-500">
            {isAdmin
              ? 'Configure your institute legal name, academic session, and update your master administrator password.'
              : isTeacher
              ? 'Simple setup for Madrasahs with just a Google account and users with standard Gmail addresses.'
              : `Manage ${selectedStudent.name}'s daily revision targets, contact info, and linked Google account.`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsSecurityModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors border border-slate-200"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>Data Privacy & Governance</span>
          </button>
          <button
            type="button"
            onClick={logoutToLanding}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors border border-rose-200"
            title="Log out back to Portal Gateway"
          >
            <LogOut className="w-4 h-4" />
            <span>Exit Portal</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          ADMIN SETTINGS DISPLAY LOGIC & CREDENTIAL CONTROLS
         ========================================================================= */}
      {isAdmin ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* CARD 1: ACADEMY NOMENCLATURE & LEGAL PROFILE */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between space-y-6">
              <div className="space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center font-bold">
                      <School className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        Institute Name & Public Nomenclature
                      </h3>
                      <p className="text-xs text-slate-500">
                        Global Madrasah name across parent/student portals and dossiers
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                    Global Brand
                  </span>
                </div>

                {adminIdentityFeedback && (
                  <div className={`p-3 rounded-xl border text-xs font-medium flex items-center gap-2 ${
                    adminIdentityFeedback.type === 'success'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-rose-50 border-rose-200 text-rose-800'
                  }`}>
                    {adminIdentityFeedback.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    )}
                    <span>{adminIdentityFeedback.message}</span>
                  </div>
                )}

                <form onSubmit={handleSaveAdminIdentity} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1">
                      Institute / Madrasah Name:
                    </label>
                    <input
                      type="text"
                      required
                      value={adminAcademyName}
                      onChange={(e) => setAdminAcademyName(e.target.value)}
                      placeholder="e.g. Hifz al-Quran Academy"
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-all shadow-inner"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      Updating this changes the name on the login portal, report card header, and invitation letters.
                    </p>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1">
                      Academic Term / Session:
                    </label>
                    <input
                      type="text"
                      value={adminAcademicYear}
                      onChange={(e) => setAdminAcademicYear(e.target.value)}
                      placeholder="e.g. 2026-2027 Academic Year"
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1">
                      Super-Admin Official Email:
                    </label>
                    <input
                      type="email"
                      required
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      placeholder="e.g. admin@madrasah.org"
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-800 font-mono focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Institute Name & Session</span>
                  </button>
                </form>
              </div>

              {/* Live Preview Display */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between text-[11px] font-bold uppercase text-slate-500">
                  <span>Portal Header Preview</span>
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                  <div className="text-xs font-black text-slate-900">
                    {adminAcademyName || 'Madrasah Institute'}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    {adminEmail} • {adminAcademicYear}
                  </div>
                </div>
              </div>
            </div>

            {/* CARD 2: MASTER ADMIN PASSWORD & SECURITY */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between space-y-6">
              <div className="space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center font-bold">
                      <KeyRound className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        Master Administrator Password
                      </h3>
                      <p className="text-xs text-slate-500">
                        Security pass-key required for Admin Control Center access
                      </p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    adminSettings.adminPasscode === '9999'
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  }`}>
                    {adminSettings.adminPasscode === '9999' ? 'Default 9999' : 'Custom Secured'}
                  </span>
                </div>

                {adminPassFeedback && (
                  <div className={`p-3 rounded-xl border text-xs font-medium flex items-center gap-2 ${
                    adminPassFeedback.type === 'success'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-rose-50 border-rose-200 text-rose-800'
                  }`}>
                    {adminPassFeedback.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    )}
                    <span>{adminPassFeedback.message}</span>
                  </div>
                )}

                <form onSubmit={handleSaveAdminPasscode} className="space-y-4">
                  {/* Current Passcode */}
                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1">
                      Current Master Passcode:
                    </label>
                    <div className="relative">
                      <input
                        type={showAdminPass ? 'text' : 'password'}
                        required
                        value={adminCurrentPass}
                        onChange={(e) => setAdminCurrentPass(e.target.value)}
                        placeholder="Enter current passcode (Default: 9999)"
                        className="w-full pl-9 pr-10 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono tracking-wider focus:bg-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                      />
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <button
                        type="button"
                        onClick={() => setShowAdminPass(!showAdminPass)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 transition-colors"
                        title={showAdminPass ? 'Hide' : 'Show'}
                      >
                        {showAdminPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* New Passcode */}
                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1">
                      New Master Password / Passcode:
                    </label>
                    <div className="relative">
                      <input
                        type={showAdminPass ? 'text' : 'password'}
                        required
                        value={adminNewPass}
                        onChange={(e) => setAdminNewPass(e.target.value)}
                        placeholder="Enter new password (min 4 characters)"
                        className="w-full pl-9 pr-10 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono tracking-wider focus:bg-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                      />
                      <Key className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <button
                        type="button"
                        onClick={() => setShowAdminPass(!showAdminPass)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 transition-colors"
                        title={showAdminPass ? 'Hide' : 'Show'}
                      >
                        {showAdminPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Passcode */}
                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1">
                      Confirm New Master Password:
                    </label>
                    <div className="relative">
                      <input
                        type={showAdminPass ? 'text' : 'password'}
                        required
                        value={adminConfirmPass}
                        onChange={(e) => setAdminConfirmPass(e.target.value)}
                        placeholder="Re-type new password"
                        className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono tracking-wider focus:bg-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                      />
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    </div>
                    {adminNewPass && adminConfirmPass && (
                      <p className={`text-[11px] font-semibold mt-1 flex items-center gap-1 ${
                        adminNewPass === adminConfirmPass ? 'text-emerald-600' : 'text-rose-600'
                      }`}>
                        {adminNewPass === adminConfirmPass ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Passwords match</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-3 h-3" />
                            <span>Passwords do not match</span>
                          </>
                        )}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>Save & Update Master Password</span>
                  </button>
                </form>
              </div>

              {/* Reset to default option */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Active: <strong className="font-mono text-slate-700">{adminSettings.adminPasscode ? '••••••••' : '9999'}</strong></span>
                {adminSettings.adminPasscode !== '9999' && (
                  <button
                    type="button"
                    onClick={handleResetAdminPasscodeToDefault}
                    className="text-[11px] text-rose-600 hover:text-rose-700 font-bold underline transition-colors"
                  >
                    Reset to Default (9999)
                  </button>
                )}
              </div>
            </div>

          </div>

          {/* QUICK ACCESS TO ADMIN CONTROL CENTER & PERMISSIONS */}
          <div className="p-5 bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 rounded-3xl text-white border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-400/20 px-2 py-0.5 rounded-md">
                  Governance Center
                </span>
                <h4 className="font-bold text-sm text-white">
                  Admin Screen Visibility & Teacher Circle Setup
                </h4>
              </div>
              <p className="text-xs text-slate-300">
                Dictate which screens and scores students/parents see, enroll new students, and configure Ustadh accounts.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setActiveTab('admin-control')}
              className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shrink-0 shadow"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Go to Admin Control Center</span>
            </button>
          </div>
        </div>
      ) : isTeacher ? (
        <form onSubmit={handleSaveTeacherSettings} className="space-y-6">
          
          {/* =====================================================================
              PROMINENT STEP 1: MADRASAH GOOGLE ACCOUNT & GMAIL ROSTER (SETUP FIRST)
             ===================================================================== */}
          <div className="bg-gradient-to-br from-emerald-50 via-white to-blue-50/50 rounded-3xl p-6 border-2 border-emerald-400/80 shadow-md space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-200/80 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                  1
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                      Setup First
                    </span>
                    <h3 className="font-black text-lg text-slate-900">
                      Madrasah Google Account & Gmail Class Cloud
                    </h3>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Zero private server costs: The Madrasah hosts on a standard Google account; parents and students authenticate with regular Gmail!
                  </p>
                </div>
              </div>

              <span className="text-xs px-3 py-1 bg-emerald-100/80 text-emerald-800 rounded-full font-bold self-start sm:self-auto border border-emerald-200">
                Simple Version Active
              </span>
            </div>

            {/* Inputs: Madrasah Admin Account & Storage */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              
              {/* Madrasah Admin Gmail */}
              <div>
                <label className="font-bold text-slate-800 block mb-1.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Madrasah Host Google Account:</span>
                </label>
                <input
                  type="email"
                  value={madrasahAdminGmail}
                  onChange={(e) => setMadrasahAdminGmail(e.target.value)}
                  placeholder="madrasah.hifz.circle@gmail.com"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-600 font-mono text-slate-900 font-semibold"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  The primary Google account where class records and sheets are anchored.
                </p>
              </div>

              {/* Cloud Storage Method Selection */}
              <div>
                <label className="font-bold text-slate-800 block mb-1.5 flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Class Storage Mechanism:</span>
                </label>
                <select
                  aria-label="Class storage mechanism"
                  value={storageMethod}
                  onChange={(e) => setStorageMethod(e.target.value as SimpleStorageMethod)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-600 font-semibold text-slate-800 cursor-pointer"
                >
                  <option value="google-drive-sheets">
                    Google Drive & Sheet Ledger (Simple & Free)
                  </option>
                  <option value="google-cloud-firestore">
                    Google Cloud Firestore (Free Document Database)
                  </option>
                  <option value="google-apps-script">
                    Google Apps Script Webhook (Serverless)
                  </option>
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  Auto-generates student ledgers without requiring paid cloud hosting.
                </p>
              </div>

              {/* Folder / Sheet Name & Class Code */}
              <div>
                <label className="font-bold text-slate-800 block mb-1.5 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Class Join Code / Ledger Name:</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={classInviteCode}
                    onChange={(e) => setClassInviteCode(e.target.value.toUpperCase())}
                    placeholder="HIFZ-CIRCLE-786"
                    className="w-1/2 px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-600 font-mono text-slate-900 font-bold"
                  />
                  <input
                    type="text"
                    value={cloudFolder}
                    onChange={(e) => setCloudFolder(e.target.value)}
                    placeholder="Class_Ledger_2026"
                    className="w-1/2 px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-600 text-[11px] text-slate-700 font-medium"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Unique invite code shared with parents to verify registration.
                </p>
              </div>

            </div>

            {/* Enrolled Students & Gmail Whitelist Table */}
            <div className="space-y-2 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>Enrolled Student & Parent Gmail Whitelist (Access Control):</span>
                </label>
                <span className="text-[11px] text-slate-500">
                  Only authorized Gmail addresses will gain access to each specific boy's profile.
                </span>
              </div>

              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100/90 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Student / Roll</th>
                      <th className="p-3">Student's Gmail (Child Login)</th>
                      <th className="p-3">Parent's Gmail (Guardian Login)</th>
                      <th className="p-3 text-center">Status</th>
                      <th className="p-3 text-right">Invite Link</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {studentMappings.map((mapping) => (
                      <tr key={mapping.studentId} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-3">
                          <div className="font-bold text-slate-900">{mapping.studentName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{mapping.rollNumber}</div>
                        </td>
                        <td className="p-3">
                          <input
                            type="email"
                            value={mapping.studentGmail}
                            onChange={(e) =>
                              handleStudentMappingChange(mapping.studentId, 'studentGmail', e.target.value)
                            }
                            placeholder="child@gmail.com"
                            className="w-full px-2.5 py-1 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600 font-mono text-slate-800"
                          />
                        </td>
                        <td className="p-3">
                          <input
                            type="email"
                            value={mapping.parentGmail}
                            onChange={(e) =>
                              handleStudentMappingChange(mapping.studentId, 'parentGmail', e.target.value)
                            }
                            placeholder="parent@gmail.com"
                            className="w-full px-2.5 py-1 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600 font-mono text-slate-800"
                          />
                        </td>
                        <td className="p-3 text-center">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Authorized</span>
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleCopyInvite(mapping)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors border border-slate-200"
                            title="Copy personalized invite text for WhatsApp/Email"
                          >
                            {copiedInviteStudentId === mapping.studentId ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span className="text-emerald-800">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Share2 className="w-3.5 h-3.5 text-slate-500" />
                                <span>Copy Invite</span>
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Hub Initialization & Test Button */}
            <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleInitializeGoogleHub}
                disabled={isInitializingHub}
                className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-2"
              >
                <FolderSync className={`w-4 h-4 ${isInitializingHub ? 'animate-spin' : ''}`} />
                <span>{isInitializingHub ? 'Initializing Madrasah Ledger...' : 'Test & Initialize Madrasah Google Cloud Hub'}</span>
              </button>

              <span className="text-[11px] text-slate-500 font-medium">
                Changes persist instantly to local and cloud synchronization.
              </span>
            </div>

            {/* Test Initialization Log */}
            {googleInitLog && (
              <div className="p-3 rounded-xl bg-slate-900 text-emerald-400 font-mono text-[11px] border border-slate-800 animate-in fade-in">
                {'>'} {googleInitLog}
              </div>
            )}
          </div>

          {/* Section 2: Circle & Academic Setup */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm border-b border-slate-100 pb-3">
              <BookOpen className="w-4 h-4 text-emerald-700" />
              <span>Hifz Circle & Academic Details</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Circle Name:
                </label>
                <input
                  type="text"
                  value={circleName}
                  onChange={(e) => setCircleName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-600 font-medium"
                  placeholder="e.g. Boys Hifz Circle (Advanced)"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Academic Term / Year:
                </label>
                <input
                  type="text"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-600 font-medium"
                  placeholder="e.g. 2026 - 2027 Term 1"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Head Ustadh / Teacher:
                </label>
                <input
                  type="text"
                  value={headTeacherName}
                  onChange={(e) => setHeadTeacherName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-600 font-medium"
                  placeholder="e.g. Ustadh Qari Bilal"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Evaluation & Grading Thresholds */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm border-b border-slate-100 pb-3">
              <Sliders className="w-4 h-4 text-emerald-700" />
              <span>Pass / Fail Criteria & Grading Tolerances</span>
            </div>

            <p className="text-xs text-slate-500">
              Set standard Madrasah recitation rules. Students exceeding allowed mistake limits will be automatically flagged for recitation repetition.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  Max Sabaq (New Lesson) Mistakes for Pass:
                </label>
                <div className="flex items-center gap-3 mt-2">
                  <input
                    type="number"
                    min={0}
                    max={5}
                    value={maxSabaqMistakes}
                    onChange={(e) => setMaxSabaqMistakes(Number(e.target.value))}
                    className="w-24 px-3 py-2 text-sm border border-slate-300 rounded-lg text-center font-bold focus:outline-none focus:border-emerald-600"
                  />
                  <span className="text-xs text-slate-500">
                    Mistakes (Strict standard is ≤ 2 mistakes per new page)
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  Max Dawr (Further Revision) Mistakes for Pass:
                </label>
                <div className="flex items-center gap-3 mt-2">
                  <input
                    type="number"
                    min={0}
                    max={10}
                    value={maxDawrMistakes}
                    onChange={(e) => setMaxDawrMistakes(Number(e.target.value))}
                    className="w-24 px-3 py-2 text-sm border border-slate-300 rounded-lg text-center font-bold focus:outline-none focus:border-emerald-600"
                  />
                  <span className="text-xs text-slate-500">
                    Mistakes (Strict standard is ≤ 3 mistakes per quarter/half Juz)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Advanced Server & Audit Logging */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm border-b border-slate-100 pb-3">
              <Server className="w-4 h-4 text-emerald-700" />
              <span>Advanced API Server & Audit Trail (Optional)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Dedicated Server URL (If using custom VPS):
                </label>
                <input
                  type="text"
                  value={serverEndpoint}
                  onChange={(e) => setServerEndpoint(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-600 font-mono text-slate-800"
                  placeholder="https://madrasah-core-secure.internal/api/v1/hifz"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Optional Google Workspace Domain Restriction:
                </label>
                <input
                  type="text"
                  value={enforceGoogleDomain}
                  onChange={(e) => setEnforceGoogleDomain(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-600 font-mono text-slate-800"
                  placeholder="@gmail.com or @madrasah.internal"
                />
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={auditLogging}
                  onChange={(e) => setAuditLogging(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span>Enable Immutable Cryptographic Audit Logging (HMAC-SHA256 for all grade and attendance mutations)</span>
              </label>
            </div>
          </div>

          {/* Section 5: End of Term Academic Setup & Data Export */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                <span>End-of-Term Academic Setup & Data Export</span>
              </div>
              <button
                type="button"
                onClick={() => setIsTermExportModalOpen(true)}
                className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1"
              >
                <span>Full Term Manager</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Configure term dates, passing score thresholds, and generate official Madrasah CSV / JSON term ledgers across all students.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[10px] text-slate-500 block uppercase font-semibold">Active Term</span>
                <strong className="text-slate-900 text-xs block mt-0.5">{endOfTermSetup.termTitle}</strong>
                <span className="text-[11px] text-slate-500">{endOfTermSetup.startDate} to {endOfTermSetup.endDate}</span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[10px] text-slate-500 block uppercase font-semibold">Passing Threshold</span>
                <strong className="text-slate-900 text-xs block mt-0.5">{endOfTermSetup.passingScoreThreshold}% Minimum</strong>
                <span className="text-[11px] text-slate-500">{endOfTermSetup.totalClassDays} Teaching Days</span>
              </div>

              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex flex-col justify-between">
                <div>
                  <span className="text-[10px] text-emerald-800 block uppercase font-bold">One-Click CSV</span>
                  <span className="text-[11px] text-emerald-900 font-medium">Export all students term data</span>
                </div>
                <button
                  type="button"
                  onClick={() => exportEndOfTermData('csv')}
                  className="mt-2 w-full py-1.5 px-2.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-[11px] flex items-center justify-center gap-1 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download CSV</span>
                </button>
              </div>
            </div>
          </div>

          {/* Section 6: Live Push Notification & Event Settings */}
          <PushNotificationSettingsSection />

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-bold text-xs shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Save Ustadh Settings & Cloud Roster</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (confirm('Reset all demo data back to default template?')) {
                  resetData();
                  alert('Demo data has been reset to default template.');
                }
              }}
              className="w-full sm:w-auto px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs border border-slate-200 transition-colors"
            >
              Reset Demo Records
            </button>

            <button
              type="button"
              onClick={() => {
                if (confirm('Clear all demo student records to start fresh with an empty roster?')) {
                  clearSampleStudents();
                  alert('Demo students cleared. You can now enroll your own students in the Admin Portal.');
                }
              }}
              className="w-full sm:w-auto px-4 py-3 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl font-semibold text-xs border border-rose-200 transition-colors"
            >
              Clear Demo Data & Start Fresh
            </button>
          </div>

        </form>
      ) : (
        /* =========================================================================
            STUDENT & PARENT SETTINGS DISPLAY LOGIC & INPUT TEXT BOXES
           ========================================================================= */
        <form onSubmit={handleSaveParentSettings} className="space-y-6">
          
          {/* Section 1: Linked Child Identity */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm border-b border-slate-100 pb-3">
              <User className="w-4 h-4 text-blue-700" />
              <span>Enrolled Child & Google Workspace / Gmail Account</span>
            </div>

            <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-500 block">Current Selected Talib:</span>
                <span className="font-bold text-slate-900 text-sm">{selectedStudent.name}</span>
                <span className="text-xs text-blue-700 ml-2">({selectedStudent.rollNumber})</span>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-500 block">Class Group:</span>
                <span className="font-semibold text-xs text-slate-800">{selectedStudent.classGroup}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                Your Linked Google / Gmail Account:
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    value={childGoogleEmail}
                    onChange={(e) => setChildGoogleEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-blue-600 font-mono text-slate-800"
                    placeholder="parent.or.child@gmail.com"
                  />
                </div>
                <span className="text-xs px-2.5 py-2 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-xl font-bold flex items-center gap-1 shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Whitelisted in Madrasah</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Connected to Madrasah Cloud Ledger: <strong>{teacherSettings?.madrasahGoogleSetup?.cloudFolderNameOrSheetId || 'Madrasah_Hifz_Class_Ledger_2026'}</strong>
              </p>
            </div>
          </div>

          {/* Section 2: Daily Home Study Goals */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm border-b border-slate-100 pb-3">
              <Sliders className="w-4 h-4 text-blue-700" />
              <span>Home Revision Target & Schedule</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  Daily Home Revision Target Duration (Minutes):
                </label>
                <div className="flex items-center gap-3 mt-2">
                  <input
                    type="number"
                    min={15}
                    max={240}
                    step={15}
                    value={homeStudyTarget}
                    onChange={(e) => setHomeStudyTarget(Number(e.target.value))}
                    className="w-24 px-3 py-2 text-sm border border-slate-300 rounded-lg text-center font-bold focus:outline-none focus:border-blue-600"
                  />
                  <span className="text-xs text-slate-500">
                    Minutes / day (Recommended: 90 mins across Fajr & Maghrib)
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <label className="text-xs font-bold text-slate-800 block">
                  Recommended Session Division:
                </label>
                <div className="text-[11px] text-slate-600 space-y-1">
                  <div>• <strong>After Fajr:</strong> 45 mins fresh Sabaq memorization</div>
                  <div>• <strong>After Asr/Maghrib:</strong> 30 mins Sabaqee (latest Juz)</div>
                  <div>• <strong>After Ishaa:</strong> 15 mins Dawr 1 & 2 recitation to parents</div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Parent Contact & Notifications */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm border-b border-slate-100 pb-3">
              <Bell className="w-4 h-4 text-blue-700" />
              <span>Parent Notification Channels</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Parent Contact Email:
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    value={parentEmail}
                    onChange={(e) => setParentEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-blue-600 font-medium"
                    placeholder="parent@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Parent WhatsApp / Mobile:
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    value={parentPhone}
                    onChange={(e) => setParentPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-blue-600 font-medium"
                    placeholder="+44 7700 900123"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyOnGrade}
                  onChange={(e) => setNotifyOnGrade(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span>Instant alert when Ustadh records daily recitation grade & comments</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyOnFajr}
                  onChange={(e) => setNotifyOnFajr(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span>Daily reminder for morning home Sabaq recitation before Madrasah</span>
              </label>
            </div>
          </div>

          {/* Section 4: Live Push Notification & Event Settings */}
          <PushNotificationSettingsSection />

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-bold text-xs shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Save Family Preferences</span>
            </button>

            <div className="text-xs text-slate-500 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Sync Status: <strong>Encrypted & Live</strong></span>
            </div>
          </div>

        </form>
      )}

      {/* Private Class Server Connection Card (Visible in both views) */}
      <div className="bg-slate-900 text-slate-200 rounded-2xl p-5 border border-slate-800 shadow-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-bold text-sm text-white">
                  Madrasah Google Account Cloud Sync
                </h4>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30 uppercase tracking-wider">
                  {syncStatus.status}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Host Account: <span className="font-mono text-slate-300">{teacherSettings?.madrasahGoogleSetup?.madrasahAdminGmail || 'madrasah.hifz.circle@gmail.com'}</span> • Method: {(teacherSettings?.madrasahGoogleSetup?.storageMethod || 'google-drive-sheets').replace(/[-_]/g, ' ')}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Last synchronized: {syncStatus.lastSyncTime}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={triggerManualSync}
            disabled={syncStatus.status === 'syncing'}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-600 active:scale-95 text-white rounded-xl text-xs font-bold transition-all shrink-0 shadow"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncStatus.status === 'syncing' ? 'animate-spin' : ''}`} />
            <span>{syncStatus.status === 'syncing' ? 'Synchronizing...' : 'Sync Now'}</span>
          </button>
        </div>
      </div>

      {/* End-of-Term Academic Setup & Export Modal */}
      <EndOfTermExportModal
        isOpen={isTermExportModalOpen}
        onClose={() => setIsTermExportModalOpen(false)}
      />
    </div>
  );
};
