const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Assuming you have a database configuration file
const User = require('./User');
const Landslide = sequelize.define('Landslide', {
    uuid: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV1,
        primaryKey: true
    },
    lat: {
        type: Sequelize.FLOAT,
        allowNull: false,
    },
    lon: {
        type: Sequelize.FLOAT,
        allowNull: false,
    },
    date_occured: {
        type: Sequelize.DATE,
        allowNull: false,
    },
    volume: {
        type: Sequelize.FLOAT, // Using FLOAT for numeric volume
        allowNull: false,
    },
    depth: {
        type: Sequelize.FLOAT, // Numeric field for depth
        allowNull: true,
    },
    width: {
        type: Sequelize.FLOAT, // Numeric field for width
        allowNull: true,
    },
    surface: {
        type: Sequelize.FLOAT, // Numeric field for surface
        allowNull: true,
    },
    description: {
        type: Sequelize.TEXT, // Optional description field
        allowNull: true,
    },
    geometry: {
        type: Sequelize.TEXT, // JSON data for shape coordinates
        allowNull: true,      // Or Sequelize.JSON if database supports JSON type
    },
}, {
    paranoid: true,
    underscored: true,
    freezeTableName: true,
    tableName: 'tb_landslide'
});

// Landslide.hasOne(User, { foreignKey: 'user_id', as: 'creator' });
Landslide.belongsTo(User, {
    foreignKey: 'user_id',
      as: 'creator'
  });
module.exports = Landslide;
