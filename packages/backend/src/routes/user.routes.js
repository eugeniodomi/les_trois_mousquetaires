const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const pool = require('../config/database');
const { verifyToken, requireRole } = require('../middleware/auth.middleware');
const userController = require('../controllers/user.controller');

// ROTA PARA BUSCAR O LAYOUT DO DASHBOARD
// GET /api/usuarios/layout
router.get('/layout', async (req, res) => {
  try {
    // Assuming user ID is coming from req.user set by authentication middleware.
    // However, looking at the PUT /:id route, authentication middleware isn't present in this file.
    // If there's no req.user, we might need to rely on query parameters or headers if auth isn't standard.
    // Wait, the user mentioned "fetch the logged-in user's layout". Let's check how HomePage was fetching data.
    // It calls `getHomeData(user.id)`. The frontend has the user ID.
    // Let's expect the user ID as a query param or body for now, OR better, define it as `/layout/:id` or expect it in query: `/layout?userId=xxx`
    // Let's define the route as GET /layout/:id to be safe and consistent, OR we can use the requested GET /api/usuarios/layout and expect `userId` in query string.
    
    // User requested "GET /api/usuarios/layout (to fetch the logged-in user's layout)."
    // We will extract userId from req.query.userId.
    const userId = req.query.userId;
    if (!userId) {
      return res.status(400).json({ msg: 'User ID is required' });
    }

    const result = await pool.query('SELECT dashboard_layout FROM usuarios WHERE id = $1', [userId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ msg: 'User not found.' });
    }

    res.json({ layout: result.rows[0].dashboard_layout });
  } catch (err) {
    console.error('Error fetching layout:', err.message);
    res.status(500).json({ error: 'Server Error' });
  }
});

// ROTA PARA SALVAR O LAYOUT DO DASHBOARD
// PUT /api/usuarios/layout
router.put('/layout', async (req, res) => {
  try {
    const { userId, layout } = req.body;
    
    console.log(`[BACKEND] Saving layout for user: ${userId}`);
    console.log(`[BACKEND] Layout payload size:`, layout ? layout.length : 'undefined', 'items');
    
    if (!userId) {
      console.warn('[BACKEND] Missing userId in layout save request');
      return res.status(400).json({ msg: 'User ID is required' });
    }

    const debugQuery = 'UPDATE usuarios SET dashboard_layout = $1 WHERE id = $2 RETURNING id';
    const result = await pool.query(debugQuery, [JSON.stringify(layout), userId]);
    
    if (result.rowCount === 0) {
       console.warn(`[BACKEND] User ${userId} not found in DB during layout save.`);
       return res.status(404).json({ msg: 'Usuário não encontrado.' });
    }

    console.log(`[BACKEND] Layout successfully saved to DB for user ${userId}`);
    res.json({ msg: 'Layout saved successfully' });
  } catch (err) {
    console.error('Error saving layout:', err.message);
    res.status(500).json({ error: 'Server Error' });
  }
});

// =============================================================
// ROTAS ADMIN — RBAC protegidas por verifyToken + requireRole
// =============================================================

// GET /api/usuarios — Lista todos os usuários (apenas admin e root)
router.get('/', verifyToken, requireRole(['root', 'admin']), userController.listUsers);

// PUT /api/usuarios/:id/role — Atualiza o role de um usuário (hierárquico)
router.put('/:id/role', verifyToken, requireRole(['root', 'admin']), async (req, res) => {
  const { id } = req.params;
  const { role: newRole } = req.body;
  const requesterRole = req.user.role;

  const allowedRoles = ['root', 'admin', 'priority', 'user'];
  
  if (!newRole || !allowedRoles.includes(newRole)) {
    return res.status(400).json({
      msg: `Role inválido. Valores permitidos: ${allowedRoles.join(', ')}.`,
    });
  }

  try {
    // 1. Fetch the target user's current role
    const targetUserResult = await pool.query('SELECT role FROM usuarios WHERE id = $1', [id]);
    
    if (targetUserResult.rowCount === 0) {
      return res.status(404).json({ msg: 'Usuário não encontrado.' });
    }
    
    const targetUserRole = targetUserResult.rows[0].role;

    // 2. Apply hierarchical restrictions if requester is NOT 'root'
    if (requesterRole !== 'root') {
      // Admin CANNOT change the role of a root user
      if (targetUserRole === 'root') {
        return res.status(403).json({ 
          msg: 'Acesso negado. Apenas o Master Admin (root) pode alterar o perfil de outro root.' 
        });
      }

      // Admin CANNOT promote anyone to root
      if (newRole === 'root') {
        return res.status(403).json({ 
          msg: 'Acesso negado. Apenas o Master Admin (root) pode promover usuários ao nível root.' 
        });
      }
    }

    // 3. Perform the update
    const result = await pool.query(
      'UPDATE usuarios SET role = $1 WHERE id = $2 RETURNING id, nome, email, cargo, foto_url, role',
      [newRole, id]
    );

    res.json({ msg: 'Role atualizado com sucesso!', user: result.rows[0] });
  } catch (err) {
    console.error('Erro ao atualizar role:', err.message);
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

// ROTA DE ATUALIZAÇÃO DO PERFIL DO USUÁRIO
// PUT /api/usuarios/:id
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
