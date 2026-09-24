import React, { useState } from 'react';
import { useHifz } from '../context/HifzContext';
import { auth } from '../lib/firebase';
import { ShieldAlert, RefreshCw, LogOut, Lock, CheckCircle2 } from 'lucide-react';
import { authenticatedFetch } from '../services/apiClient';

export const UnassignedAccountView: React.FC = () => {
  const { currentUser, userRole, adminSettings } = useHifz();
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const isDisabled = userRole === 'disabled';

  const handleCheckStatus = async () => {
    setChecking(true);
    setMessage(null);
    try {
      const res = await authenticatedFetch('/api/me');
      if (res.ok) {
        const data = await res.json();
        if (data.role && data.role !== 'unassigned' && data.role !== 'disabled') {
          setMessage(`Success! Your role has been confirmed as '${data.role}'. Reloading session...`);
          setTimeout(() => {
            window.location.reload();
          }, 1200);
          return;
        } else {
          setMessage('Account status checked: Still awaiting administrator role approval or child link.');
        }
      } else {
        setMessage('Unable to reach server. Please check your connection and try again.');
      }
    } catch {
      setMessage('Network error while checking approval status.');
    } finally {
      setChecking(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await auth.signOut();
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 sm:p-6 text-slate-100">
      <div className="w-full max-w-lg bg-slate-800/90 border border-slate-700/80 rounded-2xl shadow-2xl p-6 sm:p-8 backdrop-blur-md">
        {/* Header Icon & Status */}
        <div className="text-center mb-6">
          <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center border shadow-inner ${
            isDisabled
              ? 'bg-rose-950/40 border-rose-800/50 text-rose-400'
              : 'bg-amber-950/40 border-amber-800/50 text-amber-400'
          }`}>
            {isDisabled ? <Lock className="w-8 h-8" /> : <ShieldAlert className="w-8 h-8" />}
          </div>

          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            {isDisabled ? 'Account Access Revoked' : 'Awaiting Administrator Approval'}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {adminSettings.academyName || 'Hifz Madrasah Academy'}
          </p>
        </div>

        {/* User Badge Details */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 mb-6 space-y-2 text-xs">
          <div className="flex justify-between items-center text-slate-300">
            <span className="text-slate-400">Authenticated Email:</span>
            <span className="font-mono font-medium text-slate-200">{currentUser?.email || auth.currentUser?.email || 'N/A'}</span>
          </div>
          <div className="flex justify-between items-center text-slate-300">
            <span className="text-slate-400">Account UID:</span>
            <span className="font-mono text-[11px] text-slate-400 truncate max-w-[200px]">{currentUser?.uid || auth.currentUser?.uid}</span>
          </div>
          <div className="flex justify-between items-center text-slate-300">
            <span className="text-slate-400">Status:</span>
            <span className={`px-2 py-0.5 rounded text-[11px] font-semibold tracking-wide uppercase ${
              isDisabled
                ? 'bg-rose-900/60 text-rose-300 border border-rose-700/40'
                : 'bg-amber-900/60 text-amber-300 border border-amber-700/40'
            }`}>
              {isDisabled ? 'Disabled' : 'Pending Authorization'}
            </span>
          </div>
        </div>

        {/* Policy Notice Box */}
        <div className="bg-slate-850 border border-slate-700/60 rounded-xl p-4 mb-6 text-xs text-slate-300 leading-relaxed space-y-2">
          {isDisabled ? (
            <p>
              Your user credentials have been deactivated or your permissions revoked by the madrasah administrator. You do not currently have permission to access any student records, rosters, or academic evaluations.
            </p>
          ) : (
            <>
              <p className="font-medium text-slate-200">
                Safeguarding & Student Privacy Protection:
              </p>
              <p>
                In strict adherence to Madrasah Child Data Protection policies, newly authenticated Google/Firebase accounts cannot view student information until an administrator verifies your identity and assigns your role:
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-400 pl-1 pt-1">
                <li><strong className="text-slate-300">Teachers:</strong> Assigned to a specific Ḥalqah circle code.</li>
                <li><strong className="text-slate-300">Parents:</strong> Explicitly linked to their verified child’s ID.</li>
              </ul>
            </>
          )}
        </div>

        {message && (
          <div className="mb-5 p-3 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-200 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {/* Action Controls */}
        <div className="space-y-3">
          {!isDisabled && (
            <button
              type="button"
              onClick={handleCheckStatus}
              disabled={checking}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white font-medium rounded-xl text-xs transition-colors shadow-md"
            >
              <RefreshCw className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} />
              <span>{checking ? 'Checking Status...' : 'Refresh Approval Status'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-700/80 hover:bg-slate-700 text-slate-200 font-medium rounded-xl text-xs transition-colors border border-slate-600/50"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out of Account</span>
          </button>
        </div>
      </div>
    </div>
  );
};
