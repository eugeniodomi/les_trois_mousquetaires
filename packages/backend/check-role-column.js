// check-role-column.js — verifies the role column exists in the DB
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_DATABASE,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

pool.query("ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS role VARCHAR(50) NOT NULL DEFAULT 'user'")
  .then(() => {
    console.log('✅ Migration OK - role column added (or already existed).');
    return pool.query(
      "SELECT column_name, column_default FROM information_schema.columns WHERE table_name='usuarios' AND column_name='role'"
    );
  })
  .then((r) => {
    console.log('Column info:', JSON.stringify(r.rows));
    pool.end();
  })
  .catch((e) => {
    console.error('❌ Migration failed:', e.message);
    pool.end();
  });
