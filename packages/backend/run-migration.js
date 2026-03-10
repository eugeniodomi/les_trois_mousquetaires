const pool = require('./src/config/database');

async function runMigration() {
  try {
    console.log('Running migration: ALTER TABLE usuarios ADD COLUMN dashboard_layout JSONB DEFAULT NULL;');
    await pool.query('ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS dashboard_layout JSONB DEFAULT NULL;');
    console.log('Migration completed successfully.');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    pool.end();
  }
}

runMigration();
