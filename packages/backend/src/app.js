console.log('O caminho atual é:', __dirname); //debug 

// Carregar Dotenv para segurança de credenciais
const path = require('path');
// CORRIGIDO: O caminho agora sobe um nível a partir de 'src' para encontrar o .env
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const express = require('express');
const cors = require('cors');
// ADICIONADO: Importar o rate-limit
const rateLimit = require('express-rate-limit'); 

const productRoutes = require('./routes/product.routes');
const productValueRoutes = require('./routes/productValue.routes');

//distributors
const distributorRoutes = require('./routes/distributor.routes');

const app = express();
// ALTERADO: Usando a porta do .env ou 5000 como padrão
const port = process.env.PORT || 5000; 

// ADICIONADO: Configuração do Rate Limiter
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 20, // Permite 20 requisições a cada 15 minutos por IP
  message: 'Muitas requisições para este IP, por favor, tente novamente mais tarde.',
  standardHeaders: true,
  legacyHeaders: false,
});


// Middleware - para que o Express entenda JSON
app.use(express.json());

// Middleware - para permitir requisições de diferentes origens
app.use(cors());

// Conecte as rotas de cada recurso
app.use('/api/produtos', productRoutes);
app.use('/api/valores_produtos', productValueRoutes);

//add NOVOS ROTAS
app.use('/api/distribuidores', distributorRoutes);


// ADICIONE A NOVA ROTA DE AUTENTICAÇÃO COM O LIMITADOR
app.use('/api/auth', authLimiter, require('./routes/authRoutes'));


app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});