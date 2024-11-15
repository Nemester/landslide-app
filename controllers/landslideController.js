const landslideService = require('../services/landslideService');
const { log } = require('../config/logger'); // Importing the logger

// Helper function for handling errors
function handleError(res, errorMessage, status = 500) {
    log.error(errorMessage);
    return res.status(status).render('error', { errorMessage });
}
function calculateSurfaceArea(points) {
    const R = 6371000; // Earth's radius in meters
  
    if (points.length < 3) {
      throw new Error("A polygon must have at least three points");
    }
  
    // Convert degrees to radians
    const toRadians = (degrees) => (degrees * Math.PI) / 180;
  
    // Project latitude/longitude to Cartesian plane in meters
    const projectedPoints = points.map(([lon, lat]) => {
      const latRad = toRadians(lat);
      return {
        x: R * toRadians(lon) * Math.cos(latRad),
        y: R * latRad,
      };
    });
  
    // Use Shoelace formula to calculate area
    let area = 0;
    for (let i = 0; i < projectedPoints.length; i++) {
      const j = (i + 1) % projectedPoints.length; // Wrap around to the first point
      area +=
        projectedPoints[i].x * projectedPoints[j].y -
        projectedPoints[j].x * projectedPoints[i].y;
    }
  
    return Math.round(Math.abs(area / 2)); // Return the absolute value of the area
  }

// Controller function to handle landslide form submission
async function submitLandslide(req, res) {
    const { geometry, volume, depth, width, description, date_occured } = req.body;

    // Validate request parameters
    if (!geometry || !volume || !depth || !width || !description || !date_occured) {
        return handleError(res, 'Missing required fields', 400);
    }
    try {
        const surfaceArea = calculateSurfaceArea(JSON.parse(geometry).geometry.coordinates[0]);

        log.info(`Received landslide submission from user ${req.session.user.username}`);
        log.debug(`Calculated surface for the landslide: ${surfaceArea}`)
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
            user_id: req.session.user.uuid
        });

        log.info(`Landslide entry created successfully with ID: ${landslide.uuid}`);
        res.render('submitLandslide', { successMessage: 'Landslide record submitted successfully!' });

    } catch (error) {
        handleError(res, `Failed to submit landslide record: ${error.message}`);
    }
}

// Controller function to display a single landslide record
async function displaySingleLandslide(req, res) {
    const landslideId = req.params.id;

    try {
        const landslide = await landslideService.getLandslideById(landslideId);

        if (!landslide) {
            return handleError(res, 'Landslide not found', 404);
        }

        const landslideData = landslide.get({ plain: true });
        const canEdit = req.session.user && (req.session.user.id === landslideData.user_id || req.session.user.is_admin);

        log.debug(`User ${req.session.user.username} viewed landslide ${landslideData.uuid}`);
        res.render('landslideDetail', { landslide: landslideData, canEdit });

    } catch (error) {
        handleError(res, 'Error fetching landslide', 500);
    }
}

async function updateLandslide(req, res) {
    const landslideId = req.params.id;
    const { volume, depth, width, description, geometry } = req.body;

    try {
        const landslide = await landslideService.getLandslideById(landslideId);

        if (!landslide) {
            return handleError(res, 'Landslide not found', 404);
        }

        // Check if the logged-in user is authorized to edit the landslide
        if (req.session.user.id !== landslide.user_id && !req.session.user.is_admin) {
            return handleError(res, 'Permission denied to edit this landslide.', 403);
        }

        // Update landslide details
        await landslideService.updateLandslide(landslide, { volume, depth, width, description, geometry });

        log.info(`Landslide ${landslide.uuid} updated by ${req.session.user.username}`);
        res.redirect(`/landslide/edit/${landslideId}`);

    } catch (error) {
        handleError(res, `Error updating landslide: ${error.message}`);
    }
}

// Controller function to handle deletion of a landslide
async function deleteLandslide(req, res) {
    const { id } = req.params;

    try {
        const landslide = await landslideService.getLandslideById(id);
        if (!landslide) {
            return handleError(res, 'Landslide not found', 404);
        }

        if (req.session.user.id !== landslide.user_id && !req.session.user.is_admin) {
            return handleError(res, 'Permission denied to delete this landslide.', 403);
        }

        await landslideService.deleteLandslide(id);
        log.info(`Landslide ${id} deleted by ${req.session.user.username}`);
        req.session.successMessage = 'Landslide deleted';
        res.redirect('/dashboard');

    } catch (error) {
        handleError(res, 'Internal server error', 500);
    }
}

module.exports = {
    submitLandslide,
    displaySingleLandslide,
    updateLandslide,
    deleteLandslide
};
