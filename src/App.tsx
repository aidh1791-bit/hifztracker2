import React, { useState } from 'react';
import { HifzProvider, useHifz } from './context/HifzContext';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { MobileDeviceFrame } from './components/MobileDeviceFrame';
import { DashboardView } from './components/DashboardView';
import { DailyHifzLogView } from './components/DailyHifzLogView';
import { AttendanceView } from './components/AttendanceView';
import { TarbiyahHomeView } from './components/TarbiyahHomeView';
import { WeeklyReportView } from './components/WeeklyReportView';
import { SettingsView } from './components/SettingsView';
import { LandingPortalView } from './components/LandingPortalView';
import { AdminControlView } from './components/AdminControlView';
import { SecurityArchitectureModal } from './components/SecurityArchitectureModal';
import { QuickAssessmentModal } from './components/QuickAssessmentModal';
import { UnassignedAccountView } from './components/UnassignedAccountView';
import { ErrorBoundary } from './components/ErrorBoundary';
import { PlusCircle } from 'lucide-react';

const AppContent: React.FC = () => {
  const { activeTab, userRole, portalMode, adminSettings, firebaseUser } = useHifz();
  const [isQuickAssessmentOpen, setIsQuickAssessmentOpen] = useState(false);

  // If an authenticated user has no assigned role / circle or is disabled (Phase 5 & 6)
  if (firebaseUser && (userRole === 'unassigned' || userRole === 'disabled')) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col justify-between text-slate-100">
        <UnassignedAccountView />
      </div>
    );
  }

  // If in Landing mode, display the dedicated Student/Parent vs Teacher vs Admin Gateway
  if (portalMode === 'landing') {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col justify-between text-slate-900">
        <LandingPortalView />
        <SecurityArchitectureModal />
        <footer className="border-t border-slate-200 bg-white py-4 mt-auto">
          <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div>
              {adminSettings.academyName} &copy; {new Date().getFullYear()} • Role-Based Portal Architecture
            </div>
            <div className="flex items-center gap-3 text-[11px] text-slate-400">
              <span>Admin Screen Dictation</span>
              <span>•</span>
              <span>Circle Code Scoping</span>
              <span>•</span>
              <span>Parent Zero-Leak Privacy</span>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-900">
      <Header />
      <Navigation />

      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-5">
        <MobileDeviceFrame>
          <ErrorBoundary fallbackTitle="Module Display Notice">
            {activeTab === 'admin-control' && <AdminControlView />}
            {activeTab === 'dashboard' && <DashboardView />}
            {activeTab === 'daily-hifz' && <DailyHifzLogView />}
            {activeTab === 'attendance' && <AttendanceView />}
            {activeTab === 'home-tarbiyah' && <TarbiyahHomeView />}
            {activeTab === 'weekly-report' && <WeeklyReportView />}
            {activeTab === 'settings' && <SettingsView />}
          </ErrorBoundary>
        </MobileDeviceFrame>
      </main>

      {/* Floating Action Button for Teachers (Quick Recitation Entry) */}
      {(userRole === 'teacher' || portalMode === 'teacher') && adminSettings.permissions.teacher.canGradeDailyHifz && (
        <div className="no-print fixed bottom-20 md:bottom-6 right-6 z-40">
          <button
            type="button"
            onClick={() => setIsQuickAssessmentOpen(true)}
            className="flex items-center gap-2 px-4 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-full shadow-lg hover:shadow-xl font-bold text-xs transition-all hover:scale-105 active:scale-95"
            title="Rapidly record today's recitation marks"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Quick Grade Today</span>
          </button>
        </div>
      )}

      {/* Quick Assessment Modal */}
      <QuickAssessmentModal
        isOpen={isQuickAssessmentOpen}
        onClose={() => setIsQuickAssessmentOpen(false)}
      />

      {/* Security Architecture Modal */}
      <SecurityArchitectureModal />

      {/* Footer */}
      <footer className="no-print border-t border-slate-200 bg-white py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            {adminSettings.academyName} &copy; {new Date().getFullYear()} • Role-Based Portal Architecture
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span>Sabaq (New Lesson)</span>
            <span>•</span>
            <span>Sabaq Para (Latest Juz)</span>
            <span>•</span>
            <span>Dawr / Manzil (Revision)</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary fallbackTitle="Portal Initialization Error">
      <HifzProvider>
        <AppContent />
      </HifzProvider>
    </ErrorBoundary>
  );
}
