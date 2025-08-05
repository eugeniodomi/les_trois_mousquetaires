const pool = require('../config/database');

//ROTAS

// Lógica para obter todos os itens
exports.getAllItems = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM items ORDER BY id');
    res.json(rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
};

// Lógica para criar um novo item
exports.createItem = async (req, res) => {
  try {
    const { name, description } = req.body;
    const { rows } = await pool.query(
      'INSERT INTO items (name, description) VALUES ($1, $2) RETURNING *',
      [name, description]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
};

// Lógica para atualizar um item
exports.updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const { rows } = await pool.query(
      'UPDATE items SET name = $1, description = $2 WHERE id = $3 RETURNING *',
      [name, description, id]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
};

// Lógica para deletar um item
exports.deleteItem = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM items WHERE id = $1', [id]);
    res.json('Item excluído com sucesso!');
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
};