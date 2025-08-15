const pool = require('../config/database');

exports.getAllProducts = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM produtos ORDER BY id');
    res.json(rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { nome, descricao } = req.body;
    const { rows } = await pool.query(
      'INSERT INTO produtos (nome, descricao) VALUES ($1, $2) RETURNING *',
      [nome, descricao]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
};

// Adicione aqui as funções para update e delete ----se precisar---

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, descricao } = req.body;
    const { rows } = await pool.query(
      'UPDATE produtos SET nome = $1, descricao = $2 WHERE id = $3 RETURNING *',
      [nome, descricao, id]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM produtos WHERE id = $1', [id]);
    res.json('Produto excluído com sucesso!');
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
};

/*

exports.searchProducts = async (req, res) => {
  try {
    // Pega o termo de busca da URL
    const { q } = req.query;

    // --- DEBUGGING ---
    console.log("--- INICIANDO BUSCA DE PRODUTOS ---");
    console.log("Termo de busca recebido (req.query.q):", q);
    // -----------------

    // Verifica se o termo de busca não é undefined ou vazio
    if (!q) {
      return res.json([]); // Retorna array vazio se não houver termo de busca
    }

    const query = 'SELECT * FROM produtos WHERE nome ILIKE $1 ORDER BY nome';
    const values = [`%${q}%`];

    // --- DEBUGGING ---
    console.log("Consulta SQL executada:", query);
    console.log("Valores enviados para a consulta:", values);
    // -----------------

    const { rows } = await pool.query(query, values);

    // --- DEBUGGING ---
    console.log("Resultados retornados pelo banco (rows):", rows);
    console.log("--- FIM DA BUSCA ---");
    // -----------------

    res.json(rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
};


*/




// NOVA LÓGICA PARA BUSCAR ITENS POR NOME
exports.searchProducts = async (req, res) => {
  try {
    const { q } = req.query;

    // Se não houver termo de busca, retorna um array vazio.
    if (!q) {
      return res.json([]);
    }

    // A consulta SQL agora tem um "OR" para buscar em múltiplos campos.
    // encontrar resultados se o termo estiver no nome OU na descrição.
    const query = `
      SELECT * FROM produtos 
      WHERE nome ILIKE $1 OR descricao ILIKE $1 
      ORDER BY nome
    `;

    // O $1 foi substituído nos dois lugares da consulta.
    const values = [`%${q}%`];

    console.log("Executando busca por:", values); // debug

    const { rows } = await pool.query(query, values);

    res.json(rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
};
