// routes/about.js

const express = require('express');
const router = express.Router();
const Information = require('../models/Information'); 
const log = require('../config/logger').log; // Custom logger, if available
const { isAuthenticated } = require('../middlewares/authMiddleware');

router.get('/about', isAuthenticated, async (req, res) => {
    try {
        // Fetch all information records from the database
        const information = await Information.findAll({ raw: true });

        // Convert array of information to an object keyed by name
        const infoData = {};
        information.forEach(info => {
            infoData[info.name] = info.value;
        });

        log.info('About page loaded with information data');  // Log the access
        res.render('about', { infoData });  // Pass information data to the template
    } catch (error) {
        log.error('Failed to load information for About page:', error);
        res.status(500).send('Error loading About page');
    }
});

router.get('/help', isAuthenticated, async (req, res) => {
    try {
        res.render('help');  // Pass information data to the template
    } catch (error) {
        log.error('Failed to load information for Help page:', error);
        res.status(500).send('Error loading Help page');
    }
});

router.get('/contact', isAuthenticated, async (req, res) => {
    try {
        // Fetch all information records from the database
        const information = await Information.findAll({ raw: true });

        // Convert array of information to an object keyed by name
        const infoData = {};
        information.forEach(info => {
            infoData[info.name] = info.value;
        });
        res.render('contact', {infoData});  // Pass information data to the template
    } catch (error) {
        log.error('Failed to load information for contact page:', error);
        res.status(500).send('Error loading contact page');
    }
});

router.get('/', isAuthenticated, async (req, res) => {
    res.redirect('/dashboard')
});

router.get('/error/404', isAuthenticated, async (req, res) => {
    res.render('404', {layout: "empty"})
});

module.exports = router;
