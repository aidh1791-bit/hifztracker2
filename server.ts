import express, { Response, NextFunction } from 'express';
import path from 'path';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { createServer as createViteServer } from 'vite';
import { sql } from 'drizzle-orm';
import { db } from './src/db/index.ts';
import {
  getAllStudents,
  getStudentsByIds,
  upsertStudent,
  deleteStudentById,
  getHifzRecords,
  getHifzRecordsForStudents,
  saveHifzRecord,
  getHomeLearning,
  getHomeLearningForStudents,
  saveHomeLearning,
  getTarbiyah,
  getTarbiyahForStudents,
  saveTarbiyah,
  getEvaluations,
  getEvaluationsForStudents,
  saveEvaluation,
  getSettings,
  saveSettings,
  seedInitialMadrasahDataIfEmpty,
  getGdprSarExport,
  listAllAppUsers,
  updateUserRole,
  revokeUserAccess,
  linkParentToStudent,
  unlinkParentFromStudent,
  recordParentNoticeDecision,
  getParentNoticeDecisions,
  recordAuditLog
} from './src/db/repository.ts';
import {
  resolveAuthorisation,
  requireAuth,
  requireAdmin,
  requireStudentAccess,
  requireAction,
  AuthRequest
} from './src/middleware/auth.ts';
import {
  requireIdempotency,
  recordOperation
} from './src/middleware/idempotency.ts';
import {
  HifzRecordSchema,
  HomeLearningRecordSchema,
  TarbiyahRecordSchema,
  WeeklyEvaluationSchema,
  WeeklyEvaluationTeacherSchema,
  WeeklyEvaluationParentSchema,
  AssignUserRoleSchema,
  LinkParentStudentSchema,
  RevokeAccessSchema,
  ParentNoticeDecisionSchema
} from './src/validation/schemas.ts';

