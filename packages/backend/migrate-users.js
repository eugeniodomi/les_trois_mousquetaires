require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function runMigration() {
  const client = await pool.connect();
  try {
    console.log("Starting migration to add cargo and foto_url to usuarios table...");

    // Adiciona cargo se não existir
    await client.query(`
      ALTER TABLE usuarios 
      ADD COLUMN IF NOT EXISTS cargo VARCHAR(255) DEFAULT 'Colaborador';
    `);
    console.log("Column 'cargo' checked/added.");

    // Adiciona foto_url se não existir
    await client.query(`
      ALTER TABLE usuarios 
      ADD COLUMN IF NOT EXISTS foto_url VARCHAR(255) DEFAULT NULL;
    `);
    console.log("Column 'foto_url' checked/added.");

    console.log("Migration completed successfully.");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    client.release();
    pool.end();
  }
}

runMigration();
