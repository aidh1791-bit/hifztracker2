import React, { useState } from 'react';
import { useHifz } from '../context/HifzContext';
import {
  ShieldAlert,
  Users,
  GraduationCap,
  Sliders,
  UserPlus,
  Trash2,
  Mail,
  Send,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  RotateCcw,
  Sparkles,
  School,
  AlertCircle,
  Clock,
  BookOpen,
  Settings,
  Lock,
  Copy,
  Check,
  Save,
  Building2,
  ShieldCheck,
  Key,
  Trophy,
  Award,
  Crown,
  Star,
  Shield
} from 'lucide-react';
import { TeacherAccount, AdminPortalPermissions, IslamicTrophyTier, Student } from '../types';
import { DEFAULT_ISLAMIC_TROPHIES } from '../utils/meritTrophies';
import { buildMailtoUrl } from '../utils/exportHelpers';
import { SafeDeleteStudentModal } from './SafeDeleteStudentModal';
import { dataRepository } from '../services/dataRepository';

export const AdminControlView: React.FC = () => {
  const {
    students,
    adminSettings,
    updateAdminSettings,
    updateAdminPermissions,
    updateTrophies,
    addTeacherAccount,
    deleteTeacherAccount,
    addStudent,
    deleteStudent,
    clearSampleStudents,
    resetToSampleStudents,
    simulateEmailSent
  } = useHifz();

  const [activeSubTab, setActiveSubTab] = useState<'institute' | 'permissions' | 'trophies' | 'teachers' | 'students' | 'add-student'>('institute');
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  // Islamic Trophy Management State
  const [trophyList, setTrophyList] = useState<IslamicTrophyTier[]>(
    adminSettings.trophies && adminSettings.trophies.length > 0
      ? adminSettings.trophies
      : DEFAULT_ISLAMIC_TROPHIES
  );
  const [trophyFeedback, setTrophyFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Institute Name & Master Password Editing State
  const [instituteName, setInstituteName] = useState(adminSettings.academyName);
  const [academicYear, setAcademicYear] = useState(adminSettings.academicYear || '2026-2027 Academic Year');
  const [adminEmail, setAdminEmail] = useState(adminSettings.adminEmail);
  const [currentPasscode, setCurrentPasscode] = useState('');
  const [newPasscode, setNewPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [showCurrentPasscode, setShowCurrentPasscode] = useState(false);
  const [showNewPasscode, setShowNewPasscode] = useState(false);
  const [instituteFeedback, setInstituteFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [passwordFeedback, setPasswordFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // New Student Form State (Parent First)
  const [newStudentName, setNewStudentName] = useState('');
  const [newParentName, setNewParentName] = useState('');
  const [newParentEmail, setNewParentEmail] = useState('');
  const [newParentPhone, setNewParentPhone] = useState('+44 ');
  const [hasStudentEmail, setHasStudentEmail] = useState(false);
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [selectedTeacherId, setSelectedTeacherId] = useState(adminSettings.teachers[0]?.id || 'tch-1');
  const [newCurrentJuz, setNewCurrentJuz] = useState(1);
  const [newCurrentSurah, setNewCurrentSurah] = useState('Surah Al-Baqarah');
  const [newTargetJuz, setNewTargetJuz] = useState(6);

  // Success & Invite preview modal / banner
  const [lastEnrolledStudent, setLastEnrolledStudent] = useState<{
    name: string;
    enrollmentCode: string;
    parentEmail: string;
    circleCode: string;
    teacherName: string;
    inviteLetter: string;
    studentId: string;
  } | null>(null);

  const [copiedCode, setCopiedCode] = useState(false);

  // New Teacher Form State
  const [newTeacherName, setNewTeacherName] = useState('');
  const [newTeacherEmail, setNewTeacherEmail] = useState('');
  const [newCircleName, setNewCircleName] = useState('');
  const [newCircleCode, setNewCircleCode] = useState('');
  const [newTeacherPasscode, setNewTeacherPasscode] = useState('1234');
  const [newJuzFocus, setNewJuzFocus] = useState('Juz 1 to 10 (Junior Hifz)');

  const permissions = adminSettings.permissions;

  const handleSaveInstituteDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (!instituteName.trim()) {
      setInstituteFeedback({ type: 'error', message: 'Institute name cannot be empty.' });
      return;
    }
    updateAdminSettings({
      academyName: instituteName.trim(),
      academicYear: academicYear.trim(),
      adminEmail: adminEmail.trim().toLowerCase()
    });
    setInstituteFeedback({
      type: 'success',
      message: `Institute Name successfully updated to "${instituteName.trim()}". All portals, reports, and invitation letters now reflect this name.`
    });
    setTimeout(() => setInstituteFeedback(null), 5000);
  };

  const handleUpdateAdminPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordFeedback(null);

    const activePass = adminSettings.adminPasscode || '9999';
    if (currentPasscode.trim() !== activePass) {
      setPasswordFeedback({
        type: 'error',
        message: 'Current Master Passcode is incorrect. Please verify your current password.'
      });
      return;
    }

    if (newPasscode.length < 4) {
      setPasswordFeedback({
        type: 'error',
        message: 'New password must be at least 4 characters long.'
      });
      return;
    }

    if (newPasscode !== confirmPasscode) {
      setPasswordFeedback({
        type: 'error',
        message: 'New password and confirmation password do not match.'
      });
      return;
    }

    updateAdminSettings({
      adminPasscode: newPasscode
    });

    setCurrentPasscode('');
    setNewPasscode('');
    setConfirmPasscode('');
    setPasswordFeedback({
      type: 'success',
      message: 'Master Administrator Password successfully changed! Please use this new password next time you sign in.'
    });
    setTimeout(() => setPasswordFeedback(null), 6000);
  };

  const handleResetPasswordToDefault = () => {
    if (window.confirm('Reset Master Admin Passcode back to factory default "9999"?')) {
      updateAdminSettings({ adminPasscode: '9999' });
      setCurrentPasscode('');
      setNewPasscode('');
      setConfirmPasscode('');
      setPasswordFeedback({
        type: 'success',
        message: 'Master Admin Passcode has been reset to default "9999".'
      });
      setTimeout(() => setPasswordFeedback(null), 4000);
    }
  };

  const handleToggleStudentParentPerm = (key: keyof AdminPortalPermissions['studentParent']) => {
    updateAdminPermissions({
      studentParent: {
        ...permissions.studentParent,
        [key]: !permissions.studentParent[key]
      }
    });
  };

  const handleToggleTeacherPerm = (key: keyof AdminPortalPermissions['teacher']) => {
    updateAdminPermissions({
      teacher: {
        ...permissions.teacher,
        [key]: !permissions.teacher[key]
      }
    });
  };

  const handleCreateTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeacherName.trim() || !newTeacherEmail.trim()) return;

    const generatedCircleCode = newCircleCode.trim() || `CIRCLE-HIFZ-${adminSettings.teachers.length + 1}`;
    const generatedCircleName = newCircleName.trim() || `Circle ${adminSettings.teachers.length + 1} (${newTeacherName.split(' ')[0]})`;

    addTeacherAccount({
      name: newTeacherName.trim(),
      email: newTeacherEmail.trim().toLowerCase(),
      circleName: generatedCircleName,
      circleCode: generatedCircleCode.toUpperCase(),
      passcode: newTeacherPasscode || '1234',
      juzFocusRange: newJuzFocus,
      active: true,
      status: 'active' as const
    });

    setNewTeacherName('');
    setNewTeacherEmail('');
    setNewCircleName('');
    setNewCircleCode('');
  };

  const handleEnrollStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim() || !newParentName.trim() || !newParentEmail.trim()) return;

    const assignedTeacher = adminSettings.teachers.find(t => t.id === selectedTeacherId) || adminSettings.teachers[0];

    const result = addStudent({
      name: newStudentName,
      parentName: newParentName,
      parentEmail: newParentEmail,
      parentPhone: newParentPhone,
      studentEmail: hasStudentEmail && newStudentEmail.trim() ? newStudentEmail : undefined,
      teacherName: assignedTeacher.name,
      teacherEmail: assignedTeacher.email,
      circleCode: assignedTeacher.circleCode,
      classGroup: assignedTeacher.circleName,
      currentJuz: newCurrentJuz,
      currentSurah: newCurrentSurah,
      targetYearlyJuz: newTargetJuz
    });

    setLastEnrolledStudent({
      name: result.student.name,
      enrollmentCode: result.enrollmentCode,
      parentEmail: result.student.parentEmail,
      circleCode: result.student.circleCode,
      teacherName: result.student.teacherName,
      inviteLetter: result.inviteLetter,
      studentId: result.student.id
    });

    // Reset form
    setNewStudentName('');
    setNewParentName('');
    setNewParentEmail('');
    setNewParentPhone('+44 ');
    setNewStudentEmail('');
    setHasStudentEmail(false);
  };

  const handleCopyInvite = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const isSampleDataPresent = students.some(s => ['std-1', 'std-2', 'std-3'].includes(s.id));

  return (
    <div className="space-y-6 pb-12">
      {/* Top Admin Command Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 bg-amber-400 text-slate-950 rounded-full">
                  Master Administrator
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {adminSettings.adminEmail}
                </span>
              </div>
              <div className="flex items-center gap-3 flex-wrap mt-1">
                <h1 className="text-2xl sm:text-3xl font-black text-white">
                  {adminSettings.academyName}
                </h1>
                <button
                  type="button"
                  onClick={() => setActiveSubTab('institute')}
                  className="px-2.5 py-1 bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border border-amber-400/40 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
                  title="Change Institute Name and Admin Password"
                >
                  <School className="w-3.5 h-3.5" />
                  <span>Change Name & Password</span>
                </button>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-0.5">
                Dictate what is visible on teacher and student screens, set up teacher credentials, manage student rosters, and automatically supply class enrollment keys upon invite dispatch.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveSubTab('institute')}
              className="px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm"
              title="Change Institute Name and Admin Password"
            >
              <KeyRound className="w-4 h-4" />
              <span>Institute & Password</span>
            </button>

            {isSampleDataPresent ? (
              <button
                type="button"
                onClick={clearSampleStudents}
                className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm"
                title="Remove demo sample boys to start with a fresh blank roster"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Dummy / Sample Students</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={resetToSampleStudents}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-medium transition-all flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Restore Sample Data (Demo)</span>
              </button>
            )}
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-800 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveSubTab('institute')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeSubTab === 'institute'
                ? 'bg-amber-400 text-slate-950 shadow-md'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <School className="w-4 h-4" />
            <span>Institute Name & Password</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('permissions')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeSubTab === 'permissions'
                ? 'bg-amber-400 text-slate-950 shadow-md'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Screen Visibility & Permissions</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('trophies')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeSubTab === 'trophies'
                ? 'bg-amber-400 text-slate-950 shadow-md'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Islamic Merit & Trophy Tiers</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('teachers')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeSubTab === 'teachers'
                ? 'bg-amber-400 text-slate-950 shadow-md'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Teacher Email & Circle Setup ({adminSettings.teachers.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('students')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeSubTab === 'students'
                ? 'bg-amber-400 text-slate-950 shadow-md'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Enrolled Students Roster ({students.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('add-student')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeSubTab === 'add-student'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'bg-emerald-950/60 text-emerald-300 border border-emerald-800 hover:bg-emerald-900/60'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Enroll Student (Parent First)</span>
          </button>
        </div>
      </div>

      {/* Success Notification Modal / Card when Student Enrolled */}
      {lastEnrolledStudent && (
        <div className="bg-emerald-900 text-white rounded-2xl p-5 border border-emerald-700 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-700/80 flex items-center justify-center text-emerald-200 shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-black tracking-widest text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded">
                  Enrollment Code Generated Automatically
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">
                  {lastEnrolledStudent.name} successfully registered!
                </h3>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setLastEnrolledStudent(null)}
              className="text-xs text-emerald-200 hover:text-white px-2 py-1 bg-emerald-800 rounded-lg self-end sm:self-auto"
            >
              Dismiss
            </button>
          </div>

          <div className="bg-emerald-950/70 rounded-xl p-4 border border-emerald-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <span className="text-emerald-400 block text-[11px]">Secure Enrollment Key:</span>
              <span className="font-mono font-bold text-sm text-amber-300">{lastEnrolledStudent.enrollmentCode}</span>
            </div>
            <div>
              <span className="text-emerald-400 block text-[11px]">Registered Parent Email:</span>
              <span className="font-mono font-medium text-white">{lastEnrolledStudent.parentEmail}</span>
            </div>
            <div>
              <span className="text-emerald-400 block text-[11px]">Assigned Teacher & Circle:</span>
              <span className="font-medium text-white">{lastEnrolledStudent.teacherName} ({lastEnrolledStudent.circleCode})</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="text-xs text-emerald-200">
              When the parent opens the Student Portal, typing <strong>{lastEnrolledStudent.parentEmail}</strong> or code <strong>{lastEnrolledStudent.enrollmentCode}</strong> isolates strictly to their record.
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleCopyInvite(lastEnrolledStudent.inviteLetter)}
                className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-amber-300" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Copied Letter' : 'Copy Invitation Letter'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  simulateEmailSent(lastEnrolledStudent.studentId);
                  const mailto = buildMailtoUrl(
                    lastEnrolledStudent.parentEmail,
                    `Welcome to ${adminSettings.academyName} - Student Enrollment Key`,
                    lastEnrolledStudent.inviteLetter
                  );
                  window.location.href = mailto;
                }}
                className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Prepare Email to Parent</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 0: INSTITUTE NAME & MASTER ADMIN PASSWORD
         ========================================================================= */}
      {activeSubTab === 'institute' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* CARD 1: INSTITUTE IDENTITY & NOMENCLATURE */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200 flex flex-col justify-between space-y-6">
              <div className="space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center font-bold">
                      <School className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-slate-900">
                        Institute Name & Branding
                      </h2>
                      <p className="text-xs text-slate-500">
                        Global Madrasah nomenclature displayed across portals, dossiers, & certificates
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Global Brand
                  </span>
                </div>

                {instituteFeedback && (
                  <div className={`p-3 rounded-xl border text-xs font-medium flex items-center gap-2 ${
                    instituteFeedback.type === 'success'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-rose-50 border-rose-200 text-rose-800'
                  }`}>
                    {instituteFeedback.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    )}
                    <span>{instituteFeedback.message}</span>
                  </div>
                )}

                <form onSubmit={handleSaveInstituteDetails} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1">
                      Institute / Academy Full Name:
                    </label>
                    <input
                      type="text"
                      required
                      value={instituteName}
                      onChange={(e) => setInstituteName(e.target.value)}
                      placeholder="e.g. Hifz al-Quran Academy"
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-inner"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      This name is dynamically rendered on the portal gateway, top navigation, weekly evaluations, and invitation letters.
                    </p>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1">
                      Current Academic Term / Session:
                    </label>
                    <input
                      type="text"
                      value={academicYear}
                      onChange={(e) => setAcademicYear(e.target.value)}
                      placeholder="e.g. 2026-2027 Academic Year (Term 1)"
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1">
                      Official Administrator Contact Email:
                    </label>
                    <input
                      type="email"
                      required
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      placeholder="e.g. admin@madrasah.org"
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-800 font-mono focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      Official correspondence address attached to enrollment letters and administrative receipts.
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Institute Name & Session</span>
                  </button>
                </form>
              </div>

              {/* Live Preview Card */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
                <div className="flex items-center justify-between text-[11px] font-bold uppercase text-slate-500">
                  <span>Live Nomenclature Preview</span>
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1.5 shadow-2xs">
                  <div className="text-[10px] text-emerald-800 font-bold uppercase tracking-wide">
                    Portal Header & Evaluation Dossier
                  </div>
                  <div className="text-sm font-black text-slate-900 leading-snug">
                    {instituteName || 'Your Institute Name'}
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-2">
                    <span>{academicYear}</span>
                    <span>•</span>
                    <span className="font-mono">{adminEmail}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* CARD 2: MASTER ADMIN PASSWORD & SECURITY */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200 flex flex-col justify-between space-y-6">
              <div className="space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center font-bold">
                      <KeyRound className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-slate-900">
                        Change Master Admin Password
                      </h2>
                      <p className="text-xs text-slate-500">
                        Master pass-key required to enter the Admin Control Center
                      </p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    adminSettings.adminPasscode === '9999'
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  }`}>
                    {adminSettings.adminPasscode === '9999' ? 'Default PIN (9999)' : 'Custom Password Active'}
                  </span>
                </div>

                {passwordFeedback && (
                  <div className={`p-3 rounded-xl border text-xs font-medium flex items-center gap-2 ${
                    passwordFeedback.type === 'success'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-rose-50 border-rose-200 text-rose-800'
                  }`}>
                    {passwordFeedback.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    )}
                    <span>{passwordFeedback.message}</span>
                  </div>
                )}

                <form onSubmit={handleUpdateAdminPassword} className="space-y-4">
                  {/* Current Password */}
                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1">
                      Current Master Passcode / Password:
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPasscode ? 'text' : 'password'}
                        required
                        value={currentPasscode}
                        onChange={(e) => setCurrentPasscode(e.target.value)}
                        placeholder="Enter current password (Default: 9999)"
                        className="w-full pl-9 pr-10 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono tracking-wider focus:bg-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                      />
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPasscode(!showCurrentPasscode)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 transition-colors"
                        title={showCurrentPasscode ? 'Hide' : 'Show'}
                      >
                        {showCurrentPasscode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1">
                      New Master Password:
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPasscode ? 'text' : 'password'}
                        required
                        value={newPasscode}
                        onChange={(e) => setNewPasscode(e.target.value)}
                        placeholder="Enter new password (min 4 characters)"
                        className="w-full pl-9 pr-10 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono tracking-wider focus:bg-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                      />
                      <Key className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <button
                        type="button"
                        onClick={() => setShowNewPasscode(!showNewPasscode)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 transition-colors"
                        title={showNewPasscode ? 'Hide' : 'Show'}
                      >
                        {showNewPasscode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1">
                      Confirm New Master Password:
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPasscode ? 'text' : 'password'}
                        required
                        value={confirmPasscode}
                        onChange={(e) => setConfirmPasscode(e.target.value)}
                        placeholder="Re-type new password"
                        className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono tracking-wider focus:bg-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                      />
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    </div>
                    {newPasscode && confirmPasscode && (
                      <p className={`text-[11px] font-semibold mt-1 flex items-center gap-1 ${
                        newPasscode === confirmPasscode ? 'text-emerald-600' : 'text-rose-600'
                      }`}>
                        {newPasscode === confirmPasscode ? (
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
                    <span>Save & Activate New Master Password</span>
                  </button>
                </form>
              </div>

              {/* Reset to default option */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Active Passcode: <strong className="font-mono text-slate-700">{adminSettings.adminPasscode ? '••••••••' : '9999'}</strong></span>
                {adminSettings.adminPasscode !== '9999' && (
                  <button
                    type="button"
                    onClick={handleResetPasswordToDefault}
                    className="text-[11px] text-rose-600 hover:text-rose-700 font-bold underline transition-colors"
                  >
                    Reset to Factory Default (9999)
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 1: VISIBILITY & PERMISSIONS DICTATION
         ========================================================================= */}
      {activeSubTab === 'permissions' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* STUDENT & PARENT PORTAL VISIBILITY DICTATION */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center font-bold">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Student & Parent Screen Visibility
                  </h2>
                  <p className="text-xs text-slate-500">
                    Admin dictates what parents & boys can view upon logging in with their email
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                Strict Isolation
              </span>
            </div>

            <div className="space-y-3">
              {[
                {
                  key: 'canViewSabaqScores' as const,
                  title: 'Daily Sabaq, Sabaqee & Dawr Marks',
                  desc: 'Allow parents to view grading marks, mistakes count, and pass/fail indicators.'
                },
                {
                  key: 'canViewTeacherComments' as const,
                  title: 'Daily Ustadh Feedback & Notes',
                  desc: 'Allow parents to read the teacher notes recorded for daily recitations.'
                },
                {
                  key: 'canViewAttendance' as const,
                  title: 'Attendance Register & Monthly Tallies',
                  desc: 'Allow parents to see days present, absent, late, or excused.'
                },
                {
                  key: 'canViewTarbiyahHome' as const,
                  title: 'Home Tarbiyah & Salaah Log Access',
                  desc: 'Allow families to log daily prayers, Dhikr, Sadaqah, and revision minutes.'
                },
                {
                  key: 'canViewWeeklyEvaluation' as const,
                  title: 'Weekly Evaluation Dossiers',
                  desc: 'Allow access to the weekly holistic report card and summary dossier.'
                },
                {
                  key: 'canSignEvaluation' as const,
                  title: 'Digital Parent Signature',
                  desc: 'Allow parents to electronically sign the weekly report.'
                },
                {
                  key: 'canSubmitInquiries' as const,
                  title: 'Parent Direct Inquiry Modal',
                  desc: 'Enable parents to submit inquiries and home study tasks directly to the Ustadh.'
                },
                {
                  key: 'showOverallClassComparison' as const,
                  title: 'Peer Benchmark Comparison',
                  desc: 'If disabled, students view ONLY their private records without any class rankings.'
                }
              ].map(item => {
                const isEnabled = permissions.studentParent[item.key];
                return (
                  <div
                    key={item.key}
                    onClick={() => handleToggleStudentParentPerm(item.key)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isEnabled
                        ? 'bg-blue-50/40 border-blue-200'
                        : 'bg-slate-50 border-slate-200 opacity-70'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        {isEnabled ? <Eye className="w-3.5 h-3.5 text-blue-600" /> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
                        <span>{item.title}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-snug">{item.desc}</p>
                    </div>

                    <div
                      className={`w-11 h-6 rounded-full transition-colors flex items-center px-1 shrink-0 ${
                        isEnabled ? 'bg-blue-600 justify-end' : 'bg-slate-300 justify-start'
                      }`}
                    >
                      <div className="w-4 h-4 rounded-full bg-white shadow-xs" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* TEACHER SCREEN VISIBILITY & AUTHORITY DICTATION */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center font-bold">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Teacher Screen Permissions
                  </h2>
                  <p className="text-xs text-slate-500">
                    Admin dictates what actions and controls are granted to teachers
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                Circle Level
              </span>
            </div>

            <div className="space-y-3">
              {[
                {
                  key: 'canEditAttendance' as const,
                  title: 'Record & Modify Attendance',
                  desc: 'Grant authority to mark Present, Absent, Late, or Excused.'
                },
                {
                  key: 'canGradeDailyHifz' as const,
                  title: 'Grade Sabaq, Sabaqee & Dawr',
                  desc: 'Authority to enter daily recitation marks and mistakes.'
                },
                {
                  key: 'canEditWeeklyEvaluation' as const,
                  title: 'Edit Weekly Dossiers',
                  desc: 'Authority to write overall weekly feedback and conduct grading.'
                },
                {
                  key: 'canDeleteStudents' as const,
                  title: 'Delete Student Records',
                  desc: 'If disabled, only the Madrasah Admin can remove students.'
                },
                {
                  key: 'canExportTermArchive' as const,
                  title: 'Export End-of-Term CSV/JSON',
                  desc: 'Allow teacher to download the class term dossier.'
                },
                {
                  key: 'canViewParentContactInfo' as const,
                  title: 'View Parent Phone & Private Email',
                  desc: 'Display registered family contact info directly inside teacher view.'
                },
                {
                  key: 'canManageClassRoster' as const,
                  title: 'Add / Enroll New Students to Circle',
                  desc: 'Allow teacher to directly enroll new students into their specific circle code.'
                }
              ].map(item => {
                const isEnabled = permissions.teacher[item.key];
                return (
                  <div
                    key={item.key}
                    onClick={() => handleToggleTeacherPerm(item.key)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isEnabled
                        ? 'bg-emerald-50/40 border-emerald-200'
                        : 'bg-slate-50 border-slate-200 opacity-70'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        {isEnabled ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" /> : <AlertCircle className="w-3.5 h-3.5 text-slate-400" />}
                        <span>{item.title}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-snug">{item.desc}</p>
                    </div>

                    <div
                      className={`w-11 h-6 rounded-full transition-colors flex items-center px-1 shrink-0 ${
                        isEnabled ? 'bg-emerald-700 justify-end' : 'bg-slate-300 justify-start'
                      }`}
                    >
                      <div className="w-4 h-4 rounded-full bg-white shadow-xs" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB: ISLAMIC MERIT & TROPHY TIERS CONFIGURATION
         ========================================================================= */}
      {activeSubTab === 'trophies' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Islamic Honor Tiers & Merit Thresholds
                  </h2>
                  <p className="text-xs text-slate-500">
                    Define Madrasah recognition levels and points required for students to unlock honors.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setTrophyList(DEFAULT_ISLAMIC_TROPHIES);
                    updateTrophies(DEFAULT_ISLAMIC_TROPHIES);
                    setTrophyFeedback({ type: 'success', message: 'Trophies reset to standard Islamic Honor tiers.' });
                    setTimeout(() => setTrophyFeedback(null), 4000);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Defaults</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    updateTrophies(trophyList);
                    setTrophyFeedback({ type: 'success', message: 'Trophy tiers and thresholds saved successfully.' });
                    setTimeout(() => setTrophyFeedback(null), 4000);
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Tiers</span>
                </button>
              </div>
            </div>

            {trophyFeedback && (
              <div
                className={`p-3.5 rounded-xl text-xs flex items-center gap-2 ${
                  trophyFeedback.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {trophyFeedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{trophyFeedback.message}</span>
              </div>
            )}

            {/* List of Tiers */}
            <div className="space-y-4 pt-2">
              {trophyList.map((tier, idx) => (
                <div
                  key={tier.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-colors space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="font-bold text-sm text-slate-900 font-serif">
                        {tier.titleArabic}
                      </span>
                      <span className="text-xs font-bold text-slate-700">
                        • {tier.titleEnglish}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <label className="font-bold text-slate-600">Points Required:</label>
                      <input
                        type="number"
                        min={0}
                        step={10}
                        value={tier.minPoints}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setTrophyList(prev => prev.map(t => t.id === tier.id ? { ...t, minPoints: val } : t));
                        }}
                        className="w-24 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-600 text-center"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">Title (English):</label>
                      <input
                        type="text"
                        value={tier.titleEnglish}
                        onChange={(e) => {
                          const val = e.target.value;
                          setTrophyList(prev => prev.map(t => t.id === tier.id ? { ...t, titleEnglish: val } : t));
                        }}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-emerald-600"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">Title (Arabic):</label>
                      <input
                        type="text"
                        value={tier.titleArabic}
                        onChange={(e) => {
                          const val = e.target.value;
                          setTrophyList(prev => prev.map(t => t.id === tier.id ? { ...t, titleArabic: val } : t));
                        }}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-serif focus:outline-none focus:border-emerald-600 text-right"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">Title (Urdu):</label>
                      <input
                        type="text"
                        value={tier.titleUrdu}
                        onChange={(e) => {
                          const val = e.target.value;
                          setTrophyList(prev => prev.map(t => t.id === tier.id ? { ...t, titleUrdu: val } : t));
                        }}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Description & Criteria:</label>
                    <input
                      type="text"
                      value={tier.description}
                      onChange={(e) => {
                        const val = e.target.value;
                        setTrophyList(prev => prev.map(t => t.id === tier.id ? { ...t, description: val } : t));
                      }}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: TEACHER SETUP & CIRCLE DIRECTORY
         ========================================================================= */}
      {activeSubTab === 'teachers' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Create Teacher Form */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <GraduationCap className="w-5 h-5 text-emerald-800" />
                <h2 className="text-base font-bold text-slate-900">
                  Set Up New Teacher Account
                </h2>
              </div>
              <p className="text-xs text-slate-500">
                Admin sets up the teacher email and generates their assigned circle code.
              </p>

              <form onSubmit={handleCreateTeacher} className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Teacher Full Name (Ustadh):
                  </label>
                  <input
                    type="text"
                    required
                    value={newTeacherName}
                    onChange={(e) => setNewTeacherName(e.target.value)}
                    placeholder="e.g. Ustadh Hafiz Imran"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Teacher Email Address:
                  </label>
                  <input
                    type="email"
                    required
                    value={newTeacherEmail}
                    onChange={(e) => setNewTeacherEmail(e.target.value)}
                    placeholder="imran.ustadh@madrasah.internal"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl font-mono focus:bg-white focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Circle Code:
                    </label>
                    <input
                      type="text"
                      value={newCircleCode}
                      onChange={(e) => setNewCircleCode(e.target.value)}
                      placeholder="CIRCLE-HIFZ-3"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl font-mono uppercase focus:bg-white focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Initial PIN / Passcode:
                    </label>
                    <input
                      type="text"
                      value={newTeacherPasscode}
                      onChange={(e) => setNewTeacherPasscode(e.target.value)}
                      placeholder="1234"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl font-mono focus:bg-white focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Circle Focus / Juz Range:
                  </label>
                  <input
                    type="text"
                    value={newJuzFocus}
                    onChange={(e) => setNewJuzFocus(e.target.value)}
                    placeholder="e.g. Juz 1-10 or Senior Hifz"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-900 active:scale-95 text-white text-xs font-bold rounded-xl shadow transition-all"
                >
                  Save & Register Teacher
                </button>
              </form>
            </div>

            {/* Existing Teachers List */}
            <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <School className="w-5 h-5 text-emerald-800" />
                  <h2 className="text-base font-bold text-slate-900">
                    Active Ustadh Directory & Circle Codes
                  </h2>
                </div>
                <span className="text-xs font-medium text-slate-500">
                  {adminSettings.teachers.length} Active Ustadh Accounts
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {adminSettings.teachers.map((teacher) => {
                  const teacherStudents = students.filter(s => s.circleCode === teacher.circleCode);
                  return (
                    <div
                      key={teacher.id}
                      className="p-4 rounded-2xl border border-slate-200 hover:border-emerald-300 bg-slate-50/60 transition-all space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded-full font-mono">
                            {teacher.circleCode}
                          </span>
                          <h3 className="text-sm font-black text-slate-900 mt-1">
                            {teacher.name}
                          </h3>
                          <div className="text-xs font-mono text-slate-500 mt-0.5">
                            {teacher.email}
                          </div>
                        </div>

                        {adminSettings.teachers.length > 1 && (
                          <button
                            type="button"
                            onClick={() => deleteTeacherAccount(teacher.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                            title="Remove teacher account"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-xs space-y-1">
                        <div className="flex justify-between text-slate-600">
                          <span>Assigned Circle:</span>
                          <span className="font-semibold text-slate-900">{teacher.circleName}</span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                          <span>Focus Range:</span>
                          <span className="font-medium text-slate-700">{teacher.juzFocusRange}</span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                          <span>Enrolled Boys:</span>
                          <span className="font-bold text-emerald-800">{teacherStudents.length} Students</span>
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-500 flex items-center justify-between">
                        <span>Ustadh PIN: <strong className="font-mono">{teacher.passcode}</strong></span>
                        <span className="text-emerald-700 font-semibold">Active ✓</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: ENROLLED STUDENTS ROSTER
         ========================================================================= */}
      {activeSubTab === 'students' && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  Total Enrolled Students Roster ({students.length})
                </h2>
                {isSampleDataPresent && (
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full">
                    Includes Demo Boys
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                Each student is linked to a registered parent email and assigned circle code.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {isSampleDataPresent && (
                <button
                  type="button"
                  onClick={clearSampleStudents}
                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Dummy / Sample Students</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setActiveSubTab('add-student')}
                className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Add New Student</span>
              </button>
            </div>
          </div>

          {/* Roster Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                  <th className="py-2.5 px-3">Student Name</th>
                  <th className="py-2.5 px-3">Parent Name & Email</th>
                  <th className="py-2.5 px-3">Student Email</th>
                  <th className="py-2.5 px-3">Circle Code & Ustadh</th>
                  <th className="py-2.5 px-3">Enrollment Key</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((student) => {
                  const isSample = ['std-1', 'std-2', 'std-3'].includes(student.id);
                  return (
                    <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{student.name}</span>
                          {isSample && (
                            <span className="text-[9px] bg-slate-200 text-slate-600 px-1.5 py-0.2 rounded font-sans font-normal">
                              Demo
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {student.rollNumber} • Juz {student.currentJuz}
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-800">{student.parentName}</div>
                        <div className="text-slate-600 font-mono text-[11px]">{student.parentEmail}</div>
                      </td>

                      <td className="py-3 px-3">
                        {student.studentEmail ? (
                          <div className="font-mono text-emerald-800">{student.studentEmail}</div>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Not added (Parent only)</span>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        <span className="font-mono font-bold text-xs text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          {student.circleCode}
                        </span>
                        <div className="text-[11px] text-slate-500 mt-0.5">{student.teacherName}</div>
                      </td>

                      <td className="py-3 px-3">
                        <span className="font-mono font-bold text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          {student.enrollmentCode || 'HIFZ-PENDING'}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        {student.status === 'active' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px]">
                            <CheckCircle2 className="w-3 h-3" />
                            Active
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              simulateEmailSent(student.id);
                              const invite = `Assalamu Alaikum wa Rahmatullahi wa Barakatuh ${student.parentName},\n\nYour child ${student.name} is enrolled at ${adminSettings.academyName}.\nEnrollment Code: ${student.enrollmentCode}\nRoll Number: ${student.rollNumber}\n\nPlease use your registered email (${student.parentEmail}) or enrollment code to sign in to the Student/Parent portal.`;
                              const mailto = buildMailtoUrl(
                                student.parentEmail,
                                `Student Enrollment Key - ${student.name}`,
                                invite
                              );
                              window.location.href = mailto;
                            }}
                            className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-full font-bold text-[10px] transition-all"
                            title="Click to prepare welcome email"
                          >
                            <Mail className="w-3 h-3" />
                            <span>Prepare Invite</span>
                          </button>
                        )}
                      </td>

                      <td className="py-3 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => setStudentToDelete(student)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Safely archive & delete student"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: ADD NEW STUDENT (PARENT FIRST)
         ========================================================================= */}
      {activeSubTab === 'add-student' && (
        <div className="max-w-3xl mx-auto bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold">
              <UserPlus className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                Parent Credentials First
              </span>
              <h2 className="text-xl font-black text-slate-900 mt-0.5">
                Enroll New Student & Automatically Supply Code
              </h2>
              <p className="text-xs text-slate-500">
                Setup parents' email first, optionally add student email, and supply code automatically upon dispatch.
              </p>
            </div>
          </div>

          <form onSubmit={handleEnrollStudent} className="space-y-6">
            
            {/* Step 1: Parent First */}
            <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-700 text-white font-bold text-xs flex items-center justify-center">
                  1
                </span>
                <h3 className="text-sm font-bold text-blue-950">
                  Parent or Guardian Information (Required First)
                </h3>
              </div>
              <p className="text-xs text-blue-800">
                The parent will use this exact email address to access their child's portal without seeing the rest of the class.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Parent / Guardian Full Name:
                  </label>
                  <input
                    type="text"
                    required
                    value={newParentName}
                    onChange={(e) => setNewParentName(e.target.value)}
                    placeholder="e.g. Tariq Khan / Dr. Patel"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Parent Primary Email (Portal Key):
                  </label>
                  <input
                    type="email"
                    required
                    value={newParentEmail}
                    onChange={(e) => setNewParentEmail(e.target.value)}
                    placeholder="tariq.khan@gmail.com"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl font-mono focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Parent WhatsApp / Mobile Phone:
                  </label>
                  <input
                    type="tel"
                    required
                    value={newParentPhone}
                    onChange={(e) => setNewParentPhone(e.target.value)}
                    placeholder="+44 7700 900123"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl font-mono focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Student Details & Optional Student Email */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-800 text-white font-bold text-xs flex items-center justify-center">
                  2
                </span>
                <h3 className="text-sm font-bold text-slate-900">
                  Student Details & Student Email (Optional)
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Student Full Name (Talib):
                  </label>
                  <input
                    type="text"
                    required
                    value={newStudentName}
                    onChange={(e) => setNewStudentName(e.target.value)}
                    placeholder="e.g. Bilal Tariq Khan"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Current Memorization Starting Point:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      min={1}
                      max={30}
                      value={newCurrentJuz}
                      onChange={(e) => setNewCurrentJuz(Number(e.target.value))}
                      className="px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-600 font-mono"
                      title="Starting Juz Number"
                    />
                    <input
                      type="text"
                      value={newCurrentSurah}
                      onChange={(e) => setNewCurrentSurah(e.target.value)}
                      placeholder="Surah name"
                      className="px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>
              </div>

              {/* Checkbox for Student Email */}
              <div className="pt-2 border-t border-slate-200/80">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasStudentEmail}
                    onChange={(e) => setHasStudentEmail(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                  />
                  <span className="text-xs font-semibold text-slate-800">
                    Add Student's own email account? (Optional — parents can also add this later)
                  </span>
                </label>

                {hasStudentEmail && (
                  <div className="mt-2 pl-6">
                    <input
                      type="email"
                      value={newStudentEmail}
                      onChange={(e) => setNewStudentEmail(e.target.value)}
                      placeholder="student.name@student.madrasah.internal"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl font-mono focus:outline-none focus:border-emerald-600"
                    />
                    <span className="text-[11px] text-slate-500 block mt-1">
                      If provided, the student can also sign into their personal portal using this email.
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Step 3: Teacher & Circle Assignment */}
            <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-800 text-white font-bold text-xs flex items-center justify-center">
                  3
                </span>
                <h3 className="text-sm font-bold text-emerald-950">
                  Assign to Ustadh & Circle Code
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Select Ustadh:
                  </label>
                  <select
                    value={selectedTeacherId}
                    onChange={(e) => setSelectedTeacherId(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-600 cursor-pointer"
                  >
                    {adminSettings.teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.circleCode} - {t.circleName})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Yearly Memorization Target:
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={newTargetJuz}
                    onChange={(e) => setNewTargetJuz(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl font-mono focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 active:scale-98 text-white text-sm font-bold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Enroll Student & Automatically Generate Enrollment Code</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Safe Student Deletion & Quranic Archive Modal */}
      <SafeDeleteStudentModal
        isOpen={!!studentToDelete}
        student={studentToDelete}
        onClose={() => setStudentToDelete(null)}
        onConfirmDelete={async (studentId) => {
          await dataRepository.deleteStudent(studentId);
          deleteStudent(studentId);
          setStudentToDelete(null);
        }}
      />
    </div>
  );
};
