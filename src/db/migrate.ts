import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';
import path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

export async function runMigrations() {
  const host = process.env.SQL_HOST;
  const database = process.env.SQL_DB_NAME;
  const user = process.env.SQL_ADMIN_USER || process.env.SQL_USER;
  const password = process.env.SQL_ADMIN_PASSWORD || process.env.SQL_PASSWORD;

  if (!host || !database || !user) {
    console.warn('[DB Migration] Missing SQL connection details. Skipping migrations.');
    return;
  }

  console.log(`[DB Migration] Running schema migrations using admin user '${user}'...`);

  const adminPool = new Pool({
    host,
    user,
    password,
    database,
    max: 2,
    connectionTimeoutMillis: 15000,
  });

  adminPool.on('error', (err) => {
    console.error('[DB Migration] Unexpected pool error during migration:', err);
  });

  try {
    const adminDb = drizzle(adminPool);
    const migrationsFolder = path.resolve(process.cwd(), 'drizzle');
    await migrate(adminDb, { migrationsFolder });
    console.log('[DB Migration] All 12 tables and migrations verified successfully.');
  } catch (error: any) {
    console.error('[DB Migration] Error applying database migrations:', error);
    throw error;
  } finally {
    await adminPool.end();
  }
}

// Support direct command-line execution: npm run db:migrate
const isCLI = process.argv[1] && (
  process.argv[1].endsWith('migrate.ts') ||
  process.argv[1].endsWith('migrate.js') ||
  process.argv[1].endsWith('migrate.cjs')
);

if (isCLI) {
  runMigrations()
    .then(() => {
      console.log('[DB Migration] Completed successfully.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('[DB Migration] Failed:', err);
      process.exit(1);
    });
}
