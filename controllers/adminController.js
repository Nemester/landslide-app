// src/controllers/adminController.js
const Configuration = require('../models/Configuration');
const User = require('../models/User');
const Information = require('../models/Information');
const { log } = require('../config/logger'); // Custom logger
const bcrypt = require('bcrypt');

// Render admin dashboard with configurations, users, and information list
async function renderAdminPanel(req, res) {
    try {
        log.info(`User ${req.session.user.username} accessed admin dashboard`);
        const configurations = await Configuration.findAll({raw: true});
        const users = await User.findAll({raw: true});
        const information = await Information.findAll({raw: true}); // Get all Information records

        res.render('adminPanel', { configurations, users, information, successMessage: req.session.successMessage, errorMessage: req.session.errorMessage});
        req.session.successMessage = undefined
        req.session.errorMessage = undefined
        
        log.info(`Admin dashboard accessed by ${req.session.user.username}`);
    } catch (error) {
        log.error(`Error loading admin dashboard: ${error.message}`);
        res.status(500).render('error', { error: 'Failed to load admin dashboard' });
    }
}

// Update information value
async function updateInformation(req, res) {
    const { uuid, value } = req.body;
    try {
        const info = await Information.findByPk(uuid);
        if (info) {
            info.value = value;
            await info.save();
            log.info(`Information ${info.name} updated by ${req.session.user.username}`);

            req.session.successMessage = "Information updated successfully!"
            res.redirect('/admin');
        } else {
            throw new Error('Information not found');
        }
    } catch (error) {
        log.error(`Failed to update information: ${error.message}`);
        res.status(500).render('error', { error: 'Failed to update information' });
    }
}

// Update configuration value
async function updateConfiguration(req, res) {
    const { uuid, value } = req.body;
    try {
        const config = await Configuration.findByPk(uuid);
        if (config) {
            config.value = value;
            await config.save();
            log.info(`Configuration ${config.name} updated by ${req.session.user.username}`);
            req.session.successMessage = `Configuration '${config.name}'  updated successfully!`
            res.redirect('/admin');
        } else {
            throw new Error('Configuration not found');
        }
    } catch (error) {
        log.error(`Failed to update configuration: ${error.message}`);
        res.status(500).render('error', { error: 'Failed to update configuration' });
    }
}

// Edit or add a user
async function editOrAddUser(req, res) {
    const { uuid, username, email, is_admin, password } = req.body;
    try {
        const user = uuid ? await User.findByPk(uuid) : User.build();
        user.username = username;
        user.email = email;
        user.is_admin = is_admin === 'true';
        if (password) user.password = await bcrypt.hash(password, 10);
        await user.save();
        log.info(`${uuid ? 'Updated' : 'Created'} user ${username} by ${req.session.user.username}`);
        res.redirect('/admin');
    } catch (error) {
        log.error(`Failed to edit/add user: ${error.message}`);
        res.status(500).render('error', { error: 'Failed to save user details' });
    }
}

// Disable a user
async function disableUser(req, res) {
    const { uuid } = req.params;
    try {
        const user = await User.findByPk(uuid);
        if (user) {
            await user.destroy();
            log.info(`User ${user.username} disabled by ${req.session.user.username}`);
            res.redirect('/admin');
        } else {
            throw new Error('User not found');
        }
    } catch (error) {
        log.error(`Failed to disable user: ${error.message}`);
        res.status(500).render('error', { error: 'Failed to disable user' });
    }
}

module.exports = {
    renderAdminPanel,
    updateConfiguration,
    editOrAddUser,
    disableUser,
    updateInformation
};
