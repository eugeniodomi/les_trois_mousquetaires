const express = require('express');
const router = express.Router();
const productValueController = require('../controllers/productValue.controller');

router.get('/', productValueController.getAllProductValues);
router.post('/', productValueController.createProductValue);


// Rota para LER UMA cotação por ID
router.get('/:id', productValueController.getProductValueById);

// Rota para ATUALIZAR uma cotação por ID
router.put('/:id', productValueController.updateProductValue);

// Rota para DELETAR uma cotação por ID
router.delete('/:id', productValueController.deleteProductValue);

module.exports = router;