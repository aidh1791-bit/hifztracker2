import {
  Student,
  DailyHifzRecord,
  DailyHomeLearningRecord,
  DailyTarbiyahRecord,
  WeeklyEvaluationRecord,
  AdminSettings,
  TeacherSettings
} from '../types';
import {
  INITIAL_STUDENTS,
  INITIAL_HIFZ_RECORDS,
  INITIAL_HOME_LEARNING,
  INITIAL_TARBIYAH_RECORDS,
  INITIAL_WEEKLY_EVALUATIONS,
  DEFAULT_ADMIN_SETTINGS
} from '../data/initialData';
import { DEFAULT_TEACHER_SETTINGS } from '../context/HifzContext';
import { syncQueue, QueuedMutation } from './syncQueue';

export interface DataChangeRevision {
  id: string;
  entityType: 'student' | 'hifz_record' | 'home_learning' | 'tarbiyah' | 'evaluation' | 'settings';
  entityId: string;
  timestampUtc: string;
  action: 'create' | 'update' | 'delete';
  syncedToCloud: boolean;
}

const STORAGE_KEYS = {
  STUDENTS: 'hifz_app_students_v3',
  HIFZ_RECORDS: 'hifz_app_records_map_v3',
  HOME_LEARNING: 'hifz_app_home_learning_v3',
  TARBIYAH: 'hifz_app_tarbiyah_map_v3',
  EVALUATIONS: 'hifz_app_evaluations_v3',
  ADMIN_SETTINGS: 'hifz_app_admin_settings_v3',
  TEACHER_SETTINGS: 'hifz_app_teacher_settings_v3',
  REVISIONS: 'hifz_app_change_revisions_v3'
};

function safeGetItem<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (err) {
    console.warn(`[DataRepository] Error reading ${key} from storage:`, err);
    return fallback;
  }
}

function safeSetItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`[DataRepository] Error saving ${key} to storage:`, err);
  }
}

