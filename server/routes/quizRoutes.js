const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');

// Endpoint do dodawania quizu
router.post('/add', quizController.addQuiz);
// Endpoint do usuwania quizu
router.delete('/delete/:id', quizController.deleteQuiz);
//pobieranie wszystkich
router.get('/get-all', quizController.getAllQuizzes); 
module.exports = router;
