import React, { useState, useEffect } from 'react';
import {
  Users,
  GraduationCap,
  Building2,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  BookOpen,
  Calendar,
  KeyRound,
  FileSpreadsheet,
  Sliders,
  Award,
  Check,
  Eye,
  HelpCircle,
  Clock,
  Compass,
  Zap,
  Lock,
  ChevronRight,
  Cloud,
  CloudOff,
  Database
} from 'lucide-react';

export type GuidedRole = 'parent' | 'teacher' | 'admin';

interface GuidedOnboardingViewProps {
  academyName: string;
  onComplete: (role: GuidedRole) => void;
  onSkip: () => void;
  initialRole?: GuidedRole | null;
}

interface SlideContent {
  stepNumber: number;
  badge: string;
  title: string;
  subtitle: string;
  actionText: string;
  whyItMatters: string;
  proTip: string;
  visualMockup: React.ReactNode;
}

export const GuidedOnboardingView: React.FC<GuidedOnboardingViewProps> = ({
  academyName,
  onComplete,
  onSkip,
  initialRole = null
}) => {
  const [selectedRole, setSelectedRole] = useState<GuidedRole | null>(initialRole);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Reset slide index when role changes
  useEffect(() => {
    setCurrentSlideIndex(0);
  }, [selectedRole]);

  // Keyboard navigation for ADHD accessibility (Left/Right arrows)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedRole) return;
      if (e.key === 'ArrowRight') {
        goToNextSlide();
      } else if (e.key === 'ArrowLeft') {
        goToPrevSlide();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedRole, currentSlideIndex]);

  // Slides configuration for each persona
  const slidesByRole: Record<GuidedRole, SlideContent[]> = {
    // =========================================================================
    // PARENT / STUDENT (HOW TO VIEW)
    // =========================================================================
    parent: [
      {
        stepNumber: 1,
        badge: 'No Password Needed • Zero-Leak Privacy',
        title: 'Sign In with Your Email or Child’s Student Code',
        subtitle: 'No Google or Firebase account is required. Simply enter the email address or enrollment code registered with the Madrasah.',
        actionText: 'Type your email (e.g. Yahoo, Hotmail, iCloud, Gmail) or student enrollment code (e.g. HIFZ-AK-7821) in the Student & Parent Portal. If you have multiple enrolled children, your email automatically links them all.',
        whyItMatters: 'Guarantees bank-grade privacy scoping so no other parent can view your child’s records. The Madrasah Admin registers your email or code first.',
        proTip: 'Optional: If you prefer using 1-click Google Sign-In or a password-protected Firebase account, both are also supported in the top login section.',
        visualMockup: (
          <div className="p-4 bg-blue-50/80 rounded-2xl border border-blue-200 text-xs space-y-2.5">
            <div className="flex items-center justify-between text-[11px] font-bold text-blue-900">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                Zero-Leak Parent Privacy
              </span>
              <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[10px] font-bold">
                No Password Required
              </span>
            </div>
            <div className="p-2.5 bg-white rounded-xl border border-blue-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-blue-950 font-bold text-xs">tariq.khan@yahoo.co.uk</span>
                <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md font-bold">
                  ✓ Matched Roster
                </span>
              </div>
              <div className="text-[10px] text-slate-500 font-mono">Or Student Code: <strong>HIFZ-AK-7821</strong></div>
            </div>
            <p className="text-[11px] text-blue-800">
              Student Loaded: <strong>Amina Khan</strong> (Roll #101) • Only her personal progress is unlocked.
            </p>
          </div>
        )
      },
      {
        stepNumber: 2,
        badge: 'Daily Recitation Tracker',
        title: 'See Today’s Sabaq, Sabaqee & Dawr Recited',
        subtitle: 'Know exactly what portion your child read in class today within minutes of the lesson ending.',
        actionText: 'Review daily Surah names, Ayah ranges, teacher ratings (Mumtaz to Da’eef), and pronunciation tips.',
        whyItMatters: 'No more guessing what to revise before bed. You see the exact homework assigned by the Ustadh.',
        proTip: 'Look at the Tajweed focus notes to know which letters or rules need a quick reminder at home.',
        visualMockup: (
          <div className="p-3.5 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-emerald-400 font-bold text-[11px]">Today’s Lesson Breakdown</span>
              <span className="text-amber-300 font-bold text-[10px] bg-amber-400/20 px-2 py-0.5 rounded-md">
                Mumtaz (5/5 ★)
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 text-center text-[10px]">
              <div className="p-2 bg-slate-800 rounded-xl border border-slate-700">
                <div className="text-slate-400">Sabaq (New)</div>
                <div className="font-bold text-white mt-0.5">Al-Baqarah 45-55</div>
              </div>
              <div className="p-2 bg-slate-800 rounded-xl border border-slate-700">
                <div className="text-slate-400">Sabaqee (Sub)</div>
                <div className="font-bold text-white mt-0.5">Juz 1 • 3 Pages</div>
              </div>
              <div className="p-2 bg-slate-800 rounded-xl border border-slate-700">
                <div className="text-slate-400">Dawr (Revision)</div>
                <div className="font-bold text-white mt-0.5">Juz 30 (Complete)</div>
              </div>
            </div>
          </div>
        )
      },
      {
        stepNumber: 3,
        badge: 'Home Prayer & Tarbiyah',
        title: 'Log Daily Home Revision & 5-Times Salah',
        subtitle: 'Support your child’s spiritual habits outside of Madrasah hours with easy 1-click check-ins.',
        actionText: 'Tick off Fajr, Dhuhr, Asr, Maghrib, and Isha, and play authentic recitation audio together.',
        whyItMatters: 'Builds positive spiritual momentum and rewards consistent daily Quranic engagement.',
        proTip: 'Students can earn milestone stars and badges as their home recitation streak grows.',
        visualMockup: (
          <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2 text-xs">
            <div className="flex items-center justify-between text-emerald-900 font-bold text-[11px]">
              <span>Daily Salah Check-In</span>
              <span className="text-emerald-700 bg-emerald-200/80 px-2 py-0.5 rounded-full text-[10px]">
                5 of 5 Complete
              </span>
            </div>
            <div className="flex justify-between items-center gap-1 text-[10px]">
              {['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].map((prayer) => (
                <div key={prayer} className="flex-1 py-1.5 bg-white border border-emerald-300 rounded-lg text-center font-bold text-emerald-800 flex items-center justify-center gap-1">
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span>{prayer}</span>
                </div>
              ))}
            </div>
          </div>
        )
      },
      {
        stepNumber: 4,
        badge: 'Weekly Dossiers & Reports',
        title: 'Download Signed Official Progress Cards',
        subtitle: 'Receive comprehensive Friday evaluations with Ustadh signatures and term certificates.',
        actionText: 'View weekly attendance rates, cumulative memorization ribbons, and download clean printable PDFs.',
        whyItMatters: 'Keeps families fully aligned with the Madrasah curriculum and preserves memorable milestones.',
        proTip: 'You can save or print report cards directly for family keepsakes or school records.',
        visualMockup: (
          <div className="p-3.5 bg-white rounded-2xl border border-slate-200 space-y-2 text-xs shadow-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-xs">Weekly Evaluation Dossier</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                Ustadh Signed ✓
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-600 bg-slate-50 p-2 rounded-xl">
              <Award className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Juz 1 Completed • 100% Attendance • Ready for Juz 2</span>
            </div>
          </div>
        )
      }
    ],

    // =========================================================================
    // TEACHER / USTADH (HOW TO TRACK)
    // =========================================================================
    teacher: [
      {
        stepNumber: 1,
        badge: 'Circle Code & PIN • No Google Required',
        title: 'Sign In Directly with Your Halqa Circle Code',
        subtitle: 'Zero distractions. Teachers do not need a Google or Firebase account. Simply enter your assigned Circle Code and Teacher PIN.',
        actionText: 'Select your teacher account or type your Halqa Circle Code (e.g. CIRCLE-HIFZ-1) and PIN provided by the Madrasah Admin.',
        whyItMatters: 'Isolates student data to your specific circle and lets you jump straight into recitation grading in seconds.',
        proTip: 'Optional: Teachers can also sign in with a verified Firebase email if your academy configures cloud logins.',
        visualMockup: (
          <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2 text-xs">
            <div className="flex items-center justify-between text-emerald-900 font-bold text-[11px]">
              <span>Ustadh Halqa Scope</span>
              <span className="bg-emerald-200/80 px-2 py-0.5 rounded-full text-emerald-800 text-[10px] font-bold">
                Direct PIN Login
              </span>
            </div>
            <div className="p-2.5 bg-white rounded-xl border border-emerald-200 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-900">Ustadh Bilal Qasmi</div>
                <div className="text-[11px] text-slate-500 font-mono">CIRCLE-HIFZ-1 • PIN: ••••</div>
              </div>
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="text-[11px] text-emerald-800">
              ✓ Direct access to your 8 students with zero outside passwords or account creation needed.
            </p>
          </div>
        )
      },
      {
        stepNumber: 2,
        badge: '"Today" Fast Classroom Flow',
        title: 'Single-Screen Grading with "Save & Next Student"',
        subtitle: 'Built for the fast-paced Halqa. Grade Sabaq, Sabaq Para, and Dawr sequentially without leaving the dialog.',
        actionText: 'Tap "0 Mistakes (Mumtaz)" or adjust mistakes, select Tajweed feedback chips, and click "Save & Next Student" (or press Cmd/Ctrl + Enter).',
        whyItMatters: 'Assess an entire Halqa of 12 students in under 4 minutes with a live circular progress bar and zero repetitive clicking.',
        proTip: 'Press Cmd/Ctrl + Enter to instantly save and advance to the next student. A celebration screen appears when the circle is done!',
        visualMockup: (
          <div className="p-3.5 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-2.5 text-xs">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-emerald-400 font-mono font-bold">Student 3 of 8 (38% Done)</span>
              <span className="bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-md text-[10px]">
                Halqa Active
              </span>
            </div>
            <div className="p-2 bg-slate-800 rounded-xl border border-slate-700 flex items-center justify-between">
              <div>
                <div className="font-bold text-white text-xs">Amina Khan • Sabaq</div>
                <div className="text-[10px] text-slate-400">Surah Maryam v.1-25 • 0 Mistakes</div>
              </div>
              <span className="px-2 py-1 bg-emerald-600 text-white rounded-lg font-bold text-[10px]">
                Mumtaz ✓
              </span>
            </div>
            <div className="p-2 bg-emerald-800 text-white rounded-xl text-center font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
              <span>Save & Next Student (Cmd+Enter)</span>
            </div>
          </div>
        )
      },
      {
        stepNumber: 3,
        badge: '100% Offline-First Resilience',
        title: 'Grade Anywhere — Never Lose Data if Wi-Fi Drops',
        subtitle: 'All daily grades, attendance, and notes queue locally and automatically sync to Google Cloud SQL when back online.',
        actionText: 'Keep teaching even in mosque basements without internet. Check the Cloud SQL status pill in the top header.',
        whyItMatters: 'Guarantees zero lost records or classroom delays when connectivity is intermittent or unavailable.',
        proTip: 'Tap the Cloud SQL badge in the header anytime to inspect pending queue items or test simulated offline mode.',
        visualMockup: (
          <div className="p-3.5 bg-white rounded-2xl border border-slate-200 space-y-2 text-xs shadow-xs">
            <div className="flex items-center justify-between text-[11px] font-bold">
              <span className="text-slate-800">Connection Resilience</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800 flex items-center gap-1">
                <Cloud className="w-3 h-3 text-emerald-600" />
                Cloud SQL Synced
              </span>
            </div>
            <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CloudOff className="w-4 h-4 text-amber-700 shrink-0" />
                <span>Wi-Fi Offline: <strong>3 Grades Queued</strong></span>
              </div>
              <span className="text-[10px] bg-amber-200 text-amber-900 font-bold px-1.5 py-0.5 rounded">
                Auto-Syncs
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              When back online, queue automatically drains to europe-west1 Cloud SQL.
            </p>
          </div>
        )
      },
      {
        stepNumber: 4,
        badge: '1-Tap Attendance & Feedback',
        title: 'Track Attendance & Send Instant Family Notes',
        subtitle: 'Mark attendance in seconds and communicate progress directly to parents.',
        actionText: 'Tap Present, Absent, or Late. Add a quick note or voice memo about Tajweed or concentration.',
        whyItMatters: 'Parents stay informed in real-time, drastically reducing repeat phone calls and inquiries.',
        proTip: 'Students with 100% weekly attendance automatically receive attendance honor badges on their report card.',
        visualMockup: (
          <div className="p-3.5 bg-white rounded-2xl border border-slate-200 space-y-2 text-xs shadow-xs">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-slate-800">Roll Call: Tariq Khan</span>
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded-full text-[10px]">
                Present (On Time)
              </span>
            </div>
            <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600">
              Teacher Note: <em>"MashaAllah, excellent memorization of Surah Al-Baqarah Ayah 50 today."</em>
            </div>
          </div>
        )
      },
      {
        stepNumber: 5,
        badge: 'Weekly Dossier Sign-Off',
        title: 'Review Weekly Totals & Sign Reports',
        subtitle: 'Finalize student dossiers every Friday with your official digital teacher endorsement.',
        actionText: 'Check Juz completion ribbons, review term analytics, and sign weekly dossiers in 1 click.',
        whyItMatters: 'Maintains professional institutional standards and keeps student records inspection-ready.',
        proTip: 'Admins can also review your completed circle evaluations and export end-of-term registers.',
        visualMockup: (
          <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2 text-xs">
            <div className="flex items-center justify-between text-emerald-950 font-bold text-[11px]">
              <span>Friday Tarbiyah Evaluation</span>
              <span className="text-emerald-700 font-mono text-[10px]">Ready to Sign</span>
            </div>
            <div className="p-2 bg-white rounded-xl border border-emerald-200 flex items-center justify-between">
              <span className="text-slate-700 font-medium text-xs">Ustadh Signature Endorsement</span>
              <span className="text-emerald-700 font-bold text-xs">✍️ Signed</span>
            </div>
          </div>
        )
      }
    ],

    // =========================================================================
    // ADMIN / PRINCIPAL (HOW TO SET UP)
    // =========================================================================
    admin: [
      {
        stepNumber: 1,
        badge: 'Academy Branding & Security',
        title: 'Set Your Institute Name & Master Password',
        subtitle: 'Brand your Madrasah across all portals and secure your administrative master key.',
        actionText: 'Sign in with the default passcode (9999) or your custom password, then set your official academy name.',
        whyItMatters: 'Ensures all parent screens, weekly report dossiers, and certificates carry your institution’s identity.',
        proTip: 'You can change your master passcode at any time from the "Institute & Password" tab.',
        visualMockup: (
          <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 space-y-2 text-xs">
            <div className="flex items-center justify-between text-amber-950 font-bold text-[11px]">
              <span>Institute Identity & Security</span>
              <span className="bg-amber-200/80 px-2 py-0.5 rounded-full text-amber-800 text-[10px]">
                Active
              </span>
            </div>
            <div className="p-2 bg-white rounded-xl border border-amber-200 space-y-1">
              <div className="font-bold text-slate-900">{academyName}</div>
              <div className="text-[11px] text-slate-500">Master Password: •••••••• (Custom Protected)</div>
            </div>
          </div>
        )
      },
      {
        stepNumber: 2,
        badge: 'Faculty Circle Governance',
        title: 'Issue Circle Codes & Assign Teachers',
        subtitle: 'Organize your Madrasah into distinct classes and assign teachers with isolated access.',
        actionText: 'Create teacher accounts (e.g. Ustadh Bilal) and generate unique Circle Codes like CIRCLE-HIFZ-1.',
        whyItMatters: 'Teachers only see their assigned Halqa, preventing accidental cross-grading or student leakage.',
        proTip: 'Send the 1-click invitation letter to teachers with their pre-filled credentials.',
        visualMockup: (
          <div className="p-3.5 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-amber-400 font-bold">Faculty Circles Active</span>
              <span className="text-slate-400 text-[10px]">3 Ustadhs Assigned</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-[11px]">
              <div className="p-2 bg-slate-800 rounded-xl border border-slate-700">
                <div className="font-bold text-white">Circle Hifz 1</div>
                <div className="text-emerald-400 text-[10px] font-mono">Ustadh Bilal • 8 Students</div>
              </div>
              <div className="p-2 bg-slate-800 rounded-xl border border-slate-700">
                <div className="font-bold text-white">Circle Nazira 2</div>
                <div className="text-blue-400 text-[10px] font-mono">Ustadha Maryam • 6 Students</div>
              </div>
            </div>
          </div>
        )
      },
      {
        stepNumber: 3,
        badge: 'Screen Visibility Dictation',
        title: 'Dictate What Teachers & Parents Can See',
        subtitle: 'Toggle switches to customize features, reports, and grading menus for each role.',
        actionText: 'Turn on or off student ranking, attendance exports, home Tarbiyah logs, or faculty editing rights.',
        whyItMatters: 'You have 100% control over school policy and can adapt the system to your curriculum.',
        proTip: 'Disable student leaderboard rankings if your Madrasah prefers a non-competitive, focused atmosphere.',
        visualMockup: (
          <div className="p-3.5 bg-white rounded-2xl border border-slate-200 space-y-2 text-xs shadow-xs">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-800">
              <span>Admin Visibility Switches</span>
              <span className="text-emerald-600">Controlled by Principal</span>
            </div>
            <div className="space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between p-1.5 bg-slate-50 rounded-lg">
                <span>Teacher Can Grade Sabaq/Dawr</span>
                <span className="text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded">ON</span>
              </div>
              <div className="flex items-center justify-between p-1.5 bg-slate-50 rounded-lg">
                <span>Parents See Tarbiyah Prayer Tracker</span>
                <span className="text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded">ON</span>
              </div>
            </div>
          </div>
        )
      },
      {
        stepNumber: 4,
        badge: 'Roster & Chronological Enrollment',
        title: 'You Enroll Students First — Unlocks Parent Access',
        subtitle: 'The database is chronological: parents cannot sign in until you register their email or student enrollment code here.',
        actionText: 'Add students with their assigned Halqa circle, Roll Number, and Parent Email (or private enrollment key).',
        whyItMatters: 'Guarantees strict data integrity. No random external user can access your Madrasah records without your prior enrollment.',
        proTip: 'Parents do not need Google or passwords—once you type their email (Yahoo, Hotmail, Gmail) or enrollment key, they can enter immediately.',
        visualMockup: (
          <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2 text-xs">
            <div className="flex items-center justify-between text-emerald-950 font-bold text-[11px]">
              <span>Step 1: Admin Creates Student Profile</span>
              <span className="text-emerald-700 font-mono text-[10px] bg-emerald-200 px-2 py-0.5 rounded-full">Foundation</span>
            </div>
            <div className="p-2 bg-white rounded-xl border border-emerald-200 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-slate-900">Zayd Al-Ansari</span>
                <span className="text-[11px] text-slate-500 block">Parent Email: mariam@gmail.com</span>
              </div>
              <span className="px-2 py-1 bg-slate-900 text-amber-300 font-mono font-bold rounded-lg text-[10px]">
                KEY: HIFZ-ZA-9921
              </span>
            </div>
            <p className="text-[10px] text-emerald-800">
              ✓ Once saved, Mariam can immediately enter the Parent Portal using either her email or key.
            </p>
          </div>
        )
      },
      {
        stepNumber: 5,
        badge: 'Cloud SQL & Zero-Leak Governance',
        title: 'Central Cloud Sync & Privacy Governance',
        subtitle: 'Oversee all Halqa circles in real-time with automatic Cloud SQL replication and strict multi-role data isolation.',
        actionText: 'Monitor queue synchronization across all circles, verify teacher attendance rates, and confirm zero cross-family leaks.',
        whyItMatters: 'Provides academy leadership complete administrative confidence and institutional compliance.',
        proTip: 'Tap the Cloud SQL sync status in the header at any time to monitor pending offline mutations across circles.',
        visualMockup: (
          <div className="p-3.5 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-emerald-400" />
                Cloud SQL Replication Active
              </span>
              <span className="text-slate-400 font-mono text-[10px]">europe-west1</span>
            </div>
            <div className="p-2 bg-slate-800 rounded-xl border border-slate-700 flex items-center justify-between text-[11px]">
              <span className="text-slate-300">Total Circles Synchronized</span>
              <span className="text-emerald-400 font-bold">3 Circles • All Online</span>
            </div>
            <div className="p-2 bg-slate-800/80 rounded-xl border border-slate-700 text-[10px] text-slate-400 flex items-center justify-between">
              <span>Parent Roster Isolation</span>
              <span className="text-emerald-300 font-bold">100% Enforced</span>
            </div>
          </div>
        )
      }
    ]
  };

  // Helper navigation
  const currentSlides = selectedRole ? slidesByRole[selectedRole] : [];
  const currentSlide = currentSlides[currentSlideIndex];
  const isFirstSlide = currentSlideIndex === 0;
  const isLastSlide = currentSlideIndex === currentSlides.length - 1;

  const goToNextSlide = () => {
    if (!selectedRole) return;
    if (isLastSlide) {
      onComplete(selectedRole);
    } else {
      setCurrentSlideIndex(prev => prev + 1);
    }
  };

  const goToPrevSlide = () => {
    if (isFirstSlide) {
      setSelectedRole(null);
    } else {
      setCurrentSlideIndex(prev => prev - 1);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center py-6 px-3 sm:px-6">
      
      {/* Top Header & Reassurance */}
      <div className="max-w-3xl mx-auto w-full text-center space-y-2 mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/80 text-emerald-800 text-xs font-bold border border-emerald-200 select-none">
          <Compass className="w-3.5 h-3.5 text-emerald-700" />
          <span>Quick Interactive Onboarding Guide</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Welcome to {academyName}
        </h1>
        
        <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
          {selectedRole 
            ? 'Follow this simple step-by-step visual guide. You can skip directly to login at any time.'
            : 'To get started, select your role below for simple, customized instructions.'}
        </p>
      </div>

      {/* =========================================================================
          STAGE 1: ROLE SELECTION CARDS (HIGH CLARITY, ADHD-FRIENDLY CHUNKS)
         ========================================================================= */}
      {!selectedRole && (
        <div className="max-w-4xl mx-auto w-full space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* PARENT / STUDENT CARD */}
            <button
              type="button"
              onClick={() => setSelectedRole('parent')}
              className="group relative bg-white hover:bg-blue-50/40 rounded-3xl p-6 border-2 border-blue-200/90 shadow-lg hover:shadow-xl hover:border-blue-500 transition-all text-left flex flex-col justify-between space-y-5 transform hover:-translate-y-1"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold shadow-xs">
                    <Users className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 bg-blue-100/80 px-2.5 py-1 rounded-full">
                    Step 1: View
                  </span>
                </div>

                <div>
                  <h2 className="text-lg font-black text-slate-900 group-hover:text-blue-700 transition-colors">
                    Parent or Student
                  </h2>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Check daily Quran recitation marks, homework targets, 5-times Salah tracker, and teacher notes.
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-700">
                <span>See How to View</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            {/* TEACHER / USTADH CARD */}
            <button
              type="button"
              onClick={() => setSelectedRole('teacher')}
              className="group relative bg-white hover:bg-emerald-50/40 rounded-3xl p-6 border-2 border-emerald-200/90 shadow-lg hover:shadow-xl hover:border-emerald-500 transition-all text-left flex flex-col justify-between space-y-5 transform hover:-translate-y-1"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shadow-xs">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-full">
                    Step 2: Track
                  </span>
                </div>

                <div>
                  <h2 className="text-lg font-black text-slate-900 group-hover:text-emerald-700 transition-colors">
                    Ustadh or Teacher
                  </h2>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Lead your assigned circle, record Sabaq & Dawr in 30 seconds, mark attendance, and sign weekly dossiers.
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-700">
                <span>See How to Track</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            {/* MADRASAH ADMIN / PRINCIPAL CARD */}
            <button
              type="button"
              onClick={() => setSelectedRole('admin')}
              className="group relative bg-white hover:bg-amber-50/40 rounded-3xl p-6 border-2 border-amber-200/90 shadow-lg hover:shadow-xl hover:border-amber-500 transition-all text-left flex flex-col justify-between space-y-5 transform hover:-translate-y-1"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold shadow-xs">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-100/80 px-2.5 py-1 rounded-full">
                    Step 3: Set Up
                  </span>
                </div>

                <div>
                  <h2 className="text-lg font-black text-slate-900 group-hover:text-amber-700 transition-colors">
                    Madrasah Admin
                  </h2>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Brand the academy name, set master password, issue teacher Circle Codes, and dictate screen visibility.
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-amber-800">
                <span>See How to Set Up</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

          </div>

          {/* Quick Skip Button for Experienced Users */}
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={onSkip}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors inline-flex items-center gap-1.5 py-2 px-4 rounded-xl hover:bg-slate-200/60"
            >
              <span>Already know where to go? Skip straight to Login Portals</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          STAGE 2: GUIDED "SLIDE TO NEXT PAGE" INSTRUCTION CAROUSEL
         ========================================================================= */}
      {selectedRole && currentSlide && (
        <div className="max-w-3xl mx-auto w-full space-y-5">
          
          {/* Top Control Bar: Role pill, Step Progress Bar, and "Change Role" */}
          <div className="flex items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 rounded-xl text-xs font-black uppercase tracking-wider ${
                selectedRole === 'parent'
                  ? 'bg-blue-100 text-blue-800 border border-blue-200'
                  : selectedRole === 'teacher'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  : 'bg-amber-100 text-amber-800 border border-amber-200'
              }`}>
                {selectedRole === 'parent' ? 'Family & Student Guide' : selectedRole === 'teacher' ? 'Ustadh & Teacher Guide' : 'Madrasah Admin Guide'}
              </span>

              <span className="text-xs font-bold text-slate-500 hidden sm:inline">
                Step {currentSlideIndex + 1} of {currentSlides.length}
              </span>
            </div>

            {/* Step Indicator Dots */}
            <div className="flex items-center gap-1.5">
              {currentSlides.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentSlideIndex(idx)}
                  className={`h-2.5 rounded-full transition-all ${
                    idx === currentSlideIndex
                      ? selectedRole === 'parent'
                        ? 'w-7 bg-blue-600'
                        : selectedRole === 'teacher'
                        ? 'w-7 bg-emerald-600'
                        : 'w-7 bg-amber-500'
                      : 'w-2.5 bg-slate-300 hover:bg-slate-400'
                  }`}
                  title={`Go to step ${idx + 1}`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() => setSelectedRole(null)}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors px-2.5 py-1 rounded-lg hover:bg-slate-100"
            >
              Switch Role
            </button>
          </div>

          {/* Visual Progress Bar */}
          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                selectedRole === 'parent'
                  ? 'bg-blue-600'
                  : selectedRole === 'teacher'
                  ? 'bg-emerald-600'
                  : 'bg-amber-500'
              }`}
              style={{ width: `${((currentSlideIndex + 1) / currentSlides.length) * 100}%` }}
            />
          </div>

          {/* MAIN SLIDE CARD (SINGLE-FOCUS, BITE-SIZED, ACCESSIBLE) */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200 shadow-xl space-y-6">
            
            {/* Step Badge & Step Counter */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className={`text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full ${
                selectedRole === 'parent'
                  ? 'bg-blue-50 text-blue-800 border border-blue-200'
                  : selectedRole === 'teacher'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border border-amber-200'
              }`}>
                Step {currentSlide.stepNumber}: {currentSlide.badge}
              </span>

              <span className="text-xs text-slate-400 font-medium">
                {currentSlideIndex + 1} of {currentSlides.length}
              </span>
            </div>

            {/* Title & Subtitle */}
            <div className="space-y-1.5">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
                {currentSlide.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {currentSlide.subtitle}
              </p>
            </div>

            {/* Interactive Visual Mockup */}
            <div className="rounded-2xl overflow-hidden shadow-2xs">
              {currentSlide.visualMockup}
            </div>

            {/* ADHD Micro-Chunks: Action, Why It Matters, Pro-Tip */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span>What you do</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  {currentSlide.actionText}
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>Why this helps</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  {currentSlide.whyItMatters}
                </p>
              </div>

            </div>

            {/* Pro-Tip Pill */}
            <div className="p-3 bg-amber-50/70 border border-amber-200/90 rounded-2xl text-xs text-amber-900 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold">Helpful Tip: </strong>
                <span>{currentSlide.proTip}</span>
              </div>
            </div>

            {/* Bottom Navigation Buttons (Slide to next page) */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={goToPrevSlide}
                className="py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{isFirstSlide ? 'Select Different Role' : 'Previous Step'}</span>
              </button>

              <button
                type="button"
                onClick={goToNextSlide}
                className={`py-3 px-6 rounded-xl font-black text-xs transition-all flex items-center gap-2 shadow-lg active:scale-98 ${
                  isLastSlide
                    ? selectedRole === 'parent'
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : selectedRole === 'teacher'
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                    : selectedRole === 'parent'
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : selectedRole === 'teacher'
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                }`}
              >
                <span>
                  {isLastSlide 
                    ? `I'm Ready — Enter ${selectedRole === 'parent' ? 'Parent' : selectedRole === 'teacher' ? 'Teacher' : 'Admin'} Portal` 
                    : `Next Step (${currentSlideIndex + 2}/${currentSlides.length})`}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>

          {/* Quick Exit directly to Login */}
          <div className="text-center">
            <button
              type="button"
              onClick={onSkip}
              className="text-xs text-slate-500 hover:text-slate-800 font-semibold transition-colors inline-flex items-center gap-1"
            >
              <span>Skip the rest of the guide and go directly to Login</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
