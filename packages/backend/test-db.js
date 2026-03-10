require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const fs = require('fs');
pool.query("SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname != 'pg_catalog' AND schemaname != 'information_schema';", (err, res) => {
  if (err) {
    fs.writeFileSync('db-list.txt', 'Error: ' + err.stack);
  } else {
    fs.writeFileSync('db-list.txt', 'Tables: \n' + res.rows.map(r => r.tablename).join('\n'));
  }
  pool.end();
});
