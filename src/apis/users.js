const db = require('../config/db'); // Make sure this path is correct
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config(); 

const jwtSecret = process.env.JWT_SECRET; // Secret for JWT
const jwtExpirationTime = process.env.JWT_EXPIRATION_TIME; // Expiration time for JWT
const saltRounds = 10; // Number of salt rounds for bcrypt hashing

// Get all users
async function getAllUsers(req, res) {
    try {
        const [rows] = await db.query('SELECT * FROM users');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Register a new user
async function register_user(req, res) {
    const { username, password, confirm_password, email } = req.body.data; // Extracting data from request body

    // Check if passwords match
    if (password !== confirm_password) {
        return res.status(400).json({ error: 'Passwords do not match.' });
    }

    try {
        // Check if the user already exists
        const [existingUser] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(200).json({ error:true, message: 'User already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insert the new user into the database
        const [result] = await db.query('INSERT INTO users (username, password, email) VALUES (?, ?, ?)', 
            [username, hashedPassword, email]);

        // Respond with success
        res.status(201).json({ error:false, message: 'User registered successfully', userId: result.insertId });
    } catch (error) {
        res.status(500).json({ error:true, message:error.message });
    }
}

// Log in a user
async function login_user(req, res) {
    const { email, password } = req.body.data;

    try {
        // Check if the user exists
        const [existingUser] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUser.length === 0) {
            return res.status(200).json({ error: true, message: 'Invalid email or password' });
        }

        const user = existingUser[0];

        // Compare the provided password with the hashed password in the database
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(400).json({ error: true, message: 'Invalid email or password' });
        }

        // Generate and return JWT token
        const token = jwt.sign({ userId: user.id, role: user.role_id }, jwtSecret, { expiresIn: jwtExpirationTime });

        res.json({ message: 'Login successful', token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Exporting all functions in a single object
module.exports = {
    getAllUsers,
    register_user,
    login_user
};
