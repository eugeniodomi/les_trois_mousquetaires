const { Pool } = require('pg');

// Configuração da conexão com o PostgreSQL

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT,
});



/*
const pool = new Pool({
  user: 'postgres', // Substitua pelo seu usuário
  host: 'localhost',
  database: 'cout_bd', // Substitua pelo nome do seu banco
  password: 'adm123', // Substitua pela sua senha
  port: 5432,
}); */

// Teste a conexão e exporte o pool
pool.connect((err) => {
  if (err) {
    return console.error('Erro ao conectar ao banco de dados', err.stack);
  }
  console.log('Conexão com o PostgreSQL realizada com sucesso! Chupa esta manga xD');
});

module.exports = pool;