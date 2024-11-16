const landslideService = require('../services/landslideService');
const { log } = require('../config/logger'); // Importing the logger

// Helper function for handling errors
function handleError(res, errorMessage, status = 500) {
    log.error(errorMessage);
    return res.status(status).render('error', { errorMessage });
}

// Helper function to calculate surface area
function calculateSurfaceArea(points) {
    const R = 6371000; // Earth's radius in meters

    if (points.length < 3) {
        throw new Error("A polygon must have at least three points");
    }

    const toRadians = (degrees) => (degrees * Math.PI) / 180;

    const projectedPoints = points.map(([lon, lat]) => {
        const latRad = toRadians(lat);
        return {
            x: R * toRadians(lon) * Math.cos(latRad),
            y: R * latRad,
        };
    });

    let area = 0;
    for (let i = 0; i < projectedPoints.length; i++) {
        const j = (i + 1) % projectedPoints.length;
        area +=
            projectedPoints[i].x * projectedPoints[j].y -
            projectedPoints[j].x * projectedPoints[i].y;
    }

    return Math.round(Math.abs(area / 2));
}

// Controller function to handle landslide form submission
async function submitLandslide(req, res) {
    const { geometry, volume, depth, width, description, date_occured } = req.body;

    if (!geometry || !volume || !depth || !width || !description || !date_occured) {
        log.warn('Missing required fields for landslide submission');
        return handleError(res, 'Missing required fields', 400);
    }

    try {
        log.debug('Parsing geometry to calculate surface area');
        const surfaceArea = calculateSurfaceArea(JSON.parse(geometry).geometry.coordinates[0]);

        log.info(`User ${req.session.user.username} is submitting a new landslide`);
        log.debug(`Calculated surface area: ${surfaceArea}`);

        const landslide = await landslideService.createLandslide({
            geometry,
            volume,
            depth,
            width,
            description,
            date_occured,
            lat: 0,
            lon: 0,
            surface: surfaceArea,
            user_id: req.session.user.uuid,
        });

        log.info(`Landslide entry created successfully with ID: ${landslide.uuid}`);
        res.render('submitLandslide', { successMessage: 'Landslide record submitted successfully!' });

    } catch (error) {
        log.error(`Failed to submit landslide: ${error.message}`);
        handleError(res, `Failed to submit landslide record: ${error.message}`);
    }
}

// Controller function to display a single landslide record
async function displaySingleLandslide(req, res) {
    const landslideId = req.params.id;

    try {
        log.debug(`Fetching landslide with ID: ${landslideId}`);
        const landslide = await landslideService.getLandslideById(landslideId);

        if (!landslide) {
            log.warn(`Landslide not found: ${landslideId}`);
            return handleError(res, 'Landslide not found', 404);
        }

        const landslideData = landslide.get({ plain: true });
        const canEdit = req.session.user &&
            (req.session.user.id === landslideData.user_id || req.session.user.is_admin);

        log.info(`User ${req.session.user.username} viewed landslide ${landslideData.uuid}`);
        res.render('landslideDetail', { landslide: landslideData, canEdit });

    } catch (error) {
        log.error(`Error fetching landslide ${landslideId}: ${error.message}`);
        handleError(res, 'Error fetching landslide', 500);
    }
}

// Controller function to update a landslide
async function updateLandslide(req, res) {
    const landslideId = req.params.id;
    const { volume, depth, width, description, geometry } = req.body;

    try {
        log.debug(`Fetching landslide for update: ${landslideId}`);
        const landslide = await landslideService.getLandslideById(landslideId);

        if (!landslide) {
            log.warn(`Attempt to update non-existent landslide: ${landslideId}`);
            return handleError(res, 'Landslide not found', 404);
        }

        if (req.session.user.id !== landslide.user_id && !req.session.user.is_admin) {
            log.warn(`Unauthorized update attempt on landslide ${landslideId} by user ${req.session.user.username}`);
            return handleError(res, 'Permission denied to edit this landslide.', 403);
        }

        log.info(`Updating landslide ${landslideId} by user ${req.session.user.username}`);
        await landslideService.updateLandslide(landslide, { volume, depth, width, description, geometry });

        log.info(`Landslide ${landslide.uuid} updated successfully`);
        res.redirect(`/landslide/edit/${landslideId}`);

    } catch (error) {
        log.error(`Error updating landslide ${landslideId}: ${error.message}`);
        handleError(res, `Error updating landslide: ${error.message}`);
    }
}

// Controller function to handle deletion of a landslide
async function deleteLandslide(req, res) {
    const { id } = req.params;

    try {
        log.debug(`Fetching landslide for deletion: ${id}`);
        const landslide = await landslideService.getLandslideById(id);

        if (!landslide) {
            log.warn(`Attempt to delete non-existent landslide: ${id}`);
            return handleError(res, 'Landslide not found', 404);
        }

        if (req.session.user.id !== landslide.user_id && !req.session.user.is_admin) {
            log.warn(`Unauthorized delete attempt on landslide ${id} by user ${req.session.user.username}`);
            return handleError(res, 'Permission denied to delete this landslide.', 403);
        }

        await landslideService.deleteLandslide(id);
        log.info(`Landslide ${id} deleted by user ${req.session.user.username}`);
        req.session.successMessage = 'Landslide deleted successfully';
        res.redirect('/dashboard');

    } catch (error) {
        log.error(`Error deleting landslide ${id}: ${error.message}`);
        handleError(res, 'Internal server error', 500);
    }
}

module.exports = {
    submitLandslide,
    displaySingleLandslide,
    updateLandslide,
    deleteLandslide,
};
