const express = require('express');
const router = express.Router();
const { createSet, addQuestionToSet, addAnswerToQuestion } = require('../controllers/QuizController.js');
const authMiddleware = require('../middleware/authMiddleware');

// Utwórz zestaw
router.post('/set', authMiddleware, createSet);

// Dodaj pytanie do zestawu
router.post('/question', authMiddleware, addQuestionToSet);

// Dodaj odpowiedź do pytania
router.post('/answer', authMiddleware, addAnswerToQuestion);

module.exports = router;
