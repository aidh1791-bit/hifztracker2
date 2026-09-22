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
  seedInitialMadrasahDataIfEmpty,
  getOrCreateUser
} from './src/db/repository.ts';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- API Routes (Defined FIRST) ---

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Database status and auto-seed
  app.get('/api/database/status', async (req, res) => {
    try {
      const students = await getAllStudents();
      res.json({
        connected: true,
        database: process.env.SQL_DB_NAME || 'cloudsql',
        studentCount: students.length
      });
    } catch (error: any) {
      console.error('Database health check failed:', error);
      res.status(503).json({
        connected: false,
        error: error.message || 'Database unavailable'
      });
    }
  });

  app.post('/api/database/seed', async (req, res) => {
    try {
      const result = await seedInitialMadrasahDataIfEmpty();
      res.json(result);
    } catch (error: any) {
      console.error('Seed operation failed:', error);
      res.status(500).json({ error: error.message || 'Failed to seed database' });
    }
  });

  // User Authentication & Firebase Account Sync
  app.post('/api/auth/sync-user', async (req, res) => {
    try {
      const { uid, email, displayName, role } = req.body;
      if (!uid || !email) {
        return res.status(400).json({ error: 'Missing uid or email' });
      }
      const user = await getOrCreateUser(uid, email, displayName, role || 'parent');
      res.json(user);
    } catch (error: any) {
      console.error('Failed to sync user:', error);
      res.status(500).json({ error: error.message || 'Error syncing user in database' });
    }
  });

  // Students endpoints
  app.get('/api/students', async (req, res) => {
    try {
      const list = await getAllStudents();
      res.json(list);
    } catch (error: any) {
      console.error('Failed to get students:', error);
      res.status(500).json({ error: error.message || 'Error fetching students' });
    }
  });

  app.post('/api/students', async (req, res) => {
    try {
      const saved = await upsertStudent(req.body);
      res.json(saved);
    } catch (error: any) {
      console.error('Failed to save student:', error);
      res.status(500).json({ error: error.message || 'Error saving student' });
    }
  });

  app.delete('/api/students/:id', async (req, res) => {
    try {
      await deleteStudentById(req.params.id);
      res.json({ success: true, deletedId: req.params.id });
    } catch (error: any) {
      console.error('Failed to delete student:', error);
      res.status(500).json({ error: error.message || 'Error deleting student' });
    }
  });

  // Daily Hifz records
  app.get('/api/records/hifz', async (req, res) => {
    try {
      const studentId = req.query.studentId as string | undefined;
      const records = await getHifzRecords(studentId);
      res.json(records);
    } catch (error: any) {
      console.error('Failed to get hifz records:', error);
      res.status(500).json({ error: error.message || 'Error fetching hifz records' });
    }
  });

  app.post('/api/records/hifz', async (req, res) => {
    try {
      const record = await saveHifzRecord(req.body);
      res.json(record);
    } catch (error: any) {
      console.error('Failed to save hifz record:', error);
      res.status(500).json({ error: error.message || 'Error saving hifz record' });
    }
  });

  // Home Learning records
  app.get('/api/records/home', async (req, res) => {
    try {
      const studentId = req.query.studentId as string | undefined;
      const records = await getHomeLearning(studentId);
      res.json(records);
    } catch (error: any) {
      console.error('Failed to get home learning records:', error);
      res.status(500).json({ error: error.message || 'Error fetching home learning' });
    }
  });

  app.post('/api/records/home', async (req, res) => {
    try {
      const record = await saveHomeLearning(req.body);
      res.json(record);
    } catch (error: any) {
      console.error('Failed to save home learning:', error);
      res.status(500).json({ error: error.message || 'Error saving home learning' });
    }
  });

  // Daily Tarbiyah records
  app.get('/api/records/tarbiyah', async (req, res) => {
    try {
      const studentId = req.query.studentId as string | undefined;
      const records = await getTarbiyah(studentId);
      res.json(records);
    } catch (error: any) {
      console.error('Failed to get tarbiyah records:', error);
      res.status(500).json({ error: error.message || 'Error fetching tarbiyah records' });
    }
  });

  app.post('/api/records/tarbiyah', async (req, res) => {
    try {
      const record = await saveTarbiyah(req.body);
      res.json(record);
    } catch (error: any) {
      console.error('Failed to save tarbiyah:', error);
      res.status(500).json({ error: error.message || 'Error saving tarbiyah' });
    }
  });

  // Weekly Evaluations
  app.get('/api/evaluations', async (req, res) => {
    try {
      const studentId = req.query.studentId as string | undefined;
      const evals = await getEvaluations(studentId);
      res.json(evals);
    } catch (error: any) {
      console.error('Failed to get evaluations:', error);
      res.status(500).json({ error: error.message || 'Error fetching evaluations' });
    }
  });

  app.post('/api/evaluations', async (req, res) => {
    try {
      const saved = await saveEvaluation(req.body);
      res.json(saved);
    } catch (error: any) {
      console.error('Failed to save evaluation:', error);
      res.status(500).json({ error: error.message || 'Error saving evaluation' });
    }
  });

  // Madrasah Settings
  app.get('/api/settings/:key', async (req, res) => {
    try {
      const data = await getSettings(req.params.key);
      res.json(data);
    } catch (error: any) {
      console.error('Failed to get settings:', error);
      res.status(500).json({ error: error.message || 'Error fetching settings' });
    }
  });

  app.post('/api/settings/:key', async (req, res) => {
    try {
      await saveSettings(req.params.key, req.body);
      res.json({ success: true });
    } catch (error: any) {
      console.error('Failed to save settings:', error);
      res.status(500).json({ error: error.message || 'Error saving settings' });
    }
  });

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

startServer();
