const bcrypt = require('bcrypt');
const authService = require('../services/authService');
const User = require('../models/User');
const { log } = require('../config/logger');

// Login Controller
async function login(req, res) {
    const { identifier, password } = req.body;

    try {
        // Determine if the identifier is an email or username
        const isEmail = /\S+@\S+\.\S+/.test(identifier);
        log.info(`Login attempt detected for ${isEmail ? 'email' : 'username'}: ${identifier}`);

        // Find user by either email or username
        log.debug(`Searching user by ${isEmail ? 'email' : 'username'}: ${identifier}`);
        const user = await User.findOne({
            where: isEmail ? { email: identifier } : { username: identifier }
        });

        if (!user) {
            log.warn(`Login failed: No user found with identifier: ${identifier}`);
            return res.status(401).render('login', { errorMessage: 'Invalid login credentials' });
        }

        // Check if the password is correct
        log.debug(`Checking password for user: ${user.username}`);
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            log.warn(`Login failed: Incorrect password for user ${identifier}`);
            return res.status(401).render('login', { errorMessage: 'Invalid login credentials' });
        }

        // Log successful login
        log.info(`User ${user.username} logged in successfully`);
        log.debug(`Updating last login timestamp for user: ${user.uuid}`);
        await authService.setLastLogin(user.uuid);

        // Set session data
        log.debug(`Setting session data for user: ${user.username}`);
        req.session.user = {
            uuid: user.uuid,
            username: user.username,
            email: user.email,
            is_admin: user.is_admin
        };

        // Explicitly save the session (ensure session is persisted)
        req.session.save((err) => {
            if (err) {
                log.error('Error saving session:', err);
                return res.status(500).render('login', { errorMessage: 'Error saving session' });
            }
            // After saving session, redirect to the dashboard
            log.info(`Session successfully saved for user ${user.username}`);
            res.redirect('/dashboard');
        });

    } catch (error) {
        log.error('Login process encountered an error:', error);
        res.status(500).render('login', { errorMessage: 'Internal server error' });
    }
}

// Logout Controller
function logout(req, res) {
    // Log user logout attempt
    if (req.session.user) {
        log.info(`User ${req.session.user.username} initiated logout`);
    } else {
        log.warn('Logout attempt without an active session');
    }

    // Destroy the session and log out the user
    log.debug('Destroying session during logout');
    req.session.destroy((err) => {
        if (err) {
            log.error('Error during session destruction on logout:', err);
            return res.status(500).render('login', { errorMessage: 'Failed to log out' });
        }
        log.info('Session successfully destroyed. User logged out');
        res.redirect('/login'); // Redirect to the login page after logout
    });
}

module.exports = {
    login,
    logout
};
