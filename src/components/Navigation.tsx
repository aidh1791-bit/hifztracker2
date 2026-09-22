import React from 'react';
import { useHifz } from '../context/HifzContext';
import {
  LayoutDashboard,
  BookCheck,
  CalendarCheck,
  Moon,
  Award,
  Settings,
  ShieldAlert,
  Sliders
} from 'lucide-react';
import { ActiveTab } from '../types';

export const Navigation: React.FC = () => {
  const { activeTab, setActiveTab, portalMode, adminSettings } = useHifz();

  const isTeacher = portalMode === 'teacher';
  const isAdmin = portalMode === 'admin';
  const isStudentParent = portalMode === 'student-parent';
  const permissions = adminSettings.permissions;

  // Dynamically build available tabs based on Admin Visibility Dictation
  const allTabs: { id: ActiveTab; label: string; subLabel: string; icon: React.FC<{ className?: string }>; visible: boolean; adminOnly?: boolean }[] = [
    {
      id: 'admin-control',
      label: 'Admin Control Center',
      subLabel: 'Visibility, Teachers & Rosters',
      icon: ShieldAlert,
      visible: isAdmin,
      adminOnly: true
    },
    {
      id: 'dashboard',
      label: isAdmin ? 'Academy Overview' : isTeacher ? 'Class Dashboard' : 'My Quran Plan',
      subLabel: isAdmin ? 'Global Statistics' : isTeacher ? 'Circle Roster & Pace' : 'Progress & Goals',
      icon: LayoutDashboard,
      visible: true
    },
    {
      id: 'daily-hifz',
      label: isAdmin ? 'Recitation Marks' : isTeacher ? 'Grading & Marks' : 'Daily Recitations',
      subLabel: 'Sabaq, Sabaqee & Dawr',
      icon: BookCheck,
      // Admin dictation: check studentParent.canViewSabaqScores
      visible: isAdmin || isTeacher || permissions.studentParent.canViewSabaqScores
    },
    {
      id: 'attendance',
      label: isAdmin ? 'Attendance Register' : isTeacher ? 'Attendance Register' : 'My Attendance',
      subLabel: isTeacher ? 'Circle Register' : 'Monthly Record',
      icon: CalendarCheck,
      // Admin dictation: check studentParent.canViewAttendance
      visible: isAdmin || isTeacher || permissions.studentParent.canViewAttendance
    },
    {
      id: 'home-tarbiyah',
      label: isAdmin ? 'Tarbiyah Logs' : isTeacher ? 'Home Learning Oversight' : 'Home Study & Salaah',
      subLabel: isTeacher ? 'Parent Tasks & Mins' : 'Log Minutes & Prayers',
      icon: Moon,
      // Admin dictation: check studentParent.canViewTarbiyahHome
      visible: isAdmin || isTeacher || permissions.studentParent.canViewTarbiyahHome
    },
    {
      id: 'weekly-report',
      label: isAdmin ? 'Weekly Dossiers' : isTeacher ? 'Weekly Dossiers' : 'Weekly Report Card',
      subLabel: isTeacher ? 'Review & Sign' : 'Teacher Feedback',
      icon: Award,
      // Admin dictation: check studentParent.canViewWeeklyEvaluation
      visible: isAdmin || isTeacher || permissions.studentParent.canViewWeeklyEvaluation
    },
    {
      id: 'settings',
      label: isAdmin ? 'Academy Config' : isTeacher ? 'Ustadh Settings' : 'Family Settings',
      subLabel: isAdmin ? 'System Configuration' : isTeacher ? 'Rules & Sync' : 'Goals & Profile',
      icon: Settings,
      visible: true
    }
  ];

  const visibleTabs = allTabs.filter(t => t.visible);

  return (
    <>
      {/* Desktop / Tablet Sub-Header Navigation */}
      <nav className="no-print bg-white border-b border-slate-200 sticky top-[73px] z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center space-x-1 sm:space-x-4 overflow-x-auto py-2 scrollbar-none">
            {visibleTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const isAdminSpecial = tab.id === 'admin-control';

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                    isActive
                      ? isAdminSpecial
                        ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                        : isTeacher
                        ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200 shadow-2xs'
                        : 'bg-blue-50 text-blue-900 font-bold border border-blue-200 shadow-2xs'
                      : isAdminSpecial
                      ? 'bg-amber-100/80 text-amber-950 hover:bg-amber-200 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${
                    isActive
                      ? isAdminSpecial ? 'text-slate-950' : isTeacher ? 'text-emerald-700' : 'text-blue-700'
                      : isAdminSpecial ? 'text-amber-700' : 'text-slate-500'
                  }`} />
                  <div className="text-left">
                    <div className="leading-tight">{tab.label}</div>
                    <div className="text-[10px] text-slate-400 font-normal hidden sm:block">
                      {tab.subLabel}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation Bar (Optimized for Android & iPhone) */}
      <div className="no-print md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 shadow-lg safe-area-bottom">
        <div className="flex items-center justify-around">
          {visibleTabs.slice(0, 5).map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
                  isActive
                    ? isAdmin ? 'text-amber-600 font-bold' : isTeacher ? 'text-emerald-700 font-bold' : 'text-blue-700 font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <div className={`p-1 rounded-full ${
                  isActive
                    ? isAdmin ? 'bg-amber-100' : isTeacher ? 'bg-emerald-100' : 'bg-blue-100'
                    : 'bg-transparent'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="mt-0.5 truncate max-w-[65px]">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};
