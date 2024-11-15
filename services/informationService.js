// services/informationService.js
const Information = require('../models/Information');

const createInformation = async (data) => {
  try {
    const info = await Information.create(data);
    return info;
  } catch (error) {
    throw new Error('Error creating information: ' + error.message);
  }
};

const getInformationByTitle = async (uuid) => {
  try {
    const info = await Information.findOne({ where: { uuid } });
    if (!info) throw new Error('Information not found');
    return info;
  } catch (error) {
    throw new Error('Error fetching information: ' + error.message);
  }
};

const updateInformation = async (uuid, data) => {
  try {
    const [updated] = await Information.update(data, { where: { uuid } });
    if (!updated) throw new Error('Information not found or already updated');
    return true;
  } catch (error) {
    throw new Error('Error updating information: ' + error.message);
  }
};

// Retrieve all 
const getAll = async () => {
    try {
        return await Information.findAll();
    } catch (error) {
        throw new Error('Failed to retrieve information records: ' + error.message);
    }
}

module.exports = {
    createInformation,
    getInformationByTitle,
    updateInformation,
    getAll
};
