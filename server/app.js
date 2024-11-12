const express = require('express');
const path = require('path');
const app = express();
const userRoutes = require('./routes/userRoutes');
const questionRoutes = require('./routes/questionRoutes');
const setRoutes = require('./routes/setRoutes');
const answerRoutes = require('./routes/answerRoutes');
const flashcardRoutes = require('./routes/flashcardsRoutes');
const testRoutes = require('./routes/testRoutes')
const completedTestRoutes = require('./routes/completedTestRoutes');
require('dotenv').config();

const cors = require('cors');
app.use(cors());

app.use(express.json());
app.use('/images/profile_pictures', express.static(path.join(__dirname, 'images/profile_pictures')));

app.use('/api/users', userRoutes);
app.use('/api/sets', setRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/answers', answerRoutes);
app.use('/api/flashcards', flashcardRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/completed-tests', completedTestRoutes);
module.exports = app;
