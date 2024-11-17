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
        const { user } = req.session;
        // reload config
        await configurationService.reloadConfiguration()
        log.info(`User ${req.session.user.username} is accessing the admin dashboard`);
        log.debug('Fetching configurations, users, and information');

        const [configurations, users, information] = await Promise.all([
            configurationService.getAllConfigs(), 
            userService.getAll(),
            informationService.getAll()
        ]);
        log.debug('Fetched data successfully, rendering admin dashboard');
        res.render('adminPanel', { 
            configurations, 
            users, 
            user,
            information, 
            successMessage: req.session.successMessage, 
            errorMessage: req.session.errorMessage 
        });

        // Clear session messages after rendering
        req.session.successMessage = undefined;
        req.session.errorMessage = undefined;

        log.info(`Admin dashboard loaded successfully for ${req.session.user.username}`);
    } catch (error) {
        log.error(`Error while loading admin dashboard for ${req.session.user.username}`);
        handleError(error, res, 'Failed to load admin dashboard');
    }
}

// Update information value
async function updateInformation(req, res) {
    const { uuid, value } = req.body;
    try {
        log.debug(`Fetching information with title: ${uuid}`);
        const info = await informationService.getInformationByTitle(uuid);
        if (!info) {
            log.warn(`Information with title '${uuid}' not found`);
            throw new Error('Information not found');
        }

        log.debug(`Updating information '${info.name}' with new value`);
        await informationService.updateInformation(uuid, { value });

        log.info(`Information '${info.name}' updated by ${req.session.user.username}`);
        req.session.successMessage = "Information updated successfully!";
        res.redirect('/admin');
    } catch (error) {
        log.error(`Failed to update information with title '${uuid}'`);
        handleError(error, res, 'Failed to update information');
    }
}

// Update configuration value
async function updateConfiguration(req, res) {
    const { uuid, value } = req.body;
    console.log(req.body)
    try {
        log.debug(`Fetching configuration with key: ${uuid}`);
        const config = await configurationService.getConfigByUUID(uuid);
        if (!config) {
            log.warn(`Configuration with key '${uuid}' not found`);
            throw new Error('Configuration not found');
        }

        log.debug(`Updating configuration '${config.name}' with new value`);
        await configurationService.updateConfiguration(uuid, { value });

        log.info(`Configuration '${config.name}' updated by ${req.session.user.username}`);
        req.session.successMessage = `Configuration '${config.name}' updated successfully!`;
        res.redirect('/admin');
    } catch (error) {
        log.error(`Failed to update configuration with key '${uuid}'`);
        handleError(error, res, 'Failed to update configuration');
    }
}

// Edit or add a user
async function editOrAddUser(req, res) {
    const { uuid, username, email, is_admin, password } = req.body;
    try {
        let user;
        if (uuid) {
            log.debug(`Fetching user with UUID: ${uuid}`);
            user = await User.findByPk(uuid);
            if (!user) {
                log.warn(`User with UUID '${uuid}' not found`);
                throw new Error('User not found');
            }
            log.debug(`Editing user: ${user.username}`);
        } else {
            log.debug('Creating a new user');
            user = User.build();
        }

        user.username = username;
        user.email = email;
        user.is_admin = is_admin === 'true';

        if (password) {
            log.debug(`Hashing password for user: ${username}`);
            user.password = await bcrypt.hash(password, 10);
        }

        await user.save();

        log.info(`${uuid ? 'Updated' : 'Created'} user '${username}' by ${req.session.user.username}`);
        req.session.successMessage = `${uuid ? 'Updated' : 'Created'} user '${username}' successfully!`;
        res.redirect('/admin');
    } catch (error) {
        log.error(`Failed to ${uuid ? 'edit' : 'create'} user '${username}'`);
        handleError(error, res, 'Failed to edit/add user');
    }
}

// Disable a user
async function disableUser(req, res) {
    const { uuid } = req.params;
    try {
        log.debug(`Fetching user with UUID: ${uuid}`);
        const user = await User.findByPk(uuid);
        if (!user) {
            log.warn(`User with UUID '${uuid}' not found`);
            throw new Error('User not found');
        }

        log.debug(`Disabling user: ${user.username}`);
        await user.destroy();

        log.info(`User '${user.username}' disabled by ${req.session.user.username}`);
        req.session.successMessage = `User '${user.username}' has been disabled successfully.`;
        res.redirect('/admin');
    } catch (error) {
        log.error(`Failed to disable user with UUID '${uuid}'`);
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
