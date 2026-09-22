import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import {
  getAllStudents,
  upsertStudent,
  deleteStudentById,
  getHifzRecords,
  saveHifzRecord,
  getHomeLearning,
  saveHomeLearning,
  getTarbiyah,
  saveTarbiyah,
  getEvaluations,
  saveEvaluation,
  getSettings,
  saveSettings,
  seedInitialMadrasahDataIfEmpty
} from './src/db/repository.ts';
import {
  resolveAuthorisation,
  requireAuth,
  requireAdmin,
  requireStudentAccess,
  AuthRequest
} from './src/middleware/auth.ts';

export function createExpressApp() {
  const app = express();
  app.use(express.json());

  // --- API Routes (Defined FIRST) ---

  // Health check (Public)
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Attach database authorization resolver to all API routes
  app.use('/api', resolveAuthorisation as any);

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
  app.get('/api/students', requireStudentAccess as any, async (req: AuthRequest, res) => {
    try {
      const list = await getAllStudents();
      // If user is parent or teacher, scope strictly to their allowed students only
      if (req.user!.role !== 'admin') {
        const scoped = list.filter(s => req.user!.allowedStudentIds.includes(s.id));
        return res.json(scoped);
      }
      res.json(list);
    } catch (error: any) {
      console.error('Failed to get students:', error);
      res.status(500).json({ error: error.message || 'Error fetching students' });
    }
  });

  // Student mutations (Strict Admin Only)
  app.post('/api/students', requireAdmin as any, async (req: AuthRequest, res) => {
    try {
      const saved = await upsertStudent(req.body);
      res.json(saved);
    } catch (error: any) {
      console.error('Failed to save student:', error);
      res.status(500).json({ error: error.message || 'Error saving student' });
    }
  });

  app.delete('/api/students/:id', requireAdmin as any, async (req: AuthRequest, res) => {
    try {
      await deleteStudentById(req.params.id);
      res.json({ success: true, deletedId: req.params.id });
    } catch (error: any) {
      console.error('Failed to delete student:', error);
      res.status(500).json({ error: error.message || 'Error deleting student' });
    }
  });

  // Daily Hifz records (Protected by student access boundary)
  app.get('/api/records/hifz', requireStudentAccess as any, async (req: AuthRequest, res) => {
    try {
      const studentId = req.query.studentId as string | undefined;
      const records = await getHifzRecords(studentId);
      // Non-admins must only receive records belonging to their allowed student IDs
      if (req.user!.role !== 'admin') {
        const allowed = records.filter(r => req.user!.allowedStudentIds.includes(r.studentId));
        return res.json(allowed);
      }
      res.json(records);
    } catch (error: any) {
      console.error('Failed to get hifz records:', error);
      res.status(500).json({ error: error.message || 'Error fetching hifz records' });
    }
  });

  app.post('/api/records/hifz', requireStudentAccess as any, async (req: AuthRequest, res) => {
    try {
      const record = await saveHifzRecord(req.body);
      res.json(record);
    } catch (error: any) {
      console.error('Failed to save hifz record:', error);
      res.status(500).json({ error: error.message || 'Error saving hifz record' });
    }
  });

  // Home Learning records
  app.get('/api/records/home', requireStudentAccess as any, async (req: AuthRequest, res) => {
    try {
      const studentId = req.query.studentId as string | undefined;
      const records = await getHomeLearning(studentId);
      if (req.user!.role !== 'admin') {
        const allowed = records.filter(r => req.user!.allowedStudentIds.includes(r.studentId));
        return res.json(allowed);
      }
      res.json(records);
    } catch (error: any) {
      console.error('Failed to get home learning records:', error);
      res.status(500).json({ error: error.message || 'Error fetching home learning' });
    }
  });

  app.post('/api/records/home', requireStudentAccess as any, async (req: AuthRequest, res) => {
    try {
      const record = await saveHomeLearning(req.body);
      res.json(record);
    } catch (error: any) {
      console.error('Failed to save home learning:', error);
      res.status(500).json({ error: error.message || 'Error saving home learning' });
    }
  });

  // Daily Tarbiyah records
  app.get('/api/records/tarbiyah', requireStudentAccess as any, async (req: AuthRequest, res) => {
    try {
      const studentId = req.query.studentId as string | undefined;
      const records = await getTarbiyah(studentId);
      if (req.user!.role !== 'admin') {
        const allowed = records.filter(r => req.user!.allowedStudentIds.includes(r.studentId));
        return res.json(allowed);
      }
      res.json(records);
    } catch (error: any) {
      console.error('Failed to get tarbiyah records:', error);
      res.status(500).json({ error: error.message || 'Error fetching tarbiyah records' });
    }
  });

  app.post('/api/records/tarbiyah', requireStudentAccess as any, async (req: AuthRequest, res) => {
    try {
      const record = await saveTarbiyah(req.body);
      res.json(record);
    } catch (error: any) {
      console.error('Failed to save tarbiyah:', error);
      res.status(500).json({ error: error.message || 'Error saving tarbiyah' });
    }
  });

  // Weekly Evaluations
  app.get('/api/evaluations', requireStudentAccess as any, async (req: AuthRequest, res) => {
    try {
      const studentId = req.query.studentId as string | undefined;
      const evals = await getEvaluations(studentId);
      if (req.user!.role !== 'admin') {
        const allowed = evals.filter(r => req.user!.allowedStudentIds.includes(r.studentId));
        return res.json(allowed);
      }
      res.json(evals);
    } catch (error: any) {
      console.error('Failed to get evaluations:', error);
      res.status(500).json({ error: error.message || 'Error fetching evaluations' });
    }
  });

  app.post('/api/evaluations', requireStudentAccess as any, async (req: AuthRequest, res) => {
    try {
      const saved = await saveEvaluation(req.body);
      res.json(saved);
    } catch (error: any) {
      console.error('Failed to save evaluation:', error);
      res.status(500).json({ error: error.message || 'Error saving evaluation' });
    }
  });

  // Madrasah Settings (Authentication Required for Read, Admin Required for Update)
  app.get('/api/settings/:key', requireAuth as any, async (req: AuthRequest, res) => {
    try {
      const data = await getSettings(req.params.key);
      res.json(data);
    } catch (error: any) {
      console.error('Failed to get settings:', error);
      res.status(500).json({ error: error.message || 'Error fetching settings' });
    }
  });

  app.post('/api/settings/:key', requireAdmin as any, async (req: AuthRequest, res) => {
    try {
      await saveSettings(req.params.key, req.body);
      res.json({ success: true });
    } catch (error: any) {
      console.error('Failed to save settings:', error);
      res.status(500).json({ error: error.message || 'Error saving settings' });
    }
  });

  return app;
}

async function startServer() {
  const app = createExpressApp();
  const PORT = 3000;

  // Auto-seed initial madrasah data on server boot
  setTimeout(async () => {
    try {
      await seedInitialMadrasahDataIfEmpty();
    } catch (err) {
      console.warn('Initial seed deferred:', err);
    }
  }, 1000);

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
