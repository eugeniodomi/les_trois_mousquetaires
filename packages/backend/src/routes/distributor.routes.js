// ROTAS DO CRUD DISTRIBUIDORES

// distributor.routes.js

const express = require('express');
const router = express.Router();
const distributorController = require('../controllers/distributor.controller.js');

// Rota para CRIAR um novo distribuidor
// Exemplo: POST http://localhost:3000/api/distribuidores
router.post('/', distributorController.create);

// Rota para LISTAR TODOS os distribuidores
// Exemplo: GET http://localhost:3000/api/distribuidores
router.get('/', distributorController.findAll);

// Rota para BUSCAR um distribuidor específico pelo ID
// Exemplo: GET http://localhost:3000/api/distribuidores/1
router.get('/:id', distributorController.findOne);

// Rota para ATUALIZAR um distribuidor pelo ID
// Exemplo: PUT http://localhost:3000/api/distribuidores/1
router.put('/:id', distributorController.update);

// Rota para DELETAR um distribuidor pelo ID
// Exemplo: DELETE http://localhost:3000/api/distribuidores/1
router.delete('/:id', distributorController.delete);

module.exports = router;