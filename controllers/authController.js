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
        log.info(`Login attempt for ${isEmail ? 'email' : 'username'}: ${identifier}`);

        // Find user by either email or username
        const user = await User.findOne({
            where: isEmail ? { email: identifier } : { username: identifier }
        });

        if (!user) {
            log.warn(`Failed login attempt: No user found with identifier: ${identifier}`);
            return res.status(401).render('login', { errorMessage: 'Invalid login credentials' });
        }

        // Check if the password is correct
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            log.warn(`Failed login attempt: Incorrect password for user ${identifier}`);
            return res.status(401).render('login', { errorMessage: 'Invalid login credentials' });
        }

        // Log successful login
        log.info(`User ${user.username} logged in successfully`);

        authService.setLastLogin(user.uuid)

        // Set session data
        req.session.user = {
            uuid: user.uuid,
            username: user.username,
            email: user.email,
            is_admin: user.is_admin
        };

        // Explicitly save the session (ensure session is persisted)
        req.session.save((err) => {
            if (err) {
                log.error('Error saving session:', err);  // Log session save error
                return res.status(500).render('login', { errorMessage: 'Error saving session' });
            }
            // After saving session, redirect to the dashboard
            log.info(`Session saved for user ${user.username}`);
            res.redirect('/dashboard');
        });

    } catch (error) {
        log.error("Login error:", error);  // Log any errors during the login process
        res.status(500).render('login', { errorMessage: 'Internal server error' });
    }
}

// Logout Controller
function logout(req, res) {
    // Log user logout attempt
    if (req.session.user) {
        log.info(`User ${req.session.user.username} logged out`);
    } else {
        log.warn('Logout attempt without an active session');
    }

    // Destroy the session and log out the user
    req.session.destroy((err) => {
        if (err) {
            log.error('Error during logout session destruction:', err);  // Log logout errors
            return res.status(500).render('login', { errorMessage: 'Failed to log out' });
        }
        log.info('Session destroyed successfully');
        res.redirect('/login'); // Redirect to the login page after logout
    });
}

module.exports = {
    login,
    logout
};
