// src/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { isAdmin } = require('../middlewares/authMiddleware');
// Protect all admin routes
router.get('/', adminController.renderAdminPanel);
router.post('/configurations/update', adminController.updateConfiguration);
router.post('/information/update', adminController.updateInformation);
router.post('/users/edit', adminController.editOrAddUser);
router.post('/users/disable/:uuid', adminController.disableUser);
router.post('/users/add', adminController.editOrAddUser);

module.exports = router;
