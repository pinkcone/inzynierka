const express = require('express');
const router = express.Router();
const { addQuestion, editQuestion, deleteQuestion, getQuestionsBySet, getQuestionById } = require('../controllers/questionController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/add', authMiddleware, addQuestion);
router.put('/edit/:id', authMiddleware, editQuestion);
router.delete('/delete/:id', authMiddleware, deleteQuestion);
router.get('/set/:setId', authMiddleware, getQuestionsBySet);
router.get('/:id', authMiddleware, getQuestionById);
module.exports = router;
