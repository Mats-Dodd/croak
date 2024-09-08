import { migrate } from 'drizzle-orm/libsql/migrator';
import { createDbClient } from './index';

async function runMigrations() {
  if (!process.env.TURSO_DB_URL) {
    throw new Error('TURSO_DB_URL is not set in the environment variables');
  }

  const db = createDbClient(
    process.env.TURSO_DB_URL,
    process.env.TURSO_DB_TOKEN
  );

  console.log('Running migrations...');
  await migrate(db, { migrationsFolder: './migrations' });
  console.log('Migrations completed successfully');
}

runMigrations()
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
