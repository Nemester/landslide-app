// src/services/dashboardService.js
const Landslide = require('../models/Landslide');

// Service to fetch all landslides (could be filtered by user or any other criteria)
async function getLandslides() {
    try {
        const landslides = await Landslide.findAll();
        return landslides;
    } catch (error) {
        throw new Error(`Failed to fetch landslides: ${error.message}`);
    }
}

async function getLandslidesForUser(uuid) {
    try {
        // Fetch all landslides (customize this query based on user or criteria)
        const landslides = await Landslide.findAll({
            where: { user_id: uuid }
        },
        {plain:true}
    );
        return landslides;
    } catch (error) {
        throw new Error(`Failed to fetch landslides: ${error.message}`);
    }
}

module.exports = {
    getLandslides,
    getLandslidesForUser
};
