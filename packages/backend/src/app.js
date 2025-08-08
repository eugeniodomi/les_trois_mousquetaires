const express = require('express');
const cors = require('cors');
const productRoutes = require('./routes/product.routes');
const productValueRoutes = require('./routes/productValue.routes');

const app = express();
const port = 5000;

// Carregar Dotenv para segurança de credenciais
require('dotenv').config();

// Middleware - para que o Express entenda JSON
app.use(express.json());

// Middleware - para permitir requisições de diferentes origens
app.use(cors());

// Conecte as rotas de cada recurso
app.use('/api/produtos', productRoutes);
app.use('/api/valores_produtos', productValueRoutes);

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});