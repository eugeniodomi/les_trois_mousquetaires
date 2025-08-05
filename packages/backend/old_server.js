const express = require('express');
const cors = require('cors'); // Para permitir requisições do frontend (React)
const { Pool } = require('pg'); // Para se conectar ao PostgreSQL

const app = express();
const port = 5000;

// Middleware - para que o Express entenda JSON
app.use(express.json());

// Middleware - para permitir requisições de diferentes origens (do seu React)
app.use(cors());

// Configuração da conexão com o PostgreSQL
const pool = new Pool({
  user: 'seu_usuario', // Substitua pelo seu usuário do PostgreSQL
  host: 'localhost',
  database: 'seu_banco_de_dados', // Substitua pelo nome do seu banco
  password: 'sua_senha', // Substitua pela sua senha
  port: 5432,
});

// Teste a conexão com o banco de dados
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Erro ao conectar ao banco de dados', err.stack);
  }
  console.log('Conexão com o PostgreSQL realizada com sucesso!');
  release();
});

// Rotas da API (CRUD)

// READ - Obter todos os itens
app.get('/items', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM items ORDER BY id');
    res.json(rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
});

// CREATE - Criar um novo item
app.post('/items', async (req, res) => {
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
});

// UPDATE - Atualizar um item existente
app.put('/items/:id', async (req, res) => {
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
});

// DELETE - Excluir um item
app.delete('/items/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM items WHERE id = $1', [id]);
    res.json('Item excluído com sucesso!');
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});