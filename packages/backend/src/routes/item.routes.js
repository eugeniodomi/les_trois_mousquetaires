const express = require('express');
const router = express.Router();
// ALTERADO: Importa o controller de produtos, não mais o de itens.
const productController = require('../controllers/product.controller.js');

// Rota para listar todos os produtos ativos
// ALTERADO: Chama a função 'findAll'
router.get('/', productController.findAll);

// Rota para criar um novo produto
// ALTERADO: Chama a função 'create'
router.post('/', productController.create);

// Rota para buscar produtos por nome ou SKU
// Exemplo de URL: GET http://localhost:3000/api/produtos/search?q=parafuso
// ALTERADO: Chama a função 'search'
router.get('/search', productController.search);

// Rota para atualizar um produto
// ALTERADO: Chama a função 'update'
router.put('/:id', productController.update);

// Rota para desativar (soft delete) um produto
// ALTERADO: Chama a função 'delete'
router.delete('/:id', productController.delete);

module.exports = router;