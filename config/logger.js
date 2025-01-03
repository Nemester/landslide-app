const log4js = require('log4js');
require('dotenv').config();

// Ensure environment variables are set
const LOGLEVEL = process.env.LOGLEVEL || 'info';
const LOGFILE = process.env.LOGFILE || 'logs/app.log';
const MAXLOGSIZE = parseInt(process.env.MAXLOGSIZE, 10) || 10485760;  // Default: 10MB
const LOGBACKUPS = parseInt(process.env.LOGBACKUPS, 10) || 3;
const LOGCOMPRESSION = process.env.LOGCOMPRESSION === 'true';

// Log layout pattern
const logLayoutPattern = '[%d{yyyy-MM-dd hh:mm:ss}] [%p] - %m';
const logLayoutPatternAPI = '%[[%d{yyyy-MM-dd hh:mm:ss}] [%p] - API -%] %m';

// Configure log4js
log4js.configure({
  appenders: {
    console: {
      type: 'console',
      layout: {
        type: 'pattern',
        pattern: `%[[%d{yyyy-MM-dd hh:mm:ss}] [%p] -%] %m`
      }
    },
    file: {
      type: 'file',
      filename: LOGFILE,
      maxLogSize: MAXLOGSIZE,
      backups: LOGBACKUPS,
      compress: LOGCOMPRESSION,
      layout: {
        type: 'pattern',
        pattern: logLayoutPattern
      }
    },
    consoleapi: {
      type: 'console',
      layout: {
        type: 'pattern',
        pattern: logLayoutPatternAPI
      }
    },
    fileapi: {
      type: 'file',
      filename: LOGFILE,
      maxLogSize: MAXLOGSIZE,
      backups: LOGBACKUPS,
      compress: LOGCOMPRESSION,
      layout: {
        type: 'pattern',
        pattern: logLayoutPatternAPI
      }
    }
  },
  categories: {
    main: {
      appenders: ['console', 'file'],
      level: LOGLEVEL
    },
    api: {
      appenders: ['consoleapi', 'fileapi'],
      level: LOGLEVEL
    },
    web: {
      appenders: ['file'],
      level: LOGLEVEL
    },
    default: {
      appenders: ['console'],
      level: LOGLEVEL
    }
  }
});

// System logger for events
const log = log4js.getLogger('main');

// System logger for events
const apilog = log4js.getLogger('api');

// Web logger for HTTP requests
const weblogger = log4js.getLogger('web');

// Connect middleware for express (HTTP logging)
const applogger = log4js.connectLogger(weblogger, {
  level: LOGLEVEL,
  format: (req, res, format) => format(':remote-addr - :method :url :status :response-time ms - :user-agent')
});

const setupLogging = (app) => {
  app.use(applogger);
};

module.exports = {
  setupLogging,
  log,
  apilog,
  applogger,
};
