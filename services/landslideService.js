const Landslide = require('../models/Landslide');

// Helper function for geometry validation
function validateGeometry(geometry) {
    if (!geometry) throw new Error('Geometry is required');

    let parsedGeometry;
    try {
        parsedGeometry = JSON.parse(geometry);
    } catch (e) {
        throw new Error('Invalid geometry JSON');
    }

    if (parsedGeometry.type === "FeatureCollection") {
        parsedGeometry = parsedGeometry.features[0];
    }

    if (parsedGeometry.type !== "Feature" || !parsedGeometry.geometry) {
        throw new Error('Invalid geometry data');
    }

    return JSON.stringify(parsedGeometry);
}

// Create a new landslide record
async function createLandslide(data) {
    try {
        const landslide = await Landslide.create(data);
        return landslide;
    } catch (error) {
        throw new Error('Failed to create landslide record: ' + error.message);
    }
}

// Retrieve all landslides
async function getAllLandslides() {
    try {
        return await Landslide.findAll();
    } catch (error) {
        throw new Error('Failed to retrieve landslide records: ' + error.message);
    }
}

// Get a landslide by ID
async function getLandslideById(id) {
    try {
        return await Landslide.findByPk(id);
    } catch (error) {
        throw new Error('Error fetching landslide: ' + error.message);
    }
}

// Update a landslide record
async function updateLandslide(landslide, { volume, depth, width, description, geometry }) {
    if (geometry) {
        landslide.geometry = validateGeometry(geometry);
    }
    landslide.volume = volume;
    landslide.depth = depth;
    landslide.width = width;
    landslide.description = description;

    try {
        await landslide.save();
    } catch (error) {
        throw new Error('Error updating landslide record: ' + error.message);
    }
}

// Delete a landslide record
async function deleteLandslide(uuid) {
    try {
        const landslide = await Landslide.findOne({ where: { uuid } });
        if (!landslide) {
            throw new Error('Landslide not found');
        }
        await landslide.destroy();
        return true;
    } catch (error) {
        throw new Error('Failed to delete landslide: ' + error.message);
    }
}

// Get number of landslides for specific user
async function countByUser(userUUID) {
    try {
        return await Landslide.count({ where: { user_id: userUUID } });
    } catch (error) {
        throw new Error('Error counting landslides: ' + error.message);
    }
}

module.exports = {
    createLandslide,
    getAllLandslides,
    getLandslideById,
    updateLandslide,
    deleteLandslide,
    countByUser
};
