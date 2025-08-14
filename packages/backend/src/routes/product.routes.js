const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');

router.get('/', productController.getAllProducts);
router.post('/', productController.createProduct);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);



//NOVA ROTA PARA BUSCAR INDEX
//TEST

// Acessível via GET /api/produtos/search?q=termo_buscado
router.get('/search', productController.searchProducts);


module.exports = router;