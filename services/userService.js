// src/services/userService.js
const bcrypt = require('bcrypt');
const User = require('../models/User');

// Function to create a user
async function createUser({ firstname, lastname, username, email, password, isAdmin = false }) {
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({
            firstname,
            lastname,
            username,
            email,
            password: hashedPassword,
            is_admin: isAdmin
        });
        return newUser;
    } catch (error) {
        throw new Error('Error creating user: ' + error.message);
    }
}

// createUser({ firstname: "admin", lastname: "admin", username: "admin", email: "admin", password: "admin", isAdmin: true })
// createUser({ firstname: "user", lastname: "user", username: "user", email: "user", password: "user", isAdmin: false })

// Function to find a user by username (example)
async function findUserByUsername(username) {
    try {
        const user = await User.findOne({ where: { username } });
        return user;
    } catch (error) {
        throw new Error('Error finding user: ' + error.message);
    }
}
// Find a user by UUID
async function findUserByUUID(uuid) {
    try {
        return await User.findOne({ where: { uuid } });
    } catch (error) {
        throw new Error('Error finding user: ' + error.message);
    }
}

// Update user details
async function updateUser(uuid, userData) {
    try {
        return await User.update(userData, { where: { uuid } });
    } catch (error) {
        throw new Error('Error updating user: ' + error.message);
    }
}


async function setLastPWChange(userUUID) {
    try {
        await User.update(
            { last_password_change: new Date() },  // Set last login to current date/time
            { where: { uuid: userUUID } }
        );
    } catch (error) {
        throw new Error('Error updating last password change: ' + error.message);
    }
}

// Function to delete a user record by UUID
async function deleteUser(uuid) {
    try {
        const user = await User.findOne({ where: { uuid } });

        if (!user) {
            throw new Error('User not found');
        }

        await user.destroy(); // Deletes the record
        return true; // Indicate successful deletion
    } catch (error) {
        throw new Error('Failed to delete User record: ' + error.message);
    }
}

// Export functions as a service
module.exports = {
    createUser,
    findUserByUsername,
    findUserByUUID,
    updateUser,
    setLastPWChange,
    deleteUser
};
