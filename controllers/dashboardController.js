// src/controllers/dashboardController.js
const landslideService = require('../services/landslideService');
const { log } = require('../config/logger');

// Controller to render the dashboard page
async function renderDashboard(req, res) {
    const { user } = req.session; // Destructure user from session

    log.info(`User ${user.username} is accessing the dashboard`);

    try {
        let landslides = [];
        
        // Fetch landslides based on user's role (admin or regular user)
        if (user.is_admin) {
            log.debug('Fetching all landslides for admin user');
            landslides = await landslideService.getAllLandslides();
            log.debug(`Fetched ${landslides.length} landslides for admin user ${user.username}`);
        } else {
            log.debug(`Fetching landslides for regular user: ${user.username}`);
            landslides = await landslideService.getLandslidesForUser(user.uuid);
            log.debug(`Fetched ${landslides.length} landslides for user ${user.username}`);
        }

        // Render dashboard template with user and landslide data
        log.debug('Rendering dashboard page with user and landslide data');
        res.render('dashboard', {
            user,
            landslides,
            successMessage: req.session.successMessage,
            errorMessage: req.session.errorMessage
        });

        // Clear the success and error messages from session after rendering
        log.debug('Clearing success and error messages from session');
        req.session.successMessage = undefined;
        req.session.errorMessage = undefined;

        log.info(`Dashboard rendered successfully for user ${user.username}`);
    } catch (error) {
        // Log and handle any errors that occur during the dashboard rendering
        log.error(`Error fetching dashboard data for user ${user.username}: ${error.message}`);
        req.session.errorMessage = 'Error fetching data for dashboard';
        res.redirect('/dashboard'); // Redirect back to dashboard with error message
    }
}

module.exports = {
    renderDashboard
};
