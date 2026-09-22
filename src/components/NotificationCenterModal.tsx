import React, { useState } from 'react';
import { useHifz } from '../context/HifzContext';
import {
  Bell,
  CheckCheck,
  Trash2,
  X,
  Award,
  Calendar,
  MessageSquare,
  FileCheck,
  Info,
  ExternalLink
} from 'lucide-react';
import { AppNotification } from '../types';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  onClose
}) => {
  const {
    notifications,
    unreadNotificationsCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearNotifications,
    setActiveTab,
    pushSettings
  } = useHifz();

  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  if (!isOpen) return null;

  const filteredList = notifications.filter(n => (filter === 'unread' ? !n.read : true));

  const getIconForType = (type: AppNotification['type']) => {
    switch (type) {
      case 'grade':
        return <Award className="w-4 h-4 text-emerald-600" />;
      case 'attendance':
        return <Calendar className="w-4 h-4 text-blue-600" />;
      case 'parent_inquiry':
        return <MessageSquare className="w-4 h-4 text-amber-600" />;
      case 'report_signed':
        return <FileCheck className="w-4 h-4 text-purple-600" />;
      default:
        return <Info className="w-4 h-4 text-slate-600" />;
    }
  };

  const handleClickItem = (item: AppNotification) => {
    markNotificationAsRead(item.id);
    if (item.linkTab) {
      setActiveTab(item.linkTab);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-100 text-blue-800">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                Notifications & Alerts
                {unreadNotificationsCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                    {unreadNotificationsCount} New
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-500">
                Push status: {pushSettings.pushEnabled ? 'Active (Browser + App)' : 'Muted'}
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

        {/* Action & Filter Bar */}
        <div className="p-3 border-b border-slate-100 bg-white flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                filter === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('unread')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                filter === 'unread'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Unread ({unreadNotificationsCount})
            </button>
          </div>

          <div className="flex items-center gap-2">
            {unreadNotificationsCount > 0 && (
              <button
                type="button"
                onClick={markAllNotificationsAsRead}
                className="text-blue-700 hover:text-blue-900 font-semibold flex items-center gap-1"
                title="Mark all as read"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Mark all read</span>
              </button>
            )}
            {notifications.length > 0 && (
              <button
                type="button"
                onClick={clearNotifications}
                className="text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1"
                title="Clear all notifications"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Clear</span>
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="p-3 overflow-y-auto space-y-2 flex-1 divide-y divide-slate-100">
          {filteredList.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs">
              <Bell className="w-8 h-8 mx-auto mb-2 text-slate-300 stroke-1" />
              <p>No {filter === 'unread' ? 'unread ' : ''}notifications at this moment.</p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                New recitation marks, attendance flags, and inquiries will show up here.
              </p>
            </div>
          ) : (
            filteredList.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleClickItem(notif)}
                className={`p-3 rounded-xl transition-all cursor-pointer flex items-start gap-3 pt-3 ${
                  notif.read
                    ? 'bg-white hover:bg-slate-50 opacity-85'
                    : 'bg-blue-50/50 hover:bg-blue-50 border border-blue-100 shadow-2xs'
                }`}
              >
                <div className={`p-2 rounded-xl mt-0.5 shrink-0 ${
                  notif.read ? 'bg-slate-100 text-slate-600' : 'bg-white shadow-2xs border border-blue-200'
                }`}>
                  {getIconForType(notif.type)}
                </div>

                <div className="flex-1 min-w-0 space-y-0.5">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className={`text-xs ${notif.read ? 'font-semibold text-slate-800' : 'font-extrabold text-slate-900'}`}>
                      {notif.title}
                    </h4>
                    <span className="text-[10px] text-slate-400 shrink-0">{notif.timestamp}</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                    {notif.message}
                  </p>
                  {notif.linkTab && (
                    <span className="text-[10px] text-blue-700 font-semibold inline-flex items-center gap-1 pt-1">
                      <span>View in {notif.linkTab.replace('-', ' ')}</span>
                      <ExternalLink className="w-3 h-3" />
                    </span>
                  )}
                </div>

                {!notif.read && (
                  <span className="w-2 h-2 rounded-full bg-blue-600 mt-2 shrink-0"></span>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Notifications persist across sessions in local ledger.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 font-semibold"
          >
            Dismiss
          </button>
        </div>

      </div>
    </div>
  );
};
