require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const path = require('path');
const favicon = require('serve-favicon');
const { initializeDatabase } = require('./config/dbInit');
const { initializeServer } = require('./config/serverInit');
const { setupLogging, log } = require('./config/logger');
const { configureSession } = require('./config/sessionConfig');
const routes = require('./routes');
const middlewares = require('./middlewares');
const { formatStartupTime } = require('./utils/formatters');

const app = express();
const startTime = process.hrtime();

// Setup Logging
setupLogging(app);
log.info("---------------------------------------");
log.info("Starting up.");
log.debug("Logger initialized.");


// Middleware
log.debug("Loading middlewares...");
// Helmet configuration
const helmetConfig = {
  contentSecurityPolicy: {
      directives: {
          defaultSrc: ["'self'"],
          scriptSrc: [
              "'self'", 
              "https://unpkg.com", 
              "https://cdnjs.cloudflare.com", 
              "'unsafe-inline'"
          ],
          styleSrc: [
              "'self'", 
              "https://unpkg.com", 
              "https://cdnjs.cloudflare.com", 
              "'unsafe-inline'"
          ],
          imgSrc: [
            "'self'", 
            "data:", 
            "https://a.tile.openstreetmap.org", 
            "https://b.tile.openstreetmap.org", 
            "https://c.tile.openstreetmap.org",
            "https://unpkg.com"
        ],
          connectSrc: ["'self'"],
          fontSrc: ["'self'", "https://cdnjs.cloudflare.com"],
          objectSrc: ["'none'"],
          upgradeInsecureRequests: []
      }
  },
  // Problem is that leaflet loads data from openstreetmap and there is a header missing and I cant manipulate the dynamically loaded html tags (now)
  crossOriginEmbedderPolicy: { policy: 'unsafe-none' },  // Relax the CORP policy: this is not ideal but does the trick for now
  referrerPolicy: { policy: 'no-referrer' }
};


app.use(helmet(helmetConfig));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname, 'public/img/favicon.ico')));
app.use(middlewares.corsMiddleware);
log.debug("Middlewares initialized");

// Session
log.debug("Setting up sessions...");
app.use(configureSession());
log.debug("Sessions initialized");

// Handlebars View Engine
log.debug("Configuring view engine...");
require('./config/viewEngine')(app);
log.debug("view engine initialized");

// Routes
log.debug("Importing routes...");
routes(app);
log.debug("Routes initialized");

// Initialize Database and Server
(async () => {
  try {
    await initializeDatabase();
    await initializeServer(app);
    const [seconds, nanoseconds] = process.hrtime(startTime);
    log.info(`Startup completed in ${formatStartupTime(seconds, nanoseconds)}`);
    log.debug(`Running with PID: ${process.pid}`);
    log.info("---------------------------------------");
  } catch (err) {
    log.error('Error during initialization:', err);
    process.exit(1);
  }
})();