import React, { useState } from 'react';
import { useHifz } from '../context/HifzContext';
import {
  Bell,
  Volume2,
  VolumeX,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Send,
  ShieldCheck
} from 'lucide-react';

export const PushNotificationSettingsSection: React.FC = () => {
  const {
    pushSettings,
    updatePushSettings,
    requestPushPermission,
    sendTestPushNotification
  } = useHifz();

  const [testSent, setTestSent] = useState(false);

  const handleToggle = (key: keyof typeof pushSettings) => {
    if (typeof pushSettings[key] === 'boolean') {
      updatePushSettings({ [key]: !pushSettings[key] });
    }
  };

  const handleRequestBrowserPermission = async () => {
    await requestPushPermission();
  };

  const handleTestPush = () => {
    sendTestPushNotification();
    setTestSent(true);
    setTimeout(() => setTestSent(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
          <Bell className="w-4 h-4 text-emerald-700" />
          <span>Live Push Notifications & Event Triggers</span>
        </div>

        <div className="flex items-center gap-2">
          {pushSettings.permissionStatus === 'granted' ? (
            <span className="text-[10px] px-2.5 py-1 rounded-full font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              Browser Push Granted
            </span>
          ) : pushSettings.permissionStatus === 'denied' ? (
            <span className="text-[10px] px-2.5 py-1 rounded-full font-bold bg-rose-50 text-rose-800 border border-rose-300 flex items-center gap-1">
              <AlertCircle className="w-3 h-3 text-rose-600" />
              Push Blocked by Browser
            </span>
          ) : (
            <button
              type="button"
              onClick={handleRequestBrowserPermission}
              className="text-[10px] px-2.5 py-1 rounded-full font-bold bg-blue-50 text-blue-800 border border-blue-300 hover:bg-blue-100 flex items-center gap-1 transition-colors"
            >
              <Smartphone className="w-3 h-3 text-blue-600" />
              Enable Browser Push
            </button>
          )}

          <button
            type="button"
            onClick={handleTestPush}
            className="text-[10px] px-2.5 py-1 rounded-full font-bold bg-slate-100 text-slate-800 border border-slate-300 hover:bg-slate-200 flex items-center gap-1 transition-colors"
            title="Fire a test push notification right now"
          >
            {testSent ? (
              <>
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Test Fired!</span>
              </>
            ) : (
              <>
                <Send className="w-3 h-3" />
                <span>Test Push</span>
              </>
            )}
          </button>
        </div>
      </div>

      <p className="text-xs text-slate-500">
        Control when you receive instant sound cues and device push notifications when messages, grades, attendance, or inquiries happen.
      </p>

      {/* Master Toggles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-800 block">Master Push Notification Switch</span>
            <span className="text-[11px] text-slate-500">Enable in-app toasts & browser push alerts</span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={pushSettings.pushEnabled}
              onChange={() => handleToggle('pushEnabled')}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
          </label>
        </div>

        <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {pushSettings.soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-400" />
            )}
            <div>
              <span className="text-xs font-bold text-slate-800 block">Audible Chime / Sound FX</span>
              <span className="text-[11px] text-slate-500">Play pleasant sound on incoming updates</span>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={pushSettings.soundEnabled}
              onChange={() => handleToggle('soundEnabled')}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
          </label>
        </div>
      </div>

      {/* Specific Event Checkboxes */}
      <div className="pt-2 border-t border-slate-100 space-y-2.5">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
          Event Triggers & Push Categories
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          
          <label className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={pushSettings.notifyOnGradeRecitation}
              onChange={() => handleToggle('notifyOnGradeRecitation')}
              className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
            />
            <div>
              <span className="font-semibold text-slate-800 block">Recitation Grades & Pass/Repeat</span>
              <span className="text-[10px] text-slate-500">Alerts when Sabaq, Sabaqee or Dawr is evaluated</span>
            </div>
          </label>

          <label className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={pushSettings.notifyOnAttendanceStatus}
              onChange={() => handleToggle('notifyOnAttendanceStatus')}
              className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
            />
            <div>
              <span className="font-semibold text-slate-800 block">Daily Attendance Status</span>
              <span className="text-[10px] text-slate-500">Alerts for circle arrival, late marks or absences</span>
            </div>
          </label>

          <label className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={pushSettings.notifyOnParentInquiry}
              onChange={() => handleToggle('notifyOnParentInquiry')}
              className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
            />
            <div>
              <span className="font-semibold text-slate-800 block">Parent Inquiries & Teacher Responses</span>
              <span className="text-[10px] text-slate-500">Alerts for questions, home advice & replies</span>
            </div>
          </label>

          <label className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={pushSettings.notifyOnEvaluationSign}
              onChange={() => handleToggle('notifyOnEvaluationSign')}
              className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
            />
            <div>
              <span className="font-semibold text-slate-800 block">Weekly Dossier Signatures</span>
              <span className="text-[10px] text-slate-500">When Ustadh or Parent digitally signs evaluations</span>
            </div>
          </label>

          <label className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors sm:col-span-2">
            <input
              type="checkbox"
              checked={pushSettings.notifyOnTarbiyahHomeLogs}
              onChange={() => handleToggle('notifyOnTarbiyahHomeLogs')}
              className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
            />
            <div>
              <span className="font-semibold text-slate-800 block">Home Tarbiyah & Fajr Prayer Logs</span>
              <span className="text-[10px] text-slate-500">Daily reminder for morning home Sabaq recitation before Madrasah</span>
            </div>
          </label>

        </div>
      </div>

    </div>
  );
};
