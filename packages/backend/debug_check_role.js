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

pool.query("SELECT email, role FROM usuarios WHERE email = 'adm@itone.com.br'")
  .then(r => {
    console.log(JSON.stringify(r.rows, null, 2));
    pool.end();
  })
  .catch(err => {
    console.error(err);
    pool.end();
  });
