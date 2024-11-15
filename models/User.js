const { Sequelize, DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');
const sequelize = require('../config/database');

// Define the User model
const User = sequelize.define('User', {
    uuid: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV1,
        primaryKey: true
    },
    firstname: {
        type: Sequelize.TEXT,
    },
    lastname: {
        type: Sequelize.TEXT,
    },
    username: {
        type: Sequelize.TEXT,
        allowNull: false,
        unique: true,
    },
    email: {
        type: Sequelize.TEXT,
    },
    password: {
        type: Sequelize.TEXT,
        allowNull: false,
    },
    last_password_change: {
        type: Sequelize.DATE,
    },
    last_login: {
        type: Sequelize.DATE,
    },
    is_admin: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    },
}, {
    paranoid: true,
    underscored: true,
    freezeTableName: true,
    tableName: 'tb_user',
});

// Export the User model
module.exports = User;
