const pool = require('../config/database');

const userController = {
  listUsers: async (req, res) => {
    try {
      const result = await pool.query(
        'SELECT id, nome, email, cargo, role FROM usuarios ORDER BY id ASC'
      );
      res.json(result.rows);
    } catch (err) {
      console.error('Erro ao listar usuários:', err.message);
      res.status(500).json({ error: 'Erro no servidor ao carregar usuários' });
    }
  }
};

module.exports = userController;
