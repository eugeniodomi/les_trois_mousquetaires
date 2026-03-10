const pool = require('./src/config/database');

async function test() {
  try {
    const userId = 1;
    console.log("Testing open quotes count...");
    await pool.query(`SELECT COUNT(id) FROM cotacoes WHERE status ILIKE 'aberta' AND usuario_criador_id = $1`, [userId]);
    
    console.log("Testing recent quotes count...");
    await pool.query(`SELECT COUNT(id) FROM cotacoes WHERE data_criacao >= NOW() - INTERVAL '7 days' AND usuario_criador_id = $1`, [userId]);
    
    console.log("Testing open quotes list...");
    await pool.query(`
      SELECT c.id, c.descricao as name, c.data_criacao as date, c.status
      FROM cotacoes c
      WHERE c.status ILIKE 'aberta' AND c.usuario_criador_id = $1
      ORDER BY c.data_criacao DESC
      LIMIT 5
    `, [userId]);
    
    console.log("All passed!");
  } catch (err) {
    console.error("FAILED:", err.message);
  } finally {
    process.exit(0);
  }
}

test();
