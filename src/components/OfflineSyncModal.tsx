import React, { useState } from 'react';
import { useHifz } from '../context/HifzContext';
import { syncQueue } from '../services/syncQueue';
import {
  X,
  Cloud,
  CloudOff,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Wifi,
  WifiOff,
  Database,
  ArrowRight
} from 'lucide-react';

interface OfflineSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OfflineSyncModal: React.FC<OfflineSyncModalProps> = ({ isOpen, onClose }) => {
  const {
    offlineQueueCount,
    isDeviceOnline,
    isSyncingCloud,
    syncNow
  } = useHifz();

  const [queueItems, setQueueItems] = useState(() => syncQueue.getQueue());
  const [syncResult, setSyncResult] = useState<{ synced: number; failed: number } | null>(null);
  const [isManualSyncing, setIsManualSyncing] = useState(false);
  const [simulatedOffline, setSimulatedOffline] = useState(() => syncQueue.isSimulatedOffline());

  React.useEffect(() => {
    if (isOpen) {
      setQueueItems(syncQueue.getQueue());
      setSimulatedOffline(syncQueue.isSimulatedOffline());
    }
  }, [isOpen, offlineQueueCount]);

  if (!isOpen) return null;

  const handleToggleSimulatedOffline = () => {
    const next = !simulatedOffline;
    syncQueue.setSimulatedOffline(next);
    setSimulatedOffline(next);
    setQueueItems(syncQueue.getQueue());
  };

  const handleManualSync = async () => {
    setIsManualSyncing(true);
    setSyncResult(null);
    try {
      const res = await syncNow();
      setSyncResult(res);
      setQueueItems(syncQueue.getQueue());
    } catch (err: any) {
      console.error('Manual sync failed:', err);
    } finally {
      setIsManualSyncing(false);
    }
  };

  const handleClearSynced = () => {
    syncQueue.clearSynced();
    setQueueItems(syncQueue.getQueue());
  };

  const pendingItems = queueItems.filter(i => i.status === 'pending' || i.status === 'failed' || i.status === 'syncing');
  const completedItems = queueItems.filter(i => i.status === 'synced');

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-xs ${
              isDeviceOnline ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
            }`}>
              {isDeviceOnline ? <Cloud className="w-5 h-5" /> : <CloudOff className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900">
                  Offline Sync & Cloud SQL Queue
                </h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  isDeviceOnline ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                }`}>
                  {isDeviceOnline ? 'Online' : 'Offline Mode'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Automatic offline recording with persistent queue syncing to Cloud SQL.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Network Status & Offline Simulation Banner */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isDeviceOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <span className="text-xs font-bold text-slate-800">
                Connection Status: {isDeviceOnline ? 'Connected to Cloud SQL' : 'Disconnected / Offline Recording'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              {isDeviceOnline
                ? 'All lesson evaluations are synced to the Cloud SQL database in real-time.'
                : 'Changes are safely stored locally and will sync as soon as connectivity resumes.'}
            </p>
          </div>

          <button
            type="button"
            onClick={handleToggleSimulatedOffline}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 ${
              simulatedOffline
                ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-xs'
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
            title="Toggle offline simulator for testing offline assessment in classrooms"
          >
            {simulatedOffline ? <WifiOff className="w-3.5 h-3.5" /> : <Wifi className="w-3.5 h-3.5" />}
            <span>{simulatedOffline ? 'Resume Online Mode' : 'Test Offline Mode'}</span>
          </button>
        </div>

        {/* Summary Metric Counters */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200">
            <span className="text-xs font-medium text-amber-800 block">Pending Changes</span>
            <span className="text-lg font-black text-amber-950">{pendingItems.length}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
            <span className="text-xs font-medium text-emerald-800 block">Synced to Cloud</span>
            <span className="text-lg font-black text-emerald-950">{completedItems.length}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200">
            <span className="text-xs font-medium text-blue-800 block">Target Database</span>
            <span className="text-xs font-mono font-bold text-blue-950 block mt-1">Cloud SQL</span>
          </div>
        </div>

        {/* Sync Result Alert */}
        {syncResult && (
          <div className={`p-3 rounded-xl text-xs font-medium flex items-center justify-between ${
            syncResult.failed === 0 ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' : 'bg-amber-50 text-amber-900 border border-amber-200'
          }`}>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Sync complete: {syncResult.synced} items synchronized to Cloud SQL {syncResult.failed > 0 && `(${syncResult.failed} failed)`}.
            </span>
            <button
              type="button"
              onClick={() => setSyncResult(null)}
              className="text-slate-400 hover:text-slate-700"
            >
              ✕
            </button>
          </div>
        )}

        {/* Queue Items List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[160px] max-h-[260px]">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 px-1">
            <span>Sync Queue ({queueItems.length} operations)</span>
            {completedItems.length > 0 && (
              <button
                type="button"
                onClick={handleClearSynced}
                className="text-[11px] text-slate-500 hover:text-slate-800 underline"
              >
                Clear Synced History
              </button>
            )}
          </div>

          {queueItems.length === 0 ? (
            <div className="text-center py-8 text-slate-400 space-y-2 border border-dashed border-slate-200 rounded-2xl">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <p className="text-xs font-semibold text-slate-700">
                Queue is completely clear!
              </p>
              <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                All records, attendance, and scores are fully backed up and up-to-date with Google Cloud SQL.
              </p>
            </div>
          ) : (
            queueItems.map((item) => {
              const isPending = item.status === 'pending' || item.status === 'syncing';
              const isFailed = item.status === 'failed';
              const isSynced = item.status === 'synced';

              return (
                <div
                  key={item.id}
                  className={`p-2.5 rounded-xl border text-xs flex items-center justify-between gap-2 transition-all ${
                    isPending
                      ? 'bg-amber-50/60 border-amber-200'
                      : isFailed
                      ? 'bg-rose-50 border-rose-200'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="shrink-0">
                      {isSynced && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                      {isPending && <Clock className="w-4 h-4 text-amber-600 animate-pulse" />}
                      {isFailed && <AlertTriangle className="w-4 h-4 text-rose-600" />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 truncate">
                          {item.description}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-200 text-slate-700 uppercase">
                          {item.method}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5 font-mono">
                        <span>{item.endpoint}</span>
                        <span>•</span>
                        <span>{new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 uppercase tracking-wider ${
                    isSynced
                      ? 'bg-emerald-100 text-emerald-800'
                      : isPending
                      ? 'bg-amber-100 text-amber-900'
                      : 'bg-rose-100 text-rose-800'
                  }`}>
                    {item.status}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5 font-medium">
            <Database className="w-3.5 h-3.5 text-slate-400" />
            <span>Encrypted SQLite/IndexedDB Storage</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Close
            </button>
            <button
              type="button"
              disabled={isManualSyncing || isSyncingCloud}
              onClick={handleManualSync}
              className="px-4 py-2 text-xs font-black bg-emerald-800 hover:bg-emerald-900 active:scale-95 text-white rounded-xl shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isManualSyncing || isSyncingCloud ? 'animate-spin' : ''}`} />
              <span>{isManualSyncing || isSyncingCloud ? 'Syncing...' : 'Force Sync Now'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
