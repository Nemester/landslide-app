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
    }
  },
  categories: {
    main: {
      appenders: ['console', 'file'],
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

// Web logger for HTTP requests
const weblogger = log4js.getLogger('web');

// Connect middleware for express (HTTP logging)
const applogger = log4js.connectLogger(weblogger, {
  level: LOGLEVEL,
  format: (req, res, format) => format(':remote-addr - :method :url :status :response-time ms - :user-agent')
});

module.exports = {
  log,
  applogger,
};
