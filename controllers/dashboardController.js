// src/controllers/dashboardController.js
const landslideService = require('../services/landslideService');
const { log } = require('../config/logger');

// Controller to render the dashboard page
async function renderDashboard(req, res) {
    const { user } = req.session;  // Destructure user from session

    log.info(`Rendering dashboard for user: ${user.username}`);

    try {
        let landslides = [];
        
        // Fetch landslides based on user's role (admin or regular user)
        if (user.is_admin) {
            // Admin can see all landslides
            landslides = await landslideService.getAllLandslides();
        } else {
            // Regular user can only see their landslides
            landslides = await landslideService.getLandslidesForUser(user.uuid);
        }

        // Render dashboard template with user and landslide data
        res.render('dashboard', {
            user,
            landslides,
            successMessage: req.session.successMessage, 
            errorMessage: req.session.errorMessage
        });

        // Clear the success and error messages from session after rendering
        req.session.successMessage = undefined;
        req.session.errorMessage = undefined;

    } catch (error) {
        // Log and handle any errors that occur during the dashboard rendering
        log.error(`Error fetching dashboard data for user ${user.username}: ${error.message}`);
        req.session.errorMessage = 'Error fetching data for dashboard';
        res.redirect('/dashboard');  // Redirect back to dashboard with error message
    }
}

module.exports = {
    renderDashboard
};
