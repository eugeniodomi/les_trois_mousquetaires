const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller.js');

// --- ROTAS GERAIS E ESTÁTICAS (mais específicas) ---

// Rota para LISTAR TODOS os produtos ativos
router.get('/', productController.findAll);

// Rota para BUSCAR produtos por nome ou SKU
// A rota estática '/search' DEVE vir antes da rota dinâmica '/:id' para evitar conflitos.
router.get('/search', productController.search);

// Rota para CRIAR um novo produto
router.post('/', productController.create);


// --- ROTAS DINÂMICAS (com parâmetro :id) ---
// Todas as rotas que usam um ID específico devem vir depois das rotas estáticas.

// Rota para BUSCAR o histórico de preços de um produto
router.get('/:id/historico', productController.getHistory);

// Rota para BUSCAR um produto por ID
router.get('/:id', productController.findById);

// Rota para ATUALIZAR um produto pelo ID
router.put('/:id', productController.update);

// Rota para DELETAR (desativar) um produto pelo ID
router.delete('/:id', productController.delete);


module.exports = router;
