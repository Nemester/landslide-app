// src/controllers/userController.js
const userService = require('../services/userService');
const landslideService = require('../services/landslideService'); // Assuming there's a service for landslide data
const { log } = require('../config/logger'); // Assuming logger is set up

// Display profile page with user details
async function showProfile(req, res) {
    try {
        const { uuid } = req.session.user;
        log.info(`Attempting to retrieve profile for user with UUID: ${uuid}`);

        const user = await userService.findUserByUUID(uuid);
        if (!user) {
            log.warn(`User not found for UUID: ${uuid}`);
            return res.status(404).send("User not found.");
        }

        // Get landslide count by user
        const landslideCount = await landslideService.countByUser(uuid);
        log.debug(`Landslide count for user ${uuid}: ${landslideCount}`);

        res.render('profile', {
            user: req.session.user,
            landslideCount,
            lastLogin: user.last_login,
            lastPasswordChange: user.last_password_change
        });

        log.info(`Profile page displayed for user with UUID: ${uuid}`);
    } catch (error) {
        log.error(`Error loading profile page for UUID: ${uuid} - ${error.message}`);
        res.status(500).send('Error loading profile page: ' + error.message);
    }
}

// Handle user data update (e.g., name, email)
async function updateUser(req, res) {
    try {
        const { uuid } = req.session.user;
        const { firstname, lastname, email, username } = req.body;

        log.info(`Updating profile for user with UUID: ${uuid}`);
        log.debug(`Update data for user ${uuid}: ${JSON.stringify({ firstname, lastname, email, username })}`);

        // Update user details
        await userService.updateUser(uuid, { firstname, lastname, email, username });

        log.info(`Profile successfully updated for user with UUID: ${uuid}`);
        res.redirect('/user');
    } catch (error) {
        log.error(`Error updating profile for UUID: ${uuid} - ${error.message}`);
        res.status(500).send('Error updating profile: ' + error.message);
    }
}

// Function to handle deletion of a user
async function deleteUser(req, res) {
    const { id } = req.params; // Get the UUID from URL parameters

    try {
        // Check if the logged-in user has permission to delete (creator or admin)
        const user = await userService.findUserByUUID(id);
        if (!user) {
            req.session.errorMessage = `Error occured! Unable to find user with id ${id}`
            res.redirect("/dashboard")
        }

        if (req.session.user.id !== user.user_id && !req.session.user.is_admin) {
            req.session.errorMessage = `You do not have permission to delete this user`
            res.redirect("/dashboard")
        }

        // Call the service function to delete the user
        await userService.deleteUser(id);
        log.info(`user ${id} deleted by ${req.session.user.username}`);

        req.session.successMessage = `User deleted`
        res.redirect('/dashboard');
    } catch (error) {
        log.error('Error deleting user:', error);
        req.session.errorMessage = `Internal server error :(`
        res.redirect("/dashboard")
    }
}

module.exports = {
    showProfile,
    updateUser,
    deleteUser
};
