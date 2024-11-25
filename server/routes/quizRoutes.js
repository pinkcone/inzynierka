const express = require('express');
const router = express.Router();
const {addQuiz, 
    deleteQuiz, 
    getAllQuizzes, 
    startQuiz} = require('../controllers/quizController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/add', authMiddleware, addQuiz);
router.delete('/delete/:id', authMiddleware, deleteQuiz);
router.get('/get-all', authMiddleware, getAllQuizzes); 
router.post('/start', authMiddleware, startQuiz);
module.exports = router;
