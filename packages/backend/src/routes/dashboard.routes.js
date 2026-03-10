const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');

// Rotas para a Home
router.get('/home', dashboardController.getHomeData);

// Rotas para a tela de Dashboards 
router.get('/stats', dashboardController.getDashboardStats);

module.exports = router;
