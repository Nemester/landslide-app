const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

// Protect the route by requiring authentication
router.get('/', dashboardController.renderDashboard);

module.exports = router;
