const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const path = require('path');

const configureSession = () => {
  const { DATABASE, SESSIONSECRET, USESSL, MAXSESSIONAGE } = process.env;

  return session({
    store: new SQLiteStore({
      dir: path.dirname(DATABASE),
      db: path.basename(DATABASE),
      table: 'tb_sessions',
    }),
    name: 'landscape-record-system',
    secret: SESSIONSECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: MAXSESSIONAGE * 60 * 60 * 1000,
      sameSite: true,
      secure: USESSL === '1',
    },
  });
};

module.exports = { configureSession };
