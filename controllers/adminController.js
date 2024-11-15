const configurationService = require('../services/configurationService');
const informationService = require('../services/informationService');
const userService = require('../services/userService');
const User = require('../models/User');
const { log } = require('../config/logger');
const bcrypt = require('bcrypt');

// Utility function for centralized error handling
function handleError(error, res, customMessage) {
    log.error(`${customMessage}: ${error.message}`);
    res.status(500).render('error', { error: customMessage });
}

// Render admin dashboard with configurations, users, and information list
async function renderAdminPanel(req, res) {
    try {
        log.info(`User ${req.session.user.username} accessed admin dashboard`);

        // Fetch configurations and information via services
        const [configurations, users, information] = await Promise.all([
            configurationService.getAll(), 
            userService.getAll(),
            informationService.getAll()
        ]);

        res.render('adminPanel', { 
            configurations, 
            users, 
            information, 
            successMessage: req.session.successMessage, 
            errorMessage: req.session.errorMessage 
        });

        // Clear session messages after rendering
        req.session.successMessage = undefined;
        req.session.errorMessage = undefined;

        log.info(`Admin dashboard successfully loaded for ${req.session.user.username}`);
    } catch (error) {
        handleError(error, res, 'Failed to load admin dashboard');
    }
}

// Update information value
async function updateInformation(req, res) {
    const { uuid, value } = req.body;
    try {
        const info = await informationService.getInformationByTitle(uuid);
        if (!info) throw new Error('Information not found');

        // Update and save information via the service
        await informationService.updateInformation(uuid, { value });

        log.info(`Information ${info.name} updated by ${req.session.user.username}`);
        req.session.successMessage = "Information updated successfully!";
        res.redirect('/admin');
    } catch (error) {
        handleError(error, res, 'Failed to update information');
    }
}

// Update configuration value
async function updateConfiguration(req, res) {
    const { uuid, value } = req.body;
    try {
        const config = await configurationService.getConfigurationByKey(uuid);
        if (!config) throw new Error('Configuration not found');

        // Update and save configuration via the service
        await configurationService.updateConfiguration(uuid, { value });

        log.info(`Configuration ${config.name} updated by ${req.session.user.username}`);
        req.session.successMessage = `Configuration '${config.name}' updated successfully!`;
        res.redirect('/admin');
    } catch (error) {
        handleError(error, res, 'Failed to update configuration');
    }
}

// Edit or add a user
async function editOrAddUser(req, res) {
    const { uuid, username, email, is_admin, password } = req.body;
    try {
        let user;
        if (uuid) {
            user = await User.findByPk(uuid);
            if (!user) throw new Error('User not found');
        } else {
            user = User.build();
        }

        user.username = username;
        user.email = email;
        user.is_admin = is_admin === 'true';

        if (password) user.password = await bcrypt.hash(password, 10);

        await user.save();

        log.info(`${uuid ? 'Updated' : 'Created'} user ${username} by ${req.session.user.username}`);
        req.session.successMessage = `${uuid ? 'Updated' : 'Created'} user ${username} successfully!`;
        res.redirect('/admin');
    } catch (error) {
        handleError(error, res, 'Failed to edit/add user');
    }
}

// Disable a user
async function disableUser(req, res) {
    const { uuid } = req.params;
    try {
        const user = await User.findByPk(uuid);
        if (!user) throw new Error('User not found');

        await user.destroy();
        log.info(`User ${user.username} disabled by ${req.session.user.username}`);
        req.session.successMessage = `User ${user.username} has been disabled successfully.`;
        res.redirect('/admin');
    } catch (error) {
        handleError(error, res, 'Failed to disable user');
    }
}

module.exports = {
    renderAdminPanel,
    updateConfiguration,
    editOrAddUser,
    disableUser,
    updateInformation
};
