// src/controllers/landslideController.js
const landslideService = require('../services/landslideService');
const { log } = require('../config/logger');  // Importing the logger

// Controller function to handle landslide form submission
async function submitLandslide(req, res) {
    const { geometry, volume, depth, width, description, date_occured } = req.body;

    try {
        log.info(`Received landslide submission from user ${req.session.user.username}`);  // Log incoming submission
        log.debug(`Landslide data: Geometry: ${geometry}, Volume: ${volume}, Depth: ${depth}, Width: ${width}`);  // Log the data being submitted

        // Create the landslide entry using the service
        const landslide = await landslideService.createLandslide({
            geometry,
            volume,
            depth,
            width,
            lat: 0,
            lon: 0,
            description,
            date_occured,
            user_id: req.session.user.uuid
        });

        log.info(`Landslide entry created successfully with ID: ${landslide.id}`);  // Log successful creation

        // Send a success message in the form
        res.render('submitLandslide', {
            successMessage: 'Landslide record submitted successfully!'
        });

    } catch (error) {
        log.error(`Failed to submit landslide record: ${error.message}`);  // Log error details
        res.status(500).render('submitLandslide', { errorMessage: 'Failed to submit landslide record' });
    }
}

// Controller function to display a single landslide record
async function displaySingleLandslide(req, res) {
    const landslideId = req.params.id;  // Get the ID from the URL parameter

    try {
        // Fetch the landslide record by ID using the landslideService
        const landslide = await landslideService.getLandslideById(landslideId);

        if (!landslide) {
            // If no landslide is found, return an error or render a not found message
            return res.status(404).render('error', { errorMessage: 'Landslide not found' });
        }
        // Ensure it's a plain object
        const landslideData = landslide.get({ plain: true });

        const canEdit = req.session.user && (req.session.user.id === landslideData.user_id || req.session.user.is_admin);

        // Log the action (for example, when a user views the landslide)
        log.debug(`User ${req.session.user.username} viewed landslide ${landslideData.uuid}`);

        // Render the page to display the single landslide record
        res.render('landslideDetail', { landslide: landslideData, canEdit });


    } catch (error) {
        log.error('Error fetching landslide:', error);
        res.status(500).render('error', { errorMessage: 'Internal server error' });
    }
}

async function updateLandslide(req, res) {
    const landslideId = req.params.id;
    const { volume, depth, width, description, geometry } = req.body;

    try {
        const landslide = await landslideService.getLandslideById(landslideId);
        if (!landslide) {
            return res.status(404).render('error', { errorMessage: 'Landslide not found' });
        }

        // Check if the logged-in user is the creator or an admin
        if (req.session.user.id !== landslide.user_id && !req.session.user.is_admin) {
            return res.status(403).render('error', { errorMessage: 'You do not have permission to edit this landslide.' });
        }

        // Update the landslide details
        landslide.volume = volume;
        landslide.depth = depth;
        landslide.width = width;
        landslide.description = description;

        // Check if geometry was provided
        if (geometry && geometry.trim() !== '') {
            // Parse the incoming geometry (it could be a FeatureCollection or Feature)
            let parsedGeometry = JSON.parse(geometry);

            // If it's a FeatureCollection, extract the first Feature
            if (parsedGeometry.type === "FeatureCollection") {
                parsedGeometry = parsedGeometry.features[0];
            }

            // If it's a valid Feature, update the geometry
            if (parsedGeometry.type === "Feature" && parsedGeometry.geometry) {
                landslide.geometry = JSON.stringify(parsedGeometry); // Save the geometry
            } else {
                return res.status(400).render('error', { errorMessage: 'Invalid geometry data' });
            }
        }

        // Save the updated landslide
        await landslide.save();

        // Log the update
        console.log(`Landslide ${landslide.uuid} updated by ${req.session.user.username}`);

        // Redirect back to the landslide detail page
        res.redirect(`/landslide/${landslideId}`);

    } catch (error) {
        log.error('Error updating landslide:', error);
        res.status(500).render('error', { errorMessage: 'Internal server error' });
    }
}

// Function to handle deletion of a landslide
async function deleteLandslide(req, res) {
    const { id } = req.params; // Get the UUID from URL parameters

    try {
        // Check if the logged-in user has permission to delete (creator or admin)
        const landslide = await landslideService.getLandslideById(id);
        if (!landslide) {
            req.session.errorMessage = `Error occured! Unable to find landslide with id ${id}`
            res.redirect("/dashboard")
        }

        if (req.session.user.id !== landslide.user_id && !req.session.user.is_admin) {
            req.session.errorMessage = `You do not have permission to delete this landslide`
            res.redirect("/dashboard")
        }

        // Call the service function to delete the landslide
        await landslideService.deleteLandslide(id);
        log.info(`Landslide ${id} deleted by ${req.session.user.username}`);

        req.session.successMessage = `Landslide deleted`
        res.redirect('/dashboard');
    } catch (error) {
        log.error('Error deleting landslide:', error);
        req.session.errorMessage = `Internal server error :(`
        res.redirect("/dashboard")
    }
}



module.exports = {
    submitLandslide,
    displaySingleLandslide,
    updateLandslide,
    deleteLandslide
};
