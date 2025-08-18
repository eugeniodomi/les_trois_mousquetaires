console.log('O caminho atual é:', __dirname); //debug 

// Carregar Dotenv para segurança de credenciais
// require('dotenv').config(); //depreceated
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const express = require('express');
const cors = require('cors');
const productRoutes = require('./routes/product.routes');
const productValueRoutes = require('./routes/productValue.routes');

//distributors
const distributorRoutes = require('./routes/distributor.routes');

const app = express();
const port = 5000;



// Middleware - para que o Express entenda JSON
app.use(express.json());

// Middleware - para permitir requisições de diferentes origens
app.use(cors());

// Conecte as rotas de cada recurso
app.use('/api/produtos', productRoutes);
app.use('/api/valores_produtos', productValueRoutes);

//add NOVOS ROTAS
app.use('/api/distribuidores', distributorRoutes);

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});