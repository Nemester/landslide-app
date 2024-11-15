// src/routes/landslideRoutes.js
const express = require('express');
const router = express.Router();
const landslideController = require('../controllers/landslideController');

// Route to render the landslide submission form
router.get('/add', (req, res) => {
    res.render('submitLandslide'); // Assuming there's a 'submitLandslide.hbs' form
});

// Route to handle landslide form submission
router.post('/add', landslideController.submitLandslide);

router.get('/edit/:id', landslideController.displaySingleLandslide);
router.post('/edit/:id', landslideController.updateLandslide);
router.post('/delete/:id', landslideController.deleteLandslide);

module.exports = router;
