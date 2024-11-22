const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const authMiddleware = require('../middleware/authMiddleware'); 
// Endpoint do dodawania quizu
router.post('/add', authMiddleware, quizController.addQuiz);
// Endpoint do usuwania quizu
router.delete('/delete/:id', authMiddleware, quizController.deleteQuiz);
//pobieranie wszystkich
router.get('/get-all', authMiddleware, quizController.getAllQuizzes); 
module.exports = router;
