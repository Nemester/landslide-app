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

// Find a user by UUID
async function findUserByUUID(uuid) {
    try {
        const user = await User.findOne({ where: { uuid } });
        if (!user) throw new Error('User not found');
        return user;
    } catch (error) {
        throw new Error('Error finding user: ' + error.message);
    }
}

// Update user details
async function updateUser(uuid, userData) {
    try {
        const [updated] = await User.update(userData, { where: { uuid } });
        if (!updated) throw new Error('User not found or no changes made');
        return true;
    } catch (error) {
        throw new Error('Error updating user: ' + error.message);
    }
}

// Function to delete a user record by UUID
async function deleteUser(uuid) {
    try {
        const user = await User.findOne({ where: { uuid } });
        if (!user) throw new Error('User not found');
        await user.destroy(); // Deletes the record
        return true; // Indicate successful deletion
    } catch (error) {
        throw new Error('Failed to delete User record: ' + error.message);
    }
}

const getAll = async () => {
    try {
        return await User.findAll();
    } catch (error) {
        throw new Error('Failed to retrieve User records: ' + error.message);
    }
}
// Export functions as a service
module.exports = {
    createUser,
    findUserByUUID,
    updateUser,
    deleteUser,
    getAll
};
