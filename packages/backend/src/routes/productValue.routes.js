const express = require('express');
const router = express.Router();
const productValueController = require('../controllers/productValue.controller');

router.get('/', productValueController.getAllProductValues);
router.post('/', productValueController.createProductValue);

module.exports = router;