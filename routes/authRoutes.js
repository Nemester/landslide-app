// src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

// Route to show login form
router.get('/login', (req, res) => {
    res.render('login',{layout: 'notAuthenticated'});  // Render login form
});

// Route to handle login submission
router.post('/login', authController.login);

// Route to handle logout
router.get('/logout', authController.logout);

module.exports = router;
