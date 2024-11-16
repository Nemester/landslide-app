const cors = require('cors');
const { isAuthenticated, isAdmin } = require('./authMiddleware');

module.exports = {
  corsMiddleware: cors(),
  isAuthenticated,
  isAdmin,
};
