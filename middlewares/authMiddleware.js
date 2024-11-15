const { log } = require('../config/logger');  // Import the logger


// Middleware to check if the user is authenticated
function isAuthenticated(req, res, next) {
    if (req.session && req.session.user) {
        
        log.info(`User ${req.session.user.username} is authenticated.`);
        return next(); // User is authenticated, proceed
    }
    // Log the attempt and redirect
    log.warn('Unauthenticated access attempt.');
    res.redirect('/login');
}

// Middleware to check if the user has admin privileges
function isAdmin(req, res, next) {
    if (req.session && req.session.user && req.session.user.is_admin === true) {
        log.info(`Admin access granted to user ${req.session.user.username}.`);
        return next(); // User is an admin, proceed
    }
    // Log the access denial and send a 403 Forbidden response
    log.error(`Access denied for user ${req.session.user ? req.session.user.username : 'Unknown user'}. Admins only.`);
    res.status(403).send('Access denied. Admins only.');
}

// Export the middleware functions
module.exports = {
    isAuthenticated,
    isAdmin
};
