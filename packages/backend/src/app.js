const express = require('express');
const cors = require('cors');
const itemRoutes = require('./routes/item.routes');

const app = express();
const port = 5000;

// Middleware
app.use(express.json());
app.use(cors());

// Conecta as rotas
app.use('/api/items', itemRoutes);

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});