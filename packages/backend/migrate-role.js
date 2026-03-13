// migrate-role.js — Adds the `role` column to the usuarios table for RBAC
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const pool = require('./src/config/database');

async function migrate() {
  try {
    await pool.query(`
      ALTER TABLE usuarios
      ADD COLUMN IF NOT EXISTS role VARCHAR(50) NOT NULL DEFAULT 'user'
    `);
    console.log("✅ Migration successful: 'role' column added (or already existed).");

    const result = await pool.query(`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_name = 'usuarios' AND column_name = 'role'
    `);
    console.table(result.rows);
  } catch (err) {
    console.error("❌ Migration failed:", err.message);
  } finally {
    await pool.end();
  }
}

migrate();
