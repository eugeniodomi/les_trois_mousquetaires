const pool = require('./src/config/database');
const fs = require('fs');

async function checkSchema() {
  try {
    const res = await pool.query(`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_name = 'usuarios';
    `);
    fs.writeFileSync('schema.json', JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}

checkSchema();
