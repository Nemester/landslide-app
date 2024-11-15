// src/services/authService.js
const bcrypt = require('bcrypt');
const User = require('../models/User');

// Authenticate user by verifying credentials
async function authenticateUser(username, password) {
    try {
        // Find user by username
        const user = await User.findOne({ where: { username } });
        if (!user) {
            throw new Error('User not found');
        }

        // Check if password matches
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new Error('Invalid password');
        }

        // Update last_login date
        user.last_login = new Date();
        await user.save();

        return user;
    } catch (error) {
        throw new Error('Authentication failed: ' + error.message);
    }
}

// Logout logic (clearing session is handled in the controller)
function logoutUser(req) {
    req.session.destroy();  // End the session
}

async function setLastLogin(userUUID) {
    try {
        await User.update(
            { last_login: new Date() },  // Set last login to current date/time
            { where: { uuid: userUUID } }
        );
    } catch (error) {
        throw new Error('Error updating last login: ' + error.message);
    }
}

module.exports = {
    authenticateUser,
    logoutUser,
    setLastLogin
};
