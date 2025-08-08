const pool = require('../config/database');

exports.getAllProductValues = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM valores_produtos ORDER BY id');
    res.json(rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
};

exports.createProductValue = async (req, res) => {
  try {
    const { produto_id, valor_cout, valor_osc, valor_venda_dell, quantidade, data_cotacao } = req.body;
    const { rows } = await pool.query(
      'INSERT INTO valores_produtos (produto_id, valor_cout, valor_osc, valor_venda_dell, quantidade, data_cotacao) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [produto_id, valor_cout, valor_osc, valor_venda_dell, quantidade, data_cotacao]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
};

// Adicione aqui as outras funções de CRUD se precisar