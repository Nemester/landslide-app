const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: process.env.DATABASE,
  logging: process.env.SQLLogging == 1 ? console.log : false,
  retry: {
    max: 5,
    match: [
      'SQLITE_BUSY: database is locked.'
    ]
  },
});

module.exports = sequelize;