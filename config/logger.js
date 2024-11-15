var log4js = require('log4js');
require('dotenv').config();

log4js.configure({
  appenders: {
    console: {
      type: 'console',
      layout: {
        type: 'pattern',
        pattern: '%[[%d{yyyy-MM-dd hh:mm:ss}] [%p] -%] %m'
      }
    },
    file: {
      type: 'file',
      filename: process.env.LOGFILE,
      maxLogSize: parseInt(process.env.MAXLOGSIZE),
      backups: process.env.LOGBACKUPS,
      compress: process.env.LOGCOMPRESSION,
      layout: {
        type: 'pattern',
        pattern: '[%d{yyyy-MM-dd hh:mm:ss}] [%p] - %m'
      }
    }
  },
  categories: {
    main: {
      appenders: [process.env.LOGMODE],
      level: process.env.LOGLEVEL
    },
    web: {
      appenders: ["file"],
      // appenders: [process.env.LOGMODE], //TODO: Change this back before deploying to production
      level: process.env.LOGLEVEL
    },    
    default: {
      appenders: ['console'],
      level: process.env.LOGLEVEL
    }
  }
});

// Logger for system events
let log = log4js.getLogger('main');


let weblogger = log4js.getLogger('web');
// Connect middleware for express (HTTP logging)
let applogger = log4js.connectLogger(weblogger, {
  level: process.env.LOGLEVEL,
  format: (req, res, format) => format(`:remote-addr - :method :url :status :response-time ms - :user-agent`)
});

module.exports = {
  log,
  applogger,
};
