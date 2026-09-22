export interface QueuedMutation {
  id: string;
  endpoint: string;
  method: 'POST' | 'PUT' | 'DELETE';
  payload: any;
  entityType: 'hifz_record' | 'attendance' | 'student' | 'tarbiyah' | 'home_learning' | 'evaluation' | 'settings';
  description: string;
  createdAt: string;
  attempts: number;
  lastError?: string;
  status: 'pending' | 'syncing' | 'failed' | 'synced';
}

const QUEUE_STORAGE_KEY = 'madrasah_offline_sync_queue_v1';
const LAST_SYNC_KEY = 'madrasah_last_cloud_sync_timestamp';

type SyncListener = (queue: QueuedMutation[], isOnline: boolean, isSyncing: boolean) => void;

class SyncQueueService {
  private queue: QueuedMutation[] = [];
  private isOnline: boolean = typeof navigator !== 'undefined' ? navigator.onLine : true;
  private isSyncing: boolean = false;
  private listeners: Set<SyncListener> = new Set();
  private timer: any = null;

  private simulatedOffline: boolean = false;

  constructor() {
    this.loadQueue();
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        if (!this.simulatedOffline) {
          this.isOnline = true;
          this.notify();
          this.processQueue();
        }
      });

      window.addEventListener('offline', () => {
        this.isOnline = false;
        this.notify();
      });

      // Periodic queue check every 15 seconds
      this.timer = setInterval(() => {
        if (this.isOnline && this.queue.some(item => item.status === 'pending' || item.status === 'failed')) {
          this.processQueue();
        }
      }, 15000);
    }
  }

  public isSimulatedOffline(): boolean {
    return this.simulatedOffline;
  }

  public setSimulatedOffline(simulated: boolean): void {
    this.simulatedOffline = simulated;
    this.isOnline = simulated ? false : (typeof navigator !== 'undefined' ? navigator.onLine : true);
    this.notify();
    if (this.isOnline) {
      this.processQueue();
    }
  }

  public clearSynced(): void {
    this.queue = this.queue.filter(item => item.status !== 'synced');
    this.saveQueue();
  }

  private loadQueue(): void {
    try {
      const raw = localStorage.getItem(QUEUE_STORAGE_KEY);
      if (raw) {
        this.queue = JSON.parse(raw);
      }
    } catch (err) {
      console.warn('[SyncQueue] Failed to load offline queue:', err);
      this.queue = [];
    }
  }

  private saveQueue(): void {
    try {
      localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(this.queue));
    } catch (err) {
      console.error('[SyncQueue] Failed to persist offline queue:', err);
    }
    this.notify();
  }

  public subscribe(listener: SyncListener): () => void {
    this.listeners.add(listener);
    listener(this.queue, this.isOnline, this.isSyncing);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    for (const listener of this.listeners) {
      try {
        listener(this.queue, this.isOnline, this.isSyncing);
      } catch (err) {
        console.error('[SyncQueue] Listener notification error:', err);
      }
    }
  }

  public getPendingCount(): number {
    return this.queue.filter(q => q.status === 'pending' || q.status === 'failed' || q.status === 'syncing').length;
  }

  public getQueue(): QueuedMutation[] {
    return [...this.queue];
  }

  public isNetworkOnline(): boolean {
    return this.isOnline;
  }

  public isCurrentlySyncing(): boolean {
    return this.isSyncing;
  }

  public getLastSyncTime(): string | null {
    try {
      return localStorage.getItem(LAST_SYNC_KEY);
    } catch {
      return null;
    }
  }

  /**
   * Enqueue a mutation for synchronization to Cloud SQL.
   */
  public enqueue(
    endpoint: string,
    method: 'POST' | 'PUT' | 'DELETE',
    payload: any,
    entityType: QueuedMutation['entityType'],
    description: string
  ): QueuedMutation {
    const item: QueuedMutation = {
      id: `sync-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      endpoint,
      method,
      payload,
      entityType,
      description,
      createdAt: new Date().toISOString(),
      attempts: 0,
      status: 'pending'
    };

    this.queue.push(item);
    this.saveQueue();

    // Trigger immediate drain if online
    if (this.isOnline && !this.isSyncing) {
      this.processQueue();
    }

    return item;
  }

  /**
   * Drain and execute all pending mutations against the backend Cloud SQL API.
   */
  public async processQueue(): Promise<{ synced: number; failed: number }> {
    if (this.isSyncing) {
      return { synced: 0, failed: 0 };
    }

    const pending = this.queue.filter(q => q.status === 'pending' || q.status === 'failed');
    if (pending.length === 0) {
      return { synced: 0, failed: 0 };
    }

    this.isSyncing = true;
    this.notify();

    let syncedCount = 0;
    let failedCount = 0;

    for (const item of pending) {
      item.status = 'syncing';
      this.notify();

      try {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json'
        };

        // Attach Firebase token if present
        const fbToken = localStorage.getItem('madrasah_firebase_token');
        if (fbToken) {
          headers['Authorization'] = `Bearer ${fbToken}`;
        }

        const res = await fetch(item.endpoint, {
          method: item.method,
          headers,
          body: item.payload ? JSON.stringify(item.payload) : undefined
        });

        if (res.ok) {
          item.status = 'synced';
          item.attempts += 1;
          syncedCount += 1;
        } else {
          item.status = 'failed';
          item.attempts += 1;
          item.lastError = `Server responded with ${res.status}: ${res.statusText}`;
          failedCount += 1;
        }
      } catch (err: any) {
        item.status = 'failed';
        item.attempts += 1;
        item.lastError = err.message || 'Network fetch failed';
        failedCount += 1;
      }
    }

    // Retain only items that are not 'synced', cap queue size to 200
    this.queue = this.queue.filter(item => item.status !== 'synced').slice(-200);

    try {
      localStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());
    } catch {}

    this.isSyncing = false;
    this.saveQueue();

    return { synced: syncedCount, failed: failedCount };
  }

  public clearQueue(): void {
    this.queue = [];
    this.saveQueue();
  }
}

export const syncQueue = new SyncQueueService();
