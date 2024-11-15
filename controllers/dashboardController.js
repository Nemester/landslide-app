// src/controllers/dashboardController.js
const dashboardService = require('../services/dashboardService');
const { log } = require('../config/logger'); // Assuming logger is set up

// Controller to render the dashboard page
async function renderDashboard(req, res) {
    try {
        // Get the logged-in user's details from session
        const user = req.session.user;

        log.info(`Rendering dashboard for user: ${user.username}`);

        // Fetch landslides using the dashboard service
        let landslides = null;
        if(req.session.user.is_admin){
            landslides = await dashboardService.getLandslides();
        }else{
            landslides = await dashboardService.getLandslidesForUser(user.uuid);
            console.log(req.session.user)
        }


        // Render dashboard template with user and landslide data
        res.render('dashboard', {
            user,
            landslides,
            successMessage: req.session.successMessage, 
            errorMessage: req.session.errorMessage
        });
        req.session.successMessage = undefined
        req.session.errorMessage = undefined

    } catch (error) {
        log.error(`Error fetching dashboard data: ${error.message}`);
        res.status(500).send('Error fetching data for dashboard');
    }
}

module.exports = {
    renderDashboard
};
