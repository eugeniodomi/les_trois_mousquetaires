const express = require('express');
const router = express.Router();
const searchController = require('../controllers/search.controller.js');
// Middleware de autenticação, se necessário
// const authMiddleware = require('../middlewares/auth');

// router.use(authMiddleware); // Descomente se a busca for apenas para usuários logados

// Rota principal de busca global
// Exemplo de chamada: GET /api/search?q=termo_para_buscar
router.get('/', searchController.globalSearch);

module.exports = router;