const express = require('express');
const path = require('path');
const app = express();
const userRoutes = require('./routes/userRoutes');


app.use(express.json());
app.use('/images/profile_pictures', express.static(path.join(__dirname, 'images/profile_pictures')));

app.use('/api/users', userRoutes);

module.exports = app;
