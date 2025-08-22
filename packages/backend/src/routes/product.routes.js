const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller.js');

// Rota para LISTAR TODOS os produtos ativos
// CORRIGIDO: A função chamada agora é 'findAll', que existe no seu controller.
router.get('/', productController.findAll);

// Rota para CRIAR um novo produto
// CORRIGIDO: A função chamada agora é 'create'.
router.post('/', productController.create);

// Rota para BUSCAR produtos por nome ou SKU
// Exemplo: GET /api/produtos/search?q=termo
// CORRIGIDO: A função chamada agora é 'search'.
router.get('/search', productController.search);

// Rota para ATUALIZAR um produto pelo ID
// CORRIGIDO: A função chamada agora é 'update'.
router.put('/:id', productController.update);

// Rota para DELETAR (desativar) um produto pelo ID
// CORRIGIDO: A função chamada agora é 'delete'.
router.delete('/:id', productController.delete);

module.exports = router;
