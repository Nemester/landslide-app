const landslideService = require('../services/landslideService');
const configurationService = require('../services/configurationService');
const { log, apilog } = require('../config/logger'); // Importing the logger

// Helper function for handling errors
function handleError(res, errorMessage, status = 500) {
    log.error(errorMessage);
    return res.status(status).render('error', { errorMessage });
}

// Helper function to calculate surface area and centroid
function calculateSurfaceAndCentroid(points) {
    const R = 6371000; // Earth's radius in meters

    if (points.length < 3) {
        throw new Error("A polygon must have at least three points");
    }

    const toRadians = (degrees) => (degrees * Math.PI) / 180;
    const toDegrees = (radians) => (radians * 180) / Math.PI;

    let area = 0; // To store the area
    let centroidX = 0; // Weighted sum of x-coordinates
    let centroidY = 0; // Weighted sum of y-coordinates
    let centroidZ = 0; // Weighted sum of z-coordinates (for spherical coordinates)

    for (let i = 0; i < points.length; i++) {
        const [lon1, lat1] = points[i];
        const [lon2, lat2] = points[(i + 1) % points.length]; // Next point (wrapping around)

        // Convert latitude/longitude to radians
        const lat1Rad = toRadians(lat1);
        const lat2Rad = toRadians(lat2);
        const lon1Rad = toRadians(lon1);
        const lon2Rad = toRadians(lon2);

        // Compute area using the shoelace formula
        const shoelaceFactor = (lon1Rad * lat2Rad - lon2Rad * lat1Rad);
        area += shoelaceFactor;

        // Centroid computation (weighted average of points)
        const avgLon = (lon1 + lon2) / 2;
        const avgLat = (lat1 + lat2) / 2;
        const weight = Math.abs(shoelaceFactor);

        centroidX += weight * Math.cos(toRadians(avgLat)) * Math.cos(toRadians(avgLon));
        centroidY += weight * Math.cos(toRadians(avgLat)) * Math.sin(toRadians(avgLon));
        centroidZ += weight * Math.sin(toRadians(avgLat));
    }

    // Normalize area
    area = Math.abs(area / 2);

    // Calculate centroid in spherical coordinates
    const totalWeight = Math.abs(area);
    centroidX /= totalWeight;
    centroidY /= totalWeight;
    centroidZ /= totalWeight;

    const centralLon = toDegrees(Math.atan2(centroidY, centroidX));
    const centralLat = toDegrees(Math.atan2(centroidZ, Math.sqrt(centroidX ** 2 + centroidY ** 2)));

    return { area: Math.round(area), centroid: { lat: centralLat, lon: centralLon } };
}

async function renderSubmitLandslide(req, res) {
    const { user } = req.session; // Destructure user from session
    res.render('submitLandslide', { user, mapcolor: configurationService.getConfigByName("mapcolor") }); // Assuming there's a 'submitLandslide.hbs' form
}

// Controller function to handle landslide form submission
async function submitLandslide(req, res) {
    const { geometry, volume, depth, width, description, date_occured } = req.body;

    if (!geometry || !volume || !depth || !width || !description || !date_occured) {
        log.warn('Missing required fields for landslide submission');
        return handleError(res, 'Missing required fields', 400);
    }

    try {
        log.debug('Parsing geometry to calculate surface area and centroid');
        const { area: surfaceArea, centroid } = calculateSurfaceAndCentroid(JSON.parse(geometry).geometry.coordinates[0]);

        log.info(`User ${req.session.user.username} is submitting a new landslide`);
        log.debug(`Calculated surface area: ${surfaceArea}, Centroid: lat=${centroid.lat}, lon=${centroid.lon}`);

        const landslide = await landslideService.createLandslide({
            geometry,
            volume,
            depth,
            width,
            description,
            date_occured,
            lat: centroid.lat,
            lon: centroid.lon,
            surface: surfaceArea,
            user_id: req.session.user.uuid,
        });

        log.info(`Landslide entry created successfully with ID: ${landslide.uuid}`);
        res.render('submitLandslide', { successMessage: 'Landslide record submitted successfully!' });
        // TODO: Redirect to the landslide overview page (or edit page)
    } catch (error) {
        log.error(`Failed to submit landslide: ${error.message}`);
        handleError(res, `Failed to submit landslide record: ${error.message}`);
    }
}

// Controller function to display a single landslide record
async function displaySingleLandslide(req, res) {
    const landslideId = req.params.id;

    try {
        const { user } = req.session; // Destructure user from session

        log.debug(`Fetching landslide with ID: ${landslideId}`);
        const landslide = await landslideService.getLandslideById(landslideId);
        
        if (!landslide) {
            log.warn(`Landslide not found: ${landslideId}`);
            return handleError(res, 'Landslide not found', 404);
        }

        const landslideData = landslide.get({ plain: true });
        const canEdit = req.session.user && (user.uuid === landslideData.user_id || user.is_admin);

        log.info(`User ${req.session.user.username} viewed landslide ${landslideData.uuid} (editable: ${canEdit})`);
        res.render('landslideDetail', 
            { 
                landslide: landslideData,
                user, 
                canEdit,
                mapcolor: configurationService.getConfigByName("mapcolor")
            });

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

async function renderLandslideMap(req, res) {
    try {
        const { user } = req.session; // Destructure user from session
        res.render('map', { user })
    } catch (error) {
        log.error(`Error rendering map page: ${error.message}`);
        handleError(res, 'Internal server error', 500);
    }
};


async function api_getDataLandslideMap(req, res) {
    const { startDate, endDate } = req.query;
    try {
        const landslides = await landslideService.getLandslidesByDateRange(startDate, endDate);
        apilog.debug(`Loaded landslides with filter start date: ${startDate} until end date ${endDate} (found ${landslides.length} matching datasets)`)
        res.status(200).json(landslides);
    } catch (error) {
        apilog.error(`Error fetching landslides for map: ${error.message}`);
        handleError(res, 'Internal server error', 500);
    }
};

module.exports = {
    renderSubmitLandslide,
    submitLandslide,
    displaySingleLandslide,
    updateLandslide,
    deleteLandslide,
    renderLandslideMap,
    api_getDataLandslideMap
};
