// src/controllers/userController.js
const userService = require('../services/userService');
const landslideService = require('../services/landslideService');
const { log } = require('../config/logger');

// Display profile page with user details
async function showProfile(req, res) {
    const { uuid } = req.session.user;
    log.info(`Attempting to retrieve profile for user with UUID: ${uuid}`);

    try {
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
            lastPasswordChange: user.last_password_change,
            successMessage: req.session.successMessage,
            errorMessage: req.session.errorMessage
        });

         // Clear session messages after rendering
         req.session.successMessage = undefined;
         req.session.errorMessage = undefined;

        log.info(`Profile page displayed for user with UUID: ${uuid}`);
    } catch (error) {
        log.error(`Error loading profile page for UUID: ${uuid} - ${error.message}`);
        res.status(500).send('Error loading profile page: ' + error.message);
    }
}

// Handle user data update (e.g., name, email)
async function updateUser(req, res) {
    const { uuid } = req.session.user;
    const { firstname, lastname, email, username } = req.body;

    log.info(`Updating profile for user with UUID: ${uuid}`);
    log.debug(`Update data for user ${uuid}: ${JSON.stringify({ firstname, lastname, email, username })}`);

    try {
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
        // Ensure the user has permission to delete the user
        const userToDelete = await userService.findUserByUUID(id);
        if (!userToDelete) {
            req.session.errorMessage = `Error: Unable to find user with ID ${id}`;
            return res.redirect("/dashboard");
        }

        if (req.session.user.uuid !== userToDelete.uuid && !req.session.user.is_admin) {
            req.session.errorMessage = `You do not have permission to delete this user`;
            return res.redirect("/dashboard");
        }

        // Delete the user
        await userService.deleteUser(id);
        log.info(`User ${id} deleted by ${req.session.user.username}`);

        req.session.successMessage = `User successfully deleted.`;
        res.redirect('/dashboard');
    } catch (error) {
        log.error('Error deleting user:', error);
        req.session.errorMessage = `Internal server error.`;
        res.redirect("/dashboard");
    }
}


// Handle password change
async function changePassword(req, res) {
    const { uuid } = req.session.user;
    const { newPassword } = req.body;

    try {
        await userService.updatePassword(uuid, newPassword);
        req.session.successMessage = 'Password successfully updated.';
        res.redirect('/user');
    } catch (error) {
        log.error(`Error changing password for UUID: ${uuid} - ${error.message}`);
        req.session.errorMessage = 'Error changing password.';
        res.redirect('/user');
    }
}

module.exports = {
    showProfile,
    updateUser,
    deleteUser,
    changePassword
};
