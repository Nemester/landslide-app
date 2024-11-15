const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Configuration = sequelize.define('Configuration', {
    uuid: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV1,
        primaryKey: true
    },
    name: {
        type: Sequelize.TEXT,  // Name of the configuration parameter
        allowNull: false,
    },
    value: {
        type: Sequelize.TEXT,  // The value for the configuration parameter
        allowNull: false,
    },
    description: {
        type: Sequelize.TEXT,  // Optional description of what this configuration is about
    },
    category: {
        type: Sequelize.TEXT,  // The category or group of the configuration parameter
        allowNull: false,
    },
    possible_values: {
        type: Sequelize.TEXT,  // Possible values for the parameter, could be a JSON or CSV string
    },
    default_value: {
        type: Sequelize.TEXT,  // Default value for the configuration
    }
}, {
    paranoid: true, // Soft delete support
    underscored: true, // Use snake_case for column names
    freezeTableName: true, // Do not change table name to plural
    tableName: 'tb_configuration' // Custom table name
});

// Configuration.create({name: "notificationmail", value: "sonder.manuel@gmail.com", description: "Adress where the notification for newly added landslides is sent", category: "system"})
// Configuration.create({name: "mailclient", value: "/bin/mail", description: "mailclient on the system", category: "system"})
// Configuration.create({name: "mailtemplate", value: "TBD...", description: "mailtemplate that is used for notifications", category: "system"})
// Configuration.create({name: "notify", value: "false", description: "mailtemplate that is used for notifications", category: "system", possible_values: "true;false"})

module.exports = Configuration;
