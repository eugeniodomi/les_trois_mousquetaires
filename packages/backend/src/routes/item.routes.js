const express = require('express');
const router = express.Router();
const itemController = require('../controllers/item.controller');

// Rotas de itens
router.get('/', itemController.getAllItems);
router.post('/', itemController.createItem);
router.put('/:id', itemController.updateItem);
router.delete('/:id', itemController.deleteItem);

// NOVA ROTA PARA BUSCA - test
// Exemplo de URL: GET http://localhost:3000/api/items/search?q=notebook
router.get('/search', itemController.searchItems);



module.exports = router;