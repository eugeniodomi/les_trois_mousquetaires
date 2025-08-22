// Carregar Dotenv para segurança de credenciais
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

// --- 1. Importação de todas as rotas ---
const productRoutes = require('./routes/product.routes.js');
// ALTERADO: Importa o arquivo de rotas de cotações com o nome correto.
const quotationRoutes = require('./routes/quotation.routes.js'); 
const distributorRoutes = require('./routes/distributor.routes.js');
const searchRoutes = require('./routes/search.routes.js');
const authRoutes = require('./routes/authRoutes.js'); // Adicionado .js para consistência

const app = express();
const port = process.env.PORT || 5000;

// --- 2. Configuração de Middlewares Globais ---

// Middleware - para permitir requisições de diferentes origens
app.use(cors());

// Middleware - para que o Express entenda JSON
app.use(express.json());

// Configuração do Rate Limiter para rotas de autenticação
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 20, // Limita cada IP a 20 requisições nesta janela
  message: 'Muitas requisições para este IP, por favor, tente novamente mais tarde.',
  standardHeaders: true,
  legacyHeaders: false,
});

// --- 3. Definição das Rotas da API ---

// Rotas principais do CRUD
app.use('/api/produtos', productRoutes);
app.use('/api/distribuidores', distributorRoutes);
// ALTERADO: O endpoint e a variável da rota foram atualizados.
app.use('/api/cotacoes', quotationRoutes); 

// Rota de busca global
app.use('/api/search', searchRoutes);

// Rota de autenticação com o limitador de requisições
app.use('/api/auth', authLimiter, authRoutes);

// --- 4. Inicialização do Servidor ---
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
