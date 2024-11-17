const Configuration = require('../models/Configuration');

// Store the configuration data in memory
let configCache = {};

// Function to load configuration from the database
async function loadConfiguration() {
    try {
        const configurations = await Configuration.findAll();
        configCache = {}; // Reset the cache before reloading
        configurations.forEach(config => {
            configCache[config.uuid] = {
                uuid: config.uuid,
                name: config.name,
                value: config.value,
                description: config.description,
                category: config.category,
                possible_values: config.possible_values,
                default_value: config.default_value,
            };
        });
    } catch (error) {
      throw new Error('Error loading configuration: ' + error.message);
    }
}

// Function to reload configuration from the database
async function reloadConfiguration() {
    await loadConfiguration(); // Re-load the configuration
}

// Function to access a specific configuration
function getConfigByUUID(uuid) {
    return configCache[uuid];  // Retrieve the configuration by name
}

// Function to access a configuration by its value
function getConfigByName(name) {
  // Iterate through the configCache to find matching name(s)
  for (const [uuid, config] of Object.entries(configCache)) {
      if (config.name === name) {
          return { uuid, ...config }; // Return the name and configuration details
      }
  }
  return null;  // If not found
}

// Optionally, you can provide a function to access all configurations
function getAllConfigs() {
    return configCache;
}

const updateConfiguration = async (uuid, data) => {
  try {
    const [updated] = await Configuration.update(data, { where: { uuid } });
    if (!updated) throw new Error('Configuration not found or already updated');
    await reloadConfiguration()
    return true;
  } catch (error) {
    throw new Error('Error updating configuration: ' + error.message);
  }
};

// Initialize the configuration on startup
loadConfiguration();

// Exporting the methods
module.exports = {
    loadConfiguration,
    reloadConfiguration,
    getConfigByUUID,
    getConfigByName,
    getAllConfigs,
    updateConfiguration
};