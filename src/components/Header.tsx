import React, { useState, useEffect } from 'react';
import { useHifz } from '../context/HifzContext';
import { dataRepository } from '../services/dataRepository';
import {
  BookOpen,
  User,
  Users,
  GraduationCap,
  Smartphone,
  Monitor,
  RotateCcw,
  ShieldCheck,
  LogOut,
  Server,
  Bell,
  MessageSquare,
  HeartHandshake,
  ShieldAlert,
  Sliders,
  Sparkles,
  Languages,
  Database,
  Cloud,
  CloudOff,
  RefreshCw,
  Lock
} from 'lucide-react';
import { UserRole } from '../types';
import { NotificationCenterModal } from './NotificationCenterModal';
import { ParentRequestUpdateModal } from './ParentRequestUpdateModal';
import { TeacherInquiriesModal } from './TeacherInquiriesModal';
import { OfflineSyncModal } from './OfflineSyncModal';

export const Header: React.FC = () => {
  const {
    students,
    visibleStudents,
    selectedStudent,
    setSelectedStudentId,
    userRole,
    setUserRole,
    currentUser,
    portalMode,
    logoutToLanding,
    setIsSecurityModalOpen,
    devicePreview,
    setDevicePreview,
    teacherSettings,
    parentSettings,
    adminSettings,
    appLanguage,
    setAppLanguage,
    resetData,
    unreadNotificationsCount,
    parentUpdateRequests,
    setActiveTab,
    offlineQueueCount,
    isDeviceOnline,
    isSyncingCloud,
    firebaseUser,
    signOutFirebase
  } = useHifz();

  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);
  const [isParentRequestOpen, setIsParentRequestOpen] = useState(false);
  const [isTeacherInquiriesOpen, setIsTeacherInquiriesOpen] = useState(false);
  const [isOfflineSyncModalOpen, setIsOfflineSyncModalOpen] = useState(false);
  const [dbStatus, setDbStatus] = useState<{ connected: boolean; database?: string } | null>(null);

  useEffect(() => {
    dataRepository.checkCloudSqlStatus().then(status => {
      setDbStatus(status);
    }).catch(() => {
      setDbStatus({ connected: false });
    });
  }, []);

  const isTeacher = portalMode === 'teacher';
  const isAdmin = portalMode === 'admin';
  const isStudentParent = portalMode === 'student-parent';
  const pendingInquiriesCount = parentUpdateRequests.filter(r => r.status === 'pending').length;

  return (
    <header className="no-print bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl text-white flex items-center justify-center shadow-sm ${
              isAdmin ? 'bg-slate-900 text-amber-400' : isTeacher ? 'bg-emerald-800' : 'bg-blue-700'
            }`}>
              {isAdmin ? <ShieldAlert className="w-5 h-5" /> : isTeacher ? <GraduationCap className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                  {adminSettings.academyName || 'Hifz al-Quran Academy'}
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold border ${
                    isAdmin
                      ? 'bg-amber-100 text-amber-950 border-amber-300 font-bold'
                      : isTeacher
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                      : 'bg-blue-100 text-blue-800 border-blue-200'
                  }`}>
                    {isAdmin ? 'Admin Portal' : isTeacher ? 'Ustadh Portal' : 'Student & Parent'}
                  </span>
                </h1>
                <span className="font-amiri text-base text-emerald-800 hidden md:inline">
                  (حلقات تحفيظ القرآن الكريم)
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {isAdmin
                  ? `${adminSettings.academyName || 'Hifz al-Quran Academy'} • Master Governance & System Settings`
                  : isTeacher
                  ? `${adminSettings.academyName || 'Hifz al-Quran Academy'} • Circle: ${currentUser.circleCode || teacherSettings.circleName}`
                  : `${adminSettings.academyName || 'Hifz al-Quran Academy'} • ${selectedStudent.name} (${selectedStudent.rollNumber}) • Juz ${selectedStudent.currentJuz}`}
              </p>
            </div>
          </div>

          {/* Student Selector & Role Switcher */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            
            {/* Student Dropdown - STRICT DATA ISOLATION */}
            {isStudentParent ? (
              visibleStudents.length <= 1 ? (
                <div className="flex items-center gap-1.5 bg-blue-50 text-blue-950 px-3 py-1 rounded-lg border border-blue-200 text-xs">
                  <span className="text-blue-700 font-medium">My Record:</span>
                  <span className="font-bold">{selectedStudent.name}</span>
                  <span className="text-[10px] bg-blue-200/80 text-blue-900 px-1.5 py-0.5 rounded font-mono font-bold">
                    {selectedStudent.rollNumber}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 bg-blue-50 p-1 rounded-lg border border-blue-200 text-xs">
                  <span className="text-blue-700 px-1 font-semibold">My Children:</span>
                  <select
                    aria-label="Select active child"
                    value={selectedStudent.id}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    className="bg-white text-slate-800 font-semibold px-2 py-1 rounded border border-blue-300 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer text-xs"
                  >
                    {visibleStudents.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.rollNumber})
                      </option>
                    ))}
                  </select>
                </div>
              )
            ) : (
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
                <span className="text-slate-600 px-1 font-medium hidden sm:inline">
                  {isAdmin ? 'All Students:' : `Circle (${currentUser.circleCode || 'Circle'}):`}
                </span>
                <select
                  aria-label="Select active student"
                  value={selectedStudent.id}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="bg-white text-slate-800 font-semibold px-2 py-1 rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer text-xs"
                >
                  {visibleStudents.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} (Juz {s.currentJuz})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Quick Perspective Switcher inside the portal */}
            <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
              {isAdmin ? (
                <button
                  type="button"
                  onClick={() => setActiveTab('admin-control')}
                  className="px-2.5 py-1 text-xs font-bold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-md flex items-center gap-1.5 transition-all shadow-xs"
                >
                  <Sliders className="w-3.5 h-3.5 text-slate-950" />
                  <span>Admin Controls</span>
                </button>
              ) : isTeacher ? (
                <div className="px-2.5 py-1 text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Ustadh View</span>
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setUserRole('parent')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                      userRole === 'parent'
                        ? 'bg-blue-700 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                    title="Parent View: Log home study, sign tasks, track Salaah"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Parent View</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setUserRole('student')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                      userRole === 'student'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                    title="Student View: View daily tasks, feedback and revision goals"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Child View</span>
                  </button>
                </>
              )}
            </div>

            {/* Request Update Button for Parents / Students */}
            {isStudentParent && adminSettings.permissions.studentParent.canSubmitInquiries && (
              <button
                type="button"
                onClick={() => setIsParentRequestOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white transition-colors text-xs font-semibold shadow-2xs"
                title="Politely request progress or revision update from Ustadh"
              >
                <HeartHandshake className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Request Update</span>
              </button>
            )}

            {/* Inquiries Counter Button for Teacher */}
            {isTeacher && pendingInquiriesCount > 0 && (
              <button
                type="button"
                onClick={() => setIsTeacherInquiriesOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 transition-colors text-xs font-bold shadow-2xs animate-pulse"
                title="Review pending inquiries from parents"
              >
                <MessageSquare className="w-3.5 h-3.5 text-amber-700" />
                <span>{pendingInquiriesCount} Parent Inquir{pendingInquiriesCount > 1 ? 'ies' : 'y'}</span>
              </button>
            )}

            {/* In-App Notifications Bell Button */}
            <button
              type="button"
              onClick={() => setIsNotificationCenterOpen(true)}
              className="relative p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-blue-700 hover:bg-blue-50 transition-colors flex items-center justify-center text-xs"
              title="View In-App Notifications & Alerts"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-600 text-white font-bold text-[9px] w-4 h-4 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                  {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                </span>
              )}
            </button>

            {/* Device View Mode (Android / iPhone / Desktop) */}
            <div className="hidden lg:flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setDevicePreview('responsive')}
                className={`p-1.5 rounded text-xs font-medium ${
                  devicePreview === 'responsive' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Wide Desktop View"
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setDevicePreview('iphone')}
                className={`p-1.5 rounded text-xs font-medium flex items-center gap-1 ${
                  devicePreview === 'iphone' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="iPhone Viewport Simulator"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="text-[10px]">iOS</span>
              </button>
            </div>

            {/* Language Switcher */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setAppLanguage('en')}
                className={`px-2 py-1 rounded text-xs font-bold transition-all ${
                  appLanguage === 'en' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="English"
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setAppLanguage('ur')}
                className={`px-2 py-1 rounded text-xs font-bold transition-all font-serif ${
                  appLanguage === 'ur' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="اردو (Urdu)"
              >
                اردو
              </button>
              <button
                type="button"
                onClick={() => setAppLanguage('ar')}
                className={`px-2 py-1 rounded text-xs font-bold transition-all font-amiri ${
                  appLanguage === 'ar' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="العربية (Arabic)"
              >
                عربي
              </button>
            </div>

            {/* Interactive Cloud SQL & Offline Sync Queue Button */}
            <button
              type="button"
              onClick={() => setIsOfflineSyncModalOpen(true)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all ${
                !isDeviceOnline
                  ? 'bg-amber-100 text-amber-950 border-amber-300 hover:bg-amber-200 shadow-2xs'
                  : isSyncingCloud
                  ? 'bg-blue-50 text-blue-900 border-blue-300 animate-pulse'
                  : offlineQueueCount > 0
                  ? 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100'
                  : 'bg-emerald-50 text-emerald-900 border-emerald-200 hover:bg-emerald-100'
              }`}
              title="Click to view Offline Sync Queue & Cloud SQL sync status"
            >
              {!isDeviceOnline ? (
                <>
                  <CloudOff className="w-3.5 h-3.5 text-amber-700" />
                  <span>Saved on device ({offlineQueueCount})</span>
                </>
              ) : isSyncingCloud ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 text-blue-700 animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : offlineQueueCount > 0 ? (
                <>
                  <Cloud className="w-3.5 h-3.5 text-amber-700" />
                  <span>Saved on device ({offlineQueueCount})</span>
                </>
              ) : (
                <>
                  <Cloud className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Uploaded</span>
                </>
              )}
            </button>

            {/* Firebase Auth User Status / Sign Out */}
            {firebaseUser ? (
              <div className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-100 border border-slate-200 text-[11px] text-slate-700">
                <Lock className="w-3 h-3 text-emerald-600" />
                <span className="font-semibold truncate max-w-[100px]" title={firebaseUser.email || ''}>
                  {firebaseUser.email?.split('@')[0]}
                </span>
                <button
                  type="button"
                  onClick={signOutFirebase}
                  className="text-[10px] text-rose-600 hover:text-rose-800 font-bold ml-0.5 underline"
                  title="Sign out of Firebase Auth"
                >
                  Exit
                </button>
              </div>
            ) : null}

            {/* Exit Portal / Switch Portal Button */}
            <button
              type="button"
              onClick={logoutToLanding}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100 transition-colors text-xs font-semibold"
              title="Return to Landing Portal Gateway"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Switch Portal</span>
            </button>

          </div>

        </div>

        {/* Role Banner Indicator */}
        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`w-2 h-2 rounded-full ${
              isAdmin ? 'bg-amber-400' : isTeacher ? 'bg-emerald-500' : 'bg-blue-500'
            }`}></span>
            <span>Active Perspective:</span>
            <span className="font-semibold text-slate-800">
              {isAdmin && `Principal Administrator (${adminSettings.adminEmail} - Master Screen Dictation & Roaster Control)`}
              {isTeacher && `Ustadh/Teacher (${currentUser.email || teacherSettings.circleName} - Circle ${currentUser.circleCode})`}
              {!isTeacher && !isAdmin && userRole === 'parent' && `Parent (${selectedStudent.parentName} - Home Tarbiyah & Signing Mode)`}
              {!isTeacher && !isAdmin && userRole === 'student' && `Student (${selectedStudent.name} - Study & Progress View)`}
            </span>
            <span className="text-slate-400 hidden sm:inline">•</span>
            <span className="text-slate-500 text-[11px] hidden sm:inline font-mono">
              {isAdmin ? 'Master Control Active' : isTeacher ? `Circle: ${currentUser.circleCode}` : `Account: ${currentUser.email || selectedStudent.parentEmail}`}
            </span>
          </div>

          <div className="text-[11px] text-slate-500 font-medium">
            Academic Term: <span className="font-semibold text-slate-700">{adminSettings.academicYear}</span>
          </div>
        </div>
      </div>

      {/* Notification Center Modal */}
      <NotificationCenterModal
        isOpen={isNotificationCenterOpen}
        onClose={() => setIsNotificationCenterOpen(false)}
      />

      {/* Parent Courteous Request Update Modal */}
      <ParentRequestUpdateModal
        isOpen={isParentRequestOpen}
        onClose={() => setIsParentRequestOpen(false)}
      />

      {/* Ustadh Inquiries Review Modal */}
      <TeacherInquiriesModal
        isOpen={isTeacherInquiriesOpen}
        onClose={() => setIsTeacherInquiriesOpen(false)}
      />

      {/* Offline Sync Queue & Cloud SQL Modal */}
      <OfflineSyncModal
        isOpen={isOfflineSyncModalOpen}
        onClose={() => setIsOfflineSyncModalOpen(false)}
      />

    </header>
  );
};
