const mongoose = require('mongoose');
const { dbHost, dbPass, dbName, dbPort, dbUser } = require('../config');

// Construct the MongoDB connection string
const uri = `mongodb://${dbHost}:${dbPort}/${dbName}`; // Tanpa user dan password

// Connect to MongoDB using Mongoose
mongoose.connect(uri);

// Handle MongoDB connection events
const db = mongoose.connection;

module.exports = db;