function recordRevision(
  entityType: DataChangeRevision['entityType'],
  entityId: string,
  action: DataChangeRevision['action']
): void {
  const revisions = safeGetItem<DataChangeRevision[]>(STORAGE_KEYS.REVISIONS, []);
  const newRev: DataChangeRevision = {
    id: `rev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    entityType,
    entityId,
    timestampUtc: new Date().toISOString(),
    action,
    syncedToCloud: true
  };
  safeSetItem(STORAGE_KEYS.REVISIONS, [newRev, ...revisions.slice(0, 499)]);
}

/**
 * Unified Data Repository
 * Hybrid Cloud SQL Backend + Offline-Resilient Local Cache.
 */
export const dataRepository = {
  // Cloud SQL Status check
  async checkCloudSqlStatus(): Promise<{ connected: boolean; database?: string; studentCount?: number; error?: string }> {
    try {
      const res = await fetch('/api/database/status');
      if (res.ok) {
        return await res.json();
      }
      return { connected: false, error: `HTTP ${res.status}` };
    } catch (err: any) {
      return { connected: false, error: err.message || 'Offline' };
    }
  },

  // --- Students ---
  async getStudents(): Promise<Student[]> {
    try {
      const res = await fetch('/api/students');
      if (res.ok) {
        const cloudStudents = await res.json();
        if (Array.isArray(cloudStudents) && cloudStudents.length > 0) {
          safeSetItem(STORAGE_KEYS.STUDENTS, cloudStudents);
          return cloudStudents;
        }
      }
    } catch {
      // Fallback to local storage
    }
    return safeGetItem<Student[]>(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
  },

  async saveStudents(students: Student[]): Promise<void> {
    safeSetItem(STORAGE_KEYS.STUDENTS, students);
    recordRevision('student', 'bulk', 'update');
    try {
      for (const std of students) {
        await fetch('/api/students', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(std)
        });
      }
    } catch (err) {
      console.warn('[DataRepository] Deferred cloud sync for students:', err);
    }
  },

  async saveStudent(student: Student): Promise<void> {
    const current = await this.getStudents();
    const idx = current.findIndex(s => s.id === student.id);
    let updated: Student[];
    if (idx >= 0) {
      updated = [...current];
      updated[idx] = student;
    } else {
      updated = [...current, student];
    }
    safeSetItem(STORAGE_KEYS.STUDENTS, updated);
    recordRevision('student', student.id, idx >= 0 ? 'update' : 'create');

    try {
      if (syncQueue.isNetworkOnline()) {
        const res = await fetch('/api/students', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(student)
        });
        if (!res.ok) throw new Error(`Status ${res.status}`);
      } else {
        throw new Error('Device is offline');
      }
    } catch (err: any) {
      syncQueue.enqueue('/api/students', 'POST', student, 'student', `Save student ${student.name}`);
    }
  },

  async deleteStudent(studentId: string): Promise<void> {
    const current = await this.getStudents();
    const filtered = current.filter(s => s.id !== studentId);
    safeSetItem(STORAGE_KEYS.STUDENTS, filtered);
    recordRevision('student', studentId, 'delete');

    try {
      if (syncQueue.isNetworkOnline()) {
        const res = await fetch(`/api/students/${studentId}`, { method: 'DELETE' });
        if (!res.ok) throw new Error(`Status ${res.status}`);
      } else {
        throw new Error('Device is offline');
      }
    } catch (err: any) {
      syncQueue.enqueue(`/api/students/${studentId}`, 'DELETE', null, 'student', `Delete student ID ${studentId}`);
    }
  },

  // --- Daily Hifz Records ---
  async getAllHifzRecords(): Promise<Record<string, DailyHifzRecord[]>> {
    try {
      const res = await fetch('/api/records/hifz');
      if (res.ok) {
        const records = await res.json();
        if (Array.isArray(records) && records.length > 0) {
          // Group by studentId
          const map: Record<string, DailyHifzRecord[]> = {};
          for (const r of records) {
            if (!map[r.studentId]) map[r.studentId] = [];
            map[r.studentId].push({
              id: String(r.id),
              date: r.date,
              day: r.day as any,
              attendance: r.attendance as any,
              sabaq: { amount: r.sabaqAmount || '', mistakes: r.sabaqMistakes || 0, taskPassed: r.sabaqPassed },
              sabaqPara: { amount: r.sabaqParaAmount || '', mistakes: r.sabaqParaMistakes || 0, taskPassed: r.sabaqParaPassed },
              dawr1: { amount: r.dawr1Amount || '', mistakes: r.dawr1Mistakes || 0, taskPassed: r.dawr1Passed },
              dawr2: { amount: r.dawr2Amount || '', mistakes: r.dawr2Mistakes || 0, taskPassed: r.dawr2Passed },
              comments: r.comments || '',
              parentSigned: false,
              teacherSigned: true,
              timestamp: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString()
            });
          }
          safeSetItem(STORAGE_KEYS.HIFZ_RECORDS, map);
          return map;
        }
      }
    } catch {
      // Offline fallback
    }
    return safeGetItem<Record<string, DailyHifzRecord[]>>(STORAGE_KEYS.HIFZ_RECORDS, INITIAL_HIFZ_RECORDS);
  },

  async saveAllHifzRecords(recordsMap: Record<string, DailyHifzRecord[]>): Promise<void> {
    safeSetItem(STORAGE_KEYS.HIFZ_RECORDS, recordsMap);
    recordRevision('hifz_record', 'bulk', 'update');
  },

  async syncHifzRecord(studentId: string, record: DailyHifzRecord): Promise<void> {
    const payload = {
      studentId,
      date: record.date,
      day: record.day,
      attendance: record.attendance,
      sabaqAmount: record.sabaq?.amount || '',
      sabaqMistakes: record.sabaq?.mistakes || 0,
      sabaqPassed: record.sabaq?.taskPassed ?? null,
      sabaqParaAmount: record.sabaqPara?.amount || '',
      sabaqParaMistakes: record.sabaqPara?.mistakes || 0,
      sabaqParaPassed: record.sabaqPara?.taskPassed ?? null,
      dawr1Amount: record.dawr1?.amount || '',
      dawr1Mistakes: record.dawr1?.mistakes || 0,
      dawr1Passed: record.dawr1?.taskPassed ?? null,
      dawr2Amount: record.dawr2?.amount || '',
      dawr2Mistakes: record.dawr2?.mistakes || 0,
      dawr2Passed: record.dawr2?.taskPassed ?? null,
      comments: record.comments || ''
    };

    recordRevision('hifz_record', record.id, 'update');

    try {
      if (syncQueue.isNetworkOnline()) {
        const res = await fetch('/api/records/hifz', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
      } else {
        throw new Error('Offline');
      }
    } catch {
      syncQueue.enqueue(
        '/api/records/hifz',
        'POST',
        payload,
        'hifz_record',
        `Recitation for student ${studentId} on ${record.day}`
      );
    }
  },

  // --- Home Learning Records ---
  async getAllHomeLearningRecords(): Promise<Record<string, DailyHomeLearningRecord[]>> {
    return safeGetItem<Record<string, DailyHomeLearningRecord[]>>(STORAGE_KEYS.HOME_LEARNING, INITIAL_HOME_LEARNING);
  },

  async saveAllHomeLearningRecords(homeMap: Record<string, DailyHomeLearningRecord[]>): Promise<void> {
    safeSetItem(STORAGE_KEYS.HOME_LEARNING, homeMap);
    recordRevision('home_learning', 'bulk', 'update');
  },

  async syncHomeLearningRecord(studentId: string, record: DailyHomeLearningRecord): Promise<void> {
    const payload = {
      studentId,
      date: record.date,
      day: record.day,
      sabaqMins: record.sabaqMins || 0,
      sabaqParaMins: record.sabaqParaMins || 0,
      dawr1Mins: record.dawr1Mins || 0,
      dawr2Mins: record.dawr2Mins || 0,
      parentSigned: record.parentSigned || false
    };

    try {
      if (syncQueue.isNetworkOnline()) {
        const res = await fetch('/api/records/home', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
      } else {
        throw new Error('Offline');
      }
    } catch {
      syncQueue.enqueue(
        '/api/records/home',
        'POST',
        payload,
        'home_learning',
        `Home learning for ${studentId} on ${record.day}`
      );
    }
  },

  // --- Tarbiyah Records ---
  async getAllTarbiyahRecords(): Promise<Record<string, DailyTarbiyahRecord[]>> {
    return safeGetItem<Record<string, DailyTarbiyahRecord[]>>(STORAGE_KEYS.TARBIYAH, INITIAL_TARBIYAH_RECORDS);
  },

  async saveAllTarbiyahRecords(tarbiyahMap: Record<string, DailyTarbiyahRecord[]>): Promise<void> {
    safeSetItem(STORAGE_KEYS.TARBIYAH, tarbiyahMap);
    recordRevision('tarbiyah', 'bulk', 'update');
  },

  async syncTarbiyahRecord(studentId: string, record: DailyTarbiyahRecord): Promise<void> {
    const payload = {
      studentId,
      date: record.date,
      day: record.day,
      prayers: record.prayers,
      dailySadaqah: record.dailySadaqah,
      eesaalThawaab: record.eesaalThawaab,
      dailyDuasDhikr: record.dailyDuasDhikr,
      dailyQuranWird: record.dailyQuranWird,
      collectiveTaleemMins: record.collectiveTaleemMins || 0,
      collectiveDuaMins: record.collectiveDuaMins || 0
    };

    try {
      if (syncQueue.isNetworkOnline()) {
        const res = await fetch('/api/records/tarbiyah', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
      } else {
        throw new Error('Offline');
      }
    } catch {
      syncQueue.enqueue(
        '/api/records/tarbiyah',
        'POST',
        payload,
        'tarbiyah',
        `Tarbiyah for ${studentId} on ${record.day}`
      );
    }
  },

  // --- Weekly Evaluations ---
  async getAllEvaluations(): Promise<Record<string, WeeklyEvaluationRecord>> {
    return safeGetItem<Record<string, WeeklyEvaluationRecord>>(STORAGE_KEYS.EVALUATIONS, INITIAL_WEEKLY_EVALUATIONS);
  },

  async saveAllEvaluations(evalMap: Record<string, WeeklyEvaluationRecord>): Promise<void> {
    safeSetItem(STORAGE_KEYS.EVALUATIONS, evalMap);
    recordRevision('evaluation', 'bulk', 'update');
  },

  async syncEvaluation(studentId: string, evaluation: WeeklyEvaluationRecord): Promise<void> {
    const payload = {
      studentId,
      weekStartDate: evaluation.weekCommencing,
      weekEndDate: evaluation.weekCommencing,
      hifzGrade: evaluation.teacherOverallFeedback || 'Satisfactory',
      tajweedGrade: evaluation.surahMemorisation?.passed ? 'Passed' : 'Pending',
      tarbiyahGrade: evaluation.islamicStudies?.passed ? 'Passed' : 'Pending',
      teacherComments: evaluation.teacherOverallFeedback || '',
      parentComments: evaluation.parentOverallFeedback || '',
      teacherSigned: evaluation.teacherSigned,
      parentSigned: evaluation.parentSigned
    };

    try {
      if (syncQueue.isNetworkOnline()) {
        const res = await fetch('/api/evaluations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
      } else {
        throw new Error('Offline');
      }
    } catch {
      syncQueue.enqueue(
        '/api/evaluations',
        'POST',
        payload,
        'evaluation',
        `Weekly Evaluation for ${studentId}`
      );
    }
  },

  // --- Settings ---
  async getAdminSettings(): Promise<AdminSettings> {
    try {
      const res = await fetch('/api/settings/admin_settings');
      if (res.ok) {
        const cloudSettings = await res.json();
        if (cloudSettings) {
          safeSetItem(STORAGE_KEYS.ADMIN_SETTINGS, cloudSettings);
          return cloudSettings;
        }
      }
    } catch {
      // Fallback
    }
    return safeGetItem<AdminSettings>(STORAGE_KEYS.ADMIN_SETTINGS, DEFAULT_ADMIN_SETTINGS);
  },

  async saveAdminSettings(settings: AdminSettings): Promise<void> {
    safeSetItem(STORAGE_KEYS.ADMIN_SETTINGS, settings);
    recordRevision('settings', 'admin', 'update');
    try {
      if (syncQueue.isNetworkOnline()) {
        const res = await fetch('/api/settings/admin_settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(settings)
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
      } else {
        throw new Error('Offline');
      }
    } catch {
      syncQueue.enqueue(
        '/api/settings/admin_settings',
        'POST',
        settings,
        'settings',
        'Madrasah admin settings'
      );
    }
  },

  async getTeacherSettings(): Promise<TeacherSettings> {
    try {
      const res = await fetch('/api/settings/teacher_settings');
      if (res.ok) {
        const cloudSettings = await res.json();
        if (cloudSettings) {
          safeSetItem(STORAGE_KEYS.TEACHER_SETTINGS, cloudSettings);
          return cloudSettings;
        }
      }
    } catch {
      // Fallback
    }
    return safeGetItem<TeacherSettings>(STORAGE_KEYS.TEACHER_SETTINGS, DEFAULT_TEACHER_SETTINGS);
  },

  async saveTeacherSettings(settings: TeacherSettings): Promise<void> {
    safeSetItem(STORAGE_KEYS.TEACHER_SETTINGS, settings);
    recordRevision('settings', 'teacher', 'update');
    try {
      if (syncQueue.isNetworkOnline()) {
        const res = await fetch('/api/settings/teacher_settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(settings)
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
      } else {
        throw new Error('Offline');
      }
    } catch {
      syncQueue.enqueue(
        '/api/settings/teacher_settings',
        'POST',
        settings,
        'settings',
        'Ustadh teacher settings'
      );
    }
  },

  // --- Offline Queue Helpers ---
  getPendingSyncCount(): number {
    return syncQueue.getPendingCount();
  },

  getOfflineQueue(): QueuedMutation[] {
    return syncQueue.getQueue();
  },

  async triggerManualSync(): Promise<{ synced: number; failed: number }> {
    return await syncQueue.processQueue();
  },

  isOnline(): boolean {
    return syncQueue.isNetworkOnline();
  },

  // --- Clean & Reset ---
  async clearAllDemoData(): Promise<void> {
    safeSetItem(STORAGE_KEYS.STUDENTS, []);
    safeSetItem(STORAGE_KEYS.HIFZ_RECORDS, {});
    safeSetItem(STORAGE_KEYS.HOME_LEARNING, {});
    safeSetItem(STORAGE_KEYS.TARBIYAH, {});
    safeSetItem(STORAGE_KEYS.EVALUATIONS, {});
    recordRevision('student', 'all', 'delete');
  },

  async resetToDefaultTemplate(): Promise<void> {
    safeSetItem(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
    safeSetItem(STORAGE_KEYS.HIFZ_RECORDS, INITIAL_HIFZ_RECORDS);
    safeSetItem(STORAGE_KEYS.HOME_LEARNING, INITIAL_HOME_LEARNING);
    safeSetItem(STORAGE_KEYS.TARBIYAH, INITIAL_TARBIYAH_RECORDS);
    safeSetItem(STORAGE_KEYS.EVALUATIONS, INITIAL_WEEKLY_EVALUATIONS);
    safeSetItem(STORAGE_KEYS.ADMIN_SETTINGS, DEFAULT_ADMIN_SETTINGS);
    safeSetItem(STORAGE_KEYS.TEACHER_SETTINGS, DEFAULT_TEACHER_SETTINGS);
  }
};
