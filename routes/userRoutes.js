const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Route to show user profile
router.get('/', userController.showProfile);
router.post('/', userController.updateUser);
// Route to update user profile
router.post('/delete/:id', userController.deleteUser);

module.exports = router;
