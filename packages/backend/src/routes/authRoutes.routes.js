const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database'); // Importando sua conexão com o banco

// ROTA DE REGISTRO
// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  // 1. Validação básica
  if (!name || !email || !password) {
    return res.status(400).json({ msg: 'Por favor, insira todos os campos.' });
  }

  try {
    // 2. Verifica se o usuário já existe
    const userExists = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ msg: 'Usuário com este email já existe.' });
    }

    // 3. Criptografa a senha (Hashing)
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 4. Insere o novo usuário no banco de dados
    const newUser = await pool.query(
      'INSERT INTO usuarios (nome, email, senha_hash) VALUES ($1, $2, $3) RETURNING id, nome, email',
      [name, email, passwordHash]
    );

    res.status(201).json({
      msg: 'Usuário registrado com sucesso!',
      user: newUser.rows[0],
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
});

// ROTA DE LOGIN
// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // 1. Validação básica
  if (!email || !password) {
    return res.status(400).json({ msg: 'Por favor, insira todos os campos.' });
  }

  try {
    // 2. Procura o usuário pelo email
    const userResult = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(400).json({ msg: 'Credenciais inválidas.' });
    }
    const user = userResult.rows[0];

    // 3. Compara a senha enviada com o hash salvo no banco
    const isMatch = await bcrypt.compare(password, user.senha_hash);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Credenciais inválidas.' });
    }

    // 4. Se a senha está correta, cria o payload do Token
    const payload = {
      user: {
        id: user.id,
        name: user.nome,
      },
    };

    // 5. Assina o Token com a chave secreta e define um tempo de expiração
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' }, // Token expira em 1 hora
      (err, token) => {
        if (err) throw err;
        res.json({ token }); // Envia o token para o frontend
      }
    );

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
});

module.exports = router;