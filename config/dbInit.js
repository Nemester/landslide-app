const sequelize = require('./database');
const { log } = require('./logger');

const initializeDatabase = async () => {
  try {
    await sequelize.sync({ force: false }); // Set `force: true` to drop and recreate tables
    log.info('Database synced successfully');
  } catch (err) {
    log.error('Database sync failed:', err);
    throw err;
  }
};

module.exports = { initializeDatabase };