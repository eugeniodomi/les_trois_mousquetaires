const express = require('express');
const router = express.Router();
// ALTERADO: Importa o controller correto (supondo que o arquivo foi renomeado).
const quotationController = require('../controllers/quotation.controller.js');

// Rota para listar todas as cotações
// ALTERADO: Chama a função 'findAll'
router.get('/', quotationController.findAll);

// Rota para criar uma nova cotação
// ALTERADO: Chama a função 'create'
router.post('/', quotationController.create);

// Rota para buscar uma cotação específica por ID
// ALTERADO: Chama a função 'findOne'
router.get('/:id', quotationController.findOne);

// Rota para atualizar uma cotação por ID
// ALTERADO: Chama a função 'update'
router.put('/:id', quotationController.update);

// Rota para deletar uma cotação por ID
// ALTERADO: Chama a função 'delete'
router.delete('/:id', quotationController.delete);

module.exports = router;
