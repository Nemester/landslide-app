// https://www.atlantic.net/dedicated-server-hosting/how-to-configure-reverse-proxy-for-node-js-application-using-apache-on-ubuntu/

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const exphbs = require('express-handlebars');
const favicon = require('serve-favicon');
const https = require('https');
const http = require('http');
const fs = require('fs');
const dayjs = require('dayjs');
const session = require('express-session');
var SQLiteStore = require('connect-sqlite3')(session);
const { isAuthenticated, isAdmin } = require('./middlewares/authMiddleware');

var start = new Date().getTime();

const logger = require('./config/logger.js')
const models = require('./config/database.js');
const router = require('./routes/router.js');
const authRoutes = require('./routes/authRoutes');
const landslideRoutes = require('./routes/landslideRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const adminRoutes = require('./routes/adminRoutes');
const userRoutes = require('./routes/userRoutes');

let log = logger.log
let cfg = {}
log.debug('starting up adoc with following configuration (.env):');
['PORT', 'HOST', 'SESSIONSECRET', 'MAXSESSIONAGE', 'MAXREQUESTS', 'DATALIMIT', 'STARTUPDELAY', 'USESSL', 'CERT', 'KEY', 'DATABASE', 'DIALECT', 'SQLLogging', 'LOGLEVEL', 'MAXLOGSIZE', 'LOGBACKUPS', 'LOGCOMPRESSION', 'SYSLOG', 'SYSLOGFILE', 'WEBLOG', 'WEBLOGFILE'].forEach((key) => {
  log.debug(`\t${key.padEnd(15, ' ')} = ${process.env[key]}`)
  cfg[key] = process.env[key]
});

const sequelize = require('./config/database.js'); // Ensure this is the path to your database config
const User = require('./models/User');
const Landslide = require('./models/Landslide');
const Information = require('./models/Information');
const Configuration = require('./models/Configuration');

// Sync models
sequelize.sync({ force: false })  // Set `force: true` to drop and recreate the tables (caution with production data)
    .then(() => {
        log.info('Database synced');
    })
    .catch(err => {
        log.error('Error syncing database:', err);
    });



const app = express();
app.use(logger.applogger)

// Session stuff

app.use(session({
    store: new SQLiteStore({
    dir: path.parse(process.env.DATABASE).dir,
    db: path.parse(process.env.DATABASE).base,
    table: 'tb_sessions'
  }),
  name: 'landscape-record-system',
  secret: process.env.SESSIONSECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: process.env.MAXSESSIONAGE * 60 * 60 * 1000, // Session duration
    sameSite: true,
    secure: process.env.USESSL === '1' ? true : false
  }
}));

//needed so that variables are accessible in the handlebar templates
app.use((req, res, next) => {
  res.locals.user = req.session.user || null; // Add user info from session (or null if not logged in)
  next();
});
// enabling CORS for all requests
app.use(cors());

// JSON
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(express.json());

// configuring the static directory
app.use(express.static(__dirname + '/public'));

// Views
app.engine('handlebars', exphbs.engine({
    defaultLayout: "main",
    extname: ".hbs",
    helpers: {
      formatDate: (date) => {
        return dayjs(date).format('YYYY-MM-DD');
      },
      formatDateTime: (date) => {
        return dayjs(date).format('YYYY-MM-DD HH:mm');
      }
    }
    // helpers: require("./public/js/helpers.js").helpers
}));
app.set('view engine', 'handlebars');

// Icon
app.use(favicon(__dirname + '/public/img/favicon.ico'));

// Use the imported routes
app.use(authRoutes);
app.use('/landslide', isAuthenticated, landslideRoutes);
app.use('/dashboard', isAuthenticated,dashboardRoutes);
app.use('/user', isAuthenticated, userRoutes);
app.use('/admin', isAuthenticated, isAdmin, adminRoutes);

app.use('/', router);

if (process.env.USESSL == 1) {
  log.info('Starting up over HTTPS')
  log.debug(`Reading certificate [${process.env.CERT}] and private key [${process.env.KEY}] from filesystem`)
  let options = {
    key: fs.readFileSync(process.env.KEY, 'utf8'),
    cert: fs.readFileSync(process.env.CERT, 'utf8')
  };
  log.debug('Starting up server...')
  let httpsServer = https.createServer(options, app);
  httpsServer.listen(process.env.PORT, process.env.HOST);
  log.debug('Server started')
} else {
  log.warn('Starting up over HTTP, the network traffic won\'t be encrypted!')
  log.debug('Starting up server...')
  let httpServer = http.createServer(app);
  httpServer.listen(process.env.PORT, process.env.HOST);
  log.debug('Server started')
}




log.info(`Started on ${process.env.USESSL == 1 ? 'https' : 'http'}://${process.env.HOST}:${process.env.PORT}`)
log.debug(`PID: ${process.pid}`);

let end = new Date().getTime();
log.info(`Startup took ${(end - start) / 1000} seconds`)
log.info('-----------------------------------------------------');
