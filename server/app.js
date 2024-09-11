const express = require('express');
const app = express();
const userRoutes = require('./routes/userRoutes'); // Import tras

// Middleware do parsowania ciała żądania
app.use(express.json());

// Trasy
app.use('/api/users', userRoutes);

module.exports = app;
