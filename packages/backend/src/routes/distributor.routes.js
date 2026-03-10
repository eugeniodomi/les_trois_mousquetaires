// src/routes/distributor.routes.js

const express = require('express');
const router = express.Router();
const distributorController = require('../controllers/distributor.controller.js');

// Rota para CRIAR um novo distribuidor
// Exemplo: POST /api/distribuidores
router.post('/', distributorController.create);

// Rota para BUSCAR todos os distribuidores
// Exemplo: GET /api/distribuidores
router.get('/', distributorController.findAll);

// Rota para BUSCAR analytics (DASHBOARD)
// Exemplo: GET /api/distribuidores/analytics
router.get('/analytics', distributorController.getAnalytics);

// Rota para BUSCAR um distribuidor específico pelo ID
// Exemplo: GET /api/distribuidores/1
router.get('/:id', distributorController.findOne);

// Rota para ATUALIZAR um distribuidor pelo ID
// Exemplo: PUT /api/distribuidores/1
router.put('/:id', distributorController.update);

// Rota para DELETAR (desativar) um distribuidor pelo ID
// Exemplo: DELETE /api/distribuidores/1
router.delete('/:id', distributorController.delete);

module.exports = router;
