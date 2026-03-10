require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function test() {
  const client = await pool.connect();
  try {
    console.log("Testing Quotes Query...");
    await client.query(`
      SELECT 
          COUNT(id) AS total_quotes,
          SUM(CASE WHEN LOWER(status::text) = 'fechada' THEN 1 ELSE 0 END) AS won_quotes
      FROM cotacoes
    `);
    
    console.log("Testing Financial Query...");
    await client.query(`
      SELECT 
          COALESCE(SUM(CASE WHEN LOWER(c.status::text) IN ('aberta', 'em análise', 'em analise') THEN dc.valor_venda_final * dc.quantidade ELSE 0 END), 0) AS pipeline_total,
          COALESCE(SUM(CASE WHEN LOWER(c.status::text) = 'fechada' THEN (dc.valor_venda_final - COALESCE(dc.valor_unitario, 0)) * dc.quantidade ELSE 0 END), 0) AS gross_margin
      FROM cotacoes c
      JOIN dados_cotacoes dc ON c.id = dc.cotacao_id
    `);

    console.log("Testing Top Reps Query...");
    await client.query(`
      SELECT 
          u.id, 
          u.nome, 
          COALESCE(SUM(dc.valor_venda_final * dc.quantidade), 0) as total_sales
      FROM cotacoes c
      JOIN usuarios u ON c.usuario_criador_id = u.id
      JOIN dados_cotacoes dc ON c.id = dc.cotacao_id
      WHERE LOWER(c.status::text) = 'fechada'
      GROUP BY u.id, u.nome
      ORDER BY total_sales DESC
      LIMIT 3
    `);
    
    console.log("ALL QUERIES SUCCESSFUL");
  } catch (err) {
    console.error("ERROR IN QUERY:", err);
  } finally {
    client.release();
    pool.end();
  }
}

test();
