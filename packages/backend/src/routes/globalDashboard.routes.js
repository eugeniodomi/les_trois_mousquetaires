const express = require('express');
const router = express.Router();
const globalDashboardController = require('../controllers/globalDashboard.controller');

// Rota para buscar as métricas globais
router.get('/', globalDashboardController.getGlobalMetrics);

module.exports = router;
