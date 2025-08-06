const express = require('express');
const cors = require('cors');
const pool = require('./config/database'); // Importe diretamente o pool do banco de dados

// const itemRoutes = require('./routes/item.routes'); // Comente esta linha

const app = express();
const port = 5000;

// Middleware
app.use(express.json());
app.use(cors());

// Crie uma rota de teste simples
app.get('/teste-conexao', async (req, res) => {
    try {
        // Tenta obter a versão do PostgreSQL
        const { rows } = await pool.query('SELECT version()');
        res.status(200).json({
            message: 'Conexão com o banco de dados bem-sucedida!',
            databaseVersion: rows[0].version
        });
    } catch (err) {
        console.error('Erro na requisição de teste:', err);
        res.status(500).json({
            error: 'Erro ao tentar se conectar ou consultar o banco de dados.',
            details: err.message
        });
    }
});

// app.use('/api/items', itemRoutes); // Comente esta linha

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});