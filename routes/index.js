const authRoutes = require('./authRoutes');
const landslideRoutes = require('./landslideRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const adminRoutes = require('./adminRoutes');
const userRoutes = require('./userRoutes');
const router = require('./router');

module.exports = (app) => {
  app.use(authRoutes);
  app.use('/landslide', landslideRoutes);
  app.use('/dashboard', dashboardRoutes);
  app.use('/user', userRoutes);
  app.use('/admin', adminRoutes);
  app.use('/', router);
};
