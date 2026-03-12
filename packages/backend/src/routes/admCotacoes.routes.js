// backend/src/routes/admCotacoes.routes.js

const express = require('express');
const router = express.Router();

const ctrl = require('../controllers/admCotacoes.controller.js');

// ── Middleware de validação básica para o POST de criação ────────────────────
// Garante que o body chegue no formato esperado antes de tocar no controller.
// O express.json() já deve estar configurado globalmente em app.js.
const validarPayloadCotacao = (req, res, next) => {
    const { descricao, usuario_criador_id, itens_cotacao } = req.body;

    if (!descricao || String(descricao).trim() === '') {
        return res.status(400).json({ message: 'O campo "descricao" é obrigatório.' });
    }
    if (!usuario_criador_id) {
        return res.status(400).json({ message: 'O campo "usuario_criador_id" é obrigatório.' });
    }
    if (!Array.isArray(itens_cotacao) || itens_cotacao.length === 0) {
        return res.status(400).json({ message: 'O array "itens_cotacao" deve ter pelo menos um item.' });
    }

    // Valida FKs obrigatórias em cada item
    for (let i = 0; i < itens_cotacao.length; i++) {
        const item = itens_cotacao[i];
        if (!item.produto_id) {
            return res.status(400).json({ message: `Item ${i + 1}: "produto_id" é obrigatório.` });
        }
        if (!item.distribuidor_id) {
            return res.status(400).json({ message: `Item ${i + 1}: "distribuidor_id" é obrigatório.` });
        }
    }

    next();
};

// POST /api/cotacoes — Cria cotação mestre + itens (transação)
router.post('/', validarPayloadCotacao, ctrl.create);

// GET /api/cotacoes — Lista todas as cotações
router.get('/', ctrl.findAll);

// GET /api/cotacoes/:id — Busca cotação + seus itens
router.get('/:id', ctrl.findOne);

// PUT /api/cotacoes/:id — Atualiza cotação + substitui itens
router.put('/:id', ctrl.update);

// DELETE /api/cotacoes/:id — Cancela (soft-delete) cotação
router.delete('/:id', ctrl.delete);

module.exports = router;