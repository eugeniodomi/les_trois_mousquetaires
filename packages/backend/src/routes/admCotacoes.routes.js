const express = require('express');
const router = express.Router();

// ALTERADO: O nome da variável e o caminho do require foram atualizados.
const admCotacoesController = require('../controllers/admCotacoes.controller.js');
// Rota para CRIAR uma nova cotação mestre
// POST /api/cotacoes
router.post('/', admCotacoesController.create);

// Rota para LISTAR todas as cotações
// GET /api/cotacoes
router.get('/', admCotacoesController.findAll);

// Rota para BUSCAR uma cotação específica e seus itens
// GET /api/cotacoes/123
router.get('/:id', admCotacoesController.findOne);

// Rota para ATUALIZAR uma cotação
// PUT /api/cotacoes/123
router.put('/:id', admCotacoesController.update);

// Rota para "DELETAR" (cancelar) uma cotação
// DELETE /api/cotacoes/123
router.delete('/:id', admCotacoesController.delete);

module.exports = router;