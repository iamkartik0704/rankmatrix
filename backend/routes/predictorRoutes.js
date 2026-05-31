const express = require('express');
const router = express.Router();
const { getPredictions } = require('../controllers/predictorController');

router.post('/', getPredictions);

module.exports = router;