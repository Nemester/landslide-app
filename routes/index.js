const authRoutes = require('./authRoutes');
const landslideRoutes = require('./landslideRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const adminRoutes = require('./adminRoutes');
const userRoutes = require('./userRoutes');
const router = require('./router');
const { isAuthenticated, isAdmin } = require('../middlewares/authMiddleware');
module.exports = (app) => {
  app.use(authRoutes);
  app.use('/landslide', isAuthenticated, landslideRoutes);
  app.use('/dashboard', isAuthenticated, dashboardRoutes);
  app.use('/user', isAuthenticated, userRoutes);
  app.use('/admin', isAuthenticated, isAdmin, adminRoutes);
  app.use('/', router);
};