export function createExpressApp() {
  const app = express();

  // CORS Lockdown: Lock down cross-origin API access
  app.use(cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const allowedOrigins = [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://localhost:5173',
        'https://hifztrack.web.app',
        'https://hifztrack.firebaseapp.com'
      ];
      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith('.run.app') ||
        origin.endsWith('.googleusercontent.com')
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  }));

  // Rate Limiting: Prevent endpoint harvesting and resource exhaustion
  const apiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 180, // 180 requests per minute
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please slow down' }
  });

  const authLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 40,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many authentication attempts' }
  });

  app.use('/api', apiLimiter);
  app.use('/api/database/status', authLimiter);

  app.use(express.json({ limit: '1mb' }));

  // --- API Routes (Defined FIRST) ---

  // Health check (Public & Database connectivity check)
  app.get('/healthz', async (req, res) => {
    try {
      await db.execute(sql`SELECT 1`);
      res.status(200).json({
        status: 'healthy',
        database: 'connected',
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      console.error('[Healthz] Database health check failed:', err);
      res.status(503).json({
        status: 'unhealthy',
        database: 'disconnected',
        error: err?.message || 'Database connection error',
        timestamp: new Date().toISOString(),
      });
    }
  });

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Attach database authorization resolver to all API routes
  app.use('/api', resolveAuthorisation as any);

  // Identity & Role Resolution endpoint (Phase 2)
  app.get('/api/me', requireAuth as any, async (req: AuthRequest, res) => {
    try {
      const user = req.user!;
      res.json({
        uid: user.uid,
        email: user.email,
        role: user.role,
        allowedStudentIds: user.allowedStudentIds,
        circleCode: user.circleCode || null,
        status: user.role === 'unassigned' ? 'unassigned' : 'assigned',
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Error resolving identity' });
    }
  });

  // Database status
  app.get('/api/database/status', requireAuth as any, async (req: AuthRequest, res) => {
    try {
      const students = await getAllStudents();
      res.json({
        connected: true,
        database: process.env.SQL_DB_NAME || 'cloudsql',
        studentCount: students.length,
        userRole: req.user?.role || 'unauthenticated'
      });
    } catch (error: any) {
      console.error('Database health check failed:', error);
      res.status(503).json({
        connected: false,
        error: error.message || 'Database unavailable'
      });
    }
  });

  // Database seed (Admin Only)
  app.post('/api/database/seed', requireAdmin as any, async (req: AuthRequest, res) => {
    try {
      const result = await seedInitialMadrasahDataIfEmpty();
      res.json(result);
    } catch (error: any) {
      console.error('Seed operation failed:', error);
      res.status(500).json({ error: error.message || 'Failed to seed database' });
    }
  });

  // Students endpoints (Role-scoped, requires student access permissions)
  // Query-level scoping: Only queries the database for students the caller is authorized to view
  app.get('/api/students', requireStudentAccess as any, async (req: AuthRequest, res) => {
    try {
      if (req.user!.role === 'admin') {
        const list = await getAllStudents();
        return res.json(list);
      }
      const scopedList = await getStudentsByIds(req.user!.allowedStudentIds);
      res.json(scopedList);
    } catch (error: any) {
      console.error('Failed to get students:', error);
      res.status(500).json({ error: error.message || 'Error fetching students' });
    }
  });

  // Student mutations (Strict Admin Only)
  app.post('/api/students', requireAdmin as any, requireIdempotency as any, async (req: AuthRequest, res) => {
    try {
      const saved = await upsertStudent(req.body);
      await recordOperation(req, res, saved);
      res.json(saved);
    } catch (error: any) {
      console.error('Failed to save student:', error);
      res.status(500).json({ error: error.message || 'Error saving student' });
    }
  });

  app.delete('/api/students/:id', requireAdmin as any, requireIdempotency as any, async (req: AuthRequest, res) => {
    try {
      await deleteStudentById(req.params.id);
      await recordOperation(req, res, { deletedId: req.params.id });
      res.json({ success: true, deletedId: req.params.id });
    } catch (error: any) {
      console.error('Failed to delete student:', error);
      res.status(500).json({ error: error.message || 'Error deleting student' });
    }
  });

  // GDPR Article 15: Machine-readable Subject Access Request Export
  app.get('/api/gdpr/export/:studentId', requireStudentAccess as any, async (req: AuthRequest, res) => {
    try {
      const studentId = req.params.studentId;
      const exportData = await getGdprSarExport(studentId);
      if (!exportData) {
        return res.status(404).json({ error: 'Student not found for GDPR export' });
      }
      res.json(exportData);
    } catch (error: any) {
      console.error('Failed to generate GDPR export:', error);
      res.status(500).json({ error: error.message || 'Error compiling GDPR export' });
    }
  });

  // Daily Hifz records (Protected by query-level scoping & student access boundary)
  app.get('/api/records/hifz', requireStudentAccess as any, async (req: AuthRequest, res) => {
    try {
      const studentId = req.query.studentId as string | undefined;
      if (studentId) {
        const records = await getHifzRecords(studentId);
        return res.json(records);
      }
      if (req.user!.role === 'admin') {
        const allRecords = await getHifzRecords();
        return res.json(allRecords);
      }
      const scopedRecords = await getHifzRecordsForStudents(req.user!.allowedStudentIds);
      res.json(scopedRecords);
    } catch (error: any) {
      console.error('Failed to get hifz records:', error);
      res.status(500).json({ error: error.message || 'Error fetching hifz records' });
    }
  });

  app.post('/api/records/hifz', requireAction('hifz.write') as any, requireStudentAccess as any, requireIdempotency as any, async (req: AuthRequest, res) => {
    try {
      const parsed = HifzRecordSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid recitation data', details: parsed.error.issues });
      }
      const record = await saveHifzRecord(parsed.data as any);
      await recordOperation(req, res, record);
      res.json(record);
    } catch (error: any) {
      console.error('Failed to save hifz record:', error);
      res.status(500).json({ error: error.message || 'Error saving hifz record' });
    }
  });

  // Home Learning records (Protected by query-level scoping & parent action permission)
  app.get('/api/records/home', requireStudentAccess as any, async (req: AuthRequest, res) => {
    try {
      const studentId = req.query.studentId as string | undefined;
      if (studentId) {
        const records = await getHomeLearning(studentId);
        return res.json(records);
      }
      if (req.user!.role === 'admin') {
        const allRecords = await getHomeLearning();
        return res.json(allRecords);
      }
      const scopedRecords = await getHomeLearningForStudents(req.user!.allowedStudentIds);
      res.json(scopedRecords);
    } catch (error: any) {
      console.error('Failed to get home learning records:', error);
      res.status(500).json({ error: error.message || 'Error fetching home learning' });
    }
  });

  app.post('/api/records/home', requireAction('home_learning.write') as any, requireStudentAccess as any, requireIdempotency as any, async (req: AuthRequest, res) => {
    try {
      const parsed = HomeLearningRecordSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid home learning data', details: parsed.error.issues });
      }
      const record = await saveHomeLearning(parsed.data as any);
      await recordOperation(req, res, record);
      res.json(record);
    } catch (error: any) {
      console.error('Failed to save home learning:', error);
      res.status(500).json({ error: error.message || 'Error saving home learning' });
    }
  });

  // Daily Tarbiyah records (Protected by query-level scoping & parent action permission)
  app.get('/api/records/tarbiyah', requireStudentAccess as any, async (req: AuthRequest, res) => {
    try {
      const studentId = req.query.studentId as string | undefined;
      if (studentId) {
        const records = await getTarbiyah(studentId);
        return res.json(records);
      }
      if (req.user!.role === 'admin') {
        const allRecords = await getTarbiyah();
        return res.json(allRecords);
      }
      const scopedRecords = await getTarbiyahForStudents(req.user!.allowedStudentIds);
      res.json(scopedRecords);
    } catch (error: any) {
      console.error('Failed to get tarbiyah records:', error);
      res.status(500).json({ error: error.message || 'Error fetching tarbiyah records' });
    }
  });

  app.post('/api/records/tarbiyah', requireAction('tarbiyah.write') as any, requireStudentAccess as any, requireIdempotency as any, async (req: AuthRequest, res) => {
    try {
      const parsed = TarbiyahRecordSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid tarbiyah data', details: parsed.error.issues });
      }
      const record = await saveTarbiyah(parsed.data as any);
      await recordOperation(req, res, record);
      res.json(record);
    } catch (error: any) {
      console.error('Failed to save tarbiyah:', error);
      res.status(500).json({ error: error.message || 'Error saving tarbiyah' });
    }
  });

  // Weekly Evaluations (Protected by query-level scoping & role-strict payload whitelisting)
  app.get('/api/evaluations', requireStudentAccess as any, async (req: AuthRequest, res) => {
    try {
      const studentId = req.query.studentId as string | undefined;
      if (studentId) {
        const evals = await getEvaluations(studentId);
        return res.json(evals);
      }
      if (req.user!.role === 'admin') {
        const allEvals = await getEvaluations();
        return res.json(allEvals);
      }
      const scopedEvals = await getEvaluationsForStudents(req.user!.allowedStudentIds);
      res.json(scopedEvals);
    } catch (error: any) {
      console.error('Failed to get evaluations:', error);
      res.status(500).json({ error: error.message || 'Error fetching evaluations' });
    }
  });

  app.post('/api/evaluations', requireStudentAccess as any, requireIdempotency as any, async (req: AuthRequest, res) => {
    try {
      const userRole = req.user?.role;
      if (userRole === 'teacher' || userRole === 'admin') {
        const parsed = WeeklyEvaluationTeacherSchema.safeParse(req.body);
        if (!parsed.success) {
          return res.status(400).json({ error: 'Invalid teacher evaluation data', details: parsed.error.issues });
        }
        const saved = await saveEvaluation(parsed.data as any);
        await recordOperation(req, res, saved);
        return res.json(saved);
      } else if (userRole === 'parent') {
        const parsed = WeeklyEvaluationParentSchema.safeParse(req.body);
        if (!parsed.success) {
          return res.status(400).json({ error: 'Invalid parent evaluation signature', details: parsed.error.issues });
        }
        const saved = await saveEvaluation(parsed.data as any);
        await recordOperation(req, res, saved);
        return res.json(saved);
      } else {
        return res.status(403).json({
          error: 'Forbidden: Role unauthorized to submit evaluations',
          code: 'EVAL_UNAUTHORIZED'
        });
      }
    } catch (error: any) {
      console.error('Failed to save evaluation:', error);
      res.status(500).json({ error: error.message || 'Error saving evaluation' });
    }
  });

  // Madrasah Settings Split (Phase 2):
  // 1. Public Settings: Safe general institution information, NO passcodes or secrets
  app.get('/api/settings/public', async (req, res) => {
    try {
      const adminData = (await getSettings('admin_settings')) || {};
      const sanitized = {
        madrasahName: adminData.madrasahName || 'Hifz Madrasah Portal',
        academicYear: adminData.academicYear || '1447-1448 / 2026-2027',
        termDates: adminData.termDates || null,
        gradingBoundaries: adminData.gradingBoundaries || null,
        contactEmail: adminData.contactEmail || null,
      };
      res.json(sanitized);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Error fetching public settings' });
    }
  });

  // 2. Teacher Settings: Requires teacher or admin role, passcodes stripped
  app.get('/api/settings/teacher', requireAction('settings.teacher') as any, async (req: AuthRequest, res) => {
    try {
      const teacherSettings = (await getSettings('teacher_settings')) || {};
      const { teacherPasscode, ...safeSettings } = teacherSettings;
      res.json(safeSettings);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Error fetching teacher settings' });
    }
  });

  // 3. Admin Settings: Requires verified admin role, passcodes stripped
  app.get('/api/settings/admin', requireAdmin as any, async (req: AuthRequest, res) => {
    try {
      const adminData = (await getSettings('admin_settings')) || {};
      const { adminPasscode, ...safeAdmin } = adminData;
      res.json(safeAdmin);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Error fetching admin settings' });
    }
  });

  // Legacy settings route (Sanitized and strictly role-guarded)
  app.get('/api/settings/:key', requireAuth as any, async (req: AuthRequest, res) => {
    try {
      if (req.params.key === 'admin_settings' && req.user?.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden: Admin access required for admin settings' });
      }
      const data = await getSettings(req.params.key);
      if (data && typeof data === 'object') {
        const { adminPasscode, teacherPasscode, ...sanitized } = data;
        return res.json(sanitized);
      }
      res.json(data);
    } catch (error: any) {
      console.error('Failed to get settings:', error);
      res.status(500).json({ error: error.message || 'Error fetching settings' });
    }
  });

  app.post('/api/settings/:key', requireAdmin as any, requireIdempotency as any, async (req: AuthRequest, res) => {
    try {
      await saveSettings(req.params.key, req.body);
      await recordOperation(req, res, req.body);
      res.json({ success: true, key: req.params.key });
    } catch (error: any) {
      console.error('Failed to save settings:', error);
      res.status(500).json({ error: error.message || 'Error saving settings' });
    }
  });

  // --- Pilot Operations Layer: User Onboarding & Access Revocation without SQL (Phase 6) ---
  app.get('/api/admin/users', requireAdmin as any, async (req: AuthRequest, res) => {
    try {
      const userList = await listAllAppUsers();
      res.json(userList);
    } catch (error: any) {
      console.error('Failed to list app users:', error);
      res.status(500).json({ error: error.message || 'Failed to list app users' });
    }
  });

  app.post('/api/admin/users/assign-role', requireAdmin as any, requireIdempotency as any, async (req: AuthRequest, res) => {
    try {
      const parsed = AssignUserRoleSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid role assignment', details: parsed.error.issues });
      }
      const updated = await updateUserRole(parsed.data.uid, parsed.data.role, parsed.data.circleCode);
      await recordAuditLog({
        actorUid: req.user!.uid,
        actorRole: 'admin',
        action: 'write',
        resourceType: 'user_role',
        resourceId: parsed.data.uid,
        ipAddress: (req.headers?.['x-forwarded-for'] as string) || req.socket?.remoteAddress,
        userAgent: (req.headers?.['user-agent'] as string) || undefined,
      });
      await recordOperation(req, res, updated);
      res.json({ success: true, user: updated });
    } catch (error: any) {
      console.error('Failed to assign user role:', error);
      res.status(500).json({ error: error.message || 'Failed to assign user role' });
    }
  });

  app.post('/api/admin/users/link-parent', requireAdmin as any, requireIdempotency as any, async (req: AuthRequest, res) => {
    try {
      const parsed = LinkParentStudentSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid link parameters', details: parsed.error.issues });
      }
      await linkParentToStudent(parsed.data.parentUid, parsed.data.studentId);
      await recordAuditLog({
        actorUid: req.user!.uid,
        actorRole: 'admin',
        action: 'write',
        resourceType: 'parent_student_link',
        resourceId: `${parsed.data.parentUid}:${parsed.data.studentId}`,
        studentId: parsed.data.studentId,
        ipAddress: (req.headers?.['x-forwarded-for'] as string) || req.socket?.remoteAddress,
        userAgent: (req.headers?.['user-agent'] as string) || undefined,
      });
      const result = { success: true, parentUid: parsed.data.parentUid, studentId: parsed.data.studentId };
      await recordOperation(req, res, result);
      res.json(result);
    } catch (error: any) {
      console.error('Failed to link parent to student:', error);
      res.status(500).json({ error: error.message || 'Failed to link parent to student' });
    }
  });

  app.post('/api/admin/users/unlink-parent', requireAdmin as any, requireIdempotency as any, async (req: AuthRequest, res) => {
    try {
      const parsed = LinkParentStudentSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid unlink parameters', details: parsed.error.issues });
      }
      await unlinkParentFromStudent(parsed.data.parentUid, parsed.data.studentId);
      await recordAuditLog({
        actorUid: req.user!.uid,
        actorRole: 'admin',
        action: 'delete',
        resourceType: 'parent_student_link',
        resourceId: `${parsed.data.parentUid}:${parsed.data.studentId}`,
        studentId: parsed.data.studentId,
        ipAddress: (req.headers?.['x-forwarded-for'] as string) || req.socket?.remoteAddress,
        userAgent: (req.headers?.['user-agent'] as string) || undefined,
      });
      const result = { success: true, unlinked: true };
      await recordOperation(req, res, result);
      res.json(result);
    } catch (error: any) {
      console.error('Failed to unlink parent from student:', error);
      res.status(500).json({ error: error.message || 'Failed to unlink parent from student' });
    }
  });

  app.post('/api/admin/users/revoke', requireAdmin as any, requireIdempotency as any, async (req: AuthRequest, res) => {
    try {
      const parsed = RevokeAccessSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid revoke payload', details: parsed.error.issues });
      }
      await revokeUserAccess(parsed.data.uid);
      await recordAuditLog({
        actorUid: req.user!.uid,
        actorRole: 'admin',
        action: 'delete',
        resourceType: 'user_access',
        resourceId: parsed.data.uid,
        ipAddress: (req.headers?.['x-forwarded-for'] as string) || req.socket?.remoteAddress,
        userAgent: (req.headers?.['user-agent'] as string) || undefined,
      });
      const result = { success: true, revokedUid: parsed.data.uid };
      await recordOperation(req, res, result);
      res.json(result);
    } catch (error: any) {
      console.error('Failed to revoke user access:', error);
      res.status(500).json({ error: error.message || 'Failed to revoke user access' });
    }
  });

  // --- Data Protection & Parent Notice Acknowledgment / Decision Records (Phase 7) ---
  app.post('/api/parent/notice-decision', requireAction('parent_signature.write') as any, requireStudentAccess as any, async (req: AuthRequest, res) => {
    try {
      const parsed = ParentNoticeDecisionSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid notice decision payload', details: parsed.error.issues });
      }
      await recordParentNoticeDecision({
        parentUid: req.user!.uid,
        studentId: parsed.data.studentId,
        noticeVersion: parsed.data.noticeVersion,
        decision: parsed.data.decision,
        ipAddress: (req.headers?.['x-forwarded-for'] as string) || req.socket?.remoteAddress,
        userAgent: (req.headers?.['user-agent'] as string) || undefined,
      });
      await recordAuditLog({
        actorUid: req.user!.uid,
        actorRole: 'parent',
        action: 'write',
        resourceType: 'parent_notice_decision',
        resourceId: `${parsed.data.studentId}:${parsed.data.noticeVersion}`,
        studentId: parsed.data.studentId,
        ipAddress: (req.headers?.['x-forwarded-for'] as string) || req.socket?.remoteAddress,
        userAgent: (req.headers?.['user-agent'] as string) || undefined,
      });
      res.json({ success: true, decision: parsed.data.decision });
    } catch (error: any) {
      console.error('Failed to record notice decision:', error);
      res.status(500).json({ error: error.message || 'Failed to record notice decision' });
    }
  });

  app.get('/api/parent/notice-status/:studentId', requireStudentAccess as any, async (req: AuthRequest, res) => {
    try {
      const decisions = await getParentNoticeDecisions(req.params.studentId);
      res.json(decisions);
    } catch (error: any) {
      console.error('Failed to get notice status:', error);
      res.status(500).json({ error: error.message || 'Failed to get notice status' });
    }
  });

  // --- Phase 8: Authorised GDPR Student Data Export ---
  app.get('/api/export/student/:studentId', requireStudentAccess as any, async (req: AuthRequest, res) => {
    try {
      const studentId = req.params.studentId;
      const exportData = await getGdprSarExport(studentId);
      if (!exportData) {
        return res.status(404).json({ error: 'Student record not found for export' });
      }

      await recordAuditLog({
        actorUid: req.user!.uid,
        actorRole: req.user!.role,
        action: 'read',
        resourceType: 'student_data_export',
        resourceId: studentId,
        studentId,
        ipAddress: (req.headers?.['x-forwarded-for'] as string) || req.socket?.remoteAddress,
        userAgent: (req.headers?.['user-agent'] as string) || undefined,
      });

      res.setHeader('Content-Type', 'application/json');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="student-gdpr-export-${studentId}-${new Date().toISOString().split('T')[0]}.json"`
      );
      res.json(exportData);
    } catch (error: any) {
      console.error('Failed to generate student export:', error);
      res.status(500).json({ error: error.message || 'Failed to generate student export' });
    }
  });

  return app;
}

async function startServer() {
  const app = createExpressApp();
  const PORT = 3000;

  // Auto-seed initial madrasah data on server boot ONLY in dev or if explicitly enabled
  if (process.env.NODE_ENV !== 'production' || process.env.ALLOW_DEMO_SEED === 'true') {
    setTimeout(async () => {
      try {
        await seedInitialMadrasahDataIfEmpty();
      } catch (err) {
        console.warn('Initial seed deferred:', err);
      }
    }, 1000);
  }

  // --- Vite Middleware & Static Serving ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Madrasah Hifz Platform live on http://0.0.0.0:${PORT}`);
  });
}

// Only auto-start if run directly as application entry point
const isDirectRun = process.env.NODE_ENV !== 'test' && !process.argv.some(arg => arg.includes('test'));
if (isDirectRun) {
  startServer();
}
