const https = require('https');
const http = require('http');
const fs = require('fs/promises');
const { log } = require('./logger');

const initializeServer = async (app) => {
  const { PORT, HOST, USESSL, KEY, CERT } = process.env;

  if (USESSL === '1') {
    try {
      const [key, cert] = await Promise.all([
        fs.readFile(KEY, 'utf8'),
        fs.readFile(CERT, 'utf8'),
      ]);
      const httpsServer = https.createServer({ key, cert }, app);
      httpsServer.listen(PORT, HOST, () => {
        log.info(`HTTPS server running at https://${HOST}:${PORT}`);
      });
    } catch (err) {
      log.error('Failed to start HTTPS server:', err);
      throw err;
    }
  } else {
    log.warn('Starting server over HTTP; traffic is not encrypted!');
    const httpServer = http.createServer(app);
    httpServer.listen(PORT, HOST, () => {
      log.info(`HTTP server running at http://${HOST}:${PORT}`);
    });
  }
};

module.exports = { initializeServer };
