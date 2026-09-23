import React, { useState } from 'react';
import { useHifz } from '../context/HifzContext';
import {
  BookOpen,
  GraduationCap,
  Users,
  ShieldCheck,
  Lock,
  ArrowRight,
  CheckCircle2,
  Server,
  KeyRound,
  Sparkles,
  ShieldAlert,
  Mail,
  Hash,
  AlertCircle,
  Eye,
  EyeOff,
  Compass,
  Check,
  Loader2,
  LogIn,
  UserPlus,
  Globe
} from 'lucide-react';
import { UserRole } from '../types';
import { GuidedOnboardingView, GuidedRole } from './GuidedOnboardingView';

export const LandingPortalView: React.FC = () => {
  const {
    students,
    adminSettings,
    enterStudentParentPortalByEmail,
    enterTeacherPortalByCredentials,
    enterAdminPortal,
    setIsSecurityModalOpen,
    setActiveTab,
    signInWithFirebaseEmail,
    signUpWithFirebaseEmail,
    signInWithGoogle,
    firebaseUser,
    firebaseLoading
  } = useHifz();

  // Onboarding Guided Flow State
  const [showGuide, setShowGuide] = useState(true);
  const [guideInitialRole, setGuideInitialRole] = useState<GuidedRole | null>(null);
  const [completedGuideRole, setCompletedGuideRole] = useState<GuidedRole | null>(null);

  // Firebase Auth State
  const [isFirebasePanelOpen, setIsFirebasePanelOpen] = useState(false);
  const [firebaseTab, setFirebaseTab] = useState<'signin' | 'signup'>('signin');
  const [firebaseEmail, setFirebaseEmail] = useState('');
  const [firebasePassword, setFirebasePassword] = useState('');
  const [firebaseRole, setFirebaseRole] = useState<UserRole>('parent');
  const [firebaseAuthError, setFirebaseAuthError] = useState<string | null>(null);
  const [firebaseAuthSuccess, setFirebaseAuthSuccess] = useState<string | null>(null);
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);

  // Student & Parent Portal State
  const [parentEmailOrCode, setParentEmailOrCode] = useState('');
  const [parentError, setParentError] = useState<string | null>(null);
  const [parentSuccess, setParentSuccess] = useState<string | null>(null);

  // Teacher Portal State
  const [teacherEmailOrPin, setTeacherEmailOrPin] = useState('');
  const [selectedCircleCode, setSelectedCircleCode] = useState('CIRCLE-HIFZ-1');
  const [teacherError, setTeacherError] = useState<string | null>(null);

  // Admin Portal State
  const [adminPasscode, setAdminPasscode] = useState('');
  const [showAdminPasscode, setShowAdminPasscode] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);

  // Live match check for the typed parent email or code
  const trimmedParentInput = parentEmailOrCode.trim().toLowerCase();
  const matchedStudent = students.find(s =>
    (s.parentEmail && s.parentEmail.toLowerCase() === trimmedParentInput) ||
    (s.studentEmail && s.studentEmail.toLowerCase() === trimmedParentInput) ||
    (s.enrollmentCode && s.enrollmentCode.toLowerCase() === trimmedParentInput) ||
    (s.rollNumber && s.rollNumber.toLowerCase() === trimmedParentInput)
  );

  const handleEnterStudentParent = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setParentError(null);
    setParentSuccess(null);

    const result = enterStudentParentPortalByEmail(parentEmailOrCode);
    if (!result.success) {
      setParentError(result.message);
    } else {
      setParentSuccess(result.message);
    }
  };

  const handleEnterTeacher = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setTeacherError(null);

    const result = enterTeacherPortalByCredentials(teacherEmailOrPin, selectedCircleCode);
    if (!result.success) {
      setTeacherError(result.message);
    }
  };

  const handleEnterAdmin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAdminError(null);

    const success = enterAdminPortal(adminPasscode);
    if (!success) {
      const isDefault = adminSettings.adminPasscode === '9999';
      setAdminError(
        isDefault
          ? 'Incorrect Master Admin Passcode (Default is 9999)'
          : 'Incorrect Master Admin Passcode. Please enter your configured password.'
      );
    }
  };

  const handleFirebaseSubmit = async (e: React.FormEvent) => {
    if (e) e.preventDefault();
    setFirebaseAuthError(null);
    setFirebaseAuthSuccess(null);
    setIsSubmittingAuth(true);

    if (firebaseTab === 'signin') {
      const res = await signInWithFirebaseEmail(firebaseEmail, firebasePassword);
      if (!res.success) {
        setFirebaseAuthError(res.message);
      } else {
        setFirebaseAuthSuccess(res.message);
      }
    } else {
      const res = await signUpWithFirebaseEmail(firebaseEmail, firebasePassword, firebaseRole);
      if (!res.success) {
        setFirebaseAuthError(res.message);
      } else {
        setFirebaseAuthSuccess(res.message);
      }
    }
    setIsSubmittingAuth(false);
  };

  const handleGoogleSignIn = async () => {
    setFirebaseAuthError(null);
    setFirebaseAuthSuccess(null);
    setIsSubmittingAuth(true);
    const res = await signInWithGoogle();
    if (!res.success) {
      setFirebaseAuthError(res.message);
    } else {
      setFirebaseAuthSuccess(res.message);
    }
    setIsSubmittingAuth(false);
  };

  // If currently in Guided Onboarding mode, show interactive slide instructions
  if (showGuide) {
    return (
      <GuidedOnboardingView
        academyName={adminSettings.academyName}
        initialRole={guideInitialRole}
        onComplete={(role) => {
          setCompletedGuideRole(role);
          setShowGuide(false);
        }}
        onSkip={() => {
          setShowGuide(false);
        }}
      />
    );
  }

  return (
    <div className="min-h-[85vh] flex flex-col justify-between py-6 px-3 sm:px-6">
      
      {/* Top Banner / Bismillah */}
      <div className="max-w-4xl mx-auto w-full text-center space-y-2 mb-4">
        <div className="text-xl sm:text-2xl font-serif text-emerald-800 tracking-wide select-none" dir="rtl">
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
          {adminSettings.academyName}
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
          Role-Based Quran Memorization, Sabaq/Dawr Evaluation & Tarbiyah Management System
        </p>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-200/80 text-slate-700 text-xs font-medium mt-1">
          <span>{adminSettings.academicYear}</span>
          <span>•</span>
          <span>Portal-Dependent User Scoping & Class Code Isolation</span>
        </div>
      </div>

      {/* Guided Walkthrough Replay & Assistance Banner */}
      <div className="max-w-6xl mx-auto w-full mb-6">
        <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-blue-950 text-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-700 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-amber-400 shrink-0">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-sm text-white">
                  Step-by-Step Role Guidance & Walkthrough
                </span>
                <span className="text-[10px] font-bold bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  ADHD & Beginner Friendly
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {completedGuideRole ? (
                  <span>
                    You completed instructions for <strong className="text-amber-300 capitalize">{completedGuideRole}</strong>. Your corresponding portal is highlighted below.
                  </span>
                ) : (
                  <span>
                    New or need a quick refresher? Slide through easy, visual instructions for Parents, Teachers, or Madrasah Admins.
                  </span>
                )}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setGuideInitialRole(completedGuideRole || null);
              setShowGuide(true);
            }}
            className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 shrink-0 shadow"
          >
            <Sparkles className="w-4 h-4 text-slate-950" />
            <span>{completedGuideRole ? 'Revisit Instructions' : 'Open Guided Tour'}</span>
            <ArrowRight className="w-4 h-4 text-slate-950" />
          </button>
        </div>
      </div>

      {/* Firebase Cloud Authentication Panel */}
      <div className="max-w-6xl mx-auto w-full mb-6">
        <div className="bg-white rounded-3xl border-2 border-emerald-600/30 p-4 sm:p-5 shadow-lg space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center font-bold shrink-0 shadow-xs">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                    Multi-Role Authentication
                  </span>
                  <span className="text-[11px] text-slate-500 font-semibold">
                    Firebase Auth + Google Identity
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 mt-0.5">
                  {firebaseUser ? `Connected as ${firebaseUser.email}` : 'Sign In with Firebase or Google'}
                </h3>
                <p className="text-xs text-slate-500">
                  {firebaseUser
                    ? 'Your role is automatically scoped based on your verified credentials.'
                    : 'Personalized access for Parents (child-only records), Teachers (assigned Halqa circle), and Admins.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {firebaseUser ? (
                <button
                  type="button"
                  onClick={() => enterStudentParentPortalByEmail(firebaseUser.email || '')}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Enter My Scoped Portal</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsFirebasePanelOpen(!isFirebasePanelOpen)}
                  className="px-4 py-2.5 bg-emerald-800 hover:bg-emerald-900 active:scale-95 text-white rounded-xl text-xs font-black transition-all shadow-xs flex items-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>{isFirebasePanelOpen ? 'Hide Firebase Login' : 'Open Firebase Sign-In'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Expandable Firebase Form */}
          {isFirebasePanelOpen && !firebaseUser && (
            <div className="pt-4 border-t border-slate-100 space-y-4">
              {/* Sign In vs Register Tabs */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setFirebaseTab('signin')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      firebaseTab === 'signin' ? 'bg-white text-emerald-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => setFirebaseTab('signup')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      firebaseTab === 'signup' ? 'bg-white text-emerald-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Create Account
                  </button>
                </div>

                {/* Google Sign-in Button */}
                <button
                  type="button"
                  disabled={isSubmittingAuth}
                  onClick={handleGoogleSignIn}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all flex items-center gap-2 shadow-2xs disabled:opacity-50"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span>Sign in with Google</span>
                </button>
              </div>

              {/* Status alerts */}
              {firebaseAuthError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{firebaseAuthError}</span>
                </div>
              )}
              {firebaseAuthSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{firebaseAuthSuccess}</span>
                </div>
              )}

              {/* Email / Password Form */}
              <form onSubmit={handleFirebaseSubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Email Address:
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="email"
                        required
                        value={firebaseEmail}
                        onChange={(e) => setFirebaseEmail(e.target.value)}
                        placeholder="e.g. tariq.parent@madrasah.uk"
                        className="w-full text-xs pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Password:
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="password"
                        required
                        value={firebasePassword}
                        onChange={(e) => setFirebasePassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full text-xs pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                  </div>
                </div>

                {/* Role selection if registering */}
                {firebaseTab === 'signup' && (
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Account Role:
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { role: 'parent' as UserRole, label: 'Parent / Family' },
                        { role: 'teacher' as UserRole, label: 'Ustadh / Teacher' },
                        { role: 'admin' as UserRole, label: 'Madrasah Admin' }
                      ].map(r => (
                        <button
                          key={r.role}
                          type="button"
                          onClick={() => setFirebaseRole(r.role)}
                          className={`p-2 rounded-xl text-xs font-bold border transition-all text-center ${
                            firebaseRole === r.role
                              ? 'bg-emerald-50 border-emerald-600 text-emerald-950 shadow-2xs'
                              : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          {r.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-400">
                    Accounts are stored in Firebase Authentication with secure tokens.
                  </span>
                  <button
                    type="submit"
                    disabled={isSubmittingAuth}
                    className="px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 active:scale-95 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 disabled:opacity-50"
                  >
                    {isSubmittingAuth ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : firebaseTab === 'signin' ? (
                      <>
                        <LogIn className="w-3.5 h-3.5" />
                        <span>Sign In</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Create Account</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Main 3-Portal Access Grid */}
      <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* =========================================================================
            PORTAL 1: STUDENT & PARENT PORTAL (STRICT EMAIL SCOPE)
           ========================================================================= */}
        <div className={`bg-white rounded-3xl border-2 p-6 flex flex-col justify-between transition-all ${
          completedGuideRole === 'parent'
            ? 'border-blue-500 ring-4 ring-blue-300/80 shadow-2xl scale-[1.01]'
            : 'border-blue-200/90 shadow-xl hover:border-blue-300'
        }`}>
          <div className="space-y-4">
            {/* Guide Completed Pill */}
            {completedGuideRole === 'parent' && (
              <div className="p-2 bg-blue-50 border border-blue-200 rounded-xl text-xs font-bold text-blue-900 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  Your Guided Choice: Family & Student
                </span>
                <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-full uppercase">
                  Ready
                </span>
              </div>
            )}
            {/* Header Badge */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 shadow-xs">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 bg-blue-100/70 px-2.5 py-0.5 rounded-full">
                    Family & Student
                  </span>
                  <h2 className="text-lg sm:text-xl font-black text-slate-900 mt-0.5">
                    Student & Parent Portal
                  </h2>
                </div>
              </div>
            </div>

            <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-2xl text-xs text-blue-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-700 shrink-0" />
                <span>Zero-Leak Data Scoping Active</span>
              </div>
              <p className="text-[11px] text-blue-800 leading-relaxed">
                When opened, parents and students view <strong>only their private record</strong> based on their registered email account. The rest of the class roster is strictly hidden.
              </p>
            </div>

            {/* Email or Enrollment Code Form */}
            <form onSubmit={handleEnterStudentParent} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Registered Parent Email or Enrollment Key:
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={parentEmailOrCode}
                    onChange={(e) => {
                      setParentEmailOrCode(e.target.value);
                      setParentError(null);
                      setParentSuccess(null);
                    }}
                    placeholder="tariq.khan@gmail.com or HIFZ-AK-7821"
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>

              {/* Dynamic Student Recognition Feedback */}
              {matchedStudent ? (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold">
                      Account Recognized: {matchedStudent.name}
                    </div>
                    <div className="text-[11px] text-emerald-800">
                      Roll: {matchedStudent.rollNumber} • Circle: {matchedStudent.circleCode} ({matchedStudent.teacherName})
                    </div>
                  </div>
                </div>
              ) : parentEmailOrCode.trim() ? (
                <div className="p-2 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Email not recognized in sample data yet. Select a demo below:</span>
                </div>
              ) : null}

              {parentError && (
                <p className="text-xs text-rose-600 font-medium bg-rose-50 p-2 rounded-lg border border-rose-200">
                  {parentError}
                </p>
              )}

              {/* 1-Click Quick Demo Accounts */}
              <div className="pt-1">
                <span className="text-[10px] text-slate-500 block mb-1 font-semibold uppercase tracking-wider">
                  Quick Demo: Test Private Family Logins:
                </span>
                <div className="flex flex-col gap-1.5">
                  {[
                    { email: 'tariq.khan@gmail.com', boy: 'Abdullah Khan', code: 'HIFZ-AK-7821' },
                    { email: 'patel.family@gmail.com', boy: 'Muhammad Patel', code: 'HIFZ-MP-3914' },
                    { email: 'ahmed.home@gmail.com', boy: 'Zayd Ahmed', code: 'HIFZ-ZA-5120' }
                  ].map(demo => (
                    <button
                      key={demo.email}
                      type="button"
                      onClick={() => {
                        setParentEmailOrCode(demo.email);
                        setParentError(null);
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-900 text-left text-[11px] border border-slate-200 hover:border-blue-300 transition-all flex items-center justify-between"
                    >
                      <span className="font-mono truncate">{demo.email}</span>
                      <span className="text-[10px] font-bold text-blue-700 shrink-0 ml-2">({demo.boy})</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-3 px-4 rounded-xl bg-blue-700 hover:bg-blue-800 active:scale-98 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
              >
                <span>Enter My Private Child Portal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          <div className="text-[11px] text-slate-400 text-center pt-3 border-t border-slate-100 mt-4">
            Private Student Record • Role-Scoped Access
          </div>
        </div>

        {/* =========================================================================
            PORTAL 2: TEACHER / USTADH PORTAL (CIRCLE CODE RESTRICTED)
           ========================================================================= */}
        <div className={`bg-white rounded-3xl border-2 p-6 flex flex-col justify-between transition-all ${
          completedGuideRole === 'teacher'
            ? 'border-emerald-500 ring-4 ring-emerald-300/80 shadow-2xl scale-[1.01]'
            : 'border-emerald-300/90 shadow-xl hover:border-emerald-400'
        }`}>
          <div className="space-y-4">
            {/* Guide Completed Pill */}
            {completedGuideRole === 'teacher' && (
              <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-900 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Your Guided Choice: Ustadh Faculty
                </span>
                <span className="text-[10px] bg-emerald-700 text-white px-2 py-0.5 rounded-full uppercase">
                  Ready
                </span>
              </div>
            )}
            {/* Header Badge */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800 shadow-xs">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                    Ustadh & Faculty
                  </span>
                  <h2 className="text-lg sm:text-xl font-black text-slate-900 mt-0.5">
                    Teacher Portal
                  </h2>
                </div>
              </div>
            </div>

            <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-xs text-emerald-950 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <Hash className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Circle Code Filtering Active</span>
              </div>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                Teachers see all the students who have enrolled with their specific circle code (e.g. <code>CIRCLE-HIFZ-1</code>).
              </p>
            </div>

            {/* Teacher Sign In Form */}
            <form onSubmit={handleEnterTeacher} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Select Assigned Circle Code:
                </label>
                <select
                  value={selectedCircleCode}
                  onChange={(e) => {
                    setSelectedCircleCode(e.target.value);
                    const matchingTeacher = adminSettings.teachers.find(t => t.circleCode === e.target.value);
                    if (matchingTeacher) {
                      setTeacherEmailOrPin(matchingTeacher.email);
                    }
                  }}
                  className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold focus:bg-white focus:outline-none focus:border-emerald-600 cursor-pointer"
                >
                  {adminSettings.teachers.map(t => {
                    const count = students.filter(s => s.circleCode === t.circleCode).length;
                    return (
                      <option key={t.id} value={t.circleCode}>
                        {t.circleCode} • {t.name} ({count} Boys Enrolled)
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Teacher Email or Passcode:
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={teacherEmailOrPin}
                    onChange={(e) => {
                      setTeacherEmailOrPin(e.target.value);
                      setTeacherError(null);
                    }}
                    placeholder="bilal.ustadh@madrasah.internal or 1234"
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-500 transition-all"
                  />
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>

              {teacherError && (
                <p className="text-xs text-rose-600 font-medium bg-rose-50 p-2 rounded-lg border border-rose-200">
                  {teacherError}
                </p>
              )}

              {/* Quick 1-Click Ustadh Switchers */}
              <div className="pt-1">
                <span className="text-[10px] text-slate-500 block mb-1 font-semibold uppercase tracking-wider">
                  Quick Demo: Select Ustadh Account:
                </span>
                <div className="flex flex-col gap-1.5">
                  {adminSettings.teachers.slice(0, 2).map(teacher => (
                    <button
                      key={teacher.id}
                      type="button"
                      onClick={() => {
                        setTeacherEmailOrPin(teacher.email);
                        setSelectedCircleCode(teacher.circleCode);
                        setTeacherError(null);
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-950 text-left text-[11px] border border-slate-200 hover:border-emerald-300 transition-all flex items-center justify-between"
                    >
                      <span className="font-medium truncate">{teacher.name}</span>
                      <span className="text-[10px] font-mono font-bold text-emerald-800 shrink-0 ml-2">
                        {teacher.circleCode}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-3 px-4 rounded-xl bg-emerald-800 hover:bg-emerald-900 active:scale-98 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
              >
                <span>Enter Ustadh Teacher Portal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          <div className="text-[11px] text-slate-400 text-center pt-3 border-t border-slate-100 mt-4">
            Default Demo PIN: <strong className="text-slate-600 font-mono">1234</strong>
          </div>
        </div>

        {/* =========================================================================
            PORTAL 3: MAIN ADMIN USER PORTAL (GOVERNANCE & DICTATION)
           ========================================================================= */}
        <div className={`bg-slate-900 text-white rounded-3xl border-2 p-6 flex flex-col justify-between transition-all ${
          completedGuideRole === 'admin'
            ? 'border-amber-400 ring-4 ring-amber-300/80 shadow-2xl scale-[1.01]'
            : 'border-amber-500/50 shadow-xl hover:border-amber-400'
        }`}>
          <div className="space-y-4">
            {/* Guide Completed Pill */}
            {completedGuideRole === 'admin' && (
              <div className="p-2 bg-amber-400/20 border border-amber-400/40 rounded-xl text-xs font-bold text-amber-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-amber-400" />
                  Your Guided Choice: Madrasah Admin
                </span>
                <span className="text-[10px] bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full uppercase">
                  Ready
                </span>
              </div>
            )}
            {/* Header Badge */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-xs">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2.5 py-0.5 rounded-full">
                    Madrasah Principal
                  </span>
                  <h2 className="text-lg sm:text-xl font-black text-white mt-0.5">
                    Main Admin Control
                  </h2>
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-800/80 border border-slate-700 rounded-2xl text-xs text-slate-300 space-y-1">
              <div className="font-bold text-amber-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 shrink-0" />
                <span>Central Screen Dictation</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Dictate what is visible on teacher and student screens, set up teacher emails, delete dummy sample students, and enroll new students with parent email first.
              </p>
            </div>

            {/* Admin Passcode Form */}
            <form onSubmit={handleEnterAdmin} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Master Administrator Passcode:
                </label>
                <div className="relative">
                  <input
                    type={showAdminPasscode ? 'text' : 'password'}
                    required
                    value={adminPasscode}
                    onChange={(e) => {
                      setAdminPasscode(e.target.value);
                      setAdminError(null);
                    }}
                    placeholder="Enter Admin PIN / Password"
                    className="w-full pl-9 pr-10 py-2.5 text-xs bg-slate-800 border border-slate-700 rounded-xl text-white font-mono tracking-widest focus:bg-slate-700 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all"
                  />
                  <Lock className="w-4 h-4 text-amber-400 absolute left-3 top-2.5" />
                  <button
                    type="button"
                    onClick={() => setShowAdminPasscode(!showAdminPasscode)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-amber-400 transition-colors"
                    title={showAdminPasscode ? 'Hide passcode' : 'Show passcode'}
                  >
                    {showAdminPasscode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {adminError && (
                <p className="text-xs text-rose-400 font-medium bg-rose-950/60 p-2 rounded-lg border border-rose-800">
                  {adminError}
                </p>
              )}

              {/* Admin Capability Badges */}
              <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/60 space-y-1.5 text-[11px] text-slate-300">
                <div className="flex items-center gap-1.5 text-amber-300 font-semibold">
                  <span>✓ Institute Branding & Admin Password Control</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <span>✓ Visibility Dictation (Teacher & Student)</span>
                </div>
                <div className="flex items-center gap-1.5 text-blue-400 font-semibold">
                  <span>✓ Teacher Setup & Circle Code Issuance</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-98 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                <span>Enter Admin Control Center</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          <div className="text-[11px] text-slate-400 text-center pt-3 border-t border-slate-800 mt-4">
            {adminSettings.adminPasscode === '9999' ? (
              <>Default Master Passcode: <strong className="text-amber-300 font-mono">9999</strong></>
            ) : (
              <span className="text-emerald-400 font-medium flex items-center justify-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Custom Master Passcode Active
              </span>
            )}
          </div>
        </div>

      </div>

      {/* Bottom Cybersecurity Architecture Bar */}
      <div className="max-w-6xl mx-auto w-full mt-8">
        <div className="bg-white rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-xs sm:text-sm text-slate-900">
                  User Portal Dependent Architecture
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                  Role-Scoped
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Principal Admin Dictation • Parent Email Isolation • Teacher Circle Code Scoping
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsSecurityModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shrink-0 hover:shadow"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <span>Privacy Notice (GDPR)</span>
            </button>
            <button
              type="button"
              onClick={() => setIsSecurityModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shrink-0 hover:shadow"
            >
              <span>Parents Informed & SAR</span>
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};
