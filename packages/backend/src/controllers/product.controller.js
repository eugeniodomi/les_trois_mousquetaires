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

// Adicione aqui as funções para update e delete se precisar

xports.updateProduct = async (req, res) => {
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