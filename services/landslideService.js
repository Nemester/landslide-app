// src/services/landslideService.js
const Landslide = require('../models/Landslide');

// Function to create a new landslide record
async function createLandslide(data) {
    try {
        const landslide = await Landslide.create(data);
        return landslide;
    } catch (error) {
        throw new Error('Failed to create landslide record: ' + error.message);
    }
}

// Function to retrieve all landslide records
async function getAllLandslides() {
    try {
        const landslides = await Landslide.findAll();
        return landslides;
    } catch (error) {
        throw new Error('Failed to retrieve landslide records: ' + error.message);
    }
}

// Service function to get a landslide by ID
async function getLandslideById(id) {
    try {
        return landslide = await Landslide.findByPk(id);
    } catch (error) {
        console.error('Error fetching landslide from DB:', error);
        throw error;
    }
}

// Count landslides by user UUID
async function countByUser(userUUID) {
    try {
        return await Landslide.count({ where: { user_id: userUUID } });
    } catch (error) {
        throw new Error('Error counting landslides: ' + error.message);
    }
}

// Function to delete a landslide record by UUID
async function deleteLandslide(uuid) {
    try {
        const landslide = await Landslide.findOne({ where: { uuid } });

        if (!landslide) {
            throw new Error('Landslide not found');
        }

        await landslide.destroy(); // Deletes the record
        return true; // Indicate successful deletion
    } catch (error) {
        throw new Error('Failed to delete landslide record: ' + error.message);
    }
}

module.exports = {
    createLandslide,
    getAllLandslides,
    getLandslideById,
    countByUser,
    deleteLandslide
};
