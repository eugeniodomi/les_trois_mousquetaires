/**
 * criar_admin.js — Seed script: cria (ou promove) um usuário admin no banco.
 *
 * Uso: node criar_admin.js
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  host:     process.env.DB_HOST,
  port:     process.env.DB_PORT,
  database: process.env.DB_DATABASE,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function criarAdmin() {
  const nome     = 'Admin IT-ONE';
  const email    = 'adm@itone.com.br';
  const senha    = 'adm123';
  const role     = 'admin';

  const salt         = await bcrypt.genSalt(10);
  const senha_hash   = await bcrypt.hash(senha, salt);

  await pool.query(
    `INSERT INTO usuarios (nome, email, senha_hash, role)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (email)
     DO UPDATE SET
       senha_hash = EXCLUDED.senha_hash,
       role       = EXCLUDED.role`,
    [nome, email, senha_hash, role]
  );

  console.log('✅ Usuário Admin criado com sucesso!');
  console.log(`   Email : ${email}`);
  console.log(`   Senha : ${senha}`);
  console.log(`   Role  : ${role}`);

  await pool.end();
  process.exit(0);
}

criarAdmin().catch((err) => {
  console.error('❌ Erro ao criar usuário admin:', err.message);
  pool.end();
  process.exit(1);
});
