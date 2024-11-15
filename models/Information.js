const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Information = sequelize.define('Information', {
    uuid: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV1,
        primaryKey: true
    },
    name: {
        type: Sequelize.TEXT,  // Text field for the information's name
        allowNull: false,
    },
    description: {
        type: Sequelize.TEXT,  // Optional text description of the information
    },
    value: {
        type: Sequelize.TEXT,  // The actual value of the information (e.g. numerical, string, etc.)
        allowNull: false,
    },
}, {
    paranoid: true, // Soft delete support
    underscored: true, // Use snake_case for column names
    freezeTableName: true, // Do not change table name to plural
    tableName: 'tb_information' // Custom table name
});

// Information.create({name: "Contactmail", value: "contact@somemail.com"})
// Information.create({name: "Contactphone", value: "081 123 45 56"})
// Information.create({name: "Contactaddress", value: "somewhere on this plante"})

module.exports = Information;
