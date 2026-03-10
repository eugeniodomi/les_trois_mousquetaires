const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const pool = require('../config/database');

// ROTA DE ATUALIZAÇÃO DO PERFIL DO USUÁRIO
// PUT /api/users/:id
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, email, cargo, foto_url, novaSenha } = req.body;

  try {
    // Verifica se o usuário existe
    const userResult = await pool.query('SELECT * FROM usuarios WHERE id = $1', [id]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ msg: 'Usuário não encontrado.' });
    }

    let queryParams = [];
    let setClause = [];
    let paramIndex = 1;

    if (nome) {
      setClause.push(`nome = $${paramIndex++}`);
      queryParams.push(nome);
    }
    if (email) {
      setClause.push(`email = $${paramIndex++}`);
      queryParams.push(email);
    }
    if (cargo) {
      setClause.push(`cargo = $${paramIndex++}`);
      queryParams.push(cargo);
    }
    if (foto_url !== undefined) {
      setClause.push(`foto_url = $${paramIndex++}`);
      queryParams.push(foto_url);
    }

    if (novaSenha) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(novaSenha, salt);
      setClause.push(`senha_hash = $${paramIndex++}`);
      queryParams.push(passwordHash);
    }

    if (setClause.length === 0) {
      return res.status(400).json({ msg: 'Nenhum dado para atualizar.' });
    }

    queryParams.push(id);
    const updateQuery = `
      UPDATE usuarios 
      SET ${setClause.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, nome, email, cargo, foto_url
    `;

    const updatedUser = await pool.query(updateQuery, queryParams);

    res.json({
      msg: 'Perfil atualizado com sucesso!',
      user: updatedUser.rows[0],
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor ao atualizar perfil');
  }
});

module.exports = router;
