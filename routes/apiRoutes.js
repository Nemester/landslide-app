// src/routes/landslideRoutes.js
const express = require('express');
const router = express.Router();
const landslideController = require('../controllers/landslideController');

router.get('/landslides', landslideController.api_getDataLandslideMap)

module.exports = router;