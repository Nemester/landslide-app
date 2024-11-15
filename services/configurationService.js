// services/configurationService.js
const Configuration = require('../models/Configuration');

const createConfiguration = async (data) => {
  try {
    const config = await Configuration.create(data);
    return config;
  } catch (error) {
    throw new Error('Error creating configuration: ' + error.message);
  }
};

const getConfigurationByKey = async (uuid) => {
  try {
    const config = await Configuration.findOne({ where: { uuid } });
    if (!config) throw new Error('Configuration not found');
    return config;
  } catch (error) {
    throw new Error('Error fetching configuration: ' + error.message);
  }
};

const updateConfiguration = async (uuid, data) => {
  try {
    const [updated] = await Configuration.update(data, { where: { uuid } });
    if (!updated) throw new Error('Configuration not found or already updated');
    return true;
  } catch (error) {
    throw new Error('Error updating configuration: ' + error.message);
  }
};

// Retrieve all 
const getAll = async () => {
    try {
        return await Configuration.findAll();
    } catch (error) {
        throw new Error('Failed to retrieve configuration records: ' + error.message);
    }
}


module.exports = {
    createConfiguration,
    getConfigurationByKey,
    updateConfiguration,
    getAll
 };
