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
            return res.status(404).render('error', { errorMessage: "User not found" });
        }

        const landslideCount = await landslideService.countByUser(uuid);
        log.debug(`Landslide count for user ${uuid}: ${landslideCount}`);

        res.render('profile', {
            user: req.session.user,
            landslideCount,
            lastLogin: user.last_login,
            lastPasswordChange: user.last_password_change,
            successMessage: req.session.successMessage,
            errorMessage: req.session.errorMessage,
        });

        req.session.successMessage = undefined;
        req.session.errorMessage = undefined;

        log.info(`Profile page successfully displayed for user with UUID: ${uuid}`);
    } catch (error) {
        log.error(`Error loading profile page for UUID: ${uuid} - ${error.message}`);
        res.status(500).render('error', { errorMessage: `Error loading profile: ${error.message}` });
    }
}

// Handle user data update (e.g., name, email)
async function updateUser(req, res) {
    const { uuid } = req.session.user;
    const { firstname, lastname, email, username } = req.body;

    log.info(`User ${uuid} requested profile update`);
    log.debug(`Update data: ${JSON.stringify({ firstname, lastname, email, username })}`);

    try {
        await userService.updateUser(uuid, { firstname, lastname, email, username });
        log.info(`Profile updated successfully for user with UUID: ${uuid}`);
        req.session.successMessage = 'Profile updated successfully.';
        res.redirect('/user');
    } catch (error) {
        log.error(`Error updating profile for UUID: ${uuid} - ${error.message}`);
        req.session.errorMessage = 'Error updating profile.';
        res.redirect('/user');
    }
}

// Handle user deletion
async function deleteUser(req, res) {
    const { id } = req.params;

    log.info(`Delete user request for ID: ${id} by user ${req.session.user.username}`);

    try {
        const userToDelete = await userService.findUserByUUID(id);
        if (!userToDelete) {
            log.warn(`User with ID ${id} not found for deletion`);
            req.session.errorMessage = `Error: Unable to find user with ID ${id}`;
            return res.redirect("/dashboard");
        }

        if (req.session.user.uuid !== userToDelete.uuid && !req.session.user.is_admin) {
            log.warn(`Unauthorized delete attempt on user ${id} by ${req.session.user.username}`);
            req.session.errorMessage = `You do not have permission to delete this user.`;
            return res.redirect("/dashboard");
        }

        await userService.deleteUser(id);
        log.info(`User ${id} deleted successfully by ${req.session.user.username}`);
        req.session.successMessage = 'User successfully deleted.';
        res.redirect('/dashboard');
    } catch (error) {
        log.error(`Error deleting user ${id} - ${error.message}`);
        req.session.errorMessage = 'Internal server error during user deletion.';
        res.redirect("/dashboard");
    }
}

// Handle password change
async function changePassword(req, res) {
    const { uuid } = req.session.user;
    const { newPassword } = req.body;

    log.info(`Password change requested for UUID: ${uuid}`);

    try {
        await userService.updatePassword(uuid, newPassword);
        log.info(`Password updated successfully for UUID: ${uuid}`);
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
    changePassword,
};
